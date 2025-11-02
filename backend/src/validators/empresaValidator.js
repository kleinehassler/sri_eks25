const { body, param } = require('express-validator');
const { validarRUCEmpresa } = require('../utils/rucValidator');

/**
 * Validador personalizado para RUC de empresa
 * Solo verifica que tenga 13 dígitos numéricos
 * NOTA: Validación de checksum desactivada
 */
const validarRUCCustom = (value) => {
  // Solo verificar que sea 13 dígitos numéricos
  if (!/^\d{13}$/.test(value)) {
    throw new Error('El RUC debe tener exactamente 13 dígitos numéricos');
  }
  return true;
};

/**
 * Validaciones para crear empresa
 */
const validarCrearEmpresa = [
  body('ruc')
    .trim()
    .notEmpty()
    .withMessage('El RUC es requerido')
    .custom(validarRUCCustom),

  body('razon_social')
    .trim()
    .notEmpty()
    .withMessage('La razón social es requerida')
    .isLength({ min: 3, max: 300 })
    .withMessage('La razón social debe tener entre 3 y 300 caracteres'),

  body('nombre_comercial')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('El nombre comercial no puede exceder 300 caracteres'),

  body('regimen_tributario')
    .optional()
    .isIn(['RISE', 'GENERAL', 'RIMPE'])
    .withMessage('El régimen tributario debe ser RISE, GENERAL o RIMPE'),

  body('contribuyente_especial')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('El número de contribuyente especial no puede exceder 10 caracteres'),

  body('obligado_contabilidad')
    .optional()
    .isBoolean()
    .withMessage('Obligado a llevar contabilidad debe ser verdadero o falso'),

  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('El teléfono debe contener solo números y caracteres válidos')
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede exceder 20 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El correo no puede exceder 100 caracteres'),

  body('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])
    .withMessage('El estado debe ser ACTIVO, INACTIVO o SUSPENDIDO')
];

/**
 * Validaciones para actualizar empresa
 */
const validarActualizarEmpresa = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('ruc')
    .optional()
    .trim()
    .custom(validarRUCCustom),

  body('razon_social')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La razón social no puede estar vacía')
    .isLength({ min: 3, max: 300 })
    .withMessage('La razón social debe tener entre 3 y 300 caracteres'),

  body('nombre_comercial')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('El nombre comercial no puede exceder 300 caracteres'),

  body('regimen_tributario')
    .optional()
    .isIn(['RISE', 'GENERAL', 'RIMPE'])
    .withMessage('El régimen tributario debe ser RISE, GENERAL o RIMPE'),

  body('contribuyente_especial')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('El número de contribuyente especial no puede exceder 10 caracteres'),

  body('obligado_contabilidad')
    .optional()
    .isBoolean()
    .withMessage('Obligado a llevar contabilidad debe ser verdadero o falso'),

  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('El teléfono debe contener solo números y caracteres válidos')
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede exceder 20 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El correo no puede exceder 100 caracteres'),

  body('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])
    .withMessage('El estado debe ser ACTIVO, INACTIVO o SUSPENDIDO')
];

/**
 * Validación de ID de empresa
 */
const validarIdEmpresa = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

module.exports = {
  validarCrearEmpresa,
  validarActualizarEmpresa,
  validarIdEmpresa
};
