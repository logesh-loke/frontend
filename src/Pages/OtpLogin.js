import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      setError("Email or Phone required");
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

      setStep(2);
      setTimer(59);
      setCanResend(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {
    if (verifyLoading) return;

    if (!otp.trim()) {
      setError("Enter OTP");
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

      // 🔁 Redirect based on role
      if (role === "admin") {
        navigate("/admin-profile");
      } else {
        navigate("/profile");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setVerifyLoading(false);
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
            className="w-1/2 p-2 bg-gray-200"
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
            <label className="text-sm">Email </label>
            <input
              className="border px-4 py-2 w-full rounded-xl mb-2"
              placeholder="Enter your Email"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError("");
              }}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-blue-600 text-white"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label className="text-sm">OTP</label>
            <input
              className="border px-4 py-2 w-full rounded-xl mb-2"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between text-sm mb-3">
              <span>{timer > 0 ? `00:${timer}` : ""}</span>

              {canResend && (
                <button onClick={sendOtp} className="text-blue-600">
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={verifyOtp}
              disabled={verifyLoading}
              className="w-full py-2 rounded-xl bg-green-600 text-white"
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