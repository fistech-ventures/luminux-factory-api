import { ICourierProvider } from "../const";
export class PathaoProvider implements ICourierProvider {

    endpoint = "/aladdin/api/v1/orders";

    buildHeaders(apiConfig: any): Record<string, string> {
        return {
            Authorization: `Bearer ${apiConfig.accessToken}`,
            "Content-Type": "application/json",
        };
    }

    buildPayload(orderData: any): Record<string, string | number> {
        return {
            merchant_order_id: orderData.code,
            recipient_name: orderData.customerName,
            recipient_phone: orderData.customerPhone,
            recipient_address: orderData.shippingAddress,
            amount_to_collect: orderData.codAmount,
        };
    }
}