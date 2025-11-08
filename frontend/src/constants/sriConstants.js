/**
 * Constantes del SRI (Servicio de Rentas Internas del Ecuador)
 * Catálogos oficiales para el sistema de facturación electrónica y ATS
 */

/**
 * TIPOS DE IDENTIFICACIÓN
 * Códigos oficiales del SRI para identificar a contribuyentes
 */
export const TIPOS_IDENTIFICACION = [
  { value: '01', label: '01 - RUC' },
  { value: '02', label: '02 - Cédula' },
  { value: '03', label: '03 - Pasaporte' },
  { value: '07', label: '07 - Consumidor Final' },
  { value: '08', label: '08 - Identificación del Exterior' },
];

/**
 * TIPOS DE PROVEEDOR
 */
export const TIPOS_PROVEEDOR = [
  { value: '01', label: '01 - Persona Natural' },
  { value: '02', label: '02 - Sociedad' },
  { value: '03', label: '03 - Extranjero' },
];

/**
 * TIPOS DE COMPROBANTES
 */
export const TIPOS_COMPROBANTE = [
  { value: '01', label: '01 - Factura' },
  { value: '04', label: '04 - Nota de Crédito' },
  { value: '05', label: '05 - Nota de Débito' },
  { value: '03', label: '03 - Liquidación de Compra' },
  { value: '06', label: '06 - Guía de Remisión' },
  { value: '07', label: '07 - Comprobante de Retención' },
];

/**
 * CÓDIGOS DE SUSTENTO TRIBUTARIO
 */
export const CODIGOS_SUSTENTO = [
  { value: '01', label: '01 - Crédito Tributario para declaración de IVA' },
  { value: '02', label: '02 - Costo o Gasto para declaración de IR' },
  { value: '03', label: '03 - Activo Fijo' },
  { value: '04', label: '04 - Liquidación Gastos de Viaje' },
  { value: '05', label: '05 - Deducción por Terceros' },
  { value: '06', label: '06 - Crédito Tributario sin derecho a devolución' },
];

/**
 * FORMAS DE PAGO
 */
export const FORMAS_PAGO = [
  { value: '01', label: '01 - Sin utilización del sistema financiero' },
  { value: '15', label: '15 - Compensación de deudas' },
  { value: '16', label: '16 - Tarjeta de débito' },
  { value: '17', label: '17 - Dinero electrónico' },
  { value: '18', label: '18 - Tarjeta prepago' },
  { value: '19', label: '19 - Tarjeta de crédito' },
  { value: '20', label: '20 - Otros con utilización del sistema financiero' },
  { value: '21', label: '21 - Endoso de títulos' },
];

/**
 * CÓDIGOS DE RETENCIÓN IVA
 */
export const CODIGOS_RETENCION_IVA = [
  { value: '1', label: '1 - Retención IVA 10%', porcentaje: 10 },
  { value: '2', label: '2 - Retención IVA 20%', porcentaje: 20 },
  { value: '3', label: '3 - Retención IVA 30%', porcentaje: 30 },
  { value: '7', label: '7 - Retención IVA 70%', porcentaje: 70 },
  { value: '8', label: '8 - Retención IVA 100%', porcentaje: 100 },
];

/**
 * CÓDIGOS DE RETENCIÓN RENTA (principales)
 */
