// src/pages/middleware/publicPage.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function LoginPage() {
    const authentication = localStorage.getItem("access_token");

    return !authentication ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
