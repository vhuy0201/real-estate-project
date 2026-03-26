import api from "./api";

export const contractApiAgent = {
    getContracts: (dealId: string) =>
        api.get(`/api/client/agent/contracts/deals/${dealId}/list`, {
            withCredentials: true,
        }),

    uploadOrReplaceContract: (dealId: string, data: FormData, hasExisting: boolean) =>
        hasExisting
            ? api.put(`/api/client/agent/contracts/deals/${dealId}`, data, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            : api.post(`/api/client/agent/contracts/deals/${dealId}`, data, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),

    deleteContract: (dealId: string, contractId: string) =>
        api.delete(`/api/client/agent/contracts/deals/${dealId}/contracts/${contractId}`, {
            withCredentials: true,
        }),
};
