# Flujo de Importación y Edición de Compras con Retenciones

## Descripción General

El sistema permite importar compras desde XML de facturas electrónicas del SRI y posteriormente completarlas con información de retenciones, ya sea manualmente o importando XML de retenciones electrónicas.

## Flujos Disponibles

### Flujo 1: Importar Factura → Agregar Retenciones Manualmente

Este flujo permite importar una factura desde XML y luego agregar las retenciones de forma manual.

#### Paso 1: Importar Factura desde XML

```bash
POST /api/xml/importar-factura
Content-Type: multipart/form-data
Authorization: Bearer {token}

FormData:
  - xmlFile: <archivo XML de factura electrónica>
  - codigo_sustento: "01" (opcional, default: "01")
  - tipo_proveedor: "02" (opcional, default: "02")
```

**Response:**
```json
{
  "mensaje": "Factura importada exitosamente desde XML",
  "data": {
    "id": 1,
    "periodo": "01/2025",
    "identificacion_proveedor": "1234567890001",
    "razon_social_proveedor": "EMPRESA PROVEEDORA S.A.",
    "total_compra": 1150.00,
    "estado": "BORRADOR",
    "retenciones": [],
    ...
  }
}
```

#### Paso 2: Agregar Retenciones Manualmente

```bash
PATCH /api/compras/{id}/retenciones
Content-Type: application/json
Authorization: Bearer {token}

{
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
      "codigo_retencion": "30",
      "base_imponible": 150.00,
      "porcentaje_retencion": 30.00,
      "valor_retenido": 45.00,
      "observaciones": "Retención IVA 30%"
    }
  ]
}
```

**Response:**
```json
{
  "mensaje": "Retenciones agregadas exitosamente a la compra",
  "data": {
    "id": 1,
    "valor_retencion_iva": 45.00,
    "valor_retencion_renta": 10.00,
    "retenciones": [
      {
        "id": 1,
        "tipo_impuesto": "RENTA",
        "codigo_retencion": "303",
        "valor_retenido": 10.00,
        ...
      },
      {
        "id": 2,
        "tipo_impuesto": "IVA",
        "codigo_retencion": "30",
        "valor_retenido": 45.00,
        ...
      }
    ],
    ...
  }
}
```

---

### Flujo 2: Importar Factura → Importar Retenciones desde XML

Este flujo permite importar tanto la factura como las retenciones desde archivos XML.

#### Paso 1: Importar Factura desde XML

```bash
POST /api/xml/importar-factura
Content-Type: multipart/form-data
Authorization: Bearer {token}

FormData:
  - xmlFile: <archivo XML de factura electrónica>
```

La respuesta incluirá el ID de la compra creada (ejemplo: `id: 1`).

#### Paso 2: Previsualizar Retenciones desde XML (opcional)

```bash
POST /api/xml/previsualizar
Content-Type: multipart/form-data
Authorization: Bearer {token}

FormData:
  - xmlFile: <archivo XML de retención electrónica>
```

**Response:**
```json
{
  "mensaje": "XML procesado exitosamente",
  "tipo": "RETENCION",
  "data": [
    {
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000456",
      "tipo_impuesto": "RENTA",
      "codigo_retencion": "303",
      "base_imponible": 1000.00,
      "porcentaje_retencion": 1.00,
      "valor_retenido": 10.00,
      ...
    },
    {
      "tipo_impuesto": "IVA",
      "codigo_retencion": "30",
      ...
    }
  ]
}
```

#### Paso 3: Importar y Asociar Retenciones a la Compra

```bash
POST /api/xml/importar-retencion
Content-Type: multipart/form-data
Authorization: Bearer {token}

FormData:
  - xmlFile: <archivo XML de retención electrónica>
  - compra_id: 1
```

**Response:**
```json
{
  "mensaje": "Retenciones importadas y asociadas a la compra exitosamente",
  "data": {
    "compra": {
      "id": 1,
      "valor_retencion_iva": 45.00,
      "valor_retencion_renta": 10.00,
      "retenciones": [
        {
          "id": 1,
          "tipo_impuesto": "RENTA",
          ...
        },
        {
          "id": 2,
          "tipo_impuesto": "IVA",
          ...
        }
      ],
      ...
    },
    "retenciones_importadas": 2
  }
}
```

---

### Flujo 3: Editar Compra Existente (Importada o Manual)

Cualquier compra puede editarse, incluyendo las importadas desde XML, siempre que no esté en estado `INCLUIDO_ATS`.

#### Actualizar Datos de Compra

```bash
PUT /api/compras/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "observaciones": "Factura revisada y verificada",
  "codigo_sustento": "02"
}
```

#### Actualizar Datos de Compra Y Retenciones

```bash
PUT /api/compras/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "observaciones": "Factura con retenciones actualizadas",
  "retenciones": [
    {
      "fecha_emision": "2025-01-15",
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000789",
      "numero_autorizacion": "1111111111111111111111111111111111111111111111111",
      "tipo_impuesto": "RENTA",
      "codigo_retencion": "332",
      "base_imponible": 500.00,
      "porcentaje_retencion": 2.00,
      "valor_retenido": 10.00
    }
  ]
}
```

**Nota:** Al usar PUT con `retenciones`, se REEMPLAZARÁN todas las retenciones existentes por las nuevas.

