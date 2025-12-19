/**
 * Generadores de señales para categoría: Señal Digital / Dato Digital
 * Técnicas: NRZ-L, NRZ-I, AMI, Pseudoternario, HDB3, Manchester, Manchester Diferencial, B8ZS
 */

const SAMPLES_PER_BIT = 50;

/**
 * Parsea la cadena binaria y retorna array de bits válidos
 */
const MAX_BITS = 16;
const parseBinaryString = (binaryString) => {
  if (!binaryString) return [];
  // Filtrar solo 0 y 1, limitar a MAX_BITS
  return binaryString.split('').filter(c => c === '0' || c === '1').slice(0, MAX_BITS).map(Number);
};

/**
 * Genera puntos para un nivel constante durante un bit
 */
const generateConstantLevel = (level, samples = SAMPLES_PER_BIT) => {
  return Array(samples).fill(level);
};

/**
 * Genera puntos para transición en medio del bit (Manchester)
 */
const generateManchesterBit = (startLevel, endLevel, samples = SAMPLES_PER_BIT) => {
  const half = Math.floor(samples / 2);
  return [
    ...Array(half).fill(startLevel),
    ...Array(samples - half).fill(endLevel)
  ];
};

/**
 * NRZ-L (Non-Return to Zero Level)
 * 1 = Nivel alto (+V), 0 = Nivel bajo (-V)
 */
export const generateNRZL = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const points = [];
  const labels = [];

  bits.forEach((bit, bitIndex) => {
    const level = bit === 1 ? 1 : -1;
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      points.push(level);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * NRZ-I (Non-Return to Zero Inverted)
 * 1 = Transición (cambio de nivel), 0 = Sin cambio
 */
export const generateNRZI = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const points = [];
  const labels = [];
  let currentLevel = 1; // Empezamos en nivel alto

  bits.forEach((bit, bitIndex) => {
    if (bit === 1) {
      currentLevel = -currentLevel; // Invertir en cada 1
    }
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      points.push(currentLevel);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }
  });

  return { labels, points };
};


/**
 * AMI (Alternate Mark Inversion)
 * 1 = Alterna entre +V y -V
 * 0 = Nivel cero
 */
