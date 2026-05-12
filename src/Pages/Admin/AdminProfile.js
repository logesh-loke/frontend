import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../Services/Api";
import Swal from "sweetalert2";
import { FaEdit, FaCheck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserShield } from "react-icons/fa";

function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await apiFetch("/api/v1/admin/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        const userInfo = data?.data || data?.user;

        if (!userInfo) throw new Error("Invalid user data");

        const role = (userInfo.role || "").toLowerCase().trim();
        if (role !== "admin") throw new Error("Access denied");

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
        console.log(err);
        
        Swal.fire({
          title: "Session Expired",
          text: "Please login again",
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        }).then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
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
      setForm(prev => ({ 
        ...prev, 
        [name]: capitalizeName(value) 
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
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
      setUpdating(true);
      
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

      const token = localStorage.getItem("token");
      const userId = user?._id || user?.id;

      if (!userId) {
        Swal.fire({
          title: "Error",
          text: "User ID not found",
          icon: "error",
          confirmButtonColor: "#3085d6"
        });
        return;
      }

      const response = await apiFetch(`/api/v1/admin/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Update failed");
      }

      const updatedUser = data?.data || data?.user || { ...user, ...form };

      setUser(updatedUser);
      setForm(updatedUser);
      setOriginalData(updatedUser);
      setEditing(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Success message
      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });

    } catch (err) {
      console.log(err);
      
      Swal.fire({
        title: "Update Failed",
        text: err.message || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Try Again"
      });
    } finally {
      setUpdating(false);
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

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold text-red-500">Session Expired</h2>
        <button 
          onClick={() => navigate("/login")} 
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Login Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Admin Profile</h1>

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-3">
                  <FaUserShield size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{user.firstname} {user.lastname}</h2>
                  <p className="mt-1 text-blue-100">Administrator</p>
                </div>
              </div>
            </div>
            {!editing && (
              <button 
                onClick={() => setEditing(true)} 
                className="flex items-center gap-2 rounded-lg bg-white/20 px-5 py-2 text-white transition hover:bg-white/30"
              >
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Info Cards */}
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-5 shadow-sm">
                <p className="mb-1 text-sm text-gray-500">User ID</p>
                <p className="font-mono text-gray-800">{user._id || user.id}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-5 shadow-sm">
                <p className="mb-1 text-sm text-gray-500">Status</p>
                <p className="font-semibold text-green-600">● Active</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {[
                { label: "First Name", name: "firstname", type: "text" },
                { label: "Last Name", name: "lastname", type: "text" },
                { label: "Email", name: "email", type: "email", icon: FaEnvelope },
                { label: "Contact Number", name: "contactno", type: "tel", icon: FaPhone },
                { label: "Address", name: "address", type: "textarea", icon: FaMapMarkerAlt }
              ].map((field) => (
                <div key={field.name} className="border-b pb-4">
                  <label className="mb-2 flex items-center text-sm font-semibold text-gray-500">
                    {field.icon && <field.icon className="mr-2" />}
                    {field.label}
                  </label>
                  {editing ? (
                    field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={handleChange}
                        rows="4"
                        className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )
                  ) : (
                    <p className="whitespace-pre-wrap text-lg text-gray-900">
                      {user[field.name] || "—"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="mt-8 flex justify-end gap-4">
                <button 
                  onClick={handleCancel} 
                  className="rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate} 
                  disabled={updating} 
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaCheck /> {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;