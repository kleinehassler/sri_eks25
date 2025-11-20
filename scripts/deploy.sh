#!/bin/bash

#####################################
# Script de Deployment/Actualización
# Sistema ATS - SRI Ecuador
# Actualiza el código en producción
#####################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

echo "======================================"
echo "Sistema ATS - Deployment"
echo "======================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Mostrar estado actual
print_info "Estado actual de Git:"
git status --short

echo ""
read -p "¿Deseas continuar con el deployment? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_message "Deployment cancelado"
    exit 0
fi

echo ""
echo "======================================"
echo "PASO 1: Actualizar Código"
echo "======================================"

print_message "Obteniendo últimos cambios..."
git pull origin main

echo ""
echo "======================================"
echo "PASO 2: Instalar Dependencias"
echo "======================================"

print_message "Instalando/actualizando dependencias..."
npm run install:all

echo ""
echo "======================================"
echo "PASO 3: Ejecutar Migraciones"
echo "======================================"

print_warning "¿Hay nuevas migraciones de base de datos?"
read -p "Ejecutar migraciones? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_message "Ejecutando migraciones..."
    npm run migrate
else
    print_info "Saltando migraciones"
fi

echo ""
echo "======================================"
echo "PASO 4: Compilar Frontend"
echo "======================================"

print_message "Compilando frontend..."
npm run build:frontend

echo ""
echo "======================================"
echo "PASO 5: Reiniciar Backend"
echo "======================================"

if command -v pm2 &> /dev/null; then
    print_message "Reiniciando backend con PM2 (sin downtime)..."
    pm2 reload ecosystem.config.js

    print_info "Estado de PM2:"
    pm2 list
else
    print_warning "PM2 no está instalado. Debes reiniciar el backend manualmente"
fi

echo ""
echo "======================================"
echo "PASO 6: Limpiar Caché"
echo "======================================"

print_message "Limpiando archivos temporales..."
# Agregar comandos de limpieza si son necesarios

echo ""
echo "======================================"
echo "DEPLOYMENT COMPLETADO"
echo "======================================"
echo ""

print_message "El sistema ha sido actualizado correctamente"
echo ""
print_info "Verifica que todo funcione correctamente:"
echo "  - Frontend: https://tudominio.com"
echo "  - API Health: https://tudominio.com/api/health"
echo "  - Logs: pm2 logs"
echo ""
