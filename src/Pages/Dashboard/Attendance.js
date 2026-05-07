import React, { useEffect, useState } from "react";
import { apiFetch } from "../../Services/Api";
import AttendanceChart from "../Charts/AttendanceChart";

const AttendanceCard = () => {
  const [status, setStatus] = useState("idle");
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [workingMinutes, setWorkingMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const TARGET_WORKING_MINUTES = 540;

  // =========================
  // LOAD TODAY (FIXED)
  // =========================
  const loadToday = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/today");

      const result = await res.json().catch(() => null);

      console.log("TODAY STATUS:", res.status);
      console.log("TODAY RESPONSE:", result);

      // ❌ DO NOT RESET UI ON ERROR
      if (!res.ok || !result) {
        console.warn("Today API failed but keeping UI state");
        return;
      }

      const data = result?.data || result;

      const punchIn =
        data?.punchIn || data?.punch_in || data?.attendance?.punchIn;

      const punchOut =
        data?.punchOut || data?.punch_out || data?.attendance?.punchOut;

      // No punch-in yet
      if (!punchIn) {
        setStatus("idle");
        setPunchInTime(null);
        setPunchOutTime(null);
        setWorkingMinutes(0);
        return;
      }

      setPunchInTime(punchIn);

      if (punchOut) {
        setPunchOutTime(punchOut);
        setStatus("out");

        const diff = (new Date(punchOut) - new Date(punchIn)) / 60000;
        setWorkingMinutes(Math.floor(diff));
      } else {
        setPunchOutTime(null);
        setStatus("in");

        const diff = (new Date() - new Date(punchIn)) / 60000;
        setWorkingMinutes(Math.floor(diff));
      }
    } catch (err) {
      console.error("loadToday error:", err);
      // ❌ DO NOT RESET STATE HERE
    }
  };

  // =========================
  // HISTORY
  // =========================
  const loadHistoryForChart = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/history");

      const result = await res.json().catch(() => null);

      if (!res.ok || !result) {
        setChartData([]);
        return;
      }

      const data = result?.data || [];

      setChartData(
        data.map((item) => ({
          Date: item.Date?.slice(0, 10),
          ProductionHours: item.ProductionHours || 0,
          Status: item.Status,
        }))
      );
    } catch (err) {
      console.error("history error:", err);
      setChartData([]);
    }
  };

  useEffect(() => {
    loadToday();
    loadHistoryForChart();
  }, []);

  // =========================
  // LIVE TIMER
  // =========================
  useEffect(() => {
    let timer;

    if (status === "in" && punchInTime) {
      timer = setInterval(() => {
        const diff = (new Date() - new Date(punchInTime)) / 60000;
        setWorkingMinutes(Math.floor(Math.min(diff, TARGET_WORKING_MINUTES)));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [status, punchInTime]);

  // =========================
  // LOCK LOGIC
  // =========================
  const isPunchInLocked = () => {
    if (!punchInTime) return false;
    const diff = (new Date() - new Date(punchInTime)) / 60000;
    return diff < 180;
  };

  const canPunchOut = () => {
    if (!punchInTime) return false;
    return (new Date() - new Date(punchInTime)) / 60000 >= 180;
  };

  // =========================
  // FORMAT
  // =========================
  const formatTime = (t) => {
    if (!t) return "--:--";
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgress = () => {
    if (!punchInTime) return 0;
    return Math.min(
      (workingMinutes / TARGET_WORKING_MINUTES) * 100,
      100
    );
  };

  const isIn = status === "in";

  // =========================
  // PUNCH IN
  // =========================
  const handlePunchIn = async () => {
    try {
      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await apiFetch("/api/v1/punch-in", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            await loadToday();
          } catch (err) {
            alert(err.message);
          } finally {
            setLoading(false);
          }
        },
        () => {
          alert("Location permission required");
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // =========================
  // PUNCH OUT
  // =========================
  const handlePunchOut = async () => {
    try {
      if (!canPunchOut()) {
        alert("You can punch out after 3 hours");
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await apiFetch("/api/v1/punch-out", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            await loadToday();
          } catch (err) {
            alert(err.message);
          } finally {
            setLoading(false);
          }
        },
        () => {
          alert("Location required");
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-gray-200 p-6 rounded-xl max-w-2xl shadow">

        <div className="flex justify-between items-start">

          <div>
            <p className="text-green-600 font-semibold text-sm">
              {status === "in"
                ? "PRESENT"
                : status === "out"
                ? "COMPLETED"
                : "NOT STARTED"}
            </p>

            <p className="text-sm mt-1">
              Punch In: {formatTime(punchInTime)}
            </p>

            {status === "out" && (
              <p className="text-sm mt-1">
                Punch Out: {formatTime(punchOutTime)}
              </p>
            )}
          </div>

          <button
            onClick={isIn ? handlePunchOut : handlePunchIn}
            disabled={loading || isPunchInLocked()}
            className={`px-6 py-2 rounded-lg font-semibold text-white ${
              isIn ? "bg-red-500" : "bg-green-500"
            } disabled:opacity-50`}
          >
            {loading
              ? "Processing..."
              : isIn
              ? "PUNCH OUT"
              : isPunchInLocked()
              ? "LOCKED"
              : "PUNCH IN"}
          </button>

        </div>

        <div className="mt-5">
          <div className="w-full bg-gray-300 h-2 rounded-full">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm">
          {Math.floor(workingMinutes / 60)} hrs {workingMinutes % 60} mins
        </p>

      </div>

      <AttendanceChart data={chartData} />

    </div>
  );
};

export default AttendanceCard;