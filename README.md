# Sistema ATS - SRI Ecuador

Sistema Multi-empresa de Reportes Tributarios para el Servicio de Rentas Internas (SRI) de Ecuador. Genera el Anexo Transaccional Simplificado (ATS) en formato XML conforme a los esquemas XSD oficiales del SRI.

## Características Principales

- **Multi-tenancy**: Gestión de múltiples empresas con datos completamente aislados
- **Multi-usuario**: Sistema de roles y permisos (Administrador General, Administrador de Empresa, Contador, Operador)
- **Importación XML**: Parseo automático de facturas y retenciones electrónicas del SRI
- **Generación ATS**: Creación de archivos XML del ATS validados contra esquemas XSD oficiales
- **Validación RUC**: Algoritmo completo de validación de RUC ecuatoriano con dígito verificador
- **Auditoría completa**: Log de todas las actividades y cambios en el sistema
- **API RESTful**: Backend robusto con Express.js y autenticación JWT

## Stack Tecnológico

### Backend
- **Framework**: Node.js + Express.js
- **Base de Datos**: MySQL
- **ORM**: Sequelize
- **Autenticación**: JWT + bcrypt
- **Validación**: express-validator
- **XML**: fast-xml-parser + libxmljs2

### Frontend (Pendiente)
- React + Vite
- Material-UI / Tailwind CSS
- Axios
- React Router

## Estructura del Proyecto

```
sri_eks25/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de DB y servicios
│   │   ├── controllers/     # Controladores de API
│   │   ├── middlewares/     # Auth, validación, errores, logging
│   │   ├── models/          # Modelos Sequelize
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/        # Lógica de negocio
│   │   ├── utils/           # Utilidades (JWT, RUC validator)
│   │   ├── validators/      # Schemas de validación
│   │   ├── app.js           # Configuración de Express
│   │   └── server.js        # Punto de entrada
│   ├── .env.example
│   ├── .sequelizerc
│   └── package.json
├── database/
│   ├── migrations/          # Migraciones de base de datos (9 archivos)
│   └── seeds/               # Datos iniciales (parámetros SRI)
├── frontend/                # React app (estructura creada)
├── requerimientos_documentos/  # XSD schemas y documentación SRI
└── README.md
```

## Instalación y Configuración

### Prerequisitos

- Node.js >= 18.x
- MySQL >= 8.0
- npm o yarn

### Paso 1: Clonar el repositorio

```bash
git clone <repository-url>
cd sri_eks25
```

### Paso 2: Instalar dependencias del backend

```bash
cd backend
npm install
```

### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` y configurar:
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (usar un secreto fuerte en producción)
- Otros parámetros según necesidad

### Paso 4: Crear base de datos

```bash
mysql -u root -p
CREATE DATABASE sri_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Paso 5: Ejecutar migraciones

```bash
npm run migrate
```

Esto creará las siguientes tablas:
- `empresas`
- `usuarios`
- `parametros_sri`
- `compras`
- `retenciones`
- `ventas`
- `exportaciones`
- `historial_ats`
- `log_actividad`

### Paso 6: Cargar datos iniciales (seeds)

```bash
npm run seed
```

Esto poblará la tabla `parametros_sri` con:
- Tipos de identificación
- Tipos de comprobantes
- Códigos de sustento tributario
- Formas de pago
- Códigos de retención
- Países

### Paso 7: Iniciar el servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Uso de la API

### Autenticación

#### Registrar usuario (requiere admin)
```bash
POST /api/auth/registrar
Content-Type: application/json

