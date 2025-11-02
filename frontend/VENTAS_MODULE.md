# Módulo de Ventas - Sistema ATS

## Descripción General

El módulo de Ventas permite gestionar el registro completo de las ventas realizadas por la empresa para su posterior inclusión en el Anexo Transaccional Simplificado (ATS). Incluye funcionalidades de CRUD completo, validación de datos, filtros avanzados y cálculos automáticos.

## Archivos Creados

### 1. **ventaService.js** - Servicio de API
**Ubicación:** `frontend/src/services/ventaService.js`

Servicio que gestiona todas las peticiones HTTP al backend relacionadas con ventas.

**Métodos disponibles:**
```javascript
- getAll(filters)      // Obtener todas las ventas con filtros opcionales
- getById(id)          // Obtener una venta específica
- create(ventaData)    // Crear nueva venta
- update(id, ventaData) // Actualizar venta existente
- delete(id)           // Eliminar venta
- validar(id)          // Validar venta (cambiar estado a VALIDADO)
- anular(id)           // Anular venta (cambiar estado a ANULADO)
```

**Filtros soportados:**
- `empresaId`: Filtrar por empresa
- `periodo`: Filtrar por periodo (MM/YYYY)
- `estado`: Filtrar por estado (BORRADOR, VALIDADO, INCLUIDO_ATS, ANULADO)
- `search`: Búsqueda por cliente, RUC o secuencial

### 2. **VentasTable.jsx** - Componente de Tabla
**Ubicación:** `frontend/src/components/Ventas/VentasTable.jsx`

Tabla interactiva con filtros avanzados y resumen de totales.

**Características principales:**
- ✅ Paginación configurable (5, 10, 25, 50 filas)
- ✅ Búsqueda en tiempo real (cliente, RUC, secuencial)
- ✅ Filtros por periodo y estado
- ✅ Resumen de totales (Total Ventas, Base IVA, IVA Total)
- ✅ Chips de estado con colores
- ✅ Acciones por fila: Editar, Eliminar, Validar
- ✅ Formato de moneda en dólares (USD)
- ✅ Botón para limpiar filtros

**Estados visuales:**
- **BORRADOR** (gris): Venta sin validar
- **VALIDADO** (verde): Venta lista para ATS
- **INCLUIDO_ATS** (azul): Venta incluida en ATS generado
- **ANULADO** (rojo): Venta anulada

**Props del componente:**
```javascript
<VentasTable
  ventas={array}          // Array de ventas
  loading={boolean}       // Estado de carga
  onEdit={function}       // Callback al editar
  onDelete={function}     // Callback al eliminar
  onValidar={function}    // Callback al validar
/>
```

### 3. **VentaForm.jsx** - Formulario de Ventas
**Ubicación:** `frontend/src/components/Ventas/VentaForm.jsx`

Formulario completo para crear y editar ventas con validación avanzada.

**Secciones del formulario:**

#### 📋 Información del Cliente
- Tipo de identificación (RUC, Cédula, Pasaporte, Consumidor Final)
- Número de identificación
- Razón social / Nombre del cliente

#### 📄 Información del Comprobante
- Periodo (MM/YYYY)
- Fecha de emisión
- Tipo de comprobante (Factura, Nota de Crédito, etc.)
- Forma de pago
- Establecimiento (3 dígitos)
- Punto de emisión (3 dígitos)
- Secuencial (hasta 9 dígitos)
- Número de autorización (10-49 caracteres)

#### 💰 Valores
- Base Imponible 0%
- Base Imponible IVA 15%
- Base No Objeto IVA
- Base Exento IVA
- Monto IVA (con botón de cálculo automático)
- Monto ICE
- Valor Retención IVA
- Valor Retención Renta
- **Total Venta** (calculado automáticamente)

**Validaciones implementadas:**
```javascript
✅ Periodo formato MM/YYYY
✅ Identificación cliente (10-20 caracteres)
✅ Razón social (máximo 300 caracteres)
✅ Establecimiento/Punto emisión (3 dígitos)
✅ Secuencial (numérico, hasta 9 dígitos)
✅ Número autorización (10-49 caracteres)
✅ Todos los montos ≥ 0
✅ Total venta requerido
```

**Funcionalidades especiales:**
- ✅ Cálculo automático del total cuando cambian las bases
- ✅ Botón para calcular IVA (15% de la base imponible)
- ✅ Vista previa del número de factura completo
- ✅ Validación en tiempo real con Formik + Yup

**Props del componente:**
```javascript
<VentaForm
  open={boolean}              // Controla si el diálogo está abierto
  onClose={function}          // Callback al cerrar
  onSubmit={function}         // Callback al enviar (recibe values)
  initialValues={object}      // Valores iniciales (para modo edición)
  mode="create"|"edit"        // Modo del formulario
/>
```

### 4. **Ventas.jsx** - Página Principal
**Ubicación:** `frontend/src/pages/Ventas.jsx`

Página principal que integra todos los componentes del módulo.

**Funcionalidades:**
- ✅ Listado completo de ventas
- ✅ Creación de nuevas ventas
- ✅ Edición de ventas existentes
- ✅ Eliminación con confirmación
- ✅ Validación con confirmación
- ✅ Notificaciones con Snackbar
- ✅ Manejo de estados de carga
- ✅ Integración con AuthContext

**Diálogos de confirmación:**
1. **Eliminar venta**: Muestra datos de la venta antes de eliminar
2. **Validar venta**: Confirma que los datos son correctos antes de validar

## Estructura de Datos

