import api from "./api";
import type { Deal } from "../types/Deal";

export const dealApiAgent = {
    getDeals(): Promise<Deal[]> {
        return api.get("/api/client/agent/deals").then((res) => res.data.data);
    },
};
