import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const BASE = "http://localhost:8080";

  // ================= SEND OTP =================
  async function sendOtp() {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email or Phone required" }));
      return;
    }

    try {
      const res = await fetch(`${BASE}/api/v1/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setTimer(59);
        setCanResend(false);
        setErrors((prev) => ({ ...prev, email: "", otp: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email: data.message || "OTP send failed",
        }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, email: "Server error ❌" }));
    }
  }

  // ================= VERIFY OTP =================
  async function verifyOtp() {
    if (!otp.trim()) {
      setErrors((prev) => ({ ...prev, otp: "OTP required" }));
      return;
    }

    try {
      const res = await fetch(`${BASE}/api/v1/verify-forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          otp: data.message || "Wrong OTP",
        }));
        return;
      }

      setStep(3);
      setErrors((prev) => ({ ...prev, otp: "" }));

    } catch {
      setErrors((prev) => ({ ...prev, otp: "Server error ❌" }));
    }
  }

  // ================= RESET PASSWORD =================
  async function resetPassword() {
    if (!newPassword.trim()) {
      setErrors((prev) => ({
        ...prev,
        password: "Enter new password",
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        password: "Passwords do not match",
      }));
      return;
    }

    try {
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

      if (res.ok) {
        setSuccess(true);
      } else {
        setErrors((prev) => ({
          ...prev,
          password: data.message || "Reset failed",
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        password: "Server error ❌",
      }));
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
      const timer = setTimeout(() => {
        navigate("/profile");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200">
      
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 relative">

        <h2 className="text-2xl font-bold text-center mb-5">
          Reset Password 🔐
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label>Email or phone </label>
            <input
              placeholder="Email or Phone"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mb-2">
                {errors.email}
              </p>
            )}

            <button
              onClick={sendOtp}
              className="w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
          <label>Otp</label>
            <input
              placeholder="Enter OTP"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrors((prev) => ({ ...prev, otp: "" }));
              }}
            />

            {errors.otp && (
              <p className="text-red-500 text-sm mb-2">
                {errors.otp}
              </p>
            )}

            <div className="flex justify-between text-sm mb-3">
              <span>
                {timer > 0
                  ? `00:${timer.toString().padStart(2, "0")}`
                  : ""}
              </span>

              {canResend && (
                <button onClick={sendOtp} className="text-blue-600">
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded-xl"
            >
              Verify OTP
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New Password"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="border px-4 py-2 w-full rounded-xl mb-2"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mb-2">
                {errors.password}
              </p>
            )}

            <button
              onClick={resetPassword}
              className="w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              Reset Password
            </button>
          </>
        )}

        {/* SUCCESS POPUP */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white px-10 py-8 rounded-2xl text-center shadow-2xl animate-fadeIn">
              <h2 className="text-2xl font-bold text-green-600">
                Password Updated Successfully ✅
              </h2>
              <p className="text-gray-600 mt-3 text-sm">
                Redirecting to your profile...
              </p>
            </div>
          </div>
        )}

        {/* BACK */}
        <p className="text-center mt-4 text-sm">
          <Link to="/" className="text-blue-600">
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;