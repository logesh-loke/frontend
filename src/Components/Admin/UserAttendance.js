import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";

function AdminUserAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await apiFetch("/api/v1/admin/attendance/today");

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();

        console.log("📦 API:", data);

        //  IMPORTANT: your backend sends { success, data }
        setRecords(data.data || []);

      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Today Attendance
      </h2>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Punch In</th>
            <th>Status</th>
            <th>Late (min)</th>
          </tr>
        </thead>

        <tbody>
          {records.length > 0 ? (
            records.map((r, i) => (
              <tr key={i} className="text-center border-t">
                <td>{r.firstname} {r.lastname}</td>

                <td>{r.email}</td>

                <td>
                  {r.punch_in
                    ? new Date(r.punch_in).toLocaleTimeString()
                    : "-"}
                </td>

                <td>{r.attendance_status}</td>

                <td>{r.lateMinutes}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No attendance found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserAttendance;