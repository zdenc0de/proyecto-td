import React, { useState, useMemo } from 'react';
import OscilloscopeCase from '../components/Layout/OscilloscopeCase';
import ScreenGrid from '../components/Layout/ScreenGrid';
import SignalChart from '../components/Graphs/SignalChart';
import { useSignal } from '../hooks/useSignal';
import { SIGNAL_CATEGORIES, TECHNIQUES, DEFAULT_ANALOG_PARAMS } from '../config/signalTypes';

const LabDashboard = () => {
  // Estado para categoría y técnica seleccionada
  const [selectedCategory, setSelectedCategory] = useState('analog_analog');
  const [selectedTechnique, setSelectedTechnique] = useState('AM');

  // Estado para entrada binaria
  const [binaryInput, setBinaryInput] = useState("10110010");

  // Estado para parámetros analógicos
  const [analogParams, setAnalogParams] = useState({
    carrierFreq: DEFAULT_ANALOG_PARAMS.carrierFreq,
    messageFreq: DEFAULT_ANALOG_PARAMS.messageFreq,
    modulationIndex: DEFAULT_ANALOG_PARAMS.modulationIndex,
    frequencyDeviation: DEFAULT_ANALOG_PARAMS.frequencyDeviation,
    phaseDeviation: DEFAULT_ANALOG_PARAMS.phaseDeviation,
    duration: DEFAULT_ANALOG_PARAMS.duration,
    // Parámetros para PCM/DM
    samplingRate: 16,
    quantizationLevels: 8,
    stepSize: 0.2,
    // Parámetros para FSK
    freq0: 1,
    freq1: 3,
  });

  // Estado para mostrar señales auxiliares
  const [showMessage, setShowMessage] = useState(false);
  const [showCarrier, setShowCarrier] = useState(false);

  // Memoizar parámetros para el hook
  const signalParams = useMemo(() => ({
    ...analogParams,
    binaryInput
  }), [analogParams, binaryInput]);

  // Hook unificado para generar señales
  const signal = useSignal(selectedCategory, selectedTechnique, signalParams);

  // Helpers
  const getCategoryById = (id) => Object.values(SIGNAL_CATEGORIES).find(cat => cat.id === id);
  const currentCategory = getCategoryById(selectedCategory);
  const availableTechniques = currentCategory?.techniques || [];
  const currentTechnique = TECHNIQUES[selectedTechnique];

  // Determinar tipo de categoría para controles
  const isAnalogAnalog = selectedCategory === 'analog_analog';
  const isAnalogDigital = selectedCategory === 'analog_digital';
  const isDigitalDigital = selectedCategory === 'digital_digital';
  const isDigitalAnalog = selectedCategory === 'digital_analog';
  const needsBinaryInput = isAnalogDigital || isDigitalDigital;

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = getCategoryById(categoryId);
    if (category?.techniques.length > 0) {
      setSelectedTechnique(category.techniques[0]);
    }
  };

  // Manejar cambio de parámetros
  const handleParamChange = (param, value) => {
    setAnalogParams(prev => ({
      ...prev,
      [param]: parseFloat(value) || 0
    }));
  };

  // Calcular límites Y según categoría
  const getYLimits = () => {
    if (isAnalogAnalog) return { yMin: -2, yMax: 2 };
    if (isDigitalAnalog && selectedTechnique === 'DM') return { yMin: -1.5, yMax: 1.5 };
    return { yMin: -1.5, yMax: 1.5 };
  };

  const { yMin, yMax } = getYLimits();

  return (
    <OscilloscopeCase title="SIMULADOR DE TRANSMISIÓN DE DATOS">
      {/* Panel de Control */}
      <div className="w-full lg:w-1/3 flex flex-col gap-3">

        {/* Selector de Categoría */}
        <div className="bg-osci-panel p-3 rounded border border-gray-700">
          <label className="block text-gray-500 text-[10px] uppercase tracking-wider mb-2">
            Tipo de Señal / Dato
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-osci-screen text-osci-text border border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-osci-primary"
          >
            {Object.values(SIGNAL_CATEGORIES).map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Técnica */}
        <div className="bg-osci-panel p-3 rounded border border-gray-700">
          <label className="block text-gray-500 text-[10px] uppercase tracking-wider mb-2">
            Técnica
          </label>
          <select
            value={selectedTechnique}
            onChange={(e) => setSelectedTechnique(e.target.value)}
            className="w-full bg-osci-screen text-osci-primary border border-gray-600 rounded px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-osci-primary"
          >
            {availableTechniques.map(techId => (
              <option key={techId} value={techId}>
                {TECHNIQUES[techId]?.name || techId}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-600 mt-1.5 leading-tight">
            {currentTechnique?.description}
          </p>
        </div>

        {/* Controles según categoría */}
        <div className="bg-osci-panel p-3 rounded border border-gray-700 space-y-3 max-h-[300px] overflow-y-auto">
          <label className="block text-gray-500 text-[10px] uppercase tracking-wider">
            Parámetros
          </label>

          {/* Input binario para técnicas que lo requieren */}
          {needsBinaryInput && (
            <div>
              <label className="block text-gray-500 text-[10px] mb-1">Dato Binario</label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value.replace(/[^01]/g, ''))}
                placeholder="Ej: 10110010"
                className="w-full bg-osci-screen text-osci-primary font-mono font-bold tracking-widest border border-gray-600 rounded px-2 py-1.5 text-center focus:outline-none focus:border-osci-primary"
              />
              <p className="text-[9px] text-gray-600 mt-1 text-center">Solo 0s y 1s</p>
            </div>
          )}

          {/* Controles para señales analógicas (AM, FM, PM) */}
          {isAnalogAnalog && (
            <>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frec. Portadora</span>
                  <span className="text-osci-primary">{analogParams.carrierFreq} Hz</span>
                </div>
                <input
                  type="range" min="5" max="50" step="1"
                  value={analogParams.carrierFreq}
                  onChange={(e) => handleParamChange('carrierFreq', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frec. Mensaje</span>
                  <span className="text-osci-secondary">{analogParams.messageFreq} Hz</span>
                </div>
                <input
                  type="range" min="0.5" max="5" step="0.5"
                  value={analogParams.messageFreq}
                  onChange={(e) => handleParamChange('messageFreq', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-secondary"
                />
              </div>

              {selectedTechnique === 'AM' && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Índice Modulación (m)</span>
                    <span className="text-osci-primary">{analogParams.modulationIndex}</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1" step="0.1"
                    value={analogParams.modulationIndex}
                    onChange={(e) => handleParamChange('modulationIndex', e.target.value)}
                    className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                  />
                </div>
              )}

              {selectedTechnique === 'FM' && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Desviación Frec. (Δf)</span>
                    <span className="text-osci-primary">{analogParams.frequencyDeviation} Hz</span>
                  </div>
                  <input
                    type="range" min="1" max="20" step="1"
                    value={analogParams.frequencyDeviation}
                    onChange={(e) => handleParamChange('frequencyDeviation', e.target.value)}
                    className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                  />
                </div>
              )}

              {selectedTechnique === 'PM' && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Desviación Fase (Δφ)</span>
                    <span className="text-osci-primary">{analogParams.phaseDeviation.toFixed(2)} rad</span>
                  </div>
                  <input
                    type="range" min="0.5" max="3.14" step="0.1"
                    value={analogParams.phaseDeviation}
                    onChange={(e) => handleParamChange('phaseDeviation', e.target.value)}
                    className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                  />
                </div>
              )}

              {/* Checkboxes para señales auxiliares */}
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input
                    type="checkbox" checked={showMessage}
                    onChange={(e) => setShowMessage(e.target.checked)}
                    className="w-3 h-3 accent-osci-secondary"
                  />
                  <span className="text-gray-400">Mensaje</span>
                </label>
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input
                    type="checkbox" checked={showCarrier}
                    onChange={(e) => setShowCarrier(e.target.checked)}
                    className="w-3 h-3 accent-osci-secondary"
                  />
                  <span className="text-gray-400">Portadora</span>
                </label>
              </div>
            </>
          )}

          {/* Controles para FSK */}
          {isAnalogDigital && selectedTechnique === 'FSK' && (
            <>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frec. para 0</span>
                  <span className="text-osci-secondary">{analogParams.freq0} Hz</span>
                </div>
                <input
                  type="range" min="1" max="5" step="0.5"
                  value={analogParams.freq0}
                  onChange={(e) => handleParamChange('freq0', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-secondary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frec. para 1</span>
                  <span className="text-osci-primary">{analogParams.freq1} Hz</span>
                </div>
                <input
                  type="range" min="2" max="8" step="0.5"
                  value={analogParams.freq1}
                  onChange={(e) => handleParamChange('freq1', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
              </div>
            </>
          )}

          {/* Controles para PCM */}
          {isDigitalAnalog && selectedTechnique === 'PCM' && (
            <>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frec. Señal</span>
                  <span className="text-osci-secondary">{analogParams.messageFreq} Hz</span>
                </div>
                <input
                  type="range" min="0.5" max="3" step="0.5"
                  value={analogParams.messageFreq}
                  onChange={(e) => handleParamChange('messageFreq', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-secondary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Tasa Muestreo</span>
                  <span className="text-osci-primary">{analogParams.samplingRate} Hz</span>
                </div>
                <input
                  type="range" min="8" max="32" step="4"
                  value={analogParams.samplingRate}
                  onChange={(e) => handleParamChange('samplingRate', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Niveles Cuant.</span>
                  <span className="text-osci-primary">{analogParams.quantizationLevels}</span>
                </div>
                <input
                  type="range" min="4" max="16" step="2"
                  value={analogParams.quantizationLevels}
                  onChange={(e) => handleParamChange('quantizationLevels', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
              </div>
            </>
          )}

          {/* Controles para DM */}
          {isDigitalAnalog && selectedTechnique === 'DM' && (
            <>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frec. Señal</span>
                  <span className="text-osci-secondary">{analogParams.messageFreq} Hz</span>
                </div>
                <input
                  type="range" min="0.5" max="3" step="0.5"
                  value={analogParams.messageFreq}
                  onChange={(e) => handleParamChange('messageFreq', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-secondary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Tasa Muestreo</span>
                  <span className="text-osci-primary">{analogParams.samplingRate} Hz</span>
                </div>
                <input
                  type="range" min="16" max="64" step="8"
                  value={analogParams.samplingRate}
                  onChange={(e) => handleParamChange('samplingRate', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Tamaño Paso (δ)</span>
                  <span className="text-osci-primary">{analogParams.stepSize}</span>
                </div>
                <input
                  type="range" min="0.05" max="0.5" step="0.05"
                  value={analogParams.stepSize}
                  onChange={(e) => handleParamChange('stepSize', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
              </div>
            </>
          )}
        </div>

        {/* Info de la técnica */}
        <div className="bg-osci-screen/50 p-2 rounded border border-osci-primary/20">
          <h3 className="text-osci-primary text-[10px] font-bold">
            {currentTechnique?.fullName}
          </h3>
        </div>
      </div>

      {/* Panel de Visualización */}
      <div className="w-full lg:w-2/3 flex flex-col gap-3">
        <div className="relative h-72 lg:h-[400px]">
          <div className="absolute top-2 left-3 z-20 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              {selectedTechnique}
            </span>
            <span className="text-[9px] text-gray-600">
              {currentTechnique?.fullName}
            </span>
          </div>

          <ScreenGrid>
            {signal.points?.length > 0 ? (
              <div className="w-full h-full p-2">
                <SignalChart
                  dataPoints={signal.points}
                  labels={signal.labels}
                  messageSignal={isAnalogAnalog ? signal.messageSignal : null}
                  carrierSignal={isAnalogAnalog ? signal.carrierSignal : null}
                  showMessage={showMessage && isAnalogAnalog}
                  showCarrier={showCarrier && isAnalogAnalog}
                  yMin={yMin}
                  yMax={yMax}
                  title={`Señal ${selectedTechnique}`}
                  stepped={isDigitalDigital || isDigitalAnalog}
                />
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                {needsBinaryInput ? 'Ingrese datos binarios...' : 'Generando señal...'}
              </p>
            )}
          </ScreenGrid>
        </div>

        {/* Indicador de bits para técnicas digitales */}
        {needsBinaryInput && binaryInput && (
          <div className="bg-osci-panel p-2 rounded border border-gray-700">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-gray-500 mr-2">Bits:</span>
              {binaryInput.split('').map((bit, idx) => (
                <span
                  key={idx}
                  className={`w-5 h-5 flex items-center justify-center text-xs font-mono rounded ${
                    bit === '1'
                      ? 'bg-osci-primary/20 text-osci-primary'
                      : 'bg-gray-700/50 text-gray-500'
                  }`}
                >
                  {bit}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </OscilloscopeCase>
  );
};

export default LabDashboard;
