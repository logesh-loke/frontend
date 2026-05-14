import { Navigate } from "react-router-dom";

function GuestRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;

  // Safely parse user
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("Invalid user data in localStorage");
    localStorage.removeItem("user");
  }

  // No token → allow guest pages (login/register)
  if (!token) {
    return children;
  }

  // Token exists but user missing → force login
  if (token && !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Normalize role safely
  const role = (user?.role || "").toLowerCase().trim();

  // 3: Role-based redirect
  if (role === "admin") {
    return <Navigate to="/home" replace />;
  }

  if (role === "user") {
    return <Navigate to="/home" replace />;
  }

  //  Unknown role → reset session safely
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return <Navigate to="/login" replace />;
}

export default GuestRoute;