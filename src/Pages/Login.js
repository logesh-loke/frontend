import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

  // ❌ popup
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // ✅ errors
  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
    otp: ""
  });

  // ✅ success
  const [successPopup, setSuccessPopup] = useState(false);

  // ⏱ timer
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  // 🔔 toast
  function showToast(msg) {
    setMessage(msg);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, );
  }

  // ⏱ success + redirect
  useEffect(() => {
    if (successPopup) {
      const timer = setTimeout(() => {
        setSuccessPopup(false);
        navigate("/dashboard"); // 🚀 redirect
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successPopup, navigate]);

  // ⏱ OTP countdown
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

  // 🔍 SEND OTP
  async function verifyOtp() {
    let newErrors = { identifier: "" };

    if (!identifier) {
      newErrors.identifier = "Email or Phone is required";
      setErrors(newErrors);
      return;
    }

    setErrors({ ...errors, identifier: "" });

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
        showToast("OTP sent successfully ✅");
      } else {
        showToast(data.message || "User not found ❌");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error ❌");
    }
  }

  // 🔁 RESEND OTP
  async function resendOtp() {
    try {
      const res = await fetch("http://localhost:8080/api/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (res.ok) {
        setTimer(59);
        setCanResend(false);
        showToast("OTP resent 🔁");
      } else {
        showToast(data.message || "Failed ❌");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error ❌");
    }
  }

  // 🔐 VERIFY OTP LOGIN
  async function verifyOtpLogin() {
    let newErrors = { otp: "" };

    if (!otp) {
      newErrors.otp = "OTP is required";
      setErrors(newErrors);
      return;
    }

    setErrors({ ...errors, otp: "" });

    try {
      const res = await fetch("http://localhost:8080/api/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
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
    let newErrors = { identifier: "", password: "" };

    if (!identifier) newErrors.identifier = "Email or Phone Required";
    if (!password) newErrors.password = "Password Required";

    if (newErrors.identifier || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({ identifier: "", password: "" });

    try {
      const res = await fetch("http://localhost:8080/api/v1/login", {
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

    <div className="bg-white p-8 rounded-2xl shadow-lg w-96 relative">

      <h2 className="text-2xl font-bold text-center mb-4">
        Login
      </h2>

      {/* TOGGLE */}
      <div className="flex mb-4 rounded-xl overflow-hidden">
        <button
          onClick={() => setMode("password")}
          className={`w-1/2 p-2 ${mode==="password" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Password
        </button>

        <button
          onClick={() => setMode("otp")}
          className={`w-1/2 p-2 ${mode==="otp" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          OTP
        </button>
      </div>

      {/* IDENTIFIER */}
      <label className="text-sm font-semibold ml-1">
        Email or Phone
      </label>

      <input
        className={`border rounded-xl px-4 py-2 w-full mb-1 ${errors.identifier?"border-red-500":""}`}
        value={identifier}
        onChange={(e)=>{
          setIdentifier(e.target.value);
          setErrors({...errors,identifier:""});
        }}
        placeholder="Enter email or phone"
      />

      {errors.identifier && (
        <p className="text-red-500 text-sm mb-2 ml-1">
          {errors.identifier}
        </p>
      )}

      {/* PASSWORD LOGIN */}
      {mode==="password" && (
        <>
          <label className="text-sm font-semibold ml-1">
            Password
          </label>

          <input
            type="password"
            className={`border rounded-xl px-4 py-2 w-full mb-1 ${errors.password?"border-red-500":""}`}
            value={password}
            onChange={(e)=>{
              setPassword(e.target.value);
              setErrors({...errors,password:""});
            }}
            placeholder="Enter password"
          />

          {errors.password && (
            <p className="text-red-500 text-sm mb-2 ml-1">
              {errors.password}
            </p>
          )}

          <button
            onClick={passwordLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-xl mt-2 hover:bg-blue-700 transition"
          >
            Login
          </button>
        </>
      )}

      {/* OTP LOGIN */}
      {mode==="otp" && (
        <>
          {step===1 && (
            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded-xl mb-2 hover:bg-green-700 transition"
            >
              Send OTP
            </button>
          )}

          {step===2 && (
            <>
              <label className="text-sm font-semibold ml-1">
                OTP
              </label>

              <input
                className={`border rounded-xl px-4 py-2 w-full mb-1 ${errors.otp?"border-red-500":""}`}
                value={otp}
                onChange={(e)=>{
                  setOtp(e.target.value);
                  setErrors({...errors,otp:""});
                }}
                placeholder="Enter OTP"
              />

              {errors.otp && (
                <p className="text-red-500 text-sm mb-2 ml-1">
                  {errors.otp}
                </p>
              )}

              <button
                onClick={verifyOtpLogin}
                disabled={!otp}
                className="w-full bg-blue-600 text-white py-2 rounded-xl mt-2 disabled:bg-gray-400 hover:bg-blue-700 transition"
              >
                Verify OTP & Login
              </button>

              {/* TIMER */}
              <div className="flex justify-between mt-2 text-sm">
                {!canResend ? (
                  <p className="text-gray-500">
                    Resend in {timer}s
                  </p>
                ) : (
                  <button
                    onClick={resendOtp}
                    className="text-blue-600 font-semibold"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}

      <p className="text-sm mt-3 text-center">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-500 font-semibold">
          Register
        </Link>
      </p>

      {/* ❌ ERROR POPUP (inside card) */}
      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
          
          <div className="bg-white px-6 py-5 rounded-2xl shadow-xl text-center animate-pop w-64">
            
            {/* ❌ ICON */}
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
                <span className="text-red-600 text-2xl font-bold">✖</span>
              </div>
            </div>
            
            {/* MESSAGE */}
            <p className="text-red-600 font-semibold">
              {message}
            </p>
            
          </div>
            
        </div>
      )}

      {/* ✅ SUCCESS POPUP (inside card with animation) */}
     {/* ✅ SUCCESS POPUP */}
      {successPopup && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
          <div className="bg-white px-6 py-5 rounded-2xl shadow-xl text-center animate-pop w-64">
      
            {/* ✔️ ICON */}
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100">
                <span className="text-green-600 text-2xl font-bold">✔</span>
              </div>
            </div>
      
            {/* MESSAGE */}
            <p className="text-green-600 font-bold text-lg">
              Login Successful
            </p>
      
          </div>
        </div>
      )}
    </div>
  </div>
);
}

export default Login;