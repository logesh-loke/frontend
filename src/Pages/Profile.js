import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../Services/Api";
import { FaEdit, FaCheck } from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // 🔥 POPUP STATE
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
  });

  const showPopup = (title, message) => {
    setPopup({ show: true, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, show: false });
  };

  // ================= LOAD PROFILE =================
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

        setUser(userInfo);
        setForm(userInfo);
        setOriginalData(userInfo);

        localStorage.setItem("user", JSON.stringify(userInfo));
      } catch (err) {
        console.error(err);
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= CANCEL =================
  const handleCancel = () => {
    setForm(originalData);
    setEditing(false);
  };

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    try {
      const res = await apiFetch("/api/v1/update/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // ❌ ERROR POPUP
      if (!res.ok) {
        showPopup("⚠️ Error", data?.message || "Update failed");
        return;
      }

      const updatedUser =
        data?.data || data?.user || { ...user, ...form };

      setUser(updatedUser);
      setForm(updatedUser);
      setOriginalData(updatedUser);
      setEditing(false);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // ✅ SUCCESS POPUP
      showPopup("✅ Success", "Profile updated successfully");

    } catch (err) {
      console.error(err);

      showPopup(
        "⚠️ Server Error",
        err.message || "Something went wrong"
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const role = (user?.role || "").toLowerCase();

  return (
    <div className="flex h-screen bg-gray-100">

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold">
            Welcome, {user?.firstname}
          </h2>

          <span className="text-sm bg-gray-200 px-3 py-1 rounded">
            {role.toUpperCase()}
          </span>
        </div>

        {/* CONTENT */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* PROFILE CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-lg col-span-2">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Profile</h3>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-gray-200 rounded flex items-center gap-2"
                >
                  <FaEdit />
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input label="First Name" name="firstname" value={form.firstname || ""} onChange={handleChange} disabled={!editing} />
              <Input label="Last Name" name="lastname" value={form.lastname || ""} onChange={handleChange} disabled={!editing} />
              <Input label="Email" name="email" value={form.email || ""} onChange={handleChange} disabled={!editing} />
              <Input label="Phone" name="contactno" value={form.contactno || ""} onChange={handleChange} disabled={!editing} />
              <Input label="Address" name="address" value={form.address || ""} onChange={handleChange} disabled={!editing} />

            </div>

            {editing && (
              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2"
                >
                  <FaCheck />
                  Save Changes
                </button>

              </div>
            )}

          </div>

          {/* SIDE PANEL */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-bold mb-4">Account Info</h3>
            <p><b>Role:</b> {role}</p>
            <p><b>ID:</b> {form.id}</p>
            <p><b>Email:</b> {form.email}</p>
          </div>

        </div>
      </div>

      {/* 🔥 POPUP UI */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white px-6 py-5 rounded-xl shadow-lg text-center w-[300px]">

            <h2 className="text-lg font-bold mb-2">{popup.title}</h2>
            <p className="text-gray-600">{popup.message}</p>

            <button
              onClick={closePopup}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
            >
              OK
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;

/* INPUT */
const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium block mb-1">{label}</label>
    <input
      {...props}
      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none"
    />
  </div>
);