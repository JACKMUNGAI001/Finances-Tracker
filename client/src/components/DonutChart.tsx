import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: number[];
  labels: string[];
  colors: string[];
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({ data, labels, colors, centerLabel, centerValue }: DonutChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8F9FC',
        bodyColor: '#CBD5E1',
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 4,
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Doughnut options={options} data={chartData} />
      {(centerLabel || centerValue) && (
        <div className="chart-center-text">
          {centerLabel && <p className="chart-center-label">{centerLabel}</p>}
          {centerValue && <p className="chart-center-value">{centerValue}</p>}
        </div>
      )}
    </div>
  );
}
