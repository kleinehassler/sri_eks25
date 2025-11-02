# Ejemplos cURL - Importación y Edición de Compras con Retenciones

Este documento contiene ejemplos prácticos usando cURL para probar todos los flujos de importación y edición.

## Configuración Inicial

```bash
# Definir variables de entorno
export API_URL="http://localhost:3000/api"
export TOKEN="tu_jwt_token_aqui"
```

## 1. Importar Factura desde XML

```bash
# Importar factura electrónica
curl -X POST "${API_URL}/xml/importar-factura" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "xmlFile=@/ruta/al/archivo/factura.xml" \
  -F "codigo_sustento=01" \
  -F "tipo_proveedor=02"
```

**Respuesta esperada:**
```json
{
  "mensaje": "Factura importada exitosamente desde XML",
  "data": {
    "id": 15,
    "empresa_id": 1,
    "usuario_id": 1,
    "periodo": "01/2025",
    "codigo_sustento": "01",
    "tipo_comprobante": "01",
    "tipo_proveedor": "02",
    "tipo_identificacion": "04",
    "identificacion_proveedor": "1792146739001",
    "razon_social_proveedor": "EMPRESA EJEMPLO S.A.",
    "fecha_emision": "2025-01-15",
    "fecha_registro": "2025-01-15T15:30:00.000Z",
    "establecimiento": "001",
    "punto_emision": "001",
    "secuencial": "000000123",
    "numero_autorizacion": "1501202501179214673900120010010000001231234567812",
    "base_imponible_0": "0.00",
    "base_imponible_iva": "1000.00",
    "base_imponible_no_objeto_iva": "0.00",
    "base_imponible_exento_iva": "0.00",
    "monto_iva": "150.00",
    "monto_ice": "0.00",
    "valor_retencion_iva": "0.00",
    "valor_retencion_renta": "0.00",
    "total_compra": "1150.00",
    "estado": "BORRADOR",
    "retenciones": []
  }
}
```

**Guardar el ID de la compra para usarlo en los siguientes pasos:**
```bash
export COMPRA_ID=15
```

---

## 2. Previsualizar XML (sin guardar)

```bash
# Previsualizar factura
curl -X POST "${API_URL}/xml/previsualizar" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "xmlFile=@/ruta/al/archivo/factura.xml"

# Previsualizar retención
curl -X POST "${API_URL}/xml/previsualizar" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "xmlFile=@/ruta/al/archivo/retencion.xml"
```

---

## 3. Importar Retención desde XML (sin asociar a compra)

```bash
# Solo parsear retención sin asociarla
curl -X POST "${API_URL}/xml/importar-retencion" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "xmlFile=@/ruta/al/archivo/retencion.xml"
```

**Respuesta esperada:**
```json
{
  "mensaje": "Retenciones parseadas exitosamente. Proporcione compra_id para asociarlas.",
  "data": [
    {
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000456",
      "numero_autorizacion": "1501202501179214673900110010000004561234567813",
      "fecha_emision": "2025-01-15",
      "tipo_identificacion": "04",
      "identificacion_proveedor": "1792146739001",
      "razon_social_proveedor": "EMPRESA EJEMPLO S.A.",
      "periodo": "01/2025",
      "tipo_impuesto": "RENTA",
      "codigo_retencion": "303",
      "base_imponible": 1000.00,
      "porcentaje_retencion": 1.00,
      "valor_retenido": 10.00
    },
    {
      "establecimiento": "001",
      "punto_emision": "001",
      "secuencial": "000000456",
      "numero_autorizacion": "1501202501179214673900110010000004561234567813",
      "fecha_emision": "2025-01-15",
      "tipo_identificacion": "04",
      "identificacion_proveedor": "1792146739001",
      "razon_social_proveedor": "EMPRESA EJEMPLO S.A.",
      "periodo": "01/2025",
      "tipo_impuesto": "IVA",
      "codigo_retencion": "10",
      "base_imponible": 150.00,
      "porcentaje_retencion": 30.00,
      "valor_retenido": 45.00
    }
  ],
  "total": 2
}
```

---

## 4. Importar Retención y Asociarla a una Compra Existente

```bash
# Importar retención y asociarla directamente
curl -X POST "${API_URL}/xml/importar-retencion" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "xmlFile=@/ruta/al/archivo/retencion.xml" \
  -F "compra_id=${COMPRA_ID}"
```

