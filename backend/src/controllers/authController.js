const authService = require('../services/authService');
const { verifyToken } = require('../utils/jwt');

/**
 * Controlador de autenticación
 */
class AuthController {
  /**
   * Login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const resultado = await authService.login(email, password);

      res.json({
        mensaje: 'Login exitoso',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registro de usuario
   */
  async registrar(req, res, next) {
    try {
      const usuario = await authService.registrar(req.body);

      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar contraseña
   */
  async cambiarPassword(req, res, next) {
    try {
      const { password_actual, password_nueva } = req.body;
      const usuarioId = req.usuario.id;

      const resultado = await authService.cambiarPassword(
        usuarioId,
        password_actual,
        password_nueva
      );

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Se requiere un refresh token'
        });
      }

      const decoded = verifyToken(refreshToken);
      const resultado = await authService.refreshToken(decoded);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async perfil(req, res, next) {
    try {
      res.json({
        data: req.usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   */
  async logout(req, res, next) {
    try {
      // En una implementación real, aquí se invalidaría el token
      // (por ejemplo, agregándolo a una lista negra en Redis)
      res.json({
        mensaje: 'Logout exitoso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
