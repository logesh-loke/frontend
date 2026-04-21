import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />; // ❌ not logged → login page
  }

  return children; // ✅ logged → allow
}

export default ProtectedRoute;