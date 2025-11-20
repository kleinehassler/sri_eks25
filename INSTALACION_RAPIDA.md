# Guía de Instalación Rápida - Sistema ATS

> Para la guía completa y detallada, consulta [GUIA_INSTALACION_Y_DEPLOYMENT.md](GUIA_INSTALACION_Y_DEPLOYMENT.md)

## Tabla de Contenidos Rápida

1. [VPS Ubuntu/Debian](#vps-ubuntudebian) - Instalación en 15 minutos
2. [Hosting Compartido (cPanel)](#hosting-compartido-cpanel) - Verificación de compatibilidad
3. [Docker](#docker) - Instalación con contenedores
4. [Scripts Automáticos](#scripts-automáticos) - Facilita la instalación

---

## VPS Ubuntu/Debian

### Requisitos Mínimos
- Ubuntu 20.04+ o Debian 11+
- 2GB RAM, 10GB espacio
- Acceso SSH con sudo

### Instalación Rápida (Método Automático)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/sri_eks25.git
cd sri_eks25

# 2. Ejecutar instalador automático
chmod +x scripts/install-vps.sh
./scripts/install-vps.sh

# 3. Configurar MySQL
sudo mysql_secure_installation
./scripts/setup-database.sh

# 4. Configurar variables de entorno
cp backend/.env.example backend/.env
nano backend/.env
# Copiar credenciales de database-credentials.txt

# 5. Instalar dependencias y compilar
npm run install:all
npm run migrate
npm run seed
npm run build:frontend

# 6. Configurar Nginx
sudo nano /etc/nginx/sites-available/sri-ats
# Copiar configuración de la guía completa
sudo ln -s /etc/nginx/sites-available/sri-ats /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. Iniciar aplicación
pm2 start ecosystem.config.js
pm2 save

# 8. Instalar SSL (opcional pero recomendado)
sudo certbot --nginx -d tudominio.com

# 9. Verificar instalación
./scripts/check-health.sh
```

### Comandos Esenciales

```bash
# Ver logs
pm2 logs

# Reiniciar aplicación
pm2 restart sri-ats-backend

# Actualizar aplicación
./scripts/deploy.sh

# Backup base de datos
./scripts/backup-database.sh

# Health check
curl http://localhost:3000/api/health
```

---

## Hosting Compartido (cPanel)

### Verificación de Compatibilidad

**ANTES de intentar instalar, verifica:**

1. **Accede a cPanel** y busca "Node.js" en la barra de búsqueda
   - ✅ Si encuentras "Setup Node.js App" → Continúa
   - ❌ Si NO encuentras nada → Tu hosting NO es compatible

2. **Verifica Node.js 18+**
   ```bash
   # En Terminal de cPanel
   node --version
   # Debe mostrar v18.x.x o superior
   ```

3. **Verifica MySQL 8.0+**
   - En cPanel → MySQL Databases
   - Ver versión al final de la página

### Si NO es Compatible

**Opciones:**
- Migrar a VPS (DigitalOcean, Vultr, Linode desde $4-5/mes)
- Upgrade al plan VPS de tu proveedor actual
- Usar servicios especializados (Heroku, Railway, Render)

### Si ES Compatible

Sigue la guía completa sección 4.4: [GUIA_INSTALACION_Y_DEPLOYMENT.md](GUIA_INSTALACION_Y_DEPLOYMENT.md#44-instalación-en-cpanel-solo-si-es-compatible)

---

## Docker

### Instalación con Docker Compose

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/sri_eks25.git
cd sri_eks25

# 2. Configurar variables de entorno
cp .env.docker.example .env
nano .env
# Cambiar contraseñas y JWT_SECRET

# 3. Construir e iniciar contenedores
docker compose build
docker compose up -d

# 4. Ejecutar migraciones
docker compose exec backend npm run migrate
docker compose exec backend npm run seed

# 5. Verificar
docker compose ps
curl http://localhost/api/health
```

### Comandos Docker Útiles

```bash
# Ver logs
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Detener todo
docker compose down

# Backup base de datos
docker compose exec mysql mysqldump -u root -p sri_ats > backup.sql
```

---

## Scripts Automáticos

El proyecto incluye scripts que facilitan enormemente la instalación:

### Disponibles en `/scripts/`

1. **install-vps.sh** - Instala todas las dependencias en VPS
   ```bash
   ./scripts/install-vps.sh
   ```

2. **setup-database.sh** - Configura MySQL automáticamente
   ```bash
   ./scripts/setup-database.sh
   ```

3. **check-health.sh** - Verifica que todo funcione
   ```bash
   ./scripts/check-health.sh
   ```

4. **deploy.sh** - Actualiza el sistema en producción
   ```bash
   ./scripts/deploy.sh
   ```

5. **backup-database.sh** - Crea backup de la BD
   ```bash
   ./scripts/backup-database.sh
   ```

Para más detalles: [scripts/README.md](scripts/README.md)

---

## Checklist Post-Instalación

### Verificación Rápida

- [ ] Node.js 18+ instalado
- [ ] MySQL corriendo
- [ ] Base de datos creada
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Migraciones ejecutadas
- [ ] Frontend compilado
- [ ] Backend corriendo (PM2 o Docker)
- [ ] Nginx/Proxy configurado
- [ ] SSL instalado (producción)
- [ ] Health check responde: `curl http://localhost:3000/api/health`

---

## Solución Rápida de Problemas

### Backend no inicia
```bash
pm2 logs sri-ats-backend
# Revisar error en logs
```

### Error de conexión a MySQL
```bash
# Verificar credenciales en backend/.env
mysql -u sriapp -p
```

### Frontend no carga
```bash
# Recompilar
npm run build:frontend
sudo systemctl reload nginx
```

### Puerto en uso
```bash
# Encontrar proceso
sudo lsof -i :3000
# Matar proceso
kill -9 PID
```

---

## URLs de Verificación

Después de la instalación, verifica estos endpoints:

- **Frontend:** https://tudominio.com
- **API Health:** https://tudominio.com/api/health
- **API Info:** https://tudominio.com/api/

**Respuesta esperada del health check:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-19T...",
  "uptime": 120.5,
  "database": "connected"
}
```

---

## Recursos

### Documentación
- [Guía Completa de Instalación](GUIA_INSTALACION_Y_DEPLOYMENT.md) - Todos los detalles
- [README de Scripts](scripts/README.md) - Uso de scripts auxiliares

### Soporte
- Repositorio: https://github.com/tu-usuario/sri_eks25
- Issues: Reporta problemas en GitHub

### Proveedores VPS Recomendados
- **DigitalOcean** - Droplets desde $4/mes
- **Vultr** - Cloud Compute desde $2.50/mes
- **Linode (Akamai)** - Desde $5/mes
- **Contabo** - Desde €3.99/mes (Europa)

---

## Siguientes Pasos

Una vez instalado:

1. **Crear usuario administrador**
   ```bash
   curl -X POST https://tudominio.com/api/auth/registrar \
     -H "Content-Type: application/json" \
     -d '{"nombre":"Admin","apellido":"Sistema","email":"admin@sistema.com","password":"Admin123!","rol":"ADMINISTRADOR_GENERAL"}'
   ```

2. **Configurar backup automático**
   ```bash
   crontab -e
   # Agregar: 0 2 * * * /ruta/scripts/backup-database.sh
   ```

3. **Monitoreo regular**
   ```bash
   ./scripts/check-health.sh
   ```

---

## Arquitectura del Sistema

```
┌─────────────────┐
│   Frontend      │ (React + Vite)
│   Port 80/443   │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │   Nginx Proxy       │
    └────┬────────────────┘
         │
    ┌────▼────────────────┐
    │   Backend API       │ (Node.js + Express)
    │   Port 3000         │ (PM2 Process Manager)
    └────┬────────────────┘
         │
    ┌────▼────────────────┐
    │   MySQL Database    │
    │   Port 3306         │
    └─────────────────────┘
```

---

**Última actualización:** Enero 2025

**IMPORTANTE:** Esta es una guía rápida. Para instrucciones detalladas, troubleshooting completo, configuración de seguridad y todas las opciones avanzadas, consulta la [Guía Completa](GUIA_INSTALACION_Y_DEPLOYMENT.md).
