import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../Services/Api";
import bg from "../../Assets/bg1-img.jpg"

function AdminProfile() {
  const navigate = useNavigate(); // ✅ FIXED
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/v1/admin/profile", {
          method: "GET", // ✅ FIXED
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ FIXED
        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
const userInfo = data?.data || data?.user;

if (!userInfo) {
  throw new Error("Invalid user data");
}

// 🔐 Normalize role
const role = (userInfo.role || "").toLowerCase().trim();

if (role !== "admin") {
  throw new Error("Access denied");
}

// store normalized role
userInfo.role = role;

setUser(userInfo);
localStorage.setItem("user", JSON.stringify(userInfo));
      } catch (err) {
        console.error("❌ Error:", err);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading Admin profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-red-500">Session expired</h2>
        <button onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200"
   style={{
               backgroundImage: `url(${bg})`,
               backgroundSize: "cover",
               backgroundPosition: "center",
             }}
   >
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          Admin Profile 👤
        </h2>
        <div className="space-y-3 text-gray-700">
            <p><b>ID:</b> {user.id}</p>
            <p><b>First Name:</b> {user.firstname} </p>
            <p><b>Last Name</b>{user.lastname}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Contact:</b> {user.contactno}</p>
            <p><b>Address:</b> {user.address}</p>
        </div>

          <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminProfile;