const ventaService = require('../services/ventaService');

/**
 * Controlador de ventas
 */
class VentaController {
  /**
   * Obtener todas las ventas
   */
  async obtenerTodas(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, estado, identificacion_cliente, fecha_desde, fecha_hasta, pagina, limite } = req.query;

      const filtros = {
        periodo,
        estado,
        identificacion_cliente,
        fecha_desde,
        fecha_hasta
      };

      const resultado = await ventaService.obtenerTodas(
        empresaId,
        filtros,
        pagina || 1,
        limite || 20
      );

      res.json({
        mensaje: 'Ventas obtenidas exitosamente',
        data: resultado.ventas,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener venta por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const venta = await ventaService.obtenerPorId(id, empresaId);

      res.json({
        mensaje: 'Venta obtenida exitosamente',
        data: venta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear venta
   */
  async crear(req, res, next) {
    try {
      console.log('=== CREAR VENTA ===');
      console.log('Usuario ID:', req.usuario?.id);
      console.log('Empresa ID:', req.empresaId);
      console.log('Body recibido:', JSON.stringify(req.body, null, 2));

      const datos = {
        ...req.body,
        empresa_id: req.empresaId
      };

      console.log('Datos a crear:', JSON.stringify(datos, null, 2));

      const venta = await ventaService.crear(datos, req.usuario.id);

      console.log('Venta creada exitosamente. ID:', venta.id);

      res.status(201).json({
        mensaje: 'Venta creada exitosamente',
        data: venta
      });
    } catch (error) {
      console.error('=== ERROR AL CREAR VENTA ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      next(error);
    }
  }

  /**
   * Actualizar venta
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const venta = await ventaService.actualizar(id, empresaId, req.body);

      res.json({
        mensaje: 'Venta actualizada exitosamente',
        data: venta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar venta
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const resultado = await ventaService.eliminar(id, empresaId);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validar venta
   */
  async validar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const venta = await ventaService.validar(id, empresaId);

      res.json({
        mensaje: 'Venta validada exitosamente',
        data: venta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Anular venta
   */
  async anular(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const venta = await ventaService.anular(id, empresaId);

      res.json({
        mensaje: 'Venta anulada exitosamente',
        data: venta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener resumen de ventas por periodo
   */
  async obtenerResumen(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo } = req.query;

      if (!periodo) {
        return res.status(400).json({
          error: 'El periodo es requerido'
        });
      }

      const resumen = await ventaService.obtenerResumenPorPeriodo(empresaId, periodo);

      res.json({
        mensaje: 'Resumen de ventas obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar permanentemente todas las ventas en estado ANULADO
   */
  async eliminarAnulados(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, identificacion_cliente, fecha_desde, fecha_hasta } = req.query;

      const filtros = {
        periodo,
        identificacion_cliente,
        fecha_desde,
        fecha_hasta
      };

      console.log('=== ELIMINAR VENTAS ANULADAS ===');
      console.log('Empresa ID:', empresaId);
      console.log('Filtros:', filtros);

      const resultado = await ventaService.eliminarAnulados(empresaId, filtros);

      console.log('Resultado:', resultado);

      res.json(resultado);
    } catch (error) {
      console.error('Error al eliminar ventas anuladas:', error);
      next(error);
    }
  }
}

module.exports = new VentaController();
