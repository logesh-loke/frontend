import React, { useEffect, useState } from "react";

const BASE_URL = "http://localhost:8080";

const AttendanceCard = () => {
  const [status, setStatus] = useState("idle");
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [workingMinutes, setWorkingMinutes] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔄 Load today's attendance
  useEffect(() => {
    const loadToday = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/today`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data?.punchIn) {
          setPunchInTime(data.punchIn);
          setStatus(data.punchOut ? "out" : "in");
          setPunchOutTime(data.punchOut || null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadToday();
  }, []);

  // ⏱ Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (punchInTime && status === "in") {
        const diff =
          (new Date() - new Date(punchInTime)) / 1000 / 60;
        setWorkingMinutes(Math.floor(diff));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [punchInTime, status]);

  // 🟢 Punch In
  const handlePunchIn = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/v1/punch-in`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPunchInTime(data.punchInTime);
      setStatus("in");
      setPunchOutTime(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Punch Out
  const handlePunchOut = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/v1/punch-out`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPunchOutTime(data.punchOutTime);
      setStatus("out");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⏱ Format time
  const formatTime = (t) =>
    t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";

  const progress = Math.min((workingMinutes / 540) * 100, 100);

  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-md max-w-none">

      {/* 🔝 Top */}
      <div className="flex justify-between items-start">
        <div>
          <p className={`font-semibold ${
            status === "in" ? "text-green-600" : "text-gray-500"
          }`}>
            {status === "in" ? "PRESENT" : "NOT STARTED"}
          </p>

          <p className="text-sm mt-1">
            Punch In: {formatTime(punchInTime)}
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Shift: 09:30 AM – 06:30 PM
          </p>

          <p className="text-sm text-gray-500 mt-1">
            India – IST
          </p>
        </div>

        <button
          onClick={status === "in" ? handlePunchOut : handlePunchIn}
          disabled={loading}
          className={`px-5 py-2 rounded-lg text-white font-semibold ${
            status === "in"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading
            ? "Processing..."
            : status === "in"
            ? "PUNCH OUT"
            : "PUNCH IN"}
        </button>
      </div>

      {/* 📊 Progress */}
      <div className="mt-6">
        <div className="w-full h-2 bg-gray-300 rounded-full">
          <div
            className="h-2 bg-orange-500 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm mt-2">
          {Math.floor(workingMinutes / 60)} hrs {workingMinutes % 60} mins
        </p>
      </div>
    </div>
  );
};

export default AttendanceCard;