# API de Retenciones - Documentación

Documentación completa de los endpoints del módulo de retenciones del sistema ATS.

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

## Descripción General

El módulo de retenciones permite gestionar las retenciones fiscales (IVA y Renta) que las empresas realizan a sus proveedores. Cada retención puede estar asociada opcionalmente a una compra.

**Base URL:** `http://localhost:3000/api/retenciones`

**Autenticación:** Todas las rutas requieren autenticación JWT mediante header `Authorization: Bearer {token}`

**Permisos por operación:**
- **Consultar:** Todos los roles autenticados
- **Crear/Actualizar:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA, CONTADOR, OPERADOR
- **Eliminar/Validar:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA, CONTADOR

## Endpoints Disponibles

### 1. Listar Retenciones

```http
GET /api/retenciones
```

**Descripción:** Obtiene todas las retenciones de la empresa del usuario autenticado con filtros opcionales.

**Query Parameters:**
- `periodo` (opcional): Periodo en formato MM/AAAA
- `estado` (opcional): BORRADOR | VALIDADO | INCLUIDO_ATS | ANULADO
- `tipo_impuesto` (opcional): IVA | RENTA
- `identificacion_proveedor` (opcional): RUC o cédula del proveedor
- `compra_id` (opcional): ID de la compra asociada
- `fecha_desde` (opcional): Fecha inicio en formato ISO8601
- `fecha_hasta` (opcional): Fecha fin en formato ISO8601
- `pagina` (opcional, default: 1): Número de página
- `limite` (opcional, default: 20): Registros por página

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Retenciones obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "periodo": "10/2025",
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000123",
      "numero_autorizacion": "1234567890",
      "fecha_emision": "2025-10-15",
      "tipo_identificacion": "04",
      "identificacion_proveedor": "1234567890001",
      "razon_social_proveedor": "Proveedor ABC S.A.",
      "tipo_impuesto": "IVA",
      "codigo_retencion": "1",
      "base_imponible": 1000.00,
      "porcentaje_retencion": 30.00,
      "valor_retenido": 300.00,
      "compra_id": 5,
      "estado": "VALIDADO",
      "usuario": {
        "id": 2,
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "compra": {
        "id": 5,
        "numero_factura": "001-001-000000045",
        "total_compra": 1120.00
      }
    }
  ],
  "paginacion": {
    "total": 15,
    "pagina": 1,
    "limite": 20,
    "total_paginas": 1
  }
}
```

---

### 2. Obtener Retención por ID

```http
GET /api/retenciones/:id
```

**Descripción:** Obtiene los detalles completos de una retención específica.

**Parámetros de ruta:**
- `id` (requerido): ID de la retención

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Retención obtenida exitosamente",
  "data": {
    "id": 1,
    "periodo": "10/2025",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000123",
    "numero_autorizacion": "1234567890",
    "fecha_emision": "2025-10-15",
    "tipo_identificacion": "04",
    "identificacion_proveedor": "1234567890001",
    "razon_social_proveedor": "Proveedor ABC S.A.",
    "tipo_impuesto": "IVA",
    "codigo_retencion": "1",
    "base_imponible": 1000.00,
    "porcentaje_retencion": 30.00,
    "valor_retenido": 300.00,
    "numero_comprobante_sustento": "001-001-000000045",
    "fecha_emision_comprobante_sustento": "2025-10-14",
    "compra_id": 5,
    "estado": "VALIDADO",
    "observaciones": "Retención por servicios profesionales",
    "created_at": "2025-10-15T10:30:00.000Z",
    "updated_at": "2025-10-15T10:30:00.000Z",
    "usuario": {
      "id": 2,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@empresa.com"
    },
    "compra": {
      "id": 5,
      "numero_factura": "001-001-000000045",
      "total_compra": 1120.00,
      "fecha_emision": "2025-10-14",
      "razon_social_proveedor": "Proveedor ABC S.A."
    }
  }
}
```

---

### 3. Crear Retención

```http
POST /api/retenciones
```

**Descripción:** Crea una nueva retención.

