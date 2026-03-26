export type Feature = {
    _id: string;
    feature_name: {
        vi: string;
        en: string;
    } | string;
    createdAt?: string;
    updatedAt?: string;
};

