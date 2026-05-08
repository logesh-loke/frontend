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
  Line,
  ComposedChart,
  Legend,
  ReferenceLine,
} from "recharts";

const AttendanceChart = ({ data, days = 30 }) => {
  // Process data for last 30 days
  const processData = () => {
    if (!data || data.length === 0) return [];
    
    // Get last 30 days or all data if less than 30
    const lastDays = data.slice(-days);
    
    return lastDays.map((item, index) => ({
      ...item,
      date: item.Date ? new Date(item.Date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }) : `Day ${index + 1}`,
      hours: parseFloat(item.ProductionHours || 0).toFixed(1),
      status: item.Status?.toUpperCase(),
      dayOfWeek: item.Date ? new Date(item.Date).toLocaleDateString(undefined, {
        weekday: 'short'
      }) : '',
      isWeekend: item.Date ? [0, 6].includes(new Date(item.Date).getDay()) : false,
    }));
  };

  const chartData = processData();
  
  // Calculate statistics
  const presentCount = chartData.filter(item => item.status === "PRESENT").length;
  const absentCount = chartData.filter(item => item.status === "ABSENT").length;
  const averageHours = (chartData.reduce((sum, item) => sum + parseFloat(item.hours), 0) / chartData.length).toFixed(1);
  const totalHours = chartData.reduce((sum, item) => sum + parseFloat(item.hours), 0).toFixed(1);
  const maxHours = Math.max(...chartData.map(item => parseFloat(item.hours)), 0);
  const minHours = Math.min(...chartData.map(item => parseFloat(item.hours)), 9);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm">
          <p className="font-semibold mb-1">
            {data.date} ({data.dayOfWeek})
          </p>
          <p className="text-green-400">
            Hours: {data.hours} hrs
          </p>
          <p className={`mt-1 text-xs ${
            data.status === "PRESENT" ? "text-green-400" : "text-red-400"
          }`}>
            Status: {data.status}
          </p>
          {data.hours < 9 && data.status === "PRESENT" && (
            <p className="text-yellow-400 text-xs mt-1">
              ⚠️ Shortfall: {(9 - data.hours).toFixed(1)} hrs
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">
          Attendance (Last {days} Days)
        </h2>
        <div className="text-center py-8 text-gray-500">
          No attendance data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {/* Header with Stats */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Attendance Overview
        </h2>
        <p className="text-sm text-gray-500">
          Last {days} days • {chartData[0]?.date} - {chartData[chartData.length - 1]?.date}
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">Present</p>
            <p className="text-2xl font-bold text-green-700">{presentCount}</p>
            <p className="text-xs text-green-600">{((presentCount / chartData.length) * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium">Absent</p>
            <p className="text-2xl font-bold text-red-700">{absentCount}</p>
            <p className="text-xs text-red-600">{((absentCount / chartData.length) * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium">Avg. Hours</p>
            <p className="text-2xl font-bold text-blue-700">{averageHours}</p>
            <p className="text-xs text-blue-600">per day</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium">Total Hours</p>
            <p className="text-2xl font-bold text-purple-700">{totalHours}</p>
            <p className="text-xs text-purple-600">last {days} days</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="date" 
            angle={-45} 
            textAnchor="end" 
            height={70}
            interval={Math.floor(chartData.length / 10)}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          
          <YAxis 
            label={{ 
              value: 'Working Hours', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' }
            }}
            domain={[0, 12]}
            tick={{ fontSize: 11 }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
          
          {/* Reference line for target (9 hours) */}
          <ReferenceLine 
            y={9} 
            stroke="#f59e0b" 
            strokeDasharray="5 5"
            label={{ 
              value: "Target (9 hrs)", 
              position: "right",
              fill: "#f59e0b",
              fontSize: 11
            }}
          />
          
          {/* Bars for working hours */}
          <Bar 
            dataKey="hours" 
            name="Working Hours" 
            radius={[6, 6, 0, 0]}
            barSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.status === "PRESENT" ? "#22c55e" : "#ef4444"}
                fillOpacity={entry.isWeekend && entry.status === "ABSENT" ? 0.5 : 1}
              />
            ))}
          </Bar>
          
          {/* Optional: Add a line for trend */}
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3b82f6" }}
            name="Trend"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Insights and Legend */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Trend Line</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-orange-500 border-t-2 border-orange-500 border-dashed"></div>
              <span className="text-gray-600">Target (9 hrs)</span>
            </div>
          </div>
          
          {/* Performance Indicator */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            parseFloat(averageHours) >= 9 
              ? "bg-green-100 text-green-700" 
              : parseFloat(averageHours) >= 7 
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
            {parseFloat(averageHours) >= 9 
              ? "🎯 Meeting Target" 
              : parseFloat(averageHours) >= 7 
              ? "⚠️ Below Target" 
              : "❌ Significantly Below Target"}
          </div>  
        </div>
        
        {/* Insights Message */}
        
      </div>
    </div>
  );
};

export default AttendanceChart;