**Body (JSON):**
```json
{
  "periodo": "10/2025",
  "establecimiento": "001",
  "punto_emision": "001",
  "secuencial": "000000123",
  "numero_autorizacion": "1234567890",
  "fecha_emision": "2025-10-15",
  "tipo_identificacion": "04",
  "identificacion_proveedor": "1234567890001",
  "razon_social_proveedor": "Proveedor ABC S.A.",
  "tipo_impuesto": "IVA",
  "codigo_retencion": "1",
  "base_imponible": 1000.00,
  "porcentaje_retencion": 30.00,
  "valor_retenido": 300.00,
  "compra_id": 5,
  "numero_comprobante_sustento": "001-001-000000045",
  "fecha_emision_comprobante_sustento": "2025-10-14",
  "estado": "BORRADOR",
  "observaciones": "Retención por servicios profesionales"
}
```

**Campos obligatorios:**
- `periodo`: Formato MM/AAAA
- `establecimiento`: 3 dígitos numéricos
- `punto_emision`: 3 dígitos numéricos
- `secuencial`: Hasta 9 dígitos numéricos
- `numero_autorizacion`: 10-49 caracteres
- `fecha_emision`: Formato ISO8601 (YYYY-MM-DD)
- `tipo_identificacion`: 2 caracteres
- `identificacion_proveedor`: 10-20 caracteres
- `razon_social_proveedor`: 1-300 caracteres
- `tipo_impuesto`: "IVA" o "RENTA"
- `codigo_retencion`: 1-5 caracteres
- `base_imponible`: Número >= 0
- `porcentaje_retencion`: Número 0-100
- `valor_retenido`: Número >= 0

**Campos opcionales:**
- `compra_id`: ID de la compra asociada
- `numero_comprobante_sustento`: Hasta 17 caracteres
- `fecha_emision_comprobante_sustento`: Formato ISO8601
- `estado`: Por defecto "BORRADOR"
- `observaciones`: Texto libre

**Validaciones automáticas:**
- El `valor_retenido` debe corresponder al cálculo: `(base_imponible * porcentaje_retencion) / 100`
- Se permite diferencia de ±0.02 por redondeo
- Si se proporciona `compra_id`, la compra debe existir y pertenecer a la empresa

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Retención creada exitosamente",
  "data": {
    "id": 1,
    "periodo": "10/2025",
    // ... resto de campos
  }
}
```

---

### 4. Actualizar Retención

```http
PUT /api/retenciones/:id
```

**Descripción:** Actualiza una retención existente.

**Parámetros de ruta:**
- `id` (requerido): ID de la retención

**Body (JSON):** Todos los campos son opcionales
```json
{
  "establecimiento": "002",
  "punto_emision": "001",
  "secuencial": "000000124",
  "observaciones": "Retención actualizada"
}
```

**Restricciones:**
- No se puede actualizar una retención con estado `INCLUIDO_ATS`
- Si se modifican `base_imponible`, `porcentaje_retencion` o `valor_retenido`, se revalida el cálculo
- Si la retención está asociada a una compra, se actualizan automáticamente los totales de la compra

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Retención actualizada exitosamente",
  "data": {
    // Retención actualizada
  }
}
```

---

### 5. Eliminar (Anular) Retención

```http
DELETE /api/retenciones/:id
```

**Descripción:** Anula una retención (cambia estado a ANULADO). No elimina físicamente el registro.

**Parámetros de ruta:**
- `id` (requerido): ID de la retención

**Restricciones:**
- No se puede anular una retención con estado `INCLUIDO_ATS`
- Si está asociada a una compra, se actualizan automáticamente los totales de la compra

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Retención anulada correctamente"
}
```

---

### 6. Validar Retención

```http
PATCH /api/retenciones/:id/validar
```

**Descripción:** Valida una retención (cambia estado a VALIDADO).

**Parámetros de ruta:**
- `id` (requerido): ID de la retención

**Validaciones:**
- Verifica que el cálculo del valor retenido sea correcto
- No se puede validar una retención anulada

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Retención validada exitosamente",
  "data": {
    "id": 1,
    "estado": "VALIDADO",
    // ... resto de campos
  }
}
```

---

### 7. Validar Retenciones Masivamente

```http
POST /api/retenciones/validar-masivo
```

**Descripción:** Valida múltiples retenciones en estado BORRADOR que cumplan con los filtros especificados.

