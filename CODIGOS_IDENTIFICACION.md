# Actualización de Códigos de Tipo de Identificación

## 📋 Códigos Correctos del SRI

Según las especificaciones del SRI, los códigos de tipo de identificación son:

| Código | Descripción |
|--------|-------------|
| **01** | RUC |
| **02** | Cédula |
| **03** | Pasaporte |
| **07** | Consumidor Final |
| **08** | Identificación del Exterior |

## 🔧 Cambios Realizados

### 1. **Validadores Actualizados** ✅

#### `backend/src/validators/compraValidator.js`
- Agregada validación `isIn(['01', '02', '03', '07', '08'])` para `tipo_identificacion`
- Mensaje de error descriptivo con todos los códigos válidos

#### `backend/src/validators/exportacionValidator.js`
- Actualizado validador de creación y actualización
- Mismo conjunto de códigos válidos: `['01', '02', '03', '07', '08']`

### 2. **Seeds Actualizados** ✅

#### `database/seeds/001-parametros-sri.js`
Códigos corregidos:
- ~~04~~ → **01** (RUC)
- ~~05~~ → **02** (Cédula)
- ~~06~~ → **03** (Pasaporte)
- **07** (Consumidor Final) - sin cambios
- **08** (Identificación del Exterior) - sin cambios

## 📝 Aplicar los Cambios

### Opción A: Base de Datos Nueva (Instalación desde cero)

```bash
cd backend

# 1. Ejecutar migraciones
npm run migrate

# 2. Ejecutar seeds (ya incluye los códigos correctos)
npm run seed
```

### Opción B: Base de Datos Existente (Con datos)

```bash
cd backend

# 1. Ejecutar script SQL de actualización
mysql -u root -p sri_ats < actualizar-codigos-identificacion.sql

# 2. Verificar que los cambios se aplicaron correctamente
mysql -u root -p -e "SELECT * FROM sri_ats.parametros_sri WHERE tipo_parametro = 'TIPO_IDENTIFICACION' ORDER BY codigo;"
```

**Resultado esperado:**
```
+----+----------------------+--------+-------------------------------------+--------+
| id | tipo_parametro       | codigo | descripcion                         | estado |
+----+----------------------+--------+-------------------------------------+--------+
|  1 | TIPO_IDENTIFICACION  | 01     | RUC                                 | ACTIVO |
|  2 | TIPO_IDENTIFICACION  | 02     | Cédula                              | ACTIVO |
|  3 | TIPO_IDENTIFICACION  | 03     | Pasaporte                           | ACTIVO |
|  4 | TIPO_IDENTIFICACION  | 07     | Consumidor Final                    | ACTIVO |
|  5 | TIPO_IDENTIFICACION  | 08     | Identificación del Exterior         | ACTIVO |
+----+----------------------+--------+-------------------------------------+--------+
```

## 🧪 Validación

Después de aplicar los cambios, prueba crear una compra con diferentes tipos de identificación:

```json
{
  "tipo_identificacion": "01",  // RUC - ✅ VÁLIDO
  "tipo_identificacion": "02",  // Cédula - ✅ VÁLIDO
  "tipo_identificacion": "03",  // Pasaporte - ✅ VÁLIDO
  "tipo_identificacion": "04",  // ❌ INVÁLIDO - Error de validación
  "tipo_identificacion": "07",  // Consumidor Final - ✅ VÁLIDO
  "tipo_identificacion": "08"   // Identificación del Exterior - ✅ VÁLIDO
}
```

## 📁 Archivos Modificados

1. ✅ `backend/src/validators/compraValidator.js` - Validación de compras
2. ✅ `backend/src/validators/exportacionValidator.js` - Validación de exportaciones
3. ✅ `database/seeds/001-parametros-sri.js` - Datos semilla de parámetros SRI
4. ✅ `backend/actualizar-codigos-identificacion.sql` - Script SQL de actualización

## ⚠️ Notas Importantes

- Los modelos de base de datos (`Compra.js`, `Venta.js`, `Exportacion.js`) usan `STRING(2)` sin restricciones ENUM, por lo que no requieren migración de base de datos
- Las validaciones se realizan a nivel de aplicación (express-validator)
- Los códigos existentes en compras/ventas creadas previamente no se modifican automáticamente
- Si tienes datos de prueba con códigos antiguos (04, 05, 06), deberás actualizarlos manualmente o recrear los registros

## 🔍 Verificar en el Frontend

Una vez que el backend esté actualizado, verifica que el frontend muestre las opciones correctas en los selectores de tipo de identificación:

```jsx
<select name="tipo_identificacion">
  <option value="01">01 - RUC</option>
  <option value="02">02 - Cédula</option>
  <option value="03">03 - Pasaporte</option>
  <option value="07">07 - Consumidor Final</option>
  <option value="08">08 - Identificación del Exterior</option>
</select>
```

## 🚀 Próximos Pasos

1. **Reiniciar el servidor backend** para que las validaciones surtan efecto
2. **Probar la creación de compras** con los códigos correctos
3. **Verificar la generación del ATS** para confirmar que usa los códigos correctos
4. **Actualizar el frontend** si usa códigos hardcodeados
