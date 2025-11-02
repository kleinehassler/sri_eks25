# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Multi-user, Multi-company Tax Reporting System** for Ecuador's SRI (Servicio de Rentas Internas) that generates the **Anexo Transaccional Simplificado (ATS)** in XML format compliant with official SRI XSD schemas.

**Current Status:** Backend fully functional with authentication, companies, purchases, sales, users, XML import, ATS generation, and reporting. Frontend structure and basic components created but integration pending. Remaining: Full retencion/exportacion services, XSD validation implementation, comprehensive testing, and frontend-backend integration.

**Stack:**
- Frontend: React + Vite (components implemented, integration pending)
- Backend: Node.js + Express (RESTful API with most endpoints functional)
- Database: MySQL (both development and production)
- ORM: Sequelize with migrations
- Authentication: JWT + bcrypt (fully implemented with RBAC)
- XML: fast-xml-parser for parsing, archiver for ZIP generation

## Architecture

### Multi-tenancy Model
- **Multi-company**: Each company (identified by RUC) has isolated data, fiscal periods, and generated files
- **Multi-user**: Users are assigned to companies with role-based permissions (Administrador General, Administrador Empresa, Contador, Operador)
- All database tables include `empresa_id` for tenant isolation

### Core Modules
1. **Empresas** - Company management (RUC, tax regime, fiscal periods)
2. **Usuarios** - User authentication, roles, and permissions per company
3. **Compras** - Purchase transactions with XML import from electronic invoices
4. **Retenciones** - Tax withholdings with XML import from electronic retention receipts
5. **Ventas** - Sales transactions
6. **Exportaciones** - Export operations
7. **Recap** - Credit card operations and recapitulations
8. **Generación ATS** - XML file generation, validation, and ZIP export

## Key Technical Requirements

### XML Schema Compliance
- All generated XML must validate against SRI's official `ATS.xsd` schema
- Electronic invoice XML imports must parse `Factura_V2.1.0.xsd` format
- Electronic retention XML imports must extract fields from `<infoTributaria>`, `<infoCompRetencion>`, and `<impuestos>` nodes

### XML Import Features
**Purchase Invoice Import:**
- Parse SRI electronic invoice XML files
- Auto-extract: RUC, company name, date, document type, tax bases, IVA, retentions
- Auto-populate purchase form fields
- Validate extracted data against ATS requirements

**Retention Import:**
- Parse SRI electronic retention XML files
- Extract retention details: RUC, establishment, sequential, tax base, retention code, percentage, amount
- Auto-link to corresponding supplier and purchase by invoice number or RUC match

### Database Schema
Key tables (all include `empresa_id`, `usuario_id`, `periodo`, `created_at`, `updated_at`, `estado`):
- `empresas` - Company master data
- `usuarios` - User accounts and authentication
- `compras` - Purchase transactions
- `retenciones` - Tax withholdings
- `ventas` - Sales transactions
- `exportaciones` - Export operations
- `recap` - Credit card operations
- `pago_exterior` - Foreign payments
- `compensaciones` - Tax compensations
- `reembolsos` - Reimbursements
- `parametros_sri` - SRI code catalogs (document types, tax support codes, payment methods, countries, ID types)
- `historial_ats` - Generated ATS file history
- `log_actividad` - Audit log

### ATS Generation Workflow
1. Consolidate validated records from all transaction modules for the specified period
2. Build XML structure conforming to ATS.xsd schema
3. Validate complete XML against XSD
4. Generate `ATS.xml` file
5. Compress to ZIP format: `ATmmAAAA.zip` (mm=month, AAAA=year)
6. Provide preview before download
7. Log generation in `historial_ats` with company, period, user, and timestamp

### Validation Requirements
- **Syntactic**: XML structure matches XSD schema exactly
- **Semantic**: Data types, formats, date patterns, decimal precision comply with SRI specs
- **Relational**: Totals match detail sums, cross-references are consistent
- **Field-level**: Each field validated per Ficha Técnica ATS requirements

### Key ATS XML Blocks
- `<compras>` - Purchases with subnodes: `<pagoExterior>`, `<formasDePago>`, `<air>`, `<reembolsos>`
- `<ventas>` - Sales with subnodes: `<compensaciones>`, `<formasDePago>`
- `<exportaciones>` - Exports
- `<recap>` - Recaps with subnodes: `<compensaciones>`, `<pagoExterior>`

