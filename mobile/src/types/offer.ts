export type OfferStatus =
  | "pending"
  | "forwarded_to_seller"
  | "seller_reviewing"
  | "accepted"
  | "rejected"
  | "cancelled";

// User info (for populated fields)
export interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

// Property info (for populated fields)
export interface PropertyInfo {
  _id: string;
  title: { en: string; vi: string } | string;
  price: number;
  description?: string;
  address?: string;
  images?: string[];
}

export interface Offer {
  _id: string;
  property_id: string | PropertyInfo;
  buyer_id: string | UserInfo;
  agent_id?: string | UserInfo;
  seller_id?: string | UserInfo;
  amount: number;
  currency: string;
  note?: string;
  status: OfferStatus;
  expires_at?: string;
  forwarded_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  attachments?: string[];
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferDto {
  propertyId: string;
  amount: number;
  note?: string;
  currency?: string;
  expiresAt: string;
  attachments?: string[];
  meta?: Record<string, any>;
}

export interface OfferFilters {
  status?: OfferStatus;
  propertyId?: string;
  page?: number;
  limit?: number;
}

export interface OfferListResponse {
  data: Offer[];
  total?: number;
  page?: number;
  limit?: number;
}
