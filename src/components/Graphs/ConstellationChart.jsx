import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const ConstellationChart = ({
  constellationPoints = [],
  transmittedSymbols = [],
  qamOrder = 16,
  levels = [-3, -1, 1, 3]
}) => {
  const maxLevel = Math.max(...levels.map(Math.abs));

  // Calcular los radios únicos para los anillos (distancias desde el origen)
  const ringRadii = useMemo(() => {
    const distances = new Set();
    constellationPoints.forEach(p => {
      const distance = Math.sqrt(p.I * p.I + p.Q * p.Q);
      // Redondear para evitar duplicados por errores de punto flotante
      distances.add(Math.round(distance * 1000) / 1000);
    });
    return Array.from(distances).sort((a, b) => a - b);
  }, [constellationPoints]);

  // Plugin personalizado para dibujar los anillos concéntricos
  const ringsPlugin = useMemo(() => ({
    id: 'constellationRings',
    beforeDatasetsDraw: (chart) => {
      const { ctx, scales } = chart;
      const xScale = scales.x;
      const yScale = scales.y;

      // Centro del gráfico (origen 0,0)
      const centerX = xScale.getPixelForValue(0);
      const centerY = yScale.getPixelForValue(0);

      // Calcular factor de escala (píxeles por unidad)
      const pixelsPerUnitX = Math.abs(xScale.getPixelForValue(1) - xScale.getPixelForValue(0));
      const pixelsPerUnitY = Math.abs(yScale.getPixelForValue(1) - yScale.getPixelForValue(0));
      const pixelsPerUnit = Math.min(pixelsPerUnitX, pixelsPerUnitY);

      ctx.save();

      // Dibujar cada anillo
      ringRadii.forEach((radius, index) => {
        if (radius === 0) return; // No dibujar anillo en el origen

        const pixelRadius = radius * pixelsPerUnit;

        ctx.beginPath();
        ctx.arc(centerX, centerY, pixelRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.3 - index * 0.05})`; // Verde con opacidad decreciente
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]); // Línea punteada
        ctx.stroke();
        ctx.setLineDash([]); // Resetear
      });

      ctx.restore();
    }
  }), [ringRadii]);

  // Puntos de la constelación (todos los posibles) - círculos grises
  const gridPoints = constellationPoints.map(p => ({
    x: p.I,
    y: p.Q
  }));

  // Puntos transmitidos - círculos verdes más grandes
  const txPoints = transmittedSymbols.map(s => ({
    x: s.I,
    y: s.Q
  }));

  const data = {
    datasets: [
      // Cuadrícula de constelación (todos los puntos posibles)
      {
        label: 'Constelación',
        data: gridPoints,
        backgroundColor: 'rgba(107, 114, 128, 0.6)',
        borderColor: 'rgba(107, 114, 128, 0.8)',
        borderWidth: 2,
        pointRadius: qamOrder === 64 ? 6 : qamOrder === 16 ? 10 : 14,
        pointHoverRadius: qamOrder === 64 ? 8 : qamOrder === 16 ? 12 : 16,
        pointStyle: 'circle',
      },
      // Símbolos transmitidos (resaltados)
      {
        label: 'Transmitidos',
        data: txPoints,
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
        borderColor: '#22c55e',
        borderWidth: 3,
        pointRadius: qamOrder === 64 ? 10 : qamOrder === 16 ? 14 : 18,
        pointHoverRadius: qamOrder === 64 ? 12 : qamOrder === 16 ? 16 : 20,
        pointStyle: 'circle',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    scales: {
      x: {
        type: 'linear',
        position: 'center',
        min: -maxLevel - 1,
        max: maxLevel + 1,
        grid: {
          color: 'rgba(75, 85, 99, 0.4)',
          drawBorder: true,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          stepSize: qamOrder === 64 ? 2 : 1,
        },
        title: {
          display: true,
          text: 'I (In-Phase)',
          color: '#22c55e',
          font: { size: 11, weight: 'bold' }
        }
      },
      y: {
        type: 'linear',
        position: 'center',
        min: -maxLevel - 1,
        max: maxLevel + 1,
        grid: {
          color: 'rgba(75, 85, 99, 0.4)',
          drawBorder: true,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          stepSize: qamOrder === 64 ? 2 : 1,
        },
        title: {
          display: true,
          text: 'Q (Quadrature)',
          color: '#22c55e',
          font: { size: 11, weight: 'bold' }
        }
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#9ca3af',
          font: { size: 10 },
          boxWidth: 12,
          padding: 8,
          usePointStyle: true,
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#e5e7eb',
        bodyColor: '#9ca3af',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const point = context.raw;
            if (context.datasetIndex === 1 && transmittedSymbols[context.dataIndex]) {
              const symbol = transmittedSymbols[context.dataIndex];
              return [
                `I: ${point.x}, Q: ${point.y}`,
                `Bits: ${symbol.bits}`,
                `Símbolo #${symbol.index + 1}`
              ];
            }
            return `I: ${point.x}, Q: ${point.y}`;
          }
        }
      }
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        <Scatter data={data} options={options} plugins={[ringsPlugin]} />
      </div>
      {/* Información de símbolos transmitidos */}
      {transmittedSymbols.length > 0 && (
        <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-[9px] text-gray-400 mb-1">Símbolos transmitidos:</p>
          <div className="flex flex-wrap gap-1">
            {transmittedSymbols.map((s, idx) => (
              <span
                key={idx}
                className="text-[9px] px-1.5 py-0.5 bg-osci-primary/20 text-osci-primary rounded font-mono"
                title={`I=${s.I}, Q=${s.Q}`}
              >
                {s.bits}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstellationChart;
