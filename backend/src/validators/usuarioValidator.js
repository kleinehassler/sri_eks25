const { body, param } = require('express-validator');

/**
 * Validaciones para registro/creación de usuario
 */
const validarCrearUsuario = [
  body('empresa_id')
    .isInt({ min: 1 })
    .withMessage('El ID de empresa debe ser un número entero positivo'),

  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El correo no puede exceder 100 caracteres'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8, max: 50 })
    .withMessage('La contraseña debe tener entre 8 y 50 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('rol')
    .optional()
    .isIn(['ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'])
    .withMessage('El rol debe ser ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA, CONTADOR u OPERADOR'),

  body('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO', 'BLOQUEADO'])
    .withMessage('El estado debe ser ACTIVO, INACTIVO o BLOQUEADO')
];

/**
 * Validaciones para login
 */
const validarLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

/**
 * Validaciones para actualizar usuario
 */
const validarActualizarUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El apellido no puede estar vacío')
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El correo no puede exceder 100 caracteres'),

  body('rol')
    .optional()
    .isIn(['ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'])
    .withMessage('El rol debe ser ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA, CONTADOR u OPERADOR'),

  body('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO', 'BLOQUEADO'])
    .withMessage('El estado debe ser ACTIVO, INACTIVO o BLOQUEADO')
];

/**
 * Validaciones para cambio de contraseña
 */
const validarCambiarPassword = [
  body('password_actual')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('password_nueva')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8, max: 50 })
    .withMessage('La nueva contraseña debe tener entre 8 y 50 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('password_confirmacion')
    .notEmpty()
    .withMessage('La confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.password_nueva) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

/**
 * Validación de ID de usuario
 */
const validarIdUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validaciones para resetear contraseña (por admin)
 */
const validarResetearPassword = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('passwordNueva')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8, max: 50 })
    .withMessage('La nueva contraseña debe tener entre 8 y 50 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

module.exports = {
  validarCrearUsuario,
  validarLogin,
  validarActualizarUsuario,
  validarCambiarPassword,
  validarIdUsuario,
  validarResetearPassword
};
