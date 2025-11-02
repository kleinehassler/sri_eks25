/**
 * Funciones de utilidad para formatear datos en el frontend
 */

/**
 * Formatea un número agregando ceros a la izquierda hasta alcanzar la longitud especificada
 * @param {string|number} value - Valor a formatear
 * @param {number} length - Longitud total deseada
 * @returns {string} Valor formateado con ceros a la izquierda
 */
export const padWithZeros = (value, length) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Convertir a string y eliminar espacios
  const stringValue = String(value).trim();

  // Si está vacío después de trim, retornar vacío
  if (stringValue === '') {
    return '';
  }

  // Rellenar con ceros a la izquierda
  return stringValue.padStart(length, '0');
};

/**
 * Formatea el campo de establecimiento (3 dígitos)
 * @param {string|number} value - Valor del establecimiento
 * @returns {string} Establecimiento formateado (ej: 10 → 010)
 */
export const formatEstablecimiento = (value) => {
  return padWithZeros(value, 3);
};

/**
 * Formatea el campo de punto de emisión (3 dígitos)
 * @param {string|number} value - Valor del punto de emisión
 * @returns {string} Punto de emisión formateado (ej: 10 → 010)
 */
export const formatPuntoEmision = (value) => {
  return padWithZeros(value, 3);
};

/**
 * Formatea el campo de secuencial (9 dígitos)
 * @param {string|number} value - Valor del secuencial
 * @returns {string} Secuencial formateado (ej: 10 → 000000010)
 */
export const formatSecuencial = (value) => {
  return padWithZeros(value, 9);
};

/**
 * Formatea número completo de comprobante (formato: XXX-XXX-XXXXXXXXX)
 * @param {string|number} establecimiento - Establecimiento
 * @param {string|number} puntoEmision - Punto de emisión
 * @param {string|number} secuencial - Secuencial
 * @returns {string} Número de comprobante formateado
 */
export const formatNumeroComprobante = (establecimiento, puntoEmision, secuencial) => {
  const est = formatEstablecimiento(establecimiento);
  const pto = formatPuntoEmision(puntoEmision);
  const sec = formatSecuencial(secuencial);

  if (!est || !pto || !sec) {
    return '';
  }

  return `${est}-${pto}-${sec}`;
};

/**
 * Formatea un valor monetario a 2 decimales
 * @param {string|number} value - Valor monetario
 * @returns {number} Valor formateado a 2 decimales
 */
export const formatMonetaryValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  return parseFloat(parseFloat(value).toFixed(2));
};

/**
 * Formatea una fecha en formato YYYY-MM-DD a DD/MM/YYYY
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export const formatDateToDMY = (date) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha en formato DD/MM/YYYY a YYYY-MM-DD
 * @param {string} date - Fecha en formato DD/MM/YYYY
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateToYMD = (date) => {
  if (!date) return '';
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};
