const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CodigoRetencion = sequelize.define('CodigoRetencion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El código es requerido'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción es requerida'
      }
    }
  },
  porcentaje: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El porcentaje es requerido'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    allowNull: false,
    defaultValue: 'ACTIVO'
  }
}, {
  tableName: 'codigos_retencion',
  underscored: true,
  timestamps: true
});

module.exports = CodigoRetencion;
