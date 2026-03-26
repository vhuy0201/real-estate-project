export interface I18nString {
  vi: string;
  en: string;
}

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
}

export interface Property {
  id: string;
  _id?: string;
  title: I18nString;
  description?: I18nString;
  price: number;
  address: I18nString;
  bedrooms: number;
  bathrooms: number;
  area: number;
  unit: "m2" | "ft2";
  yearBuilt?: number;
  floors: number;
  floor_number?: string;
  building_block?: string;
  apartment_number?: string;

  city_id?: string;
  district_id?: string;
  ward_id?: string;
  type_id?: string;
  category_id?: string;
  owner_id?: string | IUser;
  agent_id?: string | IUser;

  features?: string[]; // IDs
  images?: string[];
  coordinates?: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  status: "available" | "pending" | "approved" | "sold" | "rejected" | "rented";
  fullAddress?: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertiesResponse {
  data: {
    data: Property[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
  success: boolean;
  message: string;
}

export interface OwnerPropertiesResponse {
  data: Property[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
  ward?: string;
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
}