**Respuesta esperada:**
```json
{
  "mensaje": "Retenciones importadas y asociadas a la compra exitosamente",
  "data": {
    "compra": {
      "id": 15,
      "valor_retencion_iva": "45.00",
      "valor_retencion_renta": "10.00",
      "retenciones": [
        {
          "id": 8,
          "compra_id": 15,
          "tipo_impuesto": "RENTA",
          "codigo_retencion": "303",
          "base_imponible": "1000.00",
          "porcentaje_retencion": "1.00",
          "valor_retenido": "10.00"
        },
        {
          "id": 9,
          "compra_id": 15,
          "tipo_impuesto": "IVA",
          "codigo_retencion": "10",
          "base_imponible": "150.00",
          "porcentaje_retencion": "30.00",
          "valor_retenido": "45.00"
        }
      ]
    },
    "retenciones_importadas": 2
  }
}
```

---

## 5. Agregar Retenciones Manualmente a una Compra

```bash
# Agregar retenciones de forma manual
curl -X PATCH "${API_URL}/compras/${COMPRA_ID}/retenciones" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "retenciones": [
      {
        "fecha_emision": "2025-01-15",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000789",
        "numero_autorizacion": "1501202501179214673900110010000007891234567814",
        "tipo_impuesto": "RENTA",
        "codigo_retencion": "303",
        "base_imponible": 1000.00,
        "porcentaje_retencion": 1.00,
        "valor_retenido": 10.00,
        "observaciones": "Retención en la fuente por servicios profesionales"
      },
      {
        "fecha_emision": "2025-01-15",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000789",
        "numero_autorizacion": "1501202501179214673900110010000007891234567814",
        "tipo_impuesto": "IVA",
        "codigo_retencion": "30",
        "base_imponible": 150.00,
        "porcentaje_retencion": 30.00,
        "valor_retenido": 45.00,
        "observaciones": "Retención IVA 30%"
      }
    ]
  }'
```

---

## 6. Obtener Compra con sus Retenciones

```bash
# Consultar compra con retenciones
curl -X GET "${API_URL}/compras/${COMPRA_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 7. Actualizar Datos de Compra (sin modificar retenciones)

```bash
# Actualizar solo campos de la compra
curl -X PUT "${API_URL}/compras/${COMPRA_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_sustento": "02",
    "observaciones": "Compra revisada y verificada"
  }'
```

**Nota:** Si no se incluye el campo `retenciones`, las retenciones existentes NO se modifican.

---

## 8. Actualizar Compra Y sus Retenciones

```bash
# Actualizar compra completa con retenciones
curl -X PUT "${API_URL}/compras/${COMPRA_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "observaciones": "Compra con retenciones actualizadas",
    "codigo_sustento": "01",
    "retenciones": [
      {
        "fecha_emision": "2025-01-15",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000999",
        "numero_autorizacion": "1501202501179214673900110010000009991234567815",
        "tipo_impuesto": "RENTA",
        "codigo_retencion": "332",
        "base_imponible": 500.00,
        "porcentaje_retencion": 2.00,
        "valor_retenido": 10.00,
        "observaciones": "Retención actualizada - otros servicios"
      }
    ]
  }'
```

**Importante:** Esto REEMPLAZA todas las retenciones existentes por las nuevas.

---

## 9. Crear Compra Completa desde Cero (Manual con Retenciones)

```bash
# Crear compra manual con retenciones
curl -X POST "${API_URL}/compras" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "periodo": "01/2025",
    "codigo_sustento": "01",
    "tipo_comprobante": "01",
    "tipo_proveedor": "02",
    "tipo_identificacion": "04",
    "identificacion_proveedor": "1792146739001",
    "razon_social_proveedor": "PROVEEDOR MANUAL S.A.",
    "fecha_emision": "2025-01-20",
    "fecha_registro": "2025-01-20",
    "establecimiento": "001",
    "punto_emision": "002",
    "secuencial": "000000555",
    "numero_autorizacion": "2001202501179214673900110020000005551234567816",
    "base_imponible_0": 0,
    "base_imponible_iva": 2000.00,
    "base_imponible_no_objeto_iva": 0,
    "base_imponible_exento_iva": 0,
    "monto_iva": 300.00,
    "monto_ice": 0,
    "total_compra": 2300.00,
    "forma_pago": "01",
    "estado": "BORRADOR",
    "retenciones": [
      {
        "fecha_emision": "2025-01-20",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000888",
        "numero_autorizacion": "2001202501179214673900110010000008881234567817",
        "tipo_impuesto": "RENTA",
        "codigo_retencion": "303",
        "base_imponible": 2000.00,
        "porcentaje_retencion": 1.00,
        "valor_retenido": 20.00,
        "observaciones": "Retención IR 1%"
      },
      {
        "fecha_emision": "2025-01-20",
        "establecimiento": "001",
        "punto_emision": "001",
        "secuencial": "000000888",
        "numero_autorizacion": "2001202501179214673900110010000008881234567817",
        "tipo_impuesto": "IVA",
        "codigo_retencion": "30",
        "base_imponible": 300.00,
        "porcentaje_retencion": 30.00,
        "valor_retenido": 90.00,
        "observaciones": "Retención IVA 30%"
      }
    ]
  }'
