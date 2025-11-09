require('dotenv').config();
const app = require('./app');

// Según documentación de Seenode: usar process.env.PORT sin especificar host
const port = process.env.PORT || 80;

const server = app.listen(port, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🚀 Sistema ATS - SRI Ecuador');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ✅ Servidor ejecutándose en puerto ${port}`);
  console.log(`  📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🌐 API disponible`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado (unhandledRejection):', error);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada (uncaughtException):', error);
  server.close(() => process.exit(1));
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

module.exports = server;