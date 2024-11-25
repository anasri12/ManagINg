"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { LogInterface } from "@/app/zods/db/log";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function APIOverview() {
  const [apiUsageData, setApiUsageData] = useState<LogInterface["full"][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAPIUsage = async () => {
      try {
        const response = await fetch("/api/logs");
        if (!response.ok) {
          throw new Error("Failed to fetch API usage data.");
        }
        const data = await response.json();
        setApiUsageData(data);
      } catch (error) {
        console.error("Error fetching API usage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAPIUsage();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Prepare data for the graph
  const labels = apiUsageData.map((entry) =>
    new Date(entry.CreatedAt).toLocaleString()
  );
  const responseTimes = apiUsageData.map((entry) => entry.Response_Time);
  const endpoints = apiUsageData.map((entry) => entry.Endpoint);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Response Time (ms)",
        data: responseTimes,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            return `Response Time: ${context.raw} ms\nEndpoint: ${endpoints[index]}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Response Time (ms)",
        },
      },
    },
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4 font-inria">API Overview</h1>
      <div className="bg-white rounded-md shadow-md p-6">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
