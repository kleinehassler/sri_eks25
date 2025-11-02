/**
 * Script de prueba para validación XSD de archivos XML del SRI
 *
 * Este script demuestra cómo funciona la validación XSD implementada
 * en el sistema ATS para archivos XML de facturas electrónicas y retenciones.
 *
 * Uso:
 *   node test-xsd-validation.js
 *
 * Requisitos:
 *   - libxmljs2 instalado: npm install libxmljs2
 *   - Archivo XSD del SRI en: requerimientos_documentos/ARCHIVOats-xsd.txt
 */

const xsdValidatorService = require('./src/services/xsdValidatorService');
const xmlImportService = require('./src/services/xmlImportService');

console.log('\n' + '='.repeat(70));
console.log('PRUEBA DE VALIDACIÓN XSD - Sistema ATS');
console.log('='.repeat(70) + '\n');

// Verificar si libxmljs2 está disponible
console.log('Estado de libxmljs2:');
if (xsdValidatorService.xsdValidationAvailable) {
  console.log('✓ libxmljs2 disponible - Validación XSD completa ACTIVA');
} else {
  console.log('⚠ libxmljs2 NO disponible - Usando validación básica');
  console.log('  Para habilitar validación XSD completa, instale:');
  console.log('  npm install libxmljs2');
}

console.log('\n' + '-'.repeat(70) + '\n');

// XML de ejemplo válido (estructura mínima ATS)
const xmlValido = `<?xml version="1.0" encoding="ISO-8859-1"?>
<iva>
  <TipoIDInformante>R</TipoIDInformante>
  <IdInformante>1234567890001</IdInformante>
  <razonSocial>EMPRESA DE PRUEBA SA</razonSocial>
  <Anio>2025</Anio>
  <Mes>10</Mes>
  <numEstabRuc>1</numEstabRuc>
  <totalVentas>1000.00</totalVentas>
  <codigoOperativo>IVA</codigoOperativo>
</iva>`;

// XML de ejemplo inválido (falta campos obligatorios)
const xmlInvalido = `<?xml version="1.0" encoding="ISO-8859-1"?>
<iva>
  <TipoIDInformante>R</TipoIDInformante>
  <razonSocial>EMPRESA DE PRUEBA SA</razonSocial>
</iva>`;

// Función para mostrar resultados de validación
function mostrarResultadoValidacion(titulo, resultado) {
  console.log(`📄 ${titulo}`);
  console.log('-'.repeat(70));
  console.log(`Estado: ${resultado.valido ? '✓ VÁLIDO' : '✗ INVÁLIDO'}`);
  console.log(`Método de validación: ${resultado.metodo}`);
  console.log(`Mensaje: ${resultado.mensaje}`);

  if (resultado.errores && resultado.errores.length > 0) {
    console.log(`\nErrores encontrados (${resultado.errores.length}):`);
    resultado.errores.forEach((error, i) => {
      console.log(`\n  ${i + 1}. [${error.tipo}] ${error.mensaje}`);
      if (error.linea) console.log(`     Línea: ${error.linea}${error.columna ? `, Columna: ${error.columna}` : ''}`);
      if (error.ruta) console.log(`     Ruta: ${error.ruta}`);
      if (error.detalle) console.log(`     Detalle: ${error.detalle}`);
    });
  }

  if (resultado.advertencias && resultado.advertencias.length > 0) {
    console.log(`\nAdvertencias (${resultado.advertencias.length}):`);
    resultado.advertencias.forEach((adv, i) => {
      console.log(`\n  ${i + 1}. [${adv.tipo}] ${adv.mensaje}`);
      if (adv.detalle) console.log(`     Detalle: ${adv.detalle}`);
    });
  }

  if (resultado.valido && (!resultado.errores || resultado.errores.length === 0)) {
    console.log('\n✓ No se encontraron errores de validación.');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  try {
    console.log('Iniciando pruebas de validación XSD...\n');

    // Prueba 1: XML Válido
    console.log('PRUEBA 1: XML Válido (estructura mínima ATS)');
    console.log('='.repeat(70));
    const resultadoValido = await xsdValidatorService.validarXml(xmlValido);
    mostrarResultadoValidacion('Resultado de validación', resultadoValido);

    // Prueba 2: XML Inválido
    console.log('PRUEBA 2: XML Inválido (faltan campos obligatorios)');
    console.log('='.repeat(70));
    const resultadoInvalido = await xsdValidatorService.validarXml(xmlInvalido);
    mostrarResultadoValidacion('Resultado de validación', resultadoInvalido);

    // Prueba 3: Reporte de validación
    console.log('PRUEBA 3: Reporte de validación en formato legible');
    console.log('='.repeat(70));
    const reporte = xsdValidatorService.generarReporte(resultadoInvalido);
    console.log(reporte);

    console.log('\n✅ Pruebas completadas exitosamente!\n');
    console.log('Nota: Los archivos XML reales del SRI deben tener estructura completa');
    console.log('según los esquemas Factura_V2.1.0.xsd o ComprobanteRetencion.xsd\n');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar pruebas
ejecutarPruebas().then(() => {
  console.log('Script finalizado correctamente.');
  process.exit(0);
}).catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
