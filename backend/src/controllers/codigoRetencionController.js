const codigoRetencionService = require('../services/codigoRetencionService');

/**
 * Controlador de códigos de retención
 */
class CodigoRetencionController {
  /**
   * Obtener todos los códigos de retención
   */
  async obtenerTodos(req, res, next) {
    try {
      const { estado, busqueda, pagina, limite } = req.query;

      const filtros = {
        estado,
        busqueda
      };

      const resultado = await codigoRetencionService.obtenerTodos(
        filtros,
        pagina || 1,
        limite || 20
      );

      res.json({
        mensaje: 'Códigos de retención obtenidos exitosamente',
        data: resultado.codigos,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener código de retención por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const codigo = await codigoRetencionService.obtenerPorId(id);

      res.json({
        mensaje: 'Código de retención obtenido exitosamente',
        data: codigo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener códigos activos (sin paginación)
   */
  async obtenerActivos(req, res, next) {
    try {
      const codigos = await codigoRetencionService.obtenerActivos();

      res.json({
        mensaje: 'Códigos de retención activos obtenidos exitosamente',
        data: codigos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear código de retención
   */
  async crear(req, res, next) {
    try {
      const codigo = await codigoRetencionService.crear(req.body);

      res.status(201).json({
        mensaje: 'Código de retención creado exitosamente',
        data: codigo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar código de retención
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const codigo = await codigoRetencionService.actualizar(id, req.body);

      res.json({
        mensaje: 'Código de retención actualizado exitosamente',
        data: codigo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar código de retención
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await codigoRetencionService.eliminar(id);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar estado del código de retención
   */
  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const codigo = await codigoRetencionService.cambiarEstado(id, estado);

      res.json({
        mensaje: 'Estado del código de retención actualizado',
        data: codigo
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CodigoRetencionController();
