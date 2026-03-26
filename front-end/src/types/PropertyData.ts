type common = number | string;
export type PropertyData = {
    title: string;
    price: common;
    description: string;
    address: string;
    bathrooms: common;
    bedrooms: common;
    area: common;
    unit: common;
    floors: common;
    yearBuilt?: common;
    city_id: string;
    district_id: string;
    ward_id: string;
    category_id: string;
    type_id: string;
    coordinates?: {
        type: "Point";
        coordinates: [number, number];
    };
    features: string[];
    floor_number?: string;
    building_block?: string;
    apartment_number?: string;
}
export type PropertyFormData = {
    title: string,
    price: common,
    category_name: string,
    type_name: string,
    bedrooms: common
    bathrooms: common,
    area: common,
    address: string,
    ward_name: string,
    district_name: string,
    city_name: string,
    features_names: string[],
    floor_number?: common,
    building_block?: string,
    apartment_number?: string
}

export type Description = {
    description: string;
} 