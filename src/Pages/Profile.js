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
<<<<<<< HEAD
          credentials: "include",
=======
          credentials: "include", // 🔥 IMPORTANT
>>>>>>> origin/master
        });

        const data = await res.json();

        console.log("PROFILE RESPONSE:", data);

<<<<<<< HEAD
=======
        // ✅ Accept both formats safely
>>>>>>> origin/master
        const userData = data.data || data.user;

        if (res.ok && data.success && userData) {
          setUser(userData);
        } else {
<<<<<<< HEAD
          setUser(null);
        }
      } catch (err) {
        console.log("PROFILE ERROR:", err);
        setUser(null);
=======
          navigate("/login");
        }

      } catch (err) {
        console.log("PROFILE ERROR:", err);
        navigate("/login");
>>>>>>> origin/master
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
<<<<<<< HEAD
  }, []);

  // 🔐 Logout
=======
  }, [navigate]);

  // ======================
  // 🔐 LOGOUT (COOKIE CLEAR)
  // ======================
>>>>>>> origin/master
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

<<<<<<< HEAD
  // ⏳ Loading UI
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold animate-pulse">
=======
  // ======================
  // ⏳ LOADING STATE
  // ======================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
>>>>>>> origin/master
        Loading profile...
      </div>
    );
  }

<<<<<<< HEAD
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

  // ✅ Profile UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200">

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 transition hover:shadow-3xl">

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
=======
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
>>>>>>> origin/master
        </div>

        <button
          onClick={logout}
<<<<<<< HEAD
          className="mt-6 w-full bg-red-500 hover:bg-red-600 transition text-white py-2 rounded-lg shadow-md"
=======
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg"
>>>>>>> origin/master
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Profile;