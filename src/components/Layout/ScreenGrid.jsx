import React from 'react';

const ScreenGrid = ({ children }) => {
  return (
    <div className="relative w-full h-96 bg-osci-screen border-4 border-gray-700 rounded-lg overflow-hidden shadow-inner">
      {/* Patrón de rejilla con CSS */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
             backgroundSize: '20px 20px'
           }}
      ></div>
      
      {/* Línea central horizontal y vertical más marcadas */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-600 opacity-30 pointer-events-none"></div>
      <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-600 opacity-30 pointer-events-none"></div>

      {/* Contenido (aquí irán las gráficas) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ScreenGrid;