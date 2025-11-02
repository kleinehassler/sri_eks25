const { LogActividad } = require('../models');

/**
 * Middleware para logging de actividad del usuario
 */
const logActivity = (accion, modulo) => {
  return async (req, res, next) => {
    // Almacenar función original de res.json
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para capturar respuesta exitosa
    res.json = function (data) {
      // Solo logear si la respuesta fue exitosa (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Ejecutar logging de forma asíncrona sin bloquear la respuesta
        setImmediate(async () => {
          try {
            await LogActividad.create({
              empresa_id: req.empresaId || null,
              usuario_id: req.usuario ? req.usuario.id : null,
              accion,
              modulo,
              entidad: req.params.id ? req.baseUrl.split('/').pop() : null,
              entidad_id: req.params.id || null,
              descripcion: `${accion} en ${modulo}`,
              ip_address: req.ip || req.connection.remoteAddress,
              user_agent: req.get('user-agent')
            });
          } catch (error) {
            console.error('Error al registrar actividad:', error);
          }
        });
      }

      // Llamar a la función original
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware para logging de cambios en entidades
 * Útil para auditoría de modificaciones
 */
const logChanges = (modulo, entidad) => {
  return async (req, res, next) => {
    // Guardar datos originales si es una actualización
    if (req.method === 'PUT' || req.method === 'PATCH') {
      req.datosOriginales = { ...req.body };
    }

    // Sobrescribir res.json
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            const logData = {
              empresa_id: req.empresaId || null,
              usuario_id: req.usuario ? req.usuario.id : null,
              accion: req.method,
              modulo,
              entidad,
              entidad_id: req.params.id || (data && data.id) || null,
              ip_address: req.ip || req.connection.remoteAddress,
              user_agent: req.get('user-agent')
            };

            // Agregar datos antes/después para actualizaciones
            if (req.method === 'PUT' || req.method === 'PATCH') {
              logData.datos_antes = JSON.stringify(req.datosOriginales);
              logData.datos_despues = JSON.stringify(data);
              logData.descripcion = `Actualización de ${entidad} ID: ${req.params.id}`;
            } else if (req.method === 'POST') {
              logData.datos_despues = JSON.stringify(data);
              logData.descripcion = `Creación de ${entidad}`;
            } else if (req.method === 'DELETE') {
              logData.descripcion = `Eliminación de ${entidad} ID: ${req.params.id}`;
            }

            await LogActividad.create(logData);
          } catch (error) {
            console.error('Error al registrar cambios:', error);
          }
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware simple de logging HTTP
 */
const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = {
  logActivity,
  logChanges,
  httpLogger
};
