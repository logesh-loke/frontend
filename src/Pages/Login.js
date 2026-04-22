import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success"); // ✅ success | error
  const [showPopup, setShowPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
    otp: "",
  });

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  // 🔔 Toast
  function showToast(msg, msgType = "error") {
    setMessage(msg);
    setType(msgType);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  }

  // 🚀 Redirect after success
  useEffect(() => {
    if (successPopup) {
      const t = setTimeout(() => {
        navigate("/profile");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [successPopup, navigate]);

  // ⏱ OTP TIMER
  useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer, step]);

  // 🔐 PASSWORD LOGIN
  async function passwordLogin() {
    let newErrors = { identifier: "", password: "" };

    if (!identifier) newErrors.identifier = "Email or Phone Required";
    if (!password) newErrors.password = "Password Required";

    if (newErrors.identifier || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessPopup(true);
      } else {
        showToast(data.message || "Login failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
  }

  // 🔍 SEND OTP
  async function sendOtp() {
    if (!identifier) {
      setErrors({ ...errors, identifier: "Email or Phone required" });
      return;
    }

    setLoadingOtp(true);
    showToast("Sending OTP...", "success");

    try {
      const res = await fetch("http://localhost:8080/api/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setTimer(59);
        setCanResend(false);
        showToast("OTP sent successfully", "success");
      } else {
        showToast(data.message || "Failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    } finally {
      setLoadingOtp(false);
    }
  }

  // 🔁 RESEND OTP
  async function resendOtp() {
    setLoadingOtp(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (res.ok) {
        setTimer(59);
        setCanResend(false);
        showToast("OTP resent", "success");
      }
    } catch {
      showToast("Server error", "error");
    } finally {
      setLoadingOtp(false);
    }
  }

  // 🔐 VERIFY OTP
 async function verifyOtpLogin() {
  if (!otp) {
    setErrors({ ...errors, otp: "OTP required" });
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/v1/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ MUST for cookies
      body: JSON.stringify({ identifier, otp }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // ❌ REMOVE localStorage
      // ✅ Just trigger success
      setSuccessPopup(true);
    } else {
      showToast(data.message || "Invalid OTP", "error");
    }

  } catch {
    showToast("Server error", "error");
  }
}
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 relative">

        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "password") passwordLogin();
            else step === 1 ? sendOtp() : verifyOtpLogin();
          }}
        >

          {/* TOGGLE */}
          <div className="flex mb-4 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setMode("password")} className={`w-1/2 p-2 ${mode==="password"?"bg-blue-600 text-white":"bg-gray-200"}`}>
              Password
            </button>
            <button type="button" onClick={() => setMode("otp")} className={`w-1/2 p-2 ${mode==="otp"?"bg-blue-600 text-white":"bg-gray-200"}`}>
              OTP
            </button>
          </div>

          {/* IDENTIFIER */}
          <label className="text-sm font-semibold">Email or Phone</label>
          <input
            className={`border rounded-xl px-4 py-2 w-full mb-1 ${errors.identifier?"border-red-500":""}`}
            value={identifier}
            onChange={(e)=> {
              setIdentifier(e.target.value);
              setErrors({ ...errors, identifier: "" });
            }}
            placeholder="Enter email or phone"
          />
          {errors.identifier && <p className="text-red-500 text-xs mb-2">{errors.identifier}</p>}

          {/* PASSWORD */}
          {mode==="password" && (
            <>
              <label className="text-sm font-semibold">Password</label>
              <input
                type="password"
                className={`border rounded-xl px-4 py-2 w-full mb-1 ${errors.password?"border-red-500":""}`}
                value={password}
                onChange={(e)=> {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                }}
                placeholder="Enter password"
              />
              {errors.password && <p className="text-red-500 text-xs mb-2">{errors.password}</p>}

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl mt-2">
                Login
              </button>
            </>
          )}

          {/* OTP */}
          {mode==="otp" && (
            <>
              {step===1 && (
                <button type="submit" disabled={loadingOtp} className="w-full bg-green-600 text-white py-2 rounded-xl">
                  {loadingOtp ? "Sending..." : "Send OTP"}
                </button>
              )}

              {step===2 && (
                <>
                  <label className="text-sm font-semibold">OTP</label>
                  <input
                    className={`border rounded-xl px-4 py-2 w-full mb-1 ${errors.otp?"border-red-500":""}`}
                    value={otp}
                    onChange={(e)=> {
                      setOtp(e.target.value);
                      setErrors({ ...errors, otp: "" });
                    }}
                    placeholder="Enter OTP"
                  />
                  {errors.otp && <p className="text-red-500 text-xs mb-2">{errors.otp}</p>}

                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl mt-2">
                    Verify OTP
                  </button>

                  <p className="text-sm mt-2">
                    {!canResend ? `Resend in ${timer}s` :
                      <button type="button" onClick={resendOtp}>Resend OTP</button>}
                  </p>
                </>
              )}
            </>
          )}

        </form>

        <p className="text-sm mt-3 text-center">
          Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
        </p>

        {/* POPUP */}
        {showPopup && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white w-72 p-6 rounded-2xl text-center">

              <h2 className={`text-lg font-bold mb-2 ${
                type==="success" ? "text-green-600" : "text-red-600"
              }`}>
                {type==="success" ? "Success" : "Error"}
              </h2>

              <p className="text-gray-600">{message}</p>

            </div>
          </div>
        )}

        {/* SUCCESS */}
        {successPopup && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">

    <div className="bg-white w-72 p-6 rounded-2xl shadow-2xl text-center animate-scaleIn">

      {/* ✔ ICON */}
      <div className="flex justify-center mb-3">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100">
          <span className="text-green-600 text-2xl font-bold">✔</span>
        </div>
      </div>

      {/* ✅ LABEL */}
      <h2 className="text-lg font-bold text-green-600">
        Success
      </h2>

      {/* MESSAGE */}
      <p className="text-gray-600 mt-1">
        Login Successful
      </p>

      {/* SUB TEXT */}
      <p className="text-xs text-gray-400 mt-2">
        Redirecting to profile...
      </p>

    </div>
  </div>
)}

      </div>
    </div>
  );
}

export default Login;