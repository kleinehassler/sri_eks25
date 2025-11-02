# Módulo de Reportes y Análisis - Sistema ATS

## Descripción General

El módulo de Reportes permite visualizar estadísticas consolidadas, análisis de transacciones y resúmenes ejecutivos del sistema ATS. Incluye dashboard interactivo, reportes detallados de compras y ventas, y funcionalidades de exportación a Excel y PDF.

## Archivos Creados

### 1. **reporteService.js** - Servicio de API
**Ubicación:** `frontend/src/services/reporteService.js`

Servicio que gestiona todas las peticiones relacionadas con reportes y estadísticas.

**Métodos disponibles:**
```javascript
- getResumenGeneral(empresaId, periodo)         // Dashboard resumen
- getReporteCompras(filters)                    // Reporte detallado de compras
- getReporteVentas(filters)                     // Reporte detallado de ventas
- getReporteIVA(empresaId, periodo)             // Reporte de IVA
- getTopProveedores(empresaId, periodo, limit)  // Top proveedores
- getTopClientes(empresaId, periodo, limit)     // Top clientes
- exportarExcel(tipoReporte, filters)           // Exportar a Excel
- exportarPDF(tipoReporte, filters)             // Exportar a PDF
- getEstadisticasPorPeriodo(...)                // Estadísticas para gráficos
```

### 2. **FiltrosReporte.jsx** - Componente de Filtros
**Ubicación:** `frontend/src/components/Reportes/FiltrosReporte.jsx`

Panel de filtros reutilizable para todos los reportes.

**Características:**
- ✅ Filtro por rango de periodos (inicio - fin)
- ✅ Filtro por estado
- ✅ Búsqueda por texto (proveedor/cliente/RUC)
- ✅ Botón generar reporte
- ✅ Botón limpiar filtros
- ✅ Botones exportar Excel/PDF (opcional)
- ✅ Valores por defecto: periodo actual

**Props:**
```javascript
<FiltrosReporte
  onAplicarFiltros={function}      // Callback al aplicar filtros
  onExportar={function}            // Callback al exportar
  mostrarExportar={boolean}        // Mostrar botones de exportación
  tipoReporte={string}             // 'general', 'compras', 'ventas'
/>
```

### 3. **ResumenGeneral.jsx** - Dashboard Ejecutivo
**Ubicación:** `frontend/src/components/Reportes/ResumenGeneral.jsx`

Dashboard con resumen ejecutivo y KPIs principales.

**Secciones del dashboard:**

#### 📊 Cards de Resumen Principal (4 tarjetas)
1. **Compras** (rojo)
   - Total de compras del periodo
   - Cantidad de transacciones
   - Base IVA
   - IVA total

2. **Ventas** (verde)
   - Total de ventas del periodo
   - Cantidad de transacciones
   - Base IVA
   - IVA total

3. **IVA por Pagar/Favor** (amarillo/azul)
   - Cálculo: IVA Ventas - IVA Compras
   - Color amarillo si es por pagar
   - Color azul si es a favor
   - Desglose de IVA ventas y compras

4. **Margen Bruto** (azul/rojo)
   - Cálculo: Ventas - Compras
   - Porcentaje sobre ventas
   - Indicador de tendencia (↑/↓)

#### 🏪 Top 5 Proveedores
- Tabla con ranking de proveedores
- Total de compras por proveedor
- Porcentaje del total
- RUC del proveedor

#### 👥 Top 5 Clientes
- Tabla con ranking de clientes
- Total de ventas por cliente
- Porcentaje del total
- Identificación del cliente

**Props:**
```javascript
<ResumenGeneral
  empresaId={number}      // ID de la empresa
  periodo={string}        // Periodo en formato MM/YYYY
/>
```

**Características especiales:**
- ✅ Carga automática al cambiar periodo
- ✅ Colores dinámicos según valores positivos/negativos
- ✅ Cálculos automáticos de KPIs
- ✅ Estados de loading y error
- ✅ Formato de moneda USD
- ✅ Indicadores visuales de tendencias

### 4. **TablaReporte.jsx** - Tabla Reutilizable
**Ubicación:** `frontend/src/components/Reportes/TablaReporte.jsx`

Componente de tabla genérico y reutilizable para cualquier reporte.

**Características:**
- ✅ Paginación configurable (10, 25, 50, 100 filas)
- ✅ Formato automático por tipo de dato
- ✅ Renderizado personalizado por columna
- ✅ Sticky header (cabecera fija)
- ✅ Estados de loading y vacío
- ✅ Contador total de registros

**Tipos de formato soportados:**
```javascript
'currency'    // $1,234.56
'date'        // dd/mm/yyyy
'percentage'  // 12.34%
'number'      // 1,234
'default'     // texto sin formato
```

**Props:**
```javascript
<TablaReporte
  datos={array}           // Array de objetos con los datos
  columnas={array}        // Definición de columnas
  titulo={string}         // Título de la tabla (opcional)
  loading={boolean}       // Estado de carga
/>
```

**Ejemplo de definición de columnas:**
```javascript
const columnas = [
  { field: 'periodo', label: 'Periodo' },
  { field: 'fecha', label: 'Fecha', tipo: 'date' },
  { field: 'total', label: 'Total', tipo: 'currency', align: 'right' },
  {
    field: 'custom',
    label: 'Custom',
    render: (row) => <CustomComponent data={row} />
  }
];
```

### 5. **Reportes.jsx** - Página Principal
**Ubicación:** `frontend/src/pages/Reportes.jsx`

Página principal que integra todos los componentes con sistema de tabs.

**Tabs disponibles:**

#### 📊 Tab 0: Resumen General
- Dashboard ejecutivo con ResumenGeneral
- Filtros simplificados (solo periodo)
- Sin exportación (vista de resumen)

#### 🛒 Tab 1: Reporte de Compras
- Tabla detallada de todas las compras
- Filtros completos (periodo, estado, búsqueda)
- Exportación a Excel/PDF
- Columnas: Periodo, Fecha, Proveedor, RUC, Factura, Base IVA, IVA, Total, Estado

#### 💰 Tab 2: Reporte de Ventas
- Tabla detallada de todas las ventas
- Filtros completos (periodo, estado, búsqueda)
- Exportación a Excel/PDF
- Columnas: Periodo, Fecha, Cliente, Identificación, Factura, Base IVA, IVA, Total, Estado

**Funcionalidades:**
- ✅ Sistema de tabs para navegación
- ✅ Integración con servicios de compras/ventas
- ✅ Manejo de exportación de archivos
- ✅ Notificaciones con Snackbar
- ✅ Estados de loading por tab
- ✅ Integración con AuthContext

## Estructura de Datos

### Resumen General
```javascript
{
  total_compras: decimal,
  cantidad_compras: number,
  base_iva_compras: decimal,
  iva_compras: decimal,
  total_ventas: decimal,
  cantidad_ventas: number,
  base_iva_ventas: decimal,
  iva_ventas: decimal
}
```

### Top Proveedores/Clientes
```javascript
[
  {
    razon_social: string,
    identificacion: string,
    total: decimal
  }
]
```

## Flujo de Trabajo

### Reporte de Resumen General
```
Usuario → Tab Resumen General → Seleccionar Periodo → Generar Reporte
→ Ver Dashboard con KPIs
→ Ver Top 5 Proveedores
→ Ver Top 5 Clientes
```

### Reporte Detallado (Compras/Ventas)
```
Usuario → Tab Compras/Ventas → Configurar Filtros
→ Click "Generar Reporte" → Ver Tabla Detallada
→ (Opcional) Exportar Excel/PDF
```

### Exportación de Reportes
```
Usuario → Configurar Filtros → Click "Exportar Excel" o "Exportar PDF"
→ Sistema genera archivo → Descarga automática
→ Notificación de éxito
```

## Integración con Backend

El módulo espera los siguientes endpoints:

```
GET /api/reportes/resumen-general        // Dashboard KPIs
    params: empresaId, periodo

GET /api/reportes/compras                // Reporte de compras
    params: empresaId, periodoInicio, periodoFin, estado, proveedor

GET /api/reportes/ventas                 // Reporte de ventas
    params: empresaId, periodoInicio, periodoFin, estado, cliente

GET /api/reportes/iva                    // Reporte de IVA
    params: empresaId, periodo

GET /api/reportes/top-proveedores        // Top proveedores
    params: empresaId, periodo, limit

GET /api/reportes/top-clientes           // Top clientes
    params: empresaId, periodo, limit

GET /api/reportes/exportar/:tipo         // Exportar a Excel
    params: empresaId, filtros...
    responseType: blob

GET /api/reportes/exportar-pdf/:tipo     // Exportar a PDF
    params: empresaId, filtros...
    responseType: blob

GET /api/reportes/estadisticas-periodo   // Estadísticas (gráficos)
    params: empresaId, periodoInicio, periodoFin
```

**Formato de respuesta:**
```javascript
{
  mensaje: "Reporte generado exitosamente",
  data: {...} o [...]
}
```

## Cálculos Implementados

### IVA por Pagar/Favor
```
IVA_Resultado = IVA_Ventas - IVA_Compras

Si IVA_Resultado >= 0: "IVA por Pagar" (empresa debe pagar al SRI)
Si IVA_Resultado < 0:  "IVA a Favor" (SRI debe devolver a empresa)
```

