import SellerProperties from "../components/seller/SellerProperties";
import ListAgent from "../components/seller/ListAgent";
import CreatePropertyPage from "../pages/SellerPage/CreateProperty/CreatePropertyPage";
import PropertyDetails from "../components/seller/PropertiesDetail";


import MyPropertiesPage from "../pages/MyPropertiesPage";
import OfferDetailPage from "../pages/Offer/OfferDetailPage";
import SellerOfferManagementPage from "../pages/Offer/SellerOfferManagementPage";

import DealListPageSeller from "../pages/DealContract/DealListPageSeller";
import DealContractPageSeller from "../pages/DealContract/DealContractPageSeller";
import ListRequestJoin from "@/components/seller/ListRequestJoin";
export const SellerRoute = [
    {
        path: "/seller/properties", element: <SellerProperties />
    },
    {
        path: "/seller/properties/:id/agents", element: <ListAgent />
    },
    {
        path: "/seller/properties/:id", element: <PropertyDetails />
    },
    {
        path: "/seller/create", element: <CreatePropertyPage />
    },
    {
        path: "/seller/my-properties", element: <MyPropertiesPage />
    },
    {
        path: "/seller/my-properties/:id", element: <MyPropertiesPage />
    },
    {
        path: "/notifications/properties/:id", element: <PropertyDetails />,
    },
    {
        path: "/seller/offers", element: <SellerOfferManagementPage />
    },
    {
        path: "/seller/offers/:id", element: <OfferDetailPage />
    },
    {
        path: "/seller/deals/list", element: <DealListPageSeller />
    },
    {
        path: "/seller/contracts/deals/:dealId", element: <DealContractPageSeller />
    },
    {
        path: "/seller/request-join", element: <ListRequestJoin />
    }

    
];
