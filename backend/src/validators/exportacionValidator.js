const { body, param, query } = require('express-validator');

/**
 * Validaciones para crear exportación
 */
const validarCrearExportacion = [
  body('periodo')
    .trim()
    .notEmpty()
    .withMessage('El periodo es requerido')
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA'),

  body('tipo_comprobante')
    .trim()
    .notEmpty()
    .withMessage('El tipo de comprobante es requerido')
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de comprobante debe tener 2 caracteres'),

  body('fecha_emision')
    .notEmpty()
    .withMessage('La fecha de emisión es requerida')
    .isISO8601()
    .withMessage('Debe proporcionar una fecha válida en formato ISO8601'),

  body('establecimiento')
    .trim()
    .notEmpty()
    .withMessage('El establecimiento es requerido')
    .matches(/^[0-9]{3}$/)
    .withMessage('El establecimiento debe tener 3 dígitos numéricos'),

  body('punto_emision')
    .trim()
    .notEmpty()
    .withMessage('El punto de emisión es requerido')
    .matches(/^[0-9]{3}$/)
    .withMessage('El punto de emisión debe tener 3 dígitos numéricos'),

  body('secuencial')
    .trim()
    .notEmpty()
    .withMessage('El secuencial es requerido')
    .matches(/^[0-9]{1,9}$/)
    .withMessage('El secuencial debe ser numérico de hasta 9 dígitos'),

  body('numero_autorizacion')
    .trim()
    .notEmpty()
    .withMessage('El número de autorización es requerido')
    .isLength({ min: 10, max: 49 })
    .withMessage('El número de autorización debe tener entre 10 y 49 caracteres'),

  body('tipo_cliente')
    .notEmpty()
    .withMessage('El tipo de cliente es requerido')
    .isIn(['01', '02'])
    .withMessage('El tipo de cliente debe ser 01 (Persona Natural) o 02 (Sociedad)'),

  body('tipo_identificacion')
    .trim()
    .notEmpty()
    .withMessage('El tipo de identificación es requerido')
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de identificación debe tener 2 caracteres'),

  body('identificacion_cliente')
    .trim()
    .notEmpty()
    .withMessage('La identificación del cliente es requerida')
    .isLength({ min: 1, max: 20 })
    .withMessage('La identificación debe tener entre 1 y 20 caracteres'),

  body('razon_social_cliente')
    .trim()
    .notEmpty()
    .withMessage('La razón social del cliente es requerida')
    .isLength({ min: 1, max: 300 })
    .withMessage('La razón social debe tener entre 1 y 300 caracteres'),

  body('pais_destino')
    .trim()
    .notEmpty()
    .withMessage('El país de destino es requerido')
    .isLength({ min: 3, max: 3 })
    .withMessage('El código del país debe tener 3 caracteres (ISO 3166)'),

  body('pais_efect_pago')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El código del país de efectivización del pago debe tener 3 caracteres (ISO 3166)'),

  body('tipo_regimen_fiscal')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de régimen fiscal debe tener 2 caracteres'),

  body('pais_regimen_fiscal')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El código del país del régimen fiscal debe tener 3 caracteres (ISO 3166)'),

  body('valor_fob_comprobante')
    .notEmpty()
    .withMessage('El valor FOB del comprobante es requerido')
    .isFloat({ min: 0 })
    .withMessage('El valor FOB del comprobante debe ser un número mayor o igual a 0'),

  body('valor_fob_compensacion')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor FOB de compensación debe ser un número mayor o igual a 0'),

  body('forma_pago')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('La forma de pago debe tener 2 caracteres'),

  body('distrito_exportacion')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El distrito de exportación debe tener 3 caracteres'),

  body('anio_exportacion')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('El año de exportación debe estar entre 1900 y 2100'),

  body('regimen_exportacion')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('El régimen de exportación debe tener 2 caracteres'),

  body('correo_electronico')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .isLength({ max: 100 })
    .withMessage('El correo electrónico no puede exceder 100 caracteres'),

  body('estado')
    .optional()
    .isIn(['BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'])
    .withMessage('El estado debe ser BORRADOR, VALIDADO, INCLUIDO_ATS o ANULADO'),

  body('observaciones')
    .optional()
    .trim()
];

/**
 * Validaciones para actualizar exportación
 */
const validarActualizarExportacion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('periodo')
    .optional()
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA'),

  body('tipo_comprobante')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de comprobante debe tener 2 caracteres'),

  body('fecha_emision')
    .optional()
    .isISO8601()
    .withMessage('Debe proporcionar una fecha válida en formato ISO8601'),

  body('establecimiento')
    .optional()
    .trim()
    .matches(/^[0-9]{3}$/)
    .withMessage('El establecimiento debe tener 3 dígitos numéricos'),

  body('punto_emision')
    .optional()
    .trim()
    .matches(/^[0-9]{3}$/)
    .withMessage('El punto de emisión debe tener 3 dígitos numéricos'),

  body('secuencial')
    .optional()
    .trim()
    .matches(/^[0-9]{1,9}$/)
    .withMessage('El secuencial debe ser numérico de hasta 9 dígitos'),

  body('numero_autorizacion')
    .optional()
    .trim()
    .isLength({ min: 10, max: 49 })
    .withMessage('El número de autorización debe tener entre 10 y 49 caracteres'),

  body('tipo_cliente')
    .optional()
    .isIn(['01', '02'])
    .withMessage('El tipo de cliente debe ser 01 (Persona Natural) o 02 (Sociedad)'),

  body('tipo_identificacion')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de identificación debe tener 2 caracteres'),

  body('identificacion_cliente')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('La identificación debe tener entre 1 y 20 caracteres'),

  body('razon_social_cliente')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('La razón social debe tener entre 1 y 300 caracteres'),

  body('pais_destino')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El código del país debe tener 3 caracteres (ISO 3166)'),

  body('pais_efect_pago')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El código del país de efectivización del pago debe tener 3 caracteres (ISO 3166)'),

  body('tipo_regimen_fiscal')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de régimen fiscal debe tener 2 caracteres'),

  body('pais_regimen_fiscal')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El código del país del régimen fiscal debe tener 3 caracteres (ISO 3166)'),

  body('valor_fob_comprobante')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor FOB del comprobante debe ser un número mayor o igual a 0'),

  body('valor_fob_compensacion')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor FOB de compensación debe ser un número mayor o igual a 0'),

  body('forma_pago')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('La forma de pago debe tener 2 caracteres'),

  body('distrito_exportacion')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El distrito de exportación debe tener 3 caracteres'),

  body('anio_exportacion')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('El año de exportación debe estar entre 1900 y 2100'),

  body('regimen_exportacion')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('El régimen de exportación debe tener 2 caracteres'),

  body('correo_electronico')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .isLength({ max: 100 })
    .withMessage('El correo electrónico no puede exceder 100 caracteres'),

  body('estado')
    .optional()
    .isIn(['BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'])
    .withMessage('El estado debe ser BORRADOR, VALIDADO, INCLUIDO_ATS o ANULADO'),

  body('observaciones')
    .optional()
    .trim()
];

/**
 * Validaciones para consultar exportaciones por periodo
 */
const validarConsultarPorPeriodo = [
  query('periodo')
    .trim()
    .notEmpty()
    .withMessage('El periodo es requerido')
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA')
];

/**
 * Validaciones para buscar por cliente
 */
const validarBuscarPorCliente = [
  query('identificacion_cliente')
    .trim()
    .notEmpty()
    .withMessage('La identificación del cliente es requerida')
    .isLength({ min: 1, max: 20 })
    .withMessage('La identificación debe tener entre 1 y 20 caracteres'),

  query('periodo')
    .optional()
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA')
];

/**
 * Validaciones para obtener por año
 */
const validarObtenerPorAnio = [
  query('anio')
    .notEmpty()
    .withMessage('El año es requerido')
    .isInt({ min: 1900, max: 2100 })
    .withMessage('El año debe estar entre 1900 y 2100')
];

/**
 * Validación de ID
 */
const validarIdExportacion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validaciones para filtros de consulta
 */
const validarFiltros = [
  query('periodo')
    .optional()
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA'),

  query('estado')
    .optional()
    .isIn(['BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'])
    .withMessage('El estado debe ser BORRADOR, VALIDADO, INCLUIDO_ATS o ANULADO'),

  query('tipo_cliente')
    .optional()
    .isIn(['01', '02'])
    .withMessage('El tipo de cliente debe ser 01 o 02'),

  query('pais_destino')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('El código del país debe tener 3 caracteres'),

  query('anio_exportacion')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('El año debe estar entre 1900 y 2100'),

  query('fecha_desde')
    .optional()
    .isISO8601()
    .withMessage('La fecha desde debe ser válida en formato ISO8601'),

  query('fecha_hasta')
    .optional()
    .isISO8601()
    .withMessage('La fecha hasta debe ser válida en formato ISO8601'),

  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
];

module.exports = {
  validarCrearExportacion,
  validarActualizarExportacion,
  validarConsultarPorPeriodo,
  validarBuscarPorCliente,
  validarObtenerPorAnio,
  validarIdExportacion,
  validarFiltros
};
