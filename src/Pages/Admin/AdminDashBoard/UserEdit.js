import React, { useState } from "react";
import { apiFetch } from "../../../Services/Api";
import { toast } from "react-toastify";

function UserEdit({ user, onClose, reloadUsers }) {

  const [formData, setFormData] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    email: user.email || "",
    contactno: user.contactno || "",
    address: user.address || "",
    role: user.role || ""
  });

  const [loading, setLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // UPDATE USER
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await apiFetch(
        `/api/v1/admin/users/${user.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );

      const data = await res.json();

      // ERROR CHECK
      if (!res.ok) {

        throw new Error(
          data?.message ||
          "Failed to update user"
        );
      }

      // SUCCESS MESSAGE
      toast.success(
        "User Updated Successfully"
      );

      // RELOAD TABLE
      reloadUsers();

      // CLOSE MODAL
      onClose();

    } catch (err) {

      console.log(err);

      // ERROR MESSAGE
      toast.error(
        err.message || "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">

      {/* MODAL */}

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar">

        {/* HEADER */}

        <div className="flex justify-between items-center border-b p-5">

          <h2 className="text-2xl font-bold text-gray-800">
            Edit User
          </h2>

          {/* CLOSE BUTTON */}

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold"
          >
            ✕
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >

          {/* FIRST NAME */}

          <div>

            <label className="block mb-2 font-semibold text-gray-700">
              First Name
            </label>

            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

          </div>

          {/* LAST NAME */}

          <div>

            <label className="block mb-2 font-semibold text-gray-700">
              Last Name
            </label>

            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

          </div>

          {/* EMAIL */}

          <div>

            <label className="block mb-2 font-semibold text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

          </div>

          {/* PHONE */}

          <div>

            <label className="block mb-2 font-semibold text-gray-700">
              Phone
            </label>

            <input
              type="text"
              name="contactno"
              value={formData.contactno}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

          </div>

          {/* ADDRESS */}

          <div>

            <label className="block mb-2 font-semibold text-gray-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
              rows="3"
              className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

          </div>

          {/* ROLE */}

          <div>

            <label className="block mb-2 font-semibold text-gray-700">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >

              <option value="employee">
                Employee
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="admin">
                Admin
              </option>

            </select>

          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 pt-4">

            {/* CANCEL */}

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
            >
              Cancel
            </button>

            {/* UPDATE */}

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >

              {loading
                ? "Updating..."
                : "Update"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default UserEdit;