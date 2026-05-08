import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../Services/Api";
import { FaEdit, FaCheck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaIdCard } from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, title: "", message: "" });
  const fetchedRef = useRef(false);

  const showPopup = (title, message) => setPopup({ show: true, title, message });
  const closePopup = () => setPopup({ ...popup, show: false });

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadProfile = async () => {
      try {
        const res = await apiFetch("/api/v1/profile", { credentials: "include" });
        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        const userInfo = data?.data || data?.user;
        if (!userInfo) throw new Error("Invalid user");

        setUser(userInfo);
        setForm(userInfo);
        setOriginalData(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
      } catch (err) {
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCancel = () => { setForm(originalData); setEditing(false); };
  const handleUpdate = async () => {
    try {
      const res = await apiFetch("/api/v1/update/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return showPopup("⚠️ Error", data?.message || "Update failed");

      const updatedUser = data?.data || data?.user || { ...user, ...form };
      setUser(updatedUser);
      setForm(updatedUser);
      setOriginalData(updatedUser);
      setEditing(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showPopup("✅ Success", "Profile updated successfully");
    } catch (err) {
      showPopup("⚠️ Server Error", err.message || "Something went wrong");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const role = (user?.role || "").toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Cover Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{user?.firstname} {user?.lastname}</h2>
                  <p className="text-blue-100 mt-1 capitalize">{role}</p>
                </div>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2 hover:bg-white/30 transition">
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1"><FaUser className="inline mr-2" />First Name</label>
                  {editing ? (
                    <input name="firstname" value={form.firstname || ""} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.firstname || "—"}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1"><FaUser className="inline mr-2" />Last Name</label>
                  {editing ? (
                    <input name="lastname" value={form.lastname || ""} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.lastname || "—"}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1"><FaEnvelope className="inline mr-2" />Email Address</label>
                  {editing ? (
                    <input type="email" name="email" value={form.email || ""} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.email}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1"><FaPhone className="inline mr-2" />Contact Number</label>
                  {editing ? (
                    <input type="tel" name="contactno" value={form.contactno || ""} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.contactno || "—"}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1"><FaMapMarkerAlt className="inline mr-2" />Address</label>
                  {editing ? (
                    <textarea name="address" value={form.address || ""} onChange={handleChange} rows="3" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 text-lg whitespace-pre-wrap">{user?.address || "—"}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={handleCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                  <button onClick={handleUpdate} className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"><FaCheck /> Save Changes</button>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-gray-500">Role</span>
                  <span className="capitalize font-semibold text-blue-600">{role}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-mono text-gray-900">{user?.id}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900 truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      {/* Popup */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white px-6 py-5 rounded-xl shadow-lg text-center w-[300px]">
            <h2 className="text-lg font-bold mb-2">{popup.title}</h2>
            <p className="text-gray-600">{popup.message}</p>
            <button onClick={closePopup} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;