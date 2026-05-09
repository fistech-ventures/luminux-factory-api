import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { BKASH_CLIENT, CURRENCY, INTENT, MODE } from './bkash.constants';
import {
  IBkashExecuteResponse,
  IBkashInitPaymentRequest,
  IBkashInitPaymentResponse,
  IBkashOptions,
  IBkashPaymentGatewayResponse,
  IBkashQueryResponse,
  IBkashRefundTransaction,
  IBkashRefundTransactionResponse,
  IBkashTokenResponse,
  IBkashWebHookData,
} from './bkash.interfaces';

@Injectable()
export class BkashService {

  constructor(
    @Inject(BKASH_CLIENT)
    private readonly options: IBkashOptions,
    private readonly http?: HttpService,
  ) {
    this.tokenUrl = options.tokenUrl;
    this.createUrl = options.createUrl;
    this.executeUrl = options.executeUrl;
    this.paymentStatusUrl = options.paymentStatusUrl;
    this.searchTransactionUrl = options.searchTransactionUrl;
    this.refundTransactionUrl = options.refundTransactionUrl;
    this.webHookUrl = options.webHookUrl;
    this.appKey = options.appKey;
    this.appSecret = options.appSecret;
    this.username = options.username;
    this.password = options.password;
  }

  private tokenUrl: string;
  private createUrl: string;
  private executeUrl: string;
  private paymentStatusUrl: string;
  private searchTransactionUrl: string;
  private refundTransactionUrl: string;
  private webHookUrl: string;
  private appKey: string;
  private appSecret: string;
  private username: string;
  private password: string;