export const generateAMI = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const points = [];
  const labels = [];
  let lastPulse = -1; // Empezamos para que el primer 1 sea positivo

  bits.forEach((bit, bitIndex) => {
    let level;
    if (bit === 1) {
      lastPulse = -lastPulse; // Alternar polaridad
      level = lastPulse;
    } else {
      level = 0;
    }
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      points.push(level);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * Pseudoternario
 * 0 = alterna entre +V y -V
 * 1 = nivel cero
 */
export const generatePseudoternario = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const points = [];
  const labels = [];
  let lastPulse = -1; // Empezamos para que el primer 0 sea positivo

  bits.forEach((bit, bitIndex) => {
    let level;
    if (bit === 0) {
      lastPulse = -lastPulse; // Alternar polaridad para 0
      level = lastPulse;
    } else {
      level = 0;
    }
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      points.push(level);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * HDB3 (High Density Bipolar 3)
 * Como AMI pero reemplaza secuencias de 4 ceros consecutivos
 * Regla: Si el número de pulsos desde la última sustitución es par: 000V
 *        Si es impar: B00V
 * V = Violación (mismo signo que el último pulso)
 * B = Balance (signo opuesto al último pulso, cuenta como pulso)
 */
export const generateHDB3 = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  // Primero aplicamos la codificación HDB3
  const encodedLevels = [];
  let lastPulse = -1; // Para que el primer 1 sea +1
  let pulsesSinceLastSub = 0;
  let i = 0;

  while (i < bits.length) {
    // Verificar si hay 4 ceros consecutivos
    if (i + 3 < bits.length &&
        bits[i] === 0 && bits[i+1] === 0 && bits[i+2] === 0 && bits[i+3] === 0) {

      // Aplicar sustitución HDB3
      if (pulsesSinceLastSub % 2 === 0) {
        // Par: usar patrón B00V
        lastPulse = -lastPulse;
        encodedLevels.push(lastPulse); // B (balance)
        encodedLevels.push(0);
        encodedLevels.push(0);
        encodedLevels.push(lastPulse); // V (violación, mismo signo que B)
      } else {
        // Impar: usar patrón 000V
        encodedLevels.push(0);
        encodedLevels.push(0);
        encodedLevels.push(0);
        encodedLevels.push(lastPulse); // V (violación, mismo signo que último pulso)
      }
      pulsesSinceLastSub = 0;
      i += 4;
    } else if (bits[i] === 1) {
      lastPulse = -lastPulse;
      encodedLevels.push(lastPulse);
      pulsesSinceLastSub++;
      i++;
    } else {
      encodedLevels.push(0);
      i++;
    }
  }

  // Generar puntos para la gráfica
  const points = [];
  const labels = [];

  encodedLevels.forEach((level, bitIndex) => {
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      points.push(level);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * B8ZS (Bipolar 8-Zero Substitution)
 * Como AMI pero reemplaza secuencias de 8 ceros consecutivos
 * Patrón: Si último pulso fue +: 000+-0-+
 *         Si último pulso fue -: 000-+0+-
 */
export const generateB8ZS = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const encodedLevels = [];
  let lastPulse = -1;
  let i = 0;

  while (i < bits.length) {
    // Verificar si hay 8 ceros consecutivos
    if (i + 7 < bits.length &&
        bits.slice(i, i + 8).every(b => b === 0)) {

      // Aplicar sustitución B8ZS
      if (lastPulse === 1) {
        // Último fue +: 000+-0-+
        encodedLevels.push(0, 0, 0, 1, -1, 0, -1, 1);
        lastPulse = 1;
      } else {
        // Último fue -: 000-+0+-
        encodedLevels.push(0, 0, 0, -1, 1, 0, 1, -1);
        lastPulse = -1;
      }
      i += 8;
    } else if (bits[i] === 1) {
      lastPulse = -lastPulse;
      encodedLevels.push(lastPulse);
      i++;
    } else {
      encodedLevels.push(0);
      i++;
    }
  }

  const points = [];
  const labels = [];

  encodedLevels.forEach((level, bitIndex) => {
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      points.push(level);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * Manchester
 * 1 = Transición de bajo a alto en medio del bit
 * 0 = Transición de alto a bajo en medio del bit
 */
export const generateManchester = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const points = [];
  const labels = [];
  const half = Math.floor(SAMPLES_PER_BIT / 2);

  bits.forEach((bit, bitIndex) => {
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      let level;
      if (bit === 1) {
        // 1: bajo en primera mitad, alto en segunda (↑)
        level = j < half ? -1 : 1;
      } else {
        // 0: alto en primera mitad, bajo en segunda (↓)
        level = j < half ? 1 : -1;
      }
      points.push(level);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }
  });

  return { labels, points };
};

/**
 * Manchester Diferencial
 * 0 = Transición al inicio del bit
 * 1 = Sin transición al inicio del bit
 * Siempre hay transición en medio del bit
 */
export const generateManchesterDiff = (binaryString) => {
  const bits = parseBinaryString(binaryString);
  if (bits.length === 0) return { labels: [], points: [] };

  const points = [];
  const labels = [];
  const half = Math.floor(SAMPLES_PER_BIT / 2);
  let currentStartLevel = 1; // Nivel al inicio del bit actual

  bits.forEach((bit, bitIndex) => {
    // Para 0: hay transición al inicio (invertir)
    // Para 1: no hay transición al inicio (mantener)
    if (bit === 0) {
      currentStartLevel = -currentStartLevel;
    }

    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      // Siempre hay transición en medio del bit
      const level = j < half ? currentStartLevel : -currentStartLevel;
      points.push(level);
      labels.push((bitIndex + j / SAMPLES_PER_BIT).toFixed(2));
    }

    // Actualizar nivel para el siguiente bit (después de la transición del medio)
    currentStartLevel = -currentStartLevel;
  });

  return { labels, points };
};

// Generador principal para codificación
export const generateDigitalLineCode = (technique, binaryString) => {
  switch (technique) {
    case 'NRZ-L':
      return generateNRZL(binaryString);
    case 'NRZ-I':
      return generateNRZI(binaryString);
    case 'AMI':
      return generateAMI(binaryString);
    case 'PSEUDOTERNARIO':
      return generatePseudoternario(binaryString);
    case 'HDB3':
      return generateHDB3(binaryString);
    case 'B8ZS':
      return generateB8ZS(binaryString);
    case 'MANCHESTER':
      return generateManchester(binaryString);
    case 'MANCHESTER_DIFF':
      return generateManchesterDiff(binaryString);
    default:
      return { labels: [], points: [] };
  }
};
