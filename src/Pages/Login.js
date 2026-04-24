import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password");

  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

<<<<<<< HEAD
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
    otp: "",
  });

  // ✅ ADD THIS (fix Enter key)
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
    let err = { identifier: "", password: "" };

    if (!identifier) err.identifier = "Email or Phone required";
    if (!password) err.password = "Password required";

    setErrors(err);
    if (err.identifier || err.password) return;

=======
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

>>>>>>> origin/master
    try {
      const res = await fetch("http://localhost:8080/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (data.success) {
<<<<<<< HEAD
        setSuccess(true);
        setTimeout(() => navigate("/profile"), 500);
      } else {
        setErrors((prev) => ({ ...prev, password: data.message }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, password: "Server error" }));
    }
  }

  // ================= SEND OTP =================
  async function sendOtp() {
    if (!identifier) {
      setErrors((prev) => ({
        ...prev,
        identifier: "Email or Phone required",
      }));
=======
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
>>>>>>> origin/master
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
=======
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
>>>>>>> origin/master
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (data.success) {
<<<<<<< HEAD
        setStep(2);
        setTimer(59);
        setCanResend(false);
        setErrors({ identifier: "", password: "", otp: "" });
      } else {
        setErrors((prev) => ({ ...prev, identifier: data.message }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, identifier: "Server error" }));
    }
  }

  // ================= VERIFY OTP =================
  async function verifyOtpLogin() {
    if (!otp) {
      setErrors((prev) => ({ ...prev, otp: "OTP required" }));
=======
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
>>>>>>> origin/master
      return;
    }

    try {
<<<<<<< HEAD
      const res = await fetch("http://localhost:8080/api/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrors((prev) => ({
          ...prev,
          otp: data.message || "Wrong OTP",
        }));
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/profile"), 500);

    } catch {
      setErrors((prev) => ({ ...prev, otp: "Server error" }));
    }
  }

  // ================= TIMER =================
  useEffect(() => {
=======
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
>>>>>>> origin/master
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
<<<<<<< HEAD
    } else if (timer === 0) {
      setCanResend(true);
=======
    }

    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
>>>>>>> origin/master
    }

    return () => clearInterval(interval);
  }, [timer, step]);

  return (
<<<<<<< HEAD
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200">
      
      {/* ✅ FIXED FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96 relative">

        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {/* TOGGLE */}
        <div className="flex mb-4 overflow-hidden rounded-xl">
          <button type="button"
            onClick={() => setMode("password")}
            className={`w-1/2 p-2 ${mode === "password" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Password
          </button>

          <button type="button"
            onClick={() => setMode("otp")}
            className={`w-1/2 p-2 ${mode === "otp" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            OTP
          </button>
        </div>

        {/* EMAIL */}
        <label>Email or Phone</label>
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
            <label>Password</label>
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

            {errors.password && (
              <p className="text-red-500 text-sm mb-2">{errors.password}</p>
            )}

            <Link to="/forgotpassword" className="text-blue-600 text-sm">
              Forgot Password?
            </Link>

            {/* ✅ FIX: submit button */}
            <button type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl mt-2">
=======
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
>>>>>>> origin/master
              Login
            </button>
          </>
        )}

<<<<<<< HEAD
        {/* OTP MODE */}
        {mode === "otp" && (
          <>
            {step === 1 && (
              <button type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-xl">
=======
        {/* OTP */}
        {mode === "otp" && (
          <>
            {step === 1 && (
              <button
                onClick={sendOtp}
                className="w-full bg-green-600 text-white py-2 rounded-xl"
              >
>>>>>>> origin/master
                Send OTP
              </button>
            )}

            {step === 2 && (
              <>
                <input
<<<<<<< HEAD
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
                    <button type="button" onClick={sendOtp} className="text-blue-600">
=======
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
>>>>>>> origin/master
                      Resend OTP
                    </button>
                  )}
                </div>
<<<<<<< HEAD

                <button type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-xl">
                  Verify OTP
                </button>
=======
>>>>>>> origin/master
              </>
            )}
          </>
        )}

<<<<<<< HEAD
        {/* SUCCESS */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white px-10 py-8 rounded-2xl text-center shadow-2xl">
              <h2 className="text-2xl font-bold text-green-600">
                Login Successfully
              </h2>
              <p className="text-gray-600 mt-3 text-sm">Redirecting...</p>
            </div>
          </div>
        )}
        <p className="text-sm text-center mt-1" >Don't have an account <Link to="/register" className="text-blue-600"> Register</Link></p>
      </form>
=======
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
>>>>>>> origin/master
    </div>
  );
}

export default Login;