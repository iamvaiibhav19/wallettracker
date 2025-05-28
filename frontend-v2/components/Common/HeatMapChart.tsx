"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";

interface HeatmapData {
  date: string; // e.g. "2025-05-01"
  count: number;
}

interface EChartsHeatmapProps {
  data: HeatmapData[];
  year: number; // e.g. 2025
}

const HeatMapChart = ({ data, year }: EChartsHeatmapProps) => {
  console.log("HeatMapChart data:", data);
  // Convert data to [dateString, count] format
  // ECharts expects date strings like 'YYYY-MM-DD' for calendar heatmap
  const formattedData = data.map(({ date, count }) => [date, count]);

  const option = {
    tooltip: {
      position: "top",
      formatter: function (params: any) {
        return `${params.value[0]}<br/>Count: ${params.value[1]}`;
      },
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.map((d) => d.count), 1),
      calculable: true,
      orient: "horizontal",
      left: "center",
      top: 20,
      inRange: {
        color: ["#e0f3db", "#a8ddb5", "#43a2ca", "#0868ac"], // light to dark colors
      },
    },
    calendar: {
      top: 60,
      left: 30,
      right: 30,
      range: year, // you can specify the year number here (e.g., 2025)
      cellSize: ["auto", 20],
      splitLine: {
        show: true,
        lineStyle: {
          color: "#ccc",
          width: 1,
          type: "solid",
        },
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: "#fff",
      },
      yearLabel: { show: false },
      dayLabel: {
        firstDay: 1, // Monday as first day of week (0 = Sunday, 1 = Monday)
        nameMap: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // custom day names
      },
      monthLabel: {
        show: true,
        nameMap: "en",
      },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: formattedData,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 200, width: "100%" }} />;
};

export default HeatMapChart;
