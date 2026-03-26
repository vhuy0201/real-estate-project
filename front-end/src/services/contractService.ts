import type { Contract } from "../types/Contract";
import { httpAdmin } from "../utils/httpAdmin";

const RESOURCE = "/contracts";

export interface ContractListResponse {
  contracts: Contract[];
  pagination: any;
}

export const getAllContract = async (
  page: number,
  status?: string
): Promise<ContractListResponse> => {
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
    contracts: data,
    pagination: pagination,
  };
};

export const getAllContractStatistic = async (): Promise<Contract[]> => {
  const res = await httpAdmin.get(RESOURCE, {
    params: { limit: 100 },
  });
  return res.data.data.data;
};

export const approveContract = async (id: string): Promise<Contract> => {
  const res = await httpAdmin.patch(`${RESOURCE}/${id}/approve`);
  return res.data;
};

export const rejectContract = async (
  id: string,
  reason: string
): Promise<Contract> => {
  const res = await httpAdmin.patch(`${RESOURCE}/${id}/reject`, {
    reason,
  });
  return res.data;
};
