const empresaService = require('../services/empresaService');

/**
 * Controlador de empresas
 */
class EmpresaController {
  /**
   * Obtener todas las empresas
   */
  async obtenerTodas(req, res, next) {
    try {
      const { estado, regimen_tributario, busqueda, pagina, limite } = req.query;

      const filtros = {
        estado,
        regimen_tributario,
        busqueda
      };

      const resultado = await empresaService.obtenerTodas(
        filtros,
        pagina || 1,
        limite || 10,
        req.usuario  // Pasar usuario autenticado para filtrar según rol
      );

      res.json({
        mensaje: 'Empresas obtenidas exitosamente',
        data: resultado.empresas,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener empresa por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const empresa = await empresaService.obtenerPorId(id);

      res.json({
        mensaje: 'Empresa obtenida exitosamente',
        data: empresa
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear empresa
   */
  async crear(req, res, next) {
    try {
      const empresa = await empresaService.crear(req.body);

      res.status(201).json({
        mensaje: 'Empresa creada exitosamente',
        data: empresa
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar empresa
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const empresa = await empresaService.actualizar(id, req.body);

      res.json({
        mensaje: 'Empresa actualizada exitosamente',
        data: empresa
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar empresa
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await empresaService.eliminar(id);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar estado de empresa
   */
  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const empresa = await empresaService.cambiarEstado(id, estado);

      res.json({
        mensaje: 'Estado de empresa actualizado',
        data: empresa
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmpresaController();
