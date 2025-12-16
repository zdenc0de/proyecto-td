import React from 'react';

const OscilloscopeCase = ({ children, title = "LABORATORIO DE TRANSMISIÓN" }) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-mono">
      {/* Caja del osciloscopio */}
      <div className="w-full max-w-7xl bg-osci-bg border border-gray-800 rounded-lg shadow-2xl overflow-hidden">

        {/* Barra superior */}
        <div className="bg-linear-to-b from-gray-800 to-gray-900 px-4 py-4 border-b border-gray-700">
          <h1 className="text-osci-text text-xl font-bold tracking-wider uppercase text-center">
            {title}
          </h1>
        </div>

        {/* Área de contenido principal */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {children}
          </div>
        </div>

        {/* Barra inferior */}
        <div className="bg-gray-900 px-4 py-2 border-t border-gray-800">
          <div className="flex justify-between items-center text-[9px] text-gray-600">
            <span>ABARCA CRUZ | LABRA ALVA | LÓPEZ CARMONA</span>
            <span>v2.0</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OscilloscopeCase;
