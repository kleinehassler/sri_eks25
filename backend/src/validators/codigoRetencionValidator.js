const { body, param } = require('express-validator');

/**
 * Validaciones para crear código de retención
 */
const validarCrearCodigoRetencion = [
  body('codigo')
    .trim()
    .notEmpty()
    .withMessage('El código es requerido')
    .isLength({ max: 10 })
    .withMessage('El código no puede exceder 10 caracteres'),

  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3 })
    .withMessage('La descripción debe tener al menos 3 caracteres'),

  body('porcentaje')
    .trim()
    .notEmpty()
    .withMessage('El porcentaje es requerido')
    .isLength({ max: 50 })
    .withMessage('El porcentaje no puede exceder 50 caracteres'),

  body('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO'])
    .withMessage('El estado debe ser ACTIVO o INACTIVO')
];

/**
 * Validaciones para actualizar código de retención
 */
const validarActualizarCodigoRetencion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('codigo')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El código no puede estar vacío')
    .isLength({ max: 10 })
    .withMessage('El código no puede exceder 10 caracteres'),

  body('descripcion')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
    .isLength({ min: 3 })
    .withMessage('La descripción debe tener al menos 3 caracteres'),

  body('porcentaje')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El porcentaje no puede estar vacío')
    .isLength({ max: 50 })
    .withMessage('El porcentaje no puede exceder 50 caracteres'),

  body('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO'])
    .withMessage('El estado debe ser ACTIVO o INACTIVO')
];

/**
 * Validación de ID de código de retención
 */
const validarIdCodigoRetencion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para cambiar estado
 */
const validarCambiarEstado = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('estado')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['ACTIVO', 'INACTIVO'])
    .withMessage('El estado debe ser ACTIVO o INACTIVO')
];

module.exports = {
  validarCrearCodigoRetencion,
  validarActualizarCodigoRetencion,
  validarIdCodigoRetencion,
  validarCambiarEstado
};
