-- ===========================================
-- Script de Inicialización para Docker MySQL
-- Sistema ATS - SRI Ecuador
-- ===========================================

-- Configurar base de datos con UTF8MB4
ALTER DATABASE IF EXISTS sri_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configuraciones de rendimiento
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;
SET GLOBAL max_allowed_packet = 67108864;

-- Configuraciones de timezone para Ecuador
SET GLOBAL time_zone = '-05:00';

-- Mensaje de confirmación
SELECT 'Base de datos sri_ats inicializada correctamente' AS status;
