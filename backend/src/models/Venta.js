const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
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
  tipo_comprobante: {
    type: DataTypes.STRING(2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El tipo de comprobante es requerido'
      }
    }
  },
  tipo_identificacion_cliente: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  identificacion_cliente: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La identificación del cliente es requerida'
      }
    }
  },
  razon_social_cliente: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La razón social del cliente es requerida'
      },
      len: {
        args: [1, 300],
        msg: 'La razón social debe tener entre 1 y 300 caracteres'
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
  base_imponible_0: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'La base imponible no puede ser negativa'
      }
    }
  },
  base_imponible_iva: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'La base imponible IVA no puede ser negativa'
      }
    }
  },
  base_imponible_no_objeto_iva: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'La base imponible no objeto IVA no puede ser negativa'
      }
    }
  },
  base_imponible_exento_iva: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'La base imponible exenta IVA no puede ser negativa'
      }
    }
  },
  monto_iva: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'El monto IVA no puede ser negativo'
      }
    }
  },
  monto_ice: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'El monto ICE no puede ser negativo'
      }
    }
  },
  valor_retencion_iva: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'El valor de retención IVA no puede ser negativo'
      }
    }
  },
  valor_retencion_renta: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'El valor de retención renta no puede ser negativo'
      }
    }
  },
  total_venta: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El total de venta debe ser mayor o igual a 0'
      }
    }
  },
  forma_pago: {
    type: DataTypes.STRING(2)
  },
  tipo_emision: {
    type: DataTypes.STRING(1),
    allowNull: false,
    defaultValue: 'E',
    validate: {
      isIn: {
        args: [['E', 'F']],
        msg: 'El tipo de emisión debe ser E (Electrónica) o F (Física)'
      }
    }
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
  tableName: 'ventas',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['empresa_id', 'periodo'] },
    { fields: ['usuario_id'] },
    { fields: ['identificacion_cliente'] },
    { fields: ['estado'] },
    { fields: ['fecha_emision'] }
  ]
});

module.exports = Venta;
