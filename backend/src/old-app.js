const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound, httpLogger } = require('./middlewares');

const app = express();

// Middlewares de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
  app.use(httpLogger);
}

// Rutas principales
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    nombre: 'API Sistema ATS - SRI Ecuador',
    version: '1.0.0',
    descripcion: 'Sistema multi-empresa para generación de Anexo Transaccional Simplificado',
    documentacion: '/api/health',
    estado: 'activo'
  });
});

// Manejo de rutas no encontradas
app.use(notFound);

// Manejo centralizado de errores
app.use(errorHandler);

// Inicialización de base de datos
const inicializarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a MySQL establecida correctamente');

    if (process.env.NODE_ENV === 'development') {
      // Importar modelos para inicializar asociaciones
      require('./models');

      // IMPORTANTE: En producción usar SOLO migraciones, nunca sync()
      // En desarrollo, alter: true ajusta las tablas existentes sin borrar datos
      await sequelize.sync({ alter: false });
      console.log('✓ Modelos sincronizados con la base de datos');
    }
  } catch (error) {
    console.error('✗ Error al conectar con MySQL:', error.message);
    console.error('Verifica que MySQL esté corriendo y las credenciales en .env sean correctas');
    process.exit(1);
  }
};

// Inicializar DB si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  inicializarDB();
}

module.exports = app;
