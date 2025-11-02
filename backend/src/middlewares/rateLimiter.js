const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para endpoints de autenticación
 * Previene ataques de fuerza bruta
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    error: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar requests exitosos
});

/**
 * Rate limiter general para API
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: {
    error: 'Demasiadas solicitudes. Por favor, intente nuevamente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para operaciones de escritura (POST, PUT, DELETE)
 */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Demasiadas operaciones de escritura. Por favor, reduzca la frecuencia de solicitudes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD'
});

module.exports = {
  authLimiter,
  apiLimiter,
  writeLimiter
};
