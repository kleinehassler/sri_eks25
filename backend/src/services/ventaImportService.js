/**
 * Servicio para importar ventas desde el SRI
 * Procesa archivos .txt con claves de acceso y descarga los comprobantes del SRI
 */

const fs = require('fs').promises;
const path = require('path');
const sriSoapService = require('./sriSoapService');
const { Venta, LogActividad, sequelize } = require('../models');
const logger = require('../config/logger');

/**
 * Procesa un archivo .txt con claves de acceso y descarga/importa las ventas desde el SRI
 * @param {Object} archivo - Archivo .txt subido (multer)
 * @param {number} empresaId - ID de la empresa
 * @param {number} usuarioId - ID del usuario que realiza la importación
 * @param {string} ambiente - Ambiente (PRODUCCION o PRUEBAS)
 * @returns {Promise<Object>} Resultado de la importación con estadísticas
 */
async function importarVentasDesdeArchivo(archivo, empresaId, usuarioId, ambiente = 'PRODUCCION') {
  const transaction = await sequelize.transaction();

  try {
    logger.info(`Iniciando importación de ventas desde archivo: ${archivo.originalname}`, {
      empresaId,
      usuarioId,
      ambiente
    });

    // Leer el archivo .txt
    const contenido = await fs.readFile(archivo.path, 'utf-8');

    // Separar por líneas y limpiar
    const clavesAcceso = contenido
      .split('\n')
      .map(linea => linea.trim())
      .filter(linea => linea.length > 0);

    if (clavesAcceso.length === 0) {
      throw new Error('El archivo no contiene claves de acceso válidas');
    }

    logger.info(`Se encontraron ${clavesAcceso.length} claves de acceso en el archivo`);

    // Procesar cada clave de acceso
    const resultados = {
      total: clavesAcceso.length,
      exitosos: 0,
      fallidos: 0,
      duplicados: 0,
      detalles: []
    };

    for (let i = 0; i < clavesAcceso.length; i++) {
      const claveAcceso = clavesAcceso[i];

      try {
        logger.info(`Procesando clave de acceso ${i + 1}/${clavesAcceso.length}: ${claveAcceso}`);

        // Validar formato de clave de acceso
        const validacion = sriSoapService.validarClaveAcceso(claveAcceso);
        if (!validacion.valida) {
          resultados.fallidos++;
          resultados.detalles.push({
            claveAcceso,
            estado: 'ERROR',
            mensaje: validacion.mensaje
          });
          continue;
        }

        // Verificar si ya existe una venta con esta clave de acceso
        const ventaExistente = await Venta.findOne({
          where: {
            empresa_id: empresaId,
            numero_autorizacion: claveAcceso
          }
        });

        if (ventaExistente) {
          resultados.duplicados++;
          resultados.detalles.push({
            claveAcceso,
            estado: 'DUPLICADO',
            mensaje: `Ya existe una venta con esta clave de acceso (ID: ${ventaExistente.id})`
          });
          logger.info(`Venta duplicada, omitiendo: ${claveAcceso}`);
          continue;
        }

        // Descargar comprobante del SRI
        const comprobante = await sriSoapService.descargarComprobante(claveAcceso, ambiente);

        // Guardar XML en disco (opcional, para auditoría)
        await guardarXmlComprobante(comprobante.xml, claveAcceso, empresaId);

        // Mapear datos del comprobante a modelo de Venta
        const datosVenta = mapearComprobanteAVenta(comprobante.datos, empresaId, usuarioId);

        // Crear registro de venta
        const venta = await Venta.create(datosVenta, { transaction });

        resultados.exitosos++;
        resultados.detalles.push({
          claveAcceso,
          estado: 'EXITOSO',
          mensaje: `Venta importada correctamente (ID: ${venta.id})`,
          ventaId: venta.id
        });

        logger.info(`Venta importada exitosamente: ${claveAcceso} -> ID: ${venta.id}`);

      } catch (error) {
        resultados.fallidos++;
        resultados.detalles.push({
          claveAcceso,
          estado: 'ERROR',
          mensaje: error.message
        });

        logger.error(`Error al procesar clave de acceso: ${claveAcceso}`, {
          error: error.message,
          stack: error.stack
        });
      }
    }

    // Registrar actividad en log
    await LogActividad.create({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      modulo: 'VENTAS',
      accion: 'IMPORTAR_DESDE_SRI',
      descripcion: `Importación masiva desde SRI: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos, ${resultados.duplicados} duplicados`,
      ip_address: null,
      user_agent: null
    }, { transaction });

    await transaction.commit();

    // Eliminar archivo temporal
    try {
      await fs.unlink(archivo.path);
    } catch (error) {
      logger.warn(`No se pudo eliminar archivo temporal: ${archivo.path}`, { error: error.message });
    }

    logger.info(`Importación finalizada. Exitosos: ${resultados.exitosos}, Fallidos: ${resultados.fallidos}, Duplicados: ${resultados.duplicados}`);

    return resultados;

  } catch (error) {
    await transaction.rollback();

    // Eliminar archivo temporal en caso de error
    try {
      await fs.unlink(archivo.path);
    } catch (unlinkError) {
      logger.warn(`No se pudo eliminar archivo temporal: ${archivo.path}`, { error: unlinkError.message });
    }

    logger.error('Error en importación de ventas desde archivo', {
      error: error.message,
      stack: error.stack,
      empresaId,
      usuarioId
    });

    throw error;
  }
}

