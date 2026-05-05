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

  // 🔥 LOAD TODAY DATA
  const loadToday = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/today");
      if (!res || !res.ok) return;

      const result = await res.json();
      const data = result?.data ?? result;

      const punchIn =
        data?.punchIn || data?.punch_in || data?.attendance?.punchIn;

      const punchOut =
        data?.punchOut || data?.punch_out || data?.attendance?.punchOut;

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

        const diff =
          (new Date(punchOut) - new Date(punchIn)) / 60000;

        setWorkingMinutes(Math.floor(diff));
      } else {
        setStatus("in");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 LOAD CHART DATA (LAST 30 DAYS)
  const loadHistoryForChart = async () => {
    try {
      const res = await apiFetch("/api/v1/attendance/history");
      if (!res || !res.ok) return setChartData([]);

      const result = await res.json();
      const data = result?.data || [];

      const today = new Date();

      const last30Days = data.filter((item) => {
        const d = new Date(item.Date);
        if (isNaN(d)) return false;

        const diff = (today - d) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      });

      const formatted = last30Days.map((item) => ({
        Date: item.Date?.slice(0, 6),
        ProductionHours: item.ProductionHours || 0,
        Status: item.Status,
      }));

      setChartData(formatted);
    } catch (err) {
      console.error(err);
      setChartData([]);
    }
  };

  useEffect(() => {
    loadToday();
    loadHistoryForChart();
  }, [refresh]);

  // ⏱ LIVE TIMER
  useEffect(() => {
    let timer;

    if (status === "in" && punchInTime) {
      timer = setInterval(() => {
        const diff =
          (new Date() - new Date(punchInTime)) / 60000;

        setWorkingMinutes(
          Math.floor(Math.min(diff, TARGET_WORKING_MINUTES))
        );
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [status, punchInTime]);

  // ✅ Allow Punch Out after 3 hours
  const canPunchOut = () => {
    if (!punchInTime) return false;
    return (new Date() - new Date(punchInTime)) / 60000 >= 180;
  };

  // ✅ Disable Punch In only when already punched in
  const isPunchInDisabled = () => {
    return status === "in";
  };

  const getProgress = () =>
    punchInTime
      ? Math.min((workingMinutes / TARGET_WORKING_MINUTES) * 100, 100)
      : 0;

  const formatTime = (t) =>
    t
      ? new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";

  // 🟢 PUNCH IN
  const handlePunchIn = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/api/v1/punch-in", {
        method: "POST",
        body: JSON.stringify({
          punchInTime: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      setRefresh((prev) => !prev);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 PUNCH OUT
  const handlePunchOut = async () => {
    if (!canPunchOut()) {
      alert("You can punch out after 3 hours");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/api/v1/punch-out", {
        method: "POST",
        body: JSON.stringify({
          punchOutTime: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      // 🔥 RESET → allow next punch in
      setStatus("idle");
      setPunchInTime(null);
      setPunchOutTime(null);
      setWorkingMinutes(0);

      setRefresh((prev) => !prev);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isIn = status === "in";

  return (
    <div className="space-y-6">

      {/* 🟢 TODAY CARD */}
      <div className="bg-gray-200 p-6 rounded-xl max-w-2xl">
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
            disabled={
              loading ||
              (isIn ? !canPunchOut() : isPunchInDisabled())
            }
            className={`px-6 py-2 rounded-lg font-semibold ${
              isIn ? "bg-gray-100" : "bg-green-500"
            } disabled:opacity-50`}
          >
            {loading
              ? "Processing..."
              : isIn
              ? "PUNCH OUT"
              : "PUNCH IN"}
          </button>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="w-full bg-gray-300 h-2 rounded-full">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm">
          {Math.floor(workingMinutes / 60)} hrs{" "}
          {workingMinutes % 60} mins
        </p>
      </div>

      {/* 📊 CHART */}
      <AttendanceChart data={chartData} />

    </div>
  );
};

export default AttendanceCard;