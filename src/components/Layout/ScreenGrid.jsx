import React from 'react';

const ScreenGrid = ({ children }) => {
  return (
    <div className="relative w-full h-full bg-osci-screen rounded border border-gray-700 overflow-hidden">
      {/* Patrón de rejilla */}
      <div
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`,
          backgroundSize: '25px 25px'
        }}
      />

      {/* Líneas centrales */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gray-600/40 pointer-events-none" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-gray-600/40 pointer-events-none" />

      {/* Efecto de brillo sutil en bordes */}
      <div className="absolute inset-0 pointer-events-none rounded"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ScreenGrid;
