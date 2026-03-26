export type AssignAgent = {
    _id: string;
    property_id: {
        _id: string;
        title: {
            vi: string;
            en: string;
        };
        price: number;
        address: {
            vi: string;
            en: string;
        };
        owner_id: string;
    };
    agent_id: string;
    owner_id: {
        _id: string;
        fullName: string;
        email: string;
        phone: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    actedAt?: string;
    actedBy?: string
}
