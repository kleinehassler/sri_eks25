/**
 * Script de prueba para generación de ATS
 * Uso: node test-ats-generation.js
 */

require('dotenv').config();
const { XMLBuilder } = require('fast-xml-parser');

// Simular una compra como en el ejemplo
const compraEjemplo = {
  codSustento: '01',
  tpIdProv: '01',
  idProv: '1712801552001',
  tipoComprobante: '01',
  parteRel: 'NO',
  fechaRegistro: '10/01/2025',
  establecimiento: '001',
  puntoEmision: '005',
  secuencial: 134,
  fechaEmision: '10/01/2025',
  autorizacion: '3110202501171280155200120010050000001341234567814',
  baseNoGraIva: '0.00',
  baseImponible: '0.00',
  baseImpGrav: '100.00',
  baseImpExe: '0.00',
  montoIce: '0.00',
  montoIva: '15.00',
  valRetBien10: '0.00',
  valRetServ20: '0.00',
  valorRetBienes: '0.00',
  valRetServ50: '0.00',
  valorRetServicios: '0.00',
  valRetServ100: '15.00',
  valorRetencionNc: '0.00',
  totbasesImpReemb: '0.00',
  pagoExterior: {
    pagoLocExt: '01',
    paisEfecPago: 'NA',
    aplicConvDobTrib: 'NA',
    pagExtSujRetNorLeg: 'NA'
  },
  air: {
    detalleAir: {
      codRetAir: '303',
      baseImpAir: '100.00',
      porcentajeAir: '10.00',
      valRetAir: '10.00'
    }
  },
  estabRetencion1: '001',
  ptoEmiRetencion1: '001',
  secRetencion1: 223,
  autRetencion1: '3110202501171280155200120010050000001341234567814',
  fechaEmiRet1: '10/01/2025'
};

// Estructura del ATS
const ats = {
  iva: {
    TipoIDInformante: 'R',
    IdInformante: '1712801552001',
    razonSocial: 'KLEINE HEBEL HASSLER GRANDA',
    Anio: '2025',
    Mes: '01',
    totalVentas: '0.00',
    codigoOperativo: 'IVA',
    compras: {
      detalleCompras: compraEjemplo
    }
  }
};

// Configurar builder
const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: false,
  suppressEmptyNode: true,
  tagValueProcessor: (tagName, tagValue) => {
    if (typeof tagValue === 'number' && Math.abs(tagValue) > 1e15) {
      return String(tagValue);
    }
    return tagValue;
  }
});

// Generar XML
console.log('='.repeat(80));
console.log('PRUEBA DE GENERACIÓN DE XML ATS');
console.log('='.repeat(80));
console.log('');

const xmlContent = builder.build(ats);
const xmlCompleto = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>${xmlContent}`;

console.log('XML Generado:');
console.log('');
console.log(xmlCompleto);
console.log('');
console.log('='.repeat(80));

// Guardar en archivo para comparación
const fs = require('fs');
const path = require('path');

const rutaArchivo = path.join(__dirname, 'test-ats-output.xml');
fs.writeFileSync(rutaArchivo, xmlCompleto, 'utf-8');

console.log(`✅ XML guardado en: ${rutaArchivo}`);
console.log('');
console.log('Puedes compararlo con el archivo de ejemplo:');
console.log('  docum/AT-012025.xml');
console.log('');
console.log('='.repeat(80));
