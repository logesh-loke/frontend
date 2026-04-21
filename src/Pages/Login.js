import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [mode, setMode] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

  // ❌ error popup
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // ❌ field error
  const [fieldError, setFieldError] = useState("");

  // ✅ success popup
  const [successPopup, setSuccessPopup] = useState(false);

  // 🔔 toast
  function showToast(msg) {
    setMessage(msg);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  }

  // ⏱ success popup auto close
  useEffect(() => {
    if (successPopup) {
      const timer = setTimeout(() => {
        setSuccessPopup(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successPopup]);

  // 🔍 VERIFY USER (AUTO SEND OTP)
  async function verifyOtp() {
    if (!identifier) {
      setFieldError("Email or Phone is required");
      return;
    }

    setFieldError("");

    try {
      const res = await fetch("api/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);

        // ✅ AUTO SEND OTP (NO BUTTON)
        await fetch("api/v1/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier }),
        });

        showToast("OTP sent successfully ✅");
      } else {
        showToast(data.message || "User not found ❌");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error ❌");
    }
  }

  // 🔐 OTP LOGIN VERIFY
  async function verifyOtpLogin() {
    if (!otp) {
      setFieldError("OTP is required");
      return;
    }

    setFieldError("");

    try {
      const res = await fetch("api/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setSuccessPopup(true);
      } else {
        showToast(data.message || "Invalid OTP ❌");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error ❌");
    }
  }

  // 🔐 PASSWORD LOGIN
  async function passwordLogin() {
    if (!identifier) {
      setFieldError("Email or Phone is required");
      return;
    }

    // if (!password) {
    //   setFieldError("Password is required");
    //   return;
    // }

    setFieldError("");

    try {
      const res = await fetch("api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setSuccessPopup(true);
      } else {
        showToast(data.message || "Login failed ❌");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error ❌");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">

        <h2 className="text-2xl font-bold text-center mb-4">
          Login
        </h2>

        {/* TOGGLE */}
        <div className="flex mb-4">
          <button
            onClick={() => setMode("password")}
            className={`w-1/2 p-2 ${mode === "password" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Password
          </button>

          <button
            onClick={() => setMode("otp")}
            className={`w-1/2 p-2 ${mode === "otp" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            OTP
          </button>
        </div>

        {/* IDENTIFIER */}
        <label className="text-sm font-semibold ml-1">
          Email or Phone
        </label>

        <input
          className="border rounded-xl px-4 py-2 w-full mb-1"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setFieldError("");
          }}
          placeholder="Email or Phone"
        />

        {/* FIELD ERROR */}
        {fieldError && (
          <p className="text-red-500 text-sm mb-2 ml-1">
            {fieldError}
          </p>
        )}

        {/* PASSWORD LOGIN */}
        {mode === "password" && (
          <>
            <label className="text-sm font-semibold ml-1">
              Password
            </label>

            <input
              type="password"
              className="border rounded-xl px-4 py-2 w-full mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            <button
              onClick={passwordLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              Login
            </button>
          </>
        )}

        {/* OTP LOGIN */}
        {mode === "otp" && (
          <>
            {step === 1 && (
              <button
                onClick={verifyOtp}
                className="w-full bg-green-600 text-white py-2 rounded-xl mb-2"
              >
                Verify User 
              </button>
            )}

            {step === 2 && (
              <>
                <label className="text-sm font-semibold ml-1">
                  OTP
                </label>

                <input
                  className="border rounded-xl px-4 py-2 w-full mb-3"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />

                <button
                  onClick={verifyOtpLogin}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl"
                >
                  Verify OTP & Login
                </button>
              </>
            )}
          </>
        )}

        <p className="text-sm mt-3 text-center font-semibold">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </div>

      {/* ❌ ERROR POPUP */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

          <div className="bg-white w-80 p-6 rounded-2xl shadow-2xl text-center animate-scaleIn">

            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                <span className="text-2xl">❌</span>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-red-600">
              {message}
            </h2>

          </div>
        </div>
      )}

      {/* ✅ SUCCESS POPUP */}
      {successPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

          <div className="bg-white w-80 p-6 rounded-2xl shadow-2xl text-center animate-scaleIn">

            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-green-600">
              Login Successful
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Welcome back 👋
            </p>

          </div>
        </div>
      )}

    </div>
  );
}

export default Login;