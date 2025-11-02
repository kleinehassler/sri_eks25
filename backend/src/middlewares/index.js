const { authenticate, authorize, verifyEmpresaAccess } = require('./auth');
const { errorHandler, notFound, AppError } = require('./errorHandler');
const { logActivity, logChanges, httpLogger } = require('./logger');
const { authLimiter, apiLimiter, writeLimiter } = require('./rateLimiter');

module.exports = {
  // Autenticación y autorización
  authenticate,
  authorize,
  verifyEmpresaAccess,

  // Manejo de errores
  errorHandler,
  notFound,
  AppError,

  // Logging
  logActivity,
  logChanges,
  httpLogger,

  // Rate limiting
  authLimiter,
  apiLimiter,
  writeLimiter
};
