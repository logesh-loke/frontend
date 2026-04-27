import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../Assets/bg-img.jpg";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
    otp: "",
  });

  // 🔥 Separate loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ================= SUBMIT =================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "password") {
      passwordLogin();
    } else {
      if (step === 1) sendOtp();
      else verifyOtpLogin();
    }
  };

  // ================= PASSWORD LOGIN =================
  async function passwordLogin() {
    if (loginLoading) return;

    let err = { identifier: "", password: "" };

    if (!identifier) err.identifier = "Email or Phone required";
    if (!password) err.password = "Password required";

    setErrors(err);
    if (err.identifier || err.password) return;

    try {
      setLoginLoading(true);

      const res = await fetch("http://localhost:8080/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.accessToken); // ✅ FIXED
        localStorage.setItem("user", JSON.stringify(data.user)); // optional

        setSuccess(true);

        setTimeout(() => {
          navigate("/profile");
        }, 500);
      }else {
        setErrors((prev) => ({ ...prev, password: data.message }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, password: "Server error" }));
    } finally {
      setLoginLoading(false);
    }
  }

  // ================= SEND OTP =================
  async function sendOtp(retry = 0) {
    if (otpLoading) return;

    if (!identifier) {
      setErrors((prev) => ({
        ...prev,
        identifier: "Email or Phone required",
      }));
      return;
    }

    try {
      setOtpLoading(true);

      const res = await fetch("http://localhost:8080/api/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (data.success) {
        setStep(2);
        setTimer(59);
        setCanResend(false);
        setErrors({ identifier: "", password: "", otp: "" });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.log("OTP ERROR:", err);

      if (retry < 2) {
        await new Promise((res) => setTimeout(res, 1000));
        return sendOtp(retry + 1);
      }

      setErrors((prev) => ({
        ...prev,
        identifier: "Failed to send OTP",
      }));
    } finally {
      setOtpLoading(false);
    }
  }

  // ================= VERIFY OTP =================
  async function verifyOtpLogin() {
    if (verifyLoading) return;
  
    if (!otp) {
      setErrors((prev) => ({ ...prev, otp: "OTP required" }));
      return;
    }
  
    try {
      setVerifyLoading(true);
    
      const res = await fetch("http://localhost:8080/api/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      });
    
      const data = await res.json();
    
      if (!res.ok || !data.success) {
        setErrors((prev) => ({
          ...prev,
          otp: data.message || "Invalid OTP",
        }));
        return;
      }
    
      // ✅ IMPORTANT FIX HERE
      localStorage.setItem("token", data.accessToken); // 🔥 FIX
      localStorage.setItem("user", JSON.stringify(data.user));
    
      setSuccess(true);
    
      setTimeout(() => {
        navigate("/profile");
      }, 500);
    
    } catch (err) {
      setErrors((prev) => ({ ...prev, otp: "Server error" }));
    } finally {
      setVerifyLoading(false);
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

  // ================= UI =================
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 relative"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {/* TOGGLE */}
        <div className="flex mb-4 overflow-hidden rounded-xl">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`w-1/2 p-2 ${
              mode === "password"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Password
          </button>

          

          <button
            type="button"
            onClick={() => setMode("otp")}
            className={`w-1/2 p-2 ${
              mode === "otp" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            OTP
          </button>
        </div>

        {/* IDENTIFIER */}
        <label className="text-sm">Email or Phone</label>
        <input
          placeholder="Email or Phone"
          className="border rounded-xl px-4 py-2 w-full mb-2"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setErrors({ ...errors, identifier: "" });
          }}
        />
        {errors.identifier && (
          <p className="text-red-500 text-sm mb-2">{errors.identifier}</p>
        )}

        {/* PASSWORD MODE */}
        {mode === "password" && (
          <>
            <label className="text-sm">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="border rounded-xl px-4 py-2 w-full mb-2"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
            />
            <div>
            <Link to="/forgotpassword " className="mt-2 text-blue-600 text-right">Forgot Password</Link>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mb-2">{errors.password}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className={`w-full py-2 rounded-xl mt-3 text-white ${
                loginLoading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {/* OTP MODE */}
        {mode === "otp" && (
          <>
            {step === 1 && (
              <button
                type="submit"
                disabled={otpLoading}
                className={`w-full py-2 rounded-xl text-white ${
                  otpLoading
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {otpLoading ? "Sending..." : "Send OTP"}
              </button>
            )}

            {step === 2 && (
              <>
              <label className="text-sm">Otp</label>
                <input
                  placeholder="Enter OTP"
                  className="border rounded-xl px-4 py-2 w-full mb-2"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setErrors({ ...errors, otp: "" });
                  }}
                />

                {errors.otp && (
                  <p className="text-red-500 text-sm mb-2">{errors.otp}</p>
                )}

                <div className="flex justify-between text-sm mb-3">
                  <span>{timer > 0 ? `00:${timer}` : "0:00"}</span>

                  {canResend && (
                    <button
                      type="button"
                      disabled={otpLoading}
                      onClick={() => sendOtp()}
                      className={`px-4 py-1 rounded text-white ${
                        otpLoading
                          ? "bg-gray-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {otpLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifyLoading}
                  className={`w-full py-2 rounded-xl text-white ${
                    verifyLoading
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {verifyLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
          </>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white px-8 py-6 rounded-xl text-center">
              <h2 className="text-green-600 font-bold text-xl">
                Login Successful
              </h2>
            </div>
          </div>
        )}

        <p className="text-sm text-center mt-3">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;