  async createToken(): Promise<IBkashTokenResponse | any> {
    try {
      const response = await this.http.post(
        this.tokenUrl,
        {
          app_key: this.appKey,
          app_secret: this.appSecret,
        },
        {
          headers: {
            username: this.username,
            password: this.password,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      const responseData = await (await firstValueFrom(response)).data;

      return responseData;
    } catch (error) {
      return error;
    }
  }

  async initPayment(payload: IBkashInitPaymentRequest): Promise<IBkashInitPaymentResponse | any> {
    try {
      const token = await this.createToken();
      if (token?.statusCode !== '0000') {
        return new BadRequestException(token.statusMessage);
      }

      const headers = {
        Authorization: `${token.token_type} ${token.id_token}`,
        'X-APP-Key': this.appKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const body = {
        mode: MODE,
        callbackURL: `${this.webHookUrl}/${payload.invoiceCode}`,
        payerReference: payload.invoiceCode,
        amount: payload.amount,
        intent: INTENT,
        merchantInvoiceNumber: payload.invoiceCode,
        currency: CURRENCY,
      };

      const response = await this.http.post(this.createUrl, body, { headers });

      const responseData: IBkashInitPaymentResponse = await (await firstValueFrom(response)).data;

      if (responseData && responseData.statusCode === '0000') {
        return responseData;
      } else {
        return false;
      }
    } catch (_error) {
      return false;
    }
  }

  async refundTransaction(
    payload: IBkashRefundTransaction,
  ): Promise<IBkashRefundTransactionResponse | any> {
    console.info('🚀🚀🚀🚀🚀 ~ file: bkash.service.ts ~ line 136 ~ payload', payload);
    console.info(
      '🚀🚀🚀🚀🚀 ~ file: bkash.service.ts ~ line 136 ~ this.refundTransactionUrl',
      this.refundTransactionUrl,
    );
    try {
      const token = await this.createToken();
      if (token?.statusCode !== '0000') {
        return new BadRequestException(token.statusMessage);
      }

      const headers = {
        Authorization: `${token.token_type} ${token.id_token}`,
        'X-APP-Key': this.appKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const body = {
        paymentID: payload.paymentID,
        amount: payload.amount,
        trxID: payload.trxID,
        sku: payload.sku,
        reason: payload.reason,
      };

      const response = await this.http.post(this.refundTransactionUrl, body, { headers });

      const responseData: IBkashRefundTransactionResponse = await (
        await firstValueFrom(response)
      ).data;

      if (responseData && responseData.statusCode === '0000') {
        return responseData;
      } else {
        return false;
      }
    } catch (_error) {
      return false;
    }
  }

  async executePayment(payload: IBkashWebHookData): Promise<IBkashPaymentGatewayResponse | any> {
    try {
      const token = await this.createToken();
      if (token?.statusCode !== '0000') {
        return new BadRequestException(token.statusMessage);
      }

      const headers = {
        Authorization: `${token.token_type} ${token.id_token}`,
        'X-APP-Key': this.appKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const body = {
        paymentID: payload.paymentID,
      };
      const response = await this.http.post(this.executeUrl, body, {
        headers,
        timeout: 30000,
      });

      const responseData: IBkashExecuteResponse = await (await firstValueFrom(response)).data;

      // console.log('====================EXECUTE=============================');
      // console.log(this.executeUrl);
      // console.log(body);
      // console.log(responseData);
      // console.log('====================EXECUTE=============================');

      if (responseData && responseData.statusCode !== '0000') {
        // return new BadRequestException(token.statusMessage);
        return {
          status: false,
          message: responseData.statusMessage,
        };
      }

      if (responseData && responseData.transactionStatus !== 'Completed') {
        // return new BadRequestException(token.statusMessage);
        return {
          status: false,
          message: responseData.statusMessage,
        };
      }

      const bkashPGResponse: IBkashPaymentGatewayResponse = {
        status: responseData.transactionStatus,
        amount: responseData.amount,
        transactionMethod: 'bKash',
        transactionId: responseData.paymentID,
        transactionTime: responseData.paymentExecuteTime,
        orderId: responseData.merchantInvoiceNumber,
        parentOrderId: responseData.payerReference,
        reason: responseData.statusMessage,
        paymentType: 'bKash',
        invoiceType: 'bKash',
        paymentGateway: 'bKash',
        paymentGatewayOriginalResponse: responseData,
      };

      return bkashPGResponse;
    } catch (_error) {
      return this.queryPayment(payload);
    }
  }

  async queryPayment(payload: IBkashWebHookData): Promise<IBkashPaymentGatewayResponse | any> {
    try {
      const token = await this.createToken();
      if (token?.statusCode !== '0000') {
        return new BadRequestException(token.statusMessage);
      }

      const headers = {
        Authorization: `${token.token_type} ${token.id_token}`,
        'X-APP-Key': this.appKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const body = {
        paymentID: payload.paymentID,
      };

      const response = await this.http.post(this.paymentStatusUrl, body, {
        headers,
        timeout: 30000,
      });

      const responseData: IBkashQueryResponse = await (await firstValueFrom(response)).data;

      // console.log('====================QUERY=============================');
      // console.log(this.paymentStatusUrl);
      // console.log(body);
      // console.log(responseData);
      // console.log('====================QUERY=============================');

      if (responseData && responseData.statusCode !== '0000') {
        return new BadRequestException(token.statusMessage);
      }

      if (responseData && responseData.transactionStatus !== 'Completed') {
        return new BadRequestException(token.statusMessage);
      }

      if (responseData && responseData.transactionStatus === 'Initiated') {
        return new BadRequestException(token.statusMessage);
      }

      const bkashPGResponse: IBkashPaymentGatewayResponse = {
        status: responseData.transactionStatus,
        amount: responseData.amount,
        transactionMethod: 'bKash',
        transactionId: responseData.paymentID,
        transactionTime: responseData.paymentCreateTime,
        orderId: responseData.merchantInvoice,
        parentOrderId: responseData.payerReference,
        reason: responseData.statusMessage,
        paymentType: 'bKash',
        invoiceType: 'bKash',
        paymentGateway: 'bKash',
        paymentGatewayOriginalResponse: responseData,
      };

      return bkashPGResponse;
    } catch (_error) {
      return false;
    }
  }

  async searchTransactionPayment(trxID: string): Promise<any> {
    try {
      const token = await this.createToken();
      if (token?.statusCode !== '0000') {
        return new BadRequestException(token.statusMessage);
      }

      const headers = {
        Authorization: `${token.token_type} ${token.id_token}`,
        'X-APP-Key': this.appKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const body = {
        trxID,
      };

      const response = await this.http.post(this.searchTransactionUrl, body, {
        headers,
        timeout: 30000,
      });

      const responseData: IBkashQueryResponse = await (await firstValueFrom(response)).data;

      // console.log('====================SEARCH TRANSACTION=============================');
      // console.log(this.searchTransactionUrl);
      // console.log(body);
      // console.log(responseData);
      // console.log('====================SEARCH TRANSACTION=============================');

      // if (responseData && responseData.statusCode !== '0000') {
      //   return new BadRequestException(token.statusMessage);
      // }

      // if (responseData && responseData.transactionStatus !== 'Completed') {
      //   return new BadRequestException(token.statusMessage);
      // }

      // if (responseData && responseData.transactionStatus === 'Initiated') {
      //   return new BadRequestException(token.statusMessage);
      // }

      // const bkashPGResponse: IBkashPaymentGatewayResponse = {
      //   status: responseData.transactionStatus,
      //   amount: responseData.amount,
      //   transactionMethod: 'bKash',
      //   transactionId: responseData.paymentID,
      //   transactionTime: responseData.paymentCreateTime,
      //   orderId: responseData.merchantInvoice,
      //   parentOrderId: responseData.payerReference,
      //   reason: responseData.statusMessage,
      //   paymentType: 'bKash',
      //   invoiceType: 'bKash',
      //   paymentGateway: 'bKash',
      //   paymentGatewayOriginalResponse: responseData,
      // };

      return responseData;
    } catch (_error) {
      return false;
    }
  }
}
