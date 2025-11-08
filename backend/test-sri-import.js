/**
 * Script de prueba para importación desde SRI
 * Uso: node test-sri-import.js
 */

require('dotenv').config();
const sriSoapService = require('./src/services/sriSoapService');

// Clave de acceso de prueba (reemplazar con la clave real)
const CLAVE_ACCESO = '3110202501171280155200120010050000001291234567817';
const AMBIENTE = 'PRODUCCION'; // o 'PRUEBAS'

async function probarImportacionSRI() {
  console.log('='.repeat(80));
  console.log('PRUEBA DE IMPORTACIÓN DESDE SRI');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Clave de acceso: ${CLAVE_ACCESO}`);
  console.log(`Ambiente: ${AMBIENTE}`);
  console.log('');

  try {
    // Validar clave de acceso
    console.log('1. Validando clave de acceso...');
    const validacion = sriSoapService.validarClaveAcceso(CLAVE_ACCESO);

    if (!validacion.valida) {
      console.error('❌ Clave de acceso inválida:', validacion.mensaje);
      return;
    }

    console.log('✅ Clave de acceso válida');
    console.log('   - Fecha emisión:', validacion.fechaEmision);
    console.log('   - Tipo comprobante:', validacion.tipoComprobante);
    console.log('   - RUC:', validacion.ruc);
    console.log('   - Establecimiento:', validacion.establecimiento);
    console.log('   - Punto emisión:', validacion.puntoEmision);
    console.log('   - Secuencial:', validacion.numeroComprobante);
    console.log('');

    // Descargar comprobante del SRI
    console.log('2. Descargando comprobante del SRI...');
    console.log('   (Esto puede tardar unos segundos)');
    console.log('');

    const resultado = await sriSoapService.descargarComprobante(CLAVE_ACCESO, AMBIENTE);

    console.log('✅ Comprobante descargado exitosamente');
    console.log('');
    console.log('3. Datos extraídos:');
    console.log('   - Tipo comprobante:', resultado.datos.tipoComprobante);
    console.log('   - RUC emisor:', resultado.datos.ruc);
    console.log('   - Razón social:', resultado.datos.razonSocial);
    console.log('   - Fecha emisión:', resultado.datos.fechaEmision);
    console.log('   - Cliente:', resultado.datos.razonSocialComprador);
    console.log('   - Identificación cliente:', resultado.datos.identificacionComprador);
    console.log('   - Total sin impuestos:', resultado.datos.totalSinImpuestos);
    console.log('   - Total:', resultado.datos.importeTotal);
    console.log('');

    if (resultado.datos.impuestos && resultado.datos.impuestos.length > 0) {
      console.log('4. Impuestos:');
      resultado.datos.impuestos.forEach((imp, idx) => {
        console.log(`   ${idx + 1}. Código: ${imp.codigo}, Base: ${imp.baseImponible}, Tarifa: ${imp.tarifa}%, Valor: ${imp.valor}`);
      });
      console.log('');
    }

    if (resultado.datos.formasPago && resultado.datos.formasPago.length > 0) {
      console.log('5. Formas de pago:');
      resultado.datos.formasPago.forEach((pago, idx) => {
        console.log(`   ${idx + 1}. Forma: ${pago.formaPago}, Total: ${pago.total}`);
      });
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ ERROR EN LA PRUEBA');
    console.error('='.repeat(80));
    console.error('');
    console.error('Mensaje:', error.message);
    console.error('');

    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }

    console.error('');
    console.error('Posibles causas:');
    console.error('  1. La clave de acceso no existe en el SRI');
    console.error('  2. El comprobante no está autorizado');
    console.error('  3. Error de conexión con el servicio del SRI');
    console.error('  4. El ambiente (PRODUCCION/PRUEBAS) no es correcto');
    console.error('');

    process.exit(1);
  }
}

// Ejecutar prueba
probarImportacionSRI().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
