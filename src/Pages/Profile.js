import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Global promise to track ongoing request
let profileRequestPromise = null;

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false); // Prevent multiple fetches

  useEffect(() => {
    // Skip if already fetched
    if (hasFetched.current) {
      console.log("⏭️ Skipping duplicate fetch");
      return;
    }
    hasFetched.current = true;

    async function loadUserFromStorage() {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        navigate("/login");
        return;
      }

      // Check cache first
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
          console.log("✅ Loaded from cache");
          return;
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }

      // Use global promise to prevent duplicate requests
      if (!profileRequestPromise) {
        console.log("🚀 Making profile API request");
        profileRequestPromise = fetch("http://localhost:8080/api/v1/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const userInfo = data?.data || data?.user;
            
            if (userInfo) {
              localStorage.setItem("user", JSON.stringify(userInfo));
              return userInfo;
            }
            throw new Error("No user data");
          })
          .finally(() => {
            // Reset after 100ms to allow for future refetches if needed
            setTimeout(() => {
              profileRequestPromise = null;
            }, 100);
          });
      } else {
        console.log("♻️ Reusing existing profile request");
      }

      try {
        const userInfo = await profileRequestPromise;
        setUser(userInfo);
      } catch (error) {
        console.error("Profile fetch failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    profileRequestPromise = null; // Reset global promise
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-500">Session expired</h2>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          User Profile 👤
        </h2>

        <div className="space-y-3 text-gray-700">
          <p><b>ID:</b> {user.id || user._id || "-"}</p>
          <p><b>First Name:</b> {user.firstname || user.firstName || "-"}</p>
          <p><b>Last Name:</b> {user.lastname || user.lastName || "-"}</p>
          <p><b>Email:</b> {user.email || "-"}</p>
          <p><b>Contact:</b> {user.contactno || user.phone || "-"}</p>
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