import SearchPage from "../pages/SearchPage/SearchPage";
import BuyPage from "../pages/SearchPage/BuyPage";
import RentPage from "../pages/SearchPage/RentPage";
import { ProfileLayout } from "../pages/Profile/ProfileLayout";
import { PersonalInfo } from "../pages/Profile/PersonalInfo";
import { ChangePassword } from "../pages/Profile/ChangePassword";
import PropertyDetailUser from "../pages/PropertyDetail";
import MyPropertiesPage from "../pages/MyPropertiesPage";
import BuyerMyPropertiesPage from "../pages/Buyer/BuyerMyPropertiesPage";
import CreateOfferPage from "../pages/Offer/CreateOfferPage";
import OfferHistoryPage from "../pages/Offer/OfferHistoryPage";
import CancelOfferPage from "../pages/Offer/CancelOfferPage";

import ListAppointment from "../components/Buyer/Appointment/ListAppointment";
import FavoritePage from "@/pages/Favorite/FavoritePage";
import PropertiesComparePage from "@/pages/Compare/PropertiesComparePage";
import DealListPageBuyer from "../pages/DealContract/DealListPageBuyer";
import DealContractPageBuyer from "../pages/DealContract/DealContractPageBuyer";

import PaymentPage from "../pages/Payment/PaymentPage";
import PaymentListBuyer from "../pages/Payment/PaymentListBuyer";

export const BuyerRoute = [
    {
        path: "/buy",
        element: <BuyPage />
    },
    {
        path: "/rent",
        element: <RentPage />
    },
    {
        path: "/search",
        element: <SearchPage />
    },
    {
        path: "/property/detail/:id",
        element: <PropertyDetailUser />
    },
    {
        path: "/buyer/deals/list",
        element: <DealListPageBuyer />
    },
    {
        path: "/buyer/contracts/deals/:dealId",
        element: <DealContractPageBuyer />
    },
    {
        path: "/profile",
        element: <ProfileLayout />,
        children: [
            {
                index: true,
                element: <PersonalInfo />,
            },
            {
                path: "info",
                element: <PersonalInfo />,
            },
            {
                path: "change-password",
                element: <ChangePassword />,
            },
        ],
    },
    {
        path: "/dwello/myProperties",
        element: <BuyerMyPropertiesPage />,
    },
    {
        path: "/my-properties",
        element: <MyPropertiesPage />,
    },
    {
        path: "/favorites",
        element: <FavoritePage />
    },
    {
        path: "/compare/:ids",
        element: <PropertiesComparePage />
    },
    {
        path: "/buyer/offer",
        element: <OfferHistoryPage />,
    },
    {
        path: "/buyer/offer/create/:id",
        element: <CreateOfferPage />,
    },
    {
        path: "/buyer/offer/:id/cancel",
        element: <CancelOfferPage />,
    },
    {
        path: "dwello/appointments",
        element: <ListAppointment />
    },
    {
        path: "/favorites",
        element: <FavoritePage />
    },
    {
        path: "/deals/:dealId/payment",
        element: <PaymentPage />,
    },
    {
        path: "/buyer/listPayments",
        element: <PaymentListBuyer />,
    }
];
