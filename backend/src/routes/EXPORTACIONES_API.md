# API de Exportaciones - Documentación

Documentación completa de los endpoints del módulo de exportaciones del sistema ATS.

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

## Descripción General

El módulo de exportaciones permite gestionar las operaciones de exportación de las empresas para su inclusión en el Anexo Transaccional Simplificado (ATS). Incluye información sobre clientes extranjeros, países de destino, valores FOB, y otros datos específicos de operaciones de exportación.

**Base URL:** `http://localhost:3000/api/exportaciones`

**Autenticación:** Todas las rutas requieren autenticación JWT mediante header `Authorization: Bearer {token}`

**Permisos por operación:**
- **Consultar:** Todos los roles autenticados
- **Crear/Actualizar:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA, CONTADOR, OPERADOR
- **Eliminar/Validar:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA, CONTADOR

## Endpoints Disponibles

### 1. Listar Exportaciones

```http
GET /api/exportaciones
```

**Descripción:** Obtiene todas las exportaciones de la empresa del usuario autenticado con filtros opcionales.

**Query Parameters:**
- `periodo` (opcional): Periodo en formato MM/AAAA
- `estado` (opcional): BORRADOR | VALIDADO | INCLUIDO_ATS | ANULADO
- `identificacion_cliente` (opcional): Identificación del cliente
- `pais_destino` (opcional): Código país ISO 3166 (3 caracteres)
- `tipo_cliente` (opcional): 01 (Persona Natural) | 02 (Sociedad)
- `anio_exportacion` (opcional): Año de exportación (1900-2100)
- `fecha_desde` (opcional): Fecha inicio en formato ISO8601
- `fecha_hasta` (opcional): Fecha fin en formato ISO8601
- `pagina` (opcional, default: 1): Número de página
- `limite` (opcional, default: 20): Registros por página

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Exportaciones obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "periodo": "10/2025",
      "tipo_comprobante": "18",
      "fecha_emision": "2025-10-20",
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000567",
      "numero_autorizacion": "2025102001234567890",
      "tipo_cliente": "02",
      "tipo_identificacion": "06",
      "identificacion_cliente": "USEXPORT123",
      "razon_social_cliente": "Import Export USA Inc.",
      "pais_destino": "USA",
      "pais_efect_pago": "USA",
      "valor_fob_comprobante": 25000.00,
      "valor_fob_compensacion": 0.00,
      "anio_exportacion": 2025,
      "distrito_exportacion": "001",
      "regimen_exportacion": "40",
      "correo_electronico": "contact@importusa.com",
      "estado": "VALIDADO",
      "usuario": {
        "id": 2,
        "nombre": "María",
        "apellido": "González"
      }
    }
  ],
  "paginacion": {
    "total": 8,
    "pagina": 1,
    "limite": 20,
    "total_paginas": 1
  }
}
```

---

### 2. Obtener Exportación por ID

```http
GET /api/exportaciones/:id
```

**Descripción:** Obtiene los detalles completos de una exportación específica.

**Parámetros de ruta:**
- `id` (requerido): ID de la exportación

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Exportación obtenida exitosamente",
  "data": {
    "id": 1,
    "periodo": "10/2025",
    "tipo_comprobante": "18",
    "fecha_emision": "2025-10-20",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000567",
    "numero_autorizacion": "2025102001234567890",
    "tipo_cliente": "02",
    "tipo_identificacion": "06",
    "identificacion_cliente": "USEXPORT123",
    "razon_social_cliente": "Import Export USA Inc.",
    "pais_destino": "USA",
    "pais_efect_pago": "USA",
    "tipo_regimen_fiscal": "01",
    "pais_regimen_fiscal": "USA",
    "valor_fob_comprobante": 25000.00,
    "valor_fob_compensacion": 0.00,
    "forma_pago": "01",
    "distrito_exportacion": "001",
    "anio_exportacion": 2025,
    "regimen_exportacion": "40",
    "correo_electronico": "contact@importusa.com",
    "estado": "VALIDADO",
    "observaciones": "Exportación de productos agrícolas",
    "created_at": "2025-10-20T14:30:00.000Z",
    "updated_at": "2025-10-20T14:30:00.000Z",
    "usuario": {
      "id": 2,
      "nombre": "María",
      "apellido": "González",
      "email": "maria.gonzalez@empresa.com"
    }
  }
}
```

---

### 3. Crear Exportación

```http
POST /api/exportaciones
```

**Descripción:** Crea una nueva exportación.

