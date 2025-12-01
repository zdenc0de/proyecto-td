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
  Filler // Importante para rellenar áreas si quisiéramos
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 1. Registramos los módulos de ChartJS que vamos a usar
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

const SignalChart = ({ dataPoints, labels }) => {

  // 2. Configuración de datos y colores (Estilo Neón)
  const data = {
    labels: labels, // Eje X (Tiempo)
    datasets: [
      {
        label: 'Amplitud (V)',
        data: dataPoints, // Eje Y (Valores de la onda)
        borderColor: '#22c55e', // Color osci-primary (Verde)
        backgroundColor: 'rgba(34, 197, 94, 0.1)', // Un brillo suave debajo de la línea
        borderWidth: 2,
        tension: 0.4, // Suavizado de la curva (0 = rectas, 1 = muy curvo)
        pointRadius: 0, // Ocultamos los puntos para que parezca señal continua
      },
    ],
  };

  // 3. Configuración del "Look & Feel" del Osciloscopio
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Se adapta al tamaño del contenedor padre
    animation: {
      duration: 0, // Desactivamos animación para que se sienta instantáneo al escribir
    },
    scales: {
      x: {
        grid: {
          color: '#1f2937', // Color de la rejilla (osci-grid)
          borderColor: '#374151',
        },
        ticks: {
          color: '#6b7280', // Color del texto eje X
          maxTicksLimit: 10, // Para no saturar de números
        }
      },
      y: {
        min: -1.5, // Fijamos altura para que la onda no "baile"
        max: 1.5,
        grid: {
          color: '#1f2937', // Color de la rejilla
          borderColor: '#374151',
        },
        ticks: {
          color: '#6b7280',
        }
      },
    },
    plugins: {
      legend: {
        display: false, // Ocultamos la leyenda para más realismo
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      }
    },
  };

  return <Line data={data} options={options} />;
};

export default SignalChart;