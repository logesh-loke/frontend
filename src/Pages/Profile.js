import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../Services/Api";
import { FaEdit, FaCheck } from "react-icons/fa";
import bg from "../Assets/bg1-img.jpg";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadProfile = async () => {
      try {
        const res = await apiFetch("/api/v1/profile", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        const userInfo = data?.data || data?.user;

        if (!userInfo) throw new Error("Invalid user");

        const role = (userInfo.role || "").toLowerCase().trim();
        if (role !== "user") throw new Error("Access denied");

        setUser(userInfo);
        setForm(userInfo);

        localStorage.setItem("user", JSON.stringify(userInfo));
      } catch (err) {
        console.error(err);
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await apiFetch("/api/v1/update/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      const updatedUser = data?.data || data?.user || data;

      if (!updatedUser) throw new Error("Invalid update response");

      setUser(updatedUser);
      setForm(updatedUser);
      setEditing(false);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated ✅");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message);
    }
  };

  async function logout() {
    await fetch("http://localhost:8080/api/v1/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.clear();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Session expired
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-[500px]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Profile 👤</h2>

          <button
            onClick={editing ? handleUpdate : () => setEditing(true)}
            className={`p-2 rounded-full ${
              editing ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            {editing ? (
              <FaCheck className="text-green-600" />
            ) : (
              <FaEdit className="text-gray-700" />
            )}
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          <div className="flex items-center gap-4">
            <label className="w-24">Id</label>
            <input
              name="id"
              value={form.id || ""}
              disabled
              className="flex-1 border p-2 rounded bg-gray-100"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-24">First Name</label>
            <input
              name="firstname"
              value={form.firstname || ""}
              onChange={handleChange}
              disabled={!editing}
              className="flex-1 border p-2 rounded"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-24">Last Name</label>
            <input
              name="lastname"
              value={form.lastname || ""}
              onChange={handleChange}
              disabled={!editing}
              className="flex-1 border p-2 rounded"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-24">Email</label>
            <input
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              disabled={!editing}
              className="flex-1 border p-2 rounded"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-24">Phone</label>
            <input
              name="contactno"
              value={form.contactno || ""}
              onChange={handleChange}
              disabled={!editing}
              className="flex-1 border p-2 rounded"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-24">Address</label>
            <input
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              disabled={!editing}
              className="flex-1 border p-2 rounded"
            />
          </div>

        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Profile;