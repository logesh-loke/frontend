import React from "react";
import {Routes,Route,Navigate} from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Pages/ForgotPassword";
import OtpLogin from "./Pages/OtpLogin";

import AttendanceDashboard from "./Pages/Dashboard/AttendanceDashboard";

import { Home } from "./Pages/Home/Home";

import ProtectedRoute from "./Gaurd/Auth/ProtectedRoute";
import GuestRoute from "./Gaurd/Auth/GuestRoute";
import Unauthorized from "./Gaurd/Auth/Unauthorized";

import Layout from "./Components/Layout";

import AdminProfile from "./Pages/Admin/AdminProfile";
import AdminUserAttendance from "./Components/Admin/UserAttendance";
import AdminAllAttendance from "./Pages/Admin/AdminDashBoard/MonthlyAttendance";
import UserProfile from "./Pages/Admin/AdminDashBoard/UserProfile";

import "react-toastify/dist/ReactToastify.css";

import {
  ToastContainer
} from "react-toastify";

export default function App() {

  // AUTH DATA
  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role
    ?.toLowerCase()
    ?.trim();

  // DEFAULT REDIRECT
  const getDefaultRoute = () => {

    // NO TOKEN
    if (!token) {
      return "/login";
    }

    // ADMIN
    if (role === "admin") {
      return "/user-profile";
    }

    // USER
    if (role === "user") {
      return "/home";
    }

    // FALLBACK
    return "/login";
  };

  return (

    <>
      {/* TOAST */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        toastStyle={{
          marginTop: "45vh"
        }}/>

      {/* ROUTES */}
      <Routes>
        {/* GUEST ROUTES*/}

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }/>

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }/>

        <Route
          path="/forgotpassword"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }/>

        <Route
          path="/otp-login"
          element={
            <GuestRoute>
              <OtpLogin />
            </GuestRoute>
          }/>

        {/*USER ROUTES*/}

        <Route
          path="/home"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }/>

        <Route
          path="/attendance-history"
          element={
            <ProtectedRoute
              allowedRoles={["user"]} >
              <Layout>
                <AttendanceDashboard />
              </Layout>
            </ProtectedRoute>
          }/>

        {/*ADMIN ROUTE */}

        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}>
              <Layout>
                <AdminProfile />
              </Layout>
            </ProtectedRoute>
          }/>        

        <Route
          path="/admin-user"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}>
              <Layout>
                <AdminUserAttendance />
              </Layout>
            </ProtectedRoute>
          }/>

        {/* FIXED PARAM ROUTE */}
        <Route
          path="/admin-history"
          element={<ProtectedRoute
              allowedRoles={["admin"]}>
              <Layout>
                <AdminAllAttendance />
              </Layout>
            </ProtectedRoute>
          }/>

        <Route
          path="/user-profile"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}>
              <Layout>
                <UserProfile/>
              </Layout>
            </ProtectedRoute>
          }/>

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

        <Route
          path="/"
          element={
            <Navigate to={getDefaultRoute()}replace/>
          } />

        <Route
          path="*"
          element={
            <div className="flex h-screen items-center justify-center text-xl font-semibold">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
}