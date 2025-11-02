const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ruc: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El RUC es requerido'
      },
      len: {
        args: [13, 13],
        msg: 'El RUC debe tener exactamente 13 dígitos'
      },
      isNumeric: {
        msg: 'El RUC debe contener solo números'
      }
      // Validación de checksum desactivada
      // esRUCEmpresa(value) {
      //   // Verificar que el tercer dígito sea 6 o 9 (empresa)
      //   const tercerDigito = parseInt(value.charAt(2));
      //   if (tercerDigito !== 6 && tercerDigito !== 9) {
      //     throw new Error('El RUC proporcionado no corresponde a una empresa. Use RUC de 13 dígitos con tercer dígito 6 o 9');
      //   }
      //   // Verificar que termine en 001
      //   if (value.length === 13 && value.substring(10, 13) !== '001') {
      //     throw new Error('El RUC de empresa debe terminar en 001');
      //   }
      // }
    }
  },
  razon_social: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La razón social es requerida'
      },
      len: {
        args: [3, 300],
        msg: 'La razón social debe tener entre 3 y 300 caracteres'
      }
    }
  },
  nombre_comercial: {
    type: DataTypes.STRING(300)
  },
  regimen_tributario: {
    type: DataTypes.ENUM('RISE', 'GENERAL', 'RIMPE'),
    allowNull: false,
    defaultValue: 'GENERAL'
  },
  contribuyente_especial: {
    type: DataTypes.STRING(10)
  },
  obligado_contabilidad: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  direccion: {
    type: DataTypes.STRING(500)
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100),
    validate: {
      isEmail: {
        msg: 'Debe proporcionar un correo electrónico válido'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO'),
    allowNull: false,
    defaultValue: 'ACTIVO'
  }
}, {
  tableName: 'empresas',
  underscored: true,
  timestamps: true
});

module.exports = Empresa;
