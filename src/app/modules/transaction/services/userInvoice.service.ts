import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { generateCode } from '@src/shared';
import { ENUM_PAYMENT_STATUS } from '@src/shared/enums/common.enums';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { firstValueFrom } from 'rxjs';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ENUM_INTERNAL_ORDER_STATUS, ENUM_ORDER_PAYMENT_STATUS } from '../../order/const';
import { Order } from '../../order/entities/order.entity';
import { PaymentRequestDTO } from '../../payment-gateway/dtos/payment-request.dto';
import { PaymentGatewayLog } from '../../payment-gateway/entities/paymentGatewayLog.entity';
import { PaymentGatewayService } from '../../payment-gateway/services/paymentGateway.service';
import { PaymentGatewayLogService } from '../../payment-gateway/services/paymentGatewayLog.service';
import { PaymentRequestCreateDTO } from '../dtos/userInvoice/create.dto';
import { UserInvoice } from '../entities/userInvoice.entity';
import { UserTransaction } from '../entities/userTransaction.entity';
import { ENUM_TRANSACTION_STATUS } from '../enums';
import { UserTransactionService } from './userTransaction.service';

@Injectable()
export class UserInvoiceService extends BaseService<UserInvoice> {
  constructor(
    @InjectRepository(UserInvoice)
    private readonly _repo: Repository<UserInvoice>,
    private readonly dataSource: DataSource,
    private readonly http: HttpService,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly paymentGatewayLogService: PaymentGatewayLogService,
    private readonly userTransactionService: UserTransactionService,
  ) {
    super(_repo);
  }

  async generateUniqueCode(queryRunner: QueryRunner): Promise<string> {
    let counter = 0;
    let isExist = true;
    let code: string;
    while (isExist) {
      code = `${generateCode('INV')}${counter}`;

      isExist = await queryRunner.manager.exists(UserInvoice, {
        where: { code },
      });

      if (isExist) {
        counter++;
      }
    }
    return code;
  }

