const { body, param, query } = require('express-validator');

/**
 * Validaciones para crear compra
 */
const validarCrearCompra = [
  body('periodo')
    .trim()
    .notEmpty()
    .withMessage('El periodo es requerido')
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage('El periodo debe tener formato MM/AAAA'),

  body('codigo_sustento')
    .trim()
    .notEmpty()
    .withMessage('El código de sustento es requerido')
    .isLength({ min: 2, max: 2 })
    .withMessage('El código de sustento debe tener 2 caracteres'),

  body('tipo_comprobante')
    .trim()
    .notEmpty()
    .withMessage('El tipo de comprobante es requerido')
    .isLength({ min: 2, max: 2 })
    .withMessage('El tipo de comprobante debe tener 2 caracteres'),

  body('tipo_proveedor')
    .isIn(['01', '02', '03'])
    .withMessage('El tipo de proveedor debe ser 01 (Persona Natural), 02 (Sociedad) o 03 (Extranjero)'),

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

  body('fecha_emision')
    .notEmpty()
    .withMessage('La fecha de emisión es requerida')
    .isISO8601()
    .withMessage('Debe proporcionar una fecha válida en formato ISO8601'),

  body('fecha_registro')
    .notEmpty()
    .withMessage('La fecha de registro es requerida')
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

  body('base_imponible_0')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La base imponible 0% debe ser un número mayor o igual a 0'),

  body('base_imponible_iva')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La base imponible IVA debe ser un número mayor o igual a 0'),

  body('base_imponible_no_objeto_iva')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La base imponible no objeto IVA debe ser un número mayor o igual a 0'),

  body('base_imponible_exento_iva')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La base imponible exento IVA debe ser un número mayor o igual a 0'),

  body('monto_iva')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto IVA debe ser un número mayor o igual a 0'),

  body('monto_ice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto ICE debe ser un número mayor o igual a 0'),

  body('valor_retencion_iva')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor de retención IVA debe ser un número mayor o igual a 0'),

  body('valor_retencion_renta')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor de retención renta debe ser un número mayor o igual a 0'),

  body('total_compra')
    .notEmpty()
    .withMessage('El total de compra es requerido')
    .isFloat({ min: 0 })
    .withMessage('El total de compra debe ser un número mayor o igual a 0'),

  body('forma_pago')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('La forma de pago debe tener 2 caracteres'),

  body('estado')
    .optional()
    .isIn(['BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'])
    .withMessage('El estado debe ser BORRADOR, VALIDADO, INCLUIDO_ATS o ANULADO'),

  // Validaciones para retenciones (array opcional)
  body('retenciones')
    .optional()
    .isArray()
    .withMessage('Las retenciones deben ser un array'),

  body('retenciones.*.fecha_emision')
    .optional()
    .isISO8601()
    .withMessage('La fecha de emisión de la retención debe ser válida en formato ISO8601'),

  body('retenciones.*.establecimiento')
    .optional()
    .trim()
    .matches(/^[0-9]{3}$/)
    .withMessage('El establecimiento de retención debe tener 3 dígitos numéricos'),

  body('retenciones.*.punto_emision')
    .optional()
    .trim()
    .matches(/^[0-9]{3}$/)
    .withMessage('El punto de emisión de retención debe tener 3 dígitos numéricos'),

  body('retenciones.*.secuencial')
    .optional()
    .trim()
    .matches(/^[0-9]{1,9}$/)
    .withMessage('El secuencial de retención debe ser numérico de hasta 9 dígitos'),

  body('retenciones.*.numero_autorizacion')
    .optional()
    .trim()
    .isLength({ min: 10, max: 49 })
    .withMessage('El número de autorización de retención debe tener entre 10 y 49 caracteres'),

  body('retenciones.*.tipo_impuesto')
    .optional()
    .isIn(['IVA', 'RENTA'])
    .withMessage('El tipo de impuesto debe ser IVA o RENTA'),

  body('retenciones.*.codigo_retencion')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El código de retención es requerido')
    .isLength({ min: 1, max: 5 })
    .withMessage('El código de retención debe tener entre 1 y 5 caracteres'),

  body('retenciones.*.base_imponible')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La base imponible de retención debe ser un número mayor o igual a 0'),

  body('retenciones.*.porcentaje_retencion')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El porcentaje de retención debe estar entre 0 y 100'),

  body('retenciones.*.valor_retenido')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor retenido debe ser un número mayor o igual a 0'),

  body('retenciones.*.observaciones')
    .optional()
    .trim()
];

/**
 * Validaciones para actualizar compra
 */
const validarActualizarCompra = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  ...validarCrearCompra.map(validator => validator.optional())
];

/**
 * Validaciones para consultar compras por periodo
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
 * Validación de ID
 */
const validarIdCompra = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

module.exports = {
  validarCrearCompra,
  validarActualizarCompra,
  validarConsultarPorPeriodo,
  validarIdCompra
};
