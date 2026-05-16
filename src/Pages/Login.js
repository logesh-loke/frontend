import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import bg from "../Assets/bg-img.jpg";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const submittedRef = useRef(false);

  // RETRY FUNCTION
  async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    try {
      const res = await fetch(url, options);

      if (!res.ok && res.status >= 500 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }

      return res;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  // ================= LOGIN =================
  async function passwordLogin(e) {
    e.preventDefault();

    if (loginLoading || submittedRef.current) return;
    submittedRef.current = true;

    let err = { identifier: "", password: "" };

    if (!identifier) err.identifier = "Email or Phone required";
    if (!password) err.password = "Password required";

    setErrors(err);

    if (err.identifier || err.password) {
      submittedRef.current = false;
      return;
    }

    try {
      setLoginLoading(true);

      const res = await fetchWithRetry(
        "http://localhost:8080/api/v1/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
          credentials: "include",
        },
        3
      );

      const data = await res.json();

      if (data.success) {
        //  Normalize role
        const role = (data.user.role || data.user.accessLevel || "")
          .toLowerCase()
          .trim();

        // Store user with normalized role
        const userInfo = { ...data.user, role };

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(userInfo));

        setSuccess(true);
        submittedRef.current = false;

        // Show SweetAlert success message (CENTERED)
        Swal.fire({
          title: "Login Successful!",
          text: `Welcome back, ${userInfo.firstname || userInfo.name || "User"}!`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          position: "center",
          background: "#fff",
          backdrop: true,
          allowOutsideClick: false,
          customClass: {
            popup: "animate__animated animate__zoomIn"
          }
        });

        // Redirect based on role
        setTimeout(() => {
          if (role === "admin") {
            navigate("/user-profile");
          } else {
            navigate("/home");
          }
        }, 2000);
      } else {
        // Show error alert (CENTERED)
        Swal.fire({
          title: "Login Failed!",
          text: data.message || "Invalid credentials",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "Try Again",
          position: "center",
          backdrop: true,
          allowOutsideClick: false
        });
        setErrors((prev) => ({ ...prev, password: data.message }));
        submittedRef.current = false;
      }
    } catch (error) {
      // Show server error alert (CENTERED)
      Swal.fire({
        title: "Server Error!",
        text: "Please try again later",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        position: "center",
        backdrop: true,
        allowOutsideClick: false
      });
      setErrors((prev) => ({
        ...prev,
        password: "Server error. Please try again.",
      }));
      submittedRef.current = false;
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={passwordLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 relative"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {/* Toggle */}
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
            onClick={() => navigate("/otp-login")}
            className="w-1/2 p-2 bg-gray-200"
          >
            OTP
          </button>
        </div>

        {/* Password Login */}
        {mode === "password" && (
          <>
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
              <p className="text-red-500 text-sm mb-2">
                {errors.identifier}
              </p>
            )}

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

            {errors.password && (
              <p className="text-red-500 text-sm mb-2">
                {errors.password}
              </p>
            )}

            <div>
              <Link to="/forgotpassword" className="text-blue-600 text-sm">
                Forgot Password
              </Link>
            </div>

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