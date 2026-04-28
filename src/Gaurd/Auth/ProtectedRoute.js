import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // If token exists → allow access
  // If not → redirect to login
  return token ? children : <Navigate to="/login" replace />;
}