# Importación de Ventas desde el SRI

Esta funcionalidad permite importar comprobantes electrónicos de ventas (facturas) al sistema mediante tres métodos diferentes:

## Características

### Método 1: Importación desde Web Service del SRI (Claves de Acceso)
- **Importación Masiva**: Procesa múltiples claves de acceso desde un archivo .txt
- **Importación Única**: Importa un solo comprobante usando su clave de acceso
- **Descarga Automática**: Conecta al web service SOAP del SRI para descargar los XMLs
- **Validación**: Verifica el formato de las claves de acceso y el estado de autorización
- **Almacenamiento**: Guarda los XMLs descargados para auditoría
- **Detección de Duplicados**: Identifica comprobantes ya importados
- **Multi-ambiente**: Soporta ambientes de Producción y Pruebas del SRI

### Método 2: Importación desde Archivos XML Locales
- **Importación Directa**: Carga archivos XML de facturas electrónicas directamente
- **Procesamiento Múltiple**: Permite seleccionar varios archivos XML simultáneamente
- **Parseo Automático**: Extrae automáticamente todos los datos del XML
- **Sin Conexión Internet**: No requiere conexión al SRI, ideal para XMLs respaldados localmente

## Arquitectura Técnica

### Backend

#### 1. Servicio SOAP (`sriSoapService.js`)
- Conecta al web service del SRI: `https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl`
- Método SOAP: `autorizacionComprobante`
- Parsea los XMLs recibidos usando `xml2js`
- Extrae información tributaria, datos del comprador, totales e impuestos

**Funciones principales:**
```javascript
descargarComprobante(claveAcceso, ambiente)  // Descarga XML del SRI
parsearComprobanteXml(xmlString)             // Parsea XML y extrae datos
validarClaveAcceso(claveAcceso)              // Valida formato de clave
```

#### 2. Servicio de Importación (`ventaImportService.js`)
- Procesa archivos .txt con claves de acceso
- Mapea datos del XML al modelo de Venta
- Maneja transacciones de base de datos
- Guarda XMLs en `backend/uploads/xml/{empresaId}/`

**Funciones principales:**
```javascript
importarVentasDesdeArchivo(archivo, empresaId, usuarioId, ambiente)
importarVentaUnica(claveAcceso, empresaId, usuarioId, ambiente)
mapearComprobanteAVenta(datos, empresaId, usuarioId)
```

#### 3. Servicio de Parseo XML (`xmlImportService.js`)
- Parsea archivos XML de facturas electrónicas
- Extrae datos para ventas (emisor = empresa, comprador = cliente)
- Soporta XMLs con o sin envoltorio de autorización
- Calcula automáticamente bases imponibles y totales de IVA

**Funciones principales:**
```javascript
parsearFacturaVenta(xmlContent)                    // Parsea XML para venta
parsearYValidarFacturaVenta(xmlContent, validarXSD) // Con validación opcional
detectarTipoComprobante(xmlContent)                // Detecta FACTURA/RETENCION
```

#### 3. Controlador (`ventaImportController.js`)
- Maneja requests HTTP
- Valida parámetros de entrada
- Usa multer para upload de archivos

#### 4. Rutas
**Rutas SRI (`ventaRoutes.js`):**
```
POST /api/ventas/importar-desde-sri          # Importación masiva desde SRI
POST /api/ventas/importar-desde-sri/unica    # Importación única desde SRI
```

**Rutas XML (`xmlImportRoutes.js`):**
```
POST /api/xml/importar-factura-venta         # Importación desde archivos XML
```

### Frontend

#### 1. Componente (`ImportarVentasSRI.jsx`)
- Interfaz para subir archivos .txt
- Selector de ambiente (Producción/Pruebas)
- Dos modos: Masiva y Única
- Muestra progreso y resultados detallados

#### 2. Página (`ImportarVentasSRIPage.jsx`)
- Página completa con selector de empresa
- Instrucciones de uso
- Integración del componente de importación

#### 3. Servicio (`ventaService.js`)
```javascript
importarDesdeArchivo(archivo, empresaId, ambiente)
importarVentaUnica(claveAcceso, empresaId, ambiente)
```

## Uso

### Requisitos Previos
1. Tener una empresa registrada en el sistema
2. Obtener las claves de acceso de los comprobantes electrónicos del SRI
3. Usuario con permisos de OPERADOR, CONTADOR, ADMINISTRADOR_EMPRESA o ADMINISTRADOR_GENERAL

### Importación Masiva

#### 1. Preparar archivo .txt
Cree un archivo de texto con una clave de acceso por línea (49 dígitos cada una):

```
3110202501171280155200120010050000001241234567811
3110202501171280155200120010050000001271234567816
3110202501171280155200120010050000001331234567819
```

**Archivo de ejemplo:** `backend/claves-acceso-ejemplo.txt`

#### 2. Usar la interfaz web
1. Navegue a la página de "Importar Ventas desde el SRI"
2. Seleccione la empresa
3. Seleccione el ambiente del SRI (Producción o Pruebas)
4. Cargue el archivo .txt
5. Haga clic en "Importar Ventas"

#### 3. Ver resultados
El sistema mostrará:
- **Exitosos**: Comprobantes descargados e importados correctamente
- **Fallidos**: Errores de descarga o procesamiento
- **Duplicados**: Comprobantes ya existentes en la base de datos
- **Detalles**: Lista completa con estado de cada clave de acceso

### Importación Única

#### 1. Usar la interfaz web
1. Navegue a la página de "Importar Ventas desde el SRI"
2. Seleccione la empresa
3. Cambie al modo "Importación Única (SRI)"
4. Ingrese la clave de acceso (49 dígitos)
5. Haga clic en "Importar Venta"

### Importación desde XML

#### 1. Usar la interfaz web
1. Navegue a la página de "Importar Ventas desde el SRI"
2. Seleccione la empresa
3. Cambie al modo "Importación desde XML"
4. Seleccione uno o varios archivos XML de facturas electrónicas
5. Haga clic en "Importar X Archivo(s)"

**Nota**: Los archivos XML deben ser facturas electrónicas emitidas por su empresa (usted es el emisor, no el comprador)

### Usando el API directamente

#### Importación Masiva
```bash
curl -X POST http://localhost:3000/api/ventas/importar-desde-sri \
  -H "Authorization: Bearer {token}" \
  -F "archivo=@claves-acceso.txt" \
  -F "empresa_id=1" \
  -F "ambiente=PRODUCCION"
```

**Respuesta:**
```json
{
  "mensaje": "Importación finalizada: 10 exitosos, 1 fallidos, 2 duplicados",
  "data": {
    "total": 13,
    "exitosos": 10,
    "fallidos": 1,
    "duplicados": 2,
    "detalles": [
      {
        "claveAcceso": "3110202501171280155200120010050000001241234567811",
        "estado": "EXITOSO",
        "mensaje": "Venta importada correctamente (ID: 45)",
        "ventaId": 45
      },
      // ...
    ]
  }
}
```

#### Importación Única
```bash
curl -X POST http://localhost:3000/api/ventas/importar-desde-sri/unica \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "clave_acceso": "3110202501171280155200120010050000001241234567811",
    "empresa_id": 1,
    "ambiente": "PRODUCCION"
  }'
```

**Respuesta:**
```json
{
  "mensaje": "Venta importada exitosamente desde el SRI",
  "data": {
    "venta": {
      "id": 45,
      "empresa_id": 1,
      "periodo": "01/2025",
      "tipo_comprobante": "01",
      "identificacion_cliente": "1234567890001",
      "razon_social_cliente": "Cliente S.A.",
      "total_venta": 112.00,
      "estado": "BORRADOR",
      // ...
    },
    "comprobante": {
      // Datos parseados del XML
    }
  }
}
```

