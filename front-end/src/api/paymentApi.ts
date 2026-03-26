import type { PaymentData } from "../types/PaymentData ";
import type { Payment } from "../types/PaymentData ";
import type { CreatePaymentResponse } from "../types/PaymentData ";
import type { GetPaymentsResponse } from "../types/PaymentData ";
import api from "./api";

export const createPayment = async (dealId: string): Promise<PaymentData> => {
    const res = await api.post<CreatePaymentResponse>("/api/client/buyer/payments/create", { dealId });
    return res.data.data;
};

export const paymentSuccess = async (paymentId: string) => {
    return api.post("/api/public/webhook/payos", {
        paymentId,
        status: "success",
    });
}

export const getPayments = async ({
    page = 1,
    limit = 10,
}: {
    page?: number;
    limit?: number;
} = {}): Promise<{ items: Payment[]; totalPages: number }> => {
    const res = await api.get<GetPaymentsResponse>("/api/client/buyer/payments", {
        params: { page, limit },
    });

    return {
        items: res.data.data.items,
        totalPages: res.data.data.totalPages,
    };
};