# Módulo de Importación XML - Frontend

## 📋 Descripción

Módulo completo para la importación masiva de archivos XML del SRI (Servicio de Rentas Internas de Ecuador). Permite importar facturas electrónicas y comprobantes de retención directamente desde archivos XML, extrayendo automáticamente todos los datos necesarios para registrarlos como compras en el sistema.

## ✅ Características Implementadas

### 1. Componente Drag & Drop (`XMLUploader.jsx`)
- ✅ **Zona de arrastrar y soltar archivos**
  - Área visual con feedback cuando se arrastra un archivo
  - Cambio de color y animación al arrastrar
  - Soporte para múltiples archivos simultáneos
- ✅ **Botón de selección de archivos**
  - Input de archivos alternativo
  - Soporte para selección múltiple
- ✅ **Validaciones automáticas:**
  - Solo archivos .xml
  - Tamaño máximo 5MB por archivo
  - Límite configurable de archivos (default: 10)
  - Detección de duplicados
- ✅ **Lista de archivos seleccionados**
  - Vista previa con nombre y tamaño
  - Chips indicadores (tamaño, tipo)
  - Botón para eliminar archivos individuales
  - Botón para limpiar todos
- ✅ **Mensajes de error descriptivos**
  - Alertas de validación
  - Errores específicos por archivo

### 2. Componente de Preview (`XMLPreview.jsx`)
- ✅ **Preview de Facturas (Compras)**
  - Acordeones organizados por sección
  - Información del Proveedor
  - Datos del Comprobante
  - Valores e Impuestos (tabla detallada)
  - Información Adicional
- ✅ **Preview de Retenciones**
  - Información básica del comprobante
  - Tabla de detalle de retenciones
  - Códigos y porcentajes
- ✅ **Formateo de datos**
  - Moneda en USD ($1,234.56)
  - Fechas en formato ecuatoriano
  - Chips de colores por tipo
- ✅ **Detección de advertencias**
  - Datos faltantes
  - Valores inconsistentes
  - Alertas visuales

### 3. Página de Importación (`ImportarXML.jsx`)
- ✅ **Stepper de 3 pasos:**
  1. **Subir Archivos** - Configuración y carga
  2. **Revisar Datos** - Preview de extracción
  3. **Confirmar Importación** - Resultados finales
- ✅ **Configuración inicial:**
  - Selector de tipo de documento (Factura/Retención)
  - Campo de periodo (MM/YYYY)
  - Validación de campos requeridos
- ✅ **Previsualización inteligente**
  - Procesa primer archivo para preview
  - Indica cuántos archivos se importarán en total
- ✅ **Diálogo de confirmación**
  - Resumen antes de importar
  - Tipo, periodo y cantidad de archivos
  - Advertencia sobre acción
- ✅ **Proceso de importación**
  - Barra de progreso
  - Importación secuencial de todos los archivos
  - Manejo de errores por archivo
- ✅ **Pantalla de resultados**
  - Cards con resumen (exitosos/errores)
  - Lista de archivos con error y su mensaje
  - Botones para importar más o ir a compras

### 4. Servicio de API (`xmlImportService.js`)
- ✅ Integración con backend
- ✅ Soporte para FormData (archivos)
- ✅ 4 métodos principales:
  - previsualizar()
  - importarFactura()
  - importarRetencion()
  - importarMultiple()

**Endpoints utilizados:**
```javascript
POST /api/xml/previsualizar      // Preview sin guardar
POST /api/xml/importar-factura   // Importar factura
POST /api/xml/importar-retencion // Importar retención
```

## 🎨 Interfaz de Usuario

### Paso 1: Subir Archivos

```
┌─────────────────────────────────────────────┐
│ Configuración de Importación               │
├─────────────────────────────────────────────┤
│ [Tipo: Factura ▼]  [Periodo: 01/2024]     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            ☁️ CloudUploadIcon               │
│                                             │
│     Arrastra archivos XML aquí             │
│                  o                          │
│        [📤 Seleccionar Archivos]           │
│                                             │
│   Archivos XML del SRI • Máx 10 • 5MB     │
└─────────────────────────────────────────────┘

✅ Archivos Seleccionados (3)    [🗑️ Limpiar]
┌─────────────────────────────────────────────┐
│ 📄 factura_001.xml       [1.2 MB] [XML]   │
│ 📄 factura_002.xml       [850 KB] [XML]   │
│ 📄 factura_003.xml       [1.5 MB] [XML]   │
└─────────────────────────────────────────────┘
```

### Paso 2: Revisar Datos

```
┌─────────────────────────────────────────────┐
│ ✅ Archivo XML procesado correctamente     │
└─────────────────────────────────────────────┘

▼ 📋 Información del Proveedor
  RUC: 1790123456001
  Razón Social: PROVEEDOR EJEMPLO S.A.
  Establecimiento: 001

▼ 📄 Datos del Comprobante
  Tipo: [01 - Factura]
  Autorización: 1234567890123456789
  Fecha: 15/01/2024

▼ 💰 Valores e Impuestos
  ┌─────────────────────┬─────────────┐
  │ Base IVA           │   $1,000.00 │
  │ Base 0%            │     $200.00 │
  │ IVA                │     $150.00 │
  │ Total              │ $ 1,350.00 │
  └─────────────────────┴─────────────┘
```

### Paso 3: Confirmar Importación

```
┌─────────────────────────────────────────────┐
│ ✅ ¡Importación Completada!                │
└─────────────────────────────────────────────┘

┌───────────────┐  ┌───────────────┐
│      3        │  │      0        │
│  Importados   │  │    Errores    │
└───────────────┘  └───────────────┘

[Importar Más]  [Ir a Compras]
```

## 🚀 Flujo de Uso

### Importar Facturas XML

1. **Navegar al módulo**
   - Menú lateral > "Importar XML"

2. **Configurar importación**
   - Tipo: Factura (Compra)
   - Periodo: Ej. 01/2024

3. **Subir archivos**
   - Arrastrar archivos XML al área
   - O clic en "Seleccionar Archivos"
   - Máximo 10 archivos, 5MB cada uno

4. **Revisar datos**
   - Clic en "Siguiente"
   - Se muestra preview del primer archivo
   - Revisar información extraída
   - Verificar valores

5. **Confirmar importación**
   - Clic en "Confirmar Importación"
   - Diálogo de confirmación
   - Confirmar

6. **Ver resultados**
   - Resumen de archivos importados
   - Ver errores si los hay
   - Ir a Compras o importar más

### Importar Retenciones XML

1. **Configurar**
   - Tipo: Comprobante de Retención
   - Periodo: Ej. 01/2024

2. **Subir retenciones**
   - Archivos XML de retenciones del SRI

3. **Revisar**
   - Preview mostrará datos de retención
   - Tabla de detalles de retenciones

4. **Confirmar**
   - Se vincularán a compras existentes por RUC

## 📦 Estructura de Archivos

```
frontend/src/
├── pages/
│   └── ImportarXML.jsx                 # Página principal con stepper
├── components/
│   └── XML/
│       ├── XMLUploader.jsx            # Drag & drop uploader
│       └── XMLPreview.jsx             # Preview de datos extraídos
└── services/
    └── xmlImportService.js            # Integración con API
```

## 🧪 Validaciones

### Validaciones del Uploader

| Validación | Regla | Mensaje |
|-----------|-------|---------|
| Extensión | Solo .xml | "Solo se aceptan archivos XML" |
| Tamaño | Máximo 5MB | "El archivo no debe superar 5MB" |
| Duplicados | Nombre y tamaño únicos | "Este archivo ya fue agregado" |
| Límite | Máximo 10 archivos | "Solo puedes subir un máximo de 10 archivos" |

### Validaciones de Configuración

