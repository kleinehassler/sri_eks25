# Módulo de Generación ATS - Frontend

## 📋 Descripción

Módulo completo para la generación del Anexo Transaccional Simplificado (ATS) en formato XML conforme a las especificaciones del SRI de Ecuador. Permite seleccionar periodo, previsualizar transacciones, generar el archivo XML y descargarlo en formato XML o ZIP para su presentación al SRI.

## ✅ Características Implementadas

### 1. Selector de Periodo (`PeriodoSelector.jsx`)
- ✅ **Selección de mes y año**
  - Dropdown de meses (Enero-Diciembre)
  - Dropdown de años (últimos 5 años)
  - Valores pre-seleccionados con mes/año actual
- ✅ **Validaciones:**
  - Periodo no puede ser futuro
  - Empresa debe estar seleccionada
  - Mes y año son obligatorios
- ✅ **Botón de búsqueda**
  - Icono SearchIcon
  - Llama al callback con periodo en formato MM/YYYY
- ✅ **Información contextual**
  - Nota sobre transacciones VALIDADAS
  - Advertencia sobre formato XML del SRI

### 2. Preview de Transacciones (`TransaccionesPreview.jsx`)
- ✅ **Cards de resumen**
  - Compras (azul) con total y monto
  - Ventas (verde) con total y monto
  - Exportaciones (naranja) con total y monto
- ✅ **Alertas inteligentes:**
  - Verde: Transacciones encontradas
  - Naranja: Advertencias (sin transacciones, totales en 0)
- ✅ **Acordeones con detalle:**
  - Tabla de compras (hasta 10 registros)
  - Tabla de ventas (hasta 10 registros)
  - Nota: "Todas se incluirán en el ATS"
- ✅ **Resumen de totales:**
  - Base Imponible IVA
  - IVA Total
  - Total Compras
  - Total Ventas
- ✅ **Información del archivo**
  - Nombre: ATSmmAAAA.xml
  - Formato: ZIP para descarga

### 3. Página GenerarATS (`GenerarATS.jsx`)
- ✅ **Flujo completo de generación:**
  1. Seleccionar periodo
  2. Cargar preview automático
  3. Revisar transacciones
  4. Confirmar generación
  5. Descargar archivos
- ✅ **Estados de carga:**
  - LinearProgress al cargar preview
  - CircularProgress al generar
  - Deshabilitar botones durante proceso
- ✅ **Diálogo de confirmación:**
  - Resumen de transacciones
  - Advertencia sobre validación
  - Botón Generar con loading
- ✅ **Área de descarga:**
  - Fondo verde de éxito
  - Botones para XML y ZIP
  - Información del archivo
  - Fecha de generación
- ✅ **Información adicional:**
  - Lista de notas importantes
  - Formato correcto del ATS

### 4. Servicio de API (`atsService.js`)
- ✅ Integración completa con backend
- ✅ 6 métodos principales:
  - obtenerResumen()
  - previsualizar()
  - generar()
  - descargar()
  - obtenerHistorial()
  - validar()
- ✅ Manejo de Blobs para descargas

**Endpoints utilizados:**
```javascript
GET  /api/ats/resumen          // Resumen de transacciones
POST /api/ats/previsualizar    // Preview sin generar
POST /api/ats/generar          // Generar ATS
GET  /api/ats/descargar/:id    // Descargar archivo
GET  /api/ats/historial        // Historial de ATS
POST /api/ats/validar          // Validar antes de generar
```

## 🎨 Interfaz de Usuario

### Vista Principal