**Body (JSON):**
```json
{
  "periodo": "10/2025",
  "tipo_comprobante": "18",
  "fecha_emision": "2025-10-20",
  "establecimiento": "001",
  "punto_emision": "001",
  "secuencial": "000000567",
  "numero_autorizacion": "2025102001234567890",
  "tipo_cliente": "02",
  "tipo_identificacion": "06",
  "identificacion_cliente": "USEXPORT123",
  "razon_social_cliente": "Import Export USA Inc.",
  "pais_destino": "USA",
  "pais_efect_pago": "USA",
  "tipo_regimen_fiscal": "01",
  "pais_regimen_fiscal": "USA",
  "valor_fob_comprobante": 25000.00,
  "valor_fob_compensacion": 0.00,
  "forma_pago": "01",
  "distrito_exportacion": "001",
  "anio_exportacion": 2025,
  "regimen_exportacion": "40",
  "correo_electronico": "contact@importusa.com",
  "estado": "BORRADOR",
  "observaciones": "Exportación de productos agrícolas"
}
```

**Campos obligatorios:**
- `periodo`: Formato MM/AAAA
- `tipo_comprobante`: 2 caracteres
- `fecha_emision`: Formato ISO8601 (YYYY-MM-DD)
- `establecimiento`: 3 dígitos numéricos
- `punto_emision`: 3 dígitos numéricos
- `secuencial`: Hasta 9 dígitos numéricos
- `numero_autorizacion`: 10-49 caracteres
- `tipo_cliente`: "01" (Persona Natural) o "02" (Sociedad)
- `tipo_identificacion`: 2 caracteres
- `identificacion_cliente`: 1-20 caracteres
- `razon_social_cliente`: 1-300 caracteres
- `pais_destino`: 3 caracteres (código ISO 3166)
- `valor_fob_comprobante`: Número >= 0

**Campos opcionales:**
- `pais_efect_pago`: 3 caracteres (código ISO 3166)
- `tipo_regimen_fiscal`: 2 caracteres
- `pais_regimen_fiscal`: 3 caracteres (código ISO 3166)
- `valor_fob_compensacion`: Número >= 0 (default: 0.00)
- `forma_pago`: 2 caracteres
- `distrito_exportacion`: 3 caracteres
- `anio_exportacion`: Número entre 1900 y 2100
- `regimen_exportacion`: 2 caracteres
- `correo_electronico`: Email válido (max 100 caracteres)
- `estado`: Por defecto "BORRADOR"
- `observaciones`: Texto libre

**Validaciones automáticas:**
- El `valor_fob_compensacion` no puede ser mayor que `valor_fob_comprobante`
- Si se proporciona `anio_exportacion`, se valida que sea coherente con `fecha_emision`

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Exportación creada exitosamente",
  "data": {
    "id": 1,
    "periodo": "10/2025",
    // ... resto de campos
  }
}
```

---

### 4. Actualizar Exportación

```http
PUT /api/exportaciones/:id
```

**Descripción:** Actualiza una exportación existente.

**Parámetros de ruta:**
- `id` (requerido): ID de la exportación

**Body (JSON):** Todos los campos son opcionales
```json
{
  "pais_destino": "CAN",
  "valor_fob_comprobante": 30000.00,
  "observaciones": "Exportación modificada - destino cambiado a Canadá"
}
```

**Restricciones:**
- No se puede actualizar una exportación con estado `INCLUIDO_ATS`
- Si se modifican valores FOB, se revalida que compensación ≤ comprobante

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Exportación actualizada exitosamente",
  "data": {
    // Exportación actualizada
  }
}
```

---

### 5. Eliminar (Anular) Exportación

```http
DELETE /api/exportaciones/:id
```

**Descripción:** Anula una exportación (cambia estado a ANULADO). No elimina físicamente el registro.

**Parámetros de ruta:**
- `id` (requerido): ID de la exportación

**Restricciones:**
- No se puede anular una exportación con estado `INCLUIDO_ATS`

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Exportación anulada correctamente"
}
```

---

### 6. Validar Exportación

```http
PATCH /api/exportaciones/:id/validar
```

**Descripción:** Valida una exportación (cambia estado a VALIDADO).

**Parámetros de ruta:**
- `id` (requerido): ID de la exportación

**Validaciones:**
- Verifica que valor FOB compensación ≤ valor FOB comprobante
- No se puede validar una exportación anulada

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Exportación validada exitosamente",
  "data": {
    "id": 1,
    "estado": "VALIDADO",
    // ... resto de campos
  }
}
```

---

### 7. Validar Exportaciones Masivamente

```http
POST /api/exportaciones/validar-masivo
```

