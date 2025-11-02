# GUÍA DE IMPLEMENTACIÓN: SECCIÓN RECAP

**Propósito:** Instrucciones para implementar la sección RECAP (Recapitulaciones de tarjetas de crédito) en el sistema ATS

---

## 1. MODELO DE BASE DE DATOS

### 1.1 Crear Migración

**Archivo:** `database/migrations/YYYYMMDDHHMMSS-create-recap.js`

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recap', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      periodo: {
        type: Sequelize.STRING(7),
        allowNull: false,
        comment: 'Formato: MM/AAAA'
      },
      establecimiento_recap: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Código del establecimiento (1-100)'
      },
      identificacion_recap: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'RUC del establecimiento afiliado'
      },
      tipo_identificacion: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      parte_relacionada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tipo_comprobante: {
        type: Sequelize.STRING(2),
        allowNull: false,
        comment: '22=Recap'
      },
      numero_recap: {
        type: Sequelize.STRING(15),
        allowNull: false,
        comment: 'Número de recapitulación'
      },
      fecha_pago: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tarjeta_credito: {
        type: Sequelize.STRING(2),
        allowNull: false,
        comment: 'Código de tarjeta según tabla SRI'
      },
      fecha_emision_recap: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      consumo_cero: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        comment: 'Consumos tarifa 0%'
      },
      consumo_gravado: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        comment: 'Consumos tarifa IVA'
      },
      total_consumo: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      monto_iva: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      comision: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        comment: 'Comisión cobrada'
      },
      numero_vouchers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Cantidad de vouchers'
      },
      // Retenciones IVA
      val_ret_bien_10: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      val_ret_serv_20: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      valor_ret_bienes: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      val_ret_serv_50: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      valor_ret_servicios: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      val_ret_serv_100: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      // Pago exterior (opcional)
      pago_locext: {
        type: Sequelize.STRING(2),
        comment: '01=Local, 02=Exterior'
      },
      tipo_regimen: {
        type: Sequelize.STRING(2)
      },
      pais_efect_pago: {
        type: Sequelize.STRING(3),
        comment: 'Código país ISO'
      },
      aplica_convenio_doble_imposicion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pag_ext_suj_ret_nor_leg: {
        type: Sequelize.STRING(2),
        comment: 'SI/NO/NA'
      },
      // Comprobante retención
      establecimiento_retencion: {
        type: Sequelize.STRING(3)
      },
      punto_emision_retencion: {
        type: Sequelize.STRING(3)
      },
      secuencial_retencion: {
        type: Sequelize.STRING(9)
      },
      autorizacion_retencion: {
        type: Sequelize.STRING(49)
      },
      fecha_emision_retencion: {
        type: Sequelize.DATEONLY
      },
      estado: {
        type: Sequelize.ENUM('BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'),
        allowNull: false,
        defaultValue: 'BORRADOR'
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('recap', ['empresa_id', 'periodo']);
    await queryInterface.addIndex('recap', ['identificacion_recap']);
    await queryInterface.addIndex('recap', ['estado']);
    await queryInterface.addIndex('recap', ['fecha_pago']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recap');
  }
};
```

### 1.2 Ejecutar Migración

```bash
cd backend
npm run migrate
```

---

## 2. MODELO SEQUELIZE

### 2.1 Crear Archivo

**Archivo:** `backend/src/models/Recap.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recap = sequelize.define('Recap', {
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
  establecimiento_recap: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  identificacion_recap: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  tipo_identificacion: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  parte_relacionada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tipo_comprobante: {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: '22'
  },
  numero_recap: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tarjeta_credito: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  fecha_emision_recap: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  consumo_cero: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  consumo_gravado: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  total_consumo: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  monto_iva: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  comision: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  numero_vouchers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  val_ret_bien_10: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  val_ret_serv_20: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  valor_ret_bienes: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  val_ret_serv_50: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  valor_ret_servicios: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  val_ret_serv_100: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  pago_locext: {
    type: DataTypes.STRING(2)
  },
  tipo_regimen: {
    type: DataTypes.STRING(2)
  },
  pais_efect_pago: {
    type: DataTypes.STRING(3)
  },
  aplica_convenio_doble_imposicion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pag_ext_suj_ret_nor_leg: {
    type: DataTypes.STRING(2)
  },
  establecimiento_retencion: {
    type: DataTypes.STRING(3)
  },
  punto_emision_retencion: {
    type: DataTypes.STRING(3)
  },
  secuencial_retencion: {
    type: DataTypes.STRING(9)
  },
  autorizacion_retencion: {
    type: DataTypes.STRING(49)
  },
  fecha_emision_retencion: {
    type: DataTypes.DATEONLY
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
  tableName: 'recap',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['empresa_id', 'periodo'] },
    { fields: ['identificacion_recap'] },
    { fields: ['estado'] },
    { fields: ['fecha_pago'] }
  ]
});

