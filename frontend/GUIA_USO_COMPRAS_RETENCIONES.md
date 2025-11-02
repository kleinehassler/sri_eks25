# Guía de Uso - Formulario de Compras con Retenciones

## Descripción General

El formulario de compras ahora incluye una sección completa para registrar retenciones asociadas a cada compra. Esto permite crear compras con múltiples retenciones de Impuesto a la Renta (IR) e IVA en una sola operación.

## Características del Formulario

### 1. **Sección de Importación XML** (Solo al crear)
- Permite importar datos desde un archivo XML de factura electrónica del SRI
- Auto-completa todos los campos de la factura
- Muestra mensaje de confirmación cuando la importación es exitosa

### 2. **Datos del Proveedor**
Campos para identificar al proveedor:
- Tipo de Proveedor (Persona Natural, Sociedad, Extranjero)
- Tipo de Identificación (RUC, Cédula, Pasaporte, etc.)
- Identificación del Proveedor (RUC/Cédula)
- Razón Social del Proveedor

### 3. **Datos del Comprobante**
Información de la factura:
- Tipo de Comprobante
- Establecimiento (3 dígitos)
- Punto de Emisión (3 dígitos)
- Secuencial (hasta 9 dígitos)
- Número de Autorización (49 dígitos)
- Fecha de Emisión
- Fecha de Registro
- Periodo (MM/YYYY)
- Código de Sustento

### 4. **Valores**
Bases imponibles e impuestos:
- Base Imponible IVA (con botón "Calcular" para IVA 15%)
- Monto IVA
- Base Imponible 0%
- Base No Objeto de IVA
- Base Exento de IVA
- Monto ICE
- **Total Compra** (calculado automáticamente)

### 5. **Información de Pago**
- Forma de Pago (catálogo SRI)
- País de Pago (código ISO)

### 6. **Retenciones** ⭐ NUEVA FUNCIONALIDAD

Sección completa para agregar múltiples retenciones a la compra.

## Cómo Usar la Sección de Retenciones

### Agregar una Retención

1. **Completar Datos del Comprobante de Retención:**
   - **Fecha de Emisión**: ✨ **Se auto-completa** con la fecha de emisión de la compra (editable)
   - **Establecimiento**: 3 dígitos (ej: 001)
   - **Punto de Emisión**: 3 dígitos (ej: 001)
   - **Secuencial**: Hasta 9 dígitos
   - **Tipo de Impuesto**: Seleccionar "Impuesto a la Renta" o "IVA"
   - **Número de Autorización**: 49 dígitos de la clave de acceso

2. **Completar Datos de la Retención:**
   - **Código de Retención**: Seleccionar del catálogo según el tipo de impuesto
     - Para IR: 303, 304, 310, 320, 332, etc.
     - Para IVA: 10%, 20%, 30%, 50%, 70%, 100%
   - **Base Imponible**: ✨ **Se auto-completa inteligentemente** según el tipo de impuesto seleccionado (editable)
     - **Si es RENTA**: Suma de todas las bases (Base IVA + Base 0% + Base No Objeto + Base Exento)
     - **Si es IVA**: Monto del IVA de la compra
   - **Porcentaje**: Se auto-completa para IVA, editable para IR
   - **Valor Retenido**: Se calcula automáticamente
   - **Observaciones**: Texto opcional descriptivo

3. **Hacer clic en "Agregar Retención"**

> **💡 Nota**: Los campos de Fecha de Emisión y Base Imponible se auto-completan automáticamente para facilitar el registro, pero pueden modificarse según sea necesario.

### Características Especiales

#### 🎯 Auto-completado Inteligente (NUEVO)
- **Fecha de Emisión de Retención**: Se completa automáticamente con la fecha de emisión de la compra
  - Ahorra tiempo al registrar
  - Editable si la retención tiene fecha diferente
- **Base Imponible de Retención**: Se completa automáticamente de forma **inteligente** según el tipo de impuesto
  - **Si tipo es RENTA**: Base IVA + Base 0% + Base No Objeto + Base Exento (suma total de bases)
  - **Si tipo es IVA**: Monto IVA de la compra
  - **Cambio automático**: Al cambiar el tipo de impuesto, la base se actualiza automáticamente
  - Siempre editable si la retención es sobre un monto específico diferente

#### Cálculo Automático
- El **Valor Retenido** se calcula automáticamente cuando se ingresan:
  - Base Imponible
  - Porcentaje de Retención
- Fórmula: `Valor Retenido = (Base Imponible × Porcentaje) / 100`

#### Auto-completado para IVA
- Al seleccionar un código de retención de IVA:
  - El **Porcentaje** se completa automáticamente
  - El **Valor Retenido** se calcula inmediatamente
  - Ejemplo: Código "30" → 30%

#### Múltiples Retenciones de IR
- Se pueden agregar múltiples retenciones de IR con diferentes códigos
- Ejemplo: 303 (1%) + 332 (2%) en la misma compra
- Útil cuando hay servicios profesionales + otros servicios

### Editar una Retención

