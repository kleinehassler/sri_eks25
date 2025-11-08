const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const manejarErroresValidacion = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Errores de validación',
      detalles: errors.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg,
        valor: err.value
      }))
    });
  }

  next();
};

// Importar todos los validadores
const empresaValidator = require('./empresaValidator');
const usuarioValidator = require('./usuarioValidator');
const compraValidator = require('./compraValidator');
const retencionValidator = require('./retencionValidator');
const exportacionValidator = require('./exportacionValidator');
const codigoRetencionValidator = require('./codigoRetencionValidator');

module.exports = {
  manejarErroresValidacion,
  empresaValidator,
  usuarioValidator,
  compraValidator,
  retencionValidator,
  exportacionValidator,
  codigoRetencionValidator
};
