import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../Services/Api";
import Swal from "sweetalert2";
import { FaEdit, FaCheck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaIdCard } from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // Helper function to capitalize first letter of each word
  const capitalizeName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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

        // Capitalize first and last name when loading
        if (userInfo.firstname) {
          userInfo.firstname = capitalizeName(userInfo.firstname);
        }
        if (userInfo.lastname) {
          userInfo.lastname = capitalizeName(userInfo.lastname);
        }

        setUser(userInfo);
        setForm(userInfo);
        setOriginalData(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
      } catch (err) {
        localStorage.removeItem("user");
        Swal.fire({
          title: "Session Expired",
          text: "Please login again",
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        }).then(() => {
          navigate("/login", { replace: true });
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Capitalize firstname and lastname automatically
    if (name === "firstname" || name === "lastname") {
      setForm({ ...form, [name]: capitalizeName(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Discard Changes?",
      text: "You have unsaved changes. Are you sure you want to cancel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, discard",
      cancelButtonText: "No, continue editing"
    }).then((result) => {
      if (result.isConfirmed) {
        setForm(originalData);
        setEditing(false);
        Swal.fire({
          title: "Cancelled",
          text: "Changes have been discarded",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
          toast: true,
        });
      }
    });
  };

  const handleUpdate = async () => {
    try {
      // Show loading
      Swal.fire({
        title: "Updating Profile",
        text: "Please wait...",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await apiFetch("/api/v1/update/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      const updatedUser = data?.data || data?.user || { ...user, ...form };
      
      // Capitalize names in updated user
      if (updatedUser.firstname) {
        updatedUser.firstname = capitalizeName(updatedUser.firstname);
      }
      if (updatedUser.lastname) {
        updatedUser.lastname = capitalizeName(updatedUser.lastname);
      }
      
      setUser(updatedUser);
      setForm(updatedUser);
      setOriginalData(updatedUser);
      setEditing(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });
    } catch (err) {
      Swal.fire({
        title: "Update Failed",
        text: err.message || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Try Again"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

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
                  <button 
                    onClick={() => setEditing(true)} 
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2 hover:bg-white/30 transition"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaUser className="inline mr-2" />First Name
                  </label>
                  {editing ? (
                    <input 
                      name="firstname" 
                      value={form.firstname || ""} 
                      onChange={handleChange} 
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.firstname || "—"}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaUser className="inline mr-2" />Last Name
                  </label>
                  {editing ? (
                    <input 
                      name="lastname" 
                      value={form.lastname || ""} 
                      onChange={handleChange} 
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.lastname || "—"}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaEnvelope className="inline mr-2" />Email Address
                  </label>
                  {editing ? (
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email || ""} 
                      onChange={handleChange} 
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter email"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.email}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaPhone className="inline mr-2" />Contact Number
                  </label>
                  {editing ? (
                    <input 
                      type="tel" 
                      name="contactno" 
                      value={form.contactno || ""} 
                      onChange={handleChange} 
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter contact number"
                      maxLength="10"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{user?.contactno || "—"}</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaMapMarkerAlt className="inline mr-2" />Address
                  </label>
                  {editing ? (
                    <textarea 
                      name="address" 
                      value={form.address || ""} 
                      onChange={handleChange} 
                      rows="3" 
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter address"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg whitespace-pre-wrap">{user?.address || "—"}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="mt-8 flex justify-end gap-3">
                  <button 
                    onClick={handleCancel} 
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdate} 
                    className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                  >
                    <FaCheck /> Save Changes
                  </button>
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
    </div>
  );
}

export default Profile;