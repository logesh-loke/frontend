import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import bg from "../Assets/bg-img.jpg";

function OtpLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [error, setError] = useState("");

  const BASE = "http://localhost:8080";

  // ================= SEND OTP =================
  const sendOtp = async () => {
    if (loading) return;

    if (!identifier.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Email or Phone required",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true,
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BASE}/api/v1/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      // Show success message
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

    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Try Again",
        position: "center",
        backdrop: true
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {
    if (verifyLoading) return;

    if (!otp.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Please enter OTP",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true,
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    try {
      setVerifyLoading(true);
      setError("");

      const res = await fetch(`${BASE}/api/v1/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, otp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP");
      }

      // 🔐 Normalize role
      const role = (data.user.role || data.user.accessLevel || "")
        .toLowerCase()
        .trim();

      // ✅ Store user
      const userInfo = { ...data.user, role };

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userInfo));

      // Show success message
      Swal.fire({
        title: "Login Successful!",
        text: `Welcome back, ${userInfo.firstname || userInfo.name || "User"}!`,
        icon: "success",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true,
        customClass: {
          popup: "animate__animated animate__zoomIn"
        }
      });

      // 🔁 Redirect based on role
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/profile");
        }
      }, 2000);

    } catch (err) {
      Swal.fire({
        title: "Verification Failed!",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Try Again",
        position: "center",
        backdrop: true
      });
      setError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOtp = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BASE}/api/v1/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resend OTP");
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
        text: err.message,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= TIMER =================
  useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
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
        background: `url(${bg}) center / cover no-repeat`,
      }}
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">

        {/* TOGGLE */}
        <div className="flex mb-4 overflow-hidden rounded-xl border">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-1/2 p-2 bg-gray-200 hover:bg-gray-300 transition"
          >
            Password
          </button>
          <button className="w-1/2 p-2 bg-blue-600 text-white">
            OTP
          </button>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label className="text-sm font-medium text-gray-700">Email or Phone</label>
            <input
              className="border px-4 py-2 w-full rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email or phone"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError("");
              }}
            />

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label className="text-sm font-medium text-gray-700">OTP</label>
            <input
              className="border px-4 py-2 w-full rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
              maxLength={6}
            />

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex justify-between items-center text-sm mb-3">
              <span className={`font-mono ${timer > 0 ? "text-gray-600" : "text-gray-400"}`}>
                {timer > 0 ? formatTime(timer) : "Expired"}
              </span>

              {canResend && (
                <button 
                  onClick={resendOtp} 
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={verifyOtp}
              disabled={verifyLoading}
              className="w-full py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {verifyLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OtpLogin;