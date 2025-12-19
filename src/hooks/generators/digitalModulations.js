/**
 * Generadores de señales para categoría: Señal Analógica / Dato Digital
 * Técnicas: ASK, FSK, PSK, QAM
 */

const SAMPLES_PER_BIT = 50;
const DEFAULT_FREQUENCY = 2;

/**
 * Parsea la cadena binaria y retorna array de bits válidos
 */
const parseBinaryString = (binaryString) => {
  if (!binaryString) return [];
  return binaryString.split('').filter(c => c === '0' || c === '1').map(Number);
};

/**
 * ASK (Amplitude Shift Keying)
 * 1 = Amplitud alta (portadora), 0 = Amplitud baja/cero
 */
export const generateASK = (binaryString, params = {}) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const { frequency = DEFAULT_FREQUENCY, amplitudeHigh = 1, amplitudeLow = 0 } = params;
  const points = [];
  const labels = [];

  bits.forEach((bit, bitIndex) => {
    const amplitude = bit === 1 ? amplitudeHigh : amplitudeLow;
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      const t = j / SAMPLES_PER_BIT;
      const y = amplitude * Math.sin(2 * Math.PI * frequency * t);
      points.push(y);
      labels.push((bitIndex + t).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * FSK (Frequency Shift Keying)
 * 1 = Frecuencia alta, 0 = Frecuencia baja
 */
export const generateFSK = (binaryString, params = {}) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const { freq0 = 1, freq1 = 3 } = params;
  const points = [];
  const labels = [];

  bits.forEach((bit, bitIndex) => {
    const frequency = bit === 1 ? freq1 : freq0;
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      const t = j / SAMPLES_PER_BIT;
      const y = Math.sin(2 * Math.PI * frequency * t);
      points.push(y);
      labels.push((bitIndex + t).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * PSK (Phase Shift Keying) - BPSK
 * 1 = Fase 0°, 0 = Fase 180°
 */
export const generatePSK = (binaryString, params = {}) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const { frequency = DEFAULT_FREQUENCY } = params;
  const points = [];
  const labels = [];

  bits.forEach((bit, bitIndex) => {
    const phase = bit === 1 ? 0 : Math.PI; // 0° para 1, 180° para 0
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      const t = j / SAMPLES_PER_BIT;
      const y = Math.sin(2 * Math.PI * frequency * t + phase);
      points.push(y);
      labels.push((bitIndex + t).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * QAM (Quadrature Amplitude Modulation)
 * Retorna diagrama de constelación con puntos I/Q
 *
 * Soporta: 4-QAM, 16-QAM, 64-QAM
 */

// Genera los niveles de amplitud para la constelación QAM
const getQAMLevels = (order) => {
  switch (order) {
    case 4:  return [-1, 1];                         // 2x2
    case 16: return [-3, -1, 1, 3];                  // 4x4
    case 64: return [-7, -5, -3, -1, 1, 3, 5, 7];    // 8x8
    default: return [-1, 1];
  }
};

// Obtiene bits por símbolo según el orden QAM
const getBitsPerSymbol = (order) => {
  switch (order) {
    case 4:  return 2;
    case 16: return 4;
    case 64: return 6;
    default: return 2;
  }
};

export const generateQAM = (binaryString, params = {}) => {
  const bits = parseBinaryString(binaryString);
  const { qamOrder = 16 } = params;

  const levels = getQAMLevels(qamOrder);
  const bitsPerSymbol = getBitsPerSymbol(qamOrder);
  const size = levels.length; // Tamaño de cada dimensión

  // Generar todos los puntos de la constelación (para mostrar la cuadrícula)
  const constellationPoints = [];
  for (let i = 0; i < size; i++) {
    for (let q = 0; q < size; q++) {
      constellationPoints.push({
        I: levels[i],
        Q: levels[q],
        label: null // Punto de referencia, sin etiqueta de bits
      });
    }
  }

  // Generar los símbolos transmitidos basados en la entrada binaria
  const transmittedSymbols = [];

  if (bits.length > 0) {
    for (let i = 0; i < bits.length; i += bitsPerSymbol) {
      // Extraer bits para este símbolo
      let symbolBits = '';
      for (let b = 0; b < bitsPerSymbol; b++) {
        const bitIndex = i + b;
        const bit = bitIndex < bits.length ? bits[bitIndex] : 0;
        symbolBits += bit;
      }

      // Dividir bits entre I y Q
      const halfBits = bitsPerSymbol / 2;
      const iBits = symbolBits.substring(0, halfBits);
      const qBits = symbolBits.substring(halfBits);

      const iIndex = parseInt(iBits, 2);
      const qIndex = parseInt(qBits, 2);

      // Obtener valores I y Q
      const I = levels[iIndex] !== undefined ? levels[iIndex] : levels[0];
      const Q = levels[qIndex] !== undefined ? levels[qIndex] : levels[0];

      transmittedSymbols.push({
        I,
        Q,
        bits: symbolBits,
        index: Math.floor(i / bitsPerSymbol)
      });
    }
  }

  // Retornar datos para el diagrama de constelación
  return {
    isConstellation: true,
    qamOrder,
    levels,
    constellationPoints,
    transmittedSymbols,
    // Para compatibilidad con el gráfico existente (no se usará)
    labels: [],
    points: []
  };
};

/**
 * Generador principal para modulaciones digitales
 */
export const generateDigitalModulation = (technique, binaryString, params = {}) => {
  switch (technique) {
    case 'ASK':
      return generateASK(binaryString, params);
    case 'FSK':
      return generateFSK(binaryString, params);
    case 'PSK':
      return generatePSK(binaryString, params);
    case 'QAM':
      return generateQAM(binaryString, params);
    default:
      return { labels: [], points: [] };
  }
};
