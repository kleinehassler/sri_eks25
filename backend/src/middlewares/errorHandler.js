const { ValidationError } = require('sequelize');

/**
 * Middleware de manejo de errores centralizado
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err);

  // Error de validación de Sequelize
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: err.errors.map(e => ({
        campo: e.path,
        mensaje: e.message,
        valor: e.value
      }))
    });
  }

  // Error de validación personalizado (express-validator)
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      error: 'Errores de validación',
      detalles: err.array()
    });
  }

  // Errores personalizados con código de estado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      detalles: err.detalles || undefined
    });
  }

  // Error de base de datos
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      error: 'Error de base de datos',
      mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Error al procesar la solicitud'
    });
  }

  // Error de restricción de clave foránea
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'No se puede completar la operación debido a restricciones de datos relacionados'
    });
  }

  // Error de registro duplicado
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'El registro ya existe',
      detalles: err.errors.map(e => ({
        campo: e.path,
        mensaje: 'Este valor ya está en uso'
      }))
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado'
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl
  });
};

/**
 * Clase de error personalizado
 */
class AppError extends Error {
  constructor(message, statusCode = 500, detalles = null) {
    super(message);
    this.statusCode = statusCode;
    this.detalles = detalles;
    this.name = 'AppError';
  }
}

module.exports = {
  errorHandler,
  notFound,
  AppError
};