### Security & Permissions
- JWT-based authentication with token refresh
- Role-based access control (RBAC) per module and action (CRUD + export)
- Password hashing with bcrypt
- Activity logging for audit trail
- Data isolation between companies enforced at database query level

## Project Structure

```
sri_eks25/
├── backend/
│   ├── src/
│   │   ├── config/          # Database (Sequelize), logger (Winston), and app config
│   │   ├── controllers/     # API endpoint handlers (7 implemented)
│   │   ├── middlewares/     # Auth, validation, error handlers, rate limiting (all implemented)
│   │   ├── models/          # Sequelize models (9 models fully implemented)
│   │   ├── routes/          # Express route definitions (8 route files implemented)
│   │   ├── services/        # Business logic layer (9 services implemented)
│   │   ├── utils/           # Utility functions (JWT, RUC validator, AppError)
│   │   ├── validators/      # Input validation schemas (4 validators implemented)
│   │   ├── app.js           # Express app configuration
│   │   └── server.js        # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── .sequelizerc         # Sequelize CLI configuration
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (structure created)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client services
│   │   ├── context/         # React context (AuthContext implemented)
│   │   └── config/          # Frontend configuration
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── migrations/          # 9 migration files (empresas, usuarios, compras, etc.)
│   └── seeds/               # SRI parameter data seeds
└── requerimientos_documentos/ # SRI XSD schemas and documentation

```

## Development Commands

### Setup
```bash
# Install backend dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and configure the following variables:
```

**Required Environment Variables:**
- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - Database name (default: sri_ats)
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password (REQUIRED)
- `JWT_SECRET` - Secret for JWT signing (REQUIRED - use strong random string in production)
- `JWT_REFRESH_SECRET` - Secret for refresh token signing (REQUIRED)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production, default: development)

**Optional Environment Variables:**
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173 for Vite)
- `LOG_LEVEL` - Winston log level (default: info)

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE sri_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Running the Application
```bash
# Backend development mode (with auto-reload via nodemon)
cd backend
npm run dev

# Backend production mode
npm start

# Frontend (components created, integration pending)
cd frontend
npm run dev
```

### Testing
```bash
# Run all backend tests with coverage
cd backend
npm test

# Run tests in watch mode (for TDD)
npm run test:watch

# Run XML validation tests specifically
npm run test:xml

# Note: Test suite is pending implementation. Jest and testing infrastructure
# are configured in package.json but test files need to be created.
```

### Database Operations
```bash
# Run database migrations
cd backend
npm run migrate

# Seed database with initial SRI parameter data (tipos de identificación, comprobantes, etc.)
npm run seed

# Undo last migration
npm run migrate:undo

# Reset database completely (WARNING: drops all data)
# In MySQL:
# DROP DATABASE sri_ats;
# CREATE DATABASE sri_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# Then run migrations again
```

## Code Architecture & Patterns

### Backend Structure (Layered Architecture)
- **Models Layer** (`src/models/`): Sequelize ORM models with built-in validations
  - All core models implemented: Empresa, Usuario, ParametroSri, Compra, Retencion, Venta, Exportacion, HistorialAts, LogActividad
  - `index.js` sets up associations between models
  - Models use hooks for automatic transformations (e.g., password hashing)

- **Config Layer** (`src/config/`):
  - `database.js`: Sequelize connection to MySQL with pool configuration and Ecuador timezone (-05:00)
  - `config.js`: Sequelize CLI configuration for migrations
  - `logger.js`: Winston logger for structured logging

- **Service Layer** (`src/services/`): Business logic and data transformations
  - **Fully Implemented**: authService, empresaService, compraService, xmlImportService, xmlParserService, atsGeneratorService, usuarioService, ventaService, reporteService
  - **Pending**: retencionService, exportacionService (models exist, services need full CRUD implementation)
  - Services handle complex operations, data validation, and coordinate between models

- **Controller Layer** (`src/controllers/`): Request/response handling
  - **Fully Implemented**: authController, empresaController, compraController, xmlImportController, usuarioController, ventaController, reporteController (7 controllers)
  - Controllers delegate business logic to services
  - Handle HTTP responses and errors via next()
  - Use async/await pattern with try-catch blocks

