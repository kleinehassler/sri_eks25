#!/bin/bash
# ===========================================
# Script de Restauración de Base de Datos
# Sistema ATS - SRI Ecuador
# ===========================================

set -e

# Configuración
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-sri_ats}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-SuperRootPassword123!}"

echo "=========================================="
echo "Restauración de Base de Datos"
echo "=========================================="

# Verificar si se proporcionó archivo
if [ -z "$1" ]; then
    echo "Respaldos disponibles:"
    ls -lh "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | tail -10
    echo ""
    echo "Uso: $0 <archivo_respaldo.sql.gz>"
    echo "Ejemplo: $0 ./backups/sri_ats_20240115_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

echo "Archivo: $BACKUP_FILE"
echo "Base de datos: $DB_NAME"
echo ""

# Confirmación
read -p "¿Estás seguro? Esto REEMPLAZARÁ toda la base de datos actual (s/N): " confirm
if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "Operación cancelada"
    exit 0
fi

# Descomprimir si es necesario
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Descomprimiendo archivo..."
    gunzip -k "$BACKUP_FILE"
    SQL_FILE="${BACKUP_FILE%.gz}"
else
    SQL_FILE="$BACKUP_FILE"
fi

# Restaurar base de datos
echo "Restaurando base de datos..."

# Verificar si está en Docker o local
if [ -f "docker-compose.yml" ] && docker compose ps 2>/dev/null | grep -q "mysql"; then
    echo "Detectado: Entorno Docker"
    docker compose exec -T mysql mysql \
        -u root \
        -p"$MYSQL_ROOT_PASSWORD" \
        "$DB_NAME" < "$SQL_FILE"
else
    echo "Detectado: Entorno Local"
    mysql \
        -u root \
        -p"$MYSQL_ROOT_PASSWORD" \
        "$DB_NAME" < "$SQL_FILE"
fi

# Limpiar archivo descomprimido temporal
if [[ "$BACKUP_FILE" == *.gz ]]; then
    rm -f "$SQL_FILE"
fi

echo ""
echo "=========================================="
echo "¡Restauración completada exitosamente!"
echo "=========================================="
echo ""
echo "Recuerda reiniciar los servicios si es necesario:"
echo "  Docker: docker compose restart backend"
echo "  PM2: pm2 restart sri-ats-backend"
