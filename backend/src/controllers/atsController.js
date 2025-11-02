const atsGeneratorService = require('../services/atsGeneratorService');
const { HistorialAts } = require('../models');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controlador de generación de ATS
 */
class AtsController {
  /**
   * Generar archivo ATS para un periodo
   */
  async generarAts(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const usuarioId = req.usuario.id;
      const { periodo } = req.body;

      if (!periodo) {
        return res.status(400).json({
          mensaje: 'El periodo es requerido',
          errores: [{ campo: 'periodo', mensaje: 'El periodo debe tener formato MM/AAAA' }]
        });
      }

      // Validar formato de periodo
      if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(periodo)) {
        return res.status(400).json({
          mensaje: 'Formato de periodo inválido',
          errores: [{ campo: 'periodo', mensaje: 'El periodo debe tener formato MM/AAAA (ej: 01/2024)' }]
        });
      }

      // Generar ATS
      const resultado = await atsGeneratorService.generarATS(empresaId, periodo, usuarioId);

      // Determinar mensaje según validación XSD
      let mensaje = 'ATS generado exitosamente';
      if (resultado.validacion && !resultado.validacion.valido) {
        mensaje = 'ATS generado con advertencias de validación XSD';
      }

      res.json({
        mensaje,
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descargar archivo XML o ZIP del ATS
   */
  async descargarAts(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { id } = req.params;
      const { tipo = 'zip' } = req.query;

      // Buscar el registro en el historial por ID
      const historial = await HistorialAts.findOne({
        where: {
          id,
          empresa_id: empresaId
        }
      });

      if (!historial) {
        return res.status(404).json({
          mensaje: 'No se encontró archivo ATS con el ID especificado'
        });
      }

      // Seleccionar ruta según tipo de archivo
      const rutaArchivo = tipo === 'xml' ? historial.ruta_archivo_xml : historial.ruta_archivo_zip;

      try {
        await fs.access(rutaArchivo);
      } catch {
        return res.status(404).json({
          mensaje: `El archivo ${tipo.toUpperCase()} no está disponible. Por favor, genere el archivo nuevamente.`
        });
      }

      // Actualizar estado a DESCARGADO
      await historial.update({ estado: 'DESCARGADO' });

      // Enviar archivo
      const nombreArchivo = path.basename(rutaArchivo);
      res.download(rutaArchivo, nombreArchivo, (err) => {
        if (err) {
          console.error('Error al descargar archivo:', err);
          if (!res.headersSent) {
            next(err);
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener historial de archivos ATS generados
   */
  async obtenerHistorial(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { pagina = 1, limite = 20, periodo } = req.query;

      const where = { empresa_id: empresaId };

      if (periodo) {
        where.periodo = periodo;
      }

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const { count, rows } = await HistorialAts.findAndCountAll({
        where,
        limit: parseInt(limite),
        offset,
        order: [['fecha_generacion', 'DESC']],
        include: [
          {
            association: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email']
          }
        ]
      });

      res.json({
        mensaje: 'Historial de ATS obtenido exitosamente',
        data: {
          items: rows,
          total: count,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(count / parseInt(limite))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener detalle de un archivo ATS específico
   */
  async obtenerDetalle(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { id } = req.params;

      const historial = await HistorialAts.findOne({
        where: {
          id,
          empresa_id: empresaId
        },
        include: [
          {
            association: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            association: 'empresa',
            attributes: ['id', 'ruc', 'razon_social']
          }
        ]
      });

      if (!historial) {
        return res.status(404).json({
          mensaje: 'Registro de ATS no encontrado'
        });
      }

      // Enriquecer con información de validación si está disponible
      const respuesta = {
        ...historial.toJSON(),
        validacion_mensaje: historial.validacion_xsd
          ? 'XML validado correctamente contra esquema XSD del SRI'
          : 'XML con advertencias de validación (revisar logs de generación)'
      };

      res.json({
        mensaje: 'Detalle de ATS obtenido exitosamente',
        data: respuesta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un registro de ATS del historial
   */
  async eliminarAts(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { id } = req.params;

      const historial = await HistorialAts.findOne({
        where: {
          id,
          empresa_id: empresaId
        }
      });

      if (!historial) {
        return res.status(404).json({
          mensaje: 'Registro de ATS no encontrado'
        });
      }

      // Eliminar archivos físicos (XML y ZIP)
      try {
        await fs.unlink(historial.ruta_archivo_xml);
        await fs.unlink(historial.ruta_archivo_zip);
      } catch (error) {
        console.error('Error al eliminar archivos físicos:', error);
        // Continuar con la eliminación del registro aunque fallen los archivos
      }

      // Eliminar registro de la base de datos
      await historial.destroy();

      res.json({
        mensaje: 'Registro de ATS eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener vista previa de datos antes de generar ATS
   */
  async obtenerVistaPrevia(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo } = req.query;

      if (!periodo) {
        return res.status(400).json({
          mensaje: 'El periodo es requerido'
        });
      }

      // Validar formato de periodo
      if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(periodo)) {
        return res.status(400).json({
          mensaje: 'Formato de periodo inválido. Use MM/AAAA'
        });
      }

      // Obtener vista previa de datos
      const vistaPrevia = await atsGeneratorService.obtenerVistaPrevia(empresaId, periodo);

      res.json({
        mensaje: 'Vista previa obtenida exitosamente',
        data: vistaPrevia
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AtsController();
