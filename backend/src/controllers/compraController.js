const compraService = require('../services/compraService');
const xmlParserService = require('../services/xmlParserService');

/**
 * Controlador de compras
 */
class CompraController {
  /**
   * Obtener todas las compras
   */
  async obtenerTodas(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, estado, identificacion_proveedor, fecha_desde, fecha_hasta, pagina, limite } = req.query;

      const filtros = {
        periodo,
        estado,
        identificacion_proveedor,
        fecha_desde,
        fecha_hasta
      };

      const resultado = await compraService.obtenerTodas(
        empresaId,
        filtros,
        pagina || 1,
        limite || 20
      );

      res.json({
        mensaje: 'Compras obtenidas exitosamente',
        data: resultado.compras,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener compra por ID
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const compra = await compraService.obtenerPorId(id, empresaId);

      res.json({
        mensaje: 'Compra obtenida exitosamente',
        data: compra
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear compra
   */
  async crear(req, res, next) {
    try {
      console.log('=== CREAR COMPRA ===');
      console.log('Usuario ID:', req.usuario?.id);
      console.log('Empresa ID:', req.empresaId);
      console.log('Body recibido:', JSON.stringify(req.body, null, 2));

      const datos = {
        ...req.body,
        empresa_id: req.empresaId
      };

      console.log('Datos a crear:', JSON.stringify(datos, null, 2));

      const compra = await compraService.crear(datos, req.usuario.id);

      console.log('Compra creada exitosamente. ID:', compra.id);

      res.status(201).json({
        mensaje: 'Compra creada exitosamente',
        data: compra
      });
    } catch (error) {
      console.error('=== ERROR AL CREAR COMPRA ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      next(error);
    }
  }

  /**
   * Actualizar compra
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const compra = await compraService.actualizar(id, empresaId, req.body);

      res.json({
        mensaje: 'Compra actualizada exitosamente',
        data: compra
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar compra
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const resultado = await compraService.eliminar(id, empresaId);

      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validar compra
   */
  async validar(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const compra = await compraService.validar(id, empresaId);

      res.json({
        mensaje: 'Compra validada exitosamente',
        data: compra
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validar múltiples compras en estado BORRADOR
   */
  async validarMasivo(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, identificacion_proveedor, fecha_desde, fecha_hasta } = req.query;

      const filtros = {
        periodo,
        identificacion_proveedor,
        fecha_desde,
        fecha_hasta
      };

      console.log('=== VALIDACIÓN MASIVA DE COMPRAS ===');
      console.log('Empresa ID:', empresaId);
      console.log('Filtros:', filtros);

      const resultados = await compraService.validarMasivo(empresaId, filtros);

      console.log('Resultados:', resultados);

      res.json({
        mensaje: `Validación masiva completada. ${resultados.validadas} de ${resultados.total} compras validadas exitosamente`,
        data: resultados
      });
    } catch (error) {
      console.error('Error en validación masiva:', error);
      next(error);
    }
  }

  /**
   * Obtener resumen de compras por periodo
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

      const resumen = await compraService.obtenerResumenPorPeriodo(empresaId, periodo);

      res.json({
        mensaje: 'Resumen de compras obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar permanentemente todas las compras en estado ANULADO
   */
  async eliminarAnulados(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, identificacion_proveedor, fecha_desde, fecha_hasta } = req.query;

      const filtros = {
        periodo,
        identificacion_proveedor,
        fecha_desde,
        fecha_hasta
      };

      console.log('=== ELIMINAR COMPRAS ANULADAS ===');
      console.log('Empresa ID:', empresaId);
      console.log('Filtros:', filtros);

      const resultado = await compraService.eliminarAnulados(empresaId, filtros);

      console.log('Resultado:', resultado);

      // Asegurar que el resultado tenga la estructura correcta
      res.json({
        mensaje: resultado.mensaje || 'Operación completada',
        eliminados: resultado.eliminados || 0
      });
    } catch (error) {
      console.error('Error al eliminar compras anuladas en controlador:', {
        mensaje: error.message,
        stack: error.stack,
        nombre: error.name
      });
      next(error);
    }
  }

  /**
   * Agregar o actualizar retenciones a una compra existente
   */
  async agregarRetenciones(req, res, next) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;
      const { retenciones } = req.body;

      console.log('=== AGREGAR RETENCIONES A COMPRA ===');
      console.log('Compra ID:', id);
      console.log('Empresa ID:', empresaId);
      console.log('Retenciones recibidas:', retenciones?.length || 0);

      if (!retenciones || !Array.isArray(retenciones)) {
        return res.status(400).json({
          error: 'Debe proporcionar un array de retenciones'
        });
      }

      // Actualizar la compra con las retenciones
      const compraActualizada = await compraService.actualizar(id, empresaId, {
        retenciones
      });

      res.json({
        mensaje: 'Retenciones agregadas exitosamente a la compra',
        data: compraActualizada
      });
    } catch (error) {
      console.error('Error al agregar retenciones:', error);
      next(error);
    }
  }

  /**
   * Importar XML de factura electrónica
   */
  async importarXML(req, res, next) {
    try {
      console.log('=== IMPORTAR XML ===');

      // Validar que se haya subido un archivo
      if (!req.file) {
        return res.status(400).json({
          error: 'No se ha proporcionado un archivo XML'
        });
      }

      console.log('Archivo recibido:', req.file.originalname);
      console.log('Tamaño:', req.file.size, 'bytes');

      // Validar extensión
      if (!req.file.originalname.toLowerCase().endsWith('.xml')) {
        return res.status(400).json({
          error: 'El archivo debe tener extensión .xml'
        });
      }

      // Leer contenido del archivo
      const xmlContent = req.file.buffer.toString('utf-8');

      // Validar estructura del XML
      const validacion = await xmlParserService.validarEstructuraXML(xmlContent);
      if (!validacion.valido) {
        return res.status(400).json({
          error: 'XML inválido',
          detalles: validacion.errores
        });
      }

      // Parsear XML y extraer datos
      const datosExtraidos = await xmlParserService.parsearFacturaElectronica(xmlContent);

      // Guardar archivo XML (opcional)
      let rutaArchivo = null;
      if (req.body.guardarArchivo === 'true') {
        rutaArchivo = await xmlParserService.guardarArchivoXML(
          req.file.buffer,
          req.file.originalname
        );
        datosExtraidos.archivo_xml = rutaArchivo;
      }

      console.log('Datos extraídos exitosamente');
      console.log('Proveedor:', datosExtraidos.razon_social_proveedor);
      console.log('Total:', datosExtraidos.total_compra);

      res.json({
        mensaje: 'XML importado exitosamente',
        data: datosExtraidos,
        validacion: {
          errores: validacion.errores,
          advertencias: validacion.advertencias
        }
      });
    } catch (error) {
      console.error('=== ERROR AL IMPORTAR XML ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      next(error);
    }
  }
}

module.exports = new CompraController();
