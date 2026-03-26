import type { Deal } from "./Deal";

export type Payment = {
  _id: string;
  deal_id: {
    _id: string;
    status: string;
  };
  type: string;
  amount: number;
  payment_date: Date;
  method: string;
  status: string;
  currency:string;
  notes:string;
  initiated_by: {
    _id: string;
    fullName: string;
    email: string;
  };
  processed_by: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};
