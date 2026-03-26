import api from "./api";

export const contractApiSeller = {
    getContracts: (dealId: string) =>
        api.get(`/api/client/seller/contracts/deals/${dealId}/list`, {
            withCredentials: true,
        }),

    uploadOrReplaceContract: (dealId: string, data: FormData, hasExisting: boolean) =>
        hasExisting
            ? api.put(`/api/client/seller/contracts/deals/${dealId}`, data, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            : api.post(`/api/client/seller/contracts/deals/${dealId}`, data, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),

    deleteContract: (dealId: string, contractId: string) =>
        api.delete(`/api/client/seller/contracts/deals/${dealId}/contracts/${contractId}`, {
            withCredentials: true,
        }),
};
