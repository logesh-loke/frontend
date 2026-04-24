import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/profile", {
          credentials: "include",
        });

        if (res.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return <h3>Checking auth...</h3>;

  return isAuth ? children : <Navigate to="/login" replace />;
}