export interface IPaymentGatewayResponse {
  status?: string;
  amount?: number;
  transactionMethod?: string;
  transactionId?: string;
  transactionTime?: any;
  invoiceCode?: string;
  transactionCode?: string;
  userInvoiceId?: string;
  reason?: string;
  originUrl?: string;
  webCallbackUrl?: string;
  paymentIssuer?: string;
  paymentMethod?: string;
  paymentCurrency?: string;
  paymentGateway?: string;
  paymentGatewayRequestResponse?: any;
  paymentGatewayOriginalResponse?: any;
  isSuccess?: boolean;
}

export interface IExtraPaymentRequestOptions {
  customerAddress1?: string;
  customerAddress2?: string;
  customerCity?: string;
  customerCountry?: string;
}
