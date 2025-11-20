# Scripts de Utilidad - Sistema ATS

Esta carpeta contiene scripts para facilitar la instalación, configuración y mantenimiento del Sistema ATS.

## Scripts Disponibles

### 1. `install-vps.sh`

Script de instalación automática para VPS con Ubuntu/Debian.

**Uso:**
```bash
chmod +x scripts/install-vps.sh
./scripts/install-vps.sh
```

**Qué hace:**
- Actualiza el sistema operativo
- Instala Node.js 18 LTS
- Instala MySQL 8.0
- Instala Nginx
- Instala PM2
- Configura el firewall UFW

**Requisitos:**
- Ubuntu 20.04+ o Debian 11+
- Usuario con permisos sudo
- Conexión a internet

---

### 2. `setup-database.sh`

Crea la base de datos MySQL y el usuario de forma automática.

**Uso:**
```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

**Qué hace:**
- Crea la base de datos con codificación UTF8MB4
- Crea un usuario MySQL con contraseña segura
- Otorga permisos necesarios
- Guarda las credenciales en un archivo temporal

**Requisitos:**
- MySQL ya instalado
- Acceso root a MySQL

**IMPORTANTE:** Después de ejecutar, copia las credenciales a `backend/.env` y elimina el archivo temporal.

---

### 3. `check-health.sh`

Verifica que todos los servicios estén funcionando correctamente.

**Uso:**
```bash
chmod +x scripts/check-health.sh
./scripts/check-health.sh
```

**Qué verifica:**
- Node.js y npm instalados
- MySQL corriendo
- Nginx corriendo
- PM2 instalado y procesos activos
- Backend API respondiendo
- Espacio en disco disponible
- Uso de memoria RAM
- Estado del firewall

**Cuándo usar:**
- Después de instalar el sistema
- Para diagnosticar problemas
- Como parte de monitoreo regular

---

### 4. `deploy.sh`

Script para actualizar el sistema en producción.

**Uso:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Qué hace:**
1. Obtiene últimos cambios de Git
2. Instala/actualiza dependencias
3. Ejecuta migraciones (si es necesario)
4. Compila el frontend
5. Reinicia el backend sin downtime

**Requisitos:**
- Sistema ya instalado y funcionando
- PM2 configurado
- Git configurado

**IMPORTANTE:** Siempre haz un backup de la base de datos antes de actualizar.

---

## Instalación Completa Paso a Paso

### Para VPS Ubuntu/Debian:

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/sri_eks25.git
cd sri_eks25

# 2. Ejecutar instalador automático
chmod +x scripts/*.sh
./scripts/install-vps.sh

# 3. Configurar MySQL de forma segura
sudo mysql_secure_installation

# 4. Crear base de datos
./scripts/setup-database.sh

# 5. Configurar variables de entorno
cp backend/.env.example backend/.env
nano backend/.env
# Copiar las credenciales de database-credentials.txt

# 6. Configurar frontend
nano frontend/.env
# Agregar VITE_API_URL=https://tudominio.com/api

# 7. Instalar dependencias
npm run install:all

# 8. Ejecutar migraciones
npm run migrate
npm run seed

# 9. Compilar frontend
npm run build:frontend

# 10. Configurar Nginx
sudo nano /etc/nginx/sites-available/sri-ats
# Copiar configuración de la guía
sudo ln -s /etc/nginx/sites-available/sri-ats /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 11. Iniciar backend con PM2
pm2 start ecosystem.config.js
pm2 save

# 12. Verificar instalación
./scripts/check-health.sh

# 13. Instalar SSL (opcional pero recomendado)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

---

## Solución de Problemas

### Script falla con "Permission denied"

```bash
chmod +x scripts/*.sh
```

### Error "command not found"

El script probablemente necesita una herramienta que no está instalada. Lee el error para identificar qué falta.

### MySQL pide contraseña y no la tienes

```bash
sudo mysql
# Dentro de MySQL:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nueva_contraseña';
FLUSH PRIVILEGES;
EXIT;
```

---

## Mejores Prácticas

1. **Siempre ejecuta scripts en un ambiente de prueba primero**
2. **Haz backup antes de ejecutar scripts de actualización**
3. **Lee el contenido de los scripts antes de ejecutarlos**
4. **No ejecutes scripts como root, usa sudo cuando sea necesario**
5. **Verifica con `check-health.sh` después de cada cambio importante**

---

## Mantenimiento Regular

### Verificación Semanal
```bash
./scripts/check-health.sh
```

### Actualización Mensual
```bash
./scripts/deploy.sh
```

### Backup Diario (configurar en cron)
```bash
# Agregar a crontab
crontab -e

# Backup diario a las 2am
0 2 * * * /ruta/completa/scripts/backup-database.sh
```

---

## Soporte

Para más información, consulta la guía completa:
- `GUIA_INSTALACION_Y_DEPLOYMENT.md`

Para reportar problemas con los scripts:
- Abre un issue en GitHub
- Incluye el error completo y tu sistema operativo
