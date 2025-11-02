const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialAts = sequelize.define('HistorialAts', {
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
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  periodo: {
    type: DataTypes.STRING(7),
    allowNull: false,
    validate: {
      is: {
        args: /^(0[1-9]|1[0-2])\/\d{4}$/,
        msg: 'El periodo debe tener formato MM/AAAA'
      }
    }
  },
  nombre_archivo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del archivo es requerido'
      }
    }
  },
  ruta_archivo_xml: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La ruta del archivo XML es requerida'
      }
    }
  },
  ruta_archivo_zip: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La ruta del archivo ZIP es requerida'
      }
    }
  },
  total_compras: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El total de compras no puede ser negativo'
      }
    }
  },
  total_ventas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El total de ventas no puede ser negativo'
      }
    }
  },
  total_exportaciones: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El total de exportaciones no puede ser negativo'
      }
    }
  },
  total_retenciones: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El total de retenciones no puede ser negativo'
      }
    }
  },
  validacion_xsd: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  errores_validacion: {
    type: DataTypes.TEXT
  },
  fecha_generacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('GENERADO', 'DESCARGADO', 'PRESENTADO', 'ERROR'),
    allowNull: false,
    defaultValue: 'GENERADO'
  }
}, {
  tableName: 'historial_ats',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['empresa_id', 'periodo'] },
    { fields: ['usuario_id'] },
    { fields: ['estado'] },
    { fields: ['fecha_generacion'] }
  ]
});

module.exports = HistorialAts;
