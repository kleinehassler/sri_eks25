/**
 * Funciones de utilidad para formatear datos según especificaciones del SRI
 */

/**
 * Formatea un número agregando ceros a la izquierda hasta alcanzar la longitud especificada
 * @param {string|number} value - Valor a formatear
 * @param {number} length - Longitud total deseada
 * @returns {string} Valor formateado con ceros a la izquierda
 */
const padWithZeros = (value, length) => {
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
const formatEstablecimiento = (value) => {
  return padWithZeros(value, 3);
};

/**
 * Formatea el campo de punto de emisión (3 dígitos)
 * @param {string|number} value - Valor del punto de emisión
 * @returns {string} Punto de emisión formateado (ej: 10 → 010)
 */
const formatPuntoEmision = (value) => {
  return padWithZeros(value, 3);
};

/**
 * Formatea el campo de secuencial (9 dígitos)
 * @param {string|number} value - Valor del secuencial
 * @returns {string} Secuencial formateado (ej: 10 → 000000010)
 */
const formatSecuencial = (value) => {
  return padWithZeros(value, 9);
};

/**
 * Formatea número completo de comprobante (formato: XXX-XXX-XXXXXXXXX)
 * @param {string|number} establecimiento - Establecimiento
 * @param {string|number} puntoEmision - Punto de emisión
 * @param {string|number} secuencial - Secuencial
 * @returns {string} Número de comprobante formateado
 */
const formatNumeroComprobante = (establecimiento, puntoEmision, secuencial) => {
  const est = formatEstablecimiento(establecimiento);
  const pto = formatPuntoEmision(puntoEmision);
  const sec = formatSecuencial(secuencial);

  if (!est || !pto || !sec) {
    return '';
  }

  return `${est}-${pto}-${sec}`;
};

/**
 * Formatea todos los campos de comprobante en un objeto
 * Modifica el objeto en su lugar agregando los campos formateados
 * @param {Object} data - Objeto con datos de comprobante
 * @returns {Object} Objeto con campos formateados
 */
const formatComprobanteFields = (data) => {
  if (!data) return data;

  if (data.establecimiento) {
    data.establecimiento = formatEstablecimiento(data.establecimiento);
  }

  if (data.punto_emision) {
    data.punto_emision = formatPuntoEmision(data.punto_emision);
  }

  if (data.secuencial) {
    data.secuencial = formatSecuencial(data.secuencial);
  }

  return data;
};

module.exports = {
  padWithZeros,
  formatEstablecimiento,
  formatPuntoEmision,
  formatSecuencial,
  formatNumeroComprobante,
  formatComprobanteFields
};
