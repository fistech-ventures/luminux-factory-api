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
import { Employee } from '../../employee/entities/employee.entity';
import { LedgerService } from '../../ledger/services/ledger.service';
import { Ledger } from '../../ledger/entities/ledger.entity';

export interface IPaymentWithDetails extends Payment {
  party?: Customer | Supplier | Employee | null;
  reference?: Sale | Purchase | null;
}

/**
 * Ledger entry type for a payment. Employee payments are advances (money handed
 * over to the employee, deducted from the company account right away); customer
 * and supplier payments are regular settlements.
 */
function ledgerTypeForEntity(entityType: string): string {
  return entityType === 'employee' ? 'advance' : 'paid';
}

/** Human-facing description for a payment's ledger entry. */
function paymentDescription(entityType: string, note?: string): string {
  const base =
    entityType === 'customer'
      ? 'Payment received from customer'
      : entityType === 'employee'
        ? 'Advance paid to employee'
        : 'Payment made to supplier';
  return note ? `${base} - ${note}` : base;
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
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
    private readonly ledgerService: LedgerService,
  ) {
    super(_repo);
  }

  /**
   * Records a payment (collection from customer / payment to supplier / advance
   * to employee):
   * 1. Saves the payment itself.
   * 2. Writes a ledger entry so the party balance moves:
   *    - customer/supplier: type 'paid' (settles their due).
   *    - employee: type 'advance' (cash handed over, counted as cash-out in
   *      the company account balances).
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

      await this.ledgerService.createLedgerEntry({
        entityType,
        entityId,
        type: ledgerTypeForEntity(entityType),
        amount,
        referenceId: savedPayment.id,
        referenceType: 'payment',
        description: paymentDescription(entityType, payload.note),
        transactionDate: paymentDate ? new Date(paymentDate) : new Date(),
      });

      if (payload.referenceId && payload.referenceType === 'sale') {
        const sale = await queryRunner.manager.findOne(Sale, {
          where: { id: payload.referenceId, isDeleted: false },
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
          where: { id: payload.referenceId, isDeleted: false, isActive: true },
        });
        if (!purchase) throw new BadRequestException('Cannot add a payment to an inactive or missing purchase');
        await queryRunner.manager.update(
          Purchase,
          { id: purchase.id },
          {
            paidAmount: (purchase.paidAmount || 0) + amount,
            dueAmount: Math.max(0, (purchase.dueAmount || 0) - amount),
          },
        );
      }

      await commitTransaction(queryRunner);

      return savedPayment;
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Payment not created');
    }
  }

  async deleteOneBase(id: string): Promise<SuccessResponse> {
    const payment = await this.findOne({ where: { id: id as any } });
    if (!payment) throw new NotFoundException('Payment not found');

    const queryRunner = await startTransaction(this.dataSource);
    try {
      const deletedAt = new Date();
      await queryRunner.manager.update(
        Payment,
        { id, isDeleted: false },
        { isDeleted: true, deletedAt },
      );
      await queryRunner.manager.update(
        Ledger,
        { referenceId: id, referenceType: 'payment', isDeleted: false },
        { isDeleted: true, deletedAt },
      );

      if (payment.referenceId && payment.referenceType === 'sale') {
        const sale = await queryRunner.manager.findOne(Sale, {
          where: { id: payment.referenceId, isDeleted: false },
        });
        if (sale) {
          const paidAmount = Math.max(0, (sale.paidAmount || 0) - (payment.amount || 0));
          await queryRunner.manager.update(
            Sale,
            { id: sale.id },
            { paidAmount, dueAmount: Math.max(0, (sale.grandTotal || 0) - paidAmount) },
          );
        }
      } else if (payment.referenceId && payment.referenceType === 'purchase') {
        const purchase = await queryRunner.manager.findOne(Purchase, {
          where: { id: payment.referenceId, isDeleted: false },
        });
        if (purchase) {
          const paidAmount = Math.max(0, (purchase.paidAmount || 0) - (payment.amount || 0));
          await queryRunner.manager.update(
            Purchase,
            { id: purchase.id },
            { paidAmount, dueAmount: Math.max(0, (purchase.totalPurchaseAmount || 0) - paidAmount) },
          );
        }
      }

      await commitTransaction(queryRunner);
      return new SuccessResponse('Payment soft-deleted successfully', null);
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Payment not deleted');
    }
  }

  async updatePayment(id: string, payload: UpdatePaymentDTO): Promise<Payment> {
    const existingPayment = await this.findOne({
      where: { id: id as any },
    });

    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    const { amount, ...restPayload } = payload;
    const newAmount = amount ?? existingPayment.amount;
    const amountDiff = newAmount - existingPayment.amount;
    const newEntityType = payload.entityType ?? existingPayment.entityType;
    const newEntityId = payload.entityId ?? existingPayment.entityId;
    const newPaymentDate = payload.paymentDate ?? existingPayment.paymentDate;
    const newNote = payload.note !== undefined ? payload.note : existingPayment.note;

    const queryRunner = await startTransaction(this.dataSource);

    try {
      // Persist the payment itself, including the (possibly changed) amount.
      await queryRunner.manager.update(Payment, { id }, { ...restPayload, amount: newAmount });

      // Keep the payment's ledger entry in sync with the payment record.
      const existingLedgerEntry = await queryRunner.manager.findOne(Ledger, {
        where: {
          referenceId: id,
          referenceType: 'payment',
        },
      });

      const description = paymentDescription(newEntityType, newNote);

      // Upsert (or drop) the entry so it matches the payment record, including
      // a changed amount / party / date. A zero or negative amount drops it.
      await this.ledgerService.reconcileLedgerEntry(
        queryRunner.manager,
        existingLedgerEntry ?? undefined,
        newAmount > 0,
        {
          entityType: newEntityType,
          entityId: newEntityId,
          type: ledgerTypeForEntity(newEntityType),
          amount: newAmount,
          referenceId: id,
          referenceType: 'payment',
          description,
          transactionDate: newPaymentDate,
        },
      );

      // Adjust the linked sale/purchase by the amount delta so their
      // paid/due totals stay consistent with the payment records.
      if (amountDiff !== 0 && existingPayment.referenceId) {
        if (existingPayment.referenceType === 'sale') {
          const sale = await queryRunner.manager.findOne(Sale, {
            where: { id: existingPayment.referenceId, isDeleted: false },
          });
          if (sale) {
            const newPaidAmount = (sale.paidAmount || 0) + amountDiff;
            await queryRunner.manager.update(Sale, { id: sale.id }, {
              paidAmount: newPaidAmount,
              dueAmount: Math.max(0, (sale.grandTotal || 0) - newPaidAmount),
            });
          }
        } else if (existingPayment.referenceType === 'purchase') {
          const purchase = await queryRunner.manager.findOne(Purchase, {
            where: { id: existingPayment.referenceId, isDeleted: false },
          });
          if (purchase) {
            const newPaidAmount = (purchase.paidAmount || 0) + amountDiff;
            await queryRunner.manager.update(Purchase, { id: purchase.id }, {
              paidAmount: newPaidAmount,
              dueAmount: Math.max(0, (purchase.totalPurchaseAmount || 0) - newPaidAmount),
            });
          }
        }
      }

      await commitTransaction(queryRunner);

      return await this.findOne({
        where: { id },
      });
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Payment not updated');
    }
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
      loadParties(payments, this.customerRepo, this.supplierRepo, this.employeeRepo),
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
