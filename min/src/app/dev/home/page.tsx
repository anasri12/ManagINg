"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { LogInterface } from "@/app/zods/db/log";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function APIStatisticsBarChart() {
  const [topUsageStats, setTopUsageStats] = useState<LogInterface["full"][]>(
    []
  );
  const [topResponseTimeStats, setTopResponseTimeStats] = useState<
    LogInterface["full"][]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAPIStats = async () => {
      try {
        const response = await fetch("/api/logs"); // Use your endpoint for aggregated data
        if (!response.ok) {
          throw new Error("Failed to fetch API statistics.");
        }
        const data: LogInterface["full"][] = await response.json();

        // Get top 5 highest API usage
        const topUsage = [...data]
          .reduce((acc, stat) => {
            const existing = acc.find(
              (item) => item.Endpoint === stat.Endpoint
            );
            if (existing) {
              existing.RequestCount += 1;
            } else {
              acc.push({ ...stat, RequestCount: 1 });
            }
            return acc;
          }, [] as (LogInterface["full"] & { RequestCount: number })[])
          .sort((a, b) => b.RequestCount - a.RequestCount)
          .slice(0, 5);

        // Get top 5 longest response times
        const topResponseTimes = [...data]
          .sort((a, b) => b.Response_Time - a.Response_Time)
          .slice(0, 5);

        setTopUsageStats(topUsage);
        setTopResponseTimeStats(topResponseTimes);
      } catch (error) {
        console.error("Error fetching API statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAPIStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Prepare data for Top Usage Bar Chart
  const usageLabels = topUsageStats.map((_, index) => `API ${index + 1}`);
  const usageEndpoints = topUsageStats.map((stat) => stat.Endpoint);
  const requestCounts = topUsageStats.map((stat) => stat.RequestCount);

  const usageChartData = {
    labels: usageLabels,
    datasets: [
      {
        label: "Request Count",
        data: requestCounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Top Response Time Bar Chart
  const responseLabels = topResponseTimeStats.map(
    (_, index) => `API ${index + 1}`
  );
  const responseEndpoints = topResponseTimeStats.map((stat) => stat.Endpoint);
  const responseTimes = topResponseTimeStats.map((stat) => stat.Response_Time);

  const responseChartData = {
    labels: responseLabels,
    datasets: [
      {
        label: "Response Time (ms)",
        data: responseTimes,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = (endpoints: string[]) => ({
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => endpoints[context[0].dataIndex] || "",
          label: (context: any) => {
            const label =
              context.dataset.label === "Request Count"
                ? `Requests: ${context.raw}`
                : `Response Time: ${context.raw} ms`;
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "APIs",
        },
        ticks: {
          display: true, // Show generic labels (API 1, API 2, etc.)
        },
      },
      y: {
        title: {
          display: true,
          text: "Count / Time (ms)",
        },
      },
    },
  });

  return (
    <>
      <div className="flex justify-center font-inria text-[78px]">
        <div className="flex flex-col justify-center items-center">
          <div>Welcome To</div>
          <div>Dev Management</div>
        </div>
      </div>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4">API Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top API Usage */}
          <div className="bg-white rounded-md shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Top 5 API Usages</h2>
            <Bar data={usageChartData} options={chartOptions(usageEndpoints)} />
          </div>

          {/* Top Longest Response Times */}
          <div className="bg-white rounded-md shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              Top 5 Longest Response Times
            </h2>
            <Bar
              data={responseChartData}
              options={chartOptions(responseEndpoints)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