1. Hacer clic en el ícono de **Editar** (lápiz) en la tabla de retenciones
2. Los datos se cargan en el formulario
3. Modificar los campos necesarios
4. Hacer clic en **"Actualizar Retención"**

### Eliminar una Retención

1. Hacer clic en el ícono de **Eliminar** (papelera) en la tabla de retenciones
2. La retención se elimina inmediatamente

### Cancelar Edición

Si está editando una retención y desea cancelar:
1. Hacer clic en el botón **"Cancelar"**
2. El formulario se limpia y vuelve al modo de agregar

## Tabla de Retenciones

La tabla muestra todas las retenciones agregadas con:
- **Tipo**: Badge de color (IVA = azul, RENTA = morado)
- **Código**: Código de retención SRI
- **Comprobante**: Número completo (Est-Pto-Sec)
- **Base Imponible**: En formato monetario
- **Porcentaje**: Porcentaje aplicado
- **Valor Retenido**: En rojo, calculado
- **Observaciones**: Texto descriptivo
- **Acciones**: Editar y Eliminar

### Totales Automáticos

Al final de la tabla se muestran dos filas de totales:
- **Total Retención IVA**: Suma de todas las retenciones de tipo IVA
- **Total Retención IR**: Suma de todas las retenciones de tipo RENTA

Estos totales se actualizan automáticamente al agregar/editar/eliminar retenciones.

## Flujos de Trabajo

### Flujo 1: Crear Compra con Retenciones desde Cero

1. Abrir formulario "Nueva Compra"
2. Completar datos del proveedor
3. Completar datos del comprobante
4. Ingresar valores (bases e IVA)
5. Ir a la sección "Retenciones"
6. Agregar cada retención necesaria
7. Verificar totales en la tabla
8. Hacer clic en **"Crear"**

### Flujo 2: Importar Factura y Agregar Retenciones

1. Abrir formulario "Nueva Compra"
2. En la sección "Importar desde XML":
   - Seleccionar archivo XML de factura
   - Hacer clic en "Importar"
   - Verificar que los datos se auto-completen
3. Ir a la sección "Retenciones"
4. Agregar cada retención manualmente
5. Hacer clic en **"Crear"**

### Flujo 3: Editar Compra Existente

1. En la tabla de compras, hacer clic en "Editar"
2. El formulario se abre con todos los datos, incluidas las retenciones
3. Modificar campos de la compra si es necesario
4. En la sección "Retenciones":
   - Editar retenciones existentes
   - Agregar nuevas retenciones
   - Eliminar retenciones si es necesario
5. Hacer clic en **"Actualizar"**

## Códigos de Retención Comunes

### Impuesto a la Renta (IR)

| Código | Descripción | Porcentaje |
|--------|-------------|------------|
| 303 | Servicios predomina intelecto | 1% |
| 304 | Servicios predomina mano de obra | 2% |
| 310 | Honorarios profesionales | 10% |
| 320 | Arrendamiento inmuebles | 8% |
| 323 | Arrendamiento mercantil | 1% |
| 332 | Otros servicios | 2% |
| 340 | Transporte privado de pasajeros | 1% |
| 341 | Transporte público de pasajeros | 1% |
| 343 | Publicidad y comunicación | 1% |

### Retención de IVA

| Código | Descripción | Porcentaje |
|--------|-------------|------------|
| 10 | Retención 10% | 10% |
| 20 | Retención 20% | 20% |
| 30 | Retención 30% | 30% |
| 50 | Retención 50% | 50% |
| 70 | Retención 70% | 70% |
| 100 | Retención 100% | 100% |

## Validaciones

El formulario valida:

### Campos de Compra
✅ Todos los campos requeridos están completos
✅ Formato correcto de RUC/Cédula
✅ Formato de establecimiento (3 dígitos)
✅ Formato de punto de emisión (3 dígitos)
✅ Formato de secuencial (hasta 9 dígitos)
✅ Número de autorización (10-49 dígitos)
✅ Fechas no futuras
✅ Periodo en formato MM/YYYY
✅ Valores monetarios no negativos

### Campos de Retención
✅ Fecha de emisión requerida
✅ Datos del comprobante completos
✅ Número de autorización requerido
✅ Código de retención seleccionado
✅ Base imponible mayor a 0
✅ Cálculos correctos

## Mensajes de Error Comunes

| Error | Solución |
|-------|----------|
| "La fecha de emisión es requerida" | Seleccionar fecha en el campo correspondiente |
| "Los datos del comprobante son requeridos" | Completar establecimiento, punto y secuencial |
| "El número de autorización es requerido" | Ingresar los 49 dígitos de la clave de acceso |
| "El código de retención es requerido" | Seleccionar un código del menú desplegable |
| "La base imponible debe ser mayor a 0" | Ingresar un valor positivo en base imponible |

## Consejos de Uso

### ✨ Mejores Prácticas

1. **Completar primero los datos de la compra**: Esto permitirá que la fecha y base imponible se auto-completen en las retenciones
2. **Importar XML cuando sea posible**: Reduce errores de digitación
3. **Verificar valores auto-completados**: Aunque la fecha y base se auto-completan, siempre verificar que sean correctos
4. **Modificar base si es necesario**: Si la retención es sobre un monto específico diferente al total, editar la base imponible
5. **Verificar totales**: Antes de guardar, verificar que los totales de retención sean correctos
6. **Usar observaciones**: Agregar notas en cada retención para referencia futura
7. **Múltiples retenciones**: No hay límite, agregar todas las necesarias
8. **Editar con cuidado**: Al editar, revisar que todos los datos sigan siendo correctos

### ⚡ Atajos de Teclado

- **Tab**: Navegar entre campos
- **Enter**: En campos de texto numérico, calcular automáticamente
- **Escape**: Cerrar modal (si implementado)

### 🎯 Casos de Uso Frecuentes

#### Caso 1: Factura con retención de IR y IVA (Base auto-completada inteligente)
```
Compra registrada:
  - Base IVA: $1,000
  - Base 0%: $0
  - IVA 15%: $150
  - Total: $1,150

Al agregar primera retención (IR):
  ✨ Fecha: Se auto-completa con fecha de la compra
  ✨ Tipo: RENTA (seleccionado)
  ✨ Base Imponible: $1,000 (auto-completada = suma de bases)

Retención IR:
  - Código: 303 (1%)
  - Porcentaje: 1%
  - Valor retenido: $10 (auto-calculado)

Al agregar segunda retención (IVA):
  ✨ Fecha: Se auto-completa con fecha de la compra
  ✨ Tipo: IVA (seleccionado)
  ✨ Base Imponible: $150 (auto-completada AUTOMÁTICAMENTE = monto IVA)

Retención IVA:
  - Código: 30 (30%)
  - Porcentaje: 30% (auto-completado)
  - Valor retenido: $45 (auto-calculado)

Total a pagar: $1,150 - $10 - $45 = $1,095
```

#### Caso 2: Cambio de tipo de retención (comportamiento automático)
```
Compra registrada:
  - Base IVA: $800
  - Base 0%: $200
  - IVA 15%: $120
  - Total: $1,120

Usuario comienza agregando retención:
  ✨ Tipo: RENTA (seleccionado inicialmente)
  ✨ Base Imponible: $1,000 (suma de bases: $800 + $200)

Usuario cambia de opinión y selecciona:
  🔄 Tipo: IVA (cambiado)
  ✨ Base Imponible: $120 (ACTUALIZADA AUTOMÁTICAMENTE a monto IVA)
  ✨ Código: 30
  ✨ Porcentaje: 30% (auto-completado)
  ✨ Valor retenido: $36 (auto-calculado)

Si vuelve a cambiar:
  🔄 Tipo: RENTA (cambiado nuevamente)
  ✨ Base Imponible: $1,000 (ACTUALIZADA AUTOMÁTICAMENTE a suma de bases)

Conclusión: El sistema ajusta inteligentemente la base según el tipo seleccionado.
```

#### Caso 3: Servicios profesionales (múltiples retenciones IR)
```
Compra: $2,000 (Base IVA) + $300 (IVA 15%) = $2,300

Primera retención IR (Honorarios):
  ✨ Tipo: RENTA
  ✨ Base: $2,000 (auto-completada)
  - Código: 310 (10%)
  - Modificar base manualmente a: $1,000
  - Valor retenido: $100

Segunda retención IR (Otros servicios):
  ✨ Tipo: RENTA
  ✨ Base: $2,000 (auto-completada nuevamente)
  - Código: 332 (2%)
  - Modificar base manualmente a: $1,000
  - Valor retenido: $20

Retención IVA:
  ✨ Tipo: IVA
  ✨ Base: $300 (auto-completada = monto IVA)
  - Código: 30 (30%)
  - Valor retenido: $90

Total retenciones: $100 + $20 + $90 = $210
```

## Integración con Backend

El formulario envía los datos en el siguiente formato:

```json
{
  "periodo": "01/2025",
  "tipo_proveedor": "02",
  "identificacion_proveedor": "1234567890001",
  "razon_social_proveedor": "EMPRESA S.A.",
  "...otros campos...",
  "retenciones": [
    {
      "fecha_emision": "2025-01-15",
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000456",
      "numero_autorizacion": "1234567890...",
      "tipo_impuesto": "RENTA",
      "codigo_retencion": "303",
      "base_imponible": 1000.00,
      "porcentaje_retencion": 1.00,
      "valor_retenido": 10.00,
      "observaciones": "Servicios profesionales"
    },
    {
      "tipo_impuesto": "IVA",
      "codigo_retencion": "30",
      "...otros campos..."
    }
  ]
}
```

## Estados de la Compra

- **BORRADOR**: Recién creada, editable
- **VALIDADO**: Validada por contador, aún editable
- **INCLUIDO_ATS**: Incluida en ATS generado, **NO EDITABLE**
- **ANULADO**: Compra anulada

**Nota**: Solo las compras en estado BORRADOR o VALIDADO pueden ser editadas.

## Soporte

Si encuentra algún problema o tiene sugerencias:
1. Verificar que todos los campos requeridos estén completos
2. Revisar la consola del navegador (F12) para mensajes de error
3. Verificar conexión con el backend
4. Contactar al administrador del sistema
