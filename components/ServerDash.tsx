// ServerDash.tsx
import React from "react";
import { useServerStats, ServerStatsPayload } from "@/hooks/useServerStats";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import { LegendItem } from "chart.js";
import toast from "react-hot-toast";
import { Server } from '@/db/database';
// import { Bucket } from "@/db/bucket";
import { CATEGORY_MAP } from "@/db/categories";
import { formatDateTime, calculateTimeDifference } from '@/utils/format';

interface ServerDashChartProps {
  stats: ServerStatsPayload;
  displaySeen: boolean;
}

// Utility to map named colors to hexadecimal
// const colorNameToHex = (colorName: string): string => {
//   const ctx = document.createElement("canvas").getContext("2d");
//   if (!ctx) return "#000000"; // Default to black if canvas context is unavailable
//   ctx.fillStyle = colorName;
//   return ctx.fillStyle;
// };

const ServerDashChart = ({
  stats,
  displaySeen,
}: ServerDashChartProps) => {
  // TODO fix displaySeen colors
  // const colors = {
  //   Regular: "green",
  //   Questions: "purple",
  //   Images: "yellow",
  //   Replies: "blue",
  //   Mentions: "orange",
  //   Hashtags: "lightgray",
  //   Links: "darkgray",
  //   Bots: "red",
  //   "Non-English": "orange",
  //   Reblogs: "white",
  // };

  // Generate lighter colors by converting to hex and adding transparency
  // const lighterColors = Object.fromEntries(
  //   Object.entries(colors).map(([key, color]) => {
  //     const hex = colorNameToHex(color); // Convert color name to hex
  //     const transparentHex = `${hex}40`; // Add transparency
  //     return [key, transparentHex];
  //   })
  // );

  // Filter out Bots, Non-English, and Reblogs categories
  const filteredCategoryMap = CATEGORY_MAP.filter(
    (category) =>
      !["Bots", "Non-English", "Reblogs"].includes(category.label)
  );

  // Prepare datasets: Each category contributes two segments (seen and unseen)
  const datasets = filteredCategoryMap.flatMap((category) => {
    const { bucket, label } = category;
    const { seen, unseen } = stats.categoryCounts[bucket] || { seen: 0, unseen: 0 };

    if (displaySeen) {
      return [
        {
          label: `${label} (Seen)`,
          data: [seen],
          // backgroundColor: lighterColors[label as keyof typeof lighterColors],
        },
        {
          label: `${label} (Unseen)`,
          data: [unseen],
          // backgroundColor: colors[label as keyof typeof colors],
        },
      ];
    } else {
      return [
        {
          label: `${label}`,
          data: [unseen],
          // backgroundColor: colors[label as keyof typeof colors],
        },
      ];
    }
  });

  const data = {
    labels: ["Post Categories"],
    datasets,
  };

  const options = {
    indexAxis: "y" as const, // Horizontal stacked bar chart
    responsive: true,
    plugins: {
      legend: {
        position: "left" as const,
        labels: {
          font: {
            size: 6,
          },
          filter: (legendItem: LegendItem) =>
            !legendItem.text.includes("(Seen)"), // Filter out labels containing "(Seen)"
        },

      },
      title: {
        display: true,
        text: `Unseen Post Counts`,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: "#f0f0f0", // Subtle gray gridlines
        },
        ticks: {
          callback: function (
            value: number | string,
            index: number,
            values: { value: number | string }[]
          ) {
            if (index === 0 || index === values.length - 1 || index === Math.round(values.length / 2) - 1) {
              return value; // Display only the first, last, and middle tick values
            }
            return ""; // Hide other tick values 
          },
        },
      },
      y: {
        stacked: true,
        maxBarThickness: 10,
        title: {
          display: false, // No need for y-axis label
        },
        ticks: {
          display: false, // Hide tick marks since there's only one bar
        },
      },
    },
  };

  return <Chart type="bar" data={data} options={options} height="60" />;
};

interface ServerDashProps {
  server: Server;
}
// {
//   totalPosts: number;
//   seenPosts: number;
//   oldestPostDate: string | null;
//   latestPostDate: string | null;
//   categoryCounts: Record<Bucket, { seen: number; unseen: number }>;
// }

const ServerDash: React.FC<ServerDashProps> = ({ server }) => {
  const { data: stats, isPending: isStatsLoading, error: statsError } = useServerStats(server.slug);

  if (isStatsLoading) {
    return <p>Loading stats for {server.name}...</p>;
  }

  if (statsError) {
    toast.error(
      `Failed to load stats for ${server.name}: ${statsError.message}`
    );
    return <p>Error loading stats for {server.name}.</p>;
  }

  return (
    <div className="server-stats">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{server.name}</h2>
      {stats && (
        <div className="mt-4 p-4 border rounded shadow-sm bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="text-blue-500 text-2xl font-bold">{stats.totalPosts || 0}</span>
              <span className="ml-2 text-gray-600">Total Posts</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 text-2xl font-bold">{stats.seenPosts || 0}</span>
              <span className="ml-2 text-gray-600">Seen Posts</span>
              <span className="ml-4 text-red-500 text-2xl font-bold">
                {(stats.totalPosts || 0) - (stats.seenPosts || 0)}
              </span>
              <span className="ml-2 text-gray-600">Unseen Posts</span>
            </div>
            <div className="col-span-2">
              {stats?.oldestPostDate && stats?.latestPostDate ? (
                <p className="text-gray-500 text-sm">
                  <strong>Posts Collected:</strong> From{" "}
                  <span className="text-blue-500">{formatDateTime(stats.oldestPostDate)}</span> to{" "}
                  <span className="text-blue-500">{formatDateTime(stats.latestPostDate)}</span>
                  {" ("}
                  <span className="text-green-500 font-medium">{calculateTimeDifference(stats.oldestPostDate, stats.latestPostDate)}</span>
                  {")"}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">No posts available to calculate date range.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ServerDashChart stats={stats} displaySeen={false} />

    </div>
  );
};

export default ServerDash;
