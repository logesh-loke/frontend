import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const token = localStorage.getItem("token");

  // If user is already logged in → redirect to profile
  if (token) {
    return <Navigate to="/profile" replace />;
  }

  // If not logged in → allow access (login/register pages)
  return children;
}