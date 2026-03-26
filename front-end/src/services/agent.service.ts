import { errorHandler } from './../../../backend/src/middlewares/errorHandler.middleware';

import type { AssignAgent } from "@/types/AsssignAgents";

import { httpClient } from "../utils/httpClient";
import type { AgentAppointment } from "@/types/AgentAppointment";
import { http } from './api';
import type { Property } from '@/types/Property';

const RESOURCE = "/agent";
export const getAllAssignments = async (): Promise<AssignAgent[]> => {
    const res = await httpClient.get(`${RESOURCE}/assignments`);
    return res.data.data;
}

export const acceptAssignAgent = async (id: string) => {
    try {
        const response = await httpClient.patch(`${RESOURCE}/assignments/${id}/accept`);
        console.log("Response data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error accept agent:", error);
        throw error;
    }
};
export const rejectAssignAgent = async (id: string, note: string) => {
    try {
        const response = await httpClient.patch(`${RESOURCE}/assignments/${id}/reject`,
            { note }
        );
        return response.data;
    } catch (error) {
        console.error("Error reject agent:", error);
        throw error;
    }
};
export const getAllAppointmentsByAgent = async (): Promise<AgentAppointment[]> => {
    try {
        const response = await httpClient.get(`${RESOURCE}/appointments`);
        return response.data.data.data;
    } catch (error) {
        console.log("Fetching agent appointments failed:", error);
        throw error;
    }
}
export const acceptAppointment = async (appointmentId: string, time: Date) => {
    try {
        const response = await httpClient.patch(`${RESOURCE}/appointments/${appointmentId}/accept`, {
            selectedTime: new Date(time).toISOString()
        });
        return response.data;
    } catch (error) {
        console.log("Cannot accept appointments. ");
        throw error;
    }
}
export const rejectAppointment = async (appointmentId: string) => {
    try {
        const response = await httpClient.patch(`${RESOURCE}/appointments/${appointmentId}/reject`);
        return response.data;
    } catch (error) {
        console.log("Cannot reject appointments");
        throw error;
    }
}

export const getPropertiesNoAgent = async (): Promise<Property[]> => {
    try {
        const response = await httpClient.get(`${RESOURCE}/properties/no-agent`);
        return response.data.data;
    } catch (error) {
        console.log("Cannot get properties with no agent");
        throw error
    }
}

export const requestJoinProperty = async (propertyId: string, owner_id: string) => {
    try {
        const response = await httpClient.post(`${RESOURCE}/properties/${propertyId}/request-manage`, {
            owner_id
        })
        return response.data;
    } catch (error) {
        console.log("Cannot request to join this property");
        throw error;
    }
}
export const cancelRequestJoinProperty = async (assignmentId: string) => {
    try {
        const response = await httpClient.patch(`${RESOURCE}/assignments/${assignmentId}/cancel`);
        return response.data;
    } catch (error) {
        console.log("Cannot cancel request to join this property");
        throw error;
    }
}
