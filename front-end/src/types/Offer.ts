export type OfferStatus = 
  | "pending" 
  | "forwarded_to_seller" 
  | "seller_reviewing" 
  | "accepted" 
  | "rejected" 
  | "cancelled";

export type Offer = {
  _id: string;
  property_id: string | {
    _id: string;
    title: {
      vi: string;
      en: string;
    };
     description: {
      vi: string;
      en: string;
    };
    address: {
      vi: string;
      en: string;
    };
    price: number;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    city_id?: {
      _id: string;
      city_name: {
        vi: string;
        en: string;
      };
    };
    type_id?: {
      _id: string;
      type_name: {
        vi: string;
        en: string;
      };
    };
    category_id?: {
      _id: string;
      category_name: {
        vi: string;
        en: string;
      };
    };
    owner_id?: {
      _id: string;
      fullName: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
    agent_id?: {
      _id: string;
      fullName: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
    features?: {
      _id: string;
      feature_name: {
        vi: string;
        en: string;
      };
    }[];
    images: string[];
    status: string;
    hiddenNote: string;
    deleted: boolean;
    assignmentHistory: any[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
  };
  buyer_id: string | {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  agent_id?: string | {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  seller_id?: string | {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  category_id?: {
      _id: string;
      category_name: {
        vi: string;
        en: string;
      };
    };
    owner_id?: {
      _id: string;
      fullName: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
  amount: number;
  currency?: string;
  note?: string;
  status: OfferStatus;
  expires_at?: string; 
  forwarded_at?: string;
  reviewed_by?: string | {
    _id: string;
    fullName: string;
  };
  reviewed_at?: string;
  rejection_reason?: string;
  attachments?: string[];
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type CreateOfferDto = {
  property_id: string;
  amount: number;
  validityPeriod: string; 
  note?: string;
  currency?: string;
  attachments?: string[];
  meta?: Record<string, any>;
}

export type OfferFilters = {
  status?: OfferStatus;
  property_id?: string;
}

