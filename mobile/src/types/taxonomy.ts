export interface MultilangText {
  vi: string;
  en: string;
}

export interface City {
  _id: string;
  city_name: MultilangText;
}

export interface District {
  _id: string;
  city_id: string;
  district_name: MultilangText;
}

export interface Ward {
  _id: string;
  district_id: string;
  ward_name: MultilangText;
}

export interface Category {
  _id: string;
  category_name: MultilangText;
}

export interface PropertyType {
  _id: string;
  type_name: MultilangText;
}

export interface Feature {
  _id: string;
  feature_name: MultilangText;
}

export interface TaxonomiesResponse {
  propertyTypes: PropertyType[];
  categories: Category[];
  features: Feature[];
}

export interface LocationHierarchy {
  _id: string;
  city_name: MultilangText;
  districts: {
    _id: string;
    district_name: MultilangText;
    wards: {
      _id: string;
      ward_name: MultilangText;
    }[];
  }[];
}
