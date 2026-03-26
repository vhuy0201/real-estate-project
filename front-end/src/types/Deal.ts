export type Deal = {
    _id: string;

    property_id: {
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
        coordinates: {
            type: string;
            coordinates: [number, number];
        };
        _id: string;
        price: number;
        bedrooms: number;
        bathrooms: number;
        area: number;
        unit: string;
        floors: number;
        city_id: string;
        district_id: string;
        ward_id: string;
        type_id: string;
        category_id: string;
        owner_id: string;
        features: string[];
        images: string[];
        status: string;
        deleted: boolean;
        assignmentHistory: {
            agent_id: string;
            assignedBy: string;
            action: string;
            assignedAt: string;
            _id: string;
        }[];
        createdAt: string;
        updatedAt: string;
        __v: number;
        reviewedAt: string;
        reviewedBy: string;
        agent_id: string;
    };

    offer_id: {
        _id: string;
        property_id: string;
        buyer_id: string;
        seller_id: string;
        agent_id: string;
        amount: number;
        currency: string;
        note: string;
        status: string;
        attachments: string[];
        meta: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        __v: number;
        forwarded_at: string;
        reviewed_at: string;
        reviewed_by: string;
    };

    buyer_id: {
        _id: string;
        fullName: string;
        email: string;
        password: string;
        role: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
        phone: string;
        avatar: string;
    };

    seller_id: {
        _id: string;
        fullName: string;
        email: string;
        password: string;
        role: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
        phone: string;
        avatar: string;
    };

    agent_id: {
        _id: string;
        fullName: string;
        email: string;
        password: string;
        role: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
        phone: string;
        avatar: string;
    };

    status: string;

    amounts: {
        agreed_price: number;
        currency: string;
        platform_fee: number;
        agent_fee: number;
        seller_payout: number;
    };

    audit: {
        created_from_offer_at: string;
    };

    createdAt: string;
    updatedAt: string;
    __v: number;
};
