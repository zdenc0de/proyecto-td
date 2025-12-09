/**
 * Generadores de señales para categoría: Señal Digital / Dato Analógico
 * Técnicas: PCM, DM (Delta Modulation)
 */

/**
 * PCM (Pulse Code Modulation)
 * Muestreo, cuantización y codificación de señal analógica
 */
export const generatePCM = (params = {}) => {
  const {
    messageFreq = 1,
    samplingRate = 16,      // Muestras por segundo
    quantizationLevels = 8, // Niveles de cuantización (2^n)
    duration = 2
  } = params;

  const points = [];
  const labels = [];
  const originalSignal = [];
  const sampledPoints = [];
  const quantizedLevels = [];

  // Generar señal original con alta resolución para visualización
  const highResSamples = duration * 200;
  for (let i = 0; i < highResSamples; i++) {
    const t = i / 200;
    const value = Math.sin(2 * Math.PI * messageFreq * t);
    originalSignal.push({ t, value });
  }

  // Muestreo y cuantización
  const totalSamples = Math.floor(duration * samplingRate);
  const step = 2 / quantizationLevels; // Rango de -1 a 1

  for (let i = 0; i < totalSamples; i++) {
    const t = i / samplingRate;
    const analogValue = Math.sin(2 * Math.PI * messageFreq * t);

    // Cuantización: mapear al nivel más cercano
    const normalizedValue = (analogValue + 1) / 2; // 0 a 1
    const levelIndex = Math.round(normalizedValue * (quantizationLevels - 1));
    const quantizedValue = (levelIndex / (quantizationLevels - 1)) * 2 - 1; // volver a -1 a 1

    sampledPoints.push({ t, original: analogValue, quantized: quantizedValue, level: levelIndex });
    quantizedLevels.push(quantizedValue);
  }

  // Generar salida PCM como niveles escalonados
  const samplesPerLevel = Math.floor(200 / samplingRate);
  sampledPoints.forEach((sample, idx) => {
    for (let j = 0; j < samplesPerLevel; j++) {
      const t = sample.t + (j / samplingRate / samplesPerLevel);
      points.push(sample.quantized);
      labels.push(t.toFixed(3));
    }
  });

  return {
    labels,
    points,
    originalSignal: originalSignal.map(s => s.value),
    originalLabels: originalSignal.map(s => s.t.toFixed(3)),
    sampledPoints,
    quantizationLevels
  };
};

/**
 * DM (Delta Modulation)
 * Codifica la diferencia entre muestras consecutivas
 * Salida: +1 si la señal sube, -1 si baja
 */
export const generateDM = (params = {}) => {
  const {
    messageFreq = 1,
    samplingRate = 32,
    stepSize = 0.2,
    duration = 2
  } = params;

  const points = [];
  const labels = [];
  const originalSignal = [];
  const reconstructed = [];

  // Generar señal original
  const totalSamples = Math.floor(duration * samplingRate);
  let predictedValue = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / samplingRate;
    const analogValue = Math.sin(2 * Math.PI * messageFreq * t);
    originalSignal.push(analogValue);

    // Delta Modulation: comparar con predicción
    let delta;
    if (analogValue > predictedValue) {
      delta = 1;
      predictedValue += stepSize;
    } else {
      delta = -1;
      predictedValue -= stepSize;
    }

    // Limitar predicción al rango
    predictedValue = Math.max(-1, Math.min(1, predictedValue));
    reconstructed.push(predictedValue);

    // Generar puntos para la visualización
    const samplesPerBit = Math.floor(200 / samplingRate);
    for (let j = 0; j < samplesPerBit; j++) {
      points.push(delta);
      labels.push((t + j / samplingRate / samplesPerBit).toFixed(3));
    }
  }

  return {
    labels,
    points,
    originalSignal,
    reconstructed
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
