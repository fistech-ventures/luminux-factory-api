export enum ENUM_SERVICE_PROVIDER_TYPE {
    DELIVERY = 'Delivery',
}

export enum ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER {
    PAPERFLY = 'paperfly',
    REDEX = 'redx',
    STEADFAST = 'steadfast',
    SUNDARBAN = 'sundarban',
    PATHAO = 'pathao',
    GOGO = 'gogo',
    FIBONACCI = 'fibonacci',
}

export interface ICourierProvider {
    buildHeaders(apiConfig: any): Record<string, string>;
    buildPayload(orderData: any): any;
    endpoint: string;
}