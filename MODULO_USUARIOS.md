# Módulo de Administración de Usuarios

## Descripción General

El módulo de usuarios permite gestionar los usuarios del sistema ATS-SRI. Los usuarios están asociados a empresas y tienen diferentes roles con permisos específicos.

## Características

- ✅ CRUD completo de usuarios
- ✅ Asociación de usuarios con empresas
- ✅ Sistema de roles (RBAC)
- ✅ Cambio de contraseña por usuario
- ✅ Reseteo de contraseña por administrador
- ✅ Cambio de estado de usuarios (ACTIVO/INACTIVO/BLOQUEADO)
- ✅ Búsqueda y filtrado de usuarios
- ✅ Paginación de resultados
- ✅ Logging de actividades

## Modelo de Datos

### Usuario

```javascript
{
  id: INTEGER (PK, auto-increment),
  empresa_id: INTEGER (FK -> empresas.id),
  nombre: STRING(100),
  apellido: STRING(100),
  email: STRING(100) UNIQUE,
  password_hash: STRING(255),
  rol: ENUM('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  ultimo_acceso: DATE,
  estado: ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO'),
  created_at: DATETIME,
  updated_at: DATETIME
}
```

## Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMINISTRADOR_GENERAL** | Súper administrador del sistema | Acceso total: gestionar empresas, usuarios de todas las empresas, ver todos los datos |
| **ADMINISTRADOR_EMPRESA** | Administrador de una empresa específica | Gestionar usuarios de su empresa, todas las transacciones de su empresa |
| **CONTADOR** | Contador de una empresa | Crear, editar, validar transacciones; generar ATS; no puede eliminar |
| **OPERADOR** | Operador de captura de datos | Solo crear y editar transacciones en estado BORRADOR |

## Endpoints API

### 1. Listar Usuarios

```http
GET /api/usuarios?pagina=1&limite=10&empresa_id=1&rol=CONTADOR&estado=ACTIVO&busqueda=juan
Authorization: Bearer {token}
```

**Roles permitidos:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA

**Parámetros de consulta:**
- `pagina` (opcional): Número de página (default: 1)
- `limite` (opcional): Registros por página (default: 10)
- `empresa_id` (opcional): Filtrar por empresa
- `rol` (opcional): Filtrar por rol
- `estado` (opcional): Filtrar por estado
- `busqueda` (opcional): Búsqueda por nombre, apellido o email

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "empresa_id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "rol": "CONTADOR",
      "estado": "ACTIVO",
      "ultimo_acceso": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-10T08:00:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "empresa": {
        "id": 1,
        "ruc": "1790016919001",
        "razon_social": "EMPRESA DEMO S.A.",
        "nombre_comercial": "DEMO"
      }
    }
  ],
  "paginacion": {
    "total": 25,
    "pagina": 1,
    "limite": 10,
    "total_paginas": 3
  }
}
```

### 2. Obtener Usuario por ID

```http
GET /api/usuarios/1
Authorization: Bearer {token}
```

**Roles permitidos:** Todos (autenticados)

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuario obtenido exitosamente",
  "data": {
    "id": 1,
    "empresa_id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "rol": "CONTADOR",
    "estado": "ACTIVO",
    "ultimo_acceso": "2024-01-15T10:30:00.000Z",
    "empresa": {
      "id": 1,
      "ruc": "1790016919001",
      "razon_social": "EMPRESA DEMO S.A."
    }
  }
}
```

### 3. Obtener Usuarios por Empresa

```http
GET /api/usuarios/empresa/1
Authorization: Bearer {token}
```

**Roles permitidos:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "rol": "CONTADOR",
      "estado": "ACTIVO"
    }
  ]
}
```

### 4. Crear Usuario

```http
POST /api/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "empresa_id": 1,
  "nombre": "María",
  "apellido": "González",
  "email": "maria@example.com",
  "password": "Password123",
  "rol": "CONTADOR",
  "estado": "ACTIVO"
}
```

**Roles permitidos:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA

**Validaciones:**
- `empresa_id`: requerido, debe ser un ID válido de empresa existente
- `nombre`: requerido, 2-100 caracteres, solo letras y espacios
- `apellido`: requerido, 2-100 caracteres, solo letras y espacios
- `email`: requerido, formato email válido, único en el sistema
- `password`: requerido, 8-50 caracteres, debe contener mayúscula, minúscula y número
- `rol`: opcional (default: OPERADOR), valores válidos: ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA, CONTADOR, OPERADOR
- `estado`: opcional (default: ACTIVO), valores válidos: ACTIVO, INACTIVO, BLOQUEADO

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Usuario creado exitosamente",
  "data": {
    "id": 2,
    "empresa_id": 1,
    "nombre": "María",
    "apellido": "González",
    "email": "maria@example.com",
    "rol": "CONTADOR",
    "estado": "ACTIVO"
  }
}
```

**Errores comunes:**
- **409 Conflict:** Email ya existe
- **404 Not Found:** Empresa no encontrada
- **400 Bad Request:** Errores de validación

### 5. Actualizar Usuario

```http
PUT /api/usuarios/2
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "María Elena",
  "rol": "ADMINISTRADOR_EMPRESA"
}
```

**Roles permitidos:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA

**Campos actualizables:** nombre, apellido, email, password, rol, estado, empresa_id

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuario actualizado exitosamente",
  "data": {
    "id": 2,
    "nombre": "María Elena",
    "apellido": "González",
    "email": "maria@example.com",
    "rol": "ADMINISTRADOR_EMPRESA",
    "estado": "ACTIVO"
  }
}
```

### 6. Eliminar Usuario (Soft Delete)

```http
DELETE /api/usuarios/2
Authorization: Bearer {token}
```

**Roles permitidos:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA

**Nota:** No elimina físicamente el registro, solo cambia el estado a INACTIVO.

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuario eliminado correctamente"
}
```

### 7. Cambiar Estado de Usuario

```http
PATCH /api/usuarios/2/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "BLOQUEADO"
}
```

**Roles permitidos:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA

**Estados válidos:** ACTIVO, INACTIVO, BLOQUEADO

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Estado de usuario actualizado",
  "data": {
    "id": 2,
    "nombre": "María Elena",
    "estado": "BLOQUEADO"
  }
}
```

### 8. Cambiar Contraseña (por el propio usuario)

```http
POST /api/usuarios/1/cambiar-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "password_actual": "Password123",
  "password_nueva": "NewPassword456",
  "password_confirmacion": "NewPassword456"
}
```

**Roles permitidos:** Todos (el propio usuario)

**Validaciones:**
- `password_actual`: requerida, debe coincidir con la contraseña actual
- `password_nueva`: requerida, 8-50 caracteres, debe contener mayúscula, minúscula y número
- `password_confirmacion`: requerida, debe coincidir con password_nueva

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

**Errores comunes:**
- **401 Unauthorized:** Contraseña actual incorrecta
- **400 Bad Request:** Las contraseñas no coinciden

### 9. Resetear Contraseña (por administrador)

```http
POST /api/usuarios/2/resetear-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "passwordNueva": "TempPassword789"
}
```

**Roles permitidos:** ADMINISTRADOR_GENERAL, ADMINISTRADOR_EMPRESA

**Uso:** Permite a un administrador cambiar la contraseña de cualquier usuario sin necesidad de conocer la contraseña actual.

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Contraseña reseteada correctamente"
}
```

## Ejemplos de Uso con cURL

### Crear un usuario

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": 1,
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "email": "carlos@example.com",
    "password": "Password123",
    "rol": "OPERADOR"
  }'
```

### Listar usuarios de una empresa

```bash
curl -X GET "http://localhost:3000/api/usuarios?empresa_id=1&estado=ACTIVO" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cambiar contraseña

```bash
curl -X POST http://localhost:3000/api/usuarios/1/cambiar-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password_actual": "Password123",
    "password_nueva": "NewPassword456",
    "password_confirmacion": "NewPassword456"
  }'
```

### Bloquear un usuario

```bash
curl -X PATCH http://localhost:3000/api/usuarios/2/estado \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "BLOQUEADO"}'
```

## Seguridad

### Hash de Contraseñas
- Las contraseñas se hashean automáticamente usando bcrypt con 10 salt rounds
- Los hooks del modelo Sequelize manejan el hashing antes de crear/actualizar
- Las contraseñas nunca se almacenan en texto plano
- Las contraseñas nunca se devuelven en las respuestas de la API

### Control de Acceso
- Todos los endpoints requieren autenticación (token JWT)
- Los roles determinan qué acciones puede realizar cada usuario
- ADMINISTRADOR_GENERAL tiene acceso a todas las empresas
- Otros roles solo pueden gestionar usuarios de su propia empresa

### Logging
- Todas las operaciones se registran en la tabla `log_actividad`
- Se captura: usuario, acción, IP, user agent, datos antes/después del cambio

## Integración con Empresas

Los usuarios están vinculados a empresas mediante `empresa_id`:

1. Al crear un usuario, se debe proporcionar un `empresa_id` válido
2. El sistema verifica que la empresa exista
3. Los usuarios solo pueden acceder a datos de su empresa (excepto ADMINISTRADOR_GENERAL)
4. Al obtener usuarios, se incluye información básica de la empresa relacionada

## Flujo de Trabajo Recomendado

### Crear primer usuario (ADMINISTRADOR_GENERAL)
1. Usar el endpoint de registro (POST /api/auth/registrar) o crear directamente en la BD
2. Este usuario podrá crear empresas y usuarios

### Agregar usuarios a una empresa
1. El ADMINISTRADOR_GENERAL o ADMINISTRADOR_EMPRESA crea el usuario
2. Se especifica la empresa y el rol apropiado
3. Se envían las credenciales al usuario (password temporal)
4. El usuario cambia su contraseña en el primer acceso

### Gestión de usuarios inactivos
1. En lugar de eliminar usuarios, cambiar estado a INACTIVO
2. Los usuarios INACTIVOS no pueden hacer login
3. Los usuarios BLOQUEADOS tampoco pueden acceder

## Consideraciones Importantes

- **Emails únicos:** No puede haber dos usuarios con el mismo email
- **Soft delete:** La eliminación de usuarios solo cambia el estado a INACTIVO
- **Asociación obligatoria:** Todo usuario debe pertenecer a una empresa
- **Roles inmutables en runtime:** Los permisos están hardcodeados en el middleware
- **Password policy:** Mínimo 8 caracteres con mayúscula, minúscula y número

## Próximas Mejoras

- [ ] Recuperación de contraseña por email
- [ ] Autenticación de dos factores (2FA)
- [ ] Historial de cambios de contraseña
- [ ] Expiración de contraseñas
- [ ] Bloqueo automático por intentos fallidos de login
- [ ] Permisos granulares por módulo
