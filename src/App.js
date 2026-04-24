import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";

<<<<<<< HEAD
import ProtectedRoute from "./Gaurd/Auth/ProtectedRoute";
import GuestRoute from "./Gaurd/Auth/GuestRoute";
import ForgotPassword from "./Pages/ForgotPassword";

=======
>>>>>>> origin/master
export default function App() {
  return (
    <Routes>

<<<<<<< HEAD
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/ForgotPassword"
        element={
          <GuestRoute>
            <ForgotPassword />
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

=======
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="*" element={<Login />} />

>>>>>>> origin/master
    </Routes>
  );
}