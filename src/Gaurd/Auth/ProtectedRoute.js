import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  //  Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  //  No user data
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  //  Allowed
  return children;
}