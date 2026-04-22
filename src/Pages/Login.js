import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  function showToast(msg) {
    setMessage(msg);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  }

  // ======================
  // 🔐 PASSWORD LOGIN (COOKIE BASED)
  // ======================
  async function passwordLogin() {
    if (!identifier || !password) {
      showToast("Email/Phone and Password required ❌");
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

      if (data.success) {
        setStep(1);
        navigate("/profile"); // cookie already set
      } else {
        showToast(data.message || "Login failed ❌");
      }
    } catch {
      showToast("Server error ❌");
    }
  }

  // ======================
  // 📩 SEND OTP
  // ======================
  async function sendOtp() {
    if (!identifier) {
      showToast("Email or Phone required ❌");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🔥 important consistency
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (data.success) {
        setStep(2);
        setTimer(59);
        setCanResend(false);
        showToast("OTP sent ✅");
      } else {
        showToast(data.message || "Failed ❌");
      }
    } catch {
      showToast("Server error ❌");
    }
  }

  // ======================
  // 🔁 RESEND OTP
  // ======================
  async function resendOtp() {
    try {
      const res = await fetch("http://localhost:8080/api/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (data.success) {
        setTimer(59);
        setCanResend(false);
        showToast("OTP resent 🔁");
      } else {
        showToast(data.message);
      }
    } catch {
      showToast("Server error ❌");
    }
  }

  // ======================
  // 🔐 VERIFY OTP LOGIN (COOKIE CREATED HERE)
  // ======================
  async function verifyOtpLogin() {
    if (!otp) {
      showToast("OTP required ❌");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8080/api/v1/verify-otp-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ identifier, otp }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setStep(1);
        setOtp("");
        navigate("/profile"); // cookie already stored
      } else {
        showToast(data.message || "Invalid OTP ❌");
      }
    } catch {
      showToast("Server error ❌");
    }
  }

  // ======================
  // ⏱ OTP TIMER
  // ======================
  React.useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    }

    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer, step]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 relative">

        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {/* TOGGLE */}
        <div className="flex mb-4 rounded-xl overflow-hidden">
          <button
            onClick={() => setMode("password")}
            className={`w-1/2 p-2 ${
              mode === "password" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Password
          </button>

          <button
            onClick={() => setMode("otp")}
            className={`w-1/2 p-2 ${
              mode === "otp" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            OTP
          </button>
        </div>

        {/* IDENTIFIER */}
        <input
          className="border rounded-xl px-4 py-2 w-full mb-2"
          placeholder="Email or Phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        {/* PASSWORD */}
        {mode === "password" && (
          <>
            <input
              type="password"
              className="border rounded-xl px-4 py-2 w-full mb-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={passwordLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              Login
            </button>
          </>
        )}

        {/* OTP */}
        {mode === "otp" && (
          <>
            {step === 1 && (
              <button
                onClick={sendOtp}
                className="w-full bg-green-600 text-white py-2 rounded-xl"
              >
                Send OTP
              </button>
            )}

            {step === 2 && (
              <>
                <input
                  className="border rounded-xl px-4 py-2 w-full mb-2"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  onClick={verifyOtpLogin}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl"
                >
                  Verify OTP
                </button>

                <div className="text-sm mt-2">
                  {!canResend ? (
                    <p>Resend in {timer}s</p>
                  ) : (
                    <button onClick={resendOtp} className="text-blue-600">
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        <p className="text-sm mt-3 text-center">
          No account? <Link to="/register" className="text-blue-500">Register</Link>
        </p>

        {/* POPUP */}
        {showPopup && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white p-5 rounded-xl text-red-600 font-bold">
              {message}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;