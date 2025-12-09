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
 * QAM (Quadrature Amplitude Modulation) - 4-QAM simplificado
 * Combina ASK y PSK para transmitir 2 bits por símbolo
 * 00 = A1∠0°, 01 = A1∠90°, 10 = A1∠180°, 11 = A1∠270°
 */
export const generateQAM = (binaryString, params = {}) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const { frequency = DEFAULT_FREQUENCY } = params;
  const points = [];
  const labels = [];

  // Procesar de 2 en 2 bits (dibits)
  for (let i = 0; i < bits.length; i += 2) {
    const bit1 = bits[i];
    const bit2 = i + 1 < bits.length ? bits[i + 1] : 0;
    const dibit = bit1 * 2 + bit2;

    // Mapeo de dibits a fase (4-QAM / QPSK)
    const phases = [Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4];
    const phase = phases[dibit];

    const symbolIndex = Math.floor(i / 2);
    for (let j = 0; j < SAMPLES_PER_BIT * 2; j++) {
      const t = j / (SAMPLES_PER_BIT * 2);
      const y = Math.sin(2 * Math.PI * frequency * t + phase);
      points.push(y);
      labels.push((symbolIndex + t).toFixed(2));
    }
  }

  return { labels, points };
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
