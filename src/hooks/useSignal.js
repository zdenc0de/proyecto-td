import { useState, useEffect, useMemo } from 'react';
import { generateAnalogSignal } from './generators/analogSignals';
import { generateDigitalModulation } from './generators/digitalModulations';
import { generateDigitalLineCode } from './generators/digitalLineCodings';
import { generateAnalogToDigital } from './generators/analogToDigital';

/**
 * Hook unificado para generación de señales
 * Maneja todas las categorías de transmisión de datos
 */
export const useSignal = (category, technique, params = {}) => {
  const [signal, setSignal] = useState({
    labels: [],
    points: [],
    messageSignal: [],
    carrierSignal: [],
    originalSignal: [],
    reconstructed: []
  });

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let result = { labels: [], points: [] };

    switch (category) {
      case 'analog_analog':
        // Señal Analógica / Dato Analógico
        result = generateAnalogSignal(technique, params);
        break;

      case 'analog_digital':
        // Señal Analógica / Dato Digital
        result = generateDigitalModulation(technique, params.binaryInput, params);
        break;

      case 'digital_digital':
        // Señal Digital / Dato Digital
        result = generateDigitalLineCode(technique, params.binaryInput);
        break;

      case 'digital_analog':
        // Señal Digital / Dato Analógico
        result = generateAnalogToDigital(technique, params);
        break;

      default:
        result = { labels: [], points: [] };
    }

    setSignal(result);
  }, [category, technique, paramsKey]);

  return signal;
};

export default useSignal;
