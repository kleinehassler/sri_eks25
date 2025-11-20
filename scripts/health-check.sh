#!/bin/bash
# ===========================================
# Script de Health Check
# Sistema ATS - SRI Ecuador
# ===========================================

# Configuración
API_URL="${API_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@tudominio.com}"
SEND_ALERTS="${SEND_ALERTS:-false}"

echo "=========================================="
echo "Health Check - Sistema ATS"
echo "Fecha: $(date)"
echo "=========================================="

ERRORS=0
WARNINGS=0

# Función para enviar alerta
send_alert() {
    if [ "$SEND_ALERTS" = "true" ] && command -v mail &> /dev/null; then
        echo "$1" | mail -s "SRI ATS - ALERTA: $2" "$ALERT_EMAIL"
    fi
}

# 1. Verificar Backend API
echo ""
echo "1. Backend API..."
backend_status=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health" 2>/dev/null || echo "000")
if [ "$backend_status" = "200" ]; then
    echo "   ✓ Backend OK (HTTP $backend_status)"

    # Obtener detalles del health check
    health_data=$(curl -s "$API_URL/api/health" 2>/dev/null)
    if echo "$health_data" | grep -q '"database":"connected"'; then
        echo "   ✓ Base de datos conectada"
    else
        echo "   ✗ Base de datos NO conectada"
        ERRORS=$((ERRORS + 1))
        send_alert "Base de datos no conectada" "MySQL Desconectado"
    fi
else
    echo "   ✗ Backend NO responde (HTTP $backend_status)"
    ERRORS=$((ERRORS + 1))
    send_alert "Backend no responde: HTTP $backend_status" "Backend Caído"
fi

# 2. Verificar Frontend
echo ""
echo "2. Frontend..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
if [ "$frontend_status" = "200" ]; then
    echo "   ✓ Frontend OK (HTTP $frontend_status)"
else
    echo "   ✗ Frontend NO responde (HTTP $frontend_status)"
    ERRORS=$((ERRORS + 1))
    send_alert "Frontend no responde: HTTP $frontend_status" "Frontend Caído"
fi

# 3. Verificar MySQL (si está disponible)
echo ""
echo "3. MySQL..."
if command -v mysqladmin &> /dev/null; then
    if mysqladmin ping -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" --silent 2>/dev/null; then
        echo "   ✓ MySQL respondiendo"
    else
        echo "   ✗ MySQL NO responde"
        ERRORS=$((ERRORS + 1))
    fi
elif docker compose ps 2>/dev/null | grep -q "mysql"; then
    if docker compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "   ✓ MySQL (Docker) respondiendo"
    else
        echo "   ✗ MySQL (Docker) NO responde"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   - MySQL no verificable localmente"
fi

# 4. Verificar Espacio en Disco
echo ""
echo "4. Espacio en disco..."
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    echo "   ✓ Espacio OK ($disk_usage% usado)"
elif [ "$disk_usage" -lt 90 ]; then
    echo "   ! Espacio ADVERTENCIA ($disk_usage% usado)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✗ Espacio CRÍTICO ($disk_usage% usado)"
    ERRORS=$((ERRORS + 1))
    send_alert "Espacio en disco crítico: $disk_usage%" "Disco Lleno"
fi

# 5. Verificar Memoria
echo ""
echo "5. Memoria RAM..."
if command -v free &> /dev/null; then
    mem_usage=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')
    if [ "$mem_usage" -lt 80 ]; then
        echo "   ✓ Memoria OK ($mem_usage% usado)"
    elif [ "$mem_usage" -lt 90 ]; then
        echo "   ! Memoria ADVERTENCIA ($mem_usage% usado)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✗ Memoria CRÍTICA ($mem_usage% usado)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   - Memoria no verificable"
fi

# 6. Verificar PM2 (si está disponible)
echo ""
echo "6. Procesos PM2..."
if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 jlist 2>/dev/null | grep -o '"status":"online"' | wc -l)
    if [ "$pm2_status" -gt 0 ]; then
        echo "   ✓ PM2 tiene $pm2_status procesos activos"
    else
        echo "   ! No hay procesos PM2 activos"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   - PM2 no instalado"
fi

# 7. Verificar Docker (si está disponible)
echo ""
echo "7. Contenedores Docker..."
if command -v docker &> /dev/null && docker compose ps 2>/dev/null | grep -q "running"; then
    running=$(docker compose ps 2>/dev/null | grep "running" | wc -l)
    echo "   ✓ $running contenedores corriendo"
else
    echo "   - Docker no activo o no instalado"
fi

# Resumen
echo ""
echo "=========================================="
echo "RESUMEN"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "Estado: ✓ TODO OK"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "Estado: ! ADVERTENCIAS ($WARNINGS)"
    exit 0
else
    echo "Estado: ✗ ERRORES CRÍTICOS ($ERRORS errores, $WARNINGS advertencias)"
    exit 1
fi
