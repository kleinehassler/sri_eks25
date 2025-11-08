/**
 * Controlador para importación de ventas desde el SRI
 * Maneja endpoints para descargar comprobantes electrónicos del SRI
 */

const ventaImportService = require('../services/ventaImportService');
const logger = require('../config/logger');

/**
 * Importa ventas masivamente desde un archivo .txt con claves de acceso
 * POST /api/ventas/importar-desde-sri
 */
const importarVentasDesdeArchivo = async (req, res, next) => {
  try {
    const { empresa_id } = req.body;
    const ambiente = req.body.ambiente || 'PRODUCCION';
    const usuarioId = req.usuario.id;

    // Validar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({
        mensaje: 'Debe proporcionar un archivo .txt con las claves de acceso'
      });
    }

    // Validar extensión del archivo
    const extension = req.file.originalname.split('.').pop().toLowerCase();
    if (extension !== 'txt') {
      return res.status(400).json({
        mensaje: 'El archivo debe tener extensión .txt'
      });
    }

    // Validar empresa_id
    if (!empresa_id) {
      return res.status(400).json({
        mensaje: 'El ID de la empresa es requerido'
      });
    }

    // Validar ambiente
    if (!['PRODUCCION', 'PRUEBAS'].includes(ambiente)) {
      return res.status(400).json({
        mensaje: 'El ambiente debe ser PRODUCCION o PRUEBAS'
      });
    }

    logger.info(`Iniciando importación masiva de ventas desde SRI`, {
      usuarioId,
      empresaId: empresa_id,
      archivo: req.file.originalname,
      ambiente
    });

    // Procesar archivo
    const resultados = await ventaImportService.importarVentasDesdeArchivo(
      req.file,
      parseInt(empresa_id),
      usuarioId,
      ambiente
    );

    // Determinar código de respuesta según resultados
    const statusCode = resultados.exitosos > 0 ? 200 : 400;

    res.status(statusCode).json({
      mensaje: `Importación finalizada: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos, ${resultados.duplicados} duplicados`,
      data: resultados
    });

  } catch (error) {
    logger.error('Error en importación masiva de ventas', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Importa una única venta desde el SRI usando la clave de acceso
 * POST /api/ventas/importar-desde-sri/unica
 */
const importarVentaUnica = async (req, res, next) => {
  try {
    const { clave_acceso, empresa_id, ambiente = 'PRODUCCION' } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!clave_acceso) {
      return res.status(400).json({
        mensaje: 'La clave de acceso es requerida'
      });
    }

    if (!empresa_id) {
      return res.status(400).json({
        mensaje: 'El ID de la empresa es requerido'
      });
    }

    // Validar ambiente
    if (!['PRODUCCION', 'PRUEBAS'].includes(ambiente)) {
      return res.status(400).json({
        mensaje: 'El ambiente debe ser PRODUCCION o PRUEBAS'
      });
    }

    logger.info(`Importando venta única desde SRI`, {
      usuarioId,
      empresaId: empresa_id,
      claveAcceso: clave_acceso,
      ambiente
    });

    const resultado = await ventaImportService.importarVentaUnica(
      clave_acceso,
      parseInt(empresa_id),
      usuarioId,
      ambiente
    );

    res.status(201).json({
      mensaje: 'Venta importada exitosamente desde el SRI',
      data: resultado
    });

  } catch (error) {
    logger.error('Error al importar venta única', {
      error: error.message,
      stack: error.stack,
      claveAcceso: req.body.clave_acceso
    });
    next(error);
  }
};

module.exports = {
  importarVentasDesdeArchivo,
  importarVentaUnica
};
