import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../Services/Api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // store all users

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "admin") {
      navigate("/login");
      return;
    }

    setUser(storedUser);
    loadUsers(); // fetch users
  }, [navigate]);


  const loadUsers = async () => {
    try {
      const res = await apiFetch("/api/v1/admin/users", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message);

      setUsers(data?.data || []); //  store users
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  // ================= COUNTS =================
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length; // optional
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="p-6 space-y-6">

        {/* 🔥 CARDS (DYNAMIC) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Users" value={totalUsers} />
          <Card title="Active Users" value={activeUsers} />
          <Card title="Admins" value={adminCount} />
        </div>

        {/* 🔥 USERS TABLE */}
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
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="text-center border-t">
                    <td className="p-2">{u.id}</td>
                    <td className="p-2">
                      {u.firstname} {u.lastname}
                    </td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    No users found
                  </td>
                </tr>
              )}
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