const xmlImportService = require('../services/xmlImportService');
const compraService = require('../services/compraService');
const ventaService = require('../services/ventaService');
const { AppError } = require('../middlewares/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio de uploads
const uploadDir = path.join(__dirname, '../../uploads/xml');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Directorio de uploads creado:', uploadDir);
}

// Configuración de multer para subida de archivos XML
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/xml/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.xml') {
      return cb(new AppError('Solo se permiten archivos XML', 400));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Controlador de importación de XML
 */
class XmlImportController {
  /**
   * Middleware de multer para upload
   */
  get uploadMiddleware() {
    return upload.single('xmlFile');
  }

  /**
   * Importar factura desde XML
   */
  async importarFactura(req, res, next) {
    try {
      const fs = require('fs').promises;

      console.log('=== INICIANDO IMPORTACIÓN DE FACTURA ===');
      console.log('Usuario ID:', req.usuario?.id);
      console.log('Empresa ID:', req.empresaId);
      console.log('Archivo recibido:', req.file);
      console.log('Body recibido:', req.body);

      const empresaId = req.empresaId;
      const usuarioId = req.usuario.id;

      if (!req.file) {
        console.error('ERROR: No se recibió archivo');
        throw new AppError('Debe proporcionar un archivo XML', 400);
      }

      console.log('Leyendo archivo:', req.file.path);

      // Leer contenido del archivo
      const xmlContent = await fs.readFile(req.file.path, 'utf-8');

      console.log('Archivo leído. Longitud:', xmlContent.length);

      // Detectar tipo
      const tipoComprobante = xmlImportService.detectarTipoComprobante(xmlContent);
      console.log('Tipo de comprobante detectado:', tipoComprobante);

      if (tipoComprobante !== 'FACTURA') {
        console.error('ERROR: Tipo de comprobante incorrecto:', tipoComprobante);
        throw new AppError('El XML no corresponde a una factura electrónica', 400);
      }

      console.log('Parseando factura (sin validación XSD - solo para facturas individuales)...');
      // Parsear factura SIN validación XSD (el XSD de ATS es para archivos consolidados, no facturas individuales)
      // La validación XSD solo se aplica al ATS generado
      const resultado = await xmlImportService.parsearYValidarFactura(xmlContent, false);

      console.log('Resultado de validación XSD:', {
        valido: resultado.validacion.valido,
        errores: resultado.validacion.errores.length,
        advertencias: resultado.validacion.advertencias.length,
        metodo: resultado.validacion.metodo
      });

      // Si no se pudo parsear, retornar error de validación
      if (!resultado.parseado) {
        return res.status(400).json({
          mensaje: 'El XML tiene errores de validación',
          validacion: resultado.validacion,
          errores: resultado.validacion.errores,
          advertencias: resultado.validacion.advertencias
        });
      }

      const datosFactura = resultado.datos;
      console.log('Datos de factura parseados:', datosFactura);

      // Extraer periodo del XML
      const fechaEmision = new Date(datosFactura.fecha_emision);
      const mes = (fechaEmision.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaEmision.getFullYear();
      const periodo = `${mes}/${anio}`;

      console.log('Periodo calculado:', periodo);

      // Preparar datos para crear compra
      const datosCompra = {
        ...datosFactura,
        empresa_id: empresaId,
        periodo,
        codigo_sustento: req.body.codigo_sustento || '01',
        tipo_proveedor: req.body.tipo_proveedor || '02',
        fecha_registro: new Date(),
        archivo_xml: req.file.path,
        estado: 'BORRADOR'
      };

      console.log('Datos de compra preparados:', {
        ...datosCompra,
        xml_original: '...(omitido)...'
      });

      // Crear compra
      console.log('Creando compra en la base de datos...');
      const compra = await compraService.crear(datosCompra, usuarioId);

      console.log('Compra creada exitosamente. ID:', compra.id);

      // Eliminar archivo temporal si se guardó la ruta
      // await fs.unlink(req.file.path);

      res.status(201).json({
        mensaje: 'Factura importada exitosamente desde XML',
        data: compra,
        validacion: {
          valido: resultado.validacion.valido,
          metodo: resultado.validacion.metodo,
          errores: resultado.validacion.errores,
          advertencias: resultado.validacion.advertencias,
          xsdDisponible: xmlImportService.xsdValidationAvailable
        }
      });
    } catch (error) {
      console.error('=== ERROR EN IMPORTACIÓN DE FACTURA ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);

      // Eliminar archivo en caso de error
      if (req.file) {
        try {
          const fs = require('fs').promises;
          await fs.unlink(req.file.path);
          console.log('Archivo temporal eliminado:', req.file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }
      }
      next(error);
    }
  }

  /**
   * Importar retención desde XML y asociarla a una compra
   */
  async importarRetencion(req, res, next) {
    try {
      const fs = require('fs').promises;
      const empresaId = req.empresaId;
      const usuarioId = req.usuario.id;

      console.log('=== INICIANDO IMPORTACIÓN DE RETENCIÓN ===');
      console.log('Usuario ID:', usuarioId);
      console.log('Empresa ID:', empresaId);
      console.log('Archivo recibido:', req.file);
      console.log('Body recibido:', req.body);

      if (!req.file) {
        throw new AppError('Debe proporcionar un archivo XML', 400);
      }

      // Leer contenido del archivo
      const xmlContent = await fs.readFile(req.file.path, 'utf-8');

      // Detectar tipo
      const tipoComprobante = xmlImportService.detectarTipoComprobante(xmlContent);

      if (tipoComprobante !== 'RETENCION') {
        throw new AppError('El XML no corresponde a una retención electrónica', 400);
      }

      // Parsear retención SIN validación XSD (el XSD de ATS es para archivos consolidados, no retenciones individuales)
      const resultado = await xmlImportService.parsearYValidarRetencion(xmlContent, false);

      console.log('Resultado de validación XSD:', {
        valido: resultado.validacion.valido,
        errores: resultado.validacion.errores.length,
        advertencias: resultado.validacion.advertencias.length,
        metodo: resultado.validacion.metodo
      });

      // Si no se pudo parsear, retornar error de validación
      if (!resultado.parseado) {
        return res.status(400).json({
          mensaje: 'El XML tiene errores de validación',
          validacion: resultado.validacion,
          errores: resultado.validacion.errores,
          advertencias: resultado.validacion.advertencias
        });
      }

      const retenciones = resultado.datos;
      console.log('Retenciones parseadas:', retenciones.length);

      // Si se proporciona compra_id, asociar las retenciones a la compra
      if (req.body.compra_id) {
        const compraId = parseInt(req.body.compra_id);
        console.log('Asociando retenciones a compra ID:', compraId);

        // Obtener la compra
        const compra = await compraService.obtenerPorId(compraId, empresaId);

        if (!compra) {
          throw new AppError('Compra no encontrada', 404);
        }

        // Preparar retenciones para asociar
        const retencionesParaAsociar = retenciones.map(ret => ({
          fecha_emision: ret.fecha_emision,
          establecimiento: ret.establecimiento,
          punto_emision: ret.punto_emision,
          secuencial: ret.secuencial,
          numero_autorizacion: ret.numero_autorizacion,
          tipo_impuesto: ret.tipo_impuesto,
          codigo_retencion: ret.codigo_retencion,
          base_imponible: ret.base_imponible,
          porcentaje_retencion: ret.porcentaje_retencion,
          valor_retenido: ret.valor_retenido,
          archivo_xml: req.file.path
        }));

        // Actualizar la compra con las retenciones
        const compraActualizada = await compraService.actualizar(compraId, empresaId, {
          retenciones: retencionesParaAsociar
        });

        console.log('Compra actualizada con retenciones. ID:', compraActualizada.id);

        res.status(201).json({
          mensaje: 'Retenciones importadas y asociadas a la compra exitosamente',
          data: {
            compra: compraActualizada,
            retenciones_importadas: retenciones.length
          },
          validacion: {
            valido: resultado.validacion.valido,
            metodo: resultado.validacion.metodo,
            errores: resultado.validacion.errores,
            advertencias: resultado.validacion.advertencias,
            xsdDisponible: xmlImportService.xsdValidationAvailable
          }
        });
      } else {
        // Solo previsualizar las retenciones sin asociarlas
        console.log('No se proporcionó compra_id. Retornando previsualización.');

        res.status(200).json({
          mensaje: 'Retenciones parseadas exitosamente. Proporcione compra_id para asociarlas.',
          data: retenciones,
          total: retenciones.length,
          validacion: {
            valido: resultado.validacion.valido,
            metodo: resultado.validacion.metodo,
            errores: resultado.validacion.errores,
            advertencias: resultado.validacion.advertencias,
            xsdDisponible: xmlImportService.xsdValidationAvailable
          }
        });
      }
    } catch (error) {
      console.error('=== ERROR EN IMPORTACIÓN DE RETENCIÓN ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);

      // Eliminar archivo en caso de error
      if (req.file) {
        try {
          const fs = require('fs').promises;
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }
      }
      next(error);
    }
  }

  /**
   * Importar factura de VENTA desde XML
   */
  async importarFacturaVenta(req, res, next) {
    try {
      const fs = require('fs').promises;

      console.log('=== INICIANDO IMPORTACIÓN DE FACTURA DE VENTA ===');
      console.log('Usuario ID:', req.usuario?.id);
      console.log('Empresa ID:', req.empresaId);
      console.log('Archivo recibido:', req.file);
      console.log('Body recibido:', req.body);

      const empresaId = req.empresaId;
      const usuarioId = req.usuario.id;

      if (!req.file) {
        console.error('ERROR: No se recibió archivo');
        throw new AppError('Debe proporcionar un archivo XML', 400);
      }

      console.log('Leyendo archivo:', req.file.path);

      // Leer contenido del archivo
      const xmlContent = await fs.readFile(req.file.path, 'utf-8');

      console.log('Archivo leído. Longitud:', xmlContent.length);

      // Detectar tipo
      const tipoComprobante = xmlImportService.detectarTipoComprobante(xmlContent);
      console.log('Tipo de comprobante detectado:', tipoComprobante);

      if (tipoComprobante !== 'FACTURA') {
        console.error('ERROR: Tipo de comprobante incorrecto:', tipoComprobante);
        throw new AppError('El XML no corresponde a una factura electrónica', 400);
      }

      console.log('Parseando factura de venta (sin validación XSD)...');
      // Parsear factura de VENTA SIN validación XSD
      const resultado = await xmlImportService.parsearYValidarFacturaVenta(xmlContent, false);

      console.log('Resultado de validación XSD:', {
        valido: resultado.validacion.valido,
        errores: resultado.validacion.errores.length,
        advertencias: resultado.validacion.advertencias.length,
        metodo: resultado.validacion.metodo
      });

      // Si no se pudo parsear, retornar error de validación
      if (!resultado.parseado) {
        return res.status(400).json({
          mensaje: 'El XML tiene errores de validación',
          validacion: resultado.validacion,
          errores: resultado.validacion.errores,
          advertencias: resultado.validacion.advertencias
        });
      }

      const datosFactura = resultado.datos;
      console.log('Datos de factura parseados:', datosFactura);

      // Extraer periodo del XML
      const fechaEmision = new Date(datosFactura.fecha_emision);
      const mes = (fechaEmision.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaEmision.getFullYear();
      const periodo = `${mes}/${anio}`;

      console.log('Periodo calculado:', periodo);

      // Preparar datos para crear venta
      const datosVenta = {
        ...datosFactura,
        empresa_id: empresaId,
        periodo,
        fecha_registro: new Date(),
        archivo_xml: req.file.path,
        estado: 'BORRADOR',
        valor_retencion_iva: 0,
        valor_retencion_renta: 0
      };

      console.log('Datos de venta preparados:', {
        ...datosVenta,
        xml_original: '...(omitido)...'
      });

      // Crear venta
      console.log('Creando venta en la base de datos...');
      const venta = await ventaService.crear(datosVenta, usuarioId);

      console.log('Venta creada exitosamente. ID:', venta.id);

      res.status(201).json({
        mensaje: 'Factura de venta importada exitosamente desde XML',
        data: venta,
        validacion: {
          valido: resultado.validacion.valido,
          metodo: resultado.validacion.metodo,
          errores: resultado.validacion.errores,
          advertencias: resultado.validacion.advertencias,
          xsdDisponible: xmlImportService.xsdValidationAvailable
        }
      });
    } catch (error) {
      console.error('=== ERROR EN IMPORTACIÓN DE FACTURA DE VENTA ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);

      // Eliminar archivo en caso de error
      if (req.file) {
        try {
          const fs = require('fs').promises;
          await fs.unlink(req.file.path);
          console.log('Archivo temporal eliminado:', req.file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }
      }
      next(error);
    }
  }

  /**
   * Previsualizar datos del XML sin guardar
   */
  async previsualizarXML(req, res, next) {
    try {
      const fs = require('fs').promises;

      console.log('Iniciando previsualización XML...');
      console.log('Archivo recibido:', req.file);

      if (!req.file) {
        throw new AppError('Debe proporcionar un archivo XML', 400);
      }

      console.log('Leyendo archivo:', req.file.path);

      // Leer contenido del archivo
      const xmlContent = await fs.readFile(req.file.path, 'utf-8');

      console.log('Contenido XML leído. Longitud:', xmlContent.length);
      console.log('Primeros 200 caracteres:', xmlContent.substring(0, 200));

      // Detectar tipo
      const tipoComprobante = xmlImportService.detectarTipoComprobante(xmlContent);
      console.log('Tipo de comprobante detectado:', tipoComprobante);

      let resultado;
      if (tipoComprobante === 'FACTURA') {
        // Sin validación XSD para facturas individuales (solo para ATS consolidado)
        resultado = await xmlImportService.parsearYValidarFactura(xmlContent, false);
      } else if (tipoComprobante === 'RETENCION') {
        // Sin validación XSD para retenciones individuales (solo para ATS consolidado)
        resultado = await xmlImportService.parsearYValidarRetencion(xmlContent, false);
      } else {
        throw new AppError('Tipo de comprobante no reconocido', 400);
      }

      console.log('Resultado de validación:', {
        parseado: resultado.parseado,
        valido: resultado.validacion.valido,
        metodo: resultado.validacion.metodo
      });

      // Eliminar archivo temporal
      await fs.unlink(req.file.path);

      res.json({
        mensaje: resultado.parseado ? 'XML procesado exitosamente' : 'XML con errores de validación',
        tipo: tipoComprobante,
        data: resultado.datos,
        parseado: resultado.parseado,
        validacion: {
          valido: resultado.validacion.valido,
          metodo: resultado.validacion.metodo,
          errores: resultado.validacion.errores,
          advertencias: resultado.validacion.advertencias,
          xsdDisponible: xmlImportService.xsdValidationAvailable
        }
      });
    } catch (error) {
      console.error('Error al procesar XML:', error);
      console.error('Stack:', error.stack);

      // Eliminar archivo en caso de error
      if (req.file) {
        try {
          const fs = require('fs').promises;
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }
      }
      next(error);
    }
  }
}

module.exports = new XmlImportController();
