import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentDTO } from '../dtos/create.dto';
import { UpdatePaymentDTO } from '../dtos/update.dto';
import { Payment } from '../entities/payment.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { LedgerService } from '../../ledger/services/ledger.service';

@Injectable()
export class PaymentService extends BaseService<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly _repo: Repository<Payment>,
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
}