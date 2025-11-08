const usuarioService = require('../services/usuarioService');

/**
 * Controlador de usuarios
 */
class UsuarioController {
  /**
   * Obtener todos los usuarios
   */
  async obtenerTodos(req, res, next) {
    try {
      const { empresa_id, rol, estado, busqueda, pagina, limite } = req.query;
      const usuarioAutenticado = req.usuario;

      const filtros = {
        rol,
        estado,
        busqueda
      };

      // Solo el ADMINISTRADOR_GENERAL puede ver todos los usuarios
      // Los demás roles solo pueden ver usuarios de su propia empresa
      if (usuarioAutenticado.rol !== 'ADMINISTRADOR_GENERAL') {
        // Forzar filtro por empresa del usuario autenticado
        filtros.empresa_id = usuarioAutenticado.empresa_id;
      } else {
        // ADMINISTRADOR_GENERAL puede filtrar por empresa si lo desea
        if (empresa_id) {
          filtros.empresa_id = empresa_id;
        }
      }

      const resultado = await usuarioService.obtenerTodos(
        filtros,
        pagina || 1,
        limite || 10
      );

      res.json({
        mensaje: 'Usuarios obtenidos exitosamente',
        data: resultado.usuarios,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuario por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.obtenerPorId(id);

      res.json({
        mensaje: 'Usuario obtenido exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuarios por empresa
   */
  async obtenerPorEmpresa(req, res, next) {
    try {
      const { empresaId } = req.params;
      const usuarios = await usuarioService.obtenerPorEmpresa(empresaId);

      res.json({
        mensaje: 'Usuarios obtenidos exitosamente',
        data: usuarios
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear usuario
   */
  async crear(req, res, next) {
    try {
      const usuario = await usuarioService.crear(req.body);

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar usuario
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.actualizar(id, req.body);

      res.json({
        mensaje: 'Usuario actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar usuario
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await usuarioService.eliminar(id);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar estado de usuario
   */
  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const usuario = await usuarioService.cambiarEstado(id, estado);

      res.json({
        mensaje: 'Estado de usuario actualizado',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar contraseña de usuario
   */
  async cambiarPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNueva } = req.body;

      const resultado = await usuarioService.cambiarPassword(id, passwordActual, passwordNueva);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resetear contraseña de usuario (por admin)
   */
  async resetearPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { passwordNueva } = req.body;

      const resultado = await usuarioService.resetearPassword(id, passwordNueva);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuarioController();
