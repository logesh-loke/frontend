import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ================= LOAD USER =================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "admin") {
      navigate("/login");
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= TOPBAR ================= */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h2 className="font-semibold text-lg">
          Admin Dashboard 👑
        </h2>

        <div className="flex items-center gap-4">
          <span className="bg-gray-200 px-3 py-1 rounded text-sm">
            {user?.firstname}
          </span>

          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-6 space-y-6">

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card title="Total Users" value="120" />
          <Card title="Active Users" value="98" />
          <Card title="Admins" value="5" />

        </div>

        {/* USERS TABLE */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h3 className="text-lg font-bold mb-4">
            Users List
          </h3>

          <table className="w-full border">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
              </tr>
            </thead>

            <tbody>
              <tr className="text-center border-t">
                <td className="p-2">1</td>
                <td className="p-2">John Doe</td>
                <td className="p-2">john@mail.com</td>
                <td className="p-2">user</td>
              </tr>

              <tr className="text-center border-t">
                <td className="p-2">2</td>
                <td className="p-2">Admin</td>
                <td className="p-2">admin@mail.com</td>
                <td className="p-2">admin</td>
              </tr>
            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;

/* ================= CARD ================= */
const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <h4 className="text-gray-500">{title}</h4>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);