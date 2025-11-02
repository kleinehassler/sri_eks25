# Ejemplo de Registro de Compra con Retenciones

## Descripción

El sistema ha sido refactorizado para permitir el registro de compras junto con sus retenciones asociadas en una sola operación transaccional.

## Campos de Retención

Cada retención debe incluir los siguientes campos:

- **fecha_emision**: Fecha de emisión de la retención (formato ISO8601: YYYY-MM-DD)
- **establecimiento**: Establecimiento de retención (3 dígitos, ej: "001")
- **punto_emision**: Punto de emisión de retención (3 dígitos, ej: "001")
- **secuencial**: Número secuencial de la retención (hasta 9 dígitos)
- **numero_autorizacion**: Número de autorización de la retención (10-49 caracteres)
- **tipo_impuesto**: Tipo de impuesto ("IVA" o "RENTA")
- **codigo_retencion**: Código de retención según catálogo SRI
- **base_imponible**: Base imponible para el cálculo de la retención
- **porcentaje_retencion**: Porcentaje de retención aplicado (0-100)
- **valor_retenido**: Valor retenido calculado
- **observaciones** (opcional): Observaciones adicionales

## Ejemplo de Request Body (POST /api/compras)

```json
{
  "periodo": "01/2025",
  "codigo_sustento": "01",
  "tipo_comprobante": "01",
  "tipo_proveedor": "02",
  "tipo_identificacion": "04",
  "identificacion_proveedor": "1234567890001",
  "razon_social_proveedor": "EMPRESA PROVEEDORA S.A.",
  "fecha_emision": "2025-01-15",
  "fecha_registro": "2025-01-15",
  "establecimiento": "001",
  "punto_emision": "001",
  "secuencial": "000000123",
  "numero_autorizacion": "1234567890123456789012345678901234567890123456789",
  "base_imponible_0": 0,
  "base_imponible_iva": 1000.00,
  "base_imponible_no_objeto_iva": 0,
  "base_imponible_exento_iva": 0,
  "monto_iva": 150.00,
  "monto_ice": 0,
  "total_compra": 1150.00,
  "forma_pago": "01",
  "estado": "BORRADOR",
  "retenciones": [
    {
      "fecha_emision": "2025-01-15",
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000456",
      "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
      "tipo_impuesto": "RENTA",
      "codigo_retencion": "303",
      "base_imponible": 1000.00,
      "porcentaje_retencion": 1.00,
      "valor_retenido": 10.00,
      "observaciones": "Retención en la fuente 1%"
    },
    {
      "fecha_emision": "2025-01-15",
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000456",
      "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
      "tipo_impuesto": "IVA",
      "codigo_retencion": "10",
      "base_imponible": 150.00,
      "porcentaje_retencion": 30.00,
      "valor_retenido": 45.00,
      "observaciones": "Retención IVA 30%"
    },
    {
      "fecha_emision": "2025-01-15",
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000456",
      "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
      "tipo_impuesto": "RENTA",
      "codigo_retencion": "332",
      "base_imponible": 500.00,
      "porcentaje_retencion": 2.00,
      "valor_retenido": 10.00,
      "observaciones": "Retención en la fuente 2% - Otros servicios"
    }
  ]
}
```

## Ejemplo de Response

