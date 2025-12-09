import React from 'react';

const OscilloscopeCase = ({ children, title = "LABORATORIO DE TRANSMISIÓN" }) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-mono">
      {/* Caja del osciloscopio */}
      <div className="w-full max-w-6xl bg-osci-bg border border-gray-800 rounded-lg shadow-2xl overflow-hidden">

        {/* Barra superior */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 py-3 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Logo/Marca */}
              <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-osci-primary rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-osci-text text-sm font-bold tracking-wider uppercase">
                  {title}
                </h1>
                <p className="text-[9px] text-gray-500 tracking-widest">DIGITAL SIGNAL ANALYZER</p>
              </div>
            </div>

            {/* Indicadores */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-osci-primary rounded-full shadow-[0_0_6px_#22c55e]"></div>
                <span className="text-[9px] text-gray-500 uppercase">Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_#ef4444]"></div>
                <span className="text-[9px] text-gray-500 uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Área de contenido principal */}
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {children}
          </div>
        </div>

        {/* Barra inferior */}
        <div className="bg-gray-900 px-4 py-2 border-t border-gray-800">
          <div className="flex justify-between items-center text-[9px] text-gray-600">
            <span>Transmisión de Datos</span>
            <span>v2.0</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OscilloscopeCase;
