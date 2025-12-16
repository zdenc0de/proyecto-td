/**
 * Generadores de señales para categoría: Señal Digital / Dato Analógico
 * Técnicas: PCM, DM (Delta Modulation)
 */
import { compileFunction } from '../../utils/functionParser';

/**
 * PCM (Pulse Code Modulation)
 * Muestreo, cuantización y codificación de señal analógica
 */
export const generatePCM = (params = {}) => {
  const {
    messageFreq = 1,
    samplingRate = 16,
    quantizationLevels = 8,
    duration = 2,
    customFunction = null
  } = params;

  const points = [];
  const labels = [];
  const originalSignal = [];

  // Compilar función personalizada o usar seno por defecto
  let messageFunc;
  try {
    messageFunc = customFunction ? compileFunction(customFunction) : null;
  } catch {
    messageFunc = null;
  }

  // Número total de puntos para visualización suave
  const totalPoints = 400;
  const totalSamples = Math.floor(duration * samplingRate);
  const pointsPerSample = Math.floor(totalPoints / totalSamples);

  // Generar señal original y cuantizada sincronizadas
  for (let i = 0; i < totalPoints; i++) {
    const t = (i / totalPoints) * duration;
    labels.push(t.toFixed(3));

    // Señal original - usa función personalizada o seno
    const analogValue = messageFunc
      ? messageFunc(t * messageFreq)
      : Math.sin(2 * Math.PI * messageFreq * t);
    originalSignal.push(analogValue);

    // Determinar en qué muestra estamos
    const sampleIndex = Math.floor(i / pointsPerSample);
    const sampleTime = (sampleIndex / samplingRate);
    const sampleValue = messageFunc
      ? messageFunc(sampleTime * messageFreq)
      : Math.sin(2 * Math.PI * messageFreq * sampleTime);

    // Cuantización: mapear al nivel más cercano
    const normalizedValue = (sampleValue + 1) / 2; // 0 a 1
    const levelIndex = Math.round(normalizedValue * (quantizationLevels - 1));
    const quantizedValue = (levelIndex / (quantizationLevels - 1)) * 2 - 1; // -1 a 1

    points.push(quantizedValue);
  }

  return {
    labels,
    points,
    originalSignal,
    messageSignal: originalSignal // Para mostrar la señal original superpuesta
  };
};

/**
 * DM (Delta Modulation)
 * Codifica la diferencia entre muestras consecutivas
 * Muestra la señal reconstruida vs la original
 */
export const generateDM = (params = {}) => {
  const {
    messageFreq = 1,
    samplingRate = 32,
    stepSize = 0.2,
    duration = 2,
    customFunction = null
  } = params;

  const points = [];
  const labels = [];
  const originalSignal = [];

  // Compilar función personalizada o usar seno por defecto
  let messageFunc;
  try {
    messageFunc = customFunction ? compileFunction(customFunction) : null;
  } catch {
    messageFunc = null;
  }

  // Número total de puntos para visualización
  const totalPoints = 400;
  const totalSamples = Math.floor(duration * samplingRate);
  const pointsPerSample = Math.floor(totalPoints / totalSamples);

  // Primero calculamos todos los valores de delta modulation
  const deltaValues = [];
  let predictedValue = 0;

  for (let i = 0; i < totalSamples; i++) {
    const sampleTime = i / samplingRate;
    const analogValue = messageFunc
      ? messageFunc(sampleTime * messageFreq)
      : Math.sin(2 * Math.PI * messageFreq * sampleTime);

    // Delta Modulation: comparar con predicción
    if (analogValue > predictedValue) {
      predictedValue += stepSize;
    } else {
      predictedValue -= stepSize;
    }

    // Limitar predicción al rango
    predictedValue = Math.max(-1, Math.min(1, predictedValue));
    deltaValues.push(predictedValue);
  }

  // Generar puntos sincronizados para visualización
  for (let i = 0; i < totalPoints; i++) {
    const t = (i / totalPoints) * duration;
    labels.push(t.toFixed(3));

    // Señal original - usa función personalizada o seno
    const analogValue = messageFunc
      ? messageFunc(t * messageFreq)
      : Math.sin(2 * Math.PI * messageFreq * t);
    originalSignal.push(analogValue);

    // Señal reconstruida (escalonada)
    const sampleIndex = Math.min(Math.floor(i / pointsPerSample), deltaValues.length - 1);
    points.push(deltaValues[sampleIndex]);
  }

  return {
    labels,
    points,
    originalSignal,
    messageSignal: originalSignal // Para mostrar la señal original superpuesta
  };
};

/**
 * Generador principal para conversión analógico-digital
 */
export const generateAnalogToDigital = (technique, params = {}) => {
  switch (technique) {
    case 'PCM':
      return generatePCM(params);
    case 'DM':
      return generateDM(params);
    default:
      return { labels: [], points: [] };
  }
};
