import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  if (token && user) {
    const role = (user.role || "").toLowerCase().trim();

    if (role === "admin") {
      return <Navigate to="/admin-profile" replace />;
    }
    if (role === "user") {
      return <Navigate to="/profile" replace />;
    }
  }

  if (token && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}