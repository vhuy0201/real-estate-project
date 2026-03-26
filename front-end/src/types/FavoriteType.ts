export type Favorite = {
    _id: string,
    user_id: string,
    property_id: string,
    createAt: string,
    updateAt: string,
    __v: number,
}

export type checkFavoriteType = {
    isFavorite: boolean,
    favorite: Favorite
}
export type PropertyFavorite = {
    favorite_id: string;
    property_id: string;

    title: {
        vi: string;
        en: string;
    };

    description: {
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
    unit?: string;
    yearBuilt?: number;
    floors?: number;

    coordinates?: {
        type: "Point";
        coordinates?: [number, number];
    };

    city?: {
        city_name: { vi: string; en: string };
        _id: string;
        __v: number;
        createdAt: string;
        deleted: boolean;
        updatedAt: string;
    };

    district?: {
        district_name: { vi: string; en: string };
        _id: string;
        city_id: string;
        __v: number;
        createdAt: string;
        deleted: boolean;
        updatedAt: string;
    };

    ward?: {
        ward_name: { vi: string; en: string };
        _id: string;
        district_id: string;
        __v: number;
        createdAt: string;
        deleted: boolean;
        updatedAt: string;
    };

    type?: {
        _id: string;
        type_name: { vi: string; en: string };
        __v: number;
        createdAt: string;
        deleted: boolean;
        updatedAt: string;
    };

    category?: {
        _id: string;
        category_name: { vi: string; en: string };
        __v: number;
        createdAt: string;
        deleted: boolean;
        updatedAt: string;
    };

    features?: {
        _id: string;
        feature_name: { vi: string; en: string };
        __v: number;
        deleted: boolean;
        createdAt: string;
        updatedAt: string;
    }[];

    owner?: {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
        avatar?: string;
    };

    agent?: {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
        avatar?: string;
    };

    status?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    publishedAt?: string;

    deleted: boolean;
    createdAt: string;
    updatedAt: string;
};


export type PropertyCompare = {
    _id: string;
    title: { vi: string; en: string };
    description: { vi: string; en: string };
    price: number;
    images: string[];

    address: { vi: string; en: string };

    bedrooms: number;
    bathrooms: number;
    area?: number;
    unit?: string;
    yearBuilt?: number;
    floors?: number;

    coordinates: {
        type: "Point";
        coordinates: [number, number];
    };

    city_id: {
        _id: string;
        city_name: { vi: string; en: string };
        deleted: boolean;
        createdAt: string;
        updatedAt: string;
    };

    district_id: {
        _id: string;
        city_id: string;
        district_name: { vi: string; en: string };
        deleted: boolean;
        createdAt: string;
        updatedAt: string;
    };

    ward_id: {
        _id: string;
        district_id: string;
        ward_name: { vi: string; en: string };
        deleted: boolean;
        createdAt: string;
        updatedAt: string;
    };

    type_id: {
        _id: string;
        type_name: { vi: string; en: string };
        deleted: boolean;
        createdAt: string;
        updatedAt: string;
    };

    category_id: {
        _id: string;
        category_name: { vi: string; en: string };
        deleted: boolean;
        createdAt: string;
        updatedAt: string;
    };

    features: {
        _id: string;
        feature_name: { vi: string; en: string };
        deleted: boolean;
        createdAt: string;
        updatedAt: string;
    }[];

    owner_id: {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
        avatar?: string;
    };

    agent_id: {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
        avatar?: string;
    };

    status: string;
    reviewedBy?: string;
    reviewedAt?: string;
    publishedAt?: string;
    assignmentHistory?: {
        _id: string;
        agent_id: string;
        assignedBy: string;
        action: string;
        assignedAt: string;
    }[];

    deleted: boolean;
    createdAt: string;
    updatedAt: string;
};
