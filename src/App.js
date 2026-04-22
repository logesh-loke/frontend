import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";

import ProtectedRoute from "./Gaurd/Auth/ProtectedRoute";
import GuestRoute from "./Gaurd/Auth/GuestRoute";

export default function App() {
  return (
    <Routes>

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
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Login />} />

    </Routes>
  );
}