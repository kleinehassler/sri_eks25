require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('═══════════════════════════*═══════════════════════════');
  console.log('  Sistema ATS - SRI Ecuador');
  console.log('═══════════════════════════*═══════════════════════════');
  console.log(`  Servidor ejecutándose en ${HOST}:${PORT}`);
  console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  URL: http://${HOST}:${PORT}`);
  console.log(`  API: http://${HOST}:${PORT}/api`);
  console.log(`  Health: http://${HOST}:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('Error no manejado (unhandledRejection):', error);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada (uncaughtException):', error);
  server.close(() => process.exit(1));
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = server;
