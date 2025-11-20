#!/bin/bash
# ===========================================
# Script para Crear Usuario Administrador
# Sistema ATS - SRI Ecuador
# ===========================================

set -e

# Configuración por defecto
API_URL="${API_URL:-http://localhost:3000}"
EMAIL="${ADMIN_EMAIL:-admin@sistema.com}"
PASSWORD="${ADMIN_PASSWORD:-Admin123!}"
NOMBRE="${ADMIN_NOMBRE:-Administrador}"
APELLIDO="${ADMIN_APELLIDO:-Sistema}"

echo "=========================================="
echo "Crear Usuario Administrador"
echo "=========================================="
echo ""

# Verificar si se proporcionaron parámetros
if [ "$1" != "" ]; then
    EMAIL="$1"
fi
if [ "$2" != "" ]; then
    PASSWORD="$2"
fi
if [ "$3" != "" ]; then
    NOMBRE="$3"
fi
if [ "$4" != "" ]; then
    APELLIDO="$4"
fi

echo "API URL: $API_URL"
echo "Email: $EMAIL"
echo "Nombre: $NOMBRE $APELLIDO"
echo ""

# Verificar que curl esté instalado
if ! command -v curl &> /dev/null; then
    echo "ERROR: curl no está instalado"
    exit 1
fi

# Crear usuario
echo "Creando usuario..."
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/registrar" \
    -H "Content-Type: application/json" \
    -d "{
        \"nombre\": \"$NOMBRE\",
        \"apellido\": \"$APELLIDO\",
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\",
        \"rol\": \"ADMINISTRADOR_GENERAL\"
    }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ]; then
    echo ""
    echo "=========================================="
    echo "¡Usuario creado exitosamente!"
    echo "=========================================="
    echo "Email: $EMAIL"
    echo "Contraseña: $PASSWORD"
    echo "Rol: ADMINISTRADOR_GENERAL"
    echo ""
    echo "Ahora puedes iniciar sesión en:"
    echo "http://localhost:5173 (desarrollo)"
    echo "o"
    echo "https://tudominio.com (producción)"
elif [ "$http_code" = "400" ]; then
    echo "ERROR: Usuario ya existe o datos inválidos"
    echo "Respuesta: $body"
else
    echo "ERROR: HTTP $http_code"
    echo "Respuesta: $body"
fi
