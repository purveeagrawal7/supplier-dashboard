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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ChartComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/chart-data")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);
  }, []);

  if (!data) return <p>Loading chart...</p>;

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({
      label: d.name,
      data: d.data,
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      fill: false,
    })),
  };

  return <Line data={chartData} />;
}
