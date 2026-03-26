/** Trạng thái bài đăng (khớp backend property.model) */
export type PropertyModerationStatus =
  | "available"
  | "pending"
  | "approved"
  | "sold"
  | "rejected"
  | "rented";

export type AdminPropertyOwnerRef = {
  _id?: string;
  fullName?: string;
  email?: string;
};

/** Một dòng từ GET /admin/properties (lean + populate owner_id) */
export type AdminPropertyListRow = {
  _id: string;
  title?: { vi?: string; en?: string };
  address?: { vi?: string; en?: string };
  price?: number;
  status?: PropertyModerationStatus;
  owner_id?: AdminPropertyOwnerRef | string | null;
  deleted?: boolean;
  images?: string[];
};

export type AdminPropertiesPageResponse = {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: AdminPropertyListRow[];
};

export type AdminPropertyStatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "hidden";
