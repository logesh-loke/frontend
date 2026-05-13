// File: Components/Admin/AttendanceHistoryModal.jsx
import React, { useEffect, useState } from "react";
import { FaTimes, FaCalendarTimes, FaSignInAlt, FaSignOutAlt, FaCalendarAlt } from "react-icons/fa";
import { apiFetch } from "../../../../Services/Api";
import { toast } from "react-toastify";

const AttendanceHistoryModal = ({ isOpen, onClose, user, token }) => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState({
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,
    totalDays: 0
  });

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserHistory("", "");
    }
  }, [isOpen, user]);

  // Re-fetch when date filters change
  useEffect(() => {
    if (isOpen && user) {
      fetchUserHistory(startDate, endDate);
    }
  }, [startDate, endDate]);

  // Parse date string as LOCAL date to avoid UTC timezone shift
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const clean = dateStr.split("T")[0];
    const [y, m, d] = clean.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const fetchUserHistory = async (start = "", end = "") => {
    if (!user?.user_id) {
      toast.error("User ID not found");
      return;
    }

    try {
      setLoading(true);

      // Build query with date params
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);
      const query = params.toString();
      const url = `/api/v1/admin/attendance/monthly/${user.user_id}${query ? `?${query}` : ""}`;

      const res = await apiFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to load history");

      // Handle different response structures
      let historyData = [];
      if (result?.data && Array.isArray(result.data)) {
        historyData = result.data;
      } else if (result?.attendance && Array.isArray(result.attendance)) {
        historyData = result.attendance;
      } else if (Array.isArray(result)) {
        historyData = result;
      } else if (result?.records && Array.isArray(result.records)) {
        historyData = result.records;
      }

      // Filter out future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filteredData = historyData.filter(item => {
        const itemDate = parseLocalDate(item.date);
        return itemDate && itemDate <= today;
      });

      // Sort newest first
      const sortedHistory = filteredData.sort(
        (a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)
      );

      setHistory(sortedHistory);
      setFilteredHistory(sortedHistory);
      calculateStats(sortedHistory);

      if (sortedHistory.length === 0) {
        toast.info("No attendance records found for this range");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load history");
      setHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const presentCount = data.filter(h => h.status?.toUpperCase() === "PRESENT").length;
    const absentCount = data.filter(h => h.status?.toUpperCase() === "ABSENT").length;
    const attendanceRate = data.length > 0 ? ((presentCount / data.length) * 100).toFixed(1) : 0;
    setStats({ presentCount, absentCount, attendanceRate, totalDays: data.length });
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-300";
    switch (status?.toUpperCase()) {
      case "PRESENT": return "bg-green-500";
      case "ABSENT": return "bg-red-500";
      case "LATE": return "bg-yellow-500";
      case "HALF-DAY": return "bg-orange-500";
      case "OFF": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
      const d = parseLocalDate(dateStr);
      return d ? d.toLocaleDateString() : "--";
    } catch {
      return "--";
    }
  };

  const formatTime = (time) => {
    if (!time) return "--";
    try {
      if (typeof time === "string" && (time.includes("am") || time.includes("pm"))) {
        const match = time.match(/(\d{1,2}):(\d{2}):\d{2}\s+(am|pm)/i);
        if (match) {
          let hour = parseInt(match[1]);
          const minute = match[2];
          const period = match[3].toLowerCase();
          if (period === "pm" && hour !== 12) hour += 12;
          if (period === "am" && hour === 12) hour = 0;
          return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        }
        return time.split(" ")[0];
      }
      return new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "--";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Attendance History</h2>
              <p className="mt-1 text-blue-100">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-sm text-blue-100">{user?.email}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          {/* Date Range Filter */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Filter by Date Range</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                  min={startDate}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={clearDateFilters}
                  className="rounded-lg bg-red-100 px-4 py-2 text-red-600 transition hover:bg-red-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
            {(startDate || endDate) && (
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredHistory.length} records
                {startDate && endDate && ` from ${startDate} to ${endDate}`}
                {startDate && !endDate && ` from ${startDate}`}
                {!startDate && endDate && ` up to ${endDate}`}
              </div>
            )}
          </div>

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
                  <p className="text-xs text-green-600">total records</p>
                </div>
                <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="text-sm text-red-600 font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-700">{stats.absentCount}</p>
                  <p className="text-xs text-red-600">total records</p>
                </div>
                <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                  <p className="text-sm text-blue-600 font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalDays}</p>
                  <p className="text-xs text-blue-600">all time</p>
                </div>
                <div className="rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4">
                  <p className="text-sm text-purple-600 font-medium">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.attendanceRate}%</p>
                  <p className="text-xs text-purple-600">of total records</p>
                </div>
              </div>

              {/* Progress Bar */}
              {stats.totalDays > 0 && (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                    <span className="text-sm font-medium text-gray-700">{stats.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${stats.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              )}

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
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((record, idx) => {
                        const dateObj = parseLocalDate(record.date);
                        const isToday =
                          dateObj && dateObj.toDateString() === new Date().toDateString();
                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-gray-50 ${isToday ? "bg-blue-50" : ""}`}
                          >
                            <td className="p-3 text-sm text-gray-500">{idx + 1}</td>
                            <td className="p-3">
                              <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                              {isToday && (
                                <span className="text-xs text-blue-600 font-medium">Today</span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {dateObj
                                ? dateObj.toLocaleDateString(undefined, { weekday: "short" })
                                : "--"}
                            </td>
                            <td className="p-3">
                              {record.status ? (
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold text-white ${getStatusColor(record.status)}`}
                                >
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
                                {record.punch_in && (
                                  <FaSignInAlt className="text-green-500 text-xs" />
                                )}
                                {record.punch_in ? formatTime(record.punch_in) : "--"}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                {record.punch_out && (
                                  <FaSignOutAlt className="text-red-500 text-xs" />
                                )}
                                {record.punch_out ? formatTime(record.punch_out) : "--"}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {record.working_hours && record.working_hours !== "0.00"
                                ? `${parseFloat(record.working_hours).toFixed(1)} hrs`
                                : "--"}
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
        <div className="sticky bottom-0 border-t bg-gray-50 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {filteredHistory.length > 0 ? (
              <>Showing {filteredHistory.length} attendance records</>
            ) : (
              <>No records found</>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryModal;