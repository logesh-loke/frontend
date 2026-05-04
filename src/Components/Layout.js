import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebars";

const Layout = ({ children }) => {
  return (
    <div className="flex">

      {/* ⬅ Sidebar */}
      <Sidebar />

      {/* ➡ Main Content */}
      <div className="flex-1 flex flex-col">

        {/* 🔝 Header */}
        <Header />

        {/* 📄 Page Content */}
        <div className="p-6 bg-gray-100 min-h-screen">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Layout;