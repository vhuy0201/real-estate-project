export type Taxonomy = {
    cities: [
        {
            city_name: {
                vi: string,
                en: string
            }
            _id: string
        }
    ]
    propertyTypes: [
        {
            type_name: {
                vi: string;
                en: string
            };
            _id: string
        }
    ]
    categories: [
        {
            category_name: {
                vi: string;
                en: string
            };
            _id: string
        }
    ]
    features: [
        {
            feature_name: {
                vi: string;
                en: string
            };
            _id: string
        }
    ]
}
// Song ngữ
export type LocalizedName = {
    vi: string;
    en: string;
}

// === CITY ===
export type City = {
    _id: string;
    city_name: LocalizedName;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type CityResponse = {
    success: true;
    message: string;
    data: City[];
}

// === FEATURE ===
export type Feature = {
    _id: string;
    feature_name: LocalizedName;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type FeatureResponse = {
    success: true;
    message: string;
    data: Feature[];
}

// === TYPE ===
export type TypeItem = {
    _id: string;
    type_name: LocalizedName;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type TypeResponse = {
    success: true;
    message: string;
    data: TypeItem[];
}

// === CATEGORY ===
export type Category = {
    _id: string;
    category_name: LocalizedName;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type CategoryResponse = {
    success: true;
    message: string;
    data: Category[];
}

export type TaxonomyItem = City | Feature | TypeItem | Category;
export type TaxonomyType = "cities" | "features" | "types" | "categories";