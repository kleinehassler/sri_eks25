# Módulo de Gestión de Compras - Frontend

## 📋 Descripción

Módulo completo para la gestión de compras y facturas de proveedores en el Sistema ATS. Incluye todas las operaciones CRUD, filtros avanzados por periodo y estado, y validación de compras para inclusión en el ATS.

## ✅ Características Implementadas

### 1. Tabla de Compras con Filtros (`ComprasTable.jsx`)
- ✅ Listado completo de compras con paginación
- ✅ **Filtros avanzados:**
  - Búsqueda en tiempo real por RUC, proveedor o autorización
  - Filtro por periodo (MM/YYYY)
  - Filtro por estado (PENDIENTE, VALIDADO, RECHAZADO)
  - Botón para limpiar todos los filtros
- ✅ Formateo de moneda en dólares (USD)
- ✅ Formateo de fechas en español (es-EC)
- ✅ Indicadores visuales con chips de colores según estado
- ✅ Acciones rápidas: Validar, Editar, Eliminar
- ✅ **Resumen en tiempo real:**
  - Total de compras
  - Base imponible total
  - Total general
- ✅ Manejo de estados de carga
- ✅ Mensajes de error amigables

**Columnas mostradas:**
- Fecha de emisión
- Proveedor (razón social)
- RUC del proveedor
- Tipo de documento
- Base IVA
- IVA (15%)
- Total de compra
- Estado (chip con color)
- Acciones

### 2. Formulario de Compra (`CompraForm.jsx`)
- ✅ Modal responsive con diseño organizado en secciones
- ✅ Validación completa con Formik + Yup
- ✅ **Cálculo automático:**
  - Total de compra calculado automáticamente
  - Botón para calcular IVA (15%) sobre base imponible
- ✅ Campos organizados por secciones:
  - Datos del Proveedor
  - Datos del Comprobante
  - Valores (bases, impuestos, total)
- ✅ Formateo de moneda con símbolo $ en inputs
- ✅ Total destacado en verde y negrita
- ✅ Mensajes de error en español
- ✅ Estados de carga durante el guardado

**Campos del formulario:**

**Sección: Datos del Proveedor**
- **RUC del Proveedor*** (10-13 dígitos)
- **Razón Social del Proveedor*** (máx. 300 caracteres)

**Sección: Datos del Comprobante**
- **Tipo de Comprobante*** (select con opciones del SRI)
- **Número de Autorización** (10-49 dígitos)
- **Fecha de Emisión*** (no puede ser futura)
- **Periodo*** (formato MM/YYYY)
- **Código de Sustento*** (select con códigos del SRI)

**Sección: Valores**
- **Base Imponible IVA*** (con botón calcular IVA)
- **Monto IVA*** (calculable automáticamente al 15%)
- **Base Imponible 0%** (opcional)
- **Base No Objeto de IVA** (opcional)
- **Monto ICE** (opcional)
- **Total Compra*** (calculado automáticamente, solo lectura)

### 3. Catálogos del SRI Implementados

#### Tipos de Comprobante
```
01 - Factura
04 - Nota de Crédito
05 - Nota de Débito
03 - Liquidación de Compra
06 - Guía de Remisión
```

#### Códigos de Sustento Tributario
```
01 - Crédito Tributario para declaración de IVA
02 - Costo o Gasto para declaración de IR
03 - Activo Fijo
04 - Liquidación Gastos de Viaje
05 - Deducción por Terceros
06 - Crédito Tributario sin derecho a devolución
```

### 4. Servicio de API (`compraService.js`)
- ✅ Integración completa con backend
- ✅ Soporte para filtros en query params
- ✅ Manejo de errores

**Endpoints utilizados:**
```javascript
GET    /api/compras              // Listar con filtros
GET    /api/compras/resumen      // Obtener resumen
GET    /api/compras/:id          // Obtener una
POST   /api/compras              // Crear nueva
PUT    /api/compras/:id          // Actualizar
DELETE /api/compras/:id          // Eliminar
PATCH  /api/compras/:id/validar  // Validar compra
```

### 5. Página Principal (`Compras.jsx`)
- ✅ Integración de todos los componentes
- ✅ Gestión de estado global del módulo
- ✅ Diálogo de confirmación para eliminar
- ✅ **Diálogo de confirmación para validar** (acción crítica)
- ✅ Notificaciones con Snackbar
- ✅ Manejo de errores centralizado
- ✅ Integración con AuthContext para empresa_id del usuario

## 🎨 Interfaz de Usuario

### Panel de Filtros
- Diseño en Paper con icono de filtro
- Grid responsive (4+3+3+2 columnas en desktop)
- Búsqueda con icono de lupa
- Botón "Limpiar" para resetear filtros

### Colores y Estilos
- **Estado VALIDADO**: Chip verde (success) ✅
- **Estado PENDIENTE**: Chip naranja (warning) ⏳
- **Estado RECHAZADO**: Chip rojo (error) ❌
- **Total de compra**: Texto verde destacado
- **Encabezado de tabla**: Fondo azul primario

### Iconos Utilizados
- 🛒 ShoppingCartIcon - Encabezado del módulo
- ➕ AddIcon - Botón nueva compra
- ✏️ EditIcon - Editar compra
- 🗑️ DeleteIcon - Eliminar compra
- ✅ CheckCircleIcon - Validar compra
- 🔍 SearchIcon - Búsqueda
- 🔽 FilterListIcon - Filtros

## 🚀 Uso

### Crear Nueva Compra
1. Clic en botón "Nueva Compra"
2. Completar sección de proveedor
3. Completar sección de comprobante
4. Ingresar base imponible IVA
5. Clic en "Calcular" para calcular IVA automáticamente
6. Ingresar otros valores si aplica
7. El total se calcula automáticamente
8. Clic en "Crear"
9. Notificación de éxito/error

### Editar Compra
1. Clic en icono de editar en la tabla
2. El formulario se abre pre-llenado
3. Modificar campos deseados
4. El total se recalcula automáticamente
5. Clic en "Actualizar"
6. Notificación de éxito/error

### Validar Compra
1. Solo disponible para compras con estado PENDIENTE
2. Clic en icono de check verde en la tabla
3. Se muestra diálogo de confirmación con advertencia
4. Clic en "Validar" para confirmar
5. La compra cambia a estado VALIDADO
6. Compras validadas se incluyen en cálculo del ATS

### Eliminar Compra
1. Clic en icono de eliminar en la tabla
2. Se muestra diálogo de confirmación con detalles
3. Clic en "Eliminar" para confirmar
4. Notificación de éxito/error

### Filtrar Compras
**Por búsqueda:**
- Escribir en campo de búsqueda
- Busca en: RUC proveedor, razón social, número de autorización
- Filtrado en tiempo real

**Por periodo:**
- Ingresar periodo en formato MM/YYYY (ej: 01/2024)
- Se aplica al hacer cambio
- Recarga datos del servidor

**Por estado:**
- Seleccionar estado del dropdown
- Opciones: Todos, Pendiente, Validado, Rechazado
- Se aplica al hacer cambio
- Recarga datos del servidor

**Limpiar filtros:**
- Clic en botón "Limpiar"
- Resetea todos los filtros
- Recarga todos los datos

## 📦 Estructura de Archivos

```
frontend/src/
├── pages/
│   └── Compras.jsx                     # Página principal
├── components/
│   └── Compras/
│       ├── ComprasTable.jsx           # Tabla con filtros
│       └── CompraForm.jsx             # Formulario crear/editar
└── services/
    └── compraService.js               # Integración con API
```

## 🧪 Validaciones del Formulario

### Reglas de Validación

| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| RUC Proveedor | Obligatorio, 10-13 dígitos | "El RUC del proveedor es requerido" |
| Razón Social | Obligatorio, máx. 300 caracteres | "La razón social del proveedor es requerida" |
| Tipo Comprobante | Obligatorio | "El tipo de comprobante es requerido" |
| Número Autorización | Opcional, 10-49 dígitos | "El número de autorización debe tener entre 10 y 49 dígitos" |
| Fecha Emisión | Obligatorio, no futura | "La fecha no puede ser futura" |
| Periodo | Obligatorio, formato MM/YYYY | "El periodo debe tener el formato MM/YYYY" |
| Código Sustento | Obligatorio | "El código de sustento es requerido" |
| Base Imponible IVA | Obligatorio, >= 0 | "La base imponible es requerida" |
| Monto IVA | Obligatorio, >= 0 | "El monto de IVA es requerido" |
| Total Compra | Obligatorio, > 0 | "El total de la compra es requerido" |

## 💰 Cálculos Automáticos

### Cálculo de Total
```javascript
Total = Base IVA + Base 0% + Base No Objeto + IVA + ICE
```

### Cálculo de IVA (Botón "Calcular")
```javascript
IVA = Base Imponible IVA × 0.15
```

**Ejemplo:**
- Base Imponible IVA: $1000.00
- IVA calculado: $150.00
- Total (si no hay otros valores): $1150.00

## 📊 Resumen en la Tabla

La tabla muestra un resumen en tiempo real de las compras filtradas:

