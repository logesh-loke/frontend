import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";

const AttendanceDashboard = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/history");

      if (!res.ok) {
        setHistory([]);
        return;
      }

      const result = await res.json();

      const data =
        result?.data ||
        result?.history ||
        (Array.isArray(result) ? result : []);

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  return (
    <div>
      <h2>Attendance History</h2>

      {history.length > 0 ? (
        history.map((item, index) => (
          <div key={index}>
            {item.punchIn} - {item.punchOut}
          </div>
        ))
      ) : (
        <p>No attendance records</p>
      )}
    </div>
  );
};

export default AttendanceDashboard;