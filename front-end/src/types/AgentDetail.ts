export interface AgentDetail {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface AgentStats {
  sold_properties: number;
  active_listings: number;
}

export interface AgentInfoResponse {
  agent: AgentDetail;
  stats: AgentStats;
}

export interface AgentReview {
  _id: string;
  user_id: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  target_id: string;
  target_type: string;
  rating: number;
  comment: {
    vi: string;
    en: string;
  };
  status: string;
  is_hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentProperty {
  _id: string;
  title: {
    vi: string;
    en: string;
  };
  price: number;
  images: string[];
  address: {
    vi: string;
    en: string;
  };
  bedrooms: number;
  bathrooms: number;
  area?: number;
  city_id?: {
    _id: string;
    city_name: {
      vi: string;
      en: string;
    };
  };
  district_id?: {
    _id: string;
    district_name: {
      vi: string;
      en: string;
    };
  };
  ward_id?: {
    _id: string;
    ward_name: {
      vi: string;
      en: string;
    };
  };
}

