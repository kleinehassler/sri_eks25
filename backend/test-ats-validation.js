/**
 * Script de prueba para validación XSD de archivos ATS generados
 *
 * Este script demuestra cómo funciona la validación XSD implementada
 * en el sistema para archivos ATS (Anexo Transaccional Simplificado) del SRI.
 *
 * Uso:
 *   node test-ats-validation.js [ruta-archivo-ats.xml]
 *
 * Ejemplos:
 *   node test-ats-validation.js
 *   node test-ats-validation.js storage/ats/1790016919001/ATS102025.xml
 *
 * Requisitos:
 *   - libxmljs2 instalado: npm install libxmljs2
 *   - Archivo XSD del SRI en: requerimientos_documentos/ARCHIVOats-xsd.txt
 */

const fs = require('fs').promises;
const path = require('path');
const xsdValidatorService = require('./src/services/xsdValidatorService');

console.log('\n' + '='.repeat(70));
console.log('PRUEBA DE VALIDACIÓN XSD - Archivos ATS Generados');
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

// XML ATS de ejemplo válido (estructura mínima conforme al SRI)
const atsXmlEjemploValido = `<?xml version="1.0" encoding="UTF-8"?>
<iva xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TipoIDInformante>R</TipoIDInformante>
  <IdInformante>1790016919001</IdInformante>
  <razonSocial>EMPRESA DE PRUEBA SOCIEDAD ANONIMA</razonSocial>
  <Anio>2025</Anio>
  <Mes>10</Mes>
  <numEstabRuc>001</numEstabRuc>
  <totalVentas>10000.00</totalVentas>
  <codigoOperativo>IVA</codigoOperativo>
</iva>`;

// XML ATS de ejemplo inválido (para demostrar detección de errores)
const atsXmlEjemploInvalido = `<?xml version="1.0" encoding="UTF-8"?>
<iva>
  <TipoIDInformante>INVALIDO</TipoIDInformante>
  <IdInformante>123</IdInformante>
  <razonSocial>TEST</razonSocial>
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
    console.log('\n✓ El archivo XML cumple con el esquema XSD del SRI.');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  try {
    // Obtener ruta del archivo desde argumentos o usar valor por defecto
    const rutaArchivoArgumento = process.argv[2];

    console.log('Iniciando pruebas de validación XSD de archivos ATS...\n');

    // Prueba 1: Validar XML de ejemplo válido
    console.log('PRUEBA 1: ATS XML de Ejemplo Válido');
    console.log('='.repeat(70));
    const resultadoEjemploValido = await xsdValidatorService.validarXml(atsXmlEjemploValido);
    mostrarResultadoValidacion('XML de Ejemplo Válido', resultadoEjemploValido);

    // Prueba 2: Validar XML de ejemplo inválido
    console.log('PRUEBA 2: ATS XML de Ejemplo Inválido (para demostración)');
    console.log('='.repeat(70));
    const resultadoEjemploInvalido = await xsdValidatorService.validarXml(atsXmlEjemploInvalido);
    mostrarResultadoValidacion('XML de Ejemplo Inválido', resultadoEjemploInvalido);

    // Prueba 3: Reporte detallado
    console.log('PRUEBA 3: Reporte de Validación en Formato Legible');
    console.log('='.repeat(70));
    const reporte = xsdValidatorService.generarReporte(resultadoEjemploInvalido);
    console.log(reporte);
    console.log('='.repeat(70) + '\n');

    // Prueba 4: Validar archivo ATS real si se proporciona ruta
    if (rutaArchivoArgumento) {
      console.log('PRUEBA 4: Validación de Archivo ATS Real');
      console.log('='.repeat(70));

      const rutaCompleta = path.isAbsolute(rutaArchivoArgumento)
        ? rutaArchivoArgumento
        : path.join(__dirname, rutaArchivoArgumento);

      console.log(`Archivo a validar: ${rutaCompleta}`);

      try {
        // Verificar que el archivo existe
        await fs.access(rutaCompleta);
        console.log('✓ Archivo encontrado');

        // Leer contenido
        const xmlContent = await fs.readFile(rutaCompleta, 'utf-8');
        console.log(`Tamaño: ${xmlContent.length} caracteres\n`);

        // Validar
        const resultadoArchivoReal = await xsdValidatorService.validarXml(xmlContent);
        mostrarResultadoValidacion('Archivo ATS Real', resultadoArchivoReal);

        // Mostrar reporte si hay errores
        if (!resultadoArchivoReal.valido) {
          console.log('REPORTE DETALLADO DE ERRORES:');
          console.log('='.repeat(70));
          console.log(xsdValidatorService.generarReporte(resultadoArchivoReal));
          console.log('='.repeat(70) + '\n');
        }

      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`\n✗ Archivo no encontrado: ${rutaCompleta}`);
          console.log('Verifique la ruta y vuelva a intentar.\n');
        } else {
          throw error;
        }
      }
    } else {
      console.log('PRUEBA 4: Validación de Archivo ATS Real (Opcional)');
      console.log('='.repeat(70));
      console.log('No se proporcionó ruta de archivo.');
      console.log('\nPara validar un archivo ATS real, use:');
      console.log('  node test-ats-validation.js storage/ats/RUC/ATSmmAAAA.xml');
      console.log('\nEjemplo:');
      console.log('  node test-ats-validation.js storage/ats/1790016919001/ATS102025.xml');
      console.log('\n' + '='.repeat(70) + '\n');
    }

    // Resumen final
    console.log('✅ PRUEBAS COMPLETADAS EXITOSAMENTE!\n');
    console.log('Notas importantes:');
    console.log('─'.repeat(70));
    console.log('• La validación XSD se ejecuta automáticamente al generar archivos ATS');
    console.log('• Los resultados de validación se incluyen en la respuesta del API');
    console.log('• Campo "validacion" en respuesta contiene detalles completos');
    console.log('• Campo "validacion_xsd" en historial indica si el ATS es válido');
    console.log('• Los archivos ATS deben cumplir con el esquema oficial del SRI\n');

    console.log('Para generar un ATS mediante la API:');
    console.log('─'.repeat(70));
    console.log('  POST /api/ats/generar');
    console.log('  Headers: { "Authorization": "Bearer <token>" }');
    console.log('  Body: { "periodo": "MM/AAAA" }');
    console.log('');
    console.log('La respuesta incluirá:');
    console.log('  - Estadísticas del ATS generado');
    console.log('  - Rutas de descarga (XML y ZIP)');
    console.log('  - Resultados detallados de validación XSD');
    console.log('  - Errores y advertencias (si existen)\n');

  } catch (error) {
    console.error('❌ ERROR DURANTE LAS PRUEBAS:', error.message);
    console.error('\nStack trace:');
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
