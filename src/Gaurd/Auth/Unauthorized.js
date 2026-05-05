import React from "react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-red-500 text-xl font-bold">
        Access Denied 🚫
      </h1>

      <button
        onClick={() => navigate("/login")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Go back
      </button>
    </div>
  );
}

export default Unauthorized;