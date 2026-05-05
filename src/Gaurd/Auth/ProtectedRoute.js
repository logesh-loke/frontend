import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");

  let user = null;

  // 🔐 Safe user parsing
  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Invalid user data");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // 🚫 Not logged in
  if (!token || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // 🧠 Normalize role safely
  const role = (user?.role || "").toLowerCase().trim();

  // 🔒 Role-based access control
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}