### Modelo de Venta
```javascript
{
  id: number,
  empresa_id: number,
  usuario_id: number,
  periodo: string,                          // "MM/YYYY"
  tipo_comprobante: string,                 // "01", "04", etc.
  tipo_identificacion_cliente: string,      // "04", "05", "06", "07"
  identificacion_cliente: string,
  razon_social_cliente: string,
  fecha_emision: date,
  establecimiento: string,                  // "001"
  punto_emision: string,                    // "001"
  secuencial: string,                       // "000000001"
  numero_autorizacion: string,
  base_imponible_0: decimal,
  base_imponible_iva: decimal,
  base_imponible_no_objeto_iva: decimal,
  base_imponible_exento_iva: decimal,
  monto_iva: decimal,
  monto_ice: decimal,
  valor_retencion_iva: decimal,
  valor_retencion_renta: decimal,
  total_venta: decimal,
  forma_pago: string,
  estado: enum,                             // BORRADOR, VALIDADO, INCLUIDO_ATS, ANULADO
  observaciones: text,
  created_at: timestamp,
  updated_at: timestamp
}
```

## Flujo de Trabajo

### 1. Registro de Venta
```
Usuario → Click "Nueva Venta" → Formulario → Llenar datos → Guardar
→ Estado: BORRADOR
```

### 2. Validación de Venta
```
Usuario → Seleccionar venta BORRADOR → Click "Validar" → Confirmar
→ Estado: VALIDADO
→ Lista para ATS
```

### 3. Edición de Venta
```
Usuario → Click "Editar" → Formulario pre-llenado → Modificar → Guardar
→ Solo permitido si estado ≠ INCLUIDO_ATS
```

### 4. Eliminación de Venta
```
Usuario → Click "Eliminar" → Confirmar eliminación → Venta eliminada
→ Solo permitido si estado ≠ INCLUIDO_ATS
```

## Integración con Backend

El módulo espera los siguientes endpoints en el backend:

```
GET    /api/ventas                    // Listar ventas con filtros
GET    /api/ventas/:id                // Obtener venta específica
POST   /api/ventas                    // Crear nueva venta
PUT    /api/ventas/:id                // Actualizar venta
DELETE /api/ventas/:id                // Eliminar venta
PATCH  /api/ventas/:id/validar        // Validar venta
PATCH  /api/ventas/:id/anular         // Anular venta
```

**Formato de respuesta esperado:**
```javascript
{
  mensaje: "Venta creada exitosamente",
  data: {...}  // Objeto venta o array de ventas
}
```

**Formato de error esperado:**
```javascript
{
  mensaje: "Error al crear la venta",
  errores: [...]  // Array de errores de validación (opcional)
}
```

## Validaciones del Sistema

### Validaciones del Frontend (Formik + Yup)
- Formato de periodo: MM/YYYY
- Longitud de campos
- Tipos de datos numéricos
- Valores no negativos
- Campos requeridos

### Validaciones del Backend (esperadas)
- RUC/Cédula válidos según algoritmo ecuatoriano
- Periodo no futuro
- Número de autorización único
- Total = suma de bases + impuestos
- Estado válido para operaciones

## Características Especiales

### 🧮 Cálculos Automáticos
1. **Total Venta**:
   ```
   Total = Base_0 + Base_IVA + Base_NoObjeto + Base_Exento + IVA + ICE
   ```

2. **IVA (botón calcular)**:
   ```
   IVA = Base_IVA × 0.15 (15%)
   ```

### 🎨 Experiencia de Usuario
- Formato de moneda en USD con separadores de miles
- Fechas en formato local ecuatoriano (dd/mm/yyyy)
- Números de factura en formato XXX-XXX-XXXXXXXXX
- Chips de estado con colores intuitivos
- Tooltips en botones de acción
- Confirmaciones antes de acciones críticas

### 📊 Resumen de Totales
Panel de resumen que muestra:
- Total de ventas del periodo
- Base imponible IVA total
- IVA total recaudado

### 🔍 Filtros Avanzados
- Búsqueda en tiempo real
- Filtro por periodo
- Filtro por estado
- Botón para limpiar todos los filtros

## Próximas Mejoras Sugeridas

1. **Importación XML**: Importar ventas desde XML de facturas electrónicas
2. **Exportación Excel**: Exportar listado de ventas a Excel
3. **Validación masiva**: Validar múltiples ventas a la vez
4. **Gráficos**: Estadísticas de ventas por periodo
5. **Historial**: Ver historial de cambios de cada venta
6. **Retenciones**: Vincular retenciones recibidas a ventas

## Uso del Módulo

### Importar componentes
```javascript
import VentasTable from '../components/Ventas/VentasTable';
import VentaForm from '../components/Ventas/VentaForm';
import ventaService from '../services/ventaService';
```

### Ejemplo de uso
```javascript
// Cargar ventas
const ventas = await ventaService.getAll({
  empresaId: 1,
  periodo: "01/2024",
  estado: "VALIDADO"
});

// Crear venta
const nuevaVenta = await ventaService.create({
  periodo: "01/2024",
  identificacion_cliente: "1234567890",
  razon_social_cliente: "Cliente S.A.",
  // ... más campos
});

// Validar venta
await ventaService.validar(ventaId);
```

## Notas Importantes

⚠️ **Restricciones:**
- No se pueden editar/eliminar ventas con estado INCLUIDO_ATS
- Solo ventas VALIDADAS se incluyen en el ATS
- El periodo debe coincidir con el mes de emisión

✅ **Buenas prácticas:**
- Validar datos antes de incluir en ATS
- Verificar que totales coincidan con comprobantes
- Revisar filtros antes de generar reportes
- Mantener observaciones para auditoría

---

**Módulo creado:** Enero 2025
**Versión:** 1.0.0
**Dependencias:** React, Material-UI, Formik, Yup, Axios
