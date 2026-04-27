import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    // Just check token existence - no API call needed
    setIsAuth(true);
    setLoading(false);
  }, []);

  if (loading) return <h3>Checking auth...</h3>;

  return isAuth ? children : <Navigate to="/login" replace />;
}