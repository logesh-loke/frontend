import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const identifier = location.state?.identifier;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const [successPopup, setSuccessPopup] = useState(false);

  async function handleVerify() {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    setError("");

    try {
      const res = await fetch("api/v1/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setSuccessPopup(true);

        
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);

      } else {
        setError(data.message || "Invalid OTP ❌");
      }
    } catch (err) {
      console.error(err);
      setError("Server error ❌");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">

        <h2 className="text-xl font-bold mb-4">
          Enter OTP
        </h2>

        <input
          className="border rounded-xl px-4 py-2 w-full mb-2"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded-xl"
        >
          Verify OTP
        </button>

      </div>

      {/* ✅ SUCCESS POPUP */}
      {successPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">

          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-green-600 font-bold">
              Login Successful ✅
            </h2>
          </div>

        </div>
      )}

    </div>
  );
}

export default VerifyOtp;