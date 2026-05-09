import { ICourierProvider } from "../const";

export class PaperflyProvider implements ICourierProvider {

    endpoint = "/api/order";

    buildHeaders(apiConfig: any): Record<string, string> {

        const encodedAuth = Buffer
            .from(`${apiConfig.username}:${apiConfig.password}`)
            .toString("base64");

        return {
            Authorization: `Basic ${encodedAuth}`,
            paperflykey: apiConfig.paperflyKey,
            "Content-Type": "application/json",
        };
    }

    buildPayload(orderData: any): Record<string, string | number> {
        return {
            merchant_order_id: orderData.code,
            recipient_name: orderData.customerName,
            recipient_phone: orderData.customerPhone,
            address: orderData.shippingAddress,
            amount: orderData.codAmount,
        };
    }
}