export const CODIGOS_RETENCION_RENTA = [
  { value: '303', label: '303 - Honorarios profesionales y demás pagos por servicios relacionados con el título profesional - 10%', porcentaje: 10 },
  { value: '304', label: '304 - Servicios predomina el intelecto - 8%', porcentaje: 8 },
  { value: '307', label: '307 - Servicios predomina mano de obra - 2%', porcentaje: 2 },
  { value: '308', label: '308 - Utilización o aprovechamiento de la imagen o renombre - 10%', porcentaje: 10 },
  { value: '309', label: '309 - Servicios de publicidad y comunicación - 1%', porcentaje: 1 },
  { value: '310', label: '310 - Servicios de transporte privado de pasajeros o transporte público o privado de carga - 1%', porcentaje: 1 },
  { value: '311', label: '311 - Transferencia de bienes muebles de naturaleza corporal - 1%', porcentaje: 1 },
  { value: '312', label: '312 - Compra de bienes de origen agrícola, avícola, pecuario, apícola, cunícula, bioacuático y forestal - 1%', porcentaje: 1 },
  { value: '319', label: '319 - Arrendamiento mercantil - 1%', porcentaje: 1 },
  { value: '320', label: '320 - Arrendamiento bienes inmuebles - 8%', porcentaje: 8 },
  { value: '322', label: '322 - Seguros y reaseguros (primas y cesiones) - 1%', porcentaje: 1 },
  { value: '323', label: '323 - Rendimientos financieros - 2%', porcentaje: 2 },
  { value: '332', label: '332 - Otras retenciones aplicables el 2% - 2%', porcentaje: 2 },
];

/**
 * TIPOS DE IMPUESTO
 */
export const TIPOS_IMPUESTO = [
  { value: 'IVA', label: 'IVA' },
  { value: 'RENTA', label: 'Renta' },
];

/**
 * ESTADOS DE TRANSACCIÓN
 */
export const ESTADOS_TRANSACCION = [
  { value: 'BORRADOR', label: 'Borrador', color: 'default' },
  { value: 'VALIDADO', label: 'Validado', color: 'success' },
  { value: 'INCLUIDO_ATS', label: 'Incluido en ATS', color: 'info' },
  { value: 'ANULADO', label: 'Anulado', color: 'error' },
];

/**
 * AMBIENTES SRI
 */
export const AMBIENTES_SRI = [
  { value: 'PRUEBAS', label: 'Ambiente de Pruebas' },
  { value: 'PRODUCCION', label: 'Ambiente de Producción' },
];

/**
 * TARIFAS IVA ACTUALES
 */
export const TARIFA_IVA_ACTUAL = 0.15; // 15%
export const TARIFA_IVA_PORCENTAJE = 15;

/**
 * CÓDIGO DE PAÍS ECUADOR
 */
export const CODIGO_PAIS_ECUADOR = '593';

/**
 * LONGITUD DE CLAVE DE ACCESO
 */
export const LONGITUD_CLAVE_ACCESO = 49;

/**
 * FORMATOS DE FECHA
 */
export const FORMATO_FECHA_SRI = 'DD/MM/YYYY';
export const FORMATO_PERIODO_SRI = 'MM/YYYY';

/**
 * EXPRESIONES REGULARES DE VALIDACIÓN
 */
export const REGEX_RUC = /^\d{10}001$/;
export const REGEX_CEDULA = /^\d{10}$/;
export const REGEX_PERIODO = /^(0[1-9]|1[0-2])\/\d{4}$/;
export const REGEX_ESTABLECIMIENTO = /^[0-9]{3}$/;
export const REGEX_PUNTO_EMISION = /^[0-9]{3}$/;
export const REGEX_SECUENCIAL = /^[0-9]{1,9}$/;
export const REGEX_AUTORIZACION = /^\d{10,49}$/;
export const REGEX_CLAVE_ACCESO = /^\d{49}$/;

/**
 * Función helper para obtener el label de un código
 */
export const getLabelByCodigo = (lista, codigo) => {
  const item = lista.find(item => item.value === codigo);
  return item ? item.label : codigo;
};

/**
 * Función helper para obtener el color de un estado
 */
export const getColorEstado = (estado) => {
  const item = ESTADOS_TRANSACCION.find(e => e.value === estado);
  return item ? item.color : 'default';
};

/**
 * Función helper para obtener el porcentaje de retención
 */
export const getPorcentajeRetencion = (lista, codigo) => {
  const item = lista.find(item => item.value === codigo);
  return item ? item.porcentaje : 0;
};
