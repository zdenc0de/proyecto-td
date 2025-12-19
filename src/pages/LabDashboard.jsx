import React, { useState, useMemo } from 'react';
import OscilloscopeCase from '../components/Layout/OscilloscopeCase';
import ScreenGrid from '../components/Layout/ScreenGrid';
import SignalChart from '../components/Graphs/SignalChart';
import ConstellationChart from '../components/Graphs/ConstellationChart';
import { useSignal } from '../hooks/useSignal';
import { SIGNAL_CATEGORIES, TECHNIQUES, DEFAULT_ANALOG_PARAMS } from '../config/signalTypes';
import { validateExpression, PRESET_FUNCTIONS } from '../utils/functionParser';

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
    // Parámetro fijo para QAM (solo 4-QAM)
    qamOrder: 4,
  });

  // Estado para función personalizada del mensaje
  const [customFunction, setCustomFunction] = useState('sin(2*PI*t)');
  const [functionError, setFunctionError] = useState(null);

  // Memoizar parámetros para el hook
  const signalParams = useMemo(() => {
    let params = {
      ...analogParams,
      binaryInput,
      customFunction: functionError ? null : customFunction
    };
    // Para ASK, asegurar que amplitudeHigh sea entero y entre 1 y 5
    if (selectedCategory === 'analog_digital' && selectedTechnique === 'ASK') {
      params.amplitudeHigh = Math.max(1, Math.min(5, Math.round(Number(analogParams.amplitudeHigh) || 1)));
    }
    return params;
  }, [analogParams, binaryInput, customFunction, functionError, selectedCategory, selectedTechnique]);

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

  // Manejar cambio de función personalizada
  const handleFunctionChange = (value) => {
    setCustomFunction(value);
    const validation = validateExpression(value);
    setFunctionError(validation.valid ? null : validation.error);
  };

  // Aplicar función predefinida
  const applyPreset = (expression) => {
    setCustomFunction(expression);
    setFunctionError(null);
  };

  // Calcular límites Y según categoría
  const getYLimits = () => {
    if (isAnalogAnalog) return { yMin: -2, yMax: 2 };
    if (isDigitalAnalog && selectedTechnique === 'DM') return { yMin: -1.5, yMax: 1.5 };
    return { yMin: -1.5, yMax: 1.5 };
  };

  const { yMin, yMax } = getYLimits();

  return (
    <OscilloscopeCase title="Simulador de Técnicas de Modulación y Codificación">
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

        {/* Selector de técnica */}
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
        <div className="bg-osci-panel p-3 rounded border border-gray-700 space-y-3 max-h-[350px] overflow-y-auto">
          <label className="block text-gray-500 text-[10px] uppercase tracking-wider">
            Parámetros
          </label>

          {/* Input binario para técnicas que lo requieren */}
          {needsBinaryInput && (
            <div>
              <label className="block text-gray-500 text-[10px] mb-1">Dato binario</label>
              <input
                type="text"
                value={binaryInput}
                maxLength={16}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^01]/g, '');
                  if (val.length <= 16) setBinaryInput(val);
                }}
                placeholder="Ej: 10110010"
                className="w-full bg-osci-screen text-osci-primary font-mono font-bold tracking-widest border border-gray-600 rounded px-2 py-1.5 text-center focus:outline-none focus:border-osci-primary"
                disabled={binaryInput.length >= 16 && document.activeElement !== null && document.activeElement.value === binaryInput}
              />
              <p className="text-[9px] text-gray-600 mt-1 text-center">
                Solo 0s y 1s. Máximo 16 dígitos.
              </p>
            </div>
          )}

          {/* Controles para señales analógicas (AM, FM, PM) */}
          {isAnalogAnalog && (
            <>
              {/* Función de la señal */}
              <div>
                <label className="block text-gray-500 text-[10px] mb-1">Función de la señal moduladora:</label>
                <input
                  type="text"
                  value={customFunction}
                  onChange={(e) => handleFunctionChange(e.target.value)}
                  placeholder="Ej: sin(t)"
                  className={`w-full bg-osci-screen text-osci-secondary font-mono text-sm border rounded px-2 py-1.5 focus:outline-none ${
                    functionError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-osci-secondary'
                  }`}
                />
                {functionError && (
                  <p className="text-[9px] text-red-400 mt-1">{functionError}</p>
                )}

                {/* Funciones predefinidas */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {PRESET_FUNCTIONS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset.expression)}
                      title={preset.description}
                      className="text-[9px] px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-osci-secondary rounded transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Instrucciones de sintaxis */}
                <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
                  <p className="text-[9px] text-gray-400 font-bold mb-1">Sintaxis:</p>
                  <div className="text-[9px] text-gray-500 space-y-0.5">
                    <p><span className="text-osci-secondary">Funciones:</span> sin(t), cos(t)</p>
                    <p><span className="text-osci-secondary">Constantes:</span> PI</p>
                    <p><span className="text-osci-secondary">Variable:</span> t (tiempo)</p>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-2 font-bold">Ejemplos:</p>
                  <div className="text-[9px] text-gray-500 font-mono space-y-0.5">
                    <p>sin(2*PI*t)</p>
                    <p>2*sin(3*t)</p>
                    <p>sin(t)*cos(t)</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Controles para ASK */}
          {isAnalogDigital && selectedTechnique === 'ASK' && (
            <>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Amplitud para bit 1</span>
                  <span className="text-osci-primary">{analogParams.amplitudeHigh || 1} V</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={analogParams.amplitudeHigh || 1}
                  onChange={e => handleParamChange('amplitudeHigh', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  {[1,2,3,4,5].map(v => (
                    <span key={v}>{v}V</span>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Controles para FSK */}
          {isAnalogDigital && selectedTechnique === 'FSK' && (
            <>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frecuencia para bit 0</span>
                  <span className="text-osci-secondary">{analogParams.freq0} Hz</span>
                </div>
                <input
                  type="range" min="0" max="5"
                  value={analogParams.freq0}
                  onChange={(e) => handleParamChange('freq0', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-secondary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frecuencia para bit 1</span>
                  <span className="text-osci-primary">{analogParams.freq1} Hz</span>
                </div>
                <input
                  type="range" min="0" max="5"
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
              {/* Función personalizada para PCM */}
              <div>
                <label className="block text-gray-500 text-[10px] mb-1">Función de la señal </label>
                <input
                  type="text"
                  value={customFunction}
                  onChange={(e) => handleFunctionChange(e.target.value)}
                  placeholder="Ej: sin(2*PI*t)"
                  className={`w-full bg-osci-screen text-osci-secondary font-mono text-sm border rounded px-2 py-1.5 focus:outline-none ${
                    functionError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-osci-secondary'
                  }`}
                />
                {functionError && (
                  <p className="text-[9px] text-red-400 mt-1">{functionError}</p>
                )}
                <p className="text-[9px] text-gray-600 mt-1">
                  Usa: sin, cos, tan, abs, sqrt, exp, PI, t
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {PRESET_FUNCTIONS.slice(0, 3).map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset.expression)}
                      title={preset.description}
                      className="text-[9px] px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-osci-secondary rounded transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Frecuencia de la señal</span>
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
                  <span>Tasa de muestreo</span>
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
              {/* Función personalizada para DM */}
              <div>
                <label className="block text-gray-500 text-[10px] mb-1">Función de la señal original:</label>
                <input
                  type="text"
                  value={customFunction}
                  onChange={(e) => handleFunctionChange(e.target.value)}
                  placeholder="Ej: sin(2*PI*t)"
                  className={`w-full bg-osci-screen text-osci-secondary font-mono text-sm border rounded px-2 py-1.5 focus:outline-none ${
                    functionError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-osci-secondary'
                  }`}
                />
                {functionError && (
                  <p className="text-[9px] text-red-400 mt-1">{functionError}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {PRESET_FUNCTIONS.slice(0, 3).map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset.expression)}
                      title={preset.description}
                      className="text-[9px] px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-osci-secondary rounded transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Intervalo de muestreo</span>
                  <span className="text-osci-primary">{analogParams.samplingInterval || 0.0625} s</span>
                </div>
                <input
                  type="range" min="0.05" max="0.1" step="0.01"
                  value={analogParams.samplingInterval || 0.0625}
                  onChange={(e) => handleParamChange('samplingInterval', e.target.value)}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-osci-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Tamaño de Delta (δ)</span>
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
        <div className="relative h-80 lg:h-[500px]">
          <div className="absolute top-2 left-3 z-20 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              {selectedTechnique}
            </span>
            <span className="text-[9px] text-gray-600">
              {currentTechnique?.fullName}
            </span>
          </div>

          <ScreenGrid>
            {/* Diagrama de constelación para QAM */}
            {selectedTechnique === 'QAM' && signal.isConstellation ? (
              <div className="w-full h-full p-2">
                <ConstellationChart
                  constellationPoints={signal.constellationPoints}
                  transmittedSymbols={signal.transmittedSymbols}
                  qamOrder={signal.qamOrder}
                  levels={signal.levels}
                />
              </div>
            ) : signal.points?.length > 0 ? (
              <div className="w-full h-full p-2">
                <SignalChart
                  dataPoints={signal.points}
                  labels={signal.labels}
                  messageSignal={isDigitalAnalog ? signal.messageSignal : null}
                  showMessage={isDigitalAnalog}
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

        {/* Señal digital binaria resultante para DM */}
        {isDigitalAnalog && selectedTechnique === 'DM' && Array.isArray(signal.digitalBits) && signal.digitalBits.length > 0 && (
          <div className="bg-osci-panel p-2 rounded border border-osci-primary mt-2">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-osci-primary mr-2">Señal digital (DM):</span>
              {signal.digitalBits.map((bit, idx) => (
                <span
                  key={idx}
                  className={`w-5 h-5 flex items-center justify-center text-xs font-mono rounded ${
                    bit === 1 || bit === '1'
                      ? 'bg-osci-primary/30 text-osci-primary'
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
