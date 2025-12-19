/**
 * Generadores de señales para categoría: Señal Analógica / Dato Analógico
 * Técnicas: AM, FM, PM
 *
 * La función m(t) se evalúa directamente con t para ser compatible con GeoGebra
 */
import { compileFunction } from '../../utils/functionParser';

// Valores fijos internos
const CARRIER_FREQ = 10;      // Hz - Frecuencia de la portadora
const MODULATION_INDEX = 0.5; // Índice de modulación AM
const FREQUENCY_DEVIATION = 5; // Hz - Desviación de frecuencia FM
const PHASE_DEVIATION = Math.PI / 2; // Radianes - Desviación de fase PM

/**
 * Genera señal AM (Amplitude Modulation)
 * Fórmula: s(t) = [1 + m * m(t)] * cos(2π * fc * t)
 */
export const generateAM = (params) => {
  const {
    duration = 2,
    samplesPerSecond = 500,
    customFunction = null
  } = params;

  const totalSamples = Math.floor(duration * samplesPerSecond);
  const points = [];
  const labels = [];

  // Compilar función personalizada o usar seno por defecto
  let messageFunc;
  try {
    messageFunc = customFunction ? compileFunction(customFunction) : null;
  } catch {
    messageFunc = null;
  }

  for (let i = 0; i < totalSamples; i++) {
    const t = i / samplesPerSecond;
    labels.push(t.toFixed(3));

    // Señal mensaje - evaluada directamente con t (compatible con GeoGebra)
    const m_t = messageFunc ? messageFunc(t) : Math.sin(t);

    // Señal AM modulada
    const y = (1 + MODULATION_INDEX * m_t) * Math.cos(2 * Math.PI * CARRIER_FREQ * t);
    points.push(y);
  }

  return { labels, points };
};

/**
 * Genera señal FM (Frequency Modulation)
 * Fórmula: s(t) = cos(2π * fc * t + β * integral(m(t)))
 */
export const generateFM = (params) => {
  const {
    duration = 2,
    samplesPerSecond = 500,
    customFunction = null
  } = params;

  const totalSamples = Math.floor(duration * samplesPerSecond);
  const points = [];
  const labels = [];

  // Compilar función personalizada o usar seno por defecto
  let messageFunc;
  try {
    messageFunc = customFunction ? compileFunction(customFunction) : null;
  } catch {
    messageFunc = null;
  }

  // Para FM necesitamos la integral de m(t), aproximamos con suma acumulativa
  let phaseAccum = 0;
  const dt = 1 / samplesPerSecond;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / samplesPerSecond;
    labels.push(t.toFixed(3));

    // Señal mensaje - evaluada directamente con t (compatible con GeoGebra)
    const m_t = messageFunc ? messageFunc(t) : Math.sin(t);

    // Acumular fase (integral numérica de m(t))
    phaseAccum += m_t * dt;

    // Señal FM modulada
    const y = Math.cos(2 * Math.PI * CARRIER_FREQ * t + FREQUENCY_DEVIATION * 2 * Math.PI * phaseAccum);
    points.push(y);
  }

  return { labels, points };
};

/**
 * Genera señal PM (Phase Modulation)
 * Fórmula: s(t) = cos(2π * fc * t + Δφ * m(t))
 */
export const generatePM = (params) => {
  const {
    duration = 2,
    samplesPerSecond = 500,
    customFunction = null
  } = params;

  const totalSamples = Math.floor(duration * samplesPerSecond);
  const points = [];
  const labels = [];

  // Compilar función personalizada o usar seno por defecto
  let messageFunc;
  try {
    messageFunc = customFunction ? compileFunction(customFunction) : null;
  } catch {
    messageFunc = null;
  }

  for (let i = 0; i < totalSamples; i++) {
    const t = i / samplesPerSecond;
    labels.push(t.toFixed(3));

    // Señal mensaje - evaluada directamente con t (compatible con GeoGebra)
    const m_t = messageFunc ? messageFunc(t) : Math.sin(t);

    // Señal PM modulada
    const y = Math.cos(2 * Math.PI * CARRIER_FREQ * t + PHASE_DEVIATION * m_t);
    points.push(y);
  }

  return { labels, points };
};

/**
 * Generador principal para señales analógicas
 */
export const generateAnalogSignal = (technique, params) => {
  switch (technique) {
    case 'AM':
      return generateAM(params);
    case 'FM':
      return generateFM(params);
    case 'PM':
      return generatePM(params);
    default:
      return { labels: [], points: [] };
  }
};
