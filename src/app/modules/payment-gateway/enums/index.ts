export enum ENUM_PAYMENT_GATEWAY_TYPE {
  SYSTEM = 'SYSTEM',
  COD = 'COD',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  SSL_COMMERZ = 'SSL_COMMERZ',
}

export enum ENUM_AMARPAY_STATUS {
  Failed = 'Failed',
  Successful = 'Successful',
}

export enum ENUM_PAYMENT_STATUS {
  Failed = 'Failed',
  Successful = 'Successful',
  Canceled = 'Canceled',
}

export enum ENUM_PAYMENT_TYPE {
  advance_amount = 'advance_amount',
  full_amount = 'full_amount',
}

export enum ENUM_INVOICE_TYPE {
  parent = 'parent',
  child = 'child',
}
