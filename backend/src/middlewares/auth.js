const { verifyToken } = require('../utils/jwt');
const { Usuario, Empresa } = require('../models');

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y carga los datos del usuario
 */
const authenticate = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'No se proporcionó token de autenticación'
      });
    }

    // El formato esperado es: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verificar token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        error: error.message
      });
    }

    // Buscar usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{
        model: Empresa,
        as: 'empresa'
      }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({
        error: 'Usuario inactivo o bloqueado'
      });
    }

    // Adjuntar usuario a la request
    req.usuario = usuario;
    req.empresaId = usuario.empresa_id;
    req.rol = usuario.rol;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      error: 'Error interno en autenticación'
    });
  }
};

/**
 * Middleware de autorización por rol
 * @param {...string} rolesPermitidos - Roles que tienen acceso
 */
const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.rol)) {
      return res.status(403).json({
        error: 'No tiene permisos para realizar esta acción',
        rol_requerido: rolesPermitidos,
        rol_actual: req.rol
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario pertenece a la empresa especificada
 */
const verifyEmpresaAccess = (req, res, next) => {
  const empresaIdParam = parseInt(req.params.empresaId || req.body.empresa_id);

  if (!empresaIdParam) {
    return next();
  }

  // Administrador general tiene acceso a todas las empresas
  if (req.rol === 'ADMINISTRADOR_GENERAL') {
    return next();
  }

  // Otros usuarios solo pueden acceder a su propia empresa
  if (req.empresaId !== empresaIdParam) {
    return res.status(403).json({
      error: 'No tiene acceso a los datos de esta empresa'
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  verifyEmpresaAccess
};