/**
 * Mapea los datos del comprobante descargado del SRI al formato del modelo Venta
 * @param {Object} datos - Datos parseados del comprobante
 * @param {number} empresaId - ID de la empresa
 * @param {number} usuarioId - ID del usuario
 * @returns {Object} Objeto con datos mapeados para crear Venta
 */
function mapearComprobanteAVenta(datos, empresaId, usuarioId) {
  // Convertir fecha de DD/MM/YYYY a YYYY-MM-DD
  const [dia, mes, anio] = datos.fechaEmision.split('/');
  const fechaEmision = `${anio}-${mes}-${dia}`;

  // Extraer periodo (MM/YYYY)
  const periodo = `${mes}/${anio}`;

  // Calcular bases imponibles por tarifa de IVA
  let base_imponible_0 = 0;
  let base_imponible_iva = 0;
  let base_imponible_no_objeto_iva = 0;
  let base_imponible_exento_iva = 0;
  let monto_iva = 0;
  let monto_ice = 0;

  datos.impuestos.forEach(impuesto => {
    if (impuesto.codigo === '2') { // IVA
      const codigoPorcentaje = impuesto.codigoPorcentaje;

      if (codigoPorcentaje === '0') { // IVA 0%
        base_imponible_0 += impuesto.baseImponible;
      } else if (codigoPorcentaje === '6' || codigoPorcentaje === '7') { // No objeto de IVA
        base_imponible_no_objeto_iva += impuesto.baseImponible;
      } else if (codigoPorcentaje === '2') { // IVA 12% o 15%
        base_imponible_iva += impuesto.baseImponible;
        monto_iva += impuesto.valor;
      } else if (codigoPorcentaje === '3') { // IVA 14%
        base_imponible_iva += impuesto.baseImponible;
        monto_iva += impuesto.valor;
      } else if (codigoPorcentaje === '4') { // IVA 15%
        base_imponible_iva += impuesto.baseImponible;
        monto_iva += impuesto.valor;
      } else if (codigoPorcentaje === '8') { // IVA 5%
        base_imponible_iva += impuesto.baseImponible;
        monto_iva += impuesto.valor;
      }
    } else if (impuesto.codigo === '3') { // ICE
      monto_ice += impuesto.valor;
    }
  });

  // Obtener forma de pago (si hay múltiples, tomar la primera)
  const formaPago = datos.formasPago.length > 0 ? datos.formasPago[0].formaPago : '01';

  return {
    empresa_id: empresaId,
    usuario_id: usuarioId,
    periodo,
    tipo_comprobante: datos.codDoc,
    tipo_identificacion_cliente: datos.tipoIdentificacionComprador,
    identificacion_cliente: datos.identificacionComprador,
    razon_social_cliente: datos.razonSocialComprador,
    fecha_emision: fechaEmision,
    establecimiento: datos.estab,
    punto_emision: datos.ptoEmi,
    secuencial: datos.secuencial,
    numero_autorizacion: datos.claveAcceso,
    base_imponible_0,
    base_imponible_iva,
    base_imponible_no_objeto_iva,
    base_imponible_exento_iva,
    monto_iva,
    monto_ice,
    valor_retencion_iva: 0, // Se puede actualizar posteriormente si hay retenciones
    valor_retencion_renta: 0,
    total_venta: datos.importeTotal,
    forma_pago: formaPago,
    estado: 'BORRADOR', // Importadas como borrador para revisión
    observaciones: `Importado desde SRI el ${new Date().toISOString()}. Tipo: ${datos.tipoComprobante}`
  };
}

