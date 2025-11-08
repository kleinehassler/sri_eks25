-- =====================================================
-- Script para actualizar códigos de tipo de identificación
-- De códigos antiguos a códigos correctos del SRI
-- =====================================================

-- IMPORTANTE: Ejecutar este script SOLO si ya tienes datos en la base de datos
-- Si es una instalación nueva, simplemente ejecuta las migraciones y seeds

-- Actualizar tabla parametros_sri
-- Cambiar códigos de tipo de identificación a los correctos

UPDATE parametros_sri
SET codigo = '01'
WHERE tipo_parametro = 'TIPO_IDENTIFICACION' AND codigo = '04' AND descripcion = 'RUC';

UPDATE parametros_sri
SET codigo = '02'
WHERE tipo_parametro = 'TIPO_IDENTIFICACION' AND codigo = '05' AND descripcion = 'Cédula';

UPDATE parametros_sri
SET codigo = '03'
WHERE tipo_parametro = 'TIPO_IDENTIFICACION' AND codigo = '06' AND descripcion = 'Pasaporte';

-- Los códigos 07 y 08 ya son correctos, no necesitan actualización

-- =====================================================
-- Verificar los cambios
-- =====================================================

SELECT * FROM parametros_sri WHERE tipo_parametro = 'TIPO_IDENTIFICACION' ORDER BY codigo;

-- =====================================================
-- Resultado esperado:
-- =====================================================
-- 01 - RUC
-- 02 - Cédula
-- 03 - Pasaporte
-- 07 - Consumidor Final
-- 08 - Identificación del Exterior
-- =====================================================
