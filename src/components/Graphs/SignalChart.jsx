import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SignalChart = ({
  dataPoints,
  labels,
  messageSignal = null,
  carrierSignal = null,
  showMessage = false,
  showCarrier = false,
  yMin = -1.5,
  yMax = 1.5,
  title = 'Amplitud (V)',
  stepped = false // Para señales digitales cuadradas
}) => {

  const datasets = [
    {
      label: title,
      data: dataPoints,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.05)',
      borderWidth: 1.5,
      tension: stepped ? 0 : 0.3,
      pointRadius: 0,
      stepped: stepped ? 'before' : false,
      fill: false,
    },
  ];

  if (showMessage && messageSignal?.length > 0) {
    datasets.push({
      label: 'Señal Mensaje',
      data: messageSignal,
      borderColor: '#f59e0b',
      backgroundColor: 'transparent',
      borderWidth: 1,
      tension: 0.3,
      pointRadius: 0,
      borderDash: [4, 4],
    });
  }

  if (showCarrier && carrierSignal?.length > 0) {
    datasets.push({
      label: 'Señal Portadora',
      data: carrierSignal,
      borderColor: '#0ea5e9',
      backgroundColor: 'transparent',
      borderWidth: 1,
      tension: 0.3,
      pointRadius: 0,
      borderDash: [2, 2],
    });
  }

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 8,
          font: { size: 9 }
        }
      },
      y: {
        min: yMin,
        max: yMax,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 9 },
          stepSize: (yMax - yMin) / 4
        }
      },
    },
    plugins: {
      legend: {
        display: showMessage || showCarrier,
        position: 'top',
        align: 'end',
        labels: {
          color: '#9ca3af',
          font: { size: 9 },
          boxWidth: 12,
          padding: 8
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#e5e7eb',
        bodyColor: '#9ca3af',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`;
          }
        }
      }
    },
  };

  return <Line data={data} options={options} />;
};

export default SignalChart;
