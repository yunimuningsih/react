import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import Template from "../layouts/Template";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import PrivatePage from "../pages/middleware/privatePage";
import LoginPage from "../pages/middleware/LoginPage"; // <-- tambahkan ini
import StuffsIndex from "../pages/Stuffs/Index"; // <-- tambahkan ini
import InboundIndex from "../pages/inbound/index";
import AdminRoute from "../pages/middleware/AdminRoute";
import StaffRoute from "../pages/middleware/StaffRoute";
import Lending from "../pages/Lendings/Index";
import LendingData from "../pages/Lendings/Data";


export const router = createBrowserRouter([
    {
      path: "/",
      element: <Template />,
      children: [
        { path: "/", element: <App /> },
        {
          path: "/login",
          element: <LoginPage />,
          children: [{ path: "", element: <Login /> }],
        },
        {
          path: "/dashboard",
          element: <PrivatePage />,
          children: [
            {
              path: "profile",
              element: <PrivatePage />,
            },
            { path: 'admin',
              element: <AdminRoute />,
              children: [
                { path: "stuffs", element: <StuffsIndex /> },
                { path: "inbound", element: <InboundIndex /> }
              ]
            },

            {
              path: 'staff',
              element: <StaffRoute />,
              children: [
                { path: 'lending', element: <Lending/> },
                { path: 'lending/data', element: <LendingData/> }
              ]
            }
          ]
        },
      ],
    },
  ]);
  