**Query Parameters (todos opcionales):**
- `periodo`: MM/AAAA
- `identificacion_proveedor`: RUC o cédula
- `tipo_impuesto`: IVA | RENTA
- `fecha_desde`: ISO8601
- `fecha_hasta`: ISO8601

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Validación masiva completada. 8 de 10 retenciones validadas exitosamente",
  "data": {
    "total": 10,
    "validadas": 8,
    "errores": [
      {
        "id": 3,
        "proveedor": "Proveedor XYZ S.A.",
        "fecha": "2025-10-10",
        "numero": "001-001-000000100",
        "error": "El valor retenido no corresponde al cálculo. Esperado: 150.00, Registrado: 149.00"
      },
      {
        "id": 7,
        "proveedor": "Servicios ABC",
        "fecha": "2025-10-12",
        "numero": "001-002-000000050",
        "error": "La base imponible debe ser mayor o igual a 0"
      }
    ]
  }
}
```

---

### 8. Obtener Retenciones por Compra

```http
GET /api/retenciones/compra/:compraId
```

**Descripción:** Obtiene todas las retenciones asociadas a una compra específica.

**Parámetros de ruta:**
- `compraId` (requerido): ID de la compra

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Retenciones de la compra obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "tipo_impuesto": "IVA",
      "codigo_retencion": "1",
      "valor_retenido": 300.00,
      // ... resto de campos
    },
    {
      "id": 2,
      "tipo_impuesto": "RENTA",
      "codigo_retencion": "303",
      "valor_retenido": 20.00,
      // ... resto de campos
    }
  ]
}
```

---

### 9. Obtener Resumen por Período

```http
GET /api/retenciones/resumen?periodo=MM/AAAA
```

**Descripción:** Obtiene un resumen consolidado de retenciones para un período específico.

**Query Parameters:**
- `periodo` (requerido): Formato MM/AAAA

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Resumen de retenciones obtenido exitosamente",
  "data": {
    "total_retenciones": 25,
    "retenciones_iva": 15,
    "retenciones_renta": 10,
    "total_valor_retenido_iva": 4500.00,
    "total_valor_retenido_renta": 1200.00,
    "total_general": 5700.00,
    "por_codigo": [
      {
        "codigo": "1",
        "tipo": "IVA",
        "cantidad": 10,
        "valor_total": 3000.00
      },
      {
        "codigo": "2",
        "tipo": "IVA",
        "cantidad": 5,
        "valor_total": 1500.00
      },
      {
        "codigo": "303",
        "tipo": "RENTA",
        "cantidad": 8,
        "valor_total": 1000.00
      },
      {
        "codigo": "304",
        "tipo": "RENTA",
        "cantidad": 2,
        "valor_total": 200.00
      }
    ]
  }
}
```

---

### 10. Buscar por Proveedor

```http
GET /api/retenciones/proveedor?identificacion_proveedor=RUC&periodo=MM/AAAA
```

**Descripción:** Busca todas las retenciones de un proveedor específico.

**Query Parameters:**
- `identificacion_proveedor` (requerido): RUC o cédula del proveedor
- `periodo` (opcional): Formato MM/AAAA para filtrar por período

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Retenciones del proveedor obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "periodo": "10/2025",
      "fecha_emision": "2025-10-15",
      "tipo_impuesto": "IVA",
      "valor_retenido": 300.00,
      "compra": {
        "id": 5,
        "numero_factura": "001-001-000000045",
        "total_compra": 1120.00
      },
      // ... resto de campos
    }
  ]
}
```

---

## Modelos de Datos

### Modelo de Retención

