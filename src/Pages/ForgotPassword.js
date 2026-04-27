import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../Assets/bg-img.jpg";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    password: "",
  });

  const [success, setSuccess] = useState(false);

  // 🔥 loading states
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const BASE = "http://localhost:8080";

  // ================= SEND OTP =================
  async function sendOtp(retry = 0) {
    if (otpLoading) return;

    if (!email.trim()) {
      setErrors((p) => ({ ...p, email: "Email or Phone required"}));
      return;
    }

    try {
      setOtpLoading(true);

      const res = await fetch(`${BASE}/api/v1/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStep(2);
      setTimer(59);
      setCanResend(false);
      setErrors({ email: "", otp: "", password: "" });

    } catch (err) {
      console.log("OTP ERROR:", err);

      // 🔁 retry max 2 times
      if (retry < 2) {
        await new Promise((r) => setTimeout(r, 1000));
        return sendOtp(retry + 1);
      }

      setErrors((p) => ({ ...p, email: "Failed to send OTP" }));

    } finally {
      setOtpLoading(false);
    }
  }

  // ================= VERIFY OTP =================
  async function verifyOtp() {
    if (verifyLoading) return;

    if (!otp.trim()) {
      setErrors((p) => ({ ...p, otp: "OTP required" }));
      return;
    }

    try {
      setVerifyLoading(true);

      const res = await fetch(`${BASE}/api/v1/verify-forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((p) => ({
          ...p,
          otp: data.message || "Wrong OTP",
        }));
        return;
      }

      setStep(3);

    } catch {
      setErrors((p) => ({ ...p, otp: "Server error ❌" }));
    } finally {
      setVerifyLoading(false);
    }
  }

  // ================= RESET PASSWORD =================
  async function resetPassword() {
    if (resetLoading) return;

    if (!newPassword.trim()) {
      setErrors((p) => ({
        ...p,
        password: "Enter new password",
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors((p) => ({
        ...p,
        password: "Passwords do not match",
      }));
      return;
    }

    try {
      setResetLoading(true);

      const res = await fetch(`${BASE}/api/v1/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((p) => ({
          ...p,
          password: data.message || "Reset failed",
        }));
        return;
      }

      setSuccess(true);

    } catch {
      setErrors((p) => ({
        ...p,
        password: "Server error ❌",
      }));
    } finally {
      setResetLoading(false);
    }
  }

  // ================= TIMER =================
  useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, step]);

  // ================= REDIRECT =================
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        navigate("/login"); // ✅ go back to login
      }, 1200);

      return () => clearTimeout(t);
    }
  }, [success, navigate]);

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 relative">

        <h2 className="text-2xl font-bold text-center mb-5">
          Reset Password 🔐
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label className="text-sm"> Email or Phone </label>
            <input
              placeholder="Email or Phone"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: "" }));
              }}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mb-2">{errors.email}</p>
            )}

            <button
              onClick={() => sendOtp()}
              disabled={otpLoading}
              className={`w-full py-2 rounded-xl text-white ${
                otpLoading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {otpLoading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
             <label className="text-sm"> Otp </label>
            <input
              placeholder="Enter OTP"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrors((p) => ({ ...p, otp: "" }));
              }}
            />

            {errors.otp && (
              <p className="text-red-500 text-sm mb-2">{errors.otp}</p>
            )}

            <div className="flex justify-between text-sm mb-3">
              <span>{timer > 0 ? `00:${timer}` : ""}</span>

              {canResend && (
                <button
                  onClick={() => sendOtp()}
                  className="text-blue-600"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={verifyOtp}
              disabled={verifyLoading}
              className={`w-full py-2 rounded-xl text-white ${
                verifyLoading ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {verifyLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
           <label className="text-sm">New Password</label>
            <input
              type="password"
              placeholder="New Password"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
             <label className="text-sm"> Confirm password </label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mb-2">{errors.password}</p>
            )}

            <button
              onClick={resetPassword}
              disabled={resetLoading}
              className={`w-full py-2 rounded-xl text-white ${
                resetLoading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {resetLoading ? "Updating..." : "Reset Password"}
            </button>
          </>
        )}

        {/* SUCCESS */}
        {success && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    
    {/* Popup Box */}
    <div className="bg-white/90 backdrop-blur-md px-10 py-8 rounded-2xl shadow-2xl text-center animate-fadeIn scale-95 hover:scale-100 transition-all duration-300">

      {/* Success Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-green-600 font-bold text-2xl mb-2">
        Password update
      </h2>

      {/* Subtitle */}
      <p className="text-gray-500 text-sm">
        Welcome back! Redirecting you...
      </p>

      {/* Loader bar */}
      <div className="mt-5 w-full bg-gray-200 h-1 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 animate-progress"></div>
      </div>
      </div>
      </div>
        )}

        <p className="text-center mt-4 text-sm">
          <Link to="/login" className="text-blue-600">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;