/**
 * Índice de generadores de señales
 * Exporta todos los generadores organizados por categoría
 */

export { generateAnalogSignal, generateAM, generateFM, generatePM } from './analogSignals';
export { generateDigitalModulation, generateASK, generateFSK, generatePSK, generateQAM } from './digitalModulations';
export { generateDigitalLineCode, generateNRZL, generateNRZI, generateAMI, generateHDB3, generateB8ZS, generateManchester, generateManchesterDiff } from './digitalLineCodings';
export { generateAnalogToDigital, generatePCM, generateDM } from './analogToDigital';
