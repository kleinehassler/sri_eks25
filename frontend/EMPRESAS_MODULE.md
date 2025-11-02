# Módulo de Gestión de Empresas - Frontend

## 📋 Descripción

Módulo completo para la gestión de empresas en el Sistema ATS. Incluye todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) con validación de formularios y validación de RUC ecuatoriano.

## ✅ Características Implementadas

### 1. Tabla de Empresas (`EmpresasTable.jsx`)
- ✅ Listado completo de empresas con paginación
- ✅ Búsqueda en tiempo real por RUC, razón social o nombre comercial
- ✅ Ordenamiento de columnas
- ✅ Indicadores visuales (chips) para estado y régimen tributario
- ✅ Acciones rápidas: Editar, Activar/Desactivar, Eliminar
- ✅ Manejo de estados de carga
- ✅ Mensajes de error amigables
- ✅ Vista de "sin datos" cuando no hay empresas

**Columnas mostradas:**
- RUC
- Razón Social
- Nombre Comercial
- Régimen Tributario (GENERAL, RISE, RIMPE)
- Estado (ACTIVO, INACTIVO)
- Acciones

### 2. Formulario de Empresa (`EmpresaForm.jsx`)
- ✅ Modal responsive para crear/editar empresas
- ✅ Validación completa con Formik + Yup
- ✅ Validación de RUC ecuatoriano (algoritmo completo)
- ✅ Campos obligatorios y opcionales claramente marcados
- ✅ Mensajes de error en español
- ✅ Deshabilitar RUC en modo edición
- ✅ Indicadores de carga durante el guardado

**Campos del formulario:**
- **RUC*** (obligatorio, validación de dígito verificador)
- **Razón Social*** (obligatorio, 3-300 caracteres)
- **Nombre Comercial** (opcional, máx. 300 caracteres)
- **Régimen Tributario*** (obligatorio: GENERAL, RISE, RIMPE)
- **Dirección** (opcional, campo de texto multilínea)
- **Teléfono** (opcional, 7-15 dígitos)
- **Email** (opcional, validación de formato email)
- **Representante Legal** (opcional, máx. 200 caracteres)
- **Nombre del Contador** (opcional, máx. 200 caracteres)
- **RUC del Contador** (opcional, 10-13 dígitos)

### 3. Validación de RUC

Implementa el algoritmo completo de validación de RUC ecuatoriano:

#### Tipos de RUC validados:
1. **Persona Natural** (tercer dígito < 6)
   - Longitud: 10 dígitos
   - Algoritmo: Módulo 10

2. **Sociedad Privada** (tercer dígito = 9)
   - Longitud: 13 dígitos
   - Debe terminar en "001"
   - Algoritmo: Módulo 11

3. **Entidad Pública** (tercer dígito = 6)
   - Longitud: 13 dígitos
   - Debe terminar en "001"
   - Algoritmo: Módulo 11 con coeficientes diferentes

#### Validaciones adicionales:
- ✅ Código de provincia válido (01-24, 30)
- ✅ Formato numérico
- ✅ Longitud correcta
- ✅ Dígito verificador correcto

### 4. Servicio de API (`empresaService.js`)
- ✅ Integración completa con backend
- ✅ Manejo de errores
- ✅ Interceptor de axios para autenticación

**Endpoints utilizados:**
```javascript
GET    /api/empresas           // Listar todas
GET    /api/empresas/:id       // Obtener una
POST   /api/empresas           // Crear nueva
PUT    /api/empresas/:id       // Actualizar
DELETE /api/empresas/:id       // Eliminar
PATCH  /api/empresas/:id/estado // Cambiar estado
```

### 5. Página Principal (`Empresas.jsx`)
- ✅ Integración de todos los componentes
- ✅ Gestión de estado global del módulo
- ✅ Diálogo de confirmación para eliminar
- ✅ Notificaciones con Snackbar
- ✅ Manejo de errores centralizado
- ✅ Botón de "Nueva Empresa" prominente

## 🎨 Interfaz de Usuario

### Colores y Estilos
- **Estado ACTIVO**: Chip verde (success)
- **Estado INACTIVO**: Chip rojo (error)
- **Régimen GENERAL**: Chip azul (primary)
- **Régimen RISE**: Chip morado (secondary)
- **Régimen RIMPE**: Chip naranja (warning)

### Iconos Utilizados
- 🏢 BusinessIcon - Encabezado del módulo
- ➕ AddIcon - Botón nueva empresa
- ✏️ EditIcon - Editar empresa
- 🗑️ DeleteIcon - Eliminar empresa
- 🔄 ToggleOffIcon/ToggleOnIcon - Cambiar estado
- 🔍 SearchIcon - Búsqueda

## 🚀 Uso

### Crear Nueva Empresa
1. Clic en botón "Nueva Empresa"
2. Completar formulario (campos obligatorios marcados con *)
3. El RUC se valida automáticamente
4. Clic en "Crear"
5. Notificación de éxito/error

### Editar Empresa
1. Clic en icono de editar (lápiz) en la tabla
2. El formulario se abre pre-llenado
3. El RUC no se puede modificar
4. Modificar campos deseados
5. Clic en "Actualizar"
6. Notificación de éxito/error

### Activar/Desactivar Empresa
1. Clic en icono de toggle en la tabla
2. Confirmación inmediata sin diálogo
3. Notificación de éxito/error
4. Tabla se actualiza automáticamente

