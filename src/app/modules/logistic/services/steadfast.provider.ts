import { ICourierProvider } from "../const";

export class SteadfastProvider implements ICourierProvider {

    endpoint = "/create_order";

    buildHeaders(apiConfig: any): Record<string, string> {
        return {
            "Api-Key": apiConfig.apiKey,
            "Secret-Key": apiConfig.secretKey,
            "Content-Type": "application/json",
        };
    }

    buildPayload(orderData: any): Record<string, string | number> {
        return {
            invoice: orderData.code,
            recipient_name: orderData.customerName,
            recipient_phone: orderData.customerPhone,
            address: orderData.shippingAddress,
            cod_amount: orderData.codAmount,
        };
    }
}