const retencionService = require('../services/retencionService');

/**
 * Controlador de retenciones
 */
class RetencionController {
  /**
   * Obtener todas las retenciones
   */
  async obtenerTodas(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const {
        periodo,
        estado,
        identificacion_proveedor,
        tipo_impuesto,
        compra_id,
        fecha_desde,
        fecha_hasta,
        pagina,
        limite
      } = req.query;

      const filtros = {
        periodo,
        estado,
        identificacion_proveedor,
        tipo_impuesto,
        compra_id,
        fecha_desde,
        fecha_hasta
      };

      const resultado = await retencionService.obtenerTodas(
        empresaId,
        filtros,
        pagina || 1,
        limite || 20
      );

      res.json({
        mensaje: 'Retenciones obtenidas exitosamente',
        data: resultado.retenciones,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener retención por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const retencion = await retencionService.obtenerPorId(id, empresaId);

      res.json({
        mensaje: 'Retención obtenida exitosamente',
        data: retencion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear retención
   */
  async crear(req, res, next) {
    try {
      console.log('=== CREAR RETENCIÓN ===');
      console.log('Usuario ID:', req.usuario?.id);
      console.log('Empresa ID:', req.empresaId);
      console.log('Body recibido:', JSON.stringify(req.body, null, 2));

      const datos = {
        ...req.body,
        empresa_id: req.empresaId
      };

      console.log('Datos a crear:', JSON.stringify(datos, null, 2));

      const retencion = await retencionService.crear(datos, req.usuario.id);

      console.log('Retención creada exitosamente. ID:', retencion.id);

      res.status(201).json({
        mensaje: 'Retención creada exitosamente',
        data: retencion
      });
    } catch (error) {
      console.error('=== ERROR AL CREAR RETENCIÓN ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      next(error);
    }
  }

  /**
   * Actualizar retención
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      console.log('=== ACTUALIZAR RETENCIÓN ===');
      console.log('ID:', id);
      console.log('Empresa ID:', empresaId);
      console.log('Datos a actualizar:', JSON.stringify(req.body, null, 2));

      const retencion = await retencionService.actualizar(id, empresaId, req.body);

      res.json({
        mensaje: 'Retención actualizada exitosamente',
        data: retencion
      });
    } catch (error) {
      console.error('Error al actualizar retención:', error);
      next(error);
    }
  }

  /**
   * Eliminar retención (anular)
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      console.log('=== ELIMINAR RETENCIÓN ===');
      console.log('ID:', id);
      console.log('Empresa ID:', empresaId);

      const resultado = await retencionService.eliminar(id, empresaId);

      res.json(resultado);
    } catch (error) {
      console.error('Error al eliminar retención:', error);
      next(error);
    }
  }

  /**
   * Validar retención
   */
  async validar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      console.log('=== VALIDAR RETENCIÓN ===');
      console.log('ID:', id);
      console.log('Empresa ID:', empresaId);

      const retencion = await retencionService.validar(id, empresaId);

      res.json({
        mensaje: 'Retención validada exitosamente',
        data: retencion
      });
    } catch (error) {
      console.error('Error al validar retención:', error);
      next(error);
    }
  }

  /**
   * Validar múltiples retenciones en estado BORRADOR
   */
  async validarMasivo(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const {
        periodo,
        identificacion_proveedor,
        tipo_impuesto,
        fecha_desde,
        fecha_hasta
      } = req.query;

      const filtros = {
        periodo,
        identificacion_proveedor,
        tipo_impuesto,
        fecha_desde,
        fecha_hasta
      };

      console.log('=== VALIDACIÓN MASIVA DE RETENCIONES ===');
      console.log('Empresa ID:', empresaId);
      console.log('Filtros:', filtros);

      const resultados = await retencionService.validarMasivo(empresaId, filtros);

      console.log('Resultados:', resultados);

      res.json({
        mensaje: `Validación masiva completada. ${resultados.validadas} de ${resultados.total} retenciones validadas exitosamente`,
        data: resultados
      });
    } catch (error) {
      console.error('Error en validación masiva:', error);
      next(error);
    }
  }

  /**
   * Obtener retenciones por compra
   */
  async obtenerPorCompra(req, res, next) {
    try {
      const { compraId } = req.params;
      const empresaId = req.empresaId;

      console.log('=== OBTENER RETENCIONES POR COMPRA ===');
      console.log('Compra ID:', compraId);
      console.log('Empresa ID:', empresaId);

      const retenciones = await retencionService.obtenerPorCompra(compraId, empresaId);

      res.json({
        mensaje: 'Retenciones de la compra obtenidas exitosamente',
        data: retenciones
      });
    } catch (error) {
      console.error('Error al obtener retenciones por compra:', error);
      next(error);
    }
  }

  /**
   * Obtener resumen de retenciones por periodo
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

      console.log('=== OBTENER RESUMEN DE RETENCIONES ===');
      console.log('Empresa ID:', empresaId);
      console.log('Periodo:', periodo);

      const resumen = await retencionService.obtenerResumenPorPeriodo(empresaId, periodo);

      res.json({
        mensaje: 'Resumen de retenciones obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      next(error);
    }
  }

  /**
   * Buscar retenciones por proveedor
   */
  async buscarPorProveedor(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { identificacion_proveedor, periodo } = req.query;

      if (!identificacion_proveedor) {
        return res.status(400).json({
          error: 'La identificación del proveedor es requerida'
        });
      }

      console.log('=== BUSCAR RETENCIONES POR PROVEEDOR ===');
      console.log('Empresa ID:', empresaId);
      console.log('Proveedor:', identificacion_proveedor);
      console.log('Periodo:', periodo || 'Todos');

      const retenciones = await retencionService.buscarPorProveedor(
        empresaId,
        identificacion_proveedor,
        periodo
      );

      res.json({
        mensaje: 'Retenciones del proveedor obtenidas exitosamente',
        data: retenciones
      });
    } catch (error) {
      console.error('Error al buscar retenciones por proveedor:', error);
      next(error);
    }
  }
}

module.exports = new RetencionController();
