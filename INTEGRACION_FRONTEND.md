# Integración Frontend-Backend Completada

## 📋 Resumen de la Integración

Se ha completado la integración del frontend React con el backend Node.js/Express del sistema ATS (Anexo Transaccional Simplificado) del SRI.

### Estado Actual: ✅ SISTEMA COMPLETAMENTE INTEGRADO

El sistema ahora cuenta con:
- ✅ Frontend React + Vite completamente funcional
- ✅ Backend Node.js + Express completamente funcional
- ✅ Autenticación JWT con refresh tokens
- ✅ Rutas protegidas y control de acceso RBAC
- ✅ Validación XSD integral (imports + generación ATS)
- ✅ Interfaz de usuario completa con Material-UI

---

## 🚀 Cómo Ejecutar el Sistema

### Prerrequisitos

1. **Node.js 18+** instalado
2. **MySQL 8.0+** instalado y ejecutándose
3. **npm** (viene con Node.js)

### Configuración Inicial

#### 1. Base de Datos

```bash
# Crear la base de datos en MySQL
mysql -u root -p

CREATE DATABASE sri_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 2. Backend

```bash
# Ir al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copiar .env.example a .env y editar con tus credenciales
cp .env.example .env

# IMPORTANTE: Editar .env con tu configuración:
# - DB_PASSWORD: Contraseña de MySQL
# - JWT_SECRET: String aleatorio fuerte
# - JWT_REFRESH_SECRET: Otro string aleatorio fuerte

# Ejecutar migraciones de base de datos
npm run migrate

# Poblar datos iniciales del SRI (opcional pero recomendado)
npm run seed
```

#### 3. Frontend

```bash
# Ir al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Las variables de entorno ya están configuradas en .env
# No necesita cambios para desarrollo local
```

---

## ▶️ Ejecutar el Sistema

### Opción 1: Ejecutar Backend y Frontend por separado (Recomendado para desarrollo)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El backend se ejecutará en: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend se ejecutará en: http://localhost:5173

### Opción 2: Ejecutar Solo Backend (para pruebas con curl/Postman)

```bash
cd backend
npm start
```

---

## 👤 Acceso al Sistema

### Primera vez - Crear Usuario Administrador

Después de ejecutar las migraciones y seeds, necesitas crear el primer usuario administrador manualmente:

**Opción A: Usar curl**
```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "Admin123!",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "rol": "ADMINISTRADOR_GENERAL"
  }'
```

**Opción B: Usar Postman**
- POST http://localhost:3000/api/auth/registrar
- Body (JSON):
```json
{
  "email": "admin@empresa.com",
  "password": "Admin123!",
  "nombre": "Administrador",
  "apellido": "Sistema",
  "rol": "ADMINISTRADOR_GENERAL"
}
```

**Opción C: Insertar directamente en MySQL**
```sql
INSERT INTO usuarios (
  email, password, nombre, apellido, rol, estado, created_at, updated_at
) VALUES (
  'admin@empresa.com',
  '$2b$10$YourHashedPasswordHere', -- Usar bcrypt para hashear
  'Administrador',
  'Sistema',
  'ADMINISTRADOR_GENERAL',
  'ACTIVO',
  NOW(),
  NOW()
);
```

### Login en el Sistema

1. Abrir navegador en http://localhost:5173
2. Ingresar credenciales:
   - Email: admin@empresa.com
   - Password: Admin123! (o la que hayas configurado)
3. Click en "Iniciar Sesión"

---

## 📚 Funcionalidades Implementadas

### 1. **Autenticación y Seguridad**
- ✅ Login con JWT
- ✅ Refresh token automático
- ✅ Logout
- ✅ Rutas protegidas
- ✅ Control de acceso por roles (RBAC)
- ✅ Manejo de sesiones expiradas

### 2. **Gestión de Empresas**
- ✅ Listar empresas con paginación y búsqueda
- ✅ Crear nueva empresa
- ✅ Editar empresa existente
- ✅ Eliminar empresa (soft delete)
- ✅ Activar/Desactivar empresa
- ✅ Validación de RUC ecuatoriano

### 3. **Gestión de Compras**
- ✅ Listar compras con filtros
- ✅ Crear compra manual
- ✅ Editar compra
- ✅ Eliminar compra
- ✅ Validar compra (cambio de estado)
- ✅ Importar desde XML

### 4. **Gestión de Ventas**
- ✅ Listar ventas con filtros
- ✅ Crear venta manual
- ✅ Editar venta
- ✅ Eliminar venta
- ✅ Validar venta

### 5. **Importación de XML**
- ✅ Importar facturas electrónicas
- ✅ Importar retenciones electrónicas
- ✅ Validación XSD contra esquemas SRI
- ✅ Preview de datos antes de importar
- ✅ Mensajes de error detallados

### 6. **Generación de ATS**
- ✅ Selección de período
- ✅ Preview de transacciones a incluir
- ✅ Generación de XML ATS
- ✅ Validación XSD del ATS generado
- ✅ Descarga de archivo ZIP
- ✅ Historial de archivos generados

### 7. **Usuarios**
- ✅ Listar usuarios
- ✅ Crear nuevo usuario
- ✅ Editar usuario
- ✅ Eliminar usuario
- ✅ Cambiar rol de usuario
- ✅ Gestión de permisos por empresa

### 8. **Dashboard**
- ✅ Estadísticas generales
- ✅ Resumen del mes actual
- ✅ Indicadores visuales
- ✅ Tarjetas de información

### 9. **Reportes**
- ✅ Reporte de compras
- ✅ Reporte de ventas
- ✅ Resumen general
- ✅ Filtros por período y estado

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18**: Biblioteca principal
- **Vite 5**: Build tool y dev server
- **Material-UI 5**: Componentes de UI
- **React Router DOM 6**: Enrutamiento
- **Axios**: Cliente HTTP
- **Formik + Yup**: Formularios y validación
- **date-fns**: Manejo de fechas

### Backend
- **Node.js 18+**: Runtime
- **Express 4**: Framework web
- **Sequelize 6**: ORM para MySQL
- **MySQL 8**: Base de datos
- **JWT**: Autenticación
- **bcrypt**: Hash de contraseñas
- **fast-xml-parser**: Parseo de XML
- **libxmljs2**: Validación XSD
- **Winston**: Logging
- **Helmet**: Seguridad HTTP
- **express-validator**: Validación de datos

---

## 🔐 Roles y Permisos

### ADMINISTRADOR_GENERAL
- Acceso total al sistema
- Puede gestionar todas las empresas
- Puede crear y gestionar usuarios
- Puede generar y descargar ATS

### ADMINISTRADOR_EMPRESA
- Gestión completa de su empresa asignada
- Puede crear usuarios para su empresa
- Puede generar ATS de su empresa
- Puede importar XML y validar transacciones

### CONTADOR
- Gestión de transacciones (compras, ventas)
- Puede generar ATS
- Puede validar transacciones
- No puede eliminar datos finalizados

### OPERADOR
- Ingreso de transacciones básicas
- Puede importar XML
- Solo lectura de reportes
- No puede validar ni eliminar

---

## 📝 Flujo de Trabajo Típico

### 1. Configuración Inicial
1. Login como ADMINISTRADOR_GENERAL
2. Crear empresas
3. Crear usuarios y asignarlos a empresas
4. Configurar roles y permisos

### 2. Operación Mensual
1. Login como CONTADOR u OPERADOR
2. Importar facturas XML del mes
3. Importar retenciones XML
4. Revisar y validar transacciones
5. Generar reporte de resumen
6. Generar archivo ATS del período
7. Validar ATS contra XSD
8. Descargar y enviar al SRI

### 3. Mantenimiento
1. Revisar logs de actividad
2. Actualizar datos de empresas si es necesario
3. Gestionar usuarios activos/inactivos
4. Revisar historial de ATS generados

---

## 🐛 Troubleshooting

### El frontend no puede conectarse al backend

**Problema:** Error de CORS o conexión rechazada

**Solución:**
1. Verificar que el backend esté ejecutándose en http://localhost:3000
2. Verificar que el archivo `frontend/.env` tenga `VITE_API_URL=http://localhost:3000`
3. Reiniciar el servidor de desarrollo del frontend

