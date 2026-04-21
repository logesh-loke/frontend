import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8080/api/v1/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      console.log("API RESPONSE:", result);

      if (res.ok) {
        setUser(result.data); // ✅ FIX IS HERE
      } else {
        localStorage.removeItem("token");
        navigate("/profile");
      }
    } catch (err) {
      console.log(err);
    }
  }

  fetchProfile();
}, [navigate]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          User Profile
        </h2>

        <div className="space-y-3">

          <p><b>ID:</b> {user.id}</p>
          <p><b>First Name:</b> {user.firstname}</p>
          <p><b>Last Name:</b> {user.lastname}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Contact:</b> {user.contactno}</p>
          <p><b>Address:</b> {user.address}</p>

        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;