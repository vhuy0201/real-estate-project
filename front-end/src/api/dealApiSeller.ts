import api from "./api";
import type { Deal } from "../types/Deal";

export const dealApiSeller = {
    getDeals(): Promise<Deal[]> {
        return api.get("/api/client/seller/deals").then((res) => res.data.data);
    },
};