#### Importación desde XML
```bash
curl -X POST http://localhost:3000/api/xml/importar-factura-venta \
  -H "Authorization: Bearer {token}" \
  -F "xmlFile=@factura001.xml"
```

**Respuesta:**
```json
{
  "mensaje": "Factura de venta importada exitosamente desde XML",
  "data": {
    "id": 46,
    "empresa_id": 1,
    "periodo": "01/2025",
    "tipo_comprobante": "01",
    "tipo_identificacion_cliente": "04",
    "identificacion_cliente": "0999999999001",
    "razon_social_cliente": "EMPRESA CLIENTE SA",
    "fecha_emision": "2025-01-15",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000124",
    "numero_autorizacion": "3110202501171280155200120010050000001241234567811",
    "base_imponible_0": 0.00,
    "base_imponible_iva": 100.00,
    "monto_iva": 15.00,
    "total_venta": 115.00,
    "estado": "BORRADOR"
  },
  "validacion": {
    "valido": true,
    "metodo": "sin validación XSD",
    "errores": [],
    "advertencias": []
  }
}
```

## Estructura de la Clave de Acceso (49 dígitos)

| Posición | Longitud | Descripción |
|----------|----------|-------------|
| 0-7      | 8        | Fecha de emisión (ddmmaaaa) |
| 8-9      | 2        | Tipo de comprobante (01=Factura, 04=Nota Crédito, etc.) |
| 10-22    | 13       | RUC del emisor |
| 23-24    | 2        | Tipo de ambiente (1=Pruebas, 2=Producción) |
| 25-27    | 3        | Serie - Establecimiento |
| 28-30    | 3        | Serie - Punto de emisión |
| 31-39    | 9        | Número de comprobante |
| 40-47    | 8        | Código numérico |
| 48       | 1        | Dígito verificador |

## Mapeo de Datos

El sistema mapea automáticamente los campos del XML del SRI a la tabla `ventas`:

| Campo XML | Campo BD | Observaciones |
|-----------|----------|---------------|
| `claveAcceso` | `numero_autorizacion` | Identificador único |
| `codDoc` | `tipo_comprobante` | Tipo de documento |
| `identificacionComprador` | `identificacion_cliente` | RUC/Cédula del cliente |
| `razonSocialComprador` | `razon_social_cliente` | Nombre del cliente |
| `fechaEmision` | `fecha_emision` | Formato DD/MM/YYYY → YYYY-MM-DD |
| `estab` | `establecimiento` | 3 dígitos |
| `ptoEmi` | `punto_emision` | 3 dígitos |
| `secuencial` | `secuencial` | Número secuencial |
| `importeTotal` | `total_venta` | Total del comprobante |
| `impuestos` | `base_imponible_*`, `monto_iva` | Según código de porcentaje |

### Mapeo de Impuestos

El sistema identifica las bases imponibles según el `codigoPorcentaje` del IVA:

- **0**: IVA 0% → `base_imponible_0`
- **2**: IVA 15% → `base_imponible_iva` + `monto_iva`
- **3**: IVA 14% → `base_imponible_iva` + `monto_iva`
- **4**: IVA 15% → `base_imponible_iva` + `monto_iva`
- **6, 7**: No objeto de IVA → `base_imponible_no_objeto_iva`
- **8**: IVA 5% → `base_imponible_iva` + `monto_iva`

## Estados de Importación

Las ventas importadas se crean con:
- **Estado**: `BORRADOR` (requieren validación manual antes de incluirse en ATS)
- **Observaciones**: Incluye fecha de importación y tipo de comprobante

Para validar una venta importada:
```bash
PATCH /api/ventas/{id}/validar
```

## Archivos Generados

Los XMLs descargados se guardan en:
```
backend/uploads/xml/{empresaId}/{claveAcceso}.xml
```

