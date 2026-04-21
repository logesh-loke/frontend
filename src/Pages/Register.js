import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contactno: "",
    address: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ popup state
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  function showToast(msg) {
    setMessage(msg);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // ✅ REGEX VALIDATION
  const validate = () => {
    let newErrors = {};

    const phoneRegex = /^[6-9]\d{9}$/; // Indian number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstname) newErrors.firstname = "First name required";
    if (!form.lastname) newErrors.lastname = "Last name required";

    if (!emailRegex.test(form.email))
      newErrors.email = "Enter valid email";

    if (!phoneRegex.test(form.contactno))
      newErrors.contactno = "Enter valid 10-digit phone";

    if (!form.address) newErrors.address = "Address required";

    if (form.password.length < 8)
      newErrors.password = "Password must be 8+ characters";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Registered Successfully ✅");

        setForm({
          firstname: "",
          lastname: "",
          email: "",
          contactno: "",
          address: "",
          password: "",
        });
      } else {
        showToast(data.message || "Registration failed ❌");
      }
    } catch (err) {
      showToast("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4 py-10">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-2xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* First Name */}
          <div>
            <label className="text-sm font-semibold ml-1">First Name</label>
            <input
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-4 py-2"
            />
            {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-semibold ml-1">Last Name</label>
            <input
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-4 py-2"
            />
            {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname}</p>}
          </div>

        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-semibold ml-1">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-4 py-2"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold ml-1">Contact</label>
          <input
            name="contactno"
            value={form.contactno}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-4 py-2"
          />
          {errors.contactno && <p className="text-red-500 text-xs">{errors.contactno}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-semibold ml-1">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-4 py-2"
          />
          {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-semibold ml-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-4 py-2"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-bold ${
            loading ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold">
            Login
          </Link>
        </p>

      </form>

      {/* ✅ CENTER POPUP */}
     {showPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      
        <div className="bg-white w-80 p-6 rounded-2xl text-center shadow-xl animate-pop">
        
          {/* ICON */}
          <div className="flex justify-center mb-3">
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-full ${
                message.toLowerCase().includes("success")
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <span
                className={`text-2xl font-bold ${
                  message.toLowerCase().includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message.toLowerCase().includes("success") ? "✔" : "✖"}
              </span>
            </div>
          </div>
              
          {/* MESSAGE */}
          <h2
            className={`font-semibold text-lg ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </h2>
          
        </div>
      </div>
    )}

    </div>
  );
};

export default Register;