### Eliminar Empresa
1. Clic en icono de eliminar (basura) en la tabla
2. Se muestra diálogo de confirmación
3. Clic en "Eliminar" para confirmar
4. Notificación de éxito/error
5. Tabla se actualiza automáticamente

### Buscar Empresas
1. Escribir en el campo de búsqueda
2. Búsqueda en tiempo real
3. Busca en: RUC, razón social, nombre comercial
4. Paginación se reinicia automáticamente

## 📦 Estructura de Archivos

```
frontend/src/
├── pages/
│   └── Empresas.jsx                    # Página principal
├── components/
│   └── Empresas/
│       ├── EmpresasTable.jsx          # Tabla con listado
│       └── EmpresaForm.jsx            # Formulario crear/editar
└── services/
    └── empresaService.js              # Integración con API
```

## 🔧 Dependencias Utilizadas

```json
{
  "@mui/material": "^5.14.20",       // Componentes UI
  "@mui/icons-material": "^5.14.19", // Iconos
  "axios": "^1.6.2",                 // HTTP requests
  "formik": "^2.4.5",                // Gestión de formularios
  "yup": "^1.3.3"                    // Validación de esquemas
}
```

## 🧪 Validaciones del Formulario

### Reglas de Validación

| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| RUC | Obligatorio, 10-13 dígitos, algoritmo válido | "El RUC no es válido" |
| Razón Social | Obligatorio, 3-300 caracteres | "La razón social es requerida" |
| Régimen Tributario | Obligatorio, enum válido | "El régimen tributario es requerido" |
| Nombre Comercial | Opcional, máx. 300 caracteres | - |
| Dirección | Opcional, máx. 500 caracteres | - |
| Teléfono | Opcional, 7-15 dígitos numéricos | "El teléfono debe tener entre 7 y 15 dígitos" |
| Email | Opcional, formato email válido | "El email no es válido" |
| Representante Legal | Opcional, máx. 200 caracteres | - |
| Contador Nombre | Opcional, máx. 200 caracteres | - |
| Contador RUC | Opcional, 10-13 dígitos | "El RUC del contador debe tener entre 10 y 13 dígitos" |

## 📊 Manejo de Estados

### Estados del Componente Principal
```javascript
const [empresas, setEmpresas] = useState([])              // Lista de empresas
const [loading, setLoading] = useState(false)             // Indicador de carga
const [error, setError] = useState(null)                  // Error global
const [formOpen, setFormOpen] = useState(false)           // Estado del modal
const [selectedEmpresa, setSelectedEmpresa] = useState(null) // Empresa en edición
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false) // Diálogo de confirmación
const [empresaToDelete, setEmpresaToDelete] = useState(null) // Empresa a eliminar
const [snackbar, setSnackbar] = useState({...})           // Notificaciones
```

## 🔐 Integración con Autenticación

- El token JWT se envía automáticamente en todas las peticiones (configurado en AuthContext)
- Si el token expira, el usuario es redirigido al login automáticamente
- Los errores 401/403 se manejan globalmente

## 🎯 Funcionalidades Pendientes (Futuras Mejoras)

- [ ] Exportar lista de empresas a Excel/PDF
- [ ] Filtros avanzados (por régimen, estado, fecha de creación)
- [ ] Vista de detalles completa de empresa
- [ ] Importación masiva de empresas desde CSV
- [ ] Historial de cambios de empresa
- [ ] Dashboard por empresa (estadísticas)

## 🐛 Manejo de Errores

### Errores Comunes y Soluciones

**Error: "El RUC no es válido"**
- Verificar que el RUC tenga el formato correcto
- Verificar el dígito verificador
- Verificar que termine en "001" (para sociedades)

**Error: "Error al cargar las empresas"**
- Verificar que el backend esté corriendo
- Verificar conexión a base de datos
- Revisar logs del backend

**Error: "RUC ya existe"**
- El RUC debe ser único en el sistema
- Verificar si la empresa ya está registrada

## 📱 Responsividad

- ✅ Tabla responsive con scroll horizontal en móviles
- ✅ Formulario adaptable a pantallas pequeñas
- ✅ Botones y acciones accesibles en todos los dispositivos
- ✅ Paginación adaptativa

## ✅ Checklist de Implementación

- [x] Servicio de API (empresaService.js)
- [x] Componente de tabla (EmpresasTable.jsx)
- [x] Componente de formulario (EmpresaForm.jsx)
- [x] Validación de RUC ecuatoriano
- [x] Integración en página principal (Empresas.jsx)
- [x] Validación de formularios con Yup
- [x] Manejo de errores
- [x] Notificaciones (Snackbar)
- [x] Diálogo de confirmación para eliminar
- [x] Búsqueda en tiempo real
- [x] Paginación
- [x] Indicadores de carga
- [x] Cambio de estado (activar/desactivar)
- [x] Responsive design
- [x] Documentación

## 🎉 Estado Final

**✅ MÓDULO COMPLETO Y FUNCIONAL**

Todos los requerimientos solicitados han sido implementados:
1. ✅ Tabla con lista de empresas
2. ✅ Formulario para crear/editar
3. ✅ Integración con API backend
4. ✅ Validación de formularios (incluyendo RUC ecuatoriano)

El módulo está listo para usar una vez que:
- El backend esté corriendo en `http://localhost:3000`
- El frontend esté corriendo en `http://localhost:5173`
- Las dependencias estén instaladas (`npm install`)
- MySQL esté configurado y las migraciones ejecutadas
