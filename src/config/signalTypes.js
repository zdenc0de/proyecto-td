// Configuración de tipos de señales y técnicas de modulación

export const SIGNAL_CATEGORIES = {
  ANALOG_ANALOG: {
    id: 'analog_analog',
    name: 'Señal Analógica / Dato Analógico',
    description: 'Modulación de señales analógicas con datos analógicos',
    techniques: ['AM', 'FM', 'PM']
  },
  ANALOG_DIGITAL: {
    id: 'analog_digital',
    name: 'Señal Analógica / Dato Digital',
    description: 'Modulación de señales analógicas con datos digitales',
    techniques: ['ASK', 'FSK', 'PSK', 'QAM']
  },
  DIGITAL_ANALOG: {
    id: 'digital_analog',
    name: 'Señal Digital / Dato Analógico',
    description: 'Conversión de señales analógicas a digitales',
    techniques: ['PCM', 'DM']
  },
  DIGITAL_DIGITAL: {
    id: 'digital_digital',
    name: 'Señal Digital / Dato Digital',
    description: 'Codificación para datos digitales',
    techniques: ['NRZ-L', 'NRZ-I', 'AMI', 'PSEUDOTERNARIO', 'HDB3', 'MANCHESTER', 'MANCHESTER_DIFF', 'B8ZS']
    // ...
  }
};

export const TECHNIQUES = {
  // SEÑAL ANALÓGICA / DATO ANALÓGICO
  AM: {
    id: 'AM',
    name: 'AM (Amplitude Modulation)',
    fullName: 'Modulación de Amplitud',
    category: 'analog_analog',
    description: 'La amplitud de la portadora varía según la señal moduladora',
    params: ['carrierFreq', 'modulationIndex', 'messageFreq']
  },
  FM: {
    id: 'FM',
    name: 'FM (Frequency Modulation)',
    fullName: 'Modulación de Frecuencia',
    category: 'analog_analog',
    description: 'La frecuencia de la portadora varía según la señal moduladora',
    params: ['carrierFreq', 'frequencyDeviation', 'messageFreq']
  },
  PM: {
    id: 'PM',
    name: 'PM (Phase Modulation)',
    fullName: 'Modulación de Fase',
    category: 'analog_analog',
    description: 'La fase de la portadora varía según la señal moduladora',
    params: ['carrierFreq', 'phaseDeviation', 'messageFreq']
  },

  // SEÑAL ANALÓGICA / DATO DIGITAL
  ASK: {
    id: 'ASK',
    name: 'ASK (Amplitude Shift Keying)',
    fullName: 'Modulación por Desplazamiento de Amplitud',
    category: 'analog_digital',
    description: 'La amplitud cambia según el bit',
    params: ['frequency', 'binaryInput']
  },
  FSK: {
    id: 'FSK',
    name: 'FSK (Frequency Shift Keying)',
    fullName: 'Modulación por Desplazamiento de Frecuencia',
    category: 'analog_digital',
    description: 'La frecuencia cambia según el bit',
    params: ['freq0', 'freq1', 'binaryInput']
  },
  PSK: {
    id: 'PSK',
    name: 'PSK (Phase Shift Keying)',
    fullName: 'Modulación por Desplazamiento de Fase',
    category: 'analog_digital',
    description: 'La fase cambia según el bit (0° para 0, 180° para 1)',
    params: ['frequency', 'binaryInput']
  },
  QAM: {
    id: 'QAM',
    name: 'QAM (Quadrature Amplitude Modulation)',
    fullName: 'Modulación de Amplitud en Cuadratura',
    category: 'analog_digital',
    description: 'Combina ASK y PSK',
    params: ['frequency', 'binaryInput']
  },

  // SEÑAL DIGITAL / DATO ANALÓGICO
  PCM: {
    id: 'PCM',
    name: 'PCM (Pulse Code Modulation)',
    fullName: 'Modulación por Codificación de Pulsos',
    category: 'digital_analog',
    description: 'Muestreo, cuantización y codificación de señal analógica',
    params: ['samplingRate', 'quantizationLevels', 'messageFreq']
  },
  DM: {
    id: 'DM',
    name: 'DM (Delta Modulation)',
    fullName: 'Modulación Delta',
    category: 'digital_analog',
    description: 'Codifica la diferencia entre muestras consecutivas',
    params: ['samplingRate', 'stepSize', 'messageFreq']
  },

  // SEÑAL DIGITAL / DATO DIGITAL
  'NRZ-L': {
    id: 'NRZ-L',
    name: 'NRZ-L (Non-Return to Zero Level)',
    fullName: 'Sin Retorno a Cero - Nivel',
    category: 'digital_digital',
    description: 'Nivel alto para 1, nivel bajo para 0.',
    params: ['binaryInput']
  },
  'NRZ-I': {
    id: 'NRZ-I',
    name: 'NRZ-I (Non-Return to Zero Inverted)',
    fullName: 'Sin Retorno a Cero - Invertido',
    category: 'digital_digital',
    description: 'Transición en 1, sin transición en 0',
    params: ['binaryInput']
  },
  AMI: {
    id: 'AMI',
    name: 'AMI (Alternate Mark Inversion)',
    fullName: 'Inversión de Marca Alternada',
    category: 'digital_digital',
    description: 'Los 1s alternan entre +V y -V, los 0s son 0V',
    params: ['binaryInput']
  },
  PSEUDOTERNARIO: {
      id: 'PSEUDOTERNARIO',
      name: 'Pseudoternario',
      category: 'digital_digital',
      description: 'Los 0s alternan entre +V y -V, los 1s son 0V',
      params: ['binaryInput']
  },
  HDB3: {
    id: 'HDB3',
    name: 'HDB3 (High Density Bipolar 3)',
    fullName: 'Bipolar de Alta Densidad 3',
    category: 'digital_digital',
    description: 'Funciona como AMI pero sustituye secuencias de 4 ceros por 000V si el número de pulsos distintos de 0 desde la última sustitución es impar o por B00V si es par',
    params: ['binaryInput']
  },
  MANCHESTER: {
    id: 'MANCHESTER',
    name: 'Manchester',
    category: 'digital_digital',
    description: 'Transición a la mitad del intervalo: de bajo a alto para 1 y de alto a bajo para 0',
    params: ['binaryInput']
  },
  MANCHESTER_DIFF: {
    id: 'MANCHESTER_DIFF',
    name: 'Manchester Diferencial',
    category: 'digital_digital',
    description: 'Transición al inicio para 0, sin transición al inicio para 1',
    params: ['binaryInput']
  },
  B8ZS: {
    id: 'B8ZS',
    name: 'B8ZS (Bipolar 8-Zero Substitution)',
    fullName: 'Sustitución Bipolar de 8 Ceros',
    category: 'digital_digital',
    description: 'Funciona como AMI pero sustituye secuencias de 8 ceros por 000VB0VB',
    params: ['binaryInput']
  }
};

// Parámetros por defecto para señales analógicas
export const DEFAULT_ANALOG_PARAMS = {
  carrierFreq: 10,        // Hz - Frecuencia de la portadora
  messageFreq: 1,         // Hz - Frecuencia de la señal mensaje
  modulationIndex: 0.5,   // Índice de modulación AM (0-1)
  frequencyDeviation: 5,  // Hz - Desviación de frecuencia FM
  phaseDeviation: Math.PI / 2, // Radianes - Desviación de fase PM
  duration: 2,            // Segundos - Duración de la señal
  samplesPerSecond: 500   // Muestras por segundo
};
