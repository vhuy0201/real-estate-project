import DealListPageAgent from "../pages/DealContract/DealListPageAgent";
import DealContractPageAgent from "../pages/DealContract/DealContractPageAgent";
import AsssignAgent from "../components/agent/AsssignAgent";
import React from "react";
import MyPropertiesPage from "../pages/MyPropertiesPage";
import AssignAgentPage from "@/components/agent/AsssignAgent";
import AgentListAppointment from "@/components/agent/AgentAppointment";
import ListPropertyNoAgent from "@/components/agent/ListPropertyNoAgent";
import PropertyDetailUser from "@/components/agent/PropertyDetail";

import OfferDetailPage from "../pages/Offer/OfferDetailPage";
import AgentOfferManagementPage from "../pages/Offer/AgentOfferManagementPage";
export const AgentRoute = [
    {
        path: "/agent",
        children: [
            { path: "properties", element: <ListPropertyNoAgent /> },
            { path: "my-properties", element: <MyPropertiesPage /> },
            { path: "my-properties/:id", element: <MyPropertiesPage /> },
            {  path: "assignments", element: <AssignAgentPage /> },
            { path: "appointments", element: <AgentListAppointment /> },
            { path: "properties/:id", element: <PropertyDetailUser /> },
            { path: "offers", element: <AgentOfferManagementPage /> },
            { path: "offers/:id", element: <OfferDetailPage /> },
            { path: "contracts/deals/:dealId", element: <DealContractPageAgent /> },
            { path: "deals/list", element: <DealListPageAgent /> }
        ],
    },
];

