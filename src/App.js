import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Pages/ForgotPassword";
import OtpLogin from "./Pages/OtpLogin";
import AttendanceDashboard from "./Pages/Dashboard/AttendanceDashboard";

import { Home } from "./Pages/Home/Home";
// import AdminProfile from "./Pages/Admin/AdminProfile";

import ProtectedRoute from "./Gaurd/Auth/ProtectedRoute";
import GuestRoute from "./Gaurd/Auth/GuestRoute";
import Unauthorized from "./Gaurd/Auth/Unauthorized";

import Layout from "./Components/Layout";
import AdminDashboard from "./Pages/Admin/AdminDashBoard/AdminDashboard";
import AdminProfile from "./Pages/Admin/AdminProfile";
import AdminUserAttendance from "./Components/Admin/UserAttendance";
import AdminMonthlyAttendance from "./Pages/Admin/AdminDashBoard/MonthlyAttendance";

export default function App() {
  return (
    <Routes>

      {/* 🔓 GUEST ROUTES */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgotpassword" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/otp-login" element={<GuestRoute><OtpLogin /></GuestRoute>} />

      {/* 🔒 USER ROUTES */}
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

      {/*  FIXED: Attendance Route */}
      <Route
        path="/attendance-history"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <AttendanceDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTE */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Attendance Route */}
      <Route
        path="/admin-user"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminUserAttendance/>
            </Layout>
          </ProtectedRoute>
        }
      />

       <Route
        path="/admin-history"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminMonthlyAttendance/>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <Navigate
            to={localStorage.getItem("token") ? "/home" : "/login"}
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen text-xl font-semibold">
            404 - Page Not Found
          </div>
        }
      />

    </Routes>
  );
}