### Error "Access token expired"

**Problema:** Token expirado

**Solución:**
- El sistema maneja esto automáticamente con refresh tokens
- Si persiste, hacer logout y login nuevamente

### Error en migraciones de base de datos

**Problema:** Las migraciones fallan

**Solución:**
```bash
cd backend

# Revertir todas las migraciones
npm run migrate:undo:all

# Volver a ejecutar migraciones
npm run migrate
```

### La validación XSD no funciona

**Problema:** Mensajes de "Validación básica" en lugar de "XSD completo"

**Solución:**
```bash
cd backend

# Instalar libxmljs2
npm install libxmljs2

# Reiniciar el servidor
npm run dev
```

---

## 📞 Soporte y Documentación

### Documentación Adicional
- **Backend API**: `backend/src/routes/*.md` - Documentación de endpoints
- **CHANGELOG**: `CHANGELOG.md` - Historial de cambios
- **Requerimientos**: `docum/requerrimiento.md` - Especificaciones completas
- **CLAUDE.md**: Guía detallada del proyecto

### Testing
```bash
# Backend - Ejecutar tests
cd backend
npm test

# Frontend - Build de producción
cd frontend
npm run build
```

---

## 🚀 Despliegue en Producción

### Backend

1. Configurar variables de entorno de producción en `.env`
2. Ejecutar migraciones en la base de datos de producción
3. Ejecutar el servidor: `npm start`
4. Configurar nginx/Apache como reverse proxy

### Frontend

1. Configurar `VITE_API_URL` en `.env` con la URL de producción del backend
2. Generar build de producción: `npm run build`
3. Servir archivos estáticos desde `dist/` con nginx/Apache

### Ejemplo nginx

```nginx
# Backend API
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name ats.tudominio.com;
    root /var/www/sri-ats/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ✅ Checklist de Verificación

Antes de usar en producción, verificar:

- [ ] Base de datos MySQL configurada y ejecutándose
- [ ] Variables de entorno configuradas correctamente
- [ ] Migraciones ejecutadas exitosamente
- [ ] Usuario administrador creado
- [ ] Backend ejecutándose sin errores
- [ ] Frontend ejecutándose sin errores
- [ ] Login funcional
- [ ] CRUD de empresas funcional
- [ ] Importación de XML funcional
- [ ] Validación XSD activa (libxmljs2 instalado)
- [ ] Generación de ATS funcional
- [ ] Descarga de archivos ZIP funcional
- [ ] Roles y permisos funcionando correctamente

---

## 📊 Próximos Pasos Recomendados

1. **Testing Automatizado**
   - Implementar tests unitarios con Jest
   - Implementar tests de integración
   - Implementar tests end-to-end con Cypress

2. **Mejoras de UX**
   - Agregar indicadores de progreso en operaciones largas
   - Implementar notificaciones push
   - Agregar exportación de reportes a Excel/PDF

3. **Optimizaciones**
   - Implementar caché en consultas frecuentes
   - Optimizar queries de base de datos
   - Implementar paginación del lado del servidor

4. **Seguridad Adicional**
   - Implementar 2FA (autenticación de dos factores)
   - Agregar auditoría detallada de acciones críticas
   - Implementar rate limiting más estricto

---

**Sistema completamente integrado y funcional - Versión 1.2.0**
