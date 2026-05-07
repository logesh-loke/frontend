import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../Services/Api";
import { FaEdit, FaCheck, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function AdminProfile() {
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
        const token = localStorage.getItem("token");
        const response = await apiFetch("/api/v1/admin/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unauthorized");
        const data = await response.json();
        const userInfo = data?.data || data?.user;
        if (!userInfo) throw new Error("Invalid user data");
        const role = (userInfo.role || "").toLowerCase().trim();
        if (role !== "admin") throw new Error("Access denied");
        userInfo.role = role;
        setUser(userInfo);
        setForm(userInfo);
        setOriginalData(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
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
      const token = localStorage.getItem("token");
      const response = await apiFetch("/api/v1/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) return showPopup("⚠️ Error", data?.message || "Update failed");
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
  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h2 className="text-red-500">Session expired</h2>
      <button onClick={() => navigate("/login")} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Login</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Profile</h1>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{user.firstname} {user.lastname}</h2>
              <p className="text-blue-100 mt-1">Administrator</p>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-white/20 rounded-lg flex items-center gap-2">
                <FaEdit /> Edit
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">User ID</p>
                <p className="text-gray-900 font-mono">{user.id}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-green-600 font-semibold">● Active</p>
              </div>
            </div>

            <div className="space-y-4">
              {["firstname", "lastname"].map(field => (
                <div key={field} className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1 capitalize">{field}</label>
                  {editing ? (
                    <input name={field} value={form[field] || ""} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                  ) : (
                    <p className="text-gray-900 text-lg">{user[field] || "—"}</p>
                  )}
                </div>
              ))}
              
              <div className="border-b pb-3">
                <label className="block text-sm font-medium text-gray-500 mb-1"><FaEnvelope className="inline mr-2" />Email</label>
                {editing ? (
                  <input type="email" name="email" value={form.email || ""} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                ) : (
                  <p className="text-gray-900 text-lg">{user.email}</p>
                )}
              </div>

              <div className="border-b pb-3">
                <label className="block text-sm font-medium text-gray-500 mb-1"><FaPhone className="inline mr-2" />Contact</label>
                {editing ? (
                  <input type="tel" name="contactno" value={form.contactno || ""} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                ) : (
                  <p className="text-gray-900 text-lg">{user.contactno || "—"}</p>
                )}
              </div>

              <div className="border-b pb-3">
                <label className="block text-sm font-medium text-gray-500 mb-1"><FaMapMarkerAlt className="inline mr-2" />Address</label>
                {editing ? (
                  <textarea name="address" value={form.address || ""} onChange={handleChange} rows="3" className="w-full p-2 border rounded-lg" />
                ) : (
                  <p className="text-gray-900 text-lg whitespace-pre-wrap">{user.address || "—"}</p>
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-8 flex justify-end gap-3">
                <button onClick={handleCancel} className="px-6 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleUpdate} className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"><FaCheck /> Save</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white px-6 py-5 rounded-xl text-center w-[300px]">
            <h2 className="text-lg font-bold mb-2">{popup.title}</h2>
            <p className="text-gray-600">{popup.message}</p>
            <button onClick={closePopup} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;