```
┌───────────────────────────────────────────────┐
│ 📄 Generar Anexo Transaccional Simplificado  │
├───────────────────────────────────────────────┤
│                                               │
│ 📅 Seleccionar Periodo                       │
│ ┌──────────┬──────────┬───────────────────┐ │
│ │ [Enero▼] │ [2024▼]  │ [🔍 Buscar Trans] │ │
│ └──────────┴──────────┴───────────────────┘ │
│                                               │
│ ℹ️ Solo transacciones VALIDADAS              │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│ Transacciones del Periodo: 01/2024           │
│                           [▶️ Generar ATS]    │
├───────────────────────────────────────────────┤
│ ✅ 25 transacciones validadas encontradas    │
│                                               │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│ │    20    │  │    5     │  │    0     │   │
│ │ Compras  │  │  Ventas  │  │Exportaci.│   │
│ │$45,230   │  │$12,500   │  │  $0.00   │   │
│ └──────────┘  └──────────┘  └──────────┘   │
│                                               │
│ ▼ 🛒 Detalle de Compras (20)                 │
│   [Tabla con 10 registros]                   │
│   Mostrando 10 de 20 compras...              │
│                                               │
│ 📊 Resumen de Totales                        │
│   Base IVA: $40,200 | IVA: $6,030           │
│   Total Compras: $45,230                     │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│ ✅ ATS Generado Exitosamente                 │
│ Archivo generado. Descargar:                 │
│                                               │
│ [📥 Descargar XML]  [📥 Descargar ZIP]       │
│                                               │
│ Archivo XML: ATS012024.xml                   │
│ Archivo ZIP: ATS012024.zip                   │
│ Fecha: 19/10/2024 12:30:45                   │
└───────────────────────────────────────────────┘
```

## 🚀 Flujo de Uso

### Generar ATS Completo

1. **Navegar al módulo**
   - Menú lateral > "Generar ATS"

2. **Seleccionar periodo**
   - Mes: Enero
   - Año: 2024
   - Clic en "Buscar Transacciones"

3. **Revisar preview automático**
   - Sistema carga transacciones VALIDADAS
   - Muestra cards de resumen
   - Muestra tablas detalladas
   - Calcula totales

4. **Verificar datos**
   - Revisar cantidad de compras
   - Revisar montos totales
   - Verificar que todas estén VALIDADAS
   - Revisar advertencias si las hay

5. **Generar ATS**
   - Clic en "Generar ATS"
   - Diálogo de confirmación
   - Revisar resumen
   - Confirmar

6. **Descargar archivos**
   - Área verde de éxito aparece
   - Opción 1: Descargar XML (para revisar)
   - Opción 2: Descargar ZIP (para SRI)
   - Archivo listo para presentación

## 📦 Estructura de Archivos

```
frontend/src/
├── pages/
│   └── GenerarATS.jsx                  # Página principal
├── components/
│   └── ATS/
│       ├── PeriodoSelector.jsx        # Selector mes/año
│       └── TransaccionesPreview.jsx   # Preview detallado
└── services/
    └── atsService.js                  # Integración con API
```

## 🧪 Validaciones

### Validaciones del Selector

| Validación | Regla | Mensaje |
|-----------|-------|---------|
| Empresa | Obligatoria | "Debes seleccionar una empresa primero" |
| Mes | Obligatorio | "Debes seleccionar un mes y año" |
| Año | Obligatorio | "Debes seleccionar un mes y año" |
| Periodo | No futuro | "No puedes generar ATS para un periodo futuro" |

### Validaciones antes de Generar

| Validación | Acción |
|-----------|--------|
| Sin transacciones | Mostrar warning, no permitir generar |
| Totales en 0 | Mostrar advertencia, permitir generar |
| Solo VALIDADAS | Filtrar automáticamente |

## 🎯 Características Especiales

### 1. Preview Automático
```javascript
// Al seleccionar periodo:
handlePeriodoSelected(periodo) {
  → Cargar transacciones VALIDADAS
  → Mostrar preview inmediatamente
  → Calcular totales
  → Detectar advertencias
}
```

### 2. Descarga de Archivos (Blob)
```javascript
const blob = await atsService.descargar(id, 'xml');
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'ATS012024.xml';
link.click();
```

### 3. Formateo de Nombres de Archivo
```
Periodo: 01/2024
  ↓
XML: ATS012024.xml
ZIP: ATS012024.zip
```

### 4. Estados del Proceso

```
[1. Inicial]
  ↓ Seleccionar periodo
[2. Cargando]
  ↓ Preview cargado
[3. Listo para generar]
  ↓ Clic "Generar ATS"
[4. Generando]
  ↓ ATS generado
[5. Listo para descargar]
  ↓ Descargar XML/ZIP
[6. Completado]
```