  async paymentRequest(data: PaymentRequestCreateDTO, authUser?: IAuthUser): Promise<any> {
    try {
      if (data?.paymentGatewayType) {
        const invoiceData = await this.findOne({
          where: {
            code: data?.invoiceCode,
          },
          relations: {
            user: true,
            order: { items: true },
          },
        });
        if (!invoiceData) throw new NotFoundException('Invoice data not found!');

        if (invoiceData && invoiceData.paymentStatus === ENUM_PAYMENT_STATUS.PAID)
          throw new BadRequestException('Already paid!');

        if (invoiceData && !invoiceData.isActive)
          throw new BadRequestException('Invoice is no longer valid!');

        // Save to User Transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let transactionCode: string = null;
        try {
          transactionCode = await this.userTransactionService.generateUniqueCode(queryRunner);

          const userTransactionPayload: Partial<UserTransaction> = {
            invoiceCode: data?.invoiceCode,
            code: transactionCode,
            amount: Number(invoiceData.amount),
            transactionById: authUser?.id,
            // transactionById: '52527671-f982-4c03-b75a-315f46d67bfc',
            userId: invoiceData?.userId,
            userInvoiceId: invoiceData.id,
          };
          await queryRunner.manager.save(UserTransaction, userTransactionPayload);
          await queryRunner.commitTransaction();
        } catch (error) {
          console.error('🚀 ~ PaymentGatewayRequestService ~ paymentRequest ~ error:', error);
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
        // Save to User Transaction

        const payload: PaymentRequestDTO = {
          paymentGatewayType: data.paymentGatewayType || '',
          userInvoiceId: invoiceData.id,
          invoiceCode: invoiceData.code,
          transactionCode: transactionCode,
          // productCategory: invoiceData.order.items.map((item) => item?.product?.title).join(', ') || 'Category',
          // productName: invoiceData.order.items.map((item) => item?.product?.title).join(', ') || 'Product',
          // orderDescription:
          //   invoiceData.order.items.map((item) => item?.product?.title).join(', ') || "description",
          amount: Number(invoiceData.amount),
          // customerName: invoiceData?.user?.fullName || 'Demo',
          // customerEmail: invoiceData?.user?.email || 'demo@gmail.com',
          // customerPhoneNumber: invoiceData?.user?.phoneNumber || '01700000000',
          originUrl: data.originUrl || '',
          webCallbackUrl: data.webCallbackUrl || '',
          extras: {
            customerAddress1: 'Address 1',
            customerAddress2: 'Address 2',
            customerCity: 'Dhaka',
            customerCountry: 'BD',
          },
          productAmount: invoiceData.amount,
          userId: authUser?.id,
          // userId: '52527671-f982-4c03-b75a-315f46d67bfc',
        };

        const paymentGatewayPaymentRequestResponse =
          await this.paymentGatewayPaymentRequest(payload);

        return paymentGatewayPaymentRequestResponse;
      }
    } catch (error) {
      console.error('🚀🚀🚀🚀🚀 ~ file: payment.service.ts ~ line 277 ~ error', error);
      throw new BadRequestException(error.message || 'Payment Request Failed');
    }
  }

  async paymentGatewayPaymentRequest(payload: PaymentRequestDTO): Promise<any> {
    try {
      console.info('paymentGatewayPaymentRequest ==> ', {
        paymentKitApiEndpoint: ENV.externalApis.paymentKitApiEndpoint,
      });
      const paymentGatewayPayload = this.http.post(
        `${ENV.externalApis.paymentKitApiEndpoint}/web/payment-gateway-requests/payment-request`,
        payload,
      );
      return await (
        await firstValueFrom(paymentGatewayPayload)
      ).data;
    } catch (error) {
      console.error('🚀 ~ ApplicationService ~ paymentGatewayPaymentRequest ~ error:', error);
      // throw new Error(error);
      return error;
    }
  }

  async paymentConfirmation(body: any): Promise<SuccessResponse> {
    const paymentInfo = await this.paymentGatewayLogService.isExist({
      invoiceCode: body?.invoiceCode,
      isSuccess: false,
    });

    const payloadForUpdatePayment: Partial<PaymentGatewayLog> = {
      transactionId: body?.transactionId,
      paymentIssuer: body?.paymentIssuer,
      paymentMethod: body?.paymentMethod,
      paymentCurrency: body?.currency || body?.currency_type || null,
      paymentGatewayOriginalResponse: body?.paymentGatewayOriginalResponse,
      isSuccess: true,
    };

    await this.paymentGatewayLogService.updateOneBase(paymentInfo?.id, payloadForUpdatePayment);

    const invoice = await this.findOne({
      where: {
        code: paymentInfo?.invoiceCode,
      },
      relations: {
        order: true,
      },
    });

    if (invoice) {
      const queryRunner = await startTransaction(this.dataSource);
      try {
        await queryRunner.manager.update(
          UserInvoice,
          {
            id: invoice.id,
            paymentStatus: ENUM_PAYMENT_STATUS.UNPAID,
          } satisfies Partial<UserInvoice>,
          {
            paymentStatus: ENUM_PAYMENT_STATUS.PAID,
            paidAt: new Date(),
          } satisfies Partial<UserInvoice>,
        );

        const orderData = invoice.order;
        const orderDataToUpdate: any = {
          paidAmount: orderData.paidAmount + paymentInfo.amount,
          dueAmount: orderData.dueAmount - paymentInfo.amount,
          status: ENUM_INTERNAL_ORDER_STATUS.CONFIRMED,
        }
        if (orderData.dueAmount <= 0) {
          orderDataToUpdate.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.PAID;
        } else if (orderData.dueAmount > 0 && (orderData.paidAmount >= 0 && orderData.paidAmount === orderData.deliveryCharge)) {
          orderDataToUpdate.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.DELIVERY_CHARGE_PAID;
        } else if (orderData.dueAmount > 0 && orderData.paidAmount > 0) {
          orderDataToUpdate.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.PARTIALLY_PAID;
        }

        await queryRunner.manager.update(
          Order,
          {
            id: invoice.orderId,
          } satisfies Partial<Order>,
          orderDataToUpdate satisfies Partial<Order>,
        );

        await queryRunner.manager.update(
          UserTransaction,
          { invoiceCode: paymentInfo.invoiceCode },
          { status: ENUM_TRANSACTION_STATUS.SUCCESS } satisfies Partial<UserTransaction>,
        );
        await commitTransaction(queryRunner);
      } catch (error) {
        await rollbackTransaction(queryRunner);
        throw error;
      }
    }

    return new SuccessResponse('Payment confirmed successfully');
  }
}
