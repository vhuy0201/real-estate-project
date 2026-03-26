import api from "./api";
import type { Deal } from "../types/Deal";

export const dealApiBuyer = {
    getDeals(): Promise<Deal[]> {
        return api.get("/api/client/buyer/deals").then((res) => res.data.data);
    },
};
