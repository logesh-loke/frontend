import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";

const AttendanceDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "ALL",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    loadHistory();
  }, []);

  // ========================================
  // HELPER: GET ALL DATES IN RANGE
  // ========================================
  
  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // ========================================
  // LOAD LAST 30 DAYS DATA
  // ========================================

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/v1/attendance/history");

      if (!res || !res.ok) {
        setHistory([]);
        return;
      }

      const result = await res.json();
      const data = result?.data || [];

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      // Calculate date 30 days ago from today
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // -29 to include today (total 30 days)
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = today;

      // Get all dates in range (last 30 days)
      const allDates = getDatesInRange(startDate, endDate);
      
      // Create a map of attendance data by date string
      const attendanceMap = new Map();
      data.forEach((item) => {
        if (item.date) {
          const dateKey = new Date(item.date).toDateString();
          attendanceMap.set(dateKey, item);
        }
      });

      // Generate complete attendance with ABSENT for missing dates
      const completeAttendance = allDates.map((date) => {
        const dateKey = date.toDateString();
        const existingRecord = attendanceMap.get(dateKey);
        
        if (existingRecord) {
          return existingRecord;
        }
        
        // Return ABSENT record for dates without attendance
        return {
          date: date.toISOString(),
          status: "ABSENT",
          punch_in: null,
          punch_out: null,
          working_hours: 0,
          late_login_mins: 0,
          early_logout_mins: 0,
        };
      });

      // Sort by date descending (newest first)
      const sortedAttendance = completeAttendance.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setHistory(sortedAttendance);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FILTER HANDLER
  // ========================================

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // ========================================
  // FILTER LOGIC
  // ========================================

  const filteredHistory = history.filter((item) => {
    const itemDate = item?.date ? new Date(item.date) : null;
    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;

    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);

    const status = item?.status?.toUpperCase();

    const matchStatus =
      filters.status === "ALL" ||
      status === filters.status;

    const matchFrom = !from || !itemDate || itemDate >= from;
    const matchTo = !to || !itemDate || itemDate <= to;

    return matchStatus && matchFrom && matchTo;
  });

  // ========================================
  // SUMMARY COUNTS (for last 30 days only)
  // ========================================

  const presentCount = history.filter(
    (i) => i.status?.toUpperCase() === "PRESENT"
  ).length;

  const absentCount = history.filter(
    (i) => i.status?.toUpperCase() === "ABSENT"
  ).length;

  const attendanceRate = history.length > 0 
    ? ((presentCount / history.length) * 100).toFixed(1) 
    : 0;

  // ========================================
  // FORMATTERS
  // ========================================   

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "--";

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--";

  // ========================================
  // GET CONSECUTIVE STREAK
  // ========================================

  const getCurrentStreak = () => {
    let streak = 0;
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = sortedHistory.length - 1; i >= 0; i--) {
      if (sortedHistory[i].status?.toUpperCase() === "PRESENT") {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // ========================================
  // UI
  // ========================================

  if (loading) {
    return (
      <div className="mt-6 text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-7xl mx-auto px-4">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Attendance Dashboard
        </h2>
        <p className="text-gray-500 text-sm">
          Last 30 Days: {new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-green-600 font-medium">Present</div>
          <div className="text-3xl font-bold text-green-700">{presentCount}</div>
          <div className="text-xs text-green-600 mt-1">days</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-red-600 font-medium">Absent</div>
          <div className="text-3xl font-bold text-red-700">{absentCount}</div>
          <div className="text-xs text-red-600 mt-1">days</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-blue-600 font-medium">Total Days</div>
          <div className="text-3xl font-bold text-blue-700">{history.length}</div>
          <div className="text-xs text-blue-600 mt-1">last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-purple-600 font-medium">Attendance Rate</div>
          <div className="text-3xl font-bold text-purple-700">{attendanceRate}%</div>
          <div className="text-xs text-purple-600 mt-1">
            {presentCount} / {history.length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-yellow-600 font-medium">Current Streak</div>
          <div className="text-3xl font-bold text-yellow-700">{getCurrentStreak()}</div>
          <div className="text-xs text-yellow-600 mt-1">consecutive days</div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
          <span className="text-sm font-medium text-gray-700">{attendanceRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${attendanceRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => {
              setFilters({
                status: "ALL",
                fromDate: "",
                toDate: "",
              });
            }}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Day</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Punch In</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Punch Out</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Working Hours</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Late</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Early</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, index) => {
                  const status = item?.status?.toUpperCase();
                  const dateObj = item.date ? new Date(item.date) : null;
                  const dayName = dateObj ? dateObj.toLocaleDateString(undefined, { weekday: 'short' }) : "--";
                  const isToday = dateObj?.toDateString() === new Date().toDateString();

                  return (
                    <tr key={index} className={`border-b hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}>
                      <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="p-3 text-sm font-medium text-gray-800">
                        {formatDate(item.date)}
                        {isToday && <span className="ml-2 text-xs text-blue-600 font-medium">Today</span>}
                       </td>
                      <td className="p-3 text-sm text-gray-600">{dayName}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          status === "ABSENT"
                            ? "bg-red-100 text-red-700"
                            : status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {item.status || "--"}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {status === "PRESENT" ? formatTime(item.punch_in) : "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {status === "PRESENT" ? formatTime(item.punch_out) : "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {status === "PRESENT" && item.working_hours 
                          ? `${item.working_hours} hrs` 
                          : "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {status === "PRESENT" && item.late_login_mins
                          ? `${item.late_login_mins} min`
                          : "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {status === "PRESENT" && item.early_logout_mins
                          ? `${item.early_logout_mins} min`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    No records found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-400">
        Showing attendance for the last 30 days ({history.length} days)
      </div>
    </div>
  );
};

export default AttendanceDashboard;