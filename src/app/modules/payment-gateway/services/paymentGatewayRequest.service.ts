import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ENV } from '@src/env';
import { firstValueFrom } from 'rxjs';
import { IBkashInitPaymentRequest, IBkashInitPaymentResponse, IBkashWebHookData } from '../bkash/bkash.interfaces';
import { BkashService } from '../bkash/bkash.service';
import { PaymentRequestDTO } from '../dtos/payment-request.dto';
import { PaymentGatewayLog } from '../entities/paymentGatewayLog.entity';
import { ENUM_AMARPAY_STATUS, ENUM_PAYMENT_GATEWAY_TYPE, ENUM_PAYMENT_STATUS } from '../enums';
import { IPaymentGatewayResponse } from '../interfaces';
import { ISSLCommerzPaymentGatewayResponse } from '../sslcommerz/sslcommerz.interfaces';
import { SSLCommerzService } from '../sslcommerz/sslcommerz.service';
import { PaymentGatewayLogService } from './paymentGatewayLog.service';

@Injectable()
export class PaymentGatewayRequestService {
  constructor(
    private readonly paymentGatewayLogService: PaymentGatewayLogService,
    private readonly http: HttpService,
    private readonly sslCommerzService: SSLCommerzService,
    private readonly bkashService: BkashService,
  ) { }

  async paymentRequestForSSLCOMMERZ(data: PaymentRequestDTO): Promise<any> {
    try {
      const payload = {
        amount: data.amount,
        invoiceCode: data.invoiceCode,
        transactionCode: data.transactionCode,
        productName: data?.productName || 'Product Name',
        productCategory: data?.productCategory || 'Product Category',
        orderDescription: data?.orderDescription || 'Product Details',
        customerName: data?.customerName || 'John Doe',
        customerEmail: data?.customerEmail || 'demo@gmail.com',
        customerAddress: data.extras?.customerAddress1 || 'Khilkhet',
        customerCity: data.extras?.customerCity || 'Dhaka',
        customerCountry: data.extras?.customerCountry || 'Bangladesh',
        customerPhoneNumber: data?.customerPhoneNumber || '01619020642',
        productAmount: data.productAmount,
      };
      const response: ISSLCommerzPaymentGatewayResponse =
        await this.sslCommerzService.initPayment(payload);

      if (response.status && response.status === 'SUCCESS') {
        return {
          transactionCode: data.transactionCode,
          paymentUrl: response.redirectGatewayURL,
        };
      } else {
        return response;
      }
    } catch (error) {
      return error;
    }
  }

  async paymentRequestForBKASH(data: PaymentRequestDTO): Promise<any> {
    try {
      const payload: IBkashInitPaymentRequest = {
        invoiceCode: data.invoiceCode,
        amount: data.amount,
      };

      const response: IBkashInitPaymentResponse = await this.bkashService.initPayment(payload);
      if (response) {
        return {
          transactionCode: response.paymentID,
          paymentUrl: response.bkashURL,
        };
      } else {
        return response;
      }
    } catch (error) {
      return error;
    }
  }

  async paymentRequest(data: PaymentRequestDTO): Promise<any> {
    try {
      let response = null;
      if (data.paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ) {
        response = await this.paymentRequestForSSLCOMMERZ(data);
      } else if (data.paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.BKASH) {
        response = await this.paymentRequestForBKASH(data);
      }
      const paymentLogPayload: Partial<PaymentGatewayLog> = {
        invoiceCode: data?.invoiceCode,
        transactionCode: response?.transactionCode,
        discountAmount: data?.discountAmount || 0,
        paymentGatewayRequestResponse: response,
        originUrl: data?.originUrl,
        webCallbackUrl: data?.webCallbackUrl,
        isSuccess: false,
        paymentGatewayRequestPayload: data,
        userId: data.userId,
        userInvoiceId: data.userInvoiceId,
      };

      await this.paymentGatewayLogService.createOneBase(paymentLogPayload);
      return response;
    } catch (error) {
      console.error('🚀 ~ PaymentGatewayService ~ paymentRequest ~ error:', error);
    }

    return false;
  }

