const Empresa = require('./Empresa');
const Usuario = require('./Usuario');
const ParametroSri = require('./ParametroSri');
const CodigoRetencion = require('./CodigoRetencion');
const Compra = require('./Compra');
const Retencion = require('./Retencion');
const Venta = require('./Venta');
const Exportacion = require('./Exportacion');
const HistorialAts = require('./HistorialAts');
const LogActividad = require('./LogActividad');

// Asociaciones

// Empresa - Usuario (1:N)
Empresa.hasMany(Usuario, {
  foreignKey: 'empresa_id',
  as: 'usuarios'
});
Usuario.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Empresa - Compras (1:N)
Empresa.hasMany(Compra, {
  foreignKey: 'empresa_id',
  as: 'compras'
});
Compra.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Usuario - Compras (1:N)
Usuario.hasMany(Compra, {
  foreignKey: 'usuario_id',
  as: 'compras'
});
Compra.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Compra - Retenciones (1:N)
Compra.hasMany(Retencion, {
  foreignKey: 'compra_id',
  as: 'retenciones'
});
Retencion.belongsTo(Compra, {
  foreignKey: 'compra_id',
  as: 'compra'
});

// Empresa - Retenciones (1:N)
Empresa.hasMany(Retencion, {
  foreignKey: 'empresa_id',
  as: 'retenciones'
});
Retencion.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Usuario - Retenciones (1:N)
Usuario.hasMany(Retencion, {
  foreignKey: 'usuario_id',
  as: 'retenciones'
});
Retencion.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Empresa - Ventas (1:N)
Empresa.hasMany(Venta, {
  foreignKey: 'empresa_id',
  as: 'ventas'
});
Venta.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Usuario - Ventas (1:N)
Usuario.hasMany(Venta, {
  foreignKey: 'usuario_id',
  as: 'ventas'
});
Venta.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Empresa - Exportaciones (1:N)
Empresa.hasMany(Exportacion, {
  foreignKey: 'empresa_id',
  as: 'exportaciones'
});
Exportacion.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Usuario - Exportaciones (1:N)
Usuario.hasMany(Exportacion, {
  foreignKey: 'usuario_id',
  as: 'exportaciones'
});
Exportacion.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Empresa - HistorialAts (1:N)
Empresa.hasMany(HistorialAts, {
  foreignKey: 'empresa_id',
  as: 'historial_ats'
});
HistorialAts.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Usuario - HistorialAts (1:N)
Usuario.hasMany(HistorialAts, {
  foreignKey: 'usuario_id',
  as: 'historial_ats'
});
HistorialAts.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Empresa - LogActividad (1:N)
Empresa.hasMany(LogActividad, {
  foreignKey: 'empresa_id',
  as: 'logs'
});
LogActividad.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Usuario - LogActividad (1:N)
Usuario.hasMany(LogActividad, {
  foreignKey: 'usuario_id',
  as: 'logs'
});
LogActividad.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

const sequelize = require('../config/database');

module.exports = {
  sequelize,
  Empresa,
  Usuario,
  ParametroSri,
  CodigoRetencion,
  Compra,
  Retencion,
  Venta,
  Exportacion,
  HistorialAts,
  LogActividad
};
