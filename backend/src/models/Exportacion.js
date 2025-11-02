const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exportacion = sequelize.define('Exportacion', {
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
  tipo_cliente: {
    type: DataTypes.ENUM('01', '02'),
    allowNull: false,
    comment: '01=Persona Natural, 02=Sociedad'
  },
  tipo_identificacion: {
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
  pais_destino: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'Código país ISO 3166'
  },
  pais_efect_pago: {
    type: DataTypes.STRING(3),
    comment: 'Código país ISO 3166'
  },
  tipo_regimen_fiscal: {
    type: DataTypes.STRING(2)
  },
  pais_regimen_fiscal: {
    type: DataTypes.STRING(3),
    comment: 'Código país ISO 3166'
  },
  valor_fob_comprobante: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El valor FOB debe ser mayor o igual a 0'
      }
    }
  },
  valor_fob_compensacion: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'El valor FOB compensación no puede ser negativo'
      }
    }
  },
  forma_pago: {
    type: DataTypes.STRING(2)
  },
  distrito_exportacion: {
    type: DataTypes.STRING(3)
  },
  anio_exportacion: {
    type: DataTypes.INTEGER,
    validate: {
      min: {
        args: [1900],
        msg: 'El año debe ser mayor a 1900'
      },
      max: {
        args: [2100],
        msg: 'El año debe ser menor a 2100'
      }
    }
  },
  regimen_exportacion: {
    type: DataTypes.STRING(2)
  },
  correo_electronico: {
    type: DataTypes.STRING(100),
    validate: {
      isEmail: {
        msg: 'Debe proporcionar un correo electrónico válido'
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
  tableName: 'exportaciones',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['empresa_id', 'periodo'] },
    { fields: ['usuario_id'] },
    { fields: ['estado'] },
    { fields: ['fecha_emision'] }
  ]
});

module.exports = Exportacion;
