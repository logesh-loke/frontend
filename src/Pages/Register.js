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

  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // ✅ NEW

  const BASE = "http://localhost:8080";

  function showToast(msg, success = true) {
    setMessage(msg);
    setIsSuccess(success); // ✅ control icon properly
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  }

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactno") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;

      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  // VALIDATION
  const validate = () => {
    let newErrors = {};

    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstname.trim()) newErrors.firstname = "First name required";
    if (!form.lastname.trim()) newErrors.lastname = "Last name required";

    if (!emailRegex.test(form.email))
      newErrors.email = "Enter valid email";

    if (!phoneRegex.test(form.contactno))
      newErrors.contactno = "Enter valid 10-digit phone";

    if (!form.address.trim()) newErrors.address = "Address required";

    if (form.password.length < 8)
      newErrors.password = "Password must be 8+ characters";

    return newErrors;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/v1/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Registered Successfully ✅", true);

        setForm({
          firstname: "",
          lastname: "",
          email: "",
          contactno: "",
          address: "",
          password: "",
        });
      } else {
        showToast(data.message || "Registration failed ❌", false);
      }
    } catch (err) {
      showToast("Server error ❌", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-2xl space-y-1"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-semibold">First Name</label>
            <input
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-2 py-2"
            />
            {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold">Last Name</label>
            <input
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-2 py-2"
            />
            {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname}</p>}
          </div>

        </div>

        <div>
          <label className="text-sm font-semibold">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-2 py-2"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold">Contact</label>
          <input
            type="text"
            name="contactno"
            value={form.contactno}
            onChange={handleChange}
            maxLength={10}
            className="w-full border-2 rounded-xl px-2 py-2"
          />
          {errors.contactno && <p className="text-red-500 text-xs">{errors.contactno}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-2 py-2"
          />
          {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-2 py-2"
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

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-80 p-6 rounded-2xl text-center shadow-xl animate-scaleIn">

            <div className="flex justify-center mb-3">
              <div className={`w-14 h-14 flex items-center justify-center rounded-full ${
                isSuccess ? "bg-green-100" : "bg-red-100"
              }`}>
                <span className={`text-2xl font-bold ${
                  isSuccess ? "text-green-600" : "text-red-600"
                }`}>
                  {isSuccess ? "✔" : "✖"}
                </span>
              </div>
            </div>

            <h2 className="font-semibold text-lg">{message}</h2>

          </div>
        </div>
      )}

    </div>
  );
};

export default Register;