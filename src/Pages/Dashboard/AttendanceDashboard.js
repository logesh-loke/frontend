import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";

const AttendanceDashboard = () => {
  const [history, setHistory] = useState([]);

  // ✅ FILTER STATE
  const [filters, setFilters] = useState({
    status: "ALL",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/history");

      if (!res || !res.ok) {
        setHistory([]);
        return;
      }

      const result = await res.json();
      const data = result?.data || [];

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  // ✅ HANDLE FILTER CHANGE
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ FILTER LOGIC
  const filteredHistory = history.filter((item) => {
    const itemDate = new Date(item.Date);

    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;

    const matchStatus =
      filters.status === "ALL" || item.Status === filters.status;

    const matchFrom = !from || itemDate >= from;
    const matchTo = !to || itemDate <= to;

    return matchStatus && matchFrom && matchTo;
  });

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">
        Attendance History
      </h2>

      {/* 🔍 FILTER UI */}
      <div className="flex gap-4 mb-4 flex-wrap">

        {/* Status */}
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="ALL">All</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
        </select>

        {/* From Date */}
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

        {/* To Date */}
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

      </div>

      {/* 📊 TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">

          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">In</th>
              <th className="p-2">Out</th>
              <th className="p-2">Hours</th>
              <th className="p-2">Late</th>
              <th className="p-2">Early Logout</th>
            </tr>
          </thead>

          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <tr key={index} className="border-t text-center">

                  <td className="p-2">{item.Date}</td>

                  <td
                    className={`p-2 font-semibold ${
                      item.Status === "ABSENT"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {item.Status}
                  </td>

                  <td className="p-2">{item.In}</td>
                  <td className="p-2">{item.Out}</td>

                  <td className="p-2">
                    {item.ProductionHours} hrs
                  </td>

                  <td className="p-2">
                    {item.Late ? `${item.Late} min` : "--"}
                  </td>

                  <td className="p-2">
                    {item.EarlyLogout ? `${item.EarlyLogout} min` : "--"}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default AttendanceDashboard;