module.exports = Recap;
```

### 2.2 Actualizar index.js

**Archivo:** `backend/src/models/index.js`

Agregar:
```javascript
const Recap = require('./Recap');

// Exportar
module.exports = {
  // ... otros modelos
  Recap
};
```

---

## 3. ACTUALIZAR ATSGENERAT ORSERVICE

### 3.1 Importar Modelo

**Archivo:** `backend/src/services/atsGeneratorService.js`

```javascript
const { Compra, Venta, Exportacion, Empresa, HistorialAts, Retencion, Recap } = require('../models');
```

### 3.2 Agregar Consulta de Recaps

En el método `generarATS()`, actualizar:

```javascript
// Obtener datos transaccionales
const [compras, ventas, exportaciones, retenciones, anulados, recaps] = await Promise.all([
  this.obtenerComprasValidadas(empresaId, periodo),
  this.obtenerVentasValidadas(empresaId, periodo),
  this.obtenerExportacionesValidadas(empresaId, periodo),
  this.obtenerRetencionesValidadas(empresaId, periodo),
  this.obtenerAnulados(empresaId, periodo),
  this.obtenerRecapsValidadas(empresaId, periodo)
]);

// Construir estructura XML del ATS
const atsXml = this.construirXmlAts(empresa, periodo, compras, ventas, exportaciones, retenciones, anulados, recaps);
```

### 3.3 Actualizar construirXmlAts

```javascript
construirXmlAts(empresa, periodo, compras, ventas, exportaciones, retenciones, anulados, recaps) {
  // ... código existente ...

  // Agregar recaps si existen
  if (recaps.length > 0) {
    ats.iva.recap = {
      detalleRecap: recaps.map(r => this.mapearRecap(r, retenciones))
    };
  }

  return ats;
}
```

### 3.4 Implementar mapearRecap

```javascript
/**
 * Mapear recap al formato XML ATS
 */
