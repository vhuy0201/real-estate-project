export type Review = {
  _id: string;
  user_id: {
    _id: string;
    fullName: string;
    email: string;
    avatar: string;
  };
  target: {
    _id: string;
    avatar: string;
    email: string;
    fullName: string;
    phone: string;
    address: {
      vi: string;
      en: string;
    };
    area: number;
    bathrooms: number;
    bedrooms: number;
    city_id: {
      _id: string;
    };
    district_id: {
      _id: string;
    };
    images: string[];
    price: string;
    title: {
      en: string;
      vi: string;
    };
    ward_id: {
      _id: string;
    };
  };
  target_id: {
    _id: string;
  };
  target_type: string;
  rating: number;
  comment: {
    vi: string;
    en: string;
  };
  isComment: boolean;
  canReview: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewPagination = {
  limit: number;
  totalPages: number;
  page: number;
};