```json
{
  "mensaje": "Compra creada exitosamente",
  "data": {
    "id": 1,
    "empresa_id": 1,
    "usuario_id": 1,
    "periodo": "01/2025",
    "codigo_sustento": "01",
    "tipo_comprobante": "01",
    "tipo_proveedor": "02",
    "tipo_identificacion": "04",
    "identificacion_proveedor": "1234567890001",
    "razon_social_proveedor": "EMPRESA PROVEEDORA S.A.",
    "fecha_emision": "2025-01-15",
    "fecha_registro": "2025-01-15",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000123",
    "numero_autorizacion": "1234567890123456789012345678901234567890123456789",
    "base_imponible_0": 0.00,
    "base_imponible_iva": 1000.00,
    "base_imponible_no_objeto_iva": 0.00,
    "base_imponible_exento_iva": 0.00,
    "monto_iva": 150.00,
    "monto_ice": 0.00,
    "valor_retencion_iva": 45.00,
    "valor_retencion_renta": 20.00,
    "total_compra": 1150.00,
    "forma_pago": "01",
    "estado": "BORRADOR",
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-15T10:00:00.000Z",
    "retenciones": [
      {
        "id": 1,
        "empresa_id": 1,
        "usuario_id": 1,
        "compra_id": 1,
        "periodo": "01/2025",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000456",
        "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
        "fecha_emision": "2025-01-15",
        "tipo_identificacion": "04",
        "identificacion_proveedor": "1234567890001",
        "razon_social_proveedor": "EMPRESA PROVEEDORA S.A.",
        "tipo_impuesto": "RENTA",
        "codigo_retencion": "303",
        "base_imponible": 1000.00,
        "porcentaje_retencion": 1.00,
        "valor_retenido": 10.00,
        "observaciones": "Retención en la fuente 1%",
        "estado": "BORRADOR",
        "created_at": "2025-01-15T10:00:00.000Z",
        "updated_at": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": 2,
        "empresa_id": 1,
        "usuario_id": 1,
        "compra_id": 1,
        "periodo": "01/2025",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000456",
        "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
        "fecha_emision": "2025-01-15",
        "tipo_identificacion": "04",
        "identificacion_proveedor": "1234567890001",
        "razon_social_proveedor": "EMPRESA PROVEEDORA S.A.",
        "tipo_impuesto": "IVA",
        "codigo_retencion": "10",
        "base_imponible": 150.00,
        "porcentaje_retencion": 30.00,
        "valor_retenido": 45.00,
        "observaciones": "Retención IVA 30%",
        "estado": "BORRADOR",
        "created_at": "2025-01-15T10:00:00.000Z",
        "updated_at": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": 3,
        "empresa_id": 1,
        "usuario_id": 1,
        "compra_id": 1,
        "periodo": "01/2025",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000456",
        "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
        "fecha_emision": "2025-01-15",
        "tipo_identificacion": "04",
        "identificacion_proveedor": "1234567890001",
        "razon_social_proveedor": "EMPRESA PROVEEDORA S.A.",
        "tipo_impuesto": "RENTA",
        "codigo_retencion": "332",
        "base_imponible": 500.00,
        "porcentaje_retencion": 2.00,
        "valor_retenido": 10.00,
        "observaciones": "Retención en la fuente 2% - Otros servicios",
        "estado": "BORRADOR",
        "created_at": "2025-01-15T10:00:00.000Z",
        "updated_at": "2025-01-15T10:00:00.000Z"
      }
    ],
    "usuario": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com"
    }
  }
}
```

## Notas Importantes

1. **Transaccionalidad**: La creación de la compra y sus retenciones se realiza en una transacción única. Si ocurre algún error, toda la operación se revierte.

2. **Cálculo Automático de Totales**: Los campos `valor_retencion_iva` y `valor_retencion_renta` de la compra se calculan automáticamente sumando los valores retenidos de las retenciones según su tipo.

3. **Retenciones Opcionales**: El array de retenciones es opcional. Si no se envía o está vacío, la compra se crea sin retenciones.

4. **Múltiples Retenciones de IR**: Se pueden registrar múltiples retenciones de Impuesto a la Renta con diferentes códigos en la misma compra.

5. **Validaciones**:
   - Cada retención debe tener todos los campos requeridos
   - Los porcentajes deben estar entre 0 y 100
   - Los valores monetarios deben ser mayores o iguales a 0
   - Los campos numéricos de establecimiento, punto de emisión y secuencial deben cumplir con los formatos especificados

6. **Actualización**: Al actualizar una compra (PUT /api/compras/:id), si se envía el array de `retenciones`, se eliminarán todas las retenciones existentes y se crearán las nuevas. Si no se desea modificar las retenciones, simplemente no incluir el campo `retenciones` en el request body.

## Códigos de Retención Comunes

### Retención en la Fuente (RENTA)
- **303**: Por servicios predomina el intelecto - 1%
- **304**: Por servicios predomina mano de obra - 2%
- **332**: Otros servicios - 2%
- **340**: Transporte privado de pasajeros - 1%
- **341**: Transporte público de pasajeros - 1%

### Retención de IVA
- **10**: Retención 10%
- **20**: Retención 20%
- **30**: Retención 30%
- **50**: Retención 50%
- **70**: Retención 70%
- **100**: Retención 100%

## Ejemplo con cURL

```bash
curl -X POST http://localhost:3000/api/compras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "periodo": "01/2025",
    "codigo_sustento": "01",
    "tipo_comprobante": "01",
    "tipo_proveedor": "02",
    "tipo_identificacion": "04",
    "identificacion_proveedor": "1234567890001",
    "razon_social_proveedor": "EMPRESA PROVEEDORA S.A.",
    "fecha_emision": "2025-01-15",
    "fecha_registro": "2025-01-15",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000123",
    "numero_autorizacion": "1234567890123456789012345678901234567890123456789",
    "base_imponible_0": 0,
    "base_imponible_iva": 1000.00,
    "monto_iva": 150.00,
    "total_compra": 1150.00,
    "retenciones": [
      {
        "fecha_emision": "2025-01-15",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000456",
        "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
        "tipo_impuesto": "RENTA",
        "codigo_retencion": "303",
        "base_imponible": 1000.00,
        "porcentaje_retencion": 1.00,
        "valor_retenido": 10.00
      },
      {
        "fecha_emision": "2025-01-15",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000456",
        "numero_autorizacion": "9876543210987654321098765432109876543210987654321",
        "tipo_impuesto": "IVA",
        "codigo_retencion": "30",
        "base_imponible": 150.00,
        "porcentaje_retencion": 30.00,
        "valor_retenido": 45.00
      }
    ]
  }'
```