**Descripción:** Valida múltiples exportaciones en estado BORRADOR que cumplan con los filtros especificados.

**Query Parameters (todos opcionales):**
- `periodo`: MM/AAAA
- `identificacion_cliente`: Identificación del cliente
- `pais_destino`: Código país ISO 3166
- `fecha_desde`: ISO8601
- `fecha_hasta`: ISO8601

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Validación masiva completada. 7 de 8 exportaciones validadas exitosamente",
  "data": {
    "total": 8,
    "validadas": 7,
    "errores": [
      {
        "id": 5,
        "cliente": "Import XYZ Ltd.",
        "fecha": "2025-10-18",
        "numero": "001-001-000000450",
        "error": "El valor FOB de compensación no puede ser mayor al valor FOB del comprobante"
      }
    ]
  }
}
```

---

### 8. Obtener Resumen por Período

```http
GET /api/exportaciones/resumen?periodo=MM/AAAA
```

**Descripción:** Obtiene un resumen consolidado de exportaciones para un período específico.

**Query Parameters:**
- `periodo` (requerido): Formato MM/AAAA

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Resumen de exportaciones obtenido exitosamente",
  "data": {
    "total_exportaciones": 12,
    "por_tipo_cliente": {
      "persona_natural": 3,
      "sociedad": 9
    },
    "por_pais_destino": [
      {
        "pais_codigo": "USA",
        "cantidad": 5,
        "valor_fob": 125000.00
      },
      {
        "pais_codigo": "CAN",
        "cantidad": 4,
        "valor_fob": 89000.00
      },
      {
        "pais_codigo": "MEX",
        "cantidad": 3,
        "valor_fob": 45000.00
      }
    ],
    "valor_fob_total": 259000.00,
    "valor_fob_compensacion_total": 5000.00,
    "valor_fob_neto": 254000.00
  }
}
```

---

### 9. Obtener Resumen por País

```http
GET /api/exportaciones/resumen-pais?periodo=MM/AAAA
```

**Descripción:** Obtiene un resumen de exportaciones agrupado por país de destino.

**Query Parameters:**
- `periodo` (requerido): Formato MM/AAAA

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Resumen por país obtenido exitosamente",
  "data": [
    {
      "pais_destino": "USA",
      "cantidad": 5,
      "valor_fob_total": 125000.00,
      "valor_fob_compensacion_total": 2000.00,
      "valor_fob_neto": 123000.00
    },
    {
      "pais_destino": "CAN",
      "cantidad": 4,
      "valor_fob_total": 89000.00,
      "valor_fob_compensacion_total": 1500.00,
      "valor_fob_neto": 87500.00
    }
  ]
}
```

---

### 10. Buscar por Cliente

```http
GET /api/exportaciones/cliente?identificacion_cliente=ID&periodo=MM/AAAA
```

**Descripción:** Busca todas las exportaciones de un cliente específico.

**Query Parameters:**
- `identificacion_cliente` (requerido): Identificación del cliente
- `periodo` (opcional): Formato MM/AAAA para filtrar por período

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Exportaciones del cliente obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "periodo": "10/2025",
      "fecha_emision": "2025-10-20",
      "razon_social_cliente": "Import Export USA Inc.",
      "pais_destino": "USA",
      "valor_fob_comprobante": 25000.00,
      "estado": "VALIDADO",
      // ... resto de campos
    }
  ]
}
```

---

### 11. Obtener por Año

```http
GET /api/exportaciones/anio?anio=AAAA
```

**Descripción:** Obtiene todas las exportaciones de un año específico.

