import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../Services/Api";
import Swal from "sweetalert2";
import { 
  FaEdit, FaTrash, FaSearch, FaUsers, FaShieldAlt, 
  FaUserTag, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard,
  FaChartLine, FaClock, FaUserCircle, FaFilter, FaSync, FaSpinner
} from "react-icons/fa";
import UserEdit from "./UserEdit";

function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // LOAD USERS
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/v1/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load users");
      }

      setUsers(data?.data || []);
    } catch (err) {
      console.error("USERS ERROR:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to load users",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
    
    Swal.fire({
      title: "Refreshed!",
      text: "User list refreshed successfully",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });
  };

  // ✅ CORRECTED DELETE FUNCTION
  const deleteUser = async (id, userName) => {
    // SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete user <strong>${userName}</strong>.<br />This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    // Set deleting state for this user
    setDeletingId(id);

    try {
      const token = localStorage.getItem("token");
      
      // ✅ CORRECT API ENDPOINT - Changed to match backend
      const res = await apiFetch(`/api/v1/delete/user/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }
      
      // Success message
      Swal.fire({
        title: 'Deleted!',
        text: `User ${userName} has been deleted successfully.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });
      
      // Reload users list
      await loadUsers();
      
    } catch (err) {
      console.error("Delete error:", err);
      
      Swal.fire({
        title: 'Error!',
        text: err.message || "Something went wrong while deleting the user",
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contactno?.includes(searchTerm);
    
    const matchesRole = roleFilter === "ALL" || user.role?.toUpperCase() === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role?.toLowerCase() === 'admin').length,
    users: users.filter(u => u.role?.toLowerCase() === 'user').length,
    active: users.length,
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"><FaShieldAlt size={12} /> Admin</span>;
      case 'user':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"><FaUserCircle size={12} /> User</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md">{role || 'User'}</span>;
    }
  };

  const formatDate = () => {
    return new Date().toLocaleString();
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
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-500 mt-1">Manage and monitor all registered users</p>
            </div>
           
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Admins</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.admins}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaShieldAlt className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Regular Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaUserCircle className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Now</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaChartLine className="text-orange-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="USER">Users</option>
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
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-100 border-b">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              User Profiles
            </h2>
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
                            onClick={() => deleteUser(user.id, `${user.firstname} ${user.lastname}`)}
                            disabled={deletingId === user.id}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md text-xs font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === user.id ? (
                              <FaSpinner className="animate-spin" size={12} />
                            ) : (
                              <FaTrash size={12} />
                            )}
                            {deletingId === user.id ? "Deleting..." : "Delete"}
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