- **Routes Layer** (`src/routes/`): API endpoint definitions with middleware chains
  - **Fully Implemented**: index.js, authRoutes, empresaRoutes, compraRoutes, ventaRoutes, usuarioRoutes, xmlImportRoutes, reporteRoutes (8 route files)
  - `index.js`: Main router with health check endpoint and route aggregation
  - Individual route files with validation and authorization middleware
  - Pattern: validation → authentication → authorization → controller

- **Middleware Layer** (`src/middlewares/`): Cross-cutting concerns (all fully implemented)
  - `auth.js`: JWT authentication and RBAC authorization (authenticate, requireRole, verifyEmpresaAccess)
  - `errorHandler.js`: Centralized error handling with Spanish messages and proper HTTP status codes
  - `rateLimiter.js`: Rate limiting (auth: 5 req/15min, general: 100 req/15min)
  - `logger.js`: Activity logging middleware with IP/user agent capture
  - `index.js`: Middleware exports and validation error handler

- **Validators Layer** (`src/validators/`): Input validation with express-validator
  - **Implemented**: empresaValidator, usuarioValidator, compraValidator, index (error handler)
  - Schema-based validation with custom validators (RUC, email, password strength, monetary values)
  - Spanish error messages for user-facing errors
  - Sanitization of inputs (trim, escape)

- **Utils Layer** (`src/utils/`): Reusable utilities (all fully implemented)
  - `jwt.js`: Token generation (generateAccessToken, generateRefreshToken) and verification (verifyToken)
  - `rucValidator.js`: Complete Ecuador RUC validation algorithm with checksum verification (validarRUC function)
  - `AppError.js`: Custom error class extending Error with statusCode and isOperational properties

### Application Entry Points
- **`src/app.js`**: Express application configuration
  - Middleware setup (CORS, Helmet, Morgan, body parsers)
  - Route mounting
  - Error handling middleware
  - Exports configured Express app (for testing and server)
- **`src/server.js`**: Server startup and process management
  - Loads environment variables
  - Starts HTTP server on configured port
  - Handles process signals (SIGTERM, SIGINT) for graceful shutdown
  - Handles unhandled promise rejections and exceptions
  - Console startup banner with server info

### Model Conventions
- All models use `underscored: true` for snake_case column names
- Timestamps enabled by default (`created_at`, `updated_at`)
- Foreign keys follow pattern: `{model}_id` (e.g., `empresa_id`)
- Enums used for status fields and predefined categories
- Indexes defined on foreign keys and frequently queried fields
- All transaction models include `empresa_id` for multi-tenancy

### Multi-tenancy Implementation
- Every transaction table MUST include `empresa_id` foreign key
- Query middleware should automatically filter by current user's company
- Database-level isolation enforced through application queries
- Consider adding `empresa_id` to composite indexes for performance

## Important Implementation Notes

### Database Configuration
- **Database Engine**: MySQL only (both development and production)
- MySQL connection configured via environment variables in `.env`
- Connection pool settings: max 5 connections, 30s acquire timeout, 10s idle timeout
- Timezone set to '-05:00' (Ecuador)
- Character set: utf8mb4 with utf8mb4_unicode_ci collation
- **IMPORTANT**: In production, NEVER use `sequelize.sync()` - only use migrations
- Foreign key constraints enforced at database level

### XML Parsing for Imports
- Use `fast-xml-parser` for parsing electronic invoices/retentions (implemented in xmlParserService)
- XSD validation with `libxmljs2` pending implementation
- Reference schema files in `requerimientos_documentos/ARCHIVOats-xsd.txt`
- Handle UTF-8 encoding and special characters
- All import operations logged to `log_actividad` table for audit trail
- XML import endpoints use `multer` for file uploads (5MB limit)
- Parser extracts data from `<infoTributaria>`, `<infoFactura>`, `<infoCompRetencion>`, and `<impuestos>` nodes

### Data Validation & Normalization
- **RUC Validation**: Complete Ecuador RUC checksum algorithm implemented in `utils/rucValidator.js`
  - Pattern: 10 or 13 digits
  - Validates province code (01-24, 30)
  - Three validation algorithms based on third digit:
    - < 6: Natural person (Módulo 10)
    - = 6: Public entity (Módulo 11)
    - = 9: Private company (Módulo 11)
  - For companies (13 digits): must end in "001"
  - **Usage**: Call `validarRUC(ruc)` which returns `{valido: boolean, mensaje: string}`
- **Monetary Values**: DECIMAL(12,2) for all currency fields in database
- **Dates**: Store as DATETIME in ISO format, but accept/return `DD/MM/YYYY` per SRI spec in XML
- **XML Patterns**: Follow XSD patterns exactly (e.g., `establecimientoType: [0-9]{3}`)
- **Input Sanitization**: All user inputs validated via express-validator before reaching services

### Database Design
- Use transactions for multi-table operations (e.g., purchase + retention records)
- Index strategy:
  - Primary keys: auto-increment integers
  - Foreign keys: `empresa_id`, `usuario_id`
  - Query filters: `periodo`, `estado`, `ruc`
- Maintain SRI parameter tables: `parametros_sri` for codes, tax rates, document types

### Security Requirements (Implemented)
- JWT secrets stored in `.env` file (JWT_SECRET required)
- Passwords hashed with bcrypt salt rounds = 10 via Sequelize hook in Usuario model
- Rate limiting implemented:
  - Auth endpoints: 5 requests per 15 minutes
  - General endpoints: 100 requests per 15 minutes
- All inputs validated with express-validator schemas
- Security headers via Helmet.js
- CORS configured for specific frontend origin
- Security events logged to `log_actividad` table (logins, failed auth, permission denials)
- RBAC enforced via `requireRole()` and `verifyEmpresaAccess()` middleware

### Error Handling
- Return validation errors in Spanish (user-facing)
- Use HTTP status codes correctly:
  - 400: Bad request / validation errors
  - 401: Unauthorized (no token)
  - 403: Forbidden (insufficient permissions)
  - 404: Resource not found
  - 500: Server error
- Log errors with context: `{ userId, empresaId, action, error }`
- All errors pass through centralized errorHandler middleware
- Use AppError class for operational errors with specific status codes

### Common Debugging Scenarios

**Database Connection Issues:**
- Verify `.env` file exists and has correct MySQL credentials
- Check MySQL service is running
- Ensure database `sri_ats` exists with correct character set
- Check Sequelize connection in `src/config/database.js`

**Authentication Errors:**
- Verify JWT_SECRET is set in `.env`
- Check token format in Authorization header: `Bearer {token}`
- Ensure user exists and has correct role for the endpoint
- Check token expiration (access: 8h, refresh: 7d)

**Multi-tenancy Issues:**
- Verify `empresa_id` is included in all transaction queries
- Check user has access to the empresa via `verifyEmpresaAccess` middleware
- ADMINISTRADOR_GENERAL can access all empresas

**XML Import Failures:**
- Verify XML file follows SRI schema (Factura_V2.1.0 or retention format)
- Check file size under 5MB limit (multer configuration)
- Review xmlParserService logs for parsing errors
- Ensure all required fields are present in XML

**Validation Errors:**
- All inputs validated via express-validator in route definitions
- RUC validation uses `validarRUC()` from `utils/rucValidator.js`
- Check validator files for specific field requirements
- Validation errors returned in Spanish with field-specific messages

## Frontend Structure

### Current State
- React + Vite project structure created
- Component files exist in `frontend/src/` directory
- **Status**: Components and services created but not yet fully integrated with backend
- Auth context (`AuthContext.jsx`) and layout components (`Layout.jsx`) implemented

### Key Components
- **Pages**: Login, Dashboard, Empresas, Compras, Ventas, ImportarXML, GenerarATS, Usuarios, Reportes
- **Components**:
  - Empresas: EmpresaForm, EmpresasTable
  - Compras: CompraForm, ComprasTable
  - Ventas: VentaForm, VentasTable
  - XML: XMLUploader, XMLPreview
  - ATS: PeriodoSelector, TransaccionesPreview
  - Reportes: FiltrosReporte, TablaReporte, ResumenGeneral
- **Services**: API client services for each module (empresaService, compraService, ventaService, usuarioService, xmlImportService, atsService, reporteService)

### Integration Notes
- Frontend services should point to `http://localhost:3000/api` (backend URL)
- Use JWT tokens from AuthContext for authenticated requests
- Handle Spanish error messages from backend
- File uploads use FormData with multipart/form-data

## Available API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /login` - User login
- `POST /registrar` - Register new user (requires admin role)
- `POST /refresh-token` - Refresh access token
- `GET /perfil` - Get current user profile (authenticated)
- `POST /cambiar-password` - Change password (authenticated)

