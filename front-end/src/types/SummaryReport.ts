export type SummaryReport = {
    totalUsers: number,
    totalProperties: number,
    totalDealsCompleted: number,
    totalRevenue: number,
    totalLeads: number
}

export type topAgents = {
    agent_id: string,
    fullName: string,
    email: string,
    totalDeals: number,
    totalAgentFee: number
}

export type RevenueChart = {
    year: number,
    month?: number,
    startDate?: Date,
    endDate?: Date,
    revenueByMonth: RevenueByMonth,
    dealsByMonth: DealsByMonth
};

export type RevenueByMonth = {
    _id: { month: number },
    revenue: number
}[];

export type DealsByMonth = {
    _id: { month: number },
    totalDeals: number
}[];

// Filter types for revenue chart
export type RevenueChartFilter = {
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string
};

// Filter mode type
export type FilterMode = 'year' | 'month' | 'dateRange';
