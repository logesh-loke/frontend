import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";
import { FaCalendarCheck, FaCalendarTimes, FaChartLine, FaFire, FaClock, FaSignInAlt, FaSignOutAlt,FaHourglassHalf,FaFilter} from "react-icons/fa";

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

  // HELPER: PARSE TIME STRING
  
  const parseTimeString = (timeStr) => {
    if (!timeStr) return null;
    
    // If it's already a Date object or ISO string
    if (timeStr instanceof Date) return timeStr;
    if (timeStr.includes('T') && !timeStr.includes('am') && !timeStr.includes('pm')) {
      return new Date(timeStr);
    }
    
    // Handle time format like "12:50:13 am" or "12:50:13 pm"
    try {
      const match = timeStr.match(/(\d+):(\d+):(\d+)\s+(am|pm)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const ampm = match[4].toLowerCase();
        
        if (ampm === 'pm' && hours !== 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;
        
        const date = new Date();
        date.setHours(hours, minutes, seconds, 0);
        return date;
      }
    } catch (e) {
      console.error("Time parse error:", e);
    }
    
    return null;
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "--";
    
    // If it's a time string like "12:50:13 am"
    if (typeof timeStr === 'string' && (timeStr.includes('am') || timeStr.includes('pm'))) {
      return timeStr;
    }
    
    // If it's a Date object or ISO string
    const date = parseTimeString(timeStr);
    if (date && !isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return "--";
  };

  // GET ALL DATES IN RANGE
  
  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // LOAD LAST 30 DAYS DATA

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/v1/attendance/history");

      if (!res || !res.ok) {
        setHistory([]);
        return;
      }

      const result = await res.json();
      let data = result?.data || [];

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      // Calculate date 30 days ago from today
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
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

  // FILTER HANDLER

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // FILTER LOGIC

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

  // SUMMARY COUNTS

  const presentCount = history.filter(
    (i) => i.status?.toUpperCase() === "PRESENT"
  ).length;

  const absentCount = history.filter(
    (i) => i.status?.toUpperCase() === "ABSENT"
  ).length;

  // FORMATTERS

  const formatDate = (date) => {
    if (!date) return "--";
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "--";
    }
  };

  // GET WORKING HOURS DISPLAY

  const getWorkingHoursDisplay = (hours) => {
    if (!hours || hours === 0) return "--";
    return `${parseFloat(hours).toFixed(1)} hrs`;
  };

  const getLateDisplay = (minutes) => {
    if (!minutes || minutes === 0) return "--";
    return `${minutes} min`;
  };

  // UI

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartLine className="text-blue-600" />
            Attendance Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Last 30 Days: {new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* SUMMARY CARDS */}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
        
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Present</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{presentCount}</p>
                <p className="text-xs text-green-600 mt-1">days</p>
              </div>
              <FaCalendarCheck className="text-green-500 text-3xl opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium">Absent</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{absentCount}</p>
                <p className="text-xs text-red-600 mt-1">days</p>
              </div>
              <FaCalendarTimes className="text-red-500 text-3xl opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Days</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{history.length}</p>
                <p className="text-xs text-blue-600 mt-1">last 30 days</p>
              </div>
              <FaClock className="text-blue-500 text-3xl opacity-50" />
            </div>
          </div>
        </div>

        
        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-500" />
            <h3 className="font-semibold text-gray-700">Filter Records</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    status: "ALL",
                    fromDate: "",
                    toDate: "",
                  });
                }}
                className="w-30 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
              
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Punch In</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Punch Out</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Working Hours</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Late</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Early</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item, index) => {
                    const status = item?.status?.toUpperCase();
                    const dateObj = item.date ? new Date(item.date) : null;
                    const isToday = dateObj?.toDateString() === new Date().toDateString();

                    return (
                      <tr key={index} className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50' : ''}`}>
                        <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-gray-900">{formatDate(item.date)}</div>
                          {isToday && <span className="text-xs text-blue-600 font-medium">Today</span>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            status === "ABSENT"
                              ? "bg-red-100 text-red-700"
                              : status === "PRESENT"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {status === "PRESENT" ? <FaSignInAlt size={10} /> : <FaCalendarTimes size={10} />}
                            {item.status || "--"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            {status === "PRESENT" && item.punch_in && (
                              <>
                                <FaClock className="text-green-500 text-xs" />
                                {formatDisplayTime(item.punch_in)}
                              </>
                            )}
                            {status !== "PRESENT" && "—"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            {status === "PRESENT" && item.punch_out ? (
                              <>
                                <FaSignOutAlt className="text-red-500 text-xs" />
                                {formatDisplayTime(item.punch_out)}
                              </>
                            ) : "—"}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-700">
                          {status === "PRESENT" ? getWorkingHoursDisplay(item.working_hours) : "—"}
                        </td>
                        <td className="p-4">
                          {status === "PRESENT" && item.late_login_mins > 0 ? (
                            <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                              <FaHourglassHalf size={12} />
                              {getLateDisplay(item.late_login_mins)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-4">
                          {status === "PRESENT" && item.early_logout_mins > 0 ? (
                            <span className="inline-flex items-center gap-1 text-sm text-orange-600">
                              <FaHourglassHalf size={12} />
                              {getLateDisplay(item.early_logout_mins)}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FaCalendarTimes className="text-4xl text-gray-400" />
                        <p>No records found for the selected filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Showing attendance for the last 30 days ({history.length} days)
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;