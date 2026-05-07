import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";

const AttendanceDashboard = () => {
  const [history, setHistory] = useState([]);

  const [filters, setFilters] = useState({
    status: "ALL",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    loadHistory();
  }, []);

  // ========================================
  // LOAD LAST 30 DAYS HISTORY
  // ========================================

  const loadHistory = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/history");

      if (!res || !res.ok) {
        setHistory([]);
        return;
      }

      const result = await res.json();

      const data = result?.data || [];

      // ✅ SORT LATEST FIRST
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );

      // ✅ TAKE LAST 30 RECORDS
      const last30Days = sortedData.slice(0, 30);

      setHistory(last30Days);
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  // ========================================
  // HANDLE FILTER
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
    const itemDate = item.date
      ? new Date(item.date)
      : null;

    const from = filters.fromDate
      ? new Date(filters.fromDate)
      : null;

    const to = filters.toDate
      ? new Date(filters.toDate)
      : null;

    const matchStatus =
      filters.status === "ALL" ||
      item.status === filters.status;

    const matchFrom =
      !from || !itemDate || itemDate >= from;

    const matchTo =
      !to || !itemDate || itemDate <= to;

    return matchStatus && matchFrom && matchTo;
  });

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">
        Last 30 Days Attendance
      </h2>

      {/* FILTERS */}

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="ALL">All</option>
          <option value="PRESENT">
            Present
          </option>
          <option value="ABSENT">
            Absent
          </option>
        </select>

        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">
                Date
              </th>

              <th className="p-2 border">
                Status
              </th>

              <th className="p-2 border">
                Punch In
              </th>

              <th className="p-2 border">
                Punch Out
              </th>

              <th className="p-2 border">
                Working Hours
              </th>

              <th className="p-2 border">
                Late Login
              </th>

              <th className="p-2 border">
                Early Logout
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map(
                (item, index) => (
                  <tr
                    key={index}
                    className="border-t text-center"
                  >
                    <td className="p-2 border">
                      {item.date || "--"}
                    </td>

                    <td
                      className={`p-2 border font-semibold ${
                        item.status ===
                        "ABSENT"
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {item.status || "--"}
                    </td>

                    <td className="p-2 border">
                      {item.punch_in ||
                        "--"}
                    </td>

                    <td className="p-2 border">
                      {item.punch_out ||
                        "--"}
                    </td>

                    <td className="p-2 border">
                      {item.working_hours ||
                        "0.00"}{" "}
                      hrs
                    </td>

                    <td className="p-2 border">
                      {item.late_login_mins
                        ? `${item.late_login_mins} min`
                        : "--"}
                    </td>

                    <td className="p-2 border">
                      {item.early_logout_mins
                        ? `${item.early_logout_mins} min`
                        : "--"}
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="p-4 text-center"
                >
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