## 💰 Cálculos Realizados

### Totales por Tipo de Transacción
```javascript
totalCompras = compras.length
montoTotalCompras = Σ compra.total_compra

totalVentas = ventas.length
montoTotalVentas = Σ venta.total_venta

totalExportaciones = exportaciones.length
montoTotalExportaciones = Σ exportacion.total_exportacion
```

### Totales de Impuestos
```javascript
baseIvaCompras = Σ compra.base_imponible_iva
ivaCompras = Σ compra.monto_iva
```

## 📊 Cards de Resumen

| Card | Color | Icono | Datos |
|------|-------|-------|-------|
| Compras | Azul (primary) | 🛒 ShoppingCartIcon | Cantidad + Monto total |
| Ventas | Verde (success) | 💰 PointOfSaleIcon | Cantidad + Monto total |
| Exportaciones | Naranja (secondary) | ✈️ FlightTakeoffIcon | Cantidad + Monto total |

## 🔐 Integración y Seguridad

- ✅ empresa_id del usuario autenticado
- ✅ Solo transacciones VALIDADAS
- ✅ Periodo validado (no futuro)
- ✅ Token JWT en todas las peticiones
- ✅ Blob para descargas seguras
- ✅ Limpieza de URLs de objetos

## 📱 Responsividad

- ✅ Selector en grid (4+4+4 en desktop, stack en móvil)
- ✅ Cards de resumen en grid (3 columnas)
- ✅ Acordeones colapsables
- ✅ Tablas con scroll horizontal
- ✅ Botones de descarga adaptables

## 🎨 Elementos Visuales

### Iconos por Sección
| Sección | Icono | Color |
|---------|-------|-------|
| Header | 📄 DescriptionIcon | Primario |
| Calendario | 📅 CalendarMonthIcon | Primario |
| Buscar | 🔍 SearchIcon | - |
| Compras | 🛒 ShoppingCartIcon | Primario |
| Ventas | 💰 PointOfSaleIcon | Verde |
| Exportaciones | ✈️ FlightTakeoffIcon | Naranja |
| Generar | ▶️ GenerateIcon | - |
| Descargar | 📥 DownloadIcon | - |
| Advertencia | ⚠️ WarningIcon | Naranja |
| Éxito | ✅ CheckCircleIcon | Verde |

### Colores por Estado
- 🟢 Verde (success.lighter) - ATS generado
- 🔵 Azul (primary.light) - Compras
- 🟢 Verde (success.light) - Ventas
- 🟠 Naranja (secondary.light) - Exportaciones
- ⚪ Gris (grey.50) - Resumen de totales

## 🐛 Manejo de Errores

### Errores Comunes

**"Debes seleccionar una empresa primero"**
- Causa: empresa_id no está definido
- Solución: Verificar que el usuario esté autenticado

**"No puedes generar ATS para un periodo futuro"**
- Causa: Periodo seleccionado es posterior a la fecha actual
- Solución: Seleccionar mes/año actual o anterior

**"No hay transacciones validadas para generar el ATS"**
- Causa: No hay compras con estado VALIDADO en el periodo
- Solución: Validar compras primero en módulo Compras

**"Error al cargar las transacciones"**
- Causa: Backend no responde o error de red
- Solución: Verificar que backend esté corriendo

**"Error al generar el ATS"**
- Causa: Error en el backend al generar XML
- Solución: Verificar logs del backend, verificar datos de compras

**"Error al descargar el archivo"**
- Causa: Archivo no existe o error de permisos
- Solución: Regenerar ATS, verificar ruta de almacenamiento

## 💾 Integración con Backend

### Flujo de Datos

