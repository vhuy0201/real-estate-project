export type Appointment = {
    _id: string,
    property_id: {
        _id: string,
        title: {
            vi: string,
            en: string
        },
        price: number
        address: {
            vi: string,
            en: string
        },
        images: string[],
        status: string
    },
    buyer_id: string,
    agent_id: {
        _id: string,
        fullName: string,
        email: string,
        avatar: string,
        phone: string
    },
    seller_id: {
        _id: string,
        fullName: string,
        email: string,
        phone: string,
        avatar: string
    },
    times:
    {
        time: Date,
        note: string,
        _id: string
    }[],
    final_time: Date,
    location: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    __v: number

}