const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ParametroSri = sequelize.define('ParametroSri', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_parametro: {
    type: DataTypes.ENUM(
      'TIPO_DOCUMENTO',
      'TIPO_COMPROBANTE_VENTA',
      'CODIGO_SUSTENTO',
      'FORMA_PAGO',
      'TIPO_IDENTIFICACION',
      'PAIS',
      'TIPO_REGIMEN_FISCAL',
      'CODIGO_RETENCION',
      'CODIGO_IMPUESTO'
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El tipo de parámetro es requerido'
      }
    }
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El código es requerido'
      }
    }
  },
  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción es requerida'
      }
    }
  },
  porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: {
        args: [0],
        msg: 'El porcentaje no puede ser negativo'
      },
      max: {
        args: [100],
        msg: 'El porcentaje no puede ser mayor a 100'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    allowNull: false,
    defaultValue: 'ACTIVO'
  }
}, {
  tableName: 'parametros_sri',
  underscored: true,
  timestamps: true
});

module.exports = ParametroSri;
