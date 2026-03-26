export type RequestJoinProperty =
    {
        _id: string,
        property_id: {
            _id: string,
            title: {
                vi: string,
                en: string
            },
            price: number,
            address: {
                vi: string,
                en: string
            }
        },
        agent_id: {
            _id: string,
            fullName: string,
            email: string,
            phone: string,
        },
        owner_id: string,
        status: string,
        createdAt: string,
        updatedAt: string,
        __v: number
    }