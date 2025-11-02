const express = require('express');
const router = express.Router();

// Importar rutas de módulos
const authRoutes = require('./authRoutes');
const empresaRoutes = require('./empresaRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const compraRoutes = require('./compraRoutes');
const retencionRoutes = require('./retencionRoutes');
const ventaRoutes = require('./ventaRoutes');
const exportacionRoutes = require('./exportacionRoutes');
const xmlImportRoutes = require('./xmlImportRoutes');
const reporteRoutes = require('./reporteRoutes');
const reporteAvanzadoRoutes = require('./reporteAvanzadoRoutes');
const atsRoutes = require('./atsRoutes');

// Definir rutas principales
router.use('/auth', authRoutes);
router.use('/empresas', empresaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/compras', compraRoutes);
router.use('/retenciones', retencionRoutes);
router.use('/ventas', ventaRoutes);
router.use('/exportaciones', exportacionRoutes);
router.use('/xml', xmlImportRoutes);
router.use('/reportes', reporteRoutes);
router.use('/reportes-avanzados', reporteAvanzadoRoutes);
router.use('/ats', atsRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'SRI ATS API',
    version: '1.0.0'
  });
});

module.exports = router;