### Company Routes (`/api/empresas`)
- `POST /` - Create company (ADMINISTRADOR_GENERAL only)
- `GET /` - List companies with pagination and filters
- `GET /:id` - Get company by ID
- `PUT /:id` - Update company
- `DELETE /:id` - Delete company (soft delete)

### Purchase Routes (`/api/compras`)
- `POST /` - Create purchase manually
- `GET /` - List purchases with filters (periodo, estado, proveedor)
- `GET /resumen` - Get purchase summary by period
- `GET /:id` - Get purchase by ID
- `PUT /:id` - Update purchase
- `DELETE /:id` - Delete purchase
- `PATCH /:id/validar` - Validate purchase (change estado to VALIDADO)

### Sale Routes (`/api/ventas`)
- `POST /` - Create sale manually
- `GET /` - List sales with filters
- `GET /resumen` - Get sales summary by period
- `GET /:id` - Get sale by ID
- `PUT /:id` - Update sale
- `DELETE /:id` - Delete sale
- `PATCH /:id/validar` - Validate sale

### User Routes (`/api/usuarios`)
- `POST /` - Create user (requires ADMINISTRADOR_GENERAL or ADMINISTRADOR_EMPRESA)
- `GET /` - List users
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (soft delete)
- `PATCH /:id/cambiar-rol` - Change user role

### XML Import Routes (`/api/xml`)
- `POST /importar-factura` - Import purchase invoice from XML (multipart/form-data)
- `POST /importar-retencion` - Import retention from XML (multipart/form-data)

### Report Routes (`/api/reportes`)
- `GET /compras` - Purchase report with date range and filters
- `GET /ventas` - Sales report
- `GET /resumen-general` - General summary report

### Health Check
- `GET /api/health` - API health check endpoint

### API Response Format

All API endpoints follow a consistent response format:

**Success Response:**
```json
{
  "mensaje": "Descripción del resultado",
  "data": { /* resultado */ }
}
```

**Error Response:**
```json
{
  "mensaje": "Descripción del error",
  "errores": [ /* array de errores de validación, si aplica */ ]
}
```

**Pagination Response (for list endpoints):**
```json
{
  "mensaje": "Resultados obtenidos",
  "data": {
    "items": [ /* array de resultados */ ],
    "total": 100,
    "pagina": 1,
    "limite": 20,
    "totalPaginas": 5
  }
}
```

## Key Workflow Patterns

### Authentication Flow
1. User logs in via `/api/auth/login` with email + password
2. Backend returns `accessToken` (8h expiry) and `refreshToken` (7d expiry)
3. Client stores tokens and includes `Authorization: Bearer {accessToken}` header in subsequent requests
4. When access token expires, use `/api/auth/refresh-token` with refresh token
5. Middleware `authenticate` verifies token and attaches `req.usuario` to request

### Authorization Flow
1. After authentication, `requireRole(['ROLE1', 'ROLE2'])` middleware checks if user has required role
2. For empresa-scoped resources, `verifyEmpresaAccess` ensures user belongs to the empresa or is ADMINISTRADOR_GENERAL
3. Multi-tenant isolation: All queries automatically filtered by `empresa_id`

### XML Import Flow
1. User uploads XML file (factura or retención) via `/api/xml/importar-factura` or `/api/xml/importar-retencion`
2. Backend parses XML using `xmlParserService`
3. Data extracted and mapped to database schema
4. Preview returned to user before saving
5. User confirms and data is saved to database with estado='BORRADOR'
6. All operations logged to `log_actividad`

### ATS Generation Flow
1. User selects period (MM/YYYY)
2. System queries all validated transactions for that period and empresa
3. `atsGeneratorService` consolidates data into ATS XML structure per SRI spec
4. XML validated (XSD validation pending)
5. ZIP file created with name format `ATmmAAAA.zip`
6. File metadata saved to `historial_ats`
7. ZIP file returned for download

## Reference Documents
- `docum/requerrimiento.md`: Complete functional specifications
- `docum/DESARROLLO_COMPLETADO.md`: Detailed development status and features completed
- `docum/INSTRUCCIONES_INSTALACION.md`: Installation guide
- `requerimientos_documentos/ARCHIVOats-xsd.txt`: Official SRI ATS XSD schema
- `requerimientos_documentos/Ejemplo de archivo en XML.xml`: Sample ATS XML output
- `requerimientos_documentos/Ficha Tecnica Transaccional Simplificado ATS (5).pdf`: SRI technical documentation
