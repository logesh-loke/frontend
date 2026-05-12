import React, { useState } from "react";
import { apiFetch } from "../../../Services/Api";
import Swal from "sweetalert2";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserShield,
  FaTimes,
  FaSave,
} from "react-icons/fa";

function UserEdit({ user, onClose, reloadUsers }) {
  // ==========================
  // FORM STATE
  // ==========================

  const [formData, setFormData] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    contactno: user?.contactno || "",
    address: user?.address || "",
    role: user?.role || "user",
  });

  const [loading, setLoading] = useState(false);

  // ==========================
  // HANDLE INPUT CHANGE
  // ==========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactno") {
      const numericValue = value.replace(/\D/g, "");

      if (numericValue.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // VALIDATE FORM
  // ==========================

  const validateForm = () => {
    if (!formData.firstname.trim()) {
      Swal.fire({
        icon: "error",
        title: "First name is required",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
      return false;
    }

    if (!formData.lastname.trim()) {
      Swal.fire({
        icon: "error",
        title: "Last name is required",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "error",
        title: "Enter valid email",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
      return false;
    }

    if (formData.contactno.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Phone number must be 10 digits",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
      return false;
    }

    return true;
  };

  // ==========================
  // UPDATE USER
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await Swal.fire({
      title: "Update User?",
      text: "Do you want to save changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Update",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await apiFetch(`/api/v1/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      Swal.fire({
        icon: "success",
        title: "User Updated Successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      reloadUsers && reloadUsers();

      setTimeout(() => {
        onClose && onClose();
      }, 1200);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-fadeIn">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Edit User</h2>
              <p className="mt-1 text-sm text-blue-100">
                Update employee information
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 transition hover:bg-red-500"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* FIRST NAME */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaUser className="text-blue-500" />
                First Name
              </label>

              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* LAST NAME */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaUser className="text-blue-500" />
                Last Name
              </label>

              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaEnvelope className="text-pink-500" />
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 transition focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaPhone className="text-green-500" />
                Phone Number
              </label>

              <input
                type="tel"
                name="contactno"
                value={formData.contactno}
                onChange={handleChange}
                placeholder="10-digit phone number"
                maxLength="10"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100"
              />
            </div>

            {/* ROLE */}
            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaUserShield className="text-purple-500" />
                User Role
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 transition focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* ADDRESS */}
            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaMapMarkerAlt className="text-red-500" />
                Address
              </label>

              <textarea
                name="address"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 p-3 transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex items-center justify-end gap-4 border-t pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition ${
                loading
                  ? "cursor-not-allowed bg-blue-300"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>

                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Update User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEdit;