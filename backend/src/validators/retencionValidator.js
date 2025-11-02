const { body, param, query } = require('express-validator');

/**
 * Validaciones para crear retención
 */
const validarCrearRetencion = [
  body('periodo')
    .trim()
    .notEmpty()
    .withMessage('El periodo es requerido')
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA'),

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

  body('fecha_emision')
    .notEmpty()
    .withMessage('La fecha de emisión es requerida')
    .isISO8601()
    .withMessage('Debe proporcionar una fecha válida en formato ISO8601'),

  body('tipo_identificacion')
    .trim()
    .notEmpty()
    .withMessage('El tipo de identificación es requerido')
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de identificación debe tener 2 caracteres'),

  body('identificacion_proveedor')
    .trim()
    .notEmpty()
    .withMessage('La identificación del proveedor es requerida')
    .isLength({ min: 10, max: 20 })
    .withMessage('La identificación debe tener entre 10 y 20 caracteres'),

  body('razon_social_proveedor')
    .trim()
    .notEmpty()
    .withMessage('La razón social del proveedor es requerida')
    .isLength({ min: 1, max: 300 })
    .withMessage('La razón social debe tener entre 1 y 300 caracteres'),

  body('tipo_impuesto')
    .notEmpty()
    .withMessage('El tipo de impuesto es requerido')
    .isIn(['IVA', 'RENTA'])
    .withMessage('El tipo de impuesto debe ser IVA o RENTA'),

  body('codigo_retencion')
    .trim()
    .notEmpty()
    .withMessage('El código de retención es requerido')
    .isLength({ min: 1, max: 5 })
    .withMessage('El código de retención debe tener entre 1 y 5 caracteres'),

  body('base_imponible')
    .notEmpty()
    .withMessage('La base imponible es requerida')
    .isFloat({ min: 0 })
    .withMessage('La base imponible debe ser un número mayor o igual a 0'),

  body('porcentaje_retencion')
    .notEmpty()
    .withMessage('El porcentaje de retención es requerido')
    .isFloat({ min: 0, max: 100 })
    .withMessage('El porcentaje de retención debe estar entre 0 y 100'),

  body('valor_retenido')
    .notEmpty()
    .withMessage('El valor retenido es requerido')
    .isFloat({ min: 0 })
    .withMessage('El valor retenido debe ser un número mayor o igual a 0'),

  body('compra_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la compra debe ser un número entero positivo'),

  body('numero_comprobante_sustento')
    .optional()
    .trim()
    .isLength({ max: 17 })
    .withMessage('El número de comprobante de sustento no puede exceder 17 caracteres'),

  body('fecha_emision_comprobante_sustento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de emisión del comprobante de sustento debe ser válida en formato ISO8601'),

  body('estado')
    .optional()
    .isIn(['BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'])
    .withMessage('El estado debe ser BORRADOR, VALIDADO, INCLUIDO_ATS o ANULADO'),

  body('observaciones')
    .optional()
    .trim()
];

/**
 * Validaciones para actualizar retención
 */
const validarActualizarRetencion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('periodo')
    .optional()
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA'),

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

  body('fecha_emision')
    .optional()
    .isISO8601()
    .withMessage('Debe proporcionar una fecha válida en formato ISO8601'),

  body('tipo_identificacion')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de identificación debe tener 2 caracteres'),

  body('identificacion_proveedor')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('La identificación debe tener entre 10 y 20 caracteres'),

  body('razon_social_proveedor')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('La razón social debe tener entre 1 y 300 caracteres'),

  body('tipo_impuesto')
    .optional()
    .isIn(['IVA', 'RENTA'])
    .withMessage('El tipo de impuesto debe ser IVA o RENTA'),

  body('codigo_retencion')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('El código de retención debe tener entre 1 y 5 caracteres'),

  body('base_imponible')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La base imponible debe ser un número mayor o igual a 0'),

  body('porcentaje_retencion')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El porcentaje de retención debe estar entre 0 y 100'),

  body('valor_retenido')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor retenido debe ser un número mayor o igual a 0'),

  body('compra_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la compra debe ser un número entero positivo'),

  body('numero_comprobante_sustento')
    .optional()
    .trim()
    .isLength({ max: 17 })
    .withMessage('El número de comprobante de sustento no puede exceder 17 caracteres'),

  body('fecha_emision_comprobante_sustento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de emisión del comprobante de sustento debe ser válida en formato ISO8601'),

  body('estado')
    .optional()
    .isIn(['BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'])
    .withMessage('El estado debe ser BORRADOR, VALIDADO, INCLUIDO_ATS o ANULADO'),

  body('observaciones')
    .optional()
    .trim()
];

/**
 * Validaciones para consultar retenciones por periodo
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
 * Validaciones para buscar por proveedor
 */
const validarBuscarPorProveedor = [
  query('identificacion_proveedor')
    .trim()
    .notEmpty()
    .withMessage('La identificación del proveedor es requerida')
    .isLength({ min: 10, max: 20 })
    .withMessage('La identificación debe tener entre 10 y 20 caracteres'),

  query('periodo')
    .optional()
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA')
];

/**
 * Validación de ID
 */
const validarIdRetencion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación de ID de compra
 */
const validarIdCompra = [
  param('compraId')
    .isInt({ min: 1 })
    .withMessage('El ID de la compra debe ser un número entero positivo')
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

  query('tipo_impuesto')
    .optional()
    .isIn(['IVA', 'RENTA'])
    .withMessage('El tipo de impuesto debe ser IVA o RENTA'),

  query('compra_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la compra debe ser un número entero positivo'),

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
  validarCrearRetencion,
  validarActualizarRetencion,
  validarConsultarPorPeriodo,
  validarBuscarPorProveedor,
  validarIdRetencion,
  validarIdCompra,
  validarFiltros
};
