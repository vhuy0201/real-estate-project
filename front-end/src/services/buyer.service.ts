import { httpClient } from "@/utils/httpClient";
import type { Appointment } from "@/types/Appointment";
import type { AppoinmentDate, } from "@/components/Buyer/Appointment/BuyerAppointment";

const RESOURCES = "/buyer";

export const getAllAppoinments = async (): Promise<Appointment[]> => {
    try {
        const response = await httpClient.get(`${RESOURCES}/appointments`);
        console.log("Response:", response);
        return response.data.data.data;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        throw error;
    }

}
export const cancelAppointmentBuyer = async (id: string) => {
    try {
        const response = await httpClient.patch(`${RESOURCES}/appointments/${id}/cancel`);
        return response.data;
    } catch (error: any) {
        console.error("Error canceling appointment:", error);
        throw error;
    }
}

export const postAppointments = async (timeAp: AppoinmentDate): Promise<String> => {
    console.log("Posting appointment with data:", timeAp);
    const response = await httpClient.post(`${RESOURCES}/appointments`, {
        propertyId: timeAp.propertyId,
        location: timeAp.location,
        times: timeAp.times,
    });
    return response.data;
}