#### Solo Actualizar Retenciones (sin modificar la compra)

```bash
PATCH /api/compras/{id}/retenciones
Content-Type: application/json
Authorization: Bearer {token}

{
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
    }
  ]
}
```

---

### Flujo 4: Crear Compra Completa (Manual con Retenciones)

También es posible crear una compra con retenciones desde cero, sin importar XML.

```bash
POST /api/compras
Content-Type: application/json
Authorization: Bearer {token}

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
}
```

---

## Características Importantes

### 1. **Transaccionalidad**
- Todas las operaciones de crear/actualizar compras con retenciones se ejecutan en transacciones
- Si ocurre un error, toda la operación se revierte
- No se pueden quedar compras sin retenciones a medias

### 2. **Cálculo Automático de Totales**
- Los campos `valor_retencion_iva` y `valor_retencion_renta` se calculan automáticamente
- Se suman todos los valores retenidos según el tipo de impuesto
- No es necesario enviar estos totales manualmente

### 3. **Múltiples Retenciones de IR**
- Se pueden registrar múltiples retenciones de Impuesto a la Renta con diferentes códigos
- Por ejemplo: código 303 (1%) + código 332 (2%) en la misma compra
- Cada retención puede tener diferente base imponible

### 4. **Validaciones**
- Todos los campos requeridos se validan antes de guardar
- Los porcentajes deben estar entre 0 y 100
- Los valores monetarios no pueden ser negativos
- Los formatos de establecimiento, punto de emisión y secuencial se validan

### 5. **Estados de Compra**
- `BORRADOR`: Compra recién creada o importada, editable
- `VALIDADO`: Compra validada, aún editable
- `INCLUIDO_ATS`: Incluida en ATS generado, **NO EDITABLE**
- `ANULADO`: Compra anulada

### 6. **Archivos XML**
- Los archivos XML importados se guardan en `uploads/xml/`
- La ruta se almacena en el campo `archivo_xml` de la compra/retención
- Los archivos temporales se eliminan en caso de error

---

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/compras` | Crear compra (con o sin retenciones) |
| `GET` | `/api/compras` | Listar compras |
| `GET` | `/api/compras/:id` | Obtener compra por ID (incluye retenciones) |
| `PUT` | `/api/compras/:id` | Actualizar compra (puede incluir retenciones) |
| `PATCH` | `/api/compras/:id/retenciones` | **Agregar/actualizar solo retenciones** |
| `DELETE` | `/api/compras/:id` | Anular compra |
| `PATCH` | `/api/compras/:id/validar` | Validar compra |
| `POST` | `/api/xml/importar-factura` | Importar factura desde XML |
| `POST` | `/api/xml/importar-retencion` | Importar retenciones desde XML |
| `POST` | `/api/xml/previsualizar` | Previsualizar XML sin guardar |

---

## Ejemplos de Uso Práctico

### Caso 1: Usuario tiene factura física y retención física

1. Registrar compra manualmente (POST `/api/compras`) con todos los datos de factura y retención

### Caso 2: Usuario tiene factura XML pero no tiene retención aún

1. Importar factura XML (POST `/api/xml/importar-factura`)
2. Esperar a recibir la retención
3. Agregar retención manualmente (PATCH `/api/compras/:id/retenciones`)

### Caso 3: Usuario tiene factura XML y retención XML

**Opción A:**
1. Importar factura XML (POST `/api/xml/importar-factura`)
2. Importar retención XML asociándola (POST `/api/xml/importar-retencion` con `compra_id`)

**Opción B:**
1. Previsualizar factura (POST `/api/xml/previsualizar`)
2. Importar factura (POST `/api/xml/importar-factura`)
3. Previsualizar retención (POST `/api/xml/previsualizar`)
4. Importar retención (POST `/api/xml/importar-retencion` con `compra_id`)

### Caso 4: Usuario importó factura pero se equivocó en datos

1. Obtener compra (GET `/api/compras/:id`)
2. Editar compra (PUT `/api/compras/:id`) corrigiendo los datos

### Caso 5: Usuario importó factura y retención pero necesita cambiar retención

1. Actualizar solo retenciones (PATCH `/api/compras/:id/retenciones`) con los nuevos datos

---

## Notas de Seguridad y Permisos

- **ADMINISTRADOR_GENERAL**: Acceso completo
- **ADMINISTRADOR_EMPRESA**: Acceso completo a su empresa
- **CONTADOR**: Puede crear, editar, validar e importar
- **OPERADOR**: Puede crear, editar e importar (no puede validar ni eliminar)

---

## Manejo de Errores Comunes

### Error: "No se puede modificar una compra ya incluida en el ATS"
**Solución:** La compra ya fue incluida en un ATS generado. No se puede editar.

### Error: "Compra no encontrada"
**Solución:** Verificar el ID de la compra y que pertenezca a la empresa del usuario autenticado.

### Error: "El XML no corresponde a una factura/retención electrónica válida"
**Solución:** Verificar que el archivo XML sea del tipo correcto (factura o retención).

### Error: "La fecha de emisión de la retención es requerida"
**Solución:** Incluir todos los campos requeridos al agregar retenciones manualmente.

### Error: "El total de la compra no cuadra"
**Solución:** Verificar que la suma de bases imponibles + IVA + ICE coincida con el total de compra (±0.50 de tolerancia).
