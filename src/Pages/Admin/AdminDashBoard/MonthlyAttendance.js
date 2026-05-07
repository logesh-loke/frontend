import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../../Services/Api";

const AdminMonthlyAttendance = () => {
  const { userId } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // LOAD MONTHLY DATA

  const loadMonthlyAttendance = async () => {
    try {
      setLoading(true);

      const res = await apiFetch(
        `/api/v1/admin/attendance/monthly/${userId}?month=${month}`
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load");
      }

      setData(result?.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadMonthlyAttendance();
  }, [userId, month]);

  // FORMAT TIME
  const formatTime = (t) => {
    if (!t) return "--";
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-4">

      <h2 className="text-xl font-bold">
        Monthly Attendance (Admin)
      </h2>

      {/* MONTH SELECTOR */}
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="border p-2 rounded"
      />

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* TABLE */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full border mt-4 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Punch In</th>
                <th className="p-2 border">Punch Out</th>
                <th className="p-2 border">Hours</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="border p-2">{item.date}</td>
                    <td className="border p-2">
                      {formatTime(item.punchIn)}
                    </td>
                    <td className="border p-2">
                      {formatTime(item.punchOut)}
                    </td>
                    <td className="border p-2">
                      {item.workingHours || 0}
                    </td>
                    <td
                      className={`border p-2 font-semibold ${
                        item.status === "Present"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMonthlyAttendance;