# Validación de RUC en Ecuador - Sistema ATS

## Tipos de Identificación Tributaria en Ecuador

### 1. Cédula / RUC de Persona Natural (10 dígitos)
- **Longitud:** 10 dígitos
- **Tercer dígito:** 0-5
- **Uso:** Personas naturales (individuos)
- **Ejemplo:** `1234567890`
- **NO PERMITIDO** en el CRUD de Empresas

### 2. RUC de Entidad Pública (13 dígitos)
- **Longitud:** 13 dígitos
- **Tercer dígito:** 6
- **Terminación:** Debe terminar en `001`
- **Uso:** Instituciones públicas, ministerios, municipios
- **Ejemplo:** `1768123456001`
- **PERMITIDO** en el CRUD de Empresas ✅

### 3. RUC de Sociedad Privada (13 dígitos)
- **Longitud:** 13 dígitos
- **Tercer dígito:** 9
- **Terminación:** Debe terminar en `001`
- **Uso:** Empresas privadas, compañías, sociedades
- **Ejemplo:** `1790016919001`
- **PERMITIDO** en el CRUD de Empresas ✅

## Validación en el Módulo de Empresas

### Restricciones Aplicadas

El módulo de **Empresas** solo acepta RUC de empresas (13 dígitos):

```javascript
// ✅ VÁLIDO - RUC de sociedad privada
{
  "ruc": "1790016919001",
  "razon_social": "EMPRESA DEMO S.A."
}

// ✅ VÁLIDO - RUC de entidad pública
{
  "ruc": "1768123456001",
  "razon_social": "MINISTERIO DE EJEMPLO"
}

// ❌ INVÁLIDO - Cédula/RUC de persona natural (10 dígitos)
{
  "ruc": "1234567890",
  "razon_social": "Juan Pérez"
}
// Error: "El RUC de empresa debe tener exactamente 13 dígitos"

// ❌ INVÁLIDO - RUC que no termina en 001
{
  "ruc": "1790016919002",
  "razon_social": "EMPRESA DEMO S.A."
}
// Error: "El RUC de empresa debe terminar en 001"

// ❌ INVÁLIDO - Tercer dígito incorrecto
{
  "ruc": "1750016919001",
  "razon_social": "EMPRESA DEMO S.A."
}
// Error: "El RUC proporcionado no corresponde a una empresa"
```

### Algoritmo de Validación

El sistema realiza las siguientes validaciones:

1. **Longitud exacta:** Debe tener 13 dígitos
2. **Solo números:** No acepta letras ni caracteres especiales
3. **Código de provincia:** Primeros 2 dígitos (01-24, o 30)
4. **Tercer dígito:** Debe ser 6 (pública) o 9 (privada)
5. **Terminación:** Últimos 3 dígitos deben ser `001`
6. **Dígito verificador:** Valida el algoritmo del SRI según el tipo

### Validador Utilizado

```javascript
// Validación específica para empresas
const { validarRUCEmpresa } = require('../utils/rucValidator');

const resultado = validarRUCEmpresa('1790016919001');
// { valido: true, mensaje: 'RUC válido' }

const resultado2 = validarRUCEmpresa('1234567890');
// {
//   valido: false,
//   mensaje: 'El RUC proporcionado corresponde a una persona natural. Para empresas debe usar RUC de 13 dígitos'
// }
```

## Ejemplos de RUC Válidos de Empresas

### Sociedades Privadas (tercer dígito = 9)

- `0190000000001` - Empresa Azuay
- `0990000000001` - Empresa Guayas
- `1790016919001` - Empresa Pichincha
- `1090000000001` - Empresa Esmeraldas

### Entidades Públicas (tercer dígito = 6)

- `1760001550001` - Ministerio de Finanzas
- `0960019330001` - Municipio de Guayaquil
- `1768000000001` - Entidad Pública Pichincha

## Estructura del RUC de 13 dígitos

```
1  7  9  0  0  1  6  9  1  9  0  0  1
└──┘  │  └──────────────┘  │  └────┘
 │    │          │         │    │
 │    │          │         │    └─ Establecimiento (siempre 001)
 │    │          │         └────── Dígito verificador
 │    │          └────────────────── Número secuencial
 │    └───────────────────────────── Tipo (6=pública, 9=privada)
 └────────────────────────────────── Provincia (01-24, 30)
```

## Mensajes de Error

### Error: "El RUC de empresa debe tener exactamente 13 dígitos"
**Causa:** Se ingresó un RUC con menos o más de 13 dígitos (probablemente una cédula de 10 dígitos)
**Solución:** Use el RUC completo de 13 dígitos de la empresa

### Error: "El RUC proporcionado corresponde a una persona natural"
**Causa:** El tercer dígito es menor a 6 (0-5), lo que indica que es una cédula
**Solución:** Use el RUC de una empresa (tercer dígito 6 o 9)

### Error: "El RUC de empresa debe terminar en 001"
**Causa:** Los últimos 3 dígitos no son `001`
**Solución:** Verifique que el RUC termine en `001`

### Error: "Tipo de RUC no válido para empresa"
**Causa:** El tercer dígito no es 6 ni 9
**Solución:** Verifique que el RUC sea correcto

### Error: "Dígito verificador de RUC incorrecto"
**Causa:** El dígito verificador no coincide con el algoritmo del SRI
**Solución:** Verifique que el RUC esté correctamente escrito

## Razón de la Restricción

En el sistema ATS, el módulo de **Empresas** está diseñado para gestionar únicamente **entidades jurídicas** (compañías, sociedades, instituciones públicas), no personas naturales.

Si necesita gestionar personas naturales como proveedores o clientes, estos se registran en otros módulos (compras, ventas) usando su cédula de 10 dígitos como identificación.

## API - Endpoints Afectados

Los siguientes endpoints validan que el RUC sea de empresa:

- `POST /api/empresas` - Crear empresa
- `PUT /api/empresas/:id` - Actualizar empresa

## Pruebas de Validación

### Caso 1: Crear empresa con cédula (❌ Debe fallar)

```bash
curl -X POST http://localhost:3000/api/empresas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1234567890",
    "razon_social": "PERSONA NATURAL"
  }'
```

**Respuesta esperada (400):**
```json
{
  "errores": [
    {
      "campo": "ruc",
      "mensaje": "El RUC de empresa debe tener exactamente 13 dígitos"
    }
  ]
}
```

### Caso 2: Crear empresa con RUC válido (✅ Debe funcionar)

```bash
curl -X POST http://localhost:3000/api/empresas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1790016919001",
    "razon_social": "EMPRESA DEMO S.A.",
    "regimen_tributario": "GENERAL",
    "obligado_contabilidad": true
  }'
```

**Respuesta esperada (201):**
```json
{
  "mensaje": "Empresa creada exitosamente",
  "data": {
    "id": 1,
    "ruc": "1790016919001",
    "razon_social": "EMPRESA DEMO S.A.",
    "estado": "ACTIVO"
  }
}
```

## Funciones Disponibles

### `validarRUC(ruc)` - Validación general
Acepta cualquier tipo de RUC (10 o 13 dígitos)
```javascript
const { validarRUC } = require('./utils/rucValidator');
validarRUC('1234567890'); // { valido: true, mensaje: 'RUC válido' }
validarRUC('1790016919001'); // { valido: true, mensaje: 'RUC válido' }
```

### `validarRUCEmpresa(ruc)` - Solo empresas
Solo acepta RUC de 13 dígitos (empresas)
```javascript
const { validarRUCEmpresa } = require('./utils/rucValidator');
validarRUCEmpresa('1234567890'); // { valido: false, mensaje: 'El RUC de empresa debe tener 13 dígitos' }
validarRUCEmpresa('1790016919001'); // { valido: true, mensaje: 'RUC válido' }
```

### `obtenerTipoRUC(ruc)` - Identificar tipo
```javascript
const { obtenerTipoRUC } = require('./utils/rucValidator');
obtenerTipoRUC('1234567890'); // 'PERSONA_NATURAL'
obtenerTipoRUC('1760001550001'); // 'ENTIDAD_PUBLICA'
obtenerTipoRUC('1790016919001'); // 'SOCIEDAD_PRIVADA'
```

## Migración de Datos

Si tiene datos existentes con cédulas en lugar de RUC de empresa:

1. **Obtener el RUC de la empresa** desde el SRI
2. **Actualizar los registros** con el RUC correcto de 13 dígitos
3. Las personas naturales no deben estar en la tabla `empresas`

## Referencias

- [Ficha Técnica ATS - SRI Ecuador](https://www.sri.gob.ec/)
- Validación según especificaciones del SRI
- Algoritmo de dígito verificador del SRI
