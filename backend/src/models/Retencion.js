const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Retencion = sequelize.define('Retencion', {
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
  compra_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'compras',
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
  establecimiento: {
    type: DataTypes.STRING(3),
    allowNull: false,
    validate: {
      is: {
        args: /^[0-9]{3}$/,
        msg: 'El establecimiento debe tener 3 dígitos numéricos'
      }
    }
  },
  punto_emision: {
    type: DataTypes.STRING(3),
    allowNull: false,
    validate: {
      is: {
        args: /^[0-9]{3}$/,
        msg: 'El punto de emisión debe tener 3 dígitos numéricos'
      }
    }
  },
  secuencial: {
    type: DataTypes.STRING(9),
    allowNull: false,
    validate: {
      is: {
        args: /^[0-9]{1,9}$/,
        msg: 'El secuencial debe ser numérico de hasta 9 dígitos'
      }
    }
  },
  numero_autorizacion: {
    type: DataTypes.STRING(49),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El número de autorización es requerido'
      },
      len: {
        args: [10, 49],
        msg: 'El número de autorización debe tener entre 10 y 49 caracteres'
      }
    }
  },
  fecha_emision: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Debe proporcionar una fecha válida'
      }
    }
  },
  tipo_identificacion: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  identificacion_proveedor: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La identificación del proveedor es requerida'
      }
    }
  },
  razon_social_proveedor: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La razón social del proveedor es requerida'
      },
      len: {
        args: [1, 300],
        msg: 'La razón social debe tener entre 1 y 300 caracteres'
      }
    }
  },
  tipo_impuesto: {
    type: DataTypes.ENUM('IVA', 'RENTA'),
    allowNull: false
  },
  codigo_retencion: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El código de retención es requerido'
      }
    }
  },
  base_imponible: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'La base imponible debe ser mayor o igual a 0'
      }
    }
  },
  porcentaje_retencion: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El porcentaje de retención debe ser mayor o igual a 0'
      },
      max: {
        args: [100],
        msg: 'El porcentaje de retención no puede ser mayor a 100'
      }
    }
  },
  valor_retenido: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El valor retenido debe ser mayor o igual a 0'
      }
    }
  },
  numero_comprobante_sustento: {
    type: DataTypes.STRING(17),
    comment: 'Formato: 001-002-000000001'
  },
  fecha_emision_comprobante_sustento: {
    type: DataTypes.DATEONLY
  },
  archivo_xml: {
    type: DataTypes.TEXT,
    comment: 'Ruta o contenido del XML de retención electrónica'
  },
  estado: {
    type: DataTypes.ENUM('BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'),
    allowNull: false,
    defaultValue: 'BORRADOR'
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'retenciones',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['empresa_id', 'periodo'] },
    { fields: ['usuario_id'] },
    { fields: ['compra_id'] },
    { fields: ['identificacion_proveedor'] },
    { fields: ['estado'] },
    { fields: ['fecha_emision'] }
  ]
});

module.exports = Retencion;
