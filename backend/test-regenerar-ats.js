/**
 * Script para regenerar el ATS con las mejoras implementadas
 */
const atsGeneratorService = require('./src/services/atsGeneratorService');

async function regenerarATS() {
  try {
    console.log('=== REGENERACIÓN DE ATS ===\n');

    const empresaId = 1; // ID de empresa de prueba
    const periodo = '10/2025';
    const usuarioId = 1; // ID de usuario de prueba

    console.log(`Generando ATS para:`);
    console.log(`- Empresa ID: ${empresaId}`);
    console.log(`- Periodo: ${periodo}`);
    console.log(`- Usuario ID: ${usuarioId}\n`);

    const resultado = await atsGeneratorService.generarATS(empresaId, periodo, usuarioId);

    console.log('✓ ATS generado exitosamente\n');
    console.log('Resultado:');
    console.log(JSON.stringify(resultado, null, 2));

    console.log('\n=== REGENERACIÓN COMPLETADA ===');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error al regenerar ATS:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar regeneración
regenerarATS();
