import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '@src/env';
import * as qs from 'qs'; // or use URLSearchParams if you like
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { SSL_COMMERZ_CLIENT } from './sslcommerz.constants';
import {
  IIpnResponse,
  ISSLCommerzInitPaymentRequest,
  ISSLCommerzOptions,
  ISSLCommerzPaymentGatewayResponse,
} from './sslcommerz.interfaces';

@Injectable()
export class SSLCommerzService {
  constructor(
    @Inject(SSL_COMMERZ_CLIENT)
    private readonly options: ISSLCommerzOptions,
    private readonly http?: HttpService,
  ) {
    this.storeId = options.storeId;
    this.storePassword = options.storePassword;
    this.basePaymentUrl = options.basePaymentUrl;
    this.basePaymentValidationUrl = options.basePaymentValidationUrl;
  }

  private storeId: string;
  private storePassword: string;
  private basePaymentUrl: string;
  private basePaymentValidationUrl: string;

  async initPayment(
    data: ISSLCommerzInitPaymentRequest,
  ): Promise<ISSLCommerzPaymentGatewayResponse> {
    try {
      const payload = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        total_amount: data.amount,
        currency: 'BDT',
        tran_id: data.transactionCode,
        product_category: data?.productCategory || 'Product Category',
        success_url: ENV.sslCommerz.SSL_COMMERZ_SUCCESS_URL,
        fail_url: ENV.sslCommerz.SSL_COMMERZ_FAILED_URL,
        cancel_url: ENV.sslCommerz.SSL_COMMERZ_CANCELED_URL,
        cus_name: data?.customerName || 'John Doe',
        cus_email: data?.customerEmail || 'demo@gmail.com',
        cus_add1: data?.customerAddress || 'Khilkhet',
        cus_city: data?.customerCity || 'Dhaka',
        cus_postcode: '1229',
        cus_country: data?.customerCountry || 'Bangladesh',
        cus_phone: data?.customerPhoneNumber || '01700000000',
        product_name: data?.productName || 'Product Name',
        product_profile: data?.productProfile || 'general',
        shipping_method: 'NO',
        num_of_item: 1,
        product_amount: data.productAmount,
      };

      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      const response = await lastValueFrom(
        this.http.post(this.basePaymentUrl, qs.stringify(payload), { headers }),
      );

      return response.data;
    } catch (error) {
      console.error('🚀 ~ SSLCommerzService ~ error:', error);
      throw error;
    }
  }

  public async validate(data: IIpnResponse): Promise<any> {
    const options = {
      method: 'GET',
      uri: `${this.basePaymentValidationUrl}?val_id=${data.val_id}&store_id=${this.storeId}&store_passwd=${this.storePassword}`,
    };

    // const response = await RP(options);
    const response = await this.http.get(options.uri);
    const responseData = (await firstValueFrom(response)).data;
    return responseData;
  }
}
