import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebars";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* ⬅ Sidebar (fixed) */}
      <Sidebar />

      {/* ➡ Main Content */}
      <div className="flex-1 flex flex-col ml-2">

        {/* 🔝 Header (fixed inside layout) */}
        <Header />

        {/* 🔥 Scroll Container with SNAP */}
        <div className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Layout;