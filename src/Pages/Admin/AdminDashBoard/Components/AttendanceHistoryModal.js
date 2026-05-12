// File: Components/Admin/AttendanceHistoryModal.js
import React, { useEffect, useState } from "react";
import { FaTimes, FaCalendarTimes, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { apiFetch } from "../../../../Services/Api";
import { toast } from "react-toastify";

const AttendanceHistoryModal = ({ isOpen, onClose, user, token }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);  
  const [stats, setStats] = useState({
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,
    totalDays: 30
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchUserHistory();
    }
  }, [isOpen, user]);

  const fetchUserHistory = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    try {
      setLoading(true);
      // Fixed API endpoint with userId parameter
      const res = await apiFetch(`/api/v1/admin/attendance/monthly/${user.id}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        }
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result?.message || "Failed to load history");
      
      const historyData = result?.data || [];
      const last30Days = getLast30DaysDates();
      const attendanceMap = new Map();
      
      historyData.forEach(item => {
        if (item.date) {
          // Create consistent date key
          const dateKey = new Date(item.date).toDateString();
          attendanceMap.set(dateKey, item);
        }
      });
      
      const completeHistory = last30Days.map(date => {
        const dateKey = date.toDateString();
        const existingRecord = attendanceMap.get(dateKey);
        if (existingRecord) return existingRecord;
        return {
          date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          status: "",
          punch_in: null,
          punch_out: null,
          working_hours: 0,
          late_login_mins: 0,
          early_logout_mins: 0,
        };
      });
      
      const sortedHistory = completeHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sortedHistory);
      
      // Count only PRESENT and ABSENT status (excluding OFF, empty, etc.)
      const presentCount = sortedHistory.filter(h => h.status?.toUpperCase() === "PRESENT").length;
      const absentCount = sortedHistory.filter(h => h.status?.toUpperCase() === "ABSENT").length;
      const attendanceRate = sortedHistory.length > 0 ? ((presentCount / sortedHistory.length) * 100).toFixed(1) : 0;
      
      setStats({ presentCount, absentCount, attendanceRate, totalDays: sortedHistory.length });
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const getLast30DaysDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-300";
    switch (status?.toUpperCase()) {
      case "PRESENT": return "bg-green-500";
      case "ABSENT": return "bg-red-500";
      case "LATE": return "bg-yellow-500";
      case "OFF": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (date) => {
    if (!date) return "--";
    try {
      return new Date(date).toLocaleDateString();
    } catch { return "--"; }
  };

  const formatTime = (time) => {
    if (!time) return "--";
    // Time is already in format like "02:56:53 pm" or "10:36:15 am"
    try {
      // If it's already formatted, just extract hour:minute am/pm
      if (typeof time === 'string' && (time.includes('am') || time.includes('pm'))) {
        const match = time.match(/(\d{1,2}):(\d{2}):\d{2}\s+(am|pm)/i);
        if (match) {
          let hour = parseInt(match[1]);
          const minute = match[2];
          const period = match[3].toLowerCase();
          if (period === 'pm' && hour !== 12) hour += 12;
          if (period === 'am' && hour === 12) hour = 0;
          return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: true 
          });
        }
        return time.split(' ')[0]; // Return time without seconds
      }
      // Try parsing as full date
      return new Date(time).toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      });
    } catch { return "--"; }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">30 Days Attendance History</h2>
              <p className="mt-1 text-blue-100">{user?.firstname} {user?.lastname}</p>
              <p className="text-sm text-blue-100">{user?.email}</p>
            </div>
            <button onClick={onClose} className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Loading history...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <p className="text-sm text-green-600 font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-700">{stats.presentCount}</p>
                  <p className="text-xs text-green-600">out of {stats.totalDays} days</p>
                </div>
                <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="text-sm text-red-600 font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-700">{stats.absentCount}</p>
                  <p className="text-xs text-red-600">out of {stats.totalDays} days</p>
                </div>
                <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                  <p className="text-sm text-blue-600 font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalDays}</p>
                  <p className="text-xs text-blue-600">last 30 days</p>
                </div>
                <div className="rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4">
                  <p className="text-sm text-purple-600 font-medium">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.attendanceRate}%</p>
                  <p className="text-xs text-purple-600">overall</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Attendance Rate (Last 30 Days)</span>
                  <span className="text-sm font-medium text-gray-700">{stats.attendanceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${stats.attendanceRate}%` }}></div>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600">#</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600">Date</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600">Day</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600">Punch In</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600">Punch Out</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.length > 0 ? (
                      history.map((record, idx) => {
                        const dateObj = new Date(record.date);
                        const isToday = dateObj.toDateString() === new Date().toDateString();
                        return (
                          <tr key={idx} className={`hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}>
                            <td className="p-3 text-sm text-gray-500">{idx + 1}</td>
                            <td className="p-3">
                              <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                              {isToday && <span className="text-xs text-blue-600 font-medium">Today</span>}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {dateObj.toLocaleDateString(undefined, { weekday: 'short' })}
                            </td>
                            <td className="p-3">
                              {record.status ? (
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold text-white ${getStatusColor(record.status)}`}>
                                  {record.status}
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200">
                                  --
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                {record.punch_in && <FaSignInAlt className="text-green-500 text-xs" />}
                                {record.punch_in ? formatTime(record.punch_in) : "--"}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                {record.punch_out && <FaSignOutAlt className="text-red-500 text-xs" />}
                                {record.punch_out ? formatTime(record.punch_out) : "--"}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {record.working_hours && record.working_hours !== "0.00" ? `${parseFloat(record.working_hours).toFixed(1)} hrs` : "--"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-500">
                          <FaCalendarTimes className="mx-auto text-3xl text-gray-400 mb-2" />
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-gray-50 p-4">
          <button onClick={onClose} className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryModal;