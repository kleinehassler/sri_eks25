#!/bin/bash
# ===========================================
# Script de Respaldo de Base de Datos
# Sistema ATS - SRI Ecuador
# ===========================================

set -e

# Configuración
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-sri_ats}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-SuperRootPassword123!}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Crear directorio de respaldos
mkdir -p "$BACKUP_DIR"

# Nombre del archivo con timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo "=========================================="
echo "Respaldo de Base de Datos"
echo "=========================================="
echo "Base de datos: $DB_NAME"
echo "Archivo: $BACKUP_FILE"
echo ""

# Verificar si está en Docker o local
if [ -f "docker-compose.yml" ] && docker compose ps 2>/dev/null | grep -q "mysql"; then
    echo "Detectado: Entorno Docker"
    echo "Creando respaldo..."
    docker compose exec -T mysql mysqldump \
        -u root \
        -p"$MYSQL_ROOT_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        "$DB_NAME" > "$BACKUP_FILE"
else
    echo "Detectado: Entorno Local"
    echo "Creando respaldo..."
    mysqldump \
        -u root \
        -p"$MYSQL_ROOT_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        "$DB_NAME" > "$BACKUP_FILE"
fi

# Comprimir respaldo
echo "Comprimiendo..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Verificar tamaño
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Respaldo creado: $BACKUP_FILE ($FILE_SIZE)"

# Limpiar respaldos antiguos
echo ""
echo "Eliminando respaldos mayores a $RETENTION_DAYS días..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Listar respaldos actuales
echo ""
echo "Respaldos disponibles:"
ls -lh "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | tail -10

echo ""
echo "=========================================="
echo "Respaldo completado exitosamente!"
echo "=========================================="