  async onSuccessfulPayment(
    paymentGatewayType: ENUM_PAYMENT_GATEWAY_TYPE,
    data: any,
    transactionCode: string,
  ): Promise<PaymentGatewayLog> {
    console.info('🚀 ~ PaymentGatewayService ~ paymentGatewayType:', paymentGatewayType);

    try {
      const existPaymentGatewayLog = await this.paymentGatewayLogService.isExist({
        transactionCode,
        isSuccess: false,
      });
      const response: IPaymentGatewayResponse = {};

      response.invoiceCode = existPaymentGatewayLog.invoiceCode;
      response.transactionCode = transactionCode;
      response.paymentGatewayOriginalResponse = data;
      response.isSuccess = false;

      if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ) {
        response.amount = Number(data?.amount);
        const payload: any = { ...data };

        const validateSSLCommerzEnd = await this.sslCommerzService.validate(payload);
        console.info(
          '🚀 ~ PaymentGatewayRequestService ~ validateSSLCommerzEnd:',
          validateSSLCommerzEnd,
        );

        response.paymentGateway = paymentGatewayType;
        response.transactionCode = data?.tran_id;
        response.reason = '';
        response.transactionMethod = ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ;
        response.transactionId = payload.tran_id;
        response.transactionTime = payload.tran_date;
        response.paymentGatewayOriginalResponse = payload;
        response.isSuccess = true;
        response.status = ENUM_AMARPAY_STATUS.Successful;
        response.userInvoiceId = existPaymentGatewayLog?.userInvoiceId;
        // response.paymentType = data?.card_type;
        response.paymentIssuer = data?.card_issuer;
        response.paymentMethod = data?.card_type;
        response.paymentCurrency = data?.currency;
      } else if (paymentGatewayType === ENUM_PAYMENT_GATEWAY_TYPE.BKASH) {
        const payload: IBkashWebHookData = { ...data };
        const executedData = await this.bkashService.executePayment(payload);
        if (executedData && executedData.status === false) {
          // return new AppException(token.statusMessage);
          // return executedData
          return { status: 'failure', isSuccess: false }
        }
        response.paymentGateway = executedData.paymentGateway;
        response.transactionCode = existPaymentGatewayLog.transactionCode;
        response.amount = executedData.amount;
        response.reason = executedData.reason;
        response.transactionMethod = ENUM_PAYMENT_GATEWAY_TYPE.BKASH;
        response.transactionId = executedData.transactionId;
        response.transactionTime = new Date()
        response.paymentGatewayOriginalResponse = executedData;
        response.isSuccess = true
        response.webCallbackUrl = existPaymentGatewayLog.webCallbackUrl
        response.status = ENUM_AMARPAY_STATUS.Successful;
      }

      if (response.isSuccess) {
        const callPaymentConfirmation = this.http.post(
          `${ENV.externalApis.paymentKitApiEndpoint}/web/user-invoices/payment-confirmation`,
          response,
        );
        const callPaymentConfirmationData = await (
          await firstValueFrom(callPaymentConfirmation)
        ).data;
        console.info("🚀 ~ PaymentGatewayRequestService ~ onSuccessfulPayment ~ callPaymentConfirmationData:", callPaymentConfirmationData)
      }

      return this.paymentGatewayLogService.updateOneBase(existPaymentGatewayLog.id, response);
    } catch (error) {
      console.error("🚀 ~ PaymentGatewayRequestService ~ onSuccessfulPayment ~ error:", error)
      return error;
    }
  }

  async onFailedPayment(
    paymentGatewayType: ENUM_PAYMENT_GATEWAY_TYPE,
    data: any,
    invoiceId: string,
  ): Promise<IPaymentGatewayResponse> {
    console.info('🚀 ~ PaymentGatewayService ~ data:', data);
    console.info('🚀 ~ PaymentGatewayService ~ paymentGatewayType:', paymentGatewayType);
    try {
      const existPaymentGatewayLog = await this.paymentGatewayLogService.isExist({
        invoiceId,
      });
      const response: IPaymentGatewayResponse = {};
      await this.paymentGatewayLogService.updateOneBase(existPaymentGatewayLog?.id, response);

      return response;
    } catch (error) {
      return error;
    }
  }

  async onCancelPayment(
    paymentGatewayType: ENUM_PAYMENT_GATEWAY_TYPE,
    transactionCode: string,
    query?: any,
  ): Promise<IPaymentGatewayResponse> {
    try {
      const existPaymentGatewayLog = await this.paymentGatewayLogService.isExist({
        transactionCode,
      });
      const response: IPaymentGatewayResponse = {};
      response.status = ENUM_PAYMENT_STATUS.Canceled;
      response.paymentGateway = paymentGatewayType;
      response.transactionCode = transactionCode;

      if (query) {
        response.transactionMethod = paymentGatewayType;
        response.transactionId = query?.payment_ref_id;
        response.transactionTime = query?.payment_dt;
        response.paymentGatewayOriginalResponse = query;
      }
      await this.paymentGatewayLogService.updateOneBase(existPaymentGatewayLog?.id, response);

      // this.logger.log(response);
      return response;
    } catch (error) {
      return error;
    }
  }

  async onSSLCommerzCallbackUrl(body: any): Promise<any> {
    let redirectUrl = '';

    const existPaymentGatewayLog = await this.paymentGatewayLogService.isExist({
      transactionCode: body.tran_id,
    });
    if (body.status === 'VALID') {
      const url = new URL(existPaymentGatewayLog?.webCallbackUrl);
      url.searchParams.set('transactionCode', existPaymentGatewayLog.transactionCode);
      url.searchParams.set('paymentStatus', 'success');
      redirectUrl = url.toString();
    } else if (body.status === 'CANCELLED' || 'UNATTEMPTED') {
      const url = new URL(existPaymentGatewayLog?.webCallbackUrl);
      url.searchParams.set('transactionCode', existPaymentGatewayLog.transactionCode);
      url.searchParams.set('paymentStatus', 'failed');
      redirectUrl = url.toString();
    } else if (body.status === 'FAILED') {
      const url = new URL(existPaymentGatewayLog?.webCallbackUrl);
      url.searchParams.set('transactionCode', existPaymentGatewayLog.transactionCode);
      url.searchParams.set('paymentStatus', 'failed');
      redirectUrl = url.toString();
    }
    return redirectUrl;
  }

  async onBkashCallbackUrl(transactionCode: string): Promise<any> {
    let redirectUrl = '';
    const gatewayLog = await this.paymentGatewayLogService.isExist({
      transactionCode: transactionCode,
    });

    if (gatewayLog.isSuccess) {
      const url = new URL(gatewayLog?.webCallbackUrl);
      url.searchParams.set('transactionCode', gatewayLog.transactionCode);
      url.searchParams.set('invoiceCode', gatewayLog.invoiceCode);
      url.searchParams.set('paymentStatus', 'success');
      redirectUrl = url.toString();
    } else if (gatewayLog.status === 'CANCELLED' || 'UNATTEMPTED') {

      const url = new URL(gatewayLog?.webCallbackUrl);
      url.searchParams.set('transactionCode', gatewayLog.transactionCode);
      url.searchParams.set('paymentStatus', 'failed');
      redirectUrl = url.toString();
    } else if (gatewayLog.status === 'FAILED') {

      const url = new URL(gatewayLog?.webCallbackUrl);
      url.searchParams.set('transactionCode', gatewayLog.transactionCode);
      url.searchParams.set('paymentStatus', 'failed');
      redirectUrl = url.toString();
    }
    return redirectUrl;
  }
}