```typescript
{
  id: number;                                // ID único (auto-generado)
  empresa_id: number;                        // ID de la empresa (auto-asignado)
  usuario_id: number;                        // ID del usuario que creó (auto-asignado)
  compra_id?: number;                        // ID de la compra asociada (opcional)
  periodo: string;                           // Formato: MM/AAAA
  establecimiento: string;                   // 3 dígitos numéricos
  punto_emision: string;                     // 3 dígitos numéricos
  secuencial: string;                        // Hasta 9 dígitos numéricos
  numero_autorizacion: string;               // 10-49 caracteres
  fecha_emision: string;                     // ISO8601 (YYYY-MM-DD)
  tipo_identificacion: string;               // 2 caracteres
  identificacion_proveedor: string;          // 10-20 caracteres
  razon_social_proveedor: string;            // 1-300 caracteres
  tipo_impuesto: "IVA" | "RENTA";           // Tipo de retención
  codigo_retencion: string;                  // 1-5 caracteres
  base_imponible: number;                    // Decimal(12,2)
  porcentaje_retencion: number;              // Decimal(5,2)
  valor_retenido: number;                    // Decimal(12,2)
  numero_comprobante_sustento?: string;      // Hasta 17 caracteres
  fecha_emision_comprobante_sustento?: string; // ISO8601
  archivo_xml?: string;                      // Ruta o contenido del XML
  estado: "BORRADOR" | "VALIDADO" | "INCLUIDO_ATS" | "ANULADO";
  observaciones?: string;                    // Texto libre
  created_at: string;                        // Timestamp de creación
  updated_at: string;                        // Timestamp de última actualización
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear retención de IVA asociada a una compra

```bash
curl -X POST http://localhost:3000/api/retenciones \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "periodo": "10/2025",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000123",
    "numero_autorizacion": "1234567890",
    "fecha_emision": "2025-10-15",
    "tipo_identificacion": "04",
    "identificacion_proveedor": "1234567890001",
    "razon_social_proveedor": "Proveedor ABC S.A.",
    "tipo_impuesto": "IVA",
    "codigo_retencion": "1",
    "base_imponible": 1000.00,
    "porcentaje_retencion": 30.00,
    "valor_retenido": 300.00,
    "compra_id": 5
  }'
```

### Ejemplo 2: Listar retenciones de un período específico con filtros

```bash
curl -X GET "http://localhost:3000/api/retenciones?periodo=10/2025&estado=VALIDADO&tipo_impuesto=IVA&pagina=1&limite=20" \
  -H "Authorization: Bearer {token}"
```

### Ejemplo 3: Validar retenciones masivamente de un mes

```bash
curl -X POST "http://localhost:3000/api/retenciones/validar-masivo?periodo=10/2025" \
  -H "Authorization: Bearer {token}"
```

### Ejemplo 4: Obtener resumen mensual

```bash
curl -X GET "http://localhost:3000/api/retenciones/resumen?periodo=10/2025" \
  -H "Authorization: Bearer {token}"
```

---

## Códigos de Error

### Errores Comunes

**400 Bad Request:**
- Validación de datos fallida
- Cálculo de retención incorrecto
- Estado no permite la operación

```json
{
  "error": "Errores de validación",
  "detalles": [
    {
      "campo": "valor_retenido",
      "mensaje": "El valor retenido debe ser un número mayor o igual a 0",
      "valor": -100
    }
  ]
}
```

**401 Unauthorized:**
- Token JWT no proporcionado o inválido

```json
{
  "error": "Token de autenticación no proporcionado"
}
```

**403 Forbidden:**
- Usuario no tiene permisos para la operación

```json
{
  "error": "No tiene permisos para realizar esta acción"
}
```

**404 Not Found:**
- Retención no encontrada
- Compra asociada no encontrada

```json
{
  "error": "Retención no encontrada"
}
```

**500 Internal Server Error:**
- Error del servidor

```json
{
  "error": "Error interno del servidor",
  "mensaje": "Descripción del error"
}
```

---

## Notas Importantes

1. **Multi-tenancy:** Todas las retenciones están aisladas por empresa. Un usuario solo puede ver/modificar retenciones de su empresa.

2. **Validación automática:** El sistema valida automáticamente que el valor retenido corresponda al cálculo: `(base_imponible * porcentaje_retencion) / 100`

3. **Integración con compras:** Al crear, actualizar o anular una retención asociada a una compra, los totales de retención de la compra se actualizan automáticamente.

4. **Estados de retención:**
   - `BORRADOR`: Retención creada pero no validada
   - `VALIDADO`: Retención validada y lista para incluir en ATS
   - `INCLUIDO_ATS`: Retención incluida en un archivo ATS generado (no modificable)
   - `ANULADO`: Retención anulada (no se cuenta en reportes)

5. **Auditoría:** Todas las operaciones sobre retenciones se registran en la tabla `log_actividad` con información del usuario, timestamp y detalles de la operación.

6. **Paginación:** Por defecto, los listados muestran 20 registros por página. Se puede ajustar con el parámetro `limite` (máximo 100).
