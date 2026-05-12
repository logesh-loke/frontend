import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../Services/Api";
import { toast } from "react-toastify";
import { 
  FaEdit, FaTrash, FaSearch, FaUser, FaUsers, FaShieldAlt, 
  FaUserTag, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard,
  FaEye, FaChartLine, FaCalendarAlt, FaClock, FaUserCircle,
  FaCheckCircle, FaTimesCircle, FaDownload, FaPrint, FaFilter,
  FaExclamationTriangle, FaSync, FaHome
} from "react-icons/fa";
import UserEdit from "./UserEdit";

function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();

  // LOAD USERS
  useEffect(() => {
    loadUsers();
    loadAttendanceData();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await apiFetch("/api/v1/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load users");
      }

      setUsers(data?.data || []);
    } catch (err) {
      console.error("USERS ERROR:", err);
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const res = await apiFetch("/api/v1/admin/attendance/today");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load attendance");
      }
      
      setAttendanceData(data?.data || []);
    } catch (err) {
      console.error("ATTENDANCE ERROR:", err);
      setAttendanceData([]);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadUsers(), loadAttendanceData()]);
    setRefreshing(false);
    toast.success("Data refreshed successfully");
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        }
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Delete failed");
      toast.success("User deleted successfully");
      loadUsers();
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Something went wrong");
    }
  };

  // Calculate attendance stats
  const calculateAttendanceStats = () => {
    const present = attendanceData.filter(a => a.status?.toUpperCase() === "PRESENT").length;
    const absent = attendanceData.filter(a => a.status?.toUpperCase() === "ABSENT").length;
    const late = attendanceData.filter(a => a.lateMinutes > 0 || a.status?.toUpperCase() === "LATE").length;
    
    return { present, absent, late };
  };

  const attendanceStats = calculateAttendanceStats();

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || user.role?.toUpperCase() === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role?.toLowerCase() === 'admin').length,
    employees: users.filter(u => u.role?.toLowerCase() === 'employee' || u.role?.toLowerCase() === 'user').length,
    active: users.length,
    present: attendanceStats.present,
    absent: attendanceStats.absent,
    late: attendanceStats.late
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"><FaShieldAlt size={12} /> Admin</span>;
      case 'employee':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"><FaUserTag size={12} /> Employee</span>;
      case 'user':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"><FaUserCircle size={12} /> User</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md">{role || 'User'}</span>;
    }
  };

  const formatDate = () => {
    return new Date().toLocaleString();
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Address", "Role"];
    const csvData = filteredUsers.map(u => [
      u.id,
      `${u.firstname} ${u.lastname}`,
      u.email,
      u.contactno || "N/A",
      u.address || "N/A",
      u.role || "User"
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export successful!");
  };

  const printReport = () => {
    window.print();
  };

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaUsers className="text-blue-500 text-2xl animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none cursor-pointer bg-white"
              >
                <option value="ALL"> All Roles</option>
                <option value="USER">👤 Regular Users</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-xl">
                <FaUsers className="text-blue-500" />
                <span className="font-bold text-gray-800">{filteredUsers.length}</span>
                <span>of {users.length} users</span>
              </div>
              {(searchTerm || roleFilter !== "ALL") && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("ALL");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-100 to-red-50 text-red-600 rounded-xl hover:from-red-200 hover:to-red-100 transition font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            Showing {filteredUsers.length} of {users.length} registered users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-100 border-b">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  User Profiles
                </h2>
                <p className="text-sm text-gray-500 mt-1">View and manage all registered users</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl">
                  <FaUserTag className="text-blue-600 text-sm" />
                  <span className="text-sm font-medium text-blue-700">{stats.employees} Employees</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <span className="text-white font-bold text-sm">
                              {user.firstname?.[0]}{user.lastname?.[0]}
                            </span>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {user.firstname} {user.lastname}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <FaEnvelope size={10} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {user.contactno && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <FaPhone size={10} className="text-gray-400" />
                              {user.contactno}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <FaIdCard size={10} />
                            ID: {user.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1 text-sm text-gray-600">
                          <FaMapMarkerAlt className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{user.address || "No address provided"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md text-xs font-medium flex items-center gap-2"
                          >
                            <FaEdit size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md text-xs font-medium flex items-center gap-2"
                          >
                            <FaTrash size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-5 bg-gray-100 rounded-full">
                          <FaUsers className="text-gray-400 text-6xl" />
                        </div>
                        <p className="text-gray-500 text-xl font-medium">No users found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <span>Total: </span>
                  <span className="font-semibold text-gray-800">{filteredUsers.length}</span>
                  <span>users</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-400" />
                  <span>Last updated: {formatDate()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT COMPONENT */}
      {selectedUser && (
        <UserEdit
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          reloadUsers={loadUsers}
        />
      )}
    </div>
  );
}

export default AdminUsersTable;