{
  "empresa_id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "password": "Password123",
  "rol": "CONTADOR"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123"
}
```

Respuesta:
```json
{
  "mensaje": "Login exitoso",
  "data": {
    "usuario": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Obtener perfil
```bash
GET /api/auth/perfil
Authorization: Bearer {accessToken}
```

### Empresas

#### Crear empresa
```bash
POST /api/empresas
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "ruc": "1790016919001",
  "razon_social": "EMPRESA DEMO S.A.",
  "regimen_tributario": "GENERAL",
  "obligado_contabilidad": true,
  "direccion": "Av. Principal 123",
  "telefono": "02-1234567",
  "email": "info@empresademo.com"
}
```

#### Listar empresas
```bash
GET /api/empresas?pagina=1&limite=10&estado=ACTIVO
Authorization: Bearer {accessToken}
```

### Compras

#### Crear compra manualmente
```bash
POST /api/compras
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "periodo": "01/2024",
  "codigo_sustento": "01",
  "tipo_comprobante": "01",
  "tipo_proveedor": "02",
  "tipo_identificacion": "04",
  "identificacion_proveedor": "1790016919001",
  "razon_social_proveedor": "PROVEEDOR XYZ S.A.",
  "fecha_emision": "2024-01-15",
  "fecha_registro": "2024-01-15",
  "establecimiento": "001",
  "punto_emision": "001",
  "secuencial": "000001234",
  "numero_autorizacion": "1234567890123456789",
  "base_imponible_0": 100.00,
  "base_imponible_iva": 500.00,
  "monto_iva": 60.00,
  "total_compra": 660.00
}
```

#### Importar factura desde XML
```bash
POST /api/xml/importar-factura
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

archivo_xml: [archivo XML de factura electrónica]
codigo_sustento: "01"
tipo_proveedor: "02"
```

#### Listar compras
```bash
GET /api/compras?periodo=01/2024&estado=VALIDADO&pagina=1&limite=20
Authorization: Bearer {accessToken}
```

#### Obtener resumen de compras
```bash
GET /api/compras/resumen?periodo=01/2024
Authorization: Bearer {accessToken}
```

Respuesta:
```json
{
  "mensaje": "Resumen de compras obtenido exitosamente",
  "data": {
    "total_compras": 25,
    "base_imponible_0": 1500.00,
    "base_imponible_iva": 12000.00,
    "total_iva": 1440.00,
    "total_retenciones_iva": 144.00,
    "total_retenciones_renta": 240.00,
    "total_general": 14940.00
  }
}
```

#### Validar compra
```bash
PATCH /api/compras/{id}/validar
Authorization: Bearer {accessToken}
```

### Generación de ATS

(Controlador pendiente de integración)

```bash
POST /api/ats/generar
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "periodo": "01/2024"
}
```

Respuesta:
```json
{
  "mensaje": "ATS generado exitosamente",
  "archivo_xml": "ATS012024.xml",
  "archivo_zip": "AT012024.zip",
  "ruta_descarga": "/api/ats/descargar/1/01/2024",
  "estadisticas": {
    "total_compras": 25,
    "total_ventas": 18,
    "total_exportaciones": 3
  }
}
```

## Módulos Implementados

### ✅ Completados

1. **Estructura de Base de Datos**
   - 9 migraciones creadas
   - Modelos Sequelize con validaciones
   - Asociaciones entre modelos
   - Índices optimizados

2. **Autenticación y Seguridad**
   - JWT con refresh tokens
   - Middleware de autenticación
   - Autorización basada en roles (RBAC)
   - Rate limiting
   - Validación de RUC ecuatoriano completa
   - Hash de contraseñas con bcrypt

3. **Módulo de Empresas**
   - CRUD completo
   - Validación de RUC
   - Multi-tenancy

4. **Módulo de Compras**
   - CRUD completo
   - Validación de totales
   - Resumen por periodo
   - Estados: BORRADOR, VALIDADO, INCLUIDO_ATS, ANULADO

5. **Importación XML**
   - Parser de facturas electrónicas SRI
   - Parser de retenciones electrónicas SRI
   - Extracción automática de datos tributarios
   - Previsualización sin guardar

6. **Generación ATS**
   - Constructor de XML según especificación SRI
   - Compresión a ZIP
   - Estructura conforme a ATS.xsd

7. **Logging y Auditoría**
   - Log de actividades de usuario
   - Log de cambios en entidades (antes/después)
   - Captura de IP y user agent
   - HTTP request logging

### ⏳ Pendientes

1. **Módulos Faltantes**
   - Retenciones (CRUD y servicios)
   - Ventas (CRUD y servicios)
   - Exportaciones (CRUD y servicios)
   - Historial ATS (consultas y descarga)

2. **Frontend React**
   - Estructura creada, código pendiente
   - Formularios de captura
   - Dashboards y reportes
   - Interfaz de importación XML
   - Preview de ATS

3. **Validación XSD**
   - Integración de libxmljs2 para validar XML contra XSD
   - Manejo de errores de validación

4. **Testing**
   - Tests unitarios
   - Tests de integración
   - Tests E2E

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMINISTRADOR_GENERAL** | Acceso total: crear empresas, usuarios, ver todas las empresas |
| **ADMINISTRADOR_EMPRESA** | Gestión completa de su empresa, usuarios, y todas las transacciones |
| **CONTADOR** | Crear, editar, validar transacciones; generar ATS; no puede eliminar |
| **OPERADOR** | Solo crear y editar transacciones en estado BORRADOR |

## Validaciones Implementadas

### Validación de RUC Ecuatoriano
- Validación de longitud (10 o 13 dígitos)
- Validación de código de provincia (01-24, 30)
- Algoritmo de dígito verificador para:
  - Personas naturales (tercer dígito < 6)
  - Sociedades privadas (tercer dígito = 9)
  - Entidades públicas (tercer dígito = 6)
- RUC de sociedad debe terminar en "001"

### Validaciones de Negocio
- Totales de compra deben cuadrar con bases + impuestos
- Fechas en formato ISO y rango válido
- Números de documentos según patrones SRI
- Estados válidos según flujo del sistema

## Logs y Debugging

El sistema registra:
- Todas las peticiones HTTP
- Operaciones CRUD con datos antes/después
- Intentos de login
- Errores de validación
- Excepciones no controladas

Consultar logs en:
- Consola (desarrollo)
- Tabla `log_actividad` (auditoría permanente)

## Despliegue en Producción

### Consideraciones

1. **Variables de entorno**:
   - Cambiar `JWT_SECRET` por un secreto fuerte
   - Configurar `NODE_ENV=production`
   - Usar credenciales seguras de BD

2. **Base de datos**:
   - **NO** usar `sequelize.sync()` en producción
   - Solo usar migraciones
   - Backups regulares

3. **Seguridad**:
   - Habilitar HTTPS
   - Configurar CORS restrictivo
   - Rate limiting agresivo
   - Logs externos (CloudWatch, Datadog, etc.)

4. **Rendimiento**:
   - Pool de conexiones DB ajustado
   - Caché con Redis (opcional)
   - CDN para archivos estáticos

## Contribución

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Soporte

Para preguntas o problemas:
- Abrir un issue en GitHub
- Consultar documentación del SRI: [SRI Ecuador](https://www.sri.gob.ec)

## Licencia

MIT License

---

**Desarrollado para facilitar el cumplimiento tributario de empresas en Ecuador 🇪🇨**