mapearRecap(recap, retenciones) {
  const detalleRecap = {
    establecimientoRecap: recap.establecimiento_recap,
    identificacionRecap: String(recap.identificacion_recap),
    parteRelRec: recap.parte_relacionada ? 'SI' : 'NO',
    tipoComprobante: String(recap.tipo_comprobante),
    numeroRecap: String(recap.numero_recap).padStart(15, '0'),
    fechaPago: this.formatearFecha(recap.fecha_pago),
    tarjetaCredito: String(recap.tarjeta_credito).padStart(2, '0'),
    fechaEmisionRecap: this.formatearFecha(recap.fecha_emision_recap),
    consumoCero: this.formatearDecimal(recap.consumo_cero),
    consumoGravado: this.formatearDecimal(recap.consumo_gravado),
    totalConsumo: this.formatearDecimal(recap.total_consumo),
    montoIva: this.formatearDecimal(recap.monto_iva),
    comision: this.formatearDecimal(recap.comision),
    numeroVouchers: recap.numero_vouchers,
    valRetBien10: this.formatearDecimal(recap.val_ret_bien_10),
    valRetServ20: this.formatearDecimal(recap.val_ret_serv_20),
    valorRetBienes: this.formatearDecimal(recap.valor_ret_bienes),
    valRetServ50: this.formatearDecimal(recap.val_ret_serv_50),
    valorRetServicios: this.formatearDecimal(recap.valor_ret_servicios),
    valRetServ100: this.formatearDecimal(recap.val_ret_serv_100)
  };

  // Agregar pago exterior si aplica
  if (recap.pago_locext) {
    detalleRecap.pagoExterior = {
      pagoLocExt: recap.pago_locext,
      tipoRegi: recap.tipo_regimen,
      paisEfecPago: String(recap.pais_efect_pago),
      aplicConvDobTrib: recap.aplica_convenio_doble_imposicion ? 'SI' : 'NO',
      pagExtSujRetNorLeg: recap.pag_ext_suj_ret_nor_leg || 'NA'
    };
  }

  // Agregar retenciones AIR si existen
  const retencionesRecap = retenciones.filter(r =>
    r.identificacion_proveedor === recap.identificacion_recap &&
    r.tipo_impuesto === 'RENTA'
  );

  if (retencionesRecap.length > 0) {
    detalleRecap.air = {
      detalleAir: retencionesRecap.map(ret => ({
        codRetAir: String(ret.codigo_retencion),
        baseImpAir: this.formatearDecimal(ret.base_imponible),
        porcentajeAir: this.formatearDecimal(ret.porcentaje_retencion),
        valRetAir: this.formatearDecimal(ret.valor_retenido)
      }))
    };
  }

  // Agregar datos de retención emitida si existen
  if (recap.establecimiento_retencion) {
    detalleRecap.establecimiento = String(recap.establecimiento_retencion);
    detalleRecap.puntoEmision = String(recap.punto_emision_retencion);
    detalleRecap.secuencial = String(recap.secuencial_retencion).padStart(9, '0');
    detalleRecap.autorizacion = String(recap.autorizacion_retencion);
    detalleRecap.fechaEmision = this.formatearFecha(recap.fecha_emision_retencion);
  }

  return detalleRecap;
}
```

### 3.5 Agregar Método de Consulta

```javascript
/**
 * Obtener recaps validadas para el periodo
 */
async obtenerRecapsValidadas(empresaId, periodo) {
  return await Recap.findAll({
    where: {
      empresa_id: empresaId,
      periodo,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    },
    order: [['fecha_pago', 'ASC']]
  });
}
```

---

## 4. CREAR SERVICIO CRUD

**Archivo:** `backend/src/services/recapService.js`

```javascript
const { Recap } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

class RecapService {
  /**
   * Crear nuevo recap
   */
  async crear(data) {
    try {
      const recap = await Recap.create(data);
      return recap;
    } catch (error) {
      throw new AppError(`Error al crear recap: ${error.message}`, 400);
    }
  }

  /**
   * Listar recaps con filtros
   */
  async listar(empresaId, filtros = {}) {
    const where = { empresa_id: empresaId };

    if (filtros.periodo) where.periodo = filtros.periodo;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.identificacion_recap) {
      where.identificacion_recap = { [Op.like]: `%${filtros.identificacion_recap}%` };
    }

    const recaps = await Recap.findAll({
      where,
      order: [['fecha_pago', 'DESC']],
      limit: filtros.limite || 50,
      offset: filtros.offset || 0
    });

    const total = await Recap.count({ where });

