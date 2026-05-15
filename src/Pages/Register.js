import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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

  const BASE = "http://localhost:8080";

  const showAlert = (title, message, icon, timer = 2000) => {
    Swal.fire({
      title: title,
      text: message,
      icon: icon,
      timer: timer,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });
  };

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
      // Show validation error alert for first error
      const firstError = Object.values(validationErrors)[0];
      showAlert("Validation Error", firstError, "error", 3000);
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
        showAlert("Registration Failed", data.message || "Registration failed ❌", "error", 3000);
        setLoading(false);
        return;
      }

      showAlert("Success!", "Registered Successfully ✅", "success", 2000);

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
        //  STORE TOKEN
        localStorage.setItem("token", loginData.accessToken);
        localStorage.setItem("user", JSON.stringify(loginData.user));

        // 3️ REDIRECT with welcome message
        Swal.fire({
          title: "Welcome!",
          text: `Hello ${form.firstname} ${form.lastname}!`,
          icon: "success",
          showConfirmButton: true,
          confirmButtonColor: "#2563eb",
          timer: 3000,
        }).then(() => {
          navigate("/profile");
        });
      } else {
        showAlert("Auto Login Failed", "Auto login failed   ", "warning", 3000);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
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
      showAlert("Server Error", "Server error ", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
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
            <label className="text-sm font-medium">First Name</label>
            <input
              placeholder="First name"
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-2 py-2 focus:outline-none focus:border-blue-500"
            />
            {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Last Name</label>
            <input
              placeholder="Last name"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              className="w-full border-2 rounded-xl px-2 py-2 focus:outline-none focus:border-blue-500"
            />
            {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-2 py-2 focus:outline-none focus:border-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            placeholder="Phone number (10 digits)"
            name="contactno"
            value={form.contactno}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-2 py-2 focus:outline-none focus:border-blue-500"
          />
          {errors.contactno && <p className="text-red-500 text-xs mt-1">{errors.contactno}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Address</label>
          <textarea
            placeholder="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="2"
            className="w-full border-2 rounded-xl px-2 py-2 focus:outline-none focus:border-blue-500"
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            placeholder="Password (min 8 characters)"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border-2 rounded-xl px-2 py-2 focus:outline-none focus:border-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-bold transition-colors ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            "Register"
          )}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;