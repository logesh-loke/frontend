import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../Services/Api";

function AdminUserAttendance() {
  const { userId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all attendance records
        const res = await apiFetch(`/api/v1/admin/allattendance`);

        if (!res.ok) throw new Error("Failed to fetch attendance data");

        const allRecords = await res.json();
        console.log("All API RESPONSE 👉", allRecords);
        
        // Filter records for the specific user
        // Try different possible field names based on your API response
        const userRecords = allRecords.filter(record => {
          return record.UserId === parseInt(userId) || 
                 record.userId === parseInt(userId) ||
                 record.user_id === parseInt(userId) ||
                 record.EmployeeId === parseInt(userId) ||
                 record.employeeId === parseInt(userId) ||
                 record.EmployeeID === userId ||
                 record.user_id === userId;
        });
        
        console.log(`Filtered records for user ${userId}: 👉`, userRecords);
        setRecords(userRecords);
        
      } catch (err) {
        console.error("Attendance error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadAttendance();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          User Attendance Details
        </h2>
        <p className="text-gray-600 mt-1">User ID: {userId}</p>
        <p className="text-sm text-gray-500 mt-1">Total Records: {records.length}</p>
      </div>

      {records.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded">
          <p className="font-medium">No attendance records found</p>
          <p className="text-sm mt-1">This user has no attendance records yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Punch In</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Punch Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Late (min)</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Early Exit (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.Date || record.date || "-"}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.In || record.in || record.punch_in || "-"}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.Out || record.out || record.punch_out || "-"}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(() => {
                      const status = record.Status || record.status;
                      switch(status) {
                        case "LATE":
                          return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">🔴 Late</span>;
                        case "ABSENT":
                          return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">⚫ Absent</span>;
                        case "OFF":
                          return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">🟡 Off</span>;
                        case "HALF_DAY":
                          return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">🟠 Half Day</span>;
                        default:
                          return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">🟢 Present</span>;
                      }
                    })()}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.ProductionHours || record.production_hours || record.working_hours || "-"}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.Late || record.late || "0"}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.EarlyLogout || record.early_logout || record.early_exit || "0"}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUserAttendance;