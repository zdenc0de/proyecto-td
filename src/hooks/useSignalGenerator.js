import { useState, useEffect } from 'react';

// Este hook recibe la cadena binaria y devuelve los puntos para la gráfica
export const useSignalGenerator = (binaryString = "") => {
  const [chartData, setChartData] = useState({ labels: [], points: [] });

  useEffect(() => {
    generateASKSignal();
  }, [binaryString]); // Se recalcula cada vez que cambia el binario

  const generateASKSignal = () => {
    const points = [];
    const labels = [];
    
    // CONFIGURACIÓN FÍSICA
    const samplesPerBit = 50; // Resolución: 50 puntos por cada bit (muy suave)
    const frequency = 2;      // Frecuencia: 2 ciclos completos por cada bit
    
    // Si no hay datos, limpiamos
    if (!binaryString) {
        setChartData({ labels: [], points: [] });
        return;
    }

    // ALGORITMO DE GENERACIÓN
    for (let i = 0; i < binaryString.length; i++) {
      const bit = parseInt(binaryString[i]);
      
      // Validamos que sea 0 o 1
      if (isNaN(bit)) continue; 

      for (let j = 0; j < samplesPerBit; j++) {
        // Tiempo relativo (0 a 1 dentro del bit)
        const t = j / samplesPerBit; 
        
        // Tiempo global para el eje X (solo para etiqueta)
        const globalTime = i + t;

        // --- FÓRMULA ASK ---
        // V(t) = A * sin(2 * pi * f * t)
        // Si bit es 1, Amplitud = 1. Si bit es 0, Amplitud = 0.
        const amplitude = bit === 1 ? 1 : 0;
        const y = amplitude * Math.sin(2 * Math.PI * frequency * t);

        points.push(y);
        labels.push(globalTime.toFixed(2));
      }
    }

    setChartData({ labels, points });
  };

  return chartData; // Devolvemos { labels, points }
};