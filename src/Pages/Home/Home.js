import React from "react";
import Attendance from "../Dashboard/Attendance";

export const Home = () => {
  return (
    <div className="space-y-6 overflow-hidden">

      {/* 🏷 Page Title */}
      <h1 className="text-2xl font-bold text-gray-800">
       
      </h1>

      {/* 📊 Attendance Section */}
      <Attendance />
      

    </div>
  );
};