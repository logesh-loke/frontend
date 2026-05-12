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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await apiFetch("/api/v1/admin/allattendance", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        }
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result?.message || "Failed to load attendance");
      
      console.log("Attendance Response:", result?.data);
      setAttendance(result?.data || []);
      
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openHistoryModal = (record) => {
    setSelectedUser(record);
    setModalOpen(true);
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

  useEffect(() => { loadAttendance(); }, []);

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
      case "PRESENT": return ;
      case "ABSENT": return ;
      case "LATE": return ;
      default: return null;
    }
  };

  const filterByMonth = (dateString, selectedMonth) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return yearMonth === selectedMonth;
    } catch { return false; }
  };

  const filteredAttendance = attendance.filter((record) => {
    const attendanceDate = record.punch_in;
    if (!attendanceDate) return false;
    
    const matchesMonth = filterByMonth(attendanceDate, month);
    const matchesStatus = statusFilter === "ALL" || record.attendance_status?.toUpperCase() === statusFilter;
    
    const employeeName = `${record.firstname || ""} ${record.lastname || ""}`.toLowerCase();
    const email = (record.email || "").toLowerCase();
    const matchesSearch = searchTerm === "" || 
        employeeName.includes(searchTerm.toLowerCase()) || 
        email.includes(searchTerm.toLowerCase());
    
    return matchesMonth && matchesStatus && matchesSearch;
  });

  const uniqueUsers = [...new Map(filteredAttendance.map(item => [item.userId || item.id, item])).values()];
  
  const totalPresent = filteredAttendance.filter(r => r.attendance_status?.toUpperCase() === "PRESENT").length;
  const totalAbsent = filteredAttendance.filter(r => r.attendance_status?.toUpperCase() === "ABSENT").length;
  const totalLate = filteredAttendance.filter(r => r.attendance_status?.toUpperCase() === "LATE").length;
  
  const avgWorkingHours = filteredAttendance.length > 0 
    ? (filteredAttendance.reduce((sum, r) => sum + (parseFloat(r.working_hours) || 0), 0) / filteredAttendance.length).toFixed(1)
    : "0.0";

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

  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">
      
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div>
              <h1 className="text-3xl font-bold text-white">All Attendance</h1>
              <p className="mt-1 text-blue-100">Admin Attendance Dashboard</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 bg-gray-50 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm text-gray-600">Total Present</p>
              <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
            </div>
            <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm text-gray-600">Total Absent</p>
              <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
            </div>
            <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm text-gray-600">Total Late</p>
              <p className="text-2xl font-bold text-yellow-600">{totalLate}</p>
            </div>
            <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm text-gray-600">Avg Working Hours</p>
              <p className="text-2xl font-bold text-blue-600">{avgWorkingHours} hrs</p>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)} 
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF-DAY">Half Day</option>
              </select>
              {(searchTerm || statusFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  className="rounded-lg bg-red-100 px-4 py-2 text-red-600 transition hover:bg-red-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredAttendance.length} of {attendance.length} records | {uniqueUsers.length} unique employees
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
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <FaUser className="mx-auto mb-2 text-4xl text-gray-400" />
                        <p className="text-gray-500">No attendance records found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((record) => (
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
                            {new Date(record.punch_in).toLocaleDateString(undefined, { weekday: 'short' })}
                          </div>

                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-gray-900">{formatTime(record.punch_in)}</div>
                           {record.lateMinutes > 0 && (
                            <div className="text-xs text-orange-500">Late : {record.lateMinutes}min</div>
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
                              title="View 30 Days History"  
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
          
          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 text-center text-sm text-gray-500">
            Total Records: {filteredAttendance.length} | Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Modal Component */}
        <AttendanceHistoryModal 
          isOpen={modalOpen}
          onClose={closeHistoryModal}
          user={selectedUser}
          token={token}
        />
      </div>
    </div>
  );
};

export default AdminAllAttendance;