/**
 * Guarda el XML del comprobante en disco para auditoría
 * @param {string} xmlString - XML del comprobante
 * @param {string} claveAcceso - Clave de acceso del comprobante
 * @param {number} empresaId - ID de la empresa
 * @returns {Promise<string>} Ruta del archivo guardado
 */
async function guardarXmlComprobante(xmlString, claveAcceso, empresaId) {
  try {
    // Directorio para guardar XMLs: backend/uploads/xml/empresaId/
    const directorioBase = path.join(__dirname, '../../uploads/xml', empresaId.toString());

    // Crear directorio si no existe
    await fs.mkdir(directorioBase, { recursive: true });

    // Nombre del archivo: claveAcceso.xml
    const rutaArchivo = path.join(directorioBase, `${claveAcceso}.xml`);

    // Guardar XML
    await fs.writeFile(rutaArchivo, xmlString, 'utf-8');

    logger.info(`XML guardado en: ${rutaArchivo}`);

    return rutaArchivo;

  } catch (error) {
    logger.error('Error al guardar XML del comprobante', {
      error: error.message,
      claveAcceso,
      empresaId
    });
    // No lanzar error, solo registrar. La importación puede continuar.
    return null;
  }
}

/**
 * Descarga e importa una única venta desde el SRI usando la clave de acceso
 * @param {string} claveAcceso - Clave de acceso del comprobante
 * @param {number} empresaId - ID de la empresa
 * @param {number} usuarioId - ID del usuario
 * @param {string} ambiente - Ambiente (PRODUCCION o PRUEBAS)
 * @returns {Promise<Object>} Venta creada
 */
async function importarVentaUnica(claveAcceso, empresaId, usuarioId, ambiente = 'PRODUCCION') {
  const transaction = await sequelize.transaction();

  try {
    logger.info(`Importando venta única desde SRI: ${claveAcceso}`, { empresaId, usuarioId });

    // Validar formato de clave de acceso
    const validacion = sriSoapService.validarClaveAcceso(claveAcceso);
    if (!validacion.valida) {
      throw new Error(validacion.mensaje);
    }

    // Verificar si ya existe
    const ventaExistente = await Venta.findOne({
      where: {
        empresa_id: empresaId,
        numero_autorizacion: claveAcceso
      }
    });

    if (ventaExistente) {
      throw new Error(`Ya existe una venta con esta clave de acceso (ID: ${ventaExistente.id})`);
    }

    // Descargar comprobante del SRI
    const comprobante = await sriSoapService.descargarComprobante(claveAcceso, ambiente);

    // Guardar XML
    await guardarXmlComprobante(comprobante.xml, claveAcceso, empresaId);

    // Mapear y crear venta
    const datosVenta = mapearComprobanteAVenta(comprobante.datos, empresaId, usuarioId);
    const venta = await Venta.create(datosVenta, { transaction });

    // Registrar actividad
    await LogActividad.create({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      modulo: 'VENTAS',
      accion: 'IMPORTAR_DESDE_SRI',
      descripcion: `Venta importada desde SRI: ${claveAcceso}`,
      ip_address: null,
      user_agent: null
    }, { transaction });

    await transaction.commit();

    logger.info(`Venta importada exitosamente: ${claveAcceso} -> ID: ${venta.id}`);

    return {
      venta,
      comprobante: comprobante.datos
    };

  } catch (error) {
    await transaction.rollback();

    logger.error(`Error al importar venta única: ${claveAcceso}`, {
      error: error.message,
      stack: error.stack
    });

    throw error;
  }
}

module.exports = {
  importarVentasDesdeArchivo,
  importarVentaUnica,
  mapearComprobanteAVenta
};
