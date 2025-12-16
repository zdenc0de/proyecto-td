/**
 * Generadores de señales para categoría: Señal Analógica / Dato Analógico
 * Técnicas: AM, FM, PM
 */
import { compileFunction } from '../../utils/functionParser';

/**
 * Genera señal AM (Amplitude Modulation)
 * Fórmula: s(t) = Ac * [1 + m * m(t)] * cos(2π * fc * t)
 */
export const generateAM = (params) => {
  const {
    carrierFreq = 10,
    messageFreq = 1,
    modulationIndex = 0.5,
    duration = 2,
    samplesPerSecond = 500,
    customFunction = null
  } = params;

  const totalSamples = Math.floor(duration * samplesPerSecond);
  const points = [];
  const labels = [];
  const messageSignal = [];
  const carrierSignal = [];

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

    // Señal mensaje (moduladora) - usa función personalizada o seno
    const m_t = messageFunc
      ? messageFunc(t * messageFreq)
      : Math.sin(2 * Math.PI * messageFreq * t);
    messageSignal.push(m_t);

    // Señal portadora
    const carrier = Math.cos(2 * Math.PI * carrierFreq * t);
    carrierSignal.push(carrier);

    // Señal AM modulada
    const y = (1 + modulationIndex * m_t) * Math.cos(2 * Math.PI * carrierFreq * t);
    points.push(y);
  }

  return { labels, points, messageSignal, carrierSignal };
};

/**
 * Genera señal FM (Frequency Modulation)
 * Fórmula: s(t) = Ac * cos(2π * fc * t + β * sin(2π * fm * t))
 * donde β = Δf / fm (índice de modulación FM)
 */
export const generateFM = (params) => {
  const {
    carrierFreq = 10,
    messageFreq = 1,
    frequencyDeviation = 5,
    duration = 2,
    samplesPerSecond = 500,
    customFunction = null
  } = params;

  const totalSamples = Math.floor(duration * samplesPerSecond);
  const points = [];
  const labels = [];
  const messageSignal = [];
  const carrierSignal = [];

  // Índice de modulación FM
  const beta = frequencyDeviation / messageFreq;

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

    // Señal mensaje
    const m_t = messageFunc
      ? messageFunc(t * messageFreq)
      : Math.sin(2 * Math.PI * messageFreq * t);
    messageSignal.push(m_t);

    // Señal portadora (referencia)
    const carrier = Math.cos(2 * Math.PI * carrierFreq * t);
    carrierSignal.push(carrier);

    // Acumular fase (integral numérica de m(t))
    phaseAccum += m_t * dt * messageFreq;

    // Señal FM modulada - la fase instantánea cambia con la integral de m(t)
    const y = Math.cos(2 * Math.PI * carrierFreq * t + beta * 2 * Math.PI * phaseAccum);
    points.push(y);
  }

  return { labels, points, messageSignal, carrierSignal };
};

/**
 * Genera señal PM (Phase Modulation)
 * Fórmula: s(t) = Ac * cos(2π * fc * t + Δφ * m(t))
 */
export const generatePM = (params) => {
  const {
    carrierFreq = 10,
    messageFreq = 1,
    phaseDeviation = Math.PI / 2,
    duration = 2,
    samplesPerSecond = 500,
    customFunction = null
  } = params;

  const totalSamples = Math.floor(duration * samplesPerSecond);
  const points = [];
  const labels = [];
  const messageSignal = [];
  const carrierSignal = [];

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

    // Señal mensaje
    const m_t = messageFunc
      ? messageFunc(t * messageFreq)
      : Math.sin(2 * Math.PI * messageFreq * t);
    messageSignal.push(m_t);

    // Señal portadora (referencia)
    const carrier = Math.cos(2 * Math.PI * carrierFreq * t);
    carrierSignal.push(carrier);

    // Señal PM modulada - la fase cambia directamente con m(t)
    const y = Math.cos(2 * Math.PI * carrierFreq * t + phaseDeviation * m_t);
    points.push(y);
  }

  return { labels, points, messageSignal, carrierSignal };
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
      return { labels: [], points: [], messageSignal: [], carrierSignal: [] };
  }
};
