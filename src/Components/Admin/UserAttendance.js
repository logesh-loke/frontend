import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaChartLine, FaUsers,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

function AdminUserAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0
  });

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await apiFetch("/api/v1/admin/attendance/today");

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();
        console.log("API:", data);

        const attendanceData = data.data || [];
        setRecords(attendanceData);

        const total = attendanceData.length;
        const present = attendanceData.filter(r => 
          r.attendance_status?.toLowerCase() === 'present'
        ).length;
        const late = attendanceData.filter(r => 
          parseInt(r.lateMinutes) > 0
        ).length;
        const absent = attendanceData.filter(r => 
          r.attendance_status?.toLowerCase() === 'absent' || !r.punch_in
        ).length;

        setStats({ total, present, absent, late });

      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><FaCheckCircle size={10} /> Present</span>;
      case 'absent':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><FaTimesCircle size={10} /> Absent</span>;
      case 'late':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"><FaExclamationTriangle size={10} /> Late</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const formatTime = (time) => {
    if (!time) return "--";
    try {
      return new Date(time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return "--";
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading today's attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaClock className="text-blue-600" />
            Today's Attendance
          </h1>
          <p className="text-gray-600 mt-2">{formatDate()}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Present Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.present}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(stats.present / stats.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.present / stats.total) * 100).toFixed(1)}% attendance rate
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Absent Today</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Late Arrivals</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.late}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <FaExclamationTriangle className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Attendance Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {records.length} employee{records.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Punch In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Punch Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Late (Login)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Early (Logout)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.length > 0 ? (
                  records.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {r.firstname?.[0]}{r.lastname?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {r.firstname} {r.lastname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{r.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaSignInAlt className="text-green-500 text-xs" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatTime(r.punch_in)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaSignOutAlt className="text-red-500 text-xs" />
                          <span className="text-sm text-gray-900">
                            {formatTime(r.punch_out)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(r.attendance_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parseInt(r.lateMinutes) > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-600">
                            <FaExclamationTriangle size={12} />
                            {r.lateMinutes} min
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">On time</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parseInt(r.earlyLogout) > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600">
                            <FaExclamationTriangle size={12} />
                            {r.earlyLogout} min
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Full day</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaClock className="text-gray-400 text-5xl" />
                        <p className="text-gray-500 text-lg">No attendance records found </p>
                        <p className="text-gray-400 text-sm">No employees have checked in today</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {records.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-blue-500" />
                  <span>Summary: {stats.present} Present, {stats.absent} Absent, {stats.late} Late</span>
                </div>
                <div>
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUserAttendance;