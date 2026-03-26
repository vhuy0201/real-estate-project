import type { RevenueChart, RevenueChartFilter } from "@/types/SummaryReport";
import { httpAdmin } from "@/utils/httpAdmin";
import type { SummaryReport } from "@/types/SummaryReport";
import type { topAgents } from "@/types/SummaryReport";
const RESOURCES = "/reports";

export const getReportSummary = async (): Promise<SummaryReport> => {
    try {
        const response = await httpAdmin.get(`${RESOURCES}/summary`);
        return response.data.data;
    } catch (error) {
        console.log("Cannot get report summary");
        throw error;
    }
}

export const getTopAgents = async (): Promise<topAgents> => {
    try {
        const response = await httpAdmin.get(`${RESOURCES}/top-agents`);
        return response.data.data;
    } catch (error) {
        console.log("Cannot get top agents");
        throw error;
    }
}

export const getRevenueChart = async (filter?: RevenueChartFilter): Promise<RevenueChart> => {
    try {
        const params: Record<string, any> = {};

        if (filter?.year) params.year = filter.year;
        if (filter?.month) params.month = filter.month;
        if (filter?.startDate) params.startDate = filter.startDate;
        if (filter?.endDate) params.endDate = filter.endDate;

        const response = await httpAdmin.get(`${RESOURCES}/revenue-chart`, { params });
        return response.data.data;
    } catch (error) {
        console.log("Cannot get revenue charts");
        throw error;
    }
}