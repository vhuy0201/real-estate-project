import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/storage";
import AdminDashboard from "../components/admin/AdminDashboard";
import DataTable from "../components/admin/UserList";

import UserDetails from "../components/admin/UserDetails";
import UpdateUser from "../components/admin/userInfor/UpdateUser";
import BlockUser from "../components/admin/userInfor/BlockUser";
import AdminTaxonomiesPage from "../pages/AdminTaxonomiesPage";
import ListProperties from "../components/admin/manageProperties/ListProperties";
import ViewDetailProperties from "../components/admin/manageProperties/ViewDetailProperties";
import HideProperties from "../components/admin/manageProperties/HideProperties";
import ContractsList from "../components/admin/manageContracts/ContractsList";
import DealsList from "../components/admin/manageDeals/DealsList";
import PaymentsList from "../components/admin/managePayments/PaymentsList";
import HomeList from "../components/admin/HomeList";
import DealDetail from "../components/admin/manageDeals/DealDetail";
import PaymentDetail from "../components/admin/managePayments/PaymentDetail";
import ReviewList from "../components/admin/manageReviews/ReviewList";
import { Dashboard } from "@/components/admin/Dashboard";


const AdminProtectedRoute = () => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = [
  {
    path: "/admin",
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminDashboard />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "users", element: <DataTable /> },
          { path: "users/:id", element: <UserDetails /> },
          { path: "users/edit/:id", element: <UpdateUser /> },
          { path: "users/block", element: <BlockUser userId="" /> },
          { path: "taxonomies", element: <AdminTaxonomiesPage /> },
          { index: true, element: <HomeList /> },
          { path: "properties", element: <ListProperties /> },
          {
            path: "properties/:id",
            element: <ViewDetailProperties />,
          },
          {
            path: "properties/hide",
            element: <HideProperties propertyId="" />,
          },
          {
            path: "manageProperties/:id",
            element: <ViewDetailProperties />,
          },
          {
            path: "contracts",
            element: <ContractsList />,
          },
          {
            path: "deals",
            element: <DealsList />,
          },
          {
            path: "deals/:id",
            element: <DealDetail />,
          },
          {
            path: "deals/:id",
            element: <DealDetail />,
          },
          {
            path: "deals/:id/property/:id",
            element: <ViewDetailProperties />,
          },
          {
            path: "payments",
            element: <PaymentsList />,
          },
          {
            path: "payments/:id",
            element: <PaymentDetail />,
          },
          {
            path: "reviews",
            element: <ReviewList />,
          },
        ],
      },
    ],
  },
];
