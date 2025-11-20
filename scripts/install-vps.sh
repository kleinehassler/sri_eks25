#!/bin/bash

#####################################
# Script de Instalación Automática
# Sistema ATS - SRI Ecuador
# Para: Ubuntu/Debian VPS
#####################################

set -e  # Salir si hay error

echo "======================================"
echo "Sistema ATS - SRI Ecuador"
echo "Instalador Automático para VPS"
echo "======================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar que se ejecute como usuario no-root
if [ "$EUID" -eq 0 ]; then
    print_error "No ejecutes este script como root. Usa un usuario regular con sudo."
    exit 1
fi

# Verificar sistema operativo
if [ ! -f /etc/os-release ]; then
    print_error "No se pudo detectar el sistema operativo"
    exit 1
fi

source /etc/os-release
print_message "Sistema detectado: $PRETTY_NAME"

# Verificar Ubuntu o Debian
if [[ ! "$ID" =~ ^(ubuntu|debian)$ ]]; then
    print_warning "Este script está optimizado para Ubuntu/Debian"
    read -p "¿Deseas continuar de todos modos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "======================================"
echo "PASO 1: Actualizar Sistema"
echo "======================================"

print_message "Actualizando lista de paquetes..."
sudo apt update

print_message "Actualizando paquetes instalados (esto puede tardar)..."
sudo apt upgrade -y

print_message "Instalando herramientas básicas..."
sudo apt install -y curl wget git unzip vim nano build-essential python3 libxml2-dev

echo ""
echo "======================================"
echo "PASO 2: Instalar Node.js 18 LTS"
echo "======================================"

# Verificar si Node.js ya está instalado
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_warning "Node.js ya está instalado: $NODE_VERSION"
    read -p "¿Deseas reinstalar/actualizar? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_message "Saltando instalación de Node.js"
    else
        print_message "Instalando Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
else
    print_message "Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Verificar instalación
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
print_message "Node.js instalado: $NODE_VERSION"
print_message "npm instalado: $NPM_VERSION"

echo ""
echo "======================================"
echo "PASO 3: Instalar MySQL 8.0"
echo "======================================"

if command -v mysql &> /dev/null; then
    print_warning "MySQL ya está instalado"
    read -p "¿Deseas continuar de todos modos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_message "Saltando instalación de MySQL"
        SKIP_MYSQL=true
    fi
fi

if [ "$SKIP_MYSQL" != true ]; then
    print_message "Instalando MySQL Server..."
    sudo apt install -y mysql-server mysql-client

    print_message "Iniciando servicio MySQL..."
    sudo systemctl start mysql
    sudo systemctl enable mysql

    print_warning "IMPORTANTE: Ejecuta manualmente 'sudo mysql_secure_installation' después de este script"
fi

echo ""
echo "======================================"
echo "PASO 4: Instalar Nginx"
echo "======================================"

if command -v nginx &> /dev/null; then
    print_warning "Nginx ya está instalado"
else
    print_message "Instalando Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

echo ""
echo "======================================"
echo "PASO 5: Instalar PM2"
echo "======================================"

if command -v pm2 &> /dev/null; then
    print_message "PM2 ya está instalado: $(pm2 -v)"
else
    print_message "Instalando PM2 globalmente..."
    sudo npm install -g pm2

    print_message "Configurando PM2 para inicio automático..."
    pm2 startup systemd -u $USER --hp /home/$USER

    print_warning "IMPORTANTE: Ejecuta el comando que aparece arriba si PM2 lo solicita"
fi

echo ""
echo "======================================"
echo "PASO 6: Configurar Firewall (UFW)"
echo "======================================"

if command -v ufw &> /dev/null; then
    print_message "Configurando firewall UFW..."

    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'

    print_message "Estado del firewall:"
    sudo ufw status
else
    print_warning "UFW no está instalado"
fi

echo ""
echo "======================================"
echo "INSTALACIÓN COMPLETADA"
echo "======================================"
echo ""
print_message "Todas las dependencias han sido instaladas correctamente"
echo ""
echo "PRÓXIMOS PASOS:"
echo "1. Ejecutar: sudo mysql_secure_installation"
echo "2. Clonar tu proyecto: git clone https://github.com/tu-usuario/sri_eks25.git"
echo "3. Configurar variables de entorno (.env)"
echo "4. Instalar dependencias: npm run install:all"
echo "5. Ejecutar migraciones: npm run migrate"
echo "6. Iniciar con PM2: pm2 start ecosystem.config.js"
echo ""
echo "Para más detalles, consulta GUIA_INSTALACION_Y_DEPLOYMENT.md"
echo ""
