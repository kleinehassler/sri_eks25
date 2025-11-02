const exportacionService = require('../services/exportacionService');

/**
 * Controlador de exportaciones
 */
class ExportacionController {
  /**
   * Obtener todas las exportaciones
   */
  async obtenerTodas(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const {
        periodo,
        estado,
        identificacion_cliente,
        pais_destino,
        tipo_cliente,
        anio_exportacion,
        fecha_desde,
        fecha_hasta,
        pagina,
        limite
      } = req.query;

      const filtros = {
        periodo,
        estado,
        identificacion_cliente,
        pais_destino,
        tipo_cliente,
        anio_exportacion,
        fecha_desde,
        fecha_hasta
      };

      const resultado = await exportacionService.obtenerTodas(
        empresaId,
        filtros,
        pagina || 1,
        limite || 20
      );

      res.json({
        mensaje: 'Exportaciones obtenidas exitosamente',
        data: resultado.exportaciones,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener exportación por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const exportacion = await exportacionService.obtenerPorId(id, empresaId);

      res.json({
        mensaje: 'Exportación obtenida exitosamente',
        data: exportacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear exportación
   */
  async crear(req, res, next) {
    try {
      console.log('=== CREAR EXPORTACIÓN ===');
      console.log('Usuario ID:', req.usuario?.id);
      console.log('Empresa ID:', req.empresaId);
      console.log('Body recibido:', JSON.stringify(req.body, null, 2));

      const datos = {
        ...req.body,
        empresa_id: req.empresaId
      };

      console.log('Datos a crear:', JSON.stringify(datos, null, 2));

      const exportacion = await exportacionService.crear(datos, req.usuario.id);

      console.log('Exportación creada exitosamente. ID:', exportacion.id);

      res.status(201).json({
        mensaje: 'Exportación creada exitosamente',
        data: exportacion
      });
    } catch (error) {
      console.error('=== ERROR AL CREAR EXPORTACIÓN ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      next(error);
    }
  }

  /**
   * Actualizar exportación
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      console.log('=== ACTUALIZAR EXPORTACIÓN ===');
      console.log('ID:', id);
      console.log('Empresa ID:', empresaId);
      console.log('Datos a actualizar:', JSON.stringify(req.body, null, 2));

      const exportacion = await exportacionService.actualizar(id, empresaId, req.body);

      res.json({
        mensaje: 'Exportación actualizada exitosamente',
        data: exportacion
      });
    } catch (error) {
      console.error('Error al actualizar exportación:', error);
      next(error);
    }
  }

  /**
   * Eliminar exportación (anular)
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      console.log('=== ELIMINAR EXPORTACIÓN ===');
      console.log('ID:', id);
      console.log('Empresa ID:', empresaId);

      const resultado = await exportacionService.eliminar(id, empresaId);

      res.json(resultado);
    } catch (error) {
      console.error('Error al eliminar exportación:', error);
      next(error);
    }
  }

  /**
   * Validar exportación
   */
  async validar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      console.log('=== VALIDAR EXPORTACIÓN ===');
      console.log('ID:', id);
      console.log('Empresa ID:', empresaId);

      const exportacion = await exportacionService.validar(id, empresaId);

      res.json({
        mensaje: 'Exportación validada exitosamente',
        data: exportacion
      });
    } catch (error) {
      console.error('Error al validar exportación:', error);
      next(error);
    }
  }

  /**
   * Validar múltiples exportaciones en estado BORRADOR
   */
  async validarMasivo(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const {
        periodo,
        identificacion_cliente,
        pais_destino,
        fecha_desde,
        fecha_hasta
      } = req.query;

      const filtros = {
        periodo,
        identificacion_cliente,
        pais_destino,
        fecha_desde,
        fecha_hasta
      };

      console.log('=== VALIDACIÓN MASIVA DE EXPORTACIONES ===');
      console.log('Empresa ID:', empresaId);
      console.log('Filtros:', filtros);

      const resultados = await exportacionService.validarMasivo(empresaId, filtros);

      console.log('Resultados:', resultados);

      res.json({
        mensaje: `Validación masiva completada. ${resultados.validadas} de ${resultados.total} exportaciones validadas exitosamente`,
        data: resultados
      });
    } catch (error) {
      console.error('Error en validación masiva:', error);
      next(error);
    }
  }

  /**
   * Obtener resumen de exportaciones por periodo
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

      console.log('=== OBTENER RESUMEN DE EXPORTACIONES ===');
      console.log('Empresa ID:', empresaId);
      console.log('Periodo:', periodo);

      const resumen = await exportacionService.obtenerResumenPorPeriodo(empresaId, periodo);

      res.json({
        mensaje: 'Resumen de exportaciones obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      next(error);
    }
  }

  /**
   * Buscar exportaciones por cliente
   */
  async buscarPorCliente(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { identificacion_cliente, periodo } = req.query;

      if (!identificacion_cliente) {
        return res.status(400).json({
          error: 'La identificación del cliente es requerida'
        });
      }

      console.log('=== BUSCAR EXPORTACIONES POR CLIENTE ===');
      console.log('Empresa ID:', empresaId);
      console.log('Cliente:', identificacion_cliente);
      console.log('Periodo:', periodo || 'Todos');

      const exportaciones = await exportacionService.buscarPorCliente(
        empresaId,
        identificacion_cliente,
        periodo
      );

      res.json({
        mensaje: 'Exportaciones del cliente obtenidas exitosamente',
        data: exportaciones
      });
    } catch (error) {
      console.error('Error al buscar exportaciones por cliente:', error);
      next(error);
    }
  }

  /**
   * Obtener resumen por país de destino
   */
  async obtenerResumenPorPais(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo } = req.query;

      if (!periodo) {
        return res.status(400).json({
          error: 'El periodo es requerido'
        });
      }

      console.log('=== OBTENER RESUMEN POR PAÍS ===');
      console.log('Empresa ID:', empresaId);
      console.log('Periodo:', periodo);

      const resumen = await exportacionService.obtenerResumenPorPais(empresaId, periodo);

      res.json({
        mensaje: 'Resumen por país obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen por país:', error);
      next(error);
    }
  }

  /**
   * Obtener exportaciones por año
   */
  async obtenerPorAnio(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { anio } = req.query;

      if (!anio) {
        return res.status(400).json({
          error: 'El año es requerido'
        });
      }

      console.log('=== OBTENER EXPORTACIONES POR AÑO ===');
      console.log('Empresa ID:', empresaId);
      console.log('Año:', anio);

      const exportaciones = await exportacionService.obtenerPorAnio(empresaId, parseInt(anio));

      res.json({
        mensaje: 'Exportaciones del año obtenidas exitosamente',
        data: exportaciones
      });
    } catch (error) {
      console.error('Error al obtener exportaciones por año:', error);
      next(error);
    }
  }
}

module.exports = new ExportacionController();