    return { recaps, total };
  }

  /**
   * Obtener recap por ID
   */
  async obtenerPorId(id, empresaId) {
    const recap = await Recap.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!recap) {
      throw new AppError('Recap no encontrado', 404);
    }

    return recap;
  }

  /**
   * Actualizar recap
   */
  async actualizar(id, empresaId, data) {
    const recap = await this.obtenerPorId(id, empresaId);

    if (recap.estado === 'INCLUIDO_ATS') {
      throw new AppError('No se puede modificar un recap ya incluido en ATS', 400);
    }

    await recap.update(data);
    return recap;
  }

  /**
   * Eliminar recap
   */
  async eliminar(id, empresaId) {
    const recap = await this.obtenerPorId(id, empresaId);

    if (recap.estado === 'INCLUIDO_ATS') {
      throw new AppError('No se puede eliminar un recap ya incluido en ATS', 400);
    }

    await recap.destroy();
    return { mensaje: 'Recap eliminado exitosamente' };
  }

  /**
   * Validar recap
   */
  async validar(id, empresaId) {
    const recap = await this.obtenerPorId(id, empresaId);

    if (recap.estado === 'VALIDADO') {
      throw new AppError('El recap ya está validado', 400);
    }

    await recap.update({ estado: 'VALIDADO' });
    return recap;
  }

  /**
   * Obtener resumen por periodo
   */
  async obtenerResumen(empresaId, periodo) {
    const recaps = await Recap.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      }
    });

    const totalConsumo = recaps.reduce((sum, r) => sum + parseFloat(r.total_consumo), 0);
    const totalIva = recaps.reduce((sum, r) => sum + parseFloat(r.monto_iva), 0);
    const totalComision = recaps.reduce((sum, r) => sum + parseFloat(r.comision), 0);

    return {
      total_recaps: recaps.length,
      total_consumo: totalConsumo.toFixed(2),
      total_iva: totalIva.toFixed(2),
      total_comision: totalComision.toFixed(2)
    };
  }
}

module.exports = new RecapService();
```

---

## 5. CREAR CONTROLADOR Y RUTAS

### 5.1 Controlador

**Archivo:** `backend/src/controllers/recapController.js`

```javascript
const recapService = require('../services/recapService');

