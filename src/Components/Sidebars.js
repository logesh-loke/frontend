import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menu = [
    { name: "Home", path: "/home" },
    { name: "Attendance History", path: "/attendance-history" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 ">

      {/* 🏷 Logo */}
      <h2 className="text-xl font-bold mb-8 text-center">
        Dashboard
      </h2>

      {/* 📌 Menu */}
      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-blue-500"
                  : "hover:bg-gray-700"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

    </div>
  );
};

export default Sidebar;