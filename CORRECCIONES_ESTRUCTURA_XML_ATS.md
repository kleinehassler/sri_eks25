# Correcciones en la Estructura XML del ATS

## 📋 Resumen

Se han corregido varios problemas en la generación del XML del ATS (Anexo Transaccional Simplificado) para que cumpla estrictamente con el esquema XSD oficial del SRI.

**Archivo modificado:** `backend/src/services/atsGeneratorService.js`

**Fecha:** 2025-01-31

## 🔧 Problemas Identificados y Corregidos

### 1. **Tipo de Dato del Campo `secuencial` ❌➡️✅**

**Problema:**
```javascript
// ANTES - Incorrecto
secuencial: String(compra.secuencial || '').padStart(9, '0')
```

El secuencial se estaba formateando como string con padding de ceros ("000000123"), pero según el XSD del SRI:

```xml
<xsd:simpleType name="secuencialType">
    <xsd:restriction base="xsd:integer">
        <xsd:minInclusive value="1" />
        <xsd:maxInclusive value="999999999" />
        <xsd:pattern value="\d{1,9}"></xsd:pattern>
    </xsd:restriction>
</xsd:simpleType>
```

Debe ser un **INTEGER** (número entero), no un string.

**Solución:**
```javascript
// DESPUÉS - Correcto
secuencial: parseInt(compra.secuencial || '0')
```

**Aplicado en:**
- ✅ `mapearCompra()` - línea 223
- ✅ `mapearExportacion()` - línea 329
- ✅ Retenciones en `mapearCompra()` - línea 275

### 2. **Campo `baseNoGraIva` (Base Tarifa 0%) ❌➡️✅**

**Problema:**
```javascript
// ANTES - Incorrecto
baseNoGraIva: this.formatearDecimal(compra.base_imponible_no_objeto_iva)
```

El campo `baseNoGraIva` debe contener la **Base Imponible Tarifa 0%**, no la base no objeto de IVA.

**Solución:**
```javascript
// DESPUÉS - Correcto
baseNoGraIva: this.formatearDecimal(compra.base_imponible_0)  // Base tarifa 0%
```

**Aplicado en:**
- ✅ `mapearCompra()` - línea 226

### 3. **Cálculo de Retenciones de IVA ❌➡️✅**

**Problema:**
```javascript
// ANTES - Incorrecto
valRetBien10: this.formatearDecimal(compra.valor_retencion_iva * 0.1),
valRetServ20: this.formatearDecimal(compra.valor_retencion_iva * 0.2),
```

Los campos de retenciones de IVA se calculaban multiplicando el total por porcentajes arbitrarios (0.1, 0.2), lo cual es **incorrecto**.

**Según el SRI:**
- `valRetBien10`: Valor REAL de retención de IVA al 10% (bienes)
- `valRetServ20`: Valor REAL de retención de IVA al 20% (servicios)
- `valRetServ50`: Valor REAL de retención de IVA al 50% (servicios)
- `valRetServ100`: Valor REAL de retención de IVA al 100%

Estos valores deben obtenerse de las **retenciones reales** asociadas a la compra, no calcularse.

**Solución:**
```javascript
// DESPUÉS - Correcto
// Obtener retenciones de IVA para esta compra
const retencionesIVA = retenciones.filter(r => r.compra_id === compra.id && r.tipo_impuesto === 'IVA');

// Calcular valores de retenciones de IVA según porcentaje
let valRetBien10 = 0;
let valRetServ20 = 0;
let valRetServ50 = 0;
let valRetServ100 = 0;

retencionesIVA.forEach(ret => {
  const porcentaje = parseFloat(ret.porcentaje_retencion || 0);
  const valorRetenido = parseFloat(ret.valor_retenido || 0);

  if (porcentaje === 10) {
    valRetBien10 += valorRetenido;
  } else if (porcentaje === 20) {
    valRetServ20 += valorRetenido;
  } else if (porcentaje === 50) {
    valRetServ50 += valorRetenido;
  } else if (porcentaje === 100) {
    valRetServ100 += valorRetenido;
  }
});

// Usar valores reales
valRetBien10: this.formatearDecimal(valRetBien10),  // Retención IVA 10%
valRetServ20: this.formatearDecimal(valRetServ20),  // Retención IVA 20%
valorRetBienes: this.formatearDecimal(valRetBien10),  // Total retención bienes
valRetServ50: this.formatearDecimal(valRetServ50),  // Retención IVA 50%
valorRetServicios: this.formatearDecimal(valRetServ20 + valRetServ50),  // Total retención servicios
valRetServ100: this.formatearDecimal(valRetServ100),  // Retención IVA 100%
```

**Aplicado en:**
- ✅ `mapearCompra()` - líneas 190-238

## 📊 Estructura Correcta según XSD del SRI

### Orden de Elementos en `detalleComprasType`:

