#!/bin/bash
# ===========================================
# Script de Inicio para Docker
# Sistema ATS - SRI Ecuador
# ===========================================

set -e

echo "=========================================="
echo "Sistema ATS - SRI Ecuador"
echo "Iniciando contenedores Docker..."
echo "=========================================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "ERROR: Docker Compose no está instalado"
    exit 1
fi

# Verificar archivo .env
if [ ! -f .env ]; then
    echo "AVISO: Archivo .env no encontrado"
    echo "Copiando desde .env.docker.example..."
    if [ -f .env.docker.example ]; then
        cp .env.docker.example .env
        echo "IMPORTANTE: Editar .env con tus valores reales antes de continuar"
        exit 1
    else
        echo "ERROR: No se encontró .env.docker.example"
        exit 1
    fi
fi

# Construir imágenes
echo ""
echo "Paso 1/5: Construyendo imágenes..."
docker compose build

# Iniciar servicios
echo ""
echo "Paso 2/5: Iniciando servicios..."
docker compose up -d

# Esperar a que MySQL esté listo
echo ""
echo "Paso 3/5: Esperando a que MySQL esté listo..."
sleep 10
until docker compose exec mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD:-SuperRootPassword123!}" --silent; do
    echo "Esperando MySQL..."
    sleep 5
done
echo "MySQL está listo!"

# Ejecutar migraciones
echo ""
echo "Paso 4/5: Ejecutando migraciones..."
docker compose exec backend npm run migrate

# Cargar datos iniciales
echo ""
echo "Paso 5/5: Cargando datos iniciales..."
docker compose exec backend npm run seed

echo ""
echo "=========================================="
echo "¡Sistema iniciado correctamente!"
echo "=========================================="
echo ""
echo "URLs de acceso:"
echo "- Frontend: http://localhost"
echo "- API Backend: http://localhost:3000"
echo "- Health Check: http://localhost:3000/api/health"
echo ""
echo "Comandos útiles:"
echo "- Ver logs: docker compose logs -f"
echo "- Detener: docker compose down"
echo "- Reiniciar: docker compose restart"
echo ""
