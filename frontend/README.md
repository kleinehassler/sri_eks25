# Frontend - Sistema ATS SRI Ecuador

Frontend React con Vite para el Sistema de Anexo Transaccional Simplificado.

## Tecnologías

- **React 18** - Librería UI
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **Material-UI (MUI)** - Componentes UI
- **Axios** - Cliente HTTP
- **Formik + Yup** - Formularios y validación

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## Estructura

```
src/
├── components/          # Componentes reutilizables
│   └── Layout/         # Layout principal con sidebar
├── pages/              # Páginas/vistas
│   ├── Login.jsx       # Página de login
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Empresas.jsx    # Gestión de empresas
│   ├── Compras.jsx     # Gestión de compras
│   ├── Ventas.jsx      # Gestión de ventas
│   └── GenerarATS.jsx  # Generación de ATS
├── context/            # Context API
│   └── AuthContext.jsx # Contexto de autenticación
├── App.jsx             # Componente principal
├── main.jsx            # Entry point
└── index.css           # Estilos globales
```

## Características Implementadas

### ✅ Completado
- Sistema de autenticación con JWT
- Layout responsivo con sidebar
- Rutas protegidas
- Tema personalizado Material-UI
- Estructura de páginas básica
- Context API para autenticación
- Proxy a API backend

### ⏳ Pendiente
- Formularios de captura de datos
- Tablas con datos de empresas, compras, ventas
- Importación de XML
- Generación y descarga de ATS
- Reportes y estadísticas
- Validaciones de formularios

## Configuración

El frontend está configurado para conectarse al backend en `http://localhost:3000` a través de un proxy en Vite.

## Scripts

- `npm run dev` - Inicia servidor de desarrollo en puerto 5173
- `npm run build` - Genera build de producción
- `npm run preview` - Preview del build de producción

## Estado Actual

El frontend tiene la estructura básica funcional con:
- Login page
- Dashboard con estadísticas
- Layout con navegación
- Rutas protegidas
- Integración con backend

Todos los módulos de gestión (Empresas, Compras, Ventas, ATS) están pendientes de implementación.
