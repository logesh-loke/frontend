import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";
import AttendanceChart from "../Charts/AttendanceChart";

const AttendanceCard = () => {
  const [status, setStatus] = useState("idle");
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [workingMinutes, setWorkingMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [chartData, setChartData] = useState([]);

  const TARGET_WORKING_MINUTES = 540;

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          reject(new Error("Location permission denied"));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    });
  };

  const formatTime = (time) => {
    if (!time || time === "Invalid Date") {
      return "--:--";
    }
    return time;
  };

  const calculateWorkingMinutes = (timeString) => {
    if (!timeString) return 0;

    try {
      const today = new Date();
      const fullDate = new Date(`${today.toDateString()} ${timeString}`);

      if (isNaN(fullDate.getTime())) {
        return 0;
      }

      const diff = (new Date() - fullDate) / 60000;
      return Math.max(0, Math.floor(diff));
    } catch {
      return 0;
    }
  };

  const loadToday = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/today");
      if (!res || !res.ok) return;

      const result = await res.json();
      const data = result?.data;

      if (!data || !data.punch_in) {
        setStatus("idle");
        setPunchInTime(null);
        setPunchOutTime(null);
        setWorkingMinutes(0);
        return;
      }

      const punchIn = data.punch_in;
      const punchOut = data.punch_out && data.punch_out !== "Invalid Date" ? data.punch_out : null;

      setPunchInTime(punchIn);
      setPunchOutTime(punchOut);

      if (punchOut) {
        setStatus("out");
        const backendHours = parseFloat(data.working_hours || 0);
        setWorkingMinutes(Math.floor(backendHours * 60));
      } else {
        setStatus("in");
        setWorkingMinutes(calculateWorkingMinutes(punchIn));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistoryForChart = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/history");
      if (!res || !res.ok) {
        setChartData([]);
        return;
      }

      const result = await res.json();
      const apiData = result?.data || [];

      const formattedData = apiData.map((item) => ({
        Date: item.date,
        ProductionHours: parseFloat(item.working_hours || 0),
        Status: item.status || "ABSENT",
      }));

      const sortedData = formattedData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      setChartData(sortedData);
    } catch (err) {
      console.error(err);
      setChartData([]);
    }
  };

  useEffect(() => {
    loadToday();
    loadHistoryForChart();
  }, [refresh]);

  useEffect(() => {
    let timer;
    if (status === "in" && punchInTime) {
      timer = setInterval(() => {
        setWorkingMinutes(calculateWorkingMinutes(punchInTime));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, punchInTime]);

  const canPunchOut = () => {
    return workingMinutes >= 180;
  };

  const getProgress = () => {
    return Math.min((workingMinutes / TARGET_WORKING_MINUTES) * 100, 100);
  };

  const handlePunchIn = async () => {
    if (status === "in") {
      alert("Already punched in today");
      return;
    }

    if (status === "out") {
      alert("Attendance already completed for today");
      return;
    }

    try {
      setLoading(true);
      const { latitude, longitude } = await getLocation();
      const res = await apiFetch("/api/v1/punch-in", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!canPunchOut()) {
      alert("You can punch out after 3 hours");
      return;
    }

    try {
      setLoading(true);
      const { latitude, longitude } = await getLocation();
      const res = await apiFetch("/api/v1/punch-out", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isIn = status === "in";
  const presentCount = chartData.filter((d) => d.Status?.toUpperCase() === "PRESENT").length;
  const absentCount = chartData.filter((d) => d.Status?.toUpperCase() === "ABSENT").length;

  return (
    <div className="space-y-6">
      <div className="max-w-2xl rounded-xl border bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p
              className={`text-sm font-semibold ${
                status === "in"
                  ? "text-green-600"
                  : status === "out"
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {status === "in" ? "PRESENT" : status === "out" ? "COMPLETED" : "NOT STARTED"}
            </p>

            <p className="mt-2 text-sm">
              <span className="font-medium">Punch In:</span> {formatTime(punchInTime)}
            </p>

            {punchOutTime && (
              <p className="mt-1 text-sm">
                <span className="font-medium">Punch Out:</span> {formatTime(punchOutTime)}
              </p>
            )}
          </div>

          <button
            onClick={isIn ? handlePunchOut : handlePunchIn}
            disabled={loading || (isIn && !canPunchOut()) || status === "out"}
            className={`rounded-lg px-6 py-2 font-semibold text-white transition-colors ${
              isIn
                ? "bg-red-500 hover:bg-red-600"
                : status === "out"
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-500 hover:bg-green-600"
            } disabled:opacity-50`}
          >
            {loading
              ? "Processing..."
              : status === "out"
              ? "COMPLETED"
              : isIn
              ? "PUNCH OUT"
              : "PUNCH IN"}
          </button>
        </div>
              <div className="mb-1 mt-1 flex justify-between text-sm text-gray-600">
                <span>Shift: 09:30 AM – 06:30 PM</span>
                
              </div>

        {status !== "idle" && (
          <>
            <div className="mt-5">
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <p className="font-semibold text-gray-700">Working Hours:</p>
              <p className="font-medium text-gray-900">
                {Math.floor(workingMinutes / 60)} hrs {workingMinutes % 60} mins
              </p>
            </div>
            {status === "in" && workingMinutes >= 540 && (
              <p className="mt-2 text-xs text-green-600">
                🎉 Congratulations! You've reached the 9-hour target!
              </p>
            )}
          </>
        )}
      </div>
      <AttendanceChart data={chartData} />
    </div>
  );
};

export default AttendanceCard;