```
┌─────────────────────────────────────────┐
│ Total Compras: 25                       │
│ Base Imponible Total: $45,230.50        │
│ Total General: $51,990.15               │
└─────────────────────────────────────────┘
```

## 🔐 Integración con Autenticación

- El `empresa_id` del usuario se obtiene automáticamente del contexto de autenticación
- Se envía en cada petición al crear/actualizar compras
- Asegura aislamiento multi-empresa

## 🎯 Funcionalidades Especiales

### 1. Validación de Compras
- Acción crítica para marcar compras como validadas
- Solo compras VALIDADAS se incluyen en el ATS
- Diálogo de confirmación con advertencia
- Una vez validada, requiere acción manual para desvalidar

### 2. Filtros Reactivos
- Los filtros de servidor (periodo, estado) recargan datos
- El filtro de búsqueda es local (no recarga)
- Cambio de filtro resetea paginación automáticamente

### 3. Formateo Regional
- Moneda: Formato USD con coma de miles y 2 decimales
- Fechas: Formato ecuatoriano (DD/MM/YYYY)
- Locale: es-EC

## 📱 Responsividad

- ✅ Tabla con scroll horizontal en móviles
- ✅ Formulario en 2 columnas en desktop, 1 en móvil
- ✅ Filtros stack verticalmente en móviles
- ✅ Resumen adaptativo en 1-3 columnas
- ✅ Diálogos de confirmación responsivos

## 🐛 Manejo de Errores

### Errores Comunes y Soluciones

**Error: "El RUC del proveedor debe tener entre 10 y 13 dígitos"**
- Verificar que el RUC sea numérico
- Verificar la longitud correcta

**Error: "El periodo debe tener el formato MM/YYYY"**
- Usar formato correcto: 01/2024
- Mes debe ser 01-12
- Año debe ser 4 dígitos

**Error: "La fecha no puede ser futura"**
- Seleccionar fecha actual o anterior
- El sistema valida contra fecha del servidor

**Error: "Error al validar la compra"**
- Verificar que la compra esté en estado PENDIENTE
- Verificar permisos del usuario
- Revisar logs del backend

## ✅ Checklist de Implementación

- [x] Servicio de API (compraService.js)
- [x] Componente de tabla con filtros (ComprasTable.jsx)
- [x] Componente de formulario (CompraForm.jsx)
- [x] Integración en página principal (Compras.jsx)
- [x] Validación de formularios con Yup
- [x] Cálculo automático de total
- [x] Botón calcular IVA
- [x] Filtros por periodo y estado
- [x] Búsqueda en tiempo real
- [x] Validación de compras (botón)
- [x] Diálogo de confirmación para validar
- [x] Diálogo de confirmación para eliminar
- [x] Resumen de compras
- [x] Formateo de moneda
- [x] Formateo de fechas
- [x] Manejo de errores
- [x] Notificaciones (Snackbar)
- [x] Paginación
- [x] Indicadores de carga
- [x] Responsive design
- [x] Integración con AuthContext
- [x] Documentación

## 🎉 Estado Final

**✅ MÓDULO COMPLETO Y FUNCIONAL**

Todos los requerimientos solicitados han sido implementados:
1. ✅ Tabla con lista de compras
2. ✅ Formulario para crear/editar
3. ✅ Filtros por periodo y estado
4. ✅ Botón de validación

### Características Adicionales Implementadas:
- ✅ Cálculo automático de total
- ✅ Botón para calcular IVA
- ✅ Búsqueda en tiempo real
- ✅ Resumen de totales
- ✅ Formateo de moneda y fechas
- ✅ Diálogos de confirmación
- ✅ Catálogos del SRI
- ✅ Validación completa de formularios

El módulo está listo para usar una vez que:
- El backend esté corriendo en `http://localhost:3000`
- El frontend esté corriendo en `http://localhost:5173`
- Las dependencias estén instaladas
- MySQL esté configurado y las migraciones ejecutadas
- Haya al menos una empresa creada en el sistema

## 📝 Notas de Uso

### Flujo Típico de Trabajo
1. Crear empresa (módulo Empresas)
2. Crear compras en estado PENDIENTE
3. Revisar y editar si es necesario
4. Validar compras correctas
5. Las compras validadas se incluyen en ATS
6. Generar ATS del periodo (módulo Generar ATS)

### Mejores Prácticas
- Validar compras solo cuando estén verificadas
- Usar código de sustento correcto según tipo de gasto
- Verificar que el total calculado coincida con la factura
- Mantener periodo consistente (MM/YYYY)
- Filtrar por periodo antes de generar ATS
