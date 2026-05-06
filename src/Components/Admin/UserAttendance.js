import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";

function AttendanceHistory() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await apiFetch("/api/v1/attendance/history");

        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await res.json();

        console.log("HISTORY 👉", data);

        // ✅ backend already returns formatted array
        setRecords(data || []);
      } catch (err) {
        console.error("History error:", err);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Attendance History
      </h2>

      <table className="w-full border text-center">
        <thead className="bg-gray-200">
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Punch In</th>
            <th>Punch Out</th>
            <th>Hours</th>
            <th>Late (mins)</th>
            <th>Early Exit</th>
          </tr>
        </thead>

        <tbody>
          {records.length > 0 ? (
            records.map((r, i) => (
              <tr key={i} className="border-t">

                {/* ✅ Date */}
                <td>{r.Date}</td>

                {/* ✅ Status */}
                <td>{r.Status}</td>

                {/* ✅ Punch In (MAIN) */}
                <td className="text-green-600 font-semibold">
                  {r.In || "--"}
                </td>

                {/* ✅ Punch Out */}
                <td className="text-red-600 font-semibold">
                  {r.Out || "--"}
                </td>

                {/* ✅ Working Hours */}
                <td>{r.ProductionHours} hrs</td>

                {/* ✅ Late */}
                <td>{r.Late} min</td>

                {/* ✅ Early Logout */}
                <td>{r.EarlyLogout} min</td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-4">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceHistory;