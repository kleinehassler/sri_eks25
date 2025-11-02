const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogActividad = sequelize.define('LogActividad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'empresas',
      key: 'id'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  accion: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La acción es requerida'
      }
    }
  },
  modulo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El módulo es requerido'
      }
    }
  },
  entidad: {
    type: DataTypes.STRING(50)
  },
  entidad_id: {
    type: DataTypes.INTEGER
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.STRING(500)
  },
  datos_antes: {
    type: DataTypes.TEXT,
    comment: 'JSON con datos antes del cambio'
  },
  datos_despues: {
    type: DataTypes.TEXT,
    comment: 'JSON con datos después del cambio'
  }
}, {
  tableName: 'log_actividad',
  underscored: true,
  timestamps: true,
  updatedAt: false, // Solo created_at, no updated_at
  indexes: [
    { fields: ['empresa_id'] },
    { fields: ['usuario_id'] },
    { fields: ['accion'] },
    { fields: ['modulo'] },
    { fields: ['created_at'] }
  ]
});

module.exports = LogActividad;