| Campo | Regla | Mensaje |
|-------|-------|---------|
| Tipo | Obligatorio | - |
| Periodo | Formato MM/YYYY | "El periodo debe tener el formato MM/YYYY" |
| Archivos | Al menos 1 | "Debes seleccionar al menos un archivo XML" |

### Advertencias en Preview

- ❌ RUC del proveedor faltante
- ❌ Razón social faltante
- ❌ Número de autorización faltante
- ❌ Total de compra ≤ 0
- ❌ Datos inconsistentes

## 🎯 Características Especiales

### 1. Importación Múltiple
- Sube hasta 10 archivos XML a la vez
- Procesamiento secuencial
- Reporte individual por archivo
- Continúa aunque algunos fallen

### 2. Preview Inteligente
- Extrae datos sin guardar
- Valida estructura del XML
- Detecta errores antes de importar
- Muestra preview del primer archivo

### 3. Manejo de Errores Robusto
```javascript
{
  results: [
    { file: 'factura1.xml', success: true, data: {...} },
    { file: 'factura2.xml', success: true, data: {...} }
  ],
  errors: [
    { file: 'factura3.xml', success: false, error: 'XML mal formado' }
  ]
}
```

### 4. Formateo Regional (Ecuador)
- Moneda: USD con formato $1,234.56
- Fechas: DD/MM/YYYY
- Locale: es-EC

## 💡 Datos Extraídos del XML

### De Facturas Electrónicas

**Información del Proveedor:**
- RUC (identificación)
- Razón social
- Dirección
- Establecimiento

**Datos del Comprobante:**
- Tipo de comprobante
- Número de autorización
- Fecha de emisión
- Serie y secuencial

**Valores:**
- Base imponible IVA
- Base imponible 0%
- Base no objeto de IVA
- Monto IVA
- Monto ICE
- Total de la compra

### De Comprobantes de Retención

**Información Básica:**
- RUC del proveedor
- Número de autorización
- Fecha de emisión
- Base imponible

**Detalle de Retenciones:**
- Código de retención
- Tipo (IVA/Renta)
- Base
- Porcentaje
- Valor retenido

## 🔐 Seguridad

- ✅ Solo archivos .xml aceptados
- ✅ Validación de tamaño (5MB max)
- ✅ Token JWT en todas las peticiones
- ✅ empresa_id del usuario autenticado
- ✅ Validación de XML en backend
- ✅ Sanitización de datos extraídos

## 📱 Responsividad

- ✅ Stepper adaptativo (horizontal/vertical)
- ✅ Zona drag & drop responsive
- ✅ Lista de archivos stack en móviles
- ✅ Acordeones colapsables
- ✅ Tablas con scroll horizontal
- ✅ Diálogos fullscreen en móvil

## 🎨 Elementos Visuales

### Iconos Utilizados
- 📤 UploadFileIcon - Encabezado del módulo
- ☁️ CloudUploadIcon - Zona de carga
- 📄 InsertDriveFileIcon - Archivos en lista
- ✅ CheckCircleIcon - Éxito
- ⚠️ WarningIcon - Advertencias
- ℹ️ InfoIcon - Información
- 🔽 ExpandMoreIcon - Acordeones
- ⬅️ ArrowBackIcon - Atrás
- ➡️ ArrowForwardIcon - Siguiente
- 💾 SaveIcon - Confirmar

### Colores por Estado
- 🟢 Verde (success) - Importación exitosa
- 🔴 Rojo (error) - Errores
- 🔵 Azul (primary) - Elementos principales
- 🟠 Naranja (warning) - Advertencias
- ⚪ Gris (default) - Neutral

## 🐛 Manejo de Errores

### Errores Comunes

**"Solo se aceptan archivos XML"**
- Causa: Archivo con extensión incorrecta
- Solución: Usar solo archivos .xml del SRI

**"El archivo no debe superar 5MB"**
- Causa: Archivo demasiado grande
- Solución: Dividir en múltiples XMLs o comprimir

**"XML mal formado"**
- Causa: Estructura XML inválida
- Solución: Verificar que el XML sea del SRI válido

**"No se pudo extraer el RUC del proveedor"**
- Causa: XML sin campo de RUC
- Solución: Verificar estructura del XML

**"El periodo debe tener el formato MM/YYYY"**
- Causa: Formato de periodo incorrecto
- Solución: Usar formato 01/2024

## 💾 Integración con Backend

### Flujo de Datos

```
1. Usuario sube XML
   ↓
2. Frontend valida archivo
   ↓
3. POST /api/xml/previsualizar
   ↓
4. Backend parsea XML
   ↓
5. Frontend muestra preview
   ↓
6. Usuario confirma
   ↓
7. POST /api/xml/importar-factura
   ↓
8. Backend guarda en BD
   ↓
9. Frontend muestra resultados
```

### Estructura de FormData

```javascript
const formData = new FormData();
formData.append('xmlFile', file);
formData.append('empresaId', empresaId);
formData.append('periodo', periodo);
```

## ✅ Checklist de Implementación

- [x] Servicio de API (xmlImportService.js)
- [x] Componente drag & drop (XMLUploader.jsx)
- [x] Componente preview (XMLPreview.jsx)
- [x] Página principal con stepper (ImportarXML.jsx)
- [x] Validación de archivos
- [x] Previsualización de datos
- [x] Diálogo de confirmación
- [x] Importación múltiple
- [x] Manejo de errores
- [x] Pantalla de resultados
- [x] Formateo de moneda y fechas
- [x] Acordeones organizados
- [x] Responsive design
- [x] Integración con AuthContext
- [x] Ruta en App.jsx
- [x] Opción en menú
- [x] Documentación

## 🎉 Estado Final

**✅ MÓDULO COMPLETO Y FUNCIONAL**

Todos los requerimientos solicitados han sido implementados:
1. ✅ Componente drag & drop
2. ✅ Preview de datos extraídos
3. ✅ Confirmación de importación

### Características Adicionales Implementadas:
- ✅ Stepper de 3 pasos
- ✅ Validación completa de archivos
- ✅ Importación múltiple (hasta 10 archivos)
- ✅ Detección de advertencias
- ✅ Acordeones organizados
- ✅ Pantalla de resultados detallada
- ✅ Formateo regional
- ✅ Manejo robusto de errores

El módulo está listo para usar una vez que:
- El backend esté corriendo en `http://localhost:3000`
- El frontend esté corriendo en `http://localhost:5173`
- Las dependencias estén instaladas
- MySQL esté configurado
- Haya al menos una empresa creada

## 📝 Notas de Uso

### Flujo Recomendado
1. Crear empresa (módulo Empresas)
2. Descargar XMLs del SRI
3. Importar XMLs (módulo Importar XML)
4. Revisar compras importadas (módulo Compras)
5. Validar compras
6. Generar ATS (módulo Generar ATS)

### Mejores Prácticas
- Importar por periodo consistente
- Revisar preview antes de confirmar
- Verificar que el periodo coincida con fecha de emisión
- Corregir errores antes de validar compras
- Mantener archivos XML originales como respaldo

### Limitaciones
- Máximo 10 archivos por importación
- Máximo 5MB por archivo
- Solo archivos .xml del SRI de Ecuador
- Formatos soportados: Factura V2.1.0, Retención V2.0.0

## 🚀 Futuras Mejoras

- [ ] Importación de Liquidaciones de Compra
- [ ] Importación de Notas de Crédito
- [ ] Vista previa de todos los archivos (no solo el primero)
- [ ] Validación XSD contra esquemas del SRI
- [ ] Importación desde ZIP comprimido
- [ ] Historial de importaciones
- [ ] Exportar resultados de importación
- [ ] Detección automática de periodo desde XML
- [ ] Vinculación automática de retenciones a compras
