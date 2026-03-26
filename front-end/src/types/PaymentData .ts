export interface PaymentData {
    paymentId: string;
    qrUrl: string;
    amount: number;
    platformFee: number;
    agentFee: number;
}

export interface DealAmounts {
    agreed_price: number;
    currency: string;
    platform_fee: number;
    agent_fee: number;
    seller_payout: number;
}

export interface DealInfo {
    _id: string;
    property_id: string;
    seller_id: string;
    agent_id: string;
    amounts: DealAmounts;
}

export interface Payment {
    _id: string;
    deal_id: DealInfo;
    type: string;
    status: string;
    amount: number;
    currency: string;
    method: string;
    initiated_by: string;
    processed_by?: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
    payment_date: string;
}


export interface CreatePaymentResponse {
    success: boolean;
    message: string;
    data: PaymentData;
}

export interface GetPaymentsResponse {
    success: boolean;
    message: string;
    data: {
        items: Payment[];
        totalPages: number;
        page: number;
        total: number;
    };
}
