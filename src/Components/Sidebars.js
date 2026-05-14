import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = (user?.role || "").toLowerCase();

  //  USER MENU
  const userMenu = [
    { name: "Home", path: "/home" },
    { name: "Attendance History", path: "/attendance-history" },
    { name: "Profile", path: "/profile" },
  ];

  //  ADMIN MENU  
  const adminMenu = [
    { name: "User Profile", path: "/user-profile"},
    { name: "Today Attendance", path: "/admin-user" },
    { name: "Monthly Attendance", path: "/admin-history" },
    { name: "Profile", path: "/admin-profile" },
  ];

  //  SWITCH BASED ON ROLE
  const menu = role === "admin" ? adminMenu : userMenu;

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">

      {/* 🏷 LOGO */}
      <h2 className="text-xl font-bold mb-8 text-center">
        {role === "admin" ? "Admin Panel " : "Dashboard"}
      </h2>

      {/* 📌 MENU */}
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