```

---

## 10. Listar Compras con Filtros

```bash
# Listar todas las compras
curl -X GET "${API_URL}/compras" \
  -H "Authorization: Bearer ${TOKEN}"

# Listar compras por periodo
curl -X GET "${API_URL}/compras?periodo=01/2025" \
  -H "Authorization: Bearer ${TOKEN}"

# Listar compras por estado
curl -X GET "${API_URL}/compras?estado=BORRADOR" \
  -H "Authorization: Bearer ${TOKEN}"

# Listar compras por proveedor
curl -X GET "${API_URL}/compras?identificacion_proveedor=1792146739001" \
  -H "Authorization: Bearer ${TOKEN}"

# Listar con paginación
curl -X GET "${API_URL}/compras?pagina=1&limite=20" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 11. Validar Compra

```bash
# Validar una compra
curl -X PATCH "${API_URL}/compras/${COMPRA_ID}/validar" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 12. Eliminar (Anular) Compra

```bash
# Anular compra (cambia estado a ANULADO)
curl -X DELETE "${API_URL}/compras/${COMPRA_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 13. Obtener Resumen de Compras por Periodo

```bash
# Obtener resumen del periodo
curl -X GET "${API_URL}/compras/resumen?periodo=01/2025" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Respuesta esperada:**
```json
{
  "mensaje": "Resumen de compras obtenido exitosamente",
  "data": {
    "total_compras": 5,
    "base_imponible_0": 0.00,
    "base_imponible_iva": 5000.00,
    "total_iva": 750.00,
    "total_retenciones_iva": 225.00,
    "total_retenciones_renta": 50.00,
    "total_general": 5750.00
  }
}
```

---

## Secuencia Completa de Prueba

```bash
#!/bin/bash

# 1. Configuración
export API_URL="http://localhost:3000/api"
export TOKEN="tu_jwt_token_aqui"

# 2. Importar factura
echo "Importando factura..."
RESPONSE=$(curl -s -X POST "${API_URL}/xml/importar-factura" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "xmlFile=@factura.xml")

echo "$RESPONSE" | jq '.'

# Extraer ID de la compra
COMPRA_ID=$(echo "$RESPONSE" | jq -r '.data.id')
echo "Compra creada con ID: ${COMPRA_ID}"

# 3. Esperar un momento
sleep 2

# 4. Importar retención y asociarla
echo "Importando retención..."
curl -s -X POST "${API_URL}/xml/importar-retencion" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "xmlFile=@retencion.xml" \
  -F "compra_id=${COMPRA_ID}" | jq '.'

# 5. Verificar compra completa
echo "Verificando compra completa..."
curl -s -X GET "${API_URL}/compras/${COMPRA_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'

# 6. Validar compra
echo "Validando compra..."
curl -s -X PATCH "${API_URL}/compras/${COMPRA_ID}/validar" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'

echo "Proceso completado!"
```

---

## Notas Importantes

1. **Autenticación**: Reemplaza `${TOKEN}` con tu JWT token válido obtenido del endpoint `/api/auth/login`

2. **Rutas de archivos**: Ajusta las rutas de los archivos XML según tu sistema:
   - Linux/Mac: `/home/usuario/archivos/factura.xml`
   - Windows: `C:/Users/usuario/archivos/factura.xml` o usa WSL

3. **Formato de respuesta**: Todos los ejemplos asumen que la API retorna JSON. Usa `jq` para formatear la salida si está disponible.

4. **IDs**: Los IDs de compras y retenciones varían. Asegúrate de usar los IDs correctos retornados por la API.

5. **Estados**: Una compra en estado `INCLUIDO_ATS` no puede ser editada o eliminada.