Esto permite:
- Auditoría posterior
- Re-procesamiento si es necesario
- Verificación manual de datos

## Manejo de Errores

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Clave de acceso inválida" | Formato incorrecto | Verificar que tenga 49 dígitos |
| "Comprobante no autorizado" | SRI no autorizó el documento | Verificar estado en portal SRI |
| "Ya existe una venta con esta clave de acceso" | Duplicado | El comprobante ya fue importado |
| "No se recibió respuesta del SRI" | Timeout o servicio caído | Reintentar más tarde |
| "Error al parsear XML" | XML malformado | Verificar integridad del documento |

### Logs

Todos los errores y operaciones se registran en:
- **Winston Logger**: `backend/logs/`
- **Base de datos**: Tabla `log_actividad`

## Configuración

### Variables de Entorno
No se requieren variables adicionales. El sistema usa las existentes:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`

### Dependencias NPM
```json
{
  "soap": "^0.x.x",        // Cliente SOAP para comunicación con SRI
  "xml2js": "^0.x.x",      // Parser de XML
  "multer": "^1.x.x"       // Upload de archivos
}
```

## Seguridad

- **Autenticación**: Requiere token JWT válido
- **Autorización**: Solo roles permitidos pueden importar
- **Aislamiento**: Multi-tenancy por `empresa_id`
- **Validación**: Verifica formato de clave antes de consultar SRI
- **Límites**: Archivos máximo 5MB
- **Logs**: Registra todas las operaciones para auditoría

## Testing

### 1. Ejecutar backend
```bash
cd backend
npm run dev
```

### 2. Ejecutar frontend
```bash
cd frontend
npm run dev
```

### 3. Probar importación
- Use el archivo `backend/claves-acceso-ejemplo.txt`
- O genere claves de acceso reales desde el portal del SRI

**Nota**: Las claves de ejemplo no existen en el SRI. Para pruebas reales, use claves de acceso válidas de su empresa.

## Flujo Completo

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Sube archivo .txt con claves
       ▼
┌─────────────────────┐
│  Frontend (React)   │
└──────┬──────────────┘
       │
       │ 2. POST /api/ventas/importar-desde-sri
       ▼
┌─────────────────────┐
│ Backend (Express)   │
└──────┬──────────────┘
       │
       │ 3. Lee archivo y extrae claves
       ▼
┌─────────────────────┐
│  sriSoapService     │
└──────┬──────────────┘
       │
       │ 4. SOAP: autorizacionComprobante
       ▼
┌─────────────────────┐
│    SRI Web Service  │
└──────┬──────────────┘
       │
       │ 5. Retorna XML del comprobante
       ▼
┌─────────────────────┐
│  xmlParserService   │
└──────┬──────────────┘
       │
       │ 6. Parsea y extrae datos
       ▼
┌─────────────────────┐
│ventaImportService   │
└──────┬──────────────┘
       │
       │ 7. Mapea a modelo Venta
       ▼
┌─────────────────────┐
│  MySQL (ventas)     │
└─────────────────────┘
```

## Próximas Mejoras

- [ ] Importación programada (cron jobs)
- [ ] Notificaciones por email al completar importación
- [ ] Exportar resultados a Excel
- [ ] Integración con retenciones asociadas
- [ ] Validación XSD del XML descargado
- [ ] Cache de comprobantes descargados
- [ ] Retry automático en caso de falla temporal del SRI

## Soporte

Para problemas o preguntas:
1. Revise los logs en `backend/logs/`
2. Verifique la tabla `log_actividad` en la base de datos
3. Consulte la documentación oficial del SRI: https://www.sri.gob.ec/

## Referencias

- [Ficha Técnica ATS - SRI](https://www.sri.gob.ec/)
- [Web Services del SRI](https://cel.sri.gob.ec/comprobantes-electronicos-ws/)
- [Documentación SOAP npm package](https://www.npmjs.com/package/soap)
