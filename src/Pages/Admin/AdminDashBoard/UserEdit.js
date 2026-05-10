import React, { useState } from "react";
import { apiFetch } from "../../../Services/Api";
import { toast } from "react-toastify";

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
    role: user?.role || "user"
  });

  const [loading, setLoading] = useState(false);

  // ==========================
  // HANDLE INPUT CHANGE
  // ==========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ==========================
  // UPDATE USER
  // ==========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      // GET TOKEN
      const token = localStorage.getItem("token");

      // TOKEN CHECK
      if (!token) {

        toast.error("Authentication token not found");

        return;
      }

      // API CALL
      const res = await apiFetch(
        `/api/v1/admin/users/${user.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(formData)
        }
      );

      // RESPONSE DATA
      const data = await res.json();

      // ERROR CHECK
      if (!res.ok) {

        throw new Error(
          data?.message || "Failed to update user"
        );
      }

      // SUCCESS
      toast.success("User Updated Successfully");

      // RELOAD USERS
      if (reloadUsers) {
        reloadUsers();
      }

      // CLOSE MODAL
      if (onClose) {
        onClose();
      }

    } catch (err) {

      console.log(err);

      toast.error(
        err.message || "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      {/* MODAL */}

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b p-5">

          <h2 className="text-2xl font-bold text-gray-800">
            Edit User
          </h2>

          {/* CLOSE BUTTON */}

          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 transition hover:text-red-500"
          >
            ✕
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >

          {/* FIRST NAME */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              First Name
            </label>

            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

          </div>

          {/* LAST NAME */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              Last Name
            </label>

            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

          </div>

          {/* EMAIL */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

          </div>

          {/* PHONE */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              Phone Number
            </label>

            <input
              type="text"
              name="contactno"
              value={formData.contactno}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

          </div>

          {/* ADDRESS */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
              rows="3"
              className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

          </div>

          {/* ROLE */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >

              <option value="user">
                User
              </option>

              <option value="admin">
                Admin
              </option>

            </select>

          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 pt-4">

            {/* CANCEL BUTTON */}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-400 px-6 py-2 text-white transition hover:bg-gray-500"
            >
              Cancel
            </button>

            {/* UPDATE BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className={`rounded-lg px-6 py-2 text-white transition ${
                loading
                  ? "cursor-not-allowed bg-blue-300"
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