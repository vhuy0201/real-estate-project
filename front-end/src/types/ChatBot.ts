export interface Property {
    _id: string;
    title: {
        vi: string;
        en: string;
    };
    description: {
        vi: string;
        en: string;
    };
    price: number;
    address: {
        vi: string;
        en: string;
    };
    bedrooms: number;
    bathrooms: number;
    area: number;
    unit: string;
    yearBuilt?: number;
    floors: number;
    coordinates: {
        type: string;
        coordinates: [number, number];
    };
    city_id: string;
    district_id: string;
    ward_id: string;
    type_id: string;
    category_id: {
        _id: string;
        category_name: {
            vi: string;
            en: string;
        };
    };
    owner_id: string;
    agent_id?: string;
    features: Array<{
        _id: string;
        feature_name: {
            vi: string;
            en: string;
        };
    }>;
    images: string[];
    status: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    assignmentHistory: any[];
    __v: number;
    publishedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    properties?: Property[];
}

export interface ChatBotResponse {
    success: boolean;
    message: string;
    data: {
        properties: Property[];
    };
}

