import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadUserFromStorage() {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      // ❌ No token → redirect
      if (!token) {
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        // ✅ use cached user (fast, no API call)
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // fallback: optional API call
          fetch("http://localhost:8080/api/v1/profile", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => {
              const userInfo = data?.data || data?.user;

              if (userInfo) {
                setUser(userInfo);
                localStorage.setItem("user", JSON.stringify(userInfo));
              } else {
                localStorage.removeItem("token");
                navigate("/login");
              }
            })
            .catch(() => {
              localStorage.removeItem("token");
              navigate("/login");
            });
        }
      } catch (err) {
        console.log("Error reading user:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, [navigate]);

  // 🔐 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ⏳ Loading
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold">
        Loading profile...
      </div>
    );
  }

  // ❌ No user
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-500">
          Session expired
        </h2>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ✅ UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          User Profile 👤
        </h2>

        <div className="space-y-3 text-gray-700">
          <p><b>ID:</b> {user.id || user._id || "-"}</p>
          <p><b>First Name:</b> {user.firstname || "-"}</p>
          <p><b>Last Name:</b> {user.lastname || "-"}</p>
          <p><b>Email:</b> {user.email || "-"}</p>
          <p><b>Contact:</b> {user.contactno || "-"}</p>
          <p><b>Address:</b> {user.address || "-"}</p>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Profile;