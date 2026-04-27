import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../Assets/bg-img.jpg";

const Register = () => {
  const navigate = useNavigate();

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
  const [isSuccess, setIsSuccess] = useState(false);

  const BASE = "http://localhost:8080";

  function showToast(msg, success = true) {
    setMessage(msg);
    setIsSuccess(success);
    setShowPopup(true);

    setTimeout(() => setShowPopup(false), 2000);
  }

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

  const validate = () => {
    let newErrors = {};

    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstname.trim()) newErrors.firstname = "First name required";
    if (!form.lastname.trim()) newErrors.lastname = "Last name required";
    if (!emailRegex.test(form.email)) newErrors.email = "Enter valid email";
    if (!phoneRegex.test(form.contactno))
      newErrors.contactno = "Enter valid 10-digit phone";
    if (!form.address.trim()) newErrors.address = "Address required";
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
      // 1️⃣ REGISTER
      const res = await fetch(`${BASE}/api/v1/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || "Registration failed ❌", false);
        setLoading(false);
        return;
      }

      showToast("Registered Successfully ✅", true);

      // 2️⃣ AUTO LOGIN
      const loginRes = await fetch(`${BASE}/api/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.email,
          password: form.password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.success) {
        // ✅ STORE TOKEN
        localStorage.setItem("token", loginData.accessToken);
        localStorage.setItem("user", JSON.stringify(loginData.user));

        // 3️⃣ REDIRECT
        setTimeout(() => {
          navigate("/profile");
        }, 800);
      } else {
        showToast("Auto login failed ❌", false);
      }

      // reset form
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        contactno: "",
        address: "",
        password: "",
      });

    } catch (err) {
      showToast("Server error ❌", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-2xl space-y-2"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm"> First Name</label>
            <input
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-2 py-2"
            />
            {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname}</p>}
          </div>

          <div>
            <label className="text-sm">Last Name</label>
            <input
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-2 py-2"
            />
            {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname}</p>}
          </div>

        </div>

        <label className="text-sm">Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border-2 rounded-xl px-2 py-2"
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

        <label className="text-sm">Phone</label>
        <input
          name="contactno"
          value={form.contactno}
          onChange={handleChange}
          className="w-full border-2 rounded-xl px-2 py-2"
        />
        {errors.contactno && <p className="text-red-500 text-xs">{errors.contactno}</p>}

        <label className="text-sm">Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border-2 rounded-xl px-2 py-2"
        />
        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}

        <label className="text-sm">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border-2 rounded-xl px-2 py-2"
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

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

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-80 p-6 rounded-2xl text-center shadow-xl">
            <div className="mb-3 text-3xl">
              {isSuccess ? "✅" : "❌"}
            </div>
            <h2 className="font-semibold text-lg">{message}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
