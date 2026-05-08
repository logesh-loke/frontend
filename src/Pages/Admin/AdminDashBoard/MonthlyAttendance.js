import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../Services/Api";
import { toast } from "react-toastify";
import { FaEye, FaEdit, FaTrash, FaSearch, FaUser, FaCalendarAlt } from "react-icons/fa";

const AdminAllAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState("ALL");

  const navigate = useNavigate();

  const loadAttendance = async () => {
    try {
      setLoading(true);
      // FIXED: Use the correct endpoint that exists in your backend
      // Option 1: If you have a separate admin endpoint
      const res = await apiFetch("/api/v1/admin/attendance/all");
      
      // Option 2: If you don't have admin endpoint, fetch all users' attendance
      // You might need to create this endpoint first
      
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Failed to load attendance");
      }

      console.log("Raw API Response:", result?.data);
      setAttendance(result?.data || []);
    } catch (err) {
      toast.error(err.message);
      console.error("Load attendance error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAttendance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;

    try {
      setDeletingId(id);
      const res = await apiFetch(`/api/v1/attendance/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) throw new Error(result?.message);

      toast.success("Attendance record deleted successfully");
      loadAttendance();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT":
        return "bg-green-500";
      case "ABSENT":
        return "bg-red-500";
      case "LATE":
        return "bg-yellow-500";
      case "HALF-DAY":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const filterByMonth = (dateString, selectedMonth) => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return yearMonth === selectedMonth;
    } catch (error) {
      console.error("Date parsing error:", error);
      return false;
    }
  };

  const filteredAttendance = attendance.filter((d) => {
    if (!d?.date) return false;
    
    const matchesMonth = filterByMonth(d.date, month);
    const matchesStatus = statusFilter === "ALL" || d.status?.toUpperCase() === statusFilter;
    const employeeName = `${d.user?.firstName || ""} ${d.user?.lastName || ""}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
        employeeName.includes(searchTerm.toLowerCase()) || 
        (d.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesMonth && matchesStatus && matchesSearch;
  });

  const totalPresent = filteredAttendance.filter(d => d.status?.toUpperCase() === "PRESENT").length;
  const totalAbsent = filteredAttendance.filter(d => d.status?.toUpperCase() === "ABSENT").length;
  const totalLate = filteredAttendance.filter(d => d.status?.toUpperCase() === "LATE").length;
  const avgWorkingHours = filteredAttendance.length > 0 
    ? filteredAttendance.reduce((sum, d) => sum + (parseFloat(d.workingHours) || 0), 0) / filteredAttendance.length
    : 0;

  const formatDate = (d) => {
    if (!d) return "--";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "--";
    }
  };
  
  const formatTime = (t) => {
    if (!t || t === "Invalid Date") return "--";
    try {
      return new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--";
    }
  };

  const getEmployeeName = (user) => {
    if (!user) return "Unknown User";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "No Name";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">All Attendance</h1>
              <p className="text-blue-100 mt-1">Admin Management Dashboard</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={loadAttendance}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Total Present</p>
            <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Total Absent</p>
            <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Total Late</p>
            <p className="text-2xl font-bold text-yellow-600">{totalLate}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Avg Working Hours</p>
            <p className="text-2xl font-bold text-blue-600">{avgWorkingHours.toFixed(1)} hrs</p>
          </div>
        </div>

        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="HALF-DAY">Half Day</option>
            </select>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAttendance.length} of {attendance.length} records
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Loading attendance records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Punch In</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Punch Out</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Hours</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-12">
                      <div className="text-gray-400">
                        <FaUser className="mx-auto text-4xl mb-2" />
                        <p>No attendance records found</p>
                        <p className="text-sm mt-1">
                          {attendance.length > 0 
                            ? `Try changing the month filter (Current: ${month})` 
                            : "No data available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((d) => (
                    <tr key={d._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {getEmployeeName(d.user)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {d.user?.email || "No email"}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-sm text-gray-900">{formatDate(d.date)}</div>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            try {
                              return new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' });
                            } catch {
                              return '';
                            }
                          })()}
                        </div>
                      </td>

                      <td className="p-4 text-sm text-gray-900">{formatTime(d.punchIn)}</td>
                      <td className="p-4 text-sm text-gray-900">{formatTime(d.punchOut)}</td>
                      
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">
                          {parseFloat(d.workingHours || 0).toFixed(1)} hrs
                        </div>
                        {d.workingHours < 9 && d.workingHours > 0 && (
                          <div className="text-xs text-yellow-600">
                            Short: {(9 - d.workingHours).toFixed(1)} hrs
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(d.status)}`}>
                          {d.status || "--"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin-history/${d.user?._id}`)}
                            className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white transition-colors"
                            title="View History"
                          >
                            <FaEye size={14} />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/edit-attendance/${d._id}`)}
                            className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg text-white transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>

                          <button
                            onClick={() => deleteAttendance(d._id)}
                            disabled={deletingId === d._id}
                            className="bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === d._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <FaTrash size={14} />
                            )}
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
        
        <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-500">
          Total Records: {filteredAttendance.length} | Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AdminAllAttendance;