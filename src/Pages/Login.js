import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  // 🔥 SUCCESS STATE (NEW)
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
    otp: "",
  });

  function validatePasswordLogin() {
    let err = { identifier: "", password: "" };

    if (!identifier) err.identifier = "Email or Phone required";
    if (!password) err.password = "Password required";

    setErrors(err);

    return !err.identifier && !err.password;
  }

  // ================= LOGIN =================
  async function passwordLogin() {
    if (!validatePasswordLogin()) return;

    try {
      const res = await fetch("http://localhost:8080/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);

        // ⏱ redirect after success UI
        setTimeout(() => {
          navigate("/profile");
        }, 1200);

      } else {
        setErrors({ ...errors, password: data.message });
      }
    } catch {
      setErrors({ ...errors, password: "Server error" });
    }
  }

  async function sendOtp() {
    if (!identifier) {
      setErrors({ ...errors, identifier: "Email or Phone required" });
      return;
    }

    try {
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
      } else {
        setErrors({ ...errors, identifier: data.message });
      }
    } catch {
      setErrors({ ...errors, identifier: "Server error" });
    }
  }

  async function verifyOtpLogin() {
    if (!otp) {
      setErrors({ ...errors, otp: "OTP required" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, otp }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate("/profile");
        }, 1200);

      } else {
        setErrors({ ...errors, otp: data.message });
      }
    } catch {
      setErrors({ ...errors, otp: "Server error" });
    }
  }

  useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, step]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 relative">

        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {/* TOGGLE */}
        <div className="flex mb-4 overflow-hidden rounded-xl">
          <button
            onClick={() => setMode("password")}
            className={`w-1/2 p-2 ${mode === "password" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Password
          </button>
          <button
            onClick={() => setMode("otp")}
            className={`w-1/2 p-2 ${mode === "otp" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            OTP
          </button>
        </div>

        {/* EMAIL */}
        <label>Email or Phone</label>
        <input
          className={`border rounded-xl px-4 py-2 w-full mb-1 ${
            errors.identifier ? "border-red-500" : ""
          }`}
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setErrors({ ...errors, identifier: "" });
          }}
        />
        {errors.identifier && (
          <p className="text-red-500 text-xs mb-2">{errors.identifier}</p>
        )}

        {/* PASSWORD */}
        {mode === "password" && (
          <>
            <label>Password</label>
            <input
              type="password"
              className={`border rounded-xl px-4 py-2 w-full mb-1 ${
                errors.password ? "border-red-500" : ""
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mb-2">{errors.password}</p>
            )}

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
                  className={`border rounded-xl px-4 py-2 w-full mb-1 ${
                    errors.otp ? "border-red-500" : ""
                  }`}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setErrors({ ...errors, otp: "" });
                  }}
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mb-2">{errors.otp}</p>
                )}

                <button
                  onClick={verifyOtpLogin}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl"
                >
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}
        <p className="mt-2 text-sm text-center">
           Don't have an account?{" "}
          <Link to="/register" className="cursor-pointer text-blue-600">
            Register
          </Link> 
        </p>
        {/* SUCCESS UI 🔥 */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div className="bg-white w-72 p-6 rounded-2xl shadow-2xl text-center animate-bounce">

              <div className="text-green-600 text-4xl mb-2">✔</div>

              <h2 className="text-lg font-bold text-green-600">
                Login Successful
              </h2>

              <p className="text-gray-500 text-sm mt-1">
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