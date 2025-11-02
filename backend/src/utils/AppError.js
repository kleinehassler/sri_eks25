/**
 * Clase de error personalizada para la aplicación
 * Extiende Error nativo de JavaScript para incluir código de estado HTTP
 */
class AppError extends Error {
  /**
   * Constructor de AppError
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP (400, 404, 500, etc.)
   * @param {boolean} isOperational - Indica si es un error operacional (true) o de programación (false)
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    // Captura el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
