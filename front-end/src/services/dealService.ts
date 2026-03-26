import type { Deal } from "../types/Deal";
import { httpAdmin } from "../utils/httpAdmin";

const RESOURCE = "/deals";

export interface DealListResponse {
  deals: Deal[];
  pagination: any;
}

export const getAllDeal = async (
  page: number,
  status?: string
): Promise<DealListResponse> => {
  const params: { page: number; status?: string } = { page };

  if (status) {
    params.status = status;
  }

  const res = await httpAdmin.get(RESOURCE, {
    params: params,
  });

  const data = res.data.data.data;
  const pagination = res.data.data.pagination;

  return {
    deals: data,
    pagination: pagination,
  };
};

export const getAllDealStatistic = async (): Promise<Deal[]> => {
  const res = await httpAdmin.get(RESOURCE, {
    params: { limit: 100 },
  });
  return res.data.data.data;
};

export const getDealById = async (id: string): Promise<Deal> => {
  const res = await httpAdmin.get(`${RESOURCE}/${id}`);
  return res.data.data;
};

export const approveOrRejectDeal = async (
  id: string,
  status: string
): Promise<Deal> => {
  const res = await httpAdmin.patch(`${RESOURCE}/${id}/status`, {
    status,
  });
  return res.data;
};
