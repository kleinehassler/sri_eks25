#!/bin/bash

#####################################
# Script de Health Check
# Sistema ATS - SRI Ecuador
# Verifica que todos los servicios estén funcionando
#####################################

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_check() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_fail() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

echo "======================================"
echo "Sistema ATS - Health Check"
echo "======================================"
echo ""

FAILED=0

# Check 1: Node.js
echo "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_check "Node.js instalado: $NODE_VERSION"
else
    print_fail "Node.js NO está instalado"
    FAILED=1
fi

# Check 2: npm
echo "Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_check "npm instalado: $NPM_VERSION"
else
    print_fail "npm NO está instalado"
    FAILED=1
fi

# Check 3: MySQL
echo "Verificando MySQL..."
if command -v mysql &> /dev/null; then
    if sudo systemctl is-active --quiet mysql; then
        print_check "MySQL está corriendo"
    else
        print_fail "MySQL está instalado pero NO está corriendo"
        print_info "Ejecuta: sudo systemctl start mysql"
        FAILED=1
    fi
else
    print_fail "MySQL NO está instalado"
    FAILED=1
fi

# Check 4: Nginx
echo "Verificando Nginx..."
if command -v nginx &> /dev/null; then
    if sudo systemctl is-active --quiet nginx; then
        print_check "Nginx está corriendo"
    else
        print_fail "Nginx está instalado pero NO está corriendo"
        print_info "Ejecuta: sudo systemctl start nginx"
        FAILED=1
    fi
else
    print_fail "Nginx NO está instalado"
    FAILED=1
fi

# Check 5: PM2
echo "Verificando PM2..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    print_check "PM2 instalado: $PM2_VERSION"

    # Ver procesos PM2
    PM2_LIST=$(pm2 jlist 2>/dev/null)
    if [ "$PM2_LIST" != "[]" ]; then
        print_info "Procesos PM2 activos:"
        pm2 list
    else
        print_info "No hay procesos PM2 corriendo"
    fi
else
    print_fail "PM2 NO está instalado"
    FAILED=1
fi

echo ""

# Check 6: Backend API (si está corriendo)
echo "Verificando Backend API..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    print_check "Backend API está respondiendo en puerto 3000"

    # Obtener información de health
    HEALTH_INFO=$(curl -s http://localhost:3000/api/health)
    echo "$HEALTH_INFO" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_INFO"
else
    print_fail "Backend API NO está respondiendo en puerto 3000"
    print_info "Verifica que el backend esté corriendo: pm2 logs"
    FAILED=1
fi

echo ""

# Check 7: Espacio en disco
echo "Verificando espacio en disco..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_check "Espacio en disco: ${DISK_USAGE}% usado"
else
    print_fail "Espacio en disco crítico: ${DISK_USAGE}% usado"
    print_info "Considera limpiar archivos innecesarios"
    FAILED=1
fi

# Check 8: Memoria RAM
echo "Verificando memoria RAM..."
MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -lt 90 ]; then
    print_check "Memoria RAM: ${MEMORY_USAGE}% usado"
else
    print_fail "Memoria RAM crítica: ${MEMORY_USAGE}% usado"
    print_info "Considera reiniciar servicios o aumentar RAM"
    FAILED=1
fi

# Check 9: Firewall
echo "Verificando firewall..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "Status: active"; then
        print_check "Firewall UFW está activo"
    else
        print_fail "Firewall UFW está inactivo"
        print_info "Ejecuta: sudo ufw enable"
    fi
else
    print_info "UFW no está instalado"
fi

echo ""
echo "======================================"

if [ $FAILED -eq 0 ]; then
    print_check "Todos los checks pasaron correctamente"
    exit 0
else
    print_fail "Algunos checks fallaron. Revisa los errores arriba"
    exit 1
fi