exports.crear = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      empresa_id: req.usuario.empresa_id,
      usuario_id: req.usuario.id
    };

    const recap = await recapService.crear(data);

    res.status(201).json({
      mensaje: 'Recap creado exitosamente',
      data: recap
    });
  } catch (error) {
    next(error);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const result = await recapService.listar(req.usuario.empresa_id, req.query);

    res.json({
      mensaje: 'Recaps obtenidos exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ... otros métodos (obtenerPorId, actualizar, eliminar, validar, obtenerResumen)
```

### 5.2 Rutas

**Archivo:** `backend/src/routes/recapRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const recapController = require('../controllers/recapController');
const { authenticate, requireRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas CRUD
router.post('/', requireRole(['ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR']), recapController.crear);
router.get('/', recapController.listar);
router.get('/resumen', recapController.obtenerResumen);
router.get('/:id', recapController.obtenerPorId);
router.put('/:id', requireRole(['ADMINISTRADOR_EMPRESA', 'CONTADOR']), recapController.actualizar);
router.delete('/:id', requireRole(['ADMINISTRADOR_EMPRESA']), recapController.eliminar);
router.patch('/:id/validar', requireRole(['ADMINISTRADOR_EMPRESA', 'CONTADOR']), recapController.validar);

module.exports = router;
```

### 5.3 Registrar Rutas

**Archivo:** `backend/src/routes/index.js`

```javascript
const recapRoutes = require('./recapRoutes');

// ...

router.use('/recap', recapRoutes);
```

---

## 6. ACTUALIZAR VALIDADOR XSD

**Archivo:** `backend/src/services/xsdValidatorService.js`

Agregar método de validación para recap:

```javascript
/**
 * Validar sección de recap
 */
validarSeccionRecap(recap) {
  const errores = [];
  const advertencias = [];

  if (!recap.detalleRecap) {
    advertencias.push({
      tipo: 'ESTRUCTURA',
      mensaje: 'Sección recap sin detalleRecap',
      ruta: '/iva/recap'
    });
    return { errores, advertencias };
  }

  const detalles = Array.isArray(recap.detalleRecap)
    ? recap.detalleRecap
    : [recap.detalleRecap];

  detalles.forEach((detalle, index) => {
    const camposObligatorios = [
      'establecimientoRecap', 'identificacionRecap', 'tipoComprobante',
      'numeroRecap', 'fechaPago', 'tarjetaCredito', 'totalConsumo'
    ];

    camposObligatorios.forEach(campo => {
      if (!detalle[campo]) {
        errores.push({
          tipo: 'CAMPO_OBLIGATORIO',
          mensaje: `Recap ${index + 1}: Falta campo ${campo}`,
          ruta: `/iva/recap/detalleRecap[${index}]/${campo}`
        });
      }
    });
  });

  return { errores, advertencias };
}
```

Y llamarlo desde `validarEstructuraAts`:

```javascript
if (iva.recap) {
  const validacionRecap = this.validarSeccionRecap(iva.recap);
  errores.push(...validacionRecap.errores);
  advertencias.push(...validacionRecap.advertencias);
}
```

---

## 7. PROBAR IMPLEMENTACIÓN

### 7.1 Crear Recap de Prueba

```bash
POST /api/recap
Content-Type: application/json
Authorization: Bearer {token}

{
  "periodo": "10/2025",
  "establecimiento_recap": 10,
  "identificacion_recap": "0604034165001",
  "tipo_identificacion": "04",
  "tipo_comprobante": "22",
  "numero_recap": "000000000000178",
  "fecha_pago": "2025-10-15",
  "tarjeta_credito": "04",
  "fecha_emision_recap": "2025-10-15",
  "consumo_cero": 1000.00,
  "consumo_gravado": 1000.00,
  "total_consumo": 2000.00,
  "monto_iva": 140.00,
  "comision": 12.00,
  "numero_vouchers": 145
}
```

### 7.2 Generar ATS con Recap

```bash
POST /api/ats/generar
Content-Type: application/json
Authorization: Bearer {token}

{
  "periodo": "10/2025"
}
```

### 7.3 Verificar XML Generado

El XML debe contener:

```xml
<recap>
  <detalleRecap>
    <establecimientoRecap>10</establecimientoRecap>
    <identificacionRecap>0604034165001</identificacionRecap>
    <parteRelRec>NO</parteRelRec>
    <tipoComprobante>22</tipoComprobante>
    <numeroRecap>000000000000178</numeroRecap>
    <fechaPago>15/10/2025</fechaPago>
    <tarjetaCredito>04</tarjetaCredito>
    <fechaEmisionRecap>15/10/2025</fechaEmisionRecap>
    <consumoCero>1000.00</consumoCero>
    <consumoGravado>1000.00</consumoGravado>
    <totalConsumo>2000.00</totalConsumo>
    <montoIva>140.00</montoIva>
    <comision>12.00</comision>
    <numeroVouchers>145</numeroVouchers>
    <valRetBien10>0.00</valRetBien10>
    <valRetServ20>0.00</valRetServ20>
    <valorRetBienes>0.00</valorRetBienes>
    <valRetServ50>0.00</valRetServ50>
    <valorRetServicios>0.00</valorRetServicios>
    <valRetServ100>0.00</valRetServ100>
  </detalleRecap>
</recap>
```

---

## 8. RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### Crear:
1. `database/migrations/YYYYMMDDHHMMSS-create-recap.js`
2. `backend/src/models/Recap.js`
3. `backend/src/services/recapService.js`
4. `backend/src/controllers/recapController.js`
5. `backend/src/routes/recapRoutes.js`

### Modificar:
6. `backend/src/models/index.js`
7. `backend/src/services/atsGeneratorService.js`
8. `backend/src/services/xsdValidatorService.js`
9. `backend/src/routes/index.js`

---

## 9. COMANDOS DE EJECUCIÓN

```bash
# 1. Crear migración
npm run migrate

# 2. Reiniciar backend si está corriendo
# Ctrl+C y luego npm run dev

# 3. Probar endpoint de recap
# Usar Postman/Insomnia o curl

# 4. Generar ATS con recap
# POST /api/ats/generar

# 5. Validar XML generado
node test-ats-validation.js
```

---

**FIN DE LA GUÍA**

Esta guía proporciona todos los pasos necesarios para implementar la funcionalidad completa de RECAP en el sistema ATS.
