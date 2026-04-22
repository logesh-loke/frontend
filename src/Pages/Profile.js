import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/profile", {
          method: "GET",
          credentials: "include", // 🔥 IMPORTANT
        });

        const data = await res.json();

        console.log("PROFILE RESPONSE:", data);

        // ✅ Accept both formats safely
        const userData = data.data || data.user;

        if (res.ok && data.success && userData) {
          setUser(userData);
        } else {
          navigate("/login");
        }

      } catch (err) {
        console.log("PROFILE ERROR:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);


  // 🔐 LOGOUT (COOKIE CLEAR)
  const logout = async () => {
    try {
      await fetch("http://localhost:8080/api/v1/logout", {
        method: "POST",
        credentials: "include",
      });

      navigate("/login");
    } catch (err) {
      console.log("LOGOUT ERROR:", err);
    }
  };

  // ======================
  // ⏳ LOADING STATE
  // ======================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  // ======================
  // ❌ NO USER
  // ======================
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Session expired. Please login again.
      </div>
    );
  }

  // ======================
  // ✅ PROFILE UI
  // ======================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          User Profile
        </h2>

        <div className="space-y-3">
          <p><b>ID:</b> {user.id || user._id}</p>
          <p><b>First Name:</b> {user.firstname}</p>
          <p><b>Last Name:</b> {user.lastname}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Contact:</b> {user.contactno}</p>
          <p><b>Address:</b> {user.address}</p>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Profile;