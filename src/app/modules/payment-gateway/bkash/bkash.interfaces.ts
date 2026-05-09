export interface IBkashOptions {
  tokenUrl: string;
  createUrl: string;
  executeUrl: string;
  paymentStatusUrl: string;
  searchTransactionUrl: string;
  refundTransactionUrl: string;
  webHookUrl: string;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
}

export interface IBkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface IBkashInitPaymentRequest {
  invoiceCode: string;
  amount: number;
}
export interface IBkashRefundTransaction {
  paymentID: string;
  amount: number;
  trxID: string;
  sku: string;
  reason: string;
}
export interface IBkashRefundTransactionResponse {
  completedTime: string;
  transactionStatus: string;
  originalTrxID: string;
  refundTrxID: string;
  amount: number;
  currency: string;
  charge: string;
  statusCode: string;
}

export interface IBkashInitPaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
}

export interface IBkashWebHookData {
  status?: 'success' | 'failure' | 'cancel';
  paymentID?: string;
  apiVersion?: string;
}

export interface IBkashExecuteResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  payerReference: string;
  customerMsisdn: string;
  trxID: string;
  amount: string;
  transactionStatus: string;
  paymentExecuteTime: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
}

export interface IBkashQueryResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  mode: string;
  paymentCreateTime: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoice: string;
  transactionStatus: string;
  verificationStatus: string;
  payerReference: string;
  agreementID: string;
  agreementStatus: string;
  agreementCreateTime: string;
  agreementExecuteTime: string;
}

export interface IBkashPaymentGatewayResponse {
  status?: string;
  amount?: string;
  transactionMethod?: string;
  transactionId?: string;
  transactionTime?: string;
  orderId?: string;
  parentOrderId?: string;
  reason?: string;
  originUrl?: string;
  paymentType?: string;
  invoiceType?: string;
  paymentGateway?: string;
  paymentGatewayOriginalResponse?: any;
}
