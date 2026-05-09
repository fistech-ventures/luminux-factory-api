import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { Response } from 'express';
import { IBkashWebHookData } from '../bkash/bkash.interfaces';
import { PaymentRequestDTO } from '../dtos/payment-request.dto';
import { ENUM_PAYMENT_GATEWAY_TYPE } from '../enums';
import { PaymentGatewayRequestService } from '../services/paymentGatewayRequest.service';

@ApiTags('Payment Gateway Request')
// @ApiBearerAuth()
// @ApiSecurity('X-Panel-Key')
// @ApiSecurity('X-Api-Key')
// @UseInterceptors(InternalRequestInterceptor)
@Controller('web/payment-gateway-requests')
export class PaymentGatewayRequestWebController {
  constructor(
    private readonly requestService: PaymentGatewayRequestService,
    // private readonly service: PaymentGatewayService,
  ) { }

  @Public()
  @Post('payment-request')
  async paymentRequest(@Body() data: PaymentRequestDTO): Promise<any> {
    const response = await this.requestService.paymentRequest(data);
    return response;
  }

  @Public()
  @Post('ssl/callback-url')
  async onSSLCommerzCallbackUrl(@Body() body: any, @Res() res: any): Promise<any> {
    const url = await this.requestService.onSSLCommerzCallbackUrl(body);
    res.redirect(url);
  }

  // @Public()
  // @Post('bkash/callback-url')
  // async onBkashCallbackUrl(@Body() body: any, @Res() res: any): Promise<any> {
  //   const url = await this.requestService.onBkashCallbackUrl(body);
  //   res.redirect(url);
  // }

  @Public()
  @Post('ssl/webhook')
  async onSSLCommerzHook(@Body() body: any): Promise<any> {
    let message = null;

    if (body.status === 'VALID') {
      await this.requestService.onSuccessfulPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ,
        body,
        body.tran_id,
      );
      message = 'Success';
    } else if (body.status === 'CANCELLED' || 'UNATTEMPTED') {
      await this.requestService.onCancelPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ,
        body.order_id,
        body,
      );
      message = 'Cancelled';
    } else if (body.status === 'FAILED') {
      await this.requestService.onFailedPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ,
        body,
        body.order_id,
      );
      message = 'Failed';
    }
    return { message };
  }

  @Public()
  @Get('bkash/webhook/:invoiceCode')
  async onBkashHook(
    @Query() query: IBkashWebHookData, // 01929918378 // 123456 // 12121
    @Param('invoiceCode') invoiceCode: string,
    @Res() res: Response,
  ): Promise<any> {
    console.info("🚀 ~ PaymentGatewayRequestWebController ~ onBkashHook ~ invoiceCode:", invoiceCode)
    let message = null;
    if (query.status === 'success') {
      const reqRes = await this.requestService.onSuccessfulPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.BKASH,
        query,
        query.paymentID,
      );
      message = 'Success';
      const redirectUrl = await this.requestService.onBkashCallbackUrl(reqRes.transactionCode);
      res.redirect(redirectUrl);
    } else if (query.status === 'cancel') {
      const reqRes = await this.requestService.onCancelPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.BKASH,
        query.paymentID,
      );
      message = 'Cancelled';
      const redirectUrl = await this.requestService.onBkashCallbackUrl(reqRes.transactionCode);
      res.redirect(redirectUrl);
    } else if (query.status === 'failure') {
      const reqRes = await this.requestService.onFailedPayment(
        ENUM_PAYMENT_GATEWAY_TYPE.BKASH,
        query,
        query.paymentID,
      );
      message = 'Failed';
      const redirectUrl = await this.requestService.onBkashCallbackUrl(reqRes.transactionCode);
      res.redirect(redirectUrl);
    }
    return { message };
  }

  // @Get('bkash/query-payment/:paymentId')
  // async onBkashQuery(@Param('paymentId') paymentId: string): Promise<any> {
  //   return this.requestService.bkashQueryPayment(paymentId);
  // }

  // @Get('bkash/search-payment/:trxID')
  // async onBkashSearch(@Param('trxID') trxID: string): Promise<any> {
  //   return this.requestService.bkashSearchPayment(trxID);
  // }

  // @Post('bkash/refund-transaction')
  // async onBkashRefundTransaction(@Body() data: any): Promise<any> {
  //   return this.requestService.paymentRefundForBKASH(data);
  // }

  // @Post('bkash/refund-transaction-status')
  // async onBkashRefundTransactionStatus(@Body() data: any): Promise<any> {
  //   return this.requestService.paymentRefundStatusForBKASH(data);
  // }
}
