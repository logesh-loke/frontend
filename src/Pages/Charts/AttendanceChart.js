import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AttendanceChart = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">
        Attendance (Last 30 Days)
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="Date" />
          <YAxis />

          <Tooltip />

          {/* 🔥 MAIN BAR */}
          <Bar dataKey="ProductionHours">
            {data.map((item, index) => (
              <Cell
                key={index}
                fill={
                  item.Status === "ABSENT"
                    ? "#ef4444"   
                    : "#22c55e"   
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;