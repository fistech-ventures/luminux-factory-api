import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import {
  loadParties,
  loadPurchases,
  loadSales,
  partyKey,
} from '@src/app/helpers/transaction-details.helper';
import { SuccessResponse } from '@src/app/types';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentDTO } from '../dtos/create.dto';
import { FilterPaymentDTO } from '../dtos/filter.dto';
import { UpdatePaymentDTO } from '../dtos/update.dto';
import { Payment } from '../entities/payment.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { LedgerService } from '../../ledger/services/ledger.service';

export interface IPaymentWithDetails extends Payment {
  party?: Customer | Supplier | null;
  reference?: Sale | Purchase | null;
}

@Injectable()
export class PaymentService extends BaseService<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly _repo: Repository<Payment>,
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    private readonly dataSource: DataSource,
    private readonly ledgerService: LedgerService,
  ) {
    super(_repo);
  }

  /**
   * Records a payment (collection from customer / payment to supplier):
   * 1. Saves the payment itself.
   * 2. Writes a 'paid' ledger entry for the customer/supplier so their due
   *    balance drops (customer: totalDue - totalPaid, supplier: same).
   * 3. When the payment references a sale/purchase, also adjusts that
   *    record's paidAmount/dueAmount so the invoice stays consistent.
   */
  async createPayment(payload: CreatePaymentDTO): Promise<Payment> {
    const queryRunner = await startTransaction(this.dataSource);

    try {
      const { amount, entityType, entityId, paymentDate, ...restPayload } = payload;

      const payment = queryRunner.manager.create(Payment, {
        ...restPayload,
        amount,
        entityType,
        entityId,
        paymentDate,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      const description =
        entityType === 'customer' ? 'Payment received from customer' : 'Payment made to supplier';

      await this.ledgerService.createLedgerEntry({
        entityType,
        entityId,
        type: 'paid',
        amount,
        referenceId: savedPayment.id,
        referenceType: 'payment',
        description: payload.note ? `${description} - ${payload.note}` : description,
        transactionDate: paymentDate ? new Date(paymentDate) : new Date(),
      });

      if (payload.referenceId && payload.referenceType === 'sale') {
        const sale = await queryRunner.manager.findOne(Sale, {
          where: { id: payload.referenceId },
        });
        if (sale) {
          await queryRunner.manager.update(
            Sale,
            { id: sale.id },
            {
              paidAmount: (sale.paidAmount || 0) + amount,
              dueAmount: Math.max(0, (sale.dueAmount || 0) - amount),
            },
          );
        }
      } else if (payload.referenceId && payload.referenceType === 'purchase') {
        const purchase = await queryRunner.manager.findOne(Purchase, {
          where: { id: payload.referenceId },
        });
        if (purchase) {
          await queryRunner.manager.update(
            Purchase,
            { id: purchase.id },
            {
              paidAmount: (purchase.paidAmount || 0) + amount,
              dueAmount: Math.max(0, (purchase.dueAmount || 0) - amount),
            },
          );
        }
      }

      await commitTransaction(queryRunner);

      return savedPayment;
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Payment not created');
    }
  }

  async updatePayment(id: string, payload: UpdatePaymentDTO): Promise<Payment> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }

  /**
   * Payments list enriched with the counterparty (customer/supplier) and the
   * sale/purchase the payment settles (including its items), so the payments
   * screen can show what each transaction was for.
   */
  async findAllWithDetails(
    filters: FilterPaymentDTO,
  ): Promise<SuccessResponse<IPaymentWithDetails[]>> {
    const response = await this.findAllBase(filters);
    return new SuccessResponse<IPaymentWithDetails[]>(
      response.message,
      await this.attachDetails(response.data || []),
      response.meta,
    );
  }

  /** A single payment enriched with its party and linked sale/purchase details. */
  async findOneWithDetails(id: string): Promise<IPaymentWithDetails> {
    const payment = await this.findByIdBase(id);
    if (!payment) {
      throw new NotFoundException(`Payment With ID ${id} Not Found`);
    }
    const [detailed] = await this.attachDetails([payment]);
    return detailed;
  }

  private async attachDetails(payments: Payment[]): Promise<IPaymentWithDetails[]> {
    if (!payments.length) return [];

    const [parties, sales, purchases] = await Promise.all([
      loadParties(payments, this.customerRepo, this.supplierRepo),
      loadSales(
        payments
          .filter((payment) => payment.referenceType === 'sale')
          .map((payment) => payment.referenceId),
        this.saleRepo,
      ),
      loadPurchases(
        payments
          .filter((payment) => payment.referenceType === 'purchase')
          .map((payment) => payment.referenceId),
        this.purchaseRepo,
      ),
    ]);

    return payments.map((payment) => ({
      ...payment,
      party: parties.get(partyKey(payment.entityType, payment.entityId)) || null,
      reference:
        (payment.referenceType === 'sale'
          ? sales.get(payment.referenceId)
          : payment.referenceType === 'purchase'
            ? purchases.get(payment.referenceId)
            : null) || null,
    }));
  }
}
