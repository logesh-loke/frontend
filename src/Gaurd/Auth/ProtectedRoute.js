import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/profile", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        console.log("AUTH CHECK:", res.status, data);

        // ✅ Strong validation
        if (res.ok && (data.success || data.user || data.data)) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }

      } catch (err) {
        console.log("AUTH ERROR:", err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // ⏳ Better loader
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  // 🔐 Final decision
  return isAuth ? children : <Navigate to="/login" replace />;
}