### Margen Bruto
```
Margen_Bruto = Total_Ventas - Total_Compras
Porcentaje_Margen = (Margen_Bruto / Total_Ventas) × 100
```

### Porcentaje del Total (Top Proveedores/Clientes)
```
Porcentaje = (Total_Proveedor/Cliente / Total_General) × 100
```

## Características Especiales

### 🎨 Colores Dinámicos
- **Compras**: Rojo (error.lighter)
- **Ventas**: Verde (success.lighter)
- **IVA por Pagar**: Amarillo (warning.lighter)
- **IVA a Favor**: Azul (info.lighter)
- **Margen Positivo**: Azul (primary.lighter)
- **Margen Negativo**: Rojo (error.lighter)

### 📊 KPIs Principales
1. **Total Compras**: Suma de todas las compras del periodo
2. **Total Ventas**: Suma de todas las ventas del periodo
3. **IVA Compras**: IVA pagado en compras (crédito tributario)
4. **IVA Ventas**: IVA cobrado en ventas (débito fiscal)
5. **IVA Neto**: Diferencia entre IVA ventas y compras
6. **Margen Bruto**: Diferencia entre ventas y compras

### 📁 Exportación de Archivos
- **Excel (.xlsx)**: Para análisis de datos
- **PDF (.pdf)**: Para impresión y archivo
- Descarga automática del archivo
- Nombre de archivo con timestamp
- Notificación de éxito/error

### 🔄 Actualización Automática
- ResumenGeneral se actualiza automáticamente al cambiar periodo
- Filtros mantienen valores entre tabs
- Loading states por componente

## Uso del Módulo

### Importar componentes
```javascript
import ResumenGeneral from '../components/Reportes/ResumenGeneral';
import FiltrosReporte from '../components/Reportes/FiltrosReporte';
import TablaReporte from '../components/Reportes/TablaReporte';
import reporteService from '../services/reporteService';
```

### Ejemplo: Cargar Resumen General
```javascript
const resumen = await reporteService.getResumenGeneral(empresaId, '01/2024');
```

### Ejemplo: Generar Reporte de Compras
```javascript
const compras = await reporteService.getReporteCompras({
  empresaId: 1,
  periodoInicio: '01/2024',
  periodoFin: '12/2024',
  estado: 'VALIDADO'
});
```

### Ejemplo: Exportar a Excel
```javascript
const blob = await reporteService.exportarExcel('compras', {
  empresaId: 1,
  periodo: '01/2024'
});

// Crear URL y descargar
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'reporte_compras.xlsx';
link.click();
window.URL.revokeObjectURL(url);
```

### Ejemplo: Usar TablaReporte
```javascript
const columnas = [
  { field: 'fecha', label: 'Fecha', tipo: 'date' },
  { field: 'proveedor', label: 'Proveedor' },
  { field: 'total', label: 'Total', tipo: 'currency', align: 'right' }
];

<TablaReporte
  datos={compras}
  columnas={columnas}
  titulo="Reporte de Compras"
  loading={false}
/>
```

## Próximas Mejoras Sugeridas

1. **Gráficos interactivos**: Integrar Chart.js o Recharts para gráficos
   - Evolución de compras/ventas por mes
   - Gráfico de torta de proveedores/clientes
   - Comparativa año anterior

2. **Filtros Avanzados**:
   - Rango de montos
   - Tipo de comprobante
   - Agrupación por proveedor/cliente

3. **Reportes Adicionales**:
   - Reporte de retenciones
   - Reporte de exportaciones
   - Análisis de crédito tributario

4. **Comparativas**:
   - Comparar periodos
   - Comparar con año anterior
   - Proyecciones y tendencias

5. **Alertas Automáticas**:
   - IVA a pagar muy alto
   - Margen bruto bajo
   - Anomalías en transacciones

6. **Programación de Reportes**:
   - Envío automático por email
   - Reportes recurrentes
   - Suscripciones a reportes

## Notas Importantes

⚠️ **Consideraciones:**
- Los reportes solo incluyen transacciones VALIDADAS por defecto
- Los periodos deben estar en formato MM/YYYY
- Las exportaciones generan archivos temporales en el servidor
- El resumen general se actualiza en tiempo real

✅ **Buenas prácticas:**
- Filtrar por rangos de periodos pequeños para mejor rendimiento
- Exportar solo los datos necesarios
- Revisar KPIs antes de tomar decisiones
- Validar datos antes de generar reportes oficiales

🔒 **Seguridad:**
- Los reportes solo muestran datos de la empresa del usuario autenticado
- Las exportaciones requieren autenticación
- Los archivos descargados se eliminan del servidor después de la descarga

---

**Módulo creado:** Enero 2025
**Versión:** 1.0.0
**Dependencias:** React, Material-UI, Axios
**Próximas actualizaciones:** Gráficos interactivos, reportes programados
