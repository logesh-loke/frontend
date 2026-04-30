import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Pages/ForgotPassword";

import ProtectedRoute from "./Gaurd/Auth/ProtectedRoute";
import GuestRoute from "./Gaurd/Auth/GuestRoute";
import OtpLogin from "./Pages/OtpLogin";
import AdminProfile from "./Pages/Admin/AdminProfile";
import Unauthorized from "./Gaurd/Auth/Unauthorized";

export default function App() {
  return (
    <Routes>

      {/* 🔓 Guest Routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route
        path="/forgotpassword"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      {/* 🔒 Protected Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/otp-login"
        element={
        <GuestRoute>
      <OtpLogin/>
      </GuestRoute>
      }
      />

       <Route
        path="/admin-profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

    <Route path="/unauthorized" element={<Unauthorized />} />
      {/* ✅ Default redirect (FIXED) */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ❌ fallback removed */}
    </Routes>
  );
}