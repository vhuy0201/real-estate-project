import api from "./api";

export const contractApiBuyer = {
    getContracts: (dealId: string) =>
        api.get(`/api/client/buyer/deals/${dealId}/contract`, {
        }),
    acceptContract: (dealId: string, contractId: string) =>
        api.patch(`/api/client/buyer/deals/${dealId}/contracts/${contractId}/accept`),

    rejectContract: (dealId: string, contractId: string, data: { reason: string }) =>
        api.patch(`/api/client/buyer/deals/${dealId}/contracts/${contractId}/reject`, data),

};
