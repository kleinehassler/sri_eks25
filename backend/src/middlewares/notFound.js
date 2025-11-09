/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
    metodo: req.method,
    timestamp: new Date().toISOString()
  });
};

module.exports = notFound;