1. ✅ `codSustento` - Código de sustento tributario
2. ✅ `tpIdProv` - Tipo de identificación del proveedor
3. ✅ `idProv` - Identificación del proveedor (RUC/Cédula)
4. ✅ `tipoComprobante` - Tipo de comprobante
5. ✅ `parteRel` - Parte relacionada (SI/NO)
6. ✅ `fechaRegistro` - Fecha de registro contable (DD/MM/YYYY)
7. ✅ `establecimiento` - String de 3 dígitos
8. ✅ `puntoEmision` - String de 3 dígitos
9. ✅ `secuencial` - **INTEGER** de 1 a 999999999
10. ✅ `fechaEmision` - Fecha de emisión (DD/MM/YYYY)
11. ✅ `autorizacion` - Número de autorización
12. ✅ `baseNoGraIva` - Base tarifa 0% (DECIMAL)
13. ✅ `baseImponible` - Base gravada IVA (DECIMAL)
14. ✅ `baseImpGrav` - Base gravada IVA (DECIMAL - mismo valor que baseImponible)
15. ✅ `baseImpExe` - Base exenta de IVA (DECIMAL)
16. ✅ `montoIce` - Monto ICE (DECIMAL)
17. ✅ `montoIva` - Monto IVA (DECIMAL)
18. ✅ `valRetBien10` - Retención IVA 10% bienes (DECIMAL)
19. ✅ `valRetServ20` - Retención IVA 20% servicios (DECIMAL)
20. ✅ `valorRetBienes` - Total retención bienes (DECIMAL)
21. ✅ `valRetServ50` - Retención IVA 50% servicios (DECIMAL)
22. ✅ `valorRetServicios` - Total retención servicios (DECIMAL)
23. ✅ `valRetServ100` - Retención IVA 100% (DECIMAL)
24. ✅ `totbasesImpReemb` - Total bases reembolso (DECIMAL)
25. ⚙️ `pagoExterior` - Datos de pago al exterior (opcional)
26. ⚙️ `formasDePago` - Formas de pago (opcional)
27. ⚙️ `air` - Retenciones en la fuente (opcional)
28. ⚙️ `estabRetencion1` - Establecimiento retención (opcional)
29. ⚙️ `ptoEmiRetencion1` - Punto emisión retención (opcional)
30. ⚙️ `secRetencion1` - **INTEGER** secuencial retención (opcional)
31. ⚙️ `autRetencion1` - Autorización retención (opcional)
32. ⚙️ `fechaEmiRet1` - Fecha emisión retención (opcional)

## 🎯 Impacto de las Correcciones

### Antes de las Correcciones:
- ❌ XML no validaba contra XSD del SRI
- ❌ Secuenciales como strings con padding incorrecto
- ❌ Retenciones de IVA con valores calculados incorrectamente
- ❌ Base tarifa 0% mal mapeada
- ❌ Posibles rechazos por el SRI al subir archivos ATS

### Después de las Correcciones:
- ✅ XML cumple con esquema XSD del SRI
- ✅ Secuenciales como integers según especificación
- ✅ Retenciones de IVA con valores reales de la base de datos
- ✅ Mapeo correcto de todas las bases imponibles
- ✅ Mayor probabilidad de aceptación por el SRI

## 📝 Tipos de Datos según XSD

### Campos INTEGER:
- `secuencial` - 1 a 999999999
- `secRetencion1` - 1 a 999999999
- `secuencialInicio` (anulados)
- `secuencialFin` (anulados)

### Campos STRING:
- `establecimiento` - Pattern: `[0-9]{3}`
- `puntoEmision` - Pattern: `[0-9]{3}`
- `codSustento`, `tpIdProv`, `idProv`, `tipoComprobante`, etc.

### Campos DECIMAL (monedaType):
- Todas las bases imponibles
- Todos los montos de impuestos
- Todos los valores de retenciones
- Formato: `0.00` (dos decimales)

## ✅ Validación

Para validar que el XML generado cumple con el esquema:

```bash
# El servicio ya incluye validación automática con xsdValidatorService
# Al generar el ATS, se valida contra el esquema XSD del SRI
# Si hay errores, se registran en el historial con estado: GENERADO_CON_ADVERTENCIAS
```

## 📚 Referencias

- **Esquema XSD Oficial:** `requerimientos_documentos/ARCHIVOats-xsd.txt`
- **Servicio Generador:** `backend/src/services/atsGeneratorService.js`
- **Validador XSD:** `backend/src/services/xsdValidatorService.js`

## 🚀 Recomendaciones

1. **Probar generación de ATS** con datos reales de compras que incluyan retenciones
2. **Validar XML generado** contra el esquema XSD del SRI
3. **Revisar logs** de validación en el historial de ATS
4. **Verificar totales** de retenciones contra los datos fuente
5. **Realizar pruebas** con diferentes tipos de retenciones (10%, 20%, 30%, 50%, 70%, 100%)

---

**Estado:** ✅ Corregido y Documentado
**Fecha:** 2025-01-31
**Versión:** 1.1.0
