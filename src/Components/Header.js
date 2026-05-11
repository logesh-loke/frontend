import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  // ✅ GET USER
  const user = JSON.parse(localStorage.getItem("user"));
  const role = (user?.role || "").toLowerCase();
  const userName = user?.firstname || "U";

  // 🔒 CLOSE DROPDOWN OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


    const [userRole, setUserRole] = useState("");
        useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          setUserRole(user.role);
        }
      }, []);
  // 🔐 LOGOUT
  const handleLogout = async () => {
    await fetch("http://localhost:8080/api/v1/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-gray-50 h-14 flex items-center justify-between px-6 shadow-sm">

      {/* 🏷 DYNAMIC TITLE */}
      <p className="text-xl font-medium text-gray-700">
        {role === "admin" ? "Admin Dashboard " : "User Dashboard"}
      </p>

      {/* 👤 PROFILE */}
      <div
        className="relative flex items-center gap-2 cursor-pointer"
        ref={dropdownRef}
      >

        {/* PROFILE ICON */}
        <div
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold"
        >
          {userName.charAt(0).toUpperCase()}
        </div>

        {/* ARROW */}
        <svg
          onClick={() => setOpen(!open)}
          className={`w-4 h-4 text-gray-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>

        {/* 🔽 DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-14 w-48 bg-white shadow-lg rounded-lg py-2 z-50">

            {/* 👤 COMMON LINK */}
            <Link
              to={userRole === "admin" ? "/admin-profile" : "/profile"}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Profile
            </Link>

            {/* 🔐 LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500"
            >
              Logout
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default Header;