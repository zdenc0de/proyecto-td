import React, { useState } from 'react';
import OscilloscopeCase from '../components/Layout/OscilloscopeCase';
import ScreenGrid from '../components/Layout/ScreenGrid';
import SignalChart from '../components/Graphs/SignalChart'; // <--- Nuevo
import { useSignalGenerator } from '../hooks/useSignalGenerator'; // <--- Nuevo

const LabDashboard = () => {
  // Estado para guardar lo que escribe el usuario
  const [binaryInput, setBinaryInput] = useState("10110");
  
  // Usamos nuestro hook matemático, pasándole el input
  const { labels, points } = useSignalGenerator(binaryInput);

  return (
    <OscilloscopeCase title="MODULADOR DE SEÑALES v1.0">
      
      {/* Lado Izquierdo: Controles */}
      <div className="w-full lg:w-1/3 bg-gray-800/50 p-4 rounded border border-gray-700">
        <h2 className="text-osci-secondary mb-4 border-b border-gray-600 pb-2">CONFIGURACIÓN</h2>
        
        <div className="space-y-4">
           {/* Selector de Tipo (Por ahora decorativo) */}
           <div className="bg-black/30 p-3 rounded border border-gray-600">
              <label className="block text-gray-400 text-xs mb-1">TÉCNICA DE MODULACIÓN</label>
              <select className="w-full bg-gray-900 text-osci-text border border-gray-600 rounded p-1 text-sm focus:outline-none focus:border-osci-primary">
                  <option>ASK (Amplitude Shift Keying)</option>
                  <option disabled>FSK (Próximamente...)</option>
              </select>
           </div>
           
           {/* Input Binario - Aquí conectamos el estado */}
           <div className="bg-black/30 p-3 rounded border border-gray-600">
              <label className="block text-gray-400 text-xs mb-1">DATO BINARIO (Entrada)</label>
              <input 
                type="text" 
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="Ej: 110101" 
                className="w-full bg-gray-900 text-osci-primary font-bold tracking-widest border border-gray-600 rounded p-1 focus:outline-none focus:border-osci-primary text-center"
              />
              <p className="text-[10px] text-gray-500 mt-1 text-center">Solo ingresa 1s y 0s</p>
           </div>
        </div>
      </div>

      {/* Lado Derecho: Pantalla */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        
        <div className="relative h-64 lg:h-80"> {/* Altura fija para el contenedor */}
            <h3 className="absolute top-2 left-4 text-xs text-gray-500 z-20">SALIDA MODULADA ASK (Y)</h3>
            <ScreenGrid>
                {/* Renderizamos la gráfica solo si hay datos */}
                {points.length > 0 ? (
                  <div className="w-full h-full p-2">
                    <SignalChart dataPoints={points} labels={labels} />
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm animate-pulse">Ingrese datos binarios...</p>
                )}
            </ScreenGrid>
        </div>

      </div>

    </OscilloscopeCase>
  );
};

export default LabDashboard;