# Instrucciones - Frontend Sistema ATS

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd C:\sri_eks25\frontend
npm install
```

Esto instalará:
- React 18
- Material-UI
- React Router
- Axios
- Formik + Yup
- Vite
- Y todas las dependencias necesarias

**Tiempo estimado:** 2-3 minutos

### 2. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## 📋 Requisitos Previos

### Backend debe estar corriendo
El frontend necesita que el backend esté funcionando en `http://localhost:3000`

```bash
# En otra terminal
cd C:\sri_eks25\backend
npm run dev
```

### Tener usuario creado
Necesitas tener al menos un usuario en la base de datos para poder hacer login.

#### Crear usuario admin manualmente:

```bash
# 1. Generar hash de password
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123', 10).then(h => console.log(h))"

# 2. Copiar el hash e insertarlo en la base de datos
mysql -u root -p sri_ats

INSERT INTO usuarios (empresa_id, nombre, apellido, email, password_hash, rol, estado, created_at, updated_at)
VALUES (1, 'Admin', 'Sistema', 'admin@demo.com', 'HASH_AQUI', 'ADMINISTRADOR_GENERAL', 'ACTIVO', NOW(), NOW());
```

---

## 🔍 Verificar que Funciona

### 1. Abrir navegador
Ir a: http://localhost:5173

### 2. Ver página de login
Deberías ver una pantalla de login con:
- Logo del Sistema ATS
- Campos de email y password
- Botón "Iniciar Sesión"

### 3. Hacer login
```
Email: admin@demo.com
Password: Admin123
```

### 4. Ver Dashboard
Después del login exitoso, deberías ver:
- Barra lateral con menú
- Dashboard con estadísticas
- Menú de usuario en la esquina superior derecha

---

## 🎨 Características Implementadas

### ✅ Funcionales

1. **Autenticación**
   - Login con JWT
   - Logout
   - Rutas protegidas
   - Persistencia de sesión

2. **Layout**
   - Sidebar con navegación
   - AppBar con menú de usuario
   - Diseño responsivo
   - Tema personalizado Material-UI

3. **Páginas**
   - Login (completo)
   - Dashboard (básico con estadísticas mock)
   - Empresas (estructura)
   - Compras (estructura)
   - Ventas (estructura)
   - Generar ATS (estructura)

### ⏳ Por Implementar

1. **Módulo Empresas**
   - Tabla con lista
   - Formulario crear/editar
   - Validación de RUC
   - Filtros

2. **Módulo Compras**
   - Tabla con lista
   - Formulario crear/editar
   - Importación XML
   - Resumen por periodo

3. **Módulo Ventas**
   - CRUD completo

4. **Módulo ATS**
   - Selector de periodo
   - Preview de datos
   - Generación y descarga

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

---

## 📁 Estructura del Código

```
src/
├── components/
│   └── Layout/
│       └── Layout.jsx              # Layout principal con sidebar
│
├── context/
│   └── AuthContext.jsx             # Contexto de autenticación
│
├── pages/
│   ├── Login.jsx                   # ✅ Completo
│   ├── Dashboard.jsx               # ✅ Básico
│   ├── Empresas.jsx                # ⏳ Placeholder
│   ├── Compras.jsx                 # ⏳ Placeholder
│   ├── Ventas.jsx                  # ⏳ Placeholder
│   └── GenerarATS.jsx              # ⏳ Placeholder
│
├── App.jsx                         # Router principal
├── main.jsx                        # Entry point
└── index.css                       # Estilos globales
```

---

## 🔧 Configuración

### Vite Proxy
El frontend está configurado para hacer proxy de las peticiones a `/api` hacia el backend:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

Esto significa que puedes hacer peticiones a `/api/auth/login` y Vite las redirigirá a `http://localhost:3000/api/auth/login`.

### Axios
Axios está configurado en `AuthContext.jsx` para:
- Agregar el token JWT a todas las peticiones
- Manejar errores de autenticación
- Redirigir al login si el token expira

---

## 🐛 Solución de Problemas

### Error: "Proxy error"
**Causa:** El backend no está corriendo.

**Solución:**
```bash
cd C:\sri_eks25\backend
npm run dev
```

### Error: "Failed to fetch"
**Causa:** Backend no responde o URL incorrecta.

**Solución:**
- Verificar que el backend esté en puerto 3000
- Verificar que MySQL esté corriendo
- Verificar la consola del backend para errores

### Error: "Invalid credentials"
**Causa:** Usuario no existe o contraseña incorrecta.

**Solución:**
- Verificar que el usuario existe en la base de datos
- Verificar que el hash de la contraseña es correcto
- Intentar crear un nuevo usuario

### Puerto 5173 en uso
**Solución:**
```bash
# Editar vite.config.js y cambiar el puerto
server: {
  port: 5174,  // Cambiar a otro puerto
}
```

---

## 🎯 Próximos Pasos de Desarrollo

### Fase 1: CRUD Empresas (Prioritario)
1. Crear tabla con lista de empresas
2. Formulario para crear/editar
3. Integración con API backend
4. Validación de formularios

### Fase 2: CRUD Compras
1. Tabla con lista de compras
2. Formulario para crear/editar
3. Filtros por periodo y estado
4. Botón de validación

### Fase 3: Importación XML
1. Componente drag & drop
2. Preview de datos extraídos
3. Confirmación de importación

### Fase 4: Generación ATS
1. Selector de periodo
2. Preview de transacciones
3. Botón generar
4. Descarga de archivos

---

## 📚 Documentación de Tecnologías

- **React:** https://react.dev/
- **Material-UI:** https://mui.com/
- **React Router:** https://reactrouter.com/
- **Axios:** https://axios-http.com/
- **Vite:** https://vitejs.dev/
- **Formik:** https://formik.org/
- **Yup:** https://github.com/jquense/yup

---

## 🎨 Tema y Diseño

El tema está personalizado con los colores del SRI:
- **Primario:** Azul (#1976d2)
- **Secundario:** Naranja (#f57c00)
- **Fondo:** Gris claro (#f5f5f5)

Los componentes Material-UI están personalizados con:
- Bordes redondeados
- Sombras sutiles
- Transiciones suaves

---

## ✅ Checklist de Instalación

- [ ] Node.js >= 18.x instalado
- [ ] Backend corriendo en puerto 3000
- [ ] MySQL con base de datos `sri_ats`
- [ ] Usuario admin creado en la BD
- [ ] Dependencias del frontend instaladas (`npm install`)
- [ ] Servidor dev iniciado (`npm run dev`)
- [ ] Login exitoso
- [ ] Dashboard visible

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás:
- ✅ Frontend funcionando en http://localhost:5173
- ✅ Backend funcionando en http://localhost:3000
- ✅ Login y autenticación operativos
- ✅ Navegación entre páginas
- ✅ Base para desarrollar módulos

---

**Para más información, consulta:**
- `README.md` en la raíz del proyecto
- `ESTADO_PROYECTO_COMPLETO.md` para el estado actual
- `INICIO_RAPIDO.md` para guía completa
