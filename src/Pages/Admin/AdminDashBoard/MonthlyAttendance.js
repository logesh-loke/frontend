import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../Services/Api";
import { toast } from "react-toastify";
import { 
  FaSearch, FaUser, FaCalendarAlt, 
  FaClock, FaSync, FaHome,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from "react-icons/fa";
import AttendanceHistoryModal from "../AdminDashBoard/Components/AttendanceHistoryModal";

const AdminAllAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dateFilter, setDateFilter] = useState(""); // New date filter
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const navigate = useNavigate();

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Build query parameters based on documentation
      const queryParams = new URLSearchParams();
      
      if (month) queryParams.append("month", month);
      if (dateFilter) queryParams.append("date", dateFilter);
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
      if (searchTerm) queryParams.append("search", searchTerm);
      if (pagination.page) queryParams.append("page", pagination.page);
      if (pagination.limit) queryParams.append("limit", pagination.limit);
      
      const queryString = queryParams.toString();
      const url = `/api/v1/admin/attendance${queryString ? `?${queryString}` : ""}`;
      
      const res = await apiFetch(url, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        }
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result?.message || "Failed to load attendance");
      
      console.log("Attendance Response:", result?.data);
      
      // Assuming the API returns data in the format: { data: [], pagination: { total, page, limit } }
      setAttendance(result?.data || []);
      if (result?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total
        }));
      }
      
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openHistoryModal = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const userId = user.userId || user.id;
      const currentMonth = month;
      
      // Fetch monthly attendance for the specific user
      const url = `/api/v1/admin/attendance/monthly/${userId}?month=${currentMonth}`;
      
      const res = await apiFetch(url, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        }
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result?.message || "Failed to load user attendance");
      
      setSelectedUser({
        ...user,
        monthlyAttendance: result?.data || []
      });
      setModalOpen(true);
      
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Failed to load monthly attendance");
    }
  };

  const closeHistoryModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAttendance();
    toast.success("Data refreshed successfully");
  };

  useEffect(() => {
    loadAttendance();
  }, [month, dateFilter, statusFilter, searchTerm, pagination.page, pagination.limit]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT": return "bg-green-500";
      case "ABSENT": return "bg-red-500";
      case "LATE": return "bg-yellow-500";
      case "HALF-DAY": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT": return <FaCheckCircle className="text-green-500" />;
      case "ABSENT": return <FaTimesCircle className="text-red-500" />;
      case "LATE": return <FaExclamationTriangle className="text-yellow-500" />;
      default: return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "--";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "--";
    }
  };
  
  const formatTime = (time) => {
    if (!time) return "--";
    try {
      return new Date(time).toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      });
    } catch {
      return "--";
    }
  };
  
  const getEmployeeName = (record) => {
    return `${record.firstname || ""} ${record.lastname || ""}`.trim() || "Unknown User";
  };

  // Calculate statistics from the filtered data (now handled by backend)
  const totalPresent = attendance.filter(r => r.attendance_status?.toUpperCase() === "PRESENT").length;
  const totalAbsent = attendance.filter(r => r.attendance_status?.toUpperCase() === "ABSENT").length;
  const avgWorkingHours = attendance.length > 0 
    ? (attendance.reduce((sum, r) => sum + (parseFloat(r.working_hours) || 0), 0) / attendance.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">
      
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">All Attendance</h1>
                <p className="text-blue-100 mt-1">Manage and monitor employee attendance</p>
              </div>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
              >
                <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 bg-gray-50 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm text-gray-600">Total Present</p>
              <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
            </div>
            <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm text-gray-600">Total Absent</p>
              <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
            </div>
            <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm text-gray-600">Avg Working Hours</p>
              <p className="text-2xl font-bold text-blue-600">{avgWorkingHours} hrs</p>
            </div>
          </div>

          {/* Filters - Updated based on API documentation */}
          <div className="border-b p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchTerm} 
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }} 
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="month" 
                  value={month} 
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setDateFilter(""); // Clear date filter when month is selected
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }} 
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setMonth(""); // Clear month filter when date is selected
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }} 
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Specific date"
                />
              </div>
              
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }} 
                className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
              </select>

              {(searchTerm || statusFilter !== "ALL" || dateFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setDateFilter("");
                    setMonth(new Date().toISOString().slice(0, 7));
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="rounded-lg bg-red-100 px-4 py-2 text-red-600 transition hover:bg-red-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {attendance.length} records | Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit) || 1}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Loading attendance records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b-2 border-gray-200 bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Punch In</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Punch Out</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Hours</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">Monthly Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <FaUser className="mx-auto mb-2 text-4xl text-gray-400" />
                        <p className="text-gray-500">No attendance records found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    attendance.map((record) => (
                      <tr key={record.id} className="border-b transition-colors hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {getEmployeeName(record)}
                            </div>
                            <div className="text-xs text-gray-500">{record.email || "No Email"}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">{formatDate(record.punch_in)}</div>
                          <div className="text-xs text-gray-400">
                            {record.punch_in && new Date(record.punch_in).toLocaleDateString(undefined, { weekday: 'short' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-gray-900">{formatTime(record.punch_in)}</div>
                          {record.lateMinutes > 0 && (
                            <div className="text-xs text-orange-500">Late: {record.lateMinutes}min</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">
                            {record.punch_out ? formatTime(record.punch_out) : "--"}
                          </div>
                          {record.earlyLogoutMinutes > 0 && (
                            <div className="text-xs text-red-600">Early: {record.earlyLogoutMinutes}min</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parseFloat(record.working_hours || 0).toFixed(1)} hrs
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(record.attendance_status)}
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${getStatusColor(record.attendance_status)}`}>
                              {record.attendance_status || "--"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => openHistoryModal(record)} 
                              className="rounded-lg bg-green-500 p-2 text-white transition-colors hover:bg-green-600"
                              title="View Monthly Attendance"  
                            >
                              <FaCalendarAlt size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!loading && attendance.length > 0 && (
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 text-center text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Modal Component */}
        <AttendanceHistoryModal 
          isOpen={modalOpen}
          onClose={closeHistoryModal}
          user={selectedUser}
          token={localStorage.getItem("token")}
          currentMonth={month}
        />
      </div>
    </div>
  );
};

export default AdminAllAttendance;