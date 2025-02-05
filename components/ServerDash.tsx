// ServerDash.tsx
import Link from "next/link";
import React from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import { Chart as ChartChart, ActiveElement, ChartEvent, LegendItem, Tick } from "chart.js";
import toast from "react-hot-toast";
import { Server } from '@/db/database';
import { Bucket } from "@/db/bucket";
import { CATEGORY_MAP } from "@/db/categories";
import { useServerStats } from "@/hooks/useServerStats";
import { ServerStatsPayload } from '@/db/database';
import { useModifyServers } from '@/hooks/useModifyServers';
import { useSyncPosts } from "@/hooks/useSyncPosts";
import AsyncButton from "./AsyncButton";
import ServerStats from "./ServerStats";

interface ServerDashChartProps {
  serverSlug: string;
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
  serverSlug,
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
      !["Mentions", "Bots", "Non-English", "Reblogs"].includes(category.label)
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
    // labels: ["Post Categories"],
    labels: ["Unseen Post Counts"],
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
          filter: (legendItem: LegendItem) => !legendItem.text.includes("(Seen)"), // Filter out labels containing "(Seen)"
        },
      },
      title: {
        display: false,
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
          callback: function (tickValue: string | number, index: number, ticks: Tick[]) {
            if (index === 0 || index === ticks.length - 1 || index === Math.round(ticks.length / 2) - 1) {
              return tickValue; // Display only the first, last, and middle tick values
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
    onClick: (_event: ChartEvent, elements: ActiveElement[], chart: ChartChart) => {
      if (elements.length > 0 && chart && chart.data && chart.data.labels) {
        const datasetIndex = elements[0].datasetIndex; // Get the dataset index of the clicked bar
        const datasetLabel = chart.data.datasets[datasetIndex].label;
        const slug = CATEGORY_MAP.find(c => c.label === datasetLabel);
        if (slug) {
          window.open(`/${serverSlug}/${slug.slug}`, "_self"); // Open the link in the same tab
        }
      }
    },
  };

  return <Chart type="bar" data={data} options={options} height="60" />;
};

interface ServerDashProps {
  server: Server;
}

const ServerDash: React.FC<ServerDashProps> = ({ server }) => {
  const { data: stats, isPending: isStatsLoading, error: statsError, invalidateServerStats } = useServerStats(server.slug);
  const { updateServer } = useModifyServers();

  const { mutateAsync: syncPosts } = useSyncPosts({
    server: server.slug,
    invalidateTimeline: () => { },
    invalidateServerStats,
  });
  const handleSyncNewer = async () => {
    await syncPosts({ older: false, batch: 1 });
  };
  const handleSyncNewer10x = async () => {
    await syncPosts({ older: false, batch: 10 });
  };
  const disableServer = async (server: Server) => {
      await updateServer({
        id: server.id,
        server: { ...server, enabled: false }, // Only update the `enabled` field
      });
    };

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
      <h2 className="text-xl font-bold text-gray-800 mb-4">{server.name} /{" "}
        <Link href={`/${server.slug}/regular`} className="text-blue-500 hover:text-blue-600 underline">
          Regular ({stats?.categoryCounts[Bucket.regular]?.unseen || 0})
        </Link>
      <AsyncButton
        callback={handleSyncNewer}
        loadingText="Syncing Newer..."
        defaultText="Collect Newer Posts"
        color="blue"
        extraClasses="ml-2"
      />
      <AsyncButton
        callback={handleSyncNewer10x}
        loadingText="Syncing Newer..."
        defaultText="Collect Newer Posts 10x"
        color="blue"
        extraClasses="ml-2"
      />
      <AsyncButton
        callback={() => disableServer(server)}
        defaultText="Disable Server"
        color="blue"
        extraClasses="ml-2"
      />
      </h2>
      <div className="mt-4 p-4 border rounded shadow-sm bg-gray-50">
        {stats && (<ServerStats stats={stats} />)}
      </div>

      <ServerDashChart serverSlug={server.slug} stats={stats} displaySeen={false} />

    </div>
  );
};

export default ServerDash;
