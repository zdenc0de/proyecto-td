import React from 'react';

const OscilloscopeCase = ({ children, title = "LABORATORIO DE TRANSMISIÓN" }) => {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-mono">
      {/* La caja metálica */}
      <div className="w-full max-w-6xl bg-osci-panel border-t-2 border-gray-700 rounded-xl shadow-2xl p-6 relative">
        
        {/* Tornillos decorativos (esquinas) */}
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gray-600 shadow-inner"></div>
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gray-600 shadow-inner"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gray-600 shadow-inner"></div>
        <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gray-600 shadow-inner"></div>

        {/* Encabezado del aparato */}
        <div className="flex justify-between items-center mb-6 px-4">
          <h1 className="text-osci-primary text-2xl font-bold tracking-widest uppercase drop-shadow-md">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
            <span className="text-xs text-gray-400">POWER ON</span>
          </div>
        </div>

        {/* Área de contenido principal */}
        <div className="flex flex-col lg:flex-row gap-6">
            {children}
        </div>
        
      </div>
    </div>
  );
};

export default OscilloscopeCase;