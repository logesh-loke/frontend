import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setIsAuth(res.ok);
      } catch (err) {
        console.log("GuestRoute error:", err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return <h3>Loading...</h3>;

  return isAuth ? <Navigate to="/profile" replace /> : children;
}