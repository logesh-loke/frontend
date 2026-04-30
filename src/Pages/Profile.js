import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../Services/Api";
import bg from "../Assets/bg1-img.jpg"

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token");
        }

        const response = await apiFetch("/api/v1/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        

        // ✅ FIXED: correct response check
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

        if (role !== "user") {
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

  async function logout() {
  await fetch("http://localhost:8080/api/v1/logout", {
    method: "POST",
    credentials: "include", 
  });

  // clear frontend storage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login";
}

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

  // ✅ UI
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
          User Profile 👤
        </h2>

        <div className="space-y-3 text-gray-700">
          <p><b>ID:</b> {user.id}</p>
          <p><b>First Name:</b> {user.firstname }</p>
          <p><b>Last Name:</b> {user.lastname }</p>
          <p><b>Email:</b> {user.email }</p>
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

export default Profile;