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
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/v1/admin/allattendance", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
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
    }
  };

  const deleteAttendance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      const res = await apiFetch(`localhost:8080/api/v1/delete/attendance/1${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Delete failed");
      toast.success("Attendance deleted successfully");
      loadAttendance();
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setDeletingId(null);
    }
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

  const filterByMonth = (dateString, selectedMonth) => {
    if (!dateString) return true;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return true;
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return yearMonth === selectedMonth;
    } catch { return true; }
  };

  const filteredAttendance = attendance.filter((d) => {
    const attendanceDate = d.date || d.attendanceDate || d.createdAt || d.punchIn;
    const matchesMonth = filterByMonth(attendanceDate, month);
    const matchesStatus = statusFilter === "ALL" || d.status?.toUpperCase() === statusFilter;
    const employeeName = `${d.user?.firstName || ""} ${d.user?.lastName || ""}`.toLowerCase();
    const email = (d.user?.email || "").toLowerCase();
    const matchesSearch = searchTerm === "" || employeeName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    return matchesMonth && matchesStatus && matchesSearch;
  });

  const totalPresent = filteredAttendance.filter(d => d.status?.toUpperCase() === "PRESENT").length;
  const totalAbsent = filteredAttendance.filter(d => d.status?.toUpperCase() === "ABSENT").length;
  const totalLate = filteredAttendance.filter(d => d.status?.toUpperCase() === "LATE").length;
  const avgWorkingHours = filteredAttendance.length > 0 
    ? (filteredAttendance.reduce((sum, d) => sum + (parseFloat(d.workingHours) || 0), 0) / filteredAttendance.length).toFixed(1)
    : "0.0";

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "--";
  const formatTime = (time) => time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--";
  const getEmployeeName = (user) => user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "No Name" : "Unknown User";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">All Attendance</h1>
              <p className="mt-1 text-blue-100">Admin Attendance Dashboard</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/admin/dashboard")} className="rounded-lg bg-white/20 px-4 py-2 text-white transition hover:bg-white/30">Dashboard</button>
              <button onClick={loadAttendance} className="rounded-lg bg-white/20 px-4 py-2 text-white transition hover:bg-white/30">Refresh</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 bg-gray-50 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Present</p>
            <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
          </div>
          <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Absent</p>
            <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
          </div>
          <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Late</p>
            <p className="text-2xl font-bold text-yellow-600">{totalLate}</p>
          </div>
          <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Avg Working Hours</p>
            <p className="text-2xl font-bold text-blue-600">{avgWorkingHours} hrs</p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by user name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="HALF-DAY">Half Day</option>
            </select>
          </div>
          <div className="mt-4 text-sm text-gray-600">Showing {filteredAttendance.length} of {attendance.length} records</div>
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
                    <td colSpan="7" className="p-12 text-center">
                      <FaUser className="mx-auto mb-2 text-4xl text-gray-400" />
                      <p className="text-gray-500">No attendance records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((d) => (
                    <tr key={d._id} className="border-b transition-colors hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{getEmployeeName(d.user)}</div>
                          <div className="text-xs text-gray-500">{d.user?.email || "No Email"}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{formatDate(d.date || d.attendanceDate || d.createdAt || d.punchIn)}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-900">{formatTime(d.punchIn)}</td>
                      <td className="p-4 text-sm text-gray-900">{formatTime(d.punchOut)}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{parseFloat(d.workingHours || 0).toFixed(1)} hrs</td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${getStatusColor(d.status)}`}>{d.status || "--"}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => navigate(`/admin-history/${d.user?._id}`)} className="rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"><FaEye size={14} /></button>
                          <button onClick={() => navigate(`/admin/edit-attendance/${d._id}`)} className="rounded-lg bg-yellow-500 p-2 text-white transition-colors hover:bg-yellow-600"><FaEdit size={14} /></button>
                          <button onClick={() => deleteAttendance(d._id)} disabled={deletingId === d._id} className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
                            {deletingId === d._id ? <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div> : <FaTrash size={14} />}
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
    </div>
  );
};

export default AdminAllAttendance;