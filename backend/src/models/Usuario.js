const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'id'
    }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      }
    }
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El apellido es requerido'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Debe proporcionar un correo electrónico válido'
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
    allowNull: false,
    defaultValue: 'OPERADOR'
  },
  ultimo_acceso: {
    type: DataTypes.DATE
  },
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO'),
    allowNull: false,
    defaultValue: 'ACTIVO'
  }
}, {
  tableName: 'usuarios',
  underscored: true,
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password_hash && !usuario.password_hash.startsWith('$2')) {
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash') && !usuario.password_hash.startsWith('$2')) {
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
      }
    }
  }
});

module.exports = Usuario;
