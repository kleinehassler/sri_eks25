#!/bin/bash

#####################################
# Script de Configuración de Base de Datos
# Sistema ATS - SRI Ecuador
# Crea la base de datos y usuario MySQL
#####################################

set -e

echo "======================================"
echo "Sistema ATS - Configuración MySQL"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar que MySQL esté instalado
if ! command -v mysql &> /dev/null; then
    print_error "MySQL no está instalado. Ejecuta primero install-vps.sh"
    exit 1
fi

# Solicitar información
echo "Ingresa los siguientes datos para la configuración:"
echo ""

read -p "Nombre de la base de datos [sri_ats]: " DB_NAME
DB_NAME=${DB_NAME:-sri_ats}

read -p "Usuario de la base de datos [sriapp]: " DB_USER
DB_USER=${DB_USER:-sriapp}

echo ""
print_warning "Se generará una contraseña segura automáticamente"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo ""
print_message "Configuración a crear:"
echo "  Base de datos: $DB_NAME"
echo "  Usuario: $DB_USER"
echo "  Contraseña: $DB_PASSWORD"
echo ""

read -p "¿Deseas continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_message "Operación cancelada"
    exit 0
fi

# Solicitar contraseña root de MySQL
echo ""
print_warning "Necesitamos la contraseña de root de MySQL"
echo ""

# Crear archivo SQL temporal
SQL_FILE=$(mktemp)

cat > "$SQL_FILE" << EOF
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;

-- Mostrar bases de datos
SHOW DATABASES;

-- Mostrar usuarios
SELECT User, Host FROM mysql.user WHERE User='$DB_USER';
EOF

# Ejecutar SQL
print_message "Ejecutando comandos SQL..."
sudo mysql -u root -p < "$SQL_FILE"

# Limpiar
rm "$SQL_FILE"

# Guardar credenciales
CREDENTIALS_FILE="./database-credentials.txt"
cat > "$CREDENTIALS_FILE" << EOF
====================================
Credenciales de Base de Datos
Sistema ATS - SRI Ecuador
====================================

DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

====================================
IMPORTANTE:
- Copia estos valores a tu archivo .env
- Elimina este archivo después
====================================
EOF

print_message "Base de datos configurada correctamente"
echo ""
print_warning "Las credenciales se guardaron en: $CREDENTIALS_FILE"
print_warning "IMPORTANTE: Copia estos valores a backend/.env y ELIMINA este archivo"
echo ""
cat "$CREDENTIALS_FILE"
echo ""
