import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Pages/ForgotPassword";
import OtpLogin from "./Pages/OtpLogin";

import { Home } from "./Pages/Home/Home";
import AdminProfile from "./Pages/Admin/AdminProfile";

import ProtectedRoute from "./Gaurd/Auth/ProtectedRoute";
import GuestRoute from "./Gaurd/Auth/GuestRoute";
import Unauthorized from "./Gaurd/Auth/Unauthorized";

import Layout from "./Components/Layout";

export default function App() {
  return (
    <Routes>

      {/* 🔓 Guest Routes */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgotpassword" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/otp-login" element={<GuestRoute><OtpLogin /></GuestRoute>} />

      {/* 🔒 Protected Routes */}

      {/* ✅ Home (Main Dashboard) */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ✅ Profile with Layout */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ✅ Admin */}
      <Route
        path="/admin-profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 🔁 Default redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />

    </Routes>
  );
}