import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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

  // 🔥 loading states
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const BASE = "http://localhost:8080";

  // ================= SEND OTP =================
  async function sendOtp(retry = 0) {
    if (otpLoading) return;

    if (!email.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Email or Phone required",
        icon: "error",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true
      });
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

      Swal.fire({
        title: "OTP Sent!",
        text: "Please check your email for OTP",
        icon: "success",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true
      });

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

      Swal.fire({
        title: "Error!",
        text: "Failed to send OTP. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true
      });
      setErrors((p) => ({ ...p, email: "Failed to send OTP" }));

    } finally {
      setOtpLoading(false);
    }
  }

  // ================= VERIFY OTP =================
  async function verifyOtp() {
    if (verifyLoading) return;

    if (!otp.trim()) {
      Swal.fire({
        title: "Error!",
        text: "OTP required",
        icon: "error",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true
      });
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
        Swal.fire({
          title: "Verification Failed!",
          text: data.message || "Wrong OTP",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "Try Again",
          position: "center",
          backdrop: true
        });
        setErrors((p) => ({
          ...p,
          otp: data.message || "Wrong OTP",
        }));
        return;
      }

      Swal.fire({
        title: "OTP Verified!",
        text: "Please set your new password",
        icon: "success",
        position: "center",
        timer: 1500,
        showConfirmButton: false,
        backdrop: true
      });

      setStep(3);

    } catch {
      Swal.fire({
        title: "Error!",
        text: "Server error. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true
      });
      setErrors((p) => ({ ...p, otp: "Server error ❌" }));
    } finally {
      setVerifyLoading(false);
    }
  }

  // ================= RESET PASSWORD =================
  async function resetPassword() {
    if (resetLoading) return;

    if (!newPassword.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Enter new password",
        icon: "error",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true
      });
      setErrors((p) => ({
        ...p,
        password: "Enter new password",
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match",
        icon: "error",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true
      });
      setErrors((p) => ({
        ...p,
        password: "Passwords do not match",
      }));
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        title: "Error!",
        text: "Password must be at least 6 characters",
        icon: "error",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true
      });
      setErrors((p) => ({
        ...p,
        password: "Password must be at least 6 characters",
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
        Swal.fire({
          title: "Reset Failed!",
          text: data.message || "Password reset failed",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "Try Again",
          position: "center",
          backdrop: true
        });
        setErrors((p) => ({
          ...p,
          password: data.message || "Reset failed",
        }));
        return;
      }

      // Show success message
      Swal.fire({
        title: "Password Reset Successfully!",
        text: "Redirecting to login page...",
        icon: "success",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true,
        customClass: {
          popup: "animate__animated animate__zoomIn"
        }
      });

      // Redirect to login after success
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch {
      Swal.fire({
        title: "Error!",
        text: "Server error. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true
      });
      setErrors((p) => ({
        ...p,
        password: "Server error ❌",
      }));
    } finally {
      setResetLoading(false);
    }
  }

  // ================= RESEND OTP =================
  const resendOtp = async () => {
    if (otpLoading) return;

    try {
      setOtpLoading(true);

      const res = await fetch(`${BASE}/api/v1/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      Swal.fire({
        title: "OTP Resent!",
        text: "Please check your email",
        icon: "success",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true
      });

      setTimer(59);
      setCanResend(false);

    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to resend OTP",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true
      });
    } finally {
      setOtpLoading(false);
    }
  };

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

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 relative">

        <h2 className="text-2xl font-bold text-center mb-5">
          Reset Password 🔐
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              placeholder="Enter your Email"
              className="border px-4 py-2 w-full rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className={`w-full py-2 rounded-xl text-white font-semibold transition ${
                otpLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {otpLoading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label className="text-sm font-medium text-gray-700">OTP</label>
            <input
              placeholder="Enter OTP"
              className="border px-4 py-2 w-full rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrors((p) => ({ ...p, otp: "" }));
              }}
              maxLength={6}
            />

            {errors.otp && (
              <p className="text-red-500 text-sm mb-2">{errors.otp}</p>
            )}

            <div className="flex justify-between items-center text-sm mb-3">
              <span className={`font-mono ${timer > 0 ? "text-gray-600" : "text-gray-400"}`}>
                {timer > 0 ? formatTime(timer) : "Expired"}
              </span>

              {canResend && (
                <button
                  onClick={resendOtp}
                  disabled={otpLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={verifyOtp}
              disabled={verifyLoading}
              className={`w-full py-2 rounded-xl text-white font-semibold transition ${
                verifyLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {verifyLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="New Password"
              className="border px-4 py-2 w-full rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            
            <label className="text-sm font-medium text-gray-700 mt-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="border px-4 py-2 w-full rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mb-2">{errors.password}</p>
            )}

            <button
              onClick={resetPassword}
              disabled={resetLoading}
              className={`w-full py-2 rounded-xl text-white font-semibold transition ${
                resetLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {resetLoading ? "Updating..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="text-center mt-4 text-sm">
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;