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
  const [resendCooldown, setResendCooldown] = useState(0);

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

    // Email or phone format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s()]{10}$/;
    
    if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
      Swal.fire({
        title: "Invalid Format",
        text: "Please enter a valid email or phone number",
        icon: "warning",
        confirmButtonColor: "#d33",
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
      setResendCooldown(59);

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

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      Swal.fire({
        title: "Invalid OTP",
        text: "OTP must be 6 digits",
        icon: "warning",
        confirmButtonColor: "#d33",
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

      // 🔐 Normalize role - only admin or user
      let role = (data.user.role || data.user.accessLevel || "")
        .toLowerCase()
        .trim();

      // Map role aliases to standard roles (admin or user only)
      const roleMapping = {
        "admin": "admin",
    
      };

      // Default to user if role not recognized
      role = roleMapping[role] || "user";

      // Ensure role is either 'admin' or 'user'
      if (role !== "admin" && role !== "user") {
        role = "user";
      }

      // ✅ Store user info
      const userInfo = { 
        ...data.user, 
        role,
        loginTime: new Date().toISOString()
      };

      // Store tokens and user data
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken || "");
      localStorage.setItem("user", JSON.stringify(userInfo));
      localStorage.setItem("userRole", role);
      localStorage.setItem("lastLogin", new Date().toISOString());

      // Set session expiry (8 hours)
      const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem("sessionExpiry", expiryTime);

      // Show success message with role
      const welcomeMessage = role === "admin" 
        ? `Welcome back, Admin ${userInfo.firstname || userInfo.name || "User"}!`
        : `Welcome back, ${userInfo.firstname || userInfo.name || "User"}!`;
      
      Swal.fire({
        title: "Login Successful!",
        text: welcomeMessage,
        icon: "success",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        backdrop: true,
        customClass: {
          popup: "animate__animated animate__zoomIn"
        }
      });

      //  Redirect based on role
      // Admin goes to /user-profile, User goes to /home
      setTimeout(() => {
        if (role === "admin") {
          navigate("/user-profile");
        } else {
          navigate("/home");
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
      
      // Clear any existing session on failure
      clearSession();
    } finally {
      setVerifyLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOtp = async () => {
    if (loading || resendCooldown > 0) return;

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
      setResendCooldown(59);

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

  // ================= HELPER FUNCTIONS =================
  
  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastLogin");
    localStorage.removeItem("sessionExpiry");
  };

  // ================= TIMER EFFECTS =================
  useEffect(() => {
    let interval;
    let cooldownInterval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    // Handle resend cooldown
    if (resendCooldown > 0) {
      cooldownInterval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(cooldownInterval);
    };
  }, [timer, step, resendCooldown]);

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      const token = localStorage.getItem("token");
      const sessionExpiry = localStorage.getItem("sessionExpiry");
      const userRole = localStorage.getItem("userRole");
      
      if (token && sessionExpiry && new Date().getTime() < parseInt(sessionExpiry)) {
        // Session is valid, redirect based on role
        if (userRole === "admin") {
          navigate("/user-profile");
        } else {
          navigate("/home");
        }
      } else if (sessionExpiry && new Date().getTime() >= parseInt(sessionExpiry)) {
        // Session expired
        clearSession();
      }
    };
    
    checkExistingSession();
  }, [navigate]);

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

            <p className="text-xs text-gray-500 mt-3 text-center">
              By continuing, you agree to our Terms of Service
            </p>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-700">OTP</label>
              <input
                className="border px-4 py-2 w-full rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                    setError("");
                  }
                }}
                maxLength={6}
                pattern="\d*"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex justify-between items-center text-sm mb-3">
              <span className={`font-mono ${timer > 0 ? "text-gray-600" : "text-gray-400"}`}>
                {timer > 0 ? formatTime(timer) : "OTP Expired"}
              </span>

              {canResend && resendCooldown === 0 && (
                <button 
                  onClick={resendOtp} 
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition"
                >
                  Resend OTP
                </button>
              )}
              
              {resendCooldown > 0 && (
                <span className="text-gray-400">
                  Resend available in {resendCooldown}s
                </span>
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