```
1. Seleccionar periodo (01/2024)
   ↓
2. GET /api/compras?periodo=01/2024&estado=VALIDADO
   ← {data: [compra1, compra2, ...]}
   ↓
3. Mostrar preview
   ↓
4. Clic "Generar ATS"
   ↓
5. POST /api/ats/generar {empresaId, periodo}
   ← {data: {id, archivo_xml, archivo_zip}}
   ↓
6. Mostrar área de descarga
   ↓
7. Clic "Descargar ZIP"
   ↓
8. GET /api/ats/descargar/:id?tipo=zip
   ← Blob (application/zip)
   ↓
9. Crear URL y descargar
```

### Estructura de Respuesta

```javascript
// POST /api/ats/generar
{
  "exito": true,
  "data": {
    "id": 123,
    "empresa_id": 1,
    "periodo": "01/2024",
    "archivo_xml": "ATS012024.xml",
    "archivo_zip": "ATS012024.zip",
    "ruta_archivo": "/storage/ats/1790123456001/",
    "created_at": "2024-10-19T12:30:45.000Z"
  }
}
```

## ✅ Checklist de Implementación

- [x] Servicio de API (atsService.js)
- [x] Componente selector de periodo (PeriodoSelector.jsx)
- [x] Componente preview de transacciones (TransaccionesPreview.jsx)
- [x] Página principal completa (GenerarATS.jsx)
- [x] Validación de periodo (no futuro)
- [x] Carga automática de preview
- [x] Cards de resumen
- [x] Acordeones con tablas detalladas
- [x] Cálculo de totales
- [x] Diálogo de confirmación
- [x] Proceso de generación
- [x] Área de descarga
- [x] Botones descargar XML/ZIP
- [x] Manejo de Blobs
- [x] Estados de carga
- [x] Formateo de moneda y fechas
- [x] Responsive design
- [x] Integración con AuthContext
- [x] Documentación

## 🎉 Estado Final

**✅ MÓDULO COMPLETO Y FUNCIONAL**

Todos los requerimientos solicitados han sido implementados:
1. ✅ **Selector de periodo**
2. ✅ **Preview de transacciones**
3. ✅ **Botón generar**
4. ✅ **Descarga de archivos**

### Características Adicionales Implementadas:
- ✅ Preview automático al seleccionar periodo
- ✅ Cards de resumen con totales
- ✅ Acordeones con tablas detalladas
- ✅ Validación de periodo no futuro
- ✅ Diálogo de confirmación
- ✅ Descarga de XML y ZIP
- ✅ Área de éxito con información del archivo
- ✅ Sistema de advertencias
- ✅ Formateo regional
- ✅ Estados de carga

El módulo está listo para usar una vez que:
- El backend esté corriendo en `http://localhost:3000`
- El frontend esté corriendo en `http://localhost:5173`
- Haya empresas creadas
- Haya compras validadas en el periodo

## 📝 Notas de Uso

### Flujo Típico de Trabajo
1. Crear empresa (módulo Empresas)
2. Importar compras desde XML (módulo Importar XML)
   O crear compras manualmente (módulo Compras)
3. Validar compras (módulo Compras)
4. **Generar ATS (módulo Generar ATS)**
5. Descargar ZIP
6. Subir al portal del SRI

### Mejores Prácticas
- Validar todas las compras antes de generar
- Verificar que el periodo coincida con facturas
- Revisar el preview antes de generar
- Descargar el ZIP (no solo XML) para el SRI
- Guardar copia de respaldo del archivo
- Generar ATS al final del mes/inicio siguiente

### Sobre el Archivo ATS
- **XML**: Para revisión y validación local
- **ZIP**: Para subir al portal del SRI
- Nombre: ATSmmAAAA.xml (mm=mes, AAAA=año)
- Formato: Conforme a XSD del SRI
- Validación: XSD en backend
- Compresión: ZIP estándar

## 🚀 Futuras Mejoras

- [ ] Historial de ATS generados (tabla)
- [ ] Re-generar ATS si se detectan cambios
- [ ] Validación previa contra XSD (frontend)
- [ ] Exportar preview a Excel/PDF
- [ ] Comparación entre periodos
- [ ] Gráficas de tendencias
- [ ] Envío directo al SRI (API del SRI)
- [ ] Notificaciones por email al generar
- [ ] Programación automática mensual
- [ ] Incluir retenciones en el ATS
