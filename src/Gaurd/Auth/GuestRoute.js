import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;

  // 🔐 Safely parse user
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("Invalid user data in localStorage");
    localStorage.removeItem("user");
  }

  // 🟢 CASE 1: No token → allow guest pages (login/register)
  if (!token) {
    return children;
  }

  // 🔴 CASE 2: Token exists but user missing → force login
  if (token && !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // 🧠 Normalize role safely
  const role = (user?.role || "").toLowerCase().trim();

  // 🟣 CASE 3: Role-based redirect
  if (role === "admin") {
    return <Navigate to="/home" replace />;
  }

  if (role === "user") {
    return <Navigate to="/home" replace />;
  }

  // ❌ CASE 4: Unknown role → reset session safely
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return <Navigate to="/login" replace />;
}