**Query Parameters:**
- `anio` (requerido): Año de exportación (1900-2100)

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Exportaciones del año obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "periodo": "10/2025",
      "anio_exportacion": 2025,
      "razon_social_cliente": "Import Export USA Inc.",
      "pais_destino": "USA",
      "valor_fob_comprobante": 25000.00,
      // ... resto de campos
    }
  ]
}
```

---

## Modelos de Datos

### Modelo de Exportación

```typescript
{
  id: number;                          // ID único (auto-generado)
  empresa_id: number;                  // ID de la empresa (auto-asignado)
  usuario_id: number;                  // ID del usuario que creó (auto-asignado)
  periodo: string;                     // Formato: MM/AAAA
  tipo_comprobante: string;            // 2 caracteres
  fecha_emision: string;               // ISO8601 (YYYY-MM-DD)
  establecimiento: string;             // 3 dígitos numéricos
  punto_emision: string;               // 3 dígitos numéricos
  secuencial: string;                  // Hasta 9 dígitos numéricos
  numero_autorizacion: string;         // 10-49 caracteres
  tipo_cliente: "01" | "02";          // 01=Persona Natural, 02=Sociedad
  tipo_identificacion: string;         // 2 caracteres
  identificacion_cliente: string;      // 1-20 caracteres
  razon_social_cliente: string;        // 1-300 caracteres
  pais_destino: string;                // 3 caracteres (ISO 3166)
  pais_efect_pago?: string;           // 3 caracteres (ISO 3166)
  tipo_regimen_fiscal?: string;        // 2 caracteres
  pais_regimen_fiscal?: string;        // 3 caracteres (ISO 3166)
  valor_fob_comprobante: number;       // Decimal(12,2)
  valor_fob_compensacion: number;      // Decimal(12,2), default: 0.00
  forma_pago?: string;                 // 2 caracteres
  distrito_exportacion?: string;       // 3 caracteres
  anio_exportacion?: number;           // 1900-2100
  regimen_exportacion?: string;        // 2 caracteres
  correo_electronico?: string;         // Email válido, max 100 caracteres
  estado: "BORRADOR" | "VALIDADO" | "INCLUIDO_ATS" | "ANULADO";
  observaciones?: string;              // Texto libre
  created_at: string;                  // Timestamp de creación
  updated_at: string;                  // Timestamp de última actualización
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear exportación a Estados Unidos

```bash
curl -X POST http://localhost:3000/api/exportaciones \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "periodo": "10/2025",
    "tipo_comprobante": "18",
    "fecha_emision": "2025-10-20",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000567",
    "numero_autorizacion": "2025102001234567890",
    "tipo_cliente": "02",
    "tipo_identificacion": "06",
    "identificacion_cliente": "USEXPORT123",
    "razon_social_cliente": "Import Export USA Inc.",
    "pais_destino": "USA",
    "pais_efect_pago": "USA",
    "valor_fob_comprobante": 25000.00,
    "anio_exportacion": 2025
  }'
```

### Ejemplo 2: Listar exportaciones de un período con filtros

```bash
curl -X GET "http://localhost:3000/api/exportaciones?periodo=10/2025&estado=VALIDADO&pais_destino=USA&pagina=1&limite=20" \
  -H "Authorization: Bearer {token}"
```

### Ejemplo 3: Obtener resumen por país de destino

```bash
curl -X GET "http://localhost:3000/api/exportaciones/resumen-pais?periodo=10/2025" \
  -H "Authorization: Bearer {token}"
```

### Ejemplo 4: Validar exportaciones masivamente del mes

```bash
curl -X POST "http://localhost:3000/api/exportaciones/validar-masivo?periodo=10/2025" \
  -H "Authorization: Bearer {token}"
```

---

## Códigos de Error

### Errores Comunes

**400 Bad Request:**
- Validación de datos fallida
- Valor FOB compensación mayor que valor FOB comprobante
- Estado no permite la operación

```json
{
  "error": "Errores de validación",
  "detalles": [
    {
      "campo": "valor_fob_compensacion",
      "mensaje": "El valor FOB de compensación debe ser un número mayor o igual a 0",
      "valor": -100
    }
  ]
}
```

**401 Unauthorized:**
- Token JWT no proporcionado o inválido

**403 Forbidden:**
- Usuario no tiene permisos para la operación

**404 Not Found:**
- Exportación no encontrada

**500 Internal Server Error:**
- Error del servidor

---

## Notas Importantes

1. **Multi-tenancy:** Todas las exportaciones están aisladas por empresa.

2. **Validación de valores FOB:** El sistema valida automáticamente que `valor_fob_compensacion ≤ valor_fob_comprobante`

3. **Códigos de país:** Se debe usar el estándar ISO 3166 de 3 caracteres (ejemplo: USA, CAN, MEX, COL, PER, CHL, ARG, BRA).

4. **Estados de exportación:**
   - `BORRADOR`: Exportación creada pero no validada
   - `VALIDADO`: Exportación validada y lista para incluir en ATS
   - `INCLUIDO_ATS`: Exportación incluida en un archivo ATS generado (no modificable)
   - `ANULADO`: Exportación anulada (no se cuenta en reportes)

5. **Tipos de cliente:**
   - `01`: Persona Natural
   - `02`: Sociedad

6. **Auditoría:** Todas las operaciones sobre exportaciones se registran en la tabla `log_actividad`.

7. **Paginación:** Por defecto, los listados muestran 20 registros por página. Se puede ajustar con el parámetro `limite` (máximo 100).

8. **Resúmenes:** Los resúmenes calculan automáticamente el valor FOB neto (comprobante - compensación) y agrupan por diferentes criterios.
