# GUÍA COMPLETA DE INSTALACIÓN Y DESPLIEGUE
## Sistema ATS - SRI Ecuador v1.0.0

> Sistema Multi-empresa de Reportes Tributarios para el Servicio de Rentas Internas (SRI) de Ecuador

---

## TABLA DE CONTENIDOS

1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Instalación Local (Desarrollo)](#2-instalación-local-desarrollo)
3. [Despliegue en VPS (Ubuntu/Debian)](#3-despliegue-en-vps-ubuntudebian)
4. [Despliegue en cPanel/Hosting Compartido](#4-despliegue-en-cpanelhosting-compartido)
5. [Despliegue con Docker](#5-despliegue-con-docker)
6. [Configuración de Seguridad en Producción](#6-configuración-de-seguridad-en-producción)
7. [Mantenimiento y Respaldos](#7-mantenimiento-y-respaldos)
8. [Solución de Problemas Comunes](#8-solución-de-problemas-comunes)

---

## 1. REQUISITOS DEL SISTEMA

### 1.1 Requisitos Mínimos de Hardware

| Componente | Mínimo | Recomendado |
|-----------|--------|-------------|
| CPU | 1 Core | 2+ Cores |
| RAM | 2 GB | 4 GB |
| Almacenamiento | 10 GB SSD | 20 GB SSD |
| Ancho de Banda | 100 Mbps | 1 Gbps |

### 1.2 Software Requerido

| Software | Versión Mínima | Notas |
|----------|----------------|-------|
| Node.js | 18.0.0+ | LTS recomendado |
| npm | 9.0.0+ | Incluido con Node.js |
| MySQL | 8.0+ | o MariaDB 10.5+ |
| Git | 2.0+ | Para clonar repositorio |

### 1.3 Puertos Utilizados

| Servicio | Puerto Default | Configurable |
|----------|----------------|--------------|
| Backend API | 3000 | Sí (.env PORT) |
| Frontend Dev | 5173 | Sí (vite.config.js) |
| Frontend Prod | 80/443 | Sí (nginx/apache) |
| MySQL | 3306 | Sí (.env DB_PORT) |

---

## 2. INSTALACIÓN LOCAL (DESARROLLO)

### 2.1 Instalación en Windows

#### Paso 1: Instalar Node.js

1. Descargar Node.js LTS desde [https://nodejs.org/](https://nodejs.org/)
2. Ejecutar el instalador `.msi`
3. Marcar "Automatically install the necessary tools..."
4. Reiniciar el terminal después de la instalación

Verificar instalación:
```cmd
node --version
npm --version
```

#### Paso 2: Instalar MySQL Server

**Opción A: MySQL Server**
1. Descargar MySQL Community Server desde [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Ejecutar el instalador MSI
3. Seleccionar "Developer Default"
4. Configurar contraseña de root
5. Completar la instalación

**Opción B: XAMPP (más simple)**
1. Descargar XAMPP desde [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Instalar seleccionando MySQL
3. Iniciar MySQL desde el panel de control

#### Paso 3: Crear Base de Datos

Abrir MySQL Command Line o usar herramienta gráfica (MySQL Workbench, HeidiSQL):

```sql
-- Crear base de datos con codificación UTF8
CREATE DATABASE sri_ats
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Verificar creación
SHOW DATABASES;

-- Opcional: Crear usuario específico
CREATE USER 'sri_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON sri_ats.* TO 'sri_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Paso 4: Clonar o Descargar el Proyecto

**Con Git:**
```cmd
git clone https://github.com/tu-repositorio/sri_eks25.git
cd sri_eks25
```

**Sin Git:**
1. Descargar el ZIP del proyecto
2. Extraer en la ubicación deseada
3. Abrir terminal en esa carpeta

#### Paso 5: Configurar Variables de Entorno Backend

1. Navegar a la carpeta backend:
```cmd
cd backend
```

2. Copiar archivo de ejemplo:
```cmd
copy .env.example .env
```

3. Editar `.env` con Notepad o VS Code:
```env
# Configuración del Servidor
NODE_ENV=development
PORT=3000

# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sri_ats
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL

# Configuración JWT (IMPORTANTE: Cambiar en producción)
JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres
JWT_EXPIRE=8h
JWT_REFRESH_EXPIRE=7d

# Configuración CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

**IMPORTANTE:** Reemplazar `TU_CONTRASEÑA_MYSQL` con tu contraseña real de MySQL.

#### Paso 6: Configurar Variables de Entorno Frontend

1. Navegar a la carpeta frontend:
```cmd
cd ..\frontend
```

2. Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistema ATS - SRI Ecuador
```

#### Paso 7: Instalar Dependencias

Desde la raíz del proyecto:
```cmd
cd ..
npm run install:all
```

O manualmente:
```cmd
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

**Posibles errores y soluciones:**

Si hay error con `bcrypt`:
```cmd
npm install --global --production windows-build-tools
npm rebuild bcrypt --build-from-source
```

Si hay error con `libxmljs2`:
```cmd
npm install --global node-gyp
npm rebuild libxmljs2
```

#### Paso 8: Ejecutar Migraciones

```cmd
npm run migrate
```

Esto creará todas las tablas necesarias:
- empresas
- usuarios
- parametros_sri
- compras
- retenciones
- ventas
- exportaciones
- historial_ats
- log_actividad
- codigos_retencion

Verificar las tablas creadas:
```sql
USE sri_ats;
SHOW TABLES;
```

#### Paso 9: Cargar Datos Iniciales (Seeds)

```cmd
npm run seed
```

Esto carga:
- Tipos de identificación (Cédula, RUC, Pasaporte)
- Tipos de comprobantes (Factura, Nota Crédito, Liquidación)
- Códigos de sustento tributario
- Formas de pago
- Códigos de retención IVA y Renta

#### Paso 10: Iniciar la Aplicación

**Opción A: Iniciar ambos servicios simultáneamente**
```cmd
npm run dev
```

**Opción B: Usar el script de Windows**
```cmd
start-dev.bat
```

**Opción C: Iniciar por separado (en terminales diferentes)**

Terminal 1 - Backend:
```cmd
cd backend
npm run dev
```

Terminal 2 - Frontend:
```cmd
cd frontend
npm run dev
```

#### Paso 11: Verificar Instalación

1. **Health Check Backend:**
   Abrir en navegador: `http://localhost:3000/api/health`

   Respuesta esperada:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "uptime": 120.5,
     "database": "connected"
   }
   ```

2. **Frontend:**
   Abrir en navegador: `http://localhost:5173`

   Deberías ver la página de login del sistema.

3. **API Info:**
   `http://localhost:3000/`

   Respuesta:
   ```json
   {
     "message": "API Sistema ATS - SRI Ecuador",
     "version": "1.0.0",
     "status": "running"
   }
   ```

#### Paso 12: Crear Usuario Administrador

Usar Postman, Insomnia o cURL:

```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Administrador",
    "apellido": "Sistema",
    "email": "admin@sistema.com",
    "password": "Admin123!",
    "rol": "ADMINISTRADOR_GENERAL"
  }'
```

**PowerShell:**
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/registrar" `
  -ContentType "application/json" `
  -Body '{"nombre":"Administrador","apellido":"Sistema","email":"admin@sistema.com","password":"Admin123!","rol":"ADMINISTRADOR_GENERAL"}'
```

---

### 2.2 Instalación en macOS

#### Paso 1: Instalar Homebrew (si no está instalado)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Paso 2: Instalar Node.js y MySQL

```bash
brew install node@18
brew install mysql@8.0

# Iniciar MySQL automáticamente
brew services start mysql@8.0

# Configurar contraseña root
mysql_secure_installation
```

#### Paso 3: Seguir pasos 3-12 de Windows

Los comandos son idénticos, solo cambiar `copy` por `cp`:
```bash
cp .env.example .env
```

---

### 2.3 Instalación en Linux (Ubuntu/Debian)

#### Paso 1: Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

#### Paso 2: Instalar Node.js 18

```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node --version
npm --version
```

#### Paso 3: Instalar MySQL Server

```bash
sudo apt install -y mysql-server mysql-client

# Iniciar servicio
sudo systemctl start mysql
sudo systemctl enable mysql

# Configuración segura
sudo mysql_secure_installation
```

#### Paso 4: Configurar MySQL

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE sri_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sri_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON sri_ats.* TO 'sri_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Paso 5: Instalar Dependencias de Compilación

```bash
sudo apt install -y build-essential python3 libxml2-dev
```

#### Paso 6: Seguir pasos 4-12 de Windows

Usar `cp` en lugar de `copy`:
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

---

## 3. DESPLIEGUE EN VPS (UBUNTU/DEBIAN)

### 3.1 Preparación del Servidor

#### Paso 1: Acceder al VPS

Primero, necesitas acceder a tu servidor VPS mediante SSH. Si es la primera vez que te conectas, es posible que necesites aceptar la huella digital del servidor.

```bash
# Conectar con usuario root
ssh root@tu_ip_servidor

# O con tu usuario específico (si ya tienes uno configurado)
ssh usuario@tu_ip_servidor

# Si usas puerto personalizado (ej: 2222)
ssh -p 2222 root@tu_ip_servidor
```

**Si tienes problemas de conexión:**
```bash
# Verificar conectividad
ping tu_ip_servidor

# Verificar que el puerto SSH esté abierto
telnet tu_ip_servidor 22

# Si usas clave SSH en lugar de contraseña
ssh -i /ruta/a/tu/clave.pem root@tu_ip_servidor
```

**IMPORTANTE:** Si tu proveedor VPS te proporcionó una clave SSH (.pem, .ppk), asegúrate de:
1. Cambiar permisos en Linux/Mac: `chmod 400 clave.pem`
2. En Windows, usa PuTTY o PowerShell con la clave correctamente configurada

#### Paso 2: Crear Usuario No-Root (Recomendado)

Por seguridad, NO deberías ejecutar aplicaciones como root. Crea un usuario dedicado:

```bash
# Crear usuario 'sriapp' (puedes usar otro nombre)
adduser sriapp

# Te pedirá:
# - Contraseña (elige una fuerte)
# - Nombre completo (puedes dejar en blanco)
# - Otra información (opcional, presiona Enter)

# Agregar usuario al grupo sudo (permisos de administrador)
usermod -aG sudo sriapp

# Verificar que se agregó correctamente
groups sriapp
# Debería mostrar: sriapp : sriapp sudo

# Cambiar a ese usuario
su - sriapp

# Verificar que estás como el nuevo usuario
whoami
# Debería mostrar: sriapp
```

**Configurar SSH para el nuevo usuario (Opcional pero recomendado):**
```bash
# Crear directorio SSH para el usuario
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Si usas autenticación con clave, copiar tu clave pública
# Desde tu máquina local, ejecutar:
# ssh-copy-id sriapp@tu_ip_servidor

# O manualmente:
nano ~/.ssh/authorized_keys
# Pegar tu clave pública aquí
chmod 600 ~/.ssh/authorized_keys
```

#### Paso 3: Actualizar Sistema

Antes de instalar cualquier cosa, actualiza el sistema operativo:

```bash
# Actualizar lista de paquetes
sudo apt update

# Actualizar paquetes instalados (puede tardar varios minutos)
sudo apt upgrade -y

# Instalar herramientas básicas necesarias
sudo apt install -y curl wget git unzip vim nano build-essential

# Limpiar paquetes no necesarios
sudo apt autoremove -y

# Verificar versión del sistema
lsb_release -a
# Debería mostrar Ubuntu 20.04, 22.04, Debian 11, 12, etc.
```

**Verificar espacio disponible:**
```bash
# Ver espacio en disco
df -h
# Asegúrate de tener al menos 5-10GB libres

# Ver memoria RAM
free -h
# Recomendado: 2GB mínimo, 4GB ideal

# Ver CPUs
nproc
# Muestra número de procesadores disponibles
```

#### Paso 4: Instalar Node.js 18 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

#### Paso 5: Instalar MySQL Server

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

Respuestas recomendadas:
- VALIDATE PASSWORD COMPONENT: Y
- Password validation policy: 2 (STRONG)
- Remove anonymous users: Y
- Disallow root login remotely: Y
- Remove test database: Y
- Reload privilege tables: Y

#### Paso 6: Configurar Base de Datos MySQL

```bash
sudo mysql -u root -p
```

```sql
-- Crear base de datos
CREATE DATABASE sri_ats_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario dedicado
CREATE USER 'sriapp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ContraseñaMuySegura2024!';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON sri_ats_prod.* TO 'sriapp'@'localhost';
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
EXIT;
```

#### Paso 7: Instalar Nginx (Proxy Reverso)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Paso 8: Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 startup systemd
# Ejecutar el comando que aparece
```

#### Paso 9: Configurar Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 3.2 Despliegue de la Aplicación

#### Paso 10: Clonar Repositorio

```bash
cd /home/sriapp
git clone https://github.com/tu-usuario/sri_eks25.git
cd sri_eks25
```

O subir archivos por SFTP/SCP.

#### Paso 11: Configurar Variables de Entorno (Backend)

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```env
# CONFIGURACIÓN DE PRODUCCIÓN
NODE_ENV=production
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sri_ats_prod
DB_USER=sriapp
DB_PASSWORD=ContraseñaMuySegura2024!

# JWT - IMPORTANTE: Generar clave única
JWT_SECRET=GENERAR_CLAVE_ALEATORIA_DE_64_CARACTERES_AQUI
JWT_EXPIRE=8h
JWT_REFRESH_EXPIRE=7d

# CORS - Cambiar a tu dominio real
CORS_ORIGIN=https://tudominio.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=warn
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Paso 12: Configurar Variables de Entorno (Frontend)

```bash
nano frontend/.env
```

```env
VITE_API_URL=https://tudominio.com/api
VITE_APP_NAME=Sistema ATS - SRI Ecuador
```

#### Paso 13: Instalar Dependencias

```bash
npm run install:all
```

**Si hay problemas con bcrypt o libxmljs2:**
```bash
sudo apt install -y build-essential python3 libxml2-dev
cd backend
npm rebuild bcrypt --build-from-source
npm rebuild libxmljs2
cd ..
```

#### Paso 14: Ejecutar Migraciones y Seeds

```bash
npm run migrate
npm run seed
```

#### Paso 15: Compilar Frontend

```bash
npm run build:frontend
```

Esto genera la carpeta `frontend/dist/` con los archivos estáticos.

#### Paso 16: Configurar PM2 para Backend

Crear archivo de configuración PM2:

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'sri-ats-backend',
    cwd: '/home/sriapp/sri_eks25/backend',
    script: 'src/server.js',
    instances: 'max', // Usar todos los CPUs disponibles
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/sriapp/sri_eks25/logs/backend-error.log',
    out_file: '/home/sriapp/sri_eks25/logs/backend-out.log',
    log_file: '/home/sriapp/sri_eks25/logs/backend-combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    exp_backoff_restart_delay: 100
  }]
};
```

Crear carpeta de logs:
```bash
mkdir -p /home/sriapp/sri_eks25/logs
```

Iniciar con PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 list
pm2 logs sri-ats-backend
```

#### Paso 17: Configurar Nginx como Proxy Reverso

```bash
sudo nano /etc/nginx/sites-available/sri-ats
```

```nginx
# Configuración principal
server {
    listen 80;
    listen [::]:80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir HTTP a HTTPS (descomentar después de instalar SSL)
    # return 301 https://$server_name$request_uri;

    # Logs
    access_log /var/log/nginx/sri-ats-access.log;
    error_log /var/log/nginx/sri-ats-error.log;

    # Configuración general
    client_max_body_size 50M;
    client_body_buffer_size 128k;

    # Seguridad headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Servir Frontend (archivos estáticos)
    location / {
        root /home/sriapp/sri_eks25/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy para API Backend
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
        proxy_send_timeout 90;
    }

    # Denegar acceso a archivos sensibles
    location ~ /\.ht {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }

    location ~ /\.git {
        deny all;
    }
}
```

Activar configuración:
```bash
sudo ln -s /etc/nginx/sites-available/sri-ats /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Paso 18: Instalar Certificado SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Seguir las instrucciones interactivas. Certbot:
- Obtiene certificado gratuito
- Configura renovación automática
- Modifica configuración de Nginx

Verificar renovación automática:
```bash
sudo certbot renew --dry-run
```

#### Paso 19: Actualizar Configuración Post-SSL

Después de instalar SSL, actualizar `backend/.env`:
```env
CORS_ORIGIN=https://tudominio.com
```

Y `frontend/.env`:
```env
VITE_API_URL=https://tudominio.com/api
```

Reconstruir frontend:
```bash
npm run build:frontend
```

Reiniciar backend:
```bash
pm2 restart sri-ats-backend
```

#### Paso 20: Crear Usuario Administrador en Producción

```bash
curl -X POST https://tudominio.com/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin",
    "apellido": "Principal",
    "email": "admin@tudominio.com",
    "password": "ContraseñaSegura123!",
    "rol": "ADMINISTRADOR_GENERAL"
  }'
```

### 3.3 Comandos Útiles de PM2

```bash
# Ver estado de aplicaciones
pm2 list

# Ver logs en tiempo real
pm2 logs sri-ats-backend

# Reiniciar aplicación
pm2 restart sri-ats-backend

# Recargar sin downtime
pm2 reload sri-ats-backend

# Detener aplicación
pm2 stop sri-ats-backend

# Monitoreo
pm2 monit

# Información detallada
pm2 describe sri-ats-backend
```

### 3.4 Actualizar Aplicación en Producción

```bash
cd /home/sriapp/sri_eks25

# Obtener cambios
git pull origin main

# Instalar dependencias nuevas
npm run install:all

# Ejecutar migraciones si hay cambios en BD
npm run migrate

# Reconstruir frontend
npm run build:frontend

# Reiniciar backend sin downtime
pm2 reload sri-ats-backend
```

---

## 4. DESPLIEGUE EN CPANEL/HOSTING COMPARTIDO

> **NOTA IMPORTANTE:** El hosting compartido tiene limitaciones significativas para aplicaciones Node.js. Esta guía te ayudará a determinar si tu hosting es compatible y cómo instalarlo correctamente.

### 4.1 Verificar Compatibilidad del Hosting

**ANTES DE COMENZAR**, debes verificar con tu proveedor de hosting que soporte los siguientes requisitos:

#### Requisitos Técnicos Obligatorios:

1. **Node.js 18 o superior**
   - Verificar en cPanel > "Setup Node.js App" o "Node.js Selector"
   - Algunos proveedores solo ofrecen versiones antiguas

2. **Acceso SSH (Terminal)**
   - Sin SSH, la instalación será muy complicada o imposible
   - Verificar en cPanel > "Terminal" o "SSH Access"

3. **MySQL 8.0+ o MariaDB 10.5+**
   - Verificar en cPanel > "MySQL Databases" > versión en la parte inferior

4. **Espacio en Disco**
   - Mínimo: 1.5GB libres
   - Recomendado: 3GB o más
   - Verificar en cPanel > inicio (panel principal)

5. **Memoria RAM**
   - Mínimo: 512MB por proceso
   - Recomendado: 1GB o más
   - Consultar con tu proveedor los límites

6. **Capacidad de Ejecutar Procesos Persistentes**
   - Algunos hostings matan procesos después de inactividad
   - Preguntar si soportan "Long Running Processes" o "Background Processes"

#### Proveedores de Hosting Compartido Compatibles (Verificados):

- **cPanel con CloudLinux y Node.js Selector:** A2 Hosting, InMotion, SiteGround
- **cPanel con Softaculous:** HostGator (planes Business/Pro)
- **Hosting con Passenger:** DreamHost, HostGator VPS

#### Proveedores NO Recomendados:

- Hosting gratuitos (000webhost, InfinityFree, etc.) - No soportan Node.js
- Planes básicos de GoDaddy, Bluehost - Versiones muy antiguas de Node.js
- Hosting sin SSH - Imposible gestionar la aplicación

### 4.2 Prueba de Compatibilidad Rápida

Si ya tienes acceso a tu hosting, realiza esta prueba rápida:

#### Paso 1: Acceder a cPanel

1. Ir a `https://tudominio.com:2083` o `https://tudominio.com/cpanel`
2. Ingresar usuario y contraseña de cPanel

#### Paso 2: Verificar Node.js

1. Buscar "Node" en la barra de búsqueda de cPanel
2. Opciones válidas:
   - "Setup Node.js App"
   - "Node.js Selector"
   - "Application Manager"

Si NO encuentras ninguna opción relacionada con Node.js, tu hosting **NO ES COMPATIBLE**.

#### Paso 3: Verificar SSH

1. Buscar "SSH" o "Terminal" en cPanel
2. Si encuentras "Terminal" o "SSH Access", hacer clic
3. Intentar abrir terminal

**Si funciona**, ejecutar:
```bash
node --version
```

**Resultados esperados:**
- Si muestra `v18.x.x` o superior: **COMPATIBLE**
- Si muestra `v14.x.x` o inferior: **NO COMPATIBLE** (necesitas actualizar)
- Si muestra `command not found`: **NO COMPATIBLE**

#### Paso 4: Verificar MySQL

1. En cPanel, ir a "MySQL Databases"
2. Buscar al final de la página la versión
3. Debe ser MySQL 8.0+ o MariaDB 10.5+

### 4.3 Alternativas si tu Hosting NO es Compatible

Si tu hosting compartido no cumple con los requisitos, tienes estas opciones:

1. **Upgrade al plan superior** (VPS o Cloud Hosting del mismo proveedor)
2. **Migrar a un VPS económico:**
   - DigitalOcean: desde $4/mes
   - Vultr: desde $2.50/mes
   - Linode: desde $5/mes
   - Contabo: desde €3.99/mes
3. **Usar servicios de hosting Node.js especializados:**
   - Heroku (gratis con limitaciones)
   - Railway.app
   - Render.com
   - Vercel (solo frontend)
4. **Docker en hosting con Docker support:**
   - Algunos proveedores ofrecen Docker en planes compartidos

### 4.4 Instalación en cPanel (Solo si es Compatible)

**ADVERTENCIA:** Solo continúa si tu hosting pasó TODAS las pruebas de compatibilidad anteriores.

#### Paso 1: Crear Base de Datos MySQL en cPanel

1. **Acceder a cPanel** (https://tudominio.com:2083)

2. **Ir a "MySQL Databases"** (buscar en el menú o barra de búsqueda)

3. **Crear Base de Datos:**
   - En la sección "Create New Database"
   - Nombre: `sriats` (cPanel agregará prefijo automáticamente, ej: `usuario_sriats`)
   - Clic en "Create Database"
   - **Anotar el nombre completo** que se muestra (ej: `usuario_sriats`)

4. **Crear Usuario MySQL:**
   - En la sección "MySQL Users" > "Add New User"
   - Username: `sriuser` (quedará como `usuario_sriuser`)
   - Password: Generar contraseña fuerte (clic en "Password Generator")
   - **IMPORTANTE:** Copiar y guardar la contraseña generada
   - Clic en "Create User"

5. **Agregar Usuario a la Base de Datos:**
   - En la sección "Add User To Database"
   - Seleccionar usuario: `usuario_sriuser`
   - Seleccionar base de datos: `usuario_sriats`
   - Clic en "Add"
   - En la siguiente pantalla, marcar **"ALL PRIVILEGES"**
   - Clic en "Make Changes"

6. **Verificar Configuración:**
   - Desplazarse hacia abajo en "MySQL Databases"
   - En "Current Databases" deberías ver tu base de datos
   - En "Current Users" deberías ver tu usuario
   - **Anotar estos datos:**
     ```
     Database Name: usuario_sriats
     Database User: usuario_sriuser
     Database Password: [la que generaste]
     Database Host: localhost
     ```

#### Paso 2: Acceder por SSH

```bash
ssh usuario@tudominio.com -p 22
# O el puerto que indique tu proveedor
```

#### Paso 3: Verificar Versión de Node.js

```bash
node --version
npm --version
```

Si la versión es menor a 18, verifica si puedes cambiarla:
```bash
# Algunos cPanels permiten cambiar versión
source /opt/cpanel/ea-nodejs18/enable
```

O usando nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 4.3 Configurar la Aplicación

#### Paso 4: Subir Archivos

**Opción A: Git (si disponible)**
```bash
cd ~/
git clone https://github.com/tu-usuario/sri_eks25.git
cd sri_eks25
```

**Opción B: File Manager de cPanel**
1. Comprimir proyecto en ZIP
2. Subir a `public_html` o directorio deseado
3. Extraer archivo ZIP

**Opción C: FTP/SFTP**
1. Usar FileZilla u otro cliente FTP
2. Conectar al servidor
3. Subir toda la carpeta del proyecto

#### Paso 5: Instalar Dependencias

```bash
cd ~/sri_eks25
npm run install:all
```

**Si hay problemas con permisos:**
```bash
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

#### Paso 6: Configurar Variables de Entorno

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```env
NODE_ENV=production
PORT=3000

# Base de datos (nombres exactos de cPanel)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=usuario_sriats
DB_USER=usuario_sriuser
DB_PASSWORD=tu_contraseña_cpanel

JWT_SECRET=clave_generada_aleatoriamente_64_caracteres
JWT_EXPIRE=8h
JWT_REFRESH_EXPIRE=7d

CORS_ORIGIN=https://tudominio.com

LOG_LEVEL=warn
```

#### Paso 7: Ejecutar Migraciones

```bash
npm run migrate
npm run seed
```

#### Paso 8: Compilar Frontend

```bash
npm run build:frontend
```

### 4.4 Configurar Node.js en cPanel

#### Método 1: Usando "Setup Node.js App" de cPanel

1. En cPanel, ir a **Setup Node.js App** o **Node.js Selector**
2. Crear nueva aplicación:
   - **Node.js version:** 18.x
   - **Application mode:** Production
   - **Application root:** `/home/usuario/sri_eks25/backend`
   - **Application URL:** tudominio.com o subdominio
   - **Application startup file:** `src/server.js`
3. Hacer clic en "Create"
4. Copiar el comando de activación del entorno virtual
5. En la terminal, ejecutar:
```bash
source /home/usuario/nodevenv/sri_eks25/backend/18/bin/activate
```
6. Reiniciar aplicación desde cPanel

#### Método 2: Usando .htaccess (Apache + Passenger)

Si tu hosting usa Passenger:

1. Crear archivo `.htaccess` en `public_html`:
```apache
PassengerAppRoot "/home/usuario/sri_eks25/backend"
PassengerAppType node
PassengerStartupFile src/server.js
PassengerNodejs /home/usuario/nodevenv/sri_eks25/backend/18/bin/node
```

2. Crear archivo `app.js` en `public_html`:
```javascript
const app = require('/home/usuario/sri_eks25/backend/src/server.js');
```

### 4.5 Servir Frontend Estático

#### Opción A: Desde el mismo dominio

Copiar archivos compilados a public_html:
```bash
cp -r ~/sri_eks25/frontend/dist/* ~/public_html/
```

Crear `.htaccess` para SPA routing:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Proxy para API
<IfModule mod_proxy.c>
  ProxyPass /api http://127.0.0.1:3000/api
  ProxyPassReverse /api http://127.0.0.1:3000/api
</IfModule>
```

#### Opción B: Subdominios separados

1. Frontend en `www.tudominio.com`
2. API en `api.tudominio.com`
3. Configurar cada subdominio por separado en cPanel

### 4.6 Mantener Proceso Activo

En hosting compartido, los procesos pueden cerrarse. Soluciones:

#### Opción 1: Cron Job
```bash
# Editar crontab
crontab -e
```

Agregar:
```
*/5 * * * * cd /home/usuario/sri_eks25/backend && /usr/bin/node src/server.js >> /home/usuario/sri_eks25/logs/cron.log 2>&1
```

#### Opción 2: Forever (si está disponible)
```bash
npm install -g forever
cd ~/sri_eks25/backend
forever start src/server.js
```

#### Opción 3: PM2 (si está disponible)
```bash
npm install -g pm2
pm2 start ~/sri_eks25/backend/src/server.js --name sri-ats
pm2 save
pm2 startup
```

### 4.7 Limitaciones de Hosting Compartido

1. **Rendimiento:** Recursos compartidos con otros usuarios
2. **Procesos:** Pueden ser terminados por inactividad
3. **Memoria:** Límites estrictos de RAM
4. **CPU:** Uso limitado de procesador
5. **Conexiones:** Número máximo de conexiones concurrentes
6. **Módulos Nativos:** Problemas compilando bcrypt, libxmljs2

**Recomendación:** Para aplicaciones de producción serias, usar VPS o hosting dedicado.

---

## 5. DESPLIEGUE CON DOCKER

### 5.1 Requisitos Previos

- Docker 20.10+
- Docker Compose 2.0+

### 5.2 Instalación de Docker

**Ubuntu/Debian:**
```bash
# Instalar dependencias
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Agregar GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Verificar
docker --version
docker compose version
```

**Windows/Mac:**
Descargar Docker Desktop desde [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

### 5.3 Crear Archivos Docker

#### Dockerfile para Backend

Crear `backend/Dockerfile`:

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

# Instalar dependencias de compilación
RUN apk add --no-cache python3 make g++ libxml2-dev

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs uploads storage

# Exponer puerto
EXPOSE 3000

# Usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Comando de inicio
CMD ["node", "src/server.js"]
```

#### Dockerfile para Frontend

Crear `frontend/Dockerfile`:

```dockerfile
# Frontend Dockerfile - Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno para build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Construir aplicación
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Configuración Nginx para Frontend

Crear `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Servir archivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

#### Docker Compose

Crear `docker-compose.yml` en la raíz del proyecto:

```yaml
version: '3.8'

services:
  # Base de Datos MySQL
  mysql:
    image: mysql:8.0
    container_name: sri-ats-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword123}
      MYSQL_DATABASE: ${DB_NAME:-sri_ats}
      MYSQL_USER: ${DB_USER:-sriapp}
      MYSQL_PASSWORD: ${DB_PASSWORD:-sripassword123}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - sri-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD:-rootpassword123}"]
      timeout: 20s
      retries: 10

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sri-ats-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME:-sri_ats}
      DB_USER: ${DB_USER:-sriapp}
      DB_PASSWORD: ${DB_PASSWORD:-sripassword123}
      JWT_SECRET: ${JWT_SECRET:-your_jwt_secret_key_change_this}
      JWT_EXPIRE: ${JWT_EXPIRE:-8h}
      JWT_REFRESH_EXPIRE: ${JWT_REFRESH_EXPIRE:-7d}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    ports:
      - "3000:3000"
    volumes:
      - backend_uploads:/app/uploads
      - backend_logs:/app/logs
      - backend_storage:/app/storage
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - sri-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Nginx
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: /api
    container_name: sri-ats-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - sri-network

  # Nginx Proxy (Opcional - para configuración avanzada)
  nginx-proxy:
    image: nginx:alpine
    container_name: sri-ats-proxy
    restart: unless-stopped
    ports:
      - "443:443"
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - sri-network
    profiles:
      - proxy

volumes:
  mysql_data:
    driver: local
  backend_uploads:
    driver: local
  backend_logs:
    driver: local
  backend_storage:
    driver: local

networks:
  sri-network:
    driver: bridge
```

#### Variables de Entorno Docker

Crear `.env` en la raíz:

```env
# MySQL
MYSQL_ROOT_PASSWORD=SuperRootPassword123!
DB_NAME=sri_ats
DB_USER=sriapp
DB_PASSWORD=SRIAppPassword123!

# Backend
JWT_SECRET=genera_una_clave_jwt_super_segura_de_64_caracteres_minimo
JWT_EXPIRE=8h
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=http://localhost
LOG_LEVEL=info

# Frontend
VITE_API_URL=/api
```

#### Script de Inicialización MySQL

Crear `database/init/01-init.sql`:

```sql
-- Script de inicialización
ALTER DATABASE sri_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configuraciones adicionales si es necesario
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;
```

### 5.4 Despliegue con Docker

#### Paso 1: Construir Imágenes

```bash
docker compose build
```

#### Paso 2: Iniciar Servicios

```bash
docker compose up -d
```

#### Paso 3: Verificar Estado

```bash
docker compose ps
docker compose logs -f
```

#### Paso 4: Ejecutar Migraciones

```bash
docker compose exec backend npm run migrate
```

#### Paso 5: Cargar Datos Iniciales

```bash
docker compose exec backend npm run seed
```

#### Paso 6: Crear Usuario Admin

```bash
docker compose exec backend node -e "
const axios = require('axios');
axios.post('http://localhost:3000/api/auth/registrar', {
  nombre: 'Administrador',
  apellido: 'Sistema',
  email: 'admin@sistema.com',
  password: 'Admin123!',
  rol: 'ADMINISTRADOR_GENERAL'
}).then(r => console.log('Usuario creado:', r.data))
  .catch(e => console.error('Error:', e.response?.data || e.message));
"
```

#### Paso 7: Acceder a la Aplicación

- **Frontend:** http://localhost
- **API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

### 5.5 Comandos Docker Útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de servicio específico
docker compose logs -f backend

# Reiniciar servicios
docker compose restart

# Detener servicios
docker compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina datos)
docker compose down -v

# Reconstruir sin cache
docker compose build --no-cache

# Escalar backend (múltiples instancias)
docker compose up -d --scale backend=3

# Ejecutar comando en contenedor
docker compose exec backend npm run migrate

# Acceder a shell del contenedor
docker compose exec backend sh

# Ver uso de recursos
docker stats

# Limpiar imágenes no utilizadas
docker image prune -a
```

### 5.6 Docker en Producción

#### Configuración para Producción

1. **Usar registros privados:**
```bash
docker tag sri-ats-backend:latest tu-registro.com/sri-ats-backend:v1.0.0
docker push tu-registro.com/sri-ats-backend:v1.0.0
```

2. **Secrets seguros:**
```yaml
services:
  backend:
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

3. **Límites de recursos:**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

4. **Logging centralizado:**
```yaml
services:
  backend:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 5.7 Docker con SSL/HTTPS

Crear `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream frontend {
        server frontend:80;
    }

    server {
        listen 80;
        server_name tudominio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name tudominio.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Habilitar proxy:
```bash
docker compose --profile proxy up -d
```

---

## 6. CONFIGURACIÓN DE SEGURIDAD EN PRODUCCIÓN

### 6.1 Backend - Variables de Entorno Seguras

```env
# Producción
NODE_ENV=production

# Base de datos con usuario limitado
DB_USER=sri_app_user
DB_PASSWORD=contraseña_muy_fuerte_64_caracteres

# JWT fuerte
JWT_SECRET=generar_con_crypto.randomBytes(64).toString('hex')

# CORS restrictivo
CORS_ORIGIN=https://tudominio.com

# Logging mínimo
LOG_LEVEL=warn
```

### 6.2 Cabeceras de Seguridad

El backend ya incluye Helmet.js que configura:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)

### 6.3 Rate Limiting

Configurado en `backend/src/middlewares/rateLimiter.js`:
- 100 requests por 15 minutos por IP
- Ajustable en `.env`

### 6.4 Validación de Entrada

- express-validator en todos los endpoints
- Validación de RUC ecuatoriano
- Sanitización de datos

### 6.5 MySQL Seguro

```sql
-- Usuario con permisos mínimos
CREATE USER 'sri_reader'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON sri_ats.* TO 'sri_reader'@'localhost';

CREATE USER 'sri_writer'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE ON sri_ats.* TO 'sri_writer'@'localhost';

-- Deshabilitar root remoto
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

### 6.6 Firewall en VPS

```bash
# Solo permitir puertos necesarios
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 6.7 Actualizaciones de Seguridad

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Actualizar dependencias Node.js
npm audit
npm audit fix
```

---

## 7. MANTENIMIENTO Y RESPALDOS

### 7.1 Respaldo de Base de Datos

#### Manual
```bash
# Crear respaldo
mysqldump -u root -p sri_ats > /backups/sri_ats_$(date +%Y%m%d_%H%M%S).sql

# Comprimir
gzip /backups/sri_ats_*.sql
```

#### Automatizado con Cron
```bash
crontab -e
```

```
# Respaldo diario a las 2am
0 2 * * * mysqldump -u sriapp -pContraseña sri_ats | gzip > /backups/sri_ats_$(date +\%Y\%m\%d).sql.gz

# Eliminar respaldos mayores a 30 días
0 3 * * * find /backups -name "sri_ats_*.sql.gz" -mtime +30 -delete
```

#### Con Docker
```bash
# Respaldo
docker compose exec mysql mysqldump -u root -pRootPassword sri_ats > backup.sql

# Restaurar
docker compose exec -T mysql mysql -u root -pRootPassword sri_ats < backup.sql
```

### 7.2 Respaldo de Archivos

```bash
# Respaldar uploads y logs
tar -czf /backups/files_$(date +%Y%m%d).tar.gz \
  /home/sriapp/sri_eks25/backend/uploads \
  /home/sriapp/sri_eks25/backend/storage
```

### 7.3 Monitoreo con PM2

```bash
# Dashboard web
pm2 install pm2-server-monit

# Métricas
pm2 monit

# Reporte
pm2 report
```

### 7.4 Logs

```bash
# Backend logs
tail -f /home/sriapp/sri_eks25/backend/src/logs/combined.log

# Nginx logs
tail -f /var/log/nginx/sri-ats-access.log
tail -f /var/log/nginx/sri-ats-error.log

# PM2 logs
pm2 logs sri-ats-backend --lines 100
```

### 7.5 Health Checks

Crear script de monitoreo:

```bash
#!/bin/bash
# /home/sriapp/scripts/health_check.sh

HEALTH_URL="http://localhost:3000/api/health"
ALERT_EMAIL="admin@tudominio.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -ne 200 ]; then
    echo "ERROR: API no responde (HTTP $response)" | mail -s "SRI ATS - ALERTA" $ALERT_EMAIL
    pm2 restart sri-ats-backend
fi
```

Agregar a cron:
```
*/5 * * * * /home/sriapp/scripts/health_check.sh
```

---

## 8. SOLUCIÓN DE PROBLEMAS COMUNES

### 8.1 Error de Conexión a MySQL

**Problema:**
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```

**Solución:**
1. Verificar credenciales en `.env`
2. Verificar que MySQL esté corriendo:
```bash
sudo systemctl status mysql
```
3. Verificar permisos del usuario:
```sql
SHOW GRANTS FOR 'usuario'@'localhost';
```

### 8.2 Error con bcrypt

**Problema:**
```
Error: Cannot find module 'bcrypt'
```

**Solución:**
```bash
sudo apt install -y build-essential python3
npm rebuild bcrypt --build-from-source
```

### 8.3 Error con libxmljs2

**Problema:**
```
Module not found: libxmljs2
```

**Solución:**
```bash
sudo apt install -y libxml2-dev
npm rebuild libxmljs2
```

### 8.4 CORS Error

**Problema:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
1. Verificar `CORS_ORIGIN` en backend `.env`
2. Debe coincidir exactamente con la URL del frontend
3. Incluir protocolo (http:// o https://)

### 8.5 Puerto en Uso

**Problema:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**
```bash
# Encontrar proceso
lsof -i :3000
# o
netstat -tulpn | grep 3000

# Terminar proceso
kill -9 PID
```

### 8.6 Migraciones Fallidas

**Problema:**
```
SequelizeDatabaseError: Table already exists
```

**Solución:**
```bash
# Ver estado de migraciones
npx sequelize-cli db:migrate:status

# Revertir última migración
npm run migrate:undo

# Re-ejecutar
npm run migrate
```

### 8.7 Frontend No Carga

**Problema:** Página en blanco o errores 404

**Solución:**
1. Verificar que frontend esté compilado:
```bash
ls -la frontend/dist/
```
2. Verificar configuración Nginx
3. Verificar `VITE_API_URL` en frontend `.env`
4. Limpiar cache del navegador

### 8.8 PM2 No Inicia

**Problema:**
```
PM2 process not found
```

**Solución:**
```bash
# Regenerar lista
pm2 resurrect

# Si no funciona
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

### 8.9 Docker - Contenedor No Inicia

**Problema:** Container exits immediately

**Solución:**
```bash
# Ver logs
docker compose logs backend

# Verificar health check
docker inspect sri-ats-backend | grep -A 10 "Health"

# Reconstruir
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 8.10 Memoria Insuficiente

**Problema:**
```
JavaScript heap out of memory
```

**Solución:**
```bash
# Aumentar memoria Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm start

# O en PM2
pm2 start src/server.js --node-args="--max-old-space-size=4096"
```

---

## 9. CHECKLIST DE VERIFICACIÓN POST-INSTALACIÓN

### 9.1 Verificación VPS

Después de completar la instalación en VPS, verifica cada uno de estos puntos:

#### Sistema Base
- [ ] Sistema operativo actualizado (`sudo apt update && sudo apt upgrade`)
- [ ] Usuario no-root creado y configurado
- [ ] Permisos sudo funcionando correctamente
- [ ] Espacio en disco suficiente (mínimo 5GB libres)
- [ ] Memoria RAM adecuada (mínimo 2GB)

#### Servicios Instalados
- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm 9+ instalado (`npm --version`)
- [ ] MySQL 8.0+ corriendo (`sudo systemctl status mysql`)
- [ ] Nginx corriendo (`sudo systemctl status nginx`)
- [ ] PM2 instalado globalmente (`pm2 --version`)
- [ ] PM2 configurado para inicio automático (`pm2 startup`)

#### Base de Datos
- [ ] Base de datos creada con UTF8MB4
- [ ] Usuario MySQL creado con permisos correctos
- [ ] Conexión a MySQL funciona (`mysql -u sriapp -p`)
- [ ] Migraciones ejecutadas correctamente
- [ ] Datos semilla (seeds) cargados
- [ ] Backup automático configurado (cron)

#### Aplicación
- [ ] Repositorio clonado o archivos subidos
- [ ] Variables de entorno configuradas (backend/.env)
- [ ] Variables de entorno configuradas (frontend/.env)
- [ ] Dependencias instaladas (`npm run install:all`)
- [ ] Frontend compilado (`npm run build:frontend`)
- [ ] Backend iniciado con PM2
- [ ] Backend guardado en PM2 (`pm2 save`)

#### Nginx y Red
- [ ] Configuración de Nginx creada
- [ ] Sintaxis de Nginx correcta (`sudo nginx -t`)
- [ ] Nginx reiniciado (`sudo systemctl reload nginx`)
- [ ] Certificado SSL instalado (Let's Encrypt)
- [ ] Renovación automática de SSL configurada
- [ ] Firewall UFW activo y configurado
- [ ] Puertos 80 y 443 abiertos

#### Funcionalidad
- [ ] API responde en http://localhost:3000/api/health
- [ ] Health check retorna status 200
- [ ] Frontend accesible en https://tudominio.com
- [ ] Login funciona correctamente
- [ ] Registro de usuarios funciona
- [ ] Importación de XML funciona
- [ ] Generación de ATS funciona

#### Seguridad
- [ ] Contraseñas fuertes configuradas
- [ ] JWT_SECRET único y aleatorio
- [ ] CORS_ORIGIN configurado con dominio real
- [ ] Archivos .env no están en Git
- [ ] Permisos de archivos correctos (644 para archivos, 755 para directorios)
- [ ] SSH con clave pública configurado (recomendado)
- [ ] Actualizaciones automáticas de seguridad configuradas

#### Logs y Monitoreo
- [ ] Logs de PM2 accesibles (`pm2 logs`)
- [ ] Logs de Nginx funcionando
- [ ] Script de health check funciona (`./scripts/check-health.sh`)
- [ ] Alertas configuradas (opcional)

### 9.2 Verificación Hosting Compartido (cPanel)

#### Compatibilidad
- [ ] Node.js 18+ disponible en cPanel
- [ ] SSH/Terminal accesible
- [ ] MySQL 8.0+ disponible
- [ ] Espacio suficiente (mínimo 1.5GB)
- [ ] Límites de memoria adecuados

#### Base de Datos
- [ ] Base de datos MySQL creada en cPanel
- [ ] Usuario MySQL creado
- [ ] Usuario agregado a base de datos con ALL PRIVILEGES
- [ ] Conexión remota funciona (si es necesario)

#### Aplicación
- [ ] Archivos subidos por FTP/Git
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Migraciones ejecutadas
- [ ] Frontend compilado

#### Configuración cPanel
- [ ] Node.js App configurada en cPanel
- [ ] Puerto y ruta correctos
- [ ] Aplicación iniciada desde cPanel
- [ ] .htaccess configurado (si se usa)
- [ ] Proxy a backend funciona

#### Funcionalidad
- [ ] Backend responde en el puerto configurado
- [ ] Frontend carga correctamente
- [ ] API endpoints funcionan
- [ ] Subida de archivos funciona (si aplica)

### 9.3 Verificación Docker

#### Docker Instalado
- [ ] Docker 20.10+ instalado (`docker --version`)
- [ ] Docker Compose 2.0+ instalado (`docker compose version`)
- [ ] Usuario agregado al grupo docker
- [ ] Docker corriendo (`sudo systemctl status docker`)

#### Contenedores
- [ ] docker-compose.yml configurado
- [ ] .env creado con variables correctas
- [ ] Imágenes construidas (`docker compose build`)
- [ ] Contenedores iniciados (`docker compose up -d`)
- [ ] Todos los contenedores saludables (`docker compose ps`)

#### Servicios
- [ ] MySQL contenedor corriendo
- [ ] Backend contenedor corriendo
- [ ] Frontend contenedor corriendo
- [ ] Nginx proxy corriendo (si aplica)

#### Funcionalidad
- [ ] Health check de MySQL pasa
- [ ] Health check de Backend pasa
- [ ] Frontend accesible en puerto 80
- [ ] API accesible en puerto 3000
- [ ] Volúmenes persistentes creados

---

## 10. SCRIPTS DE UTILIDAD

El proyecto incluye scripts para facilitar la instalación y mantenimiento:

### Scripts Disponibles

1. **install-vps.sh** - Instalación automática en VPS
   ```bash
   ./scripts/install-vps.sh
   ```

2. **setup-database.sh** - Configuración automática de MySQL
   ```bash
   ./scripts/setup-database.sh
   ```

3. **check-health.sh** - Verificación de servicios
   ```bash
   ./scripts/check-health.sh
   ```

4. **deploy.sh** - Actualización en producción
   ```bash
   ./scripts/deploy.sh
   ```

5. **backup-database.sh** - Backup automático
   ```bash
   ./scripts/backup-database.sh
   ```

Para más información sobre los scripts, consulta `scripts/README.md`

---

## 11. PROCEDIMIENTOS DE EMERGENCIA

### 11.1 Servidor No Responde

```bash
# 1. Verificar estado de servicios
sudo systemctl status mysql
sudo systemctl status nginx
pm2 status

# 2. Reiniciar servicios si es necesario
sudo systemctl restart mysql
sudo systemctl restart nginx
pm2 restart all

# 3. Verificar logs
pm2 logs --lines 100
sudo tail -100 /var/log/nginx/error.log

# 4. Verificar recursos
df -h  # Espacio en disco
free -h  # Memoria RAM
top  # Procesos
```

### 11.2 Error de Base de Datos

```bash
# 1. Verificar que MySQL esté corriendo
sudo systemctl status mysql

# 2. Intentar conectar
mysql -u sriapp -p

# 3. Verificar logs de MySQL
sudo tail -100 /var/log/mysql/error.log

# 4. Si es necesario, restaurar backup
./scripts/restore-database.sh
```

### 11.3 Backend No Inicia

```bash
# 1. Ver logs de PM2
pm2 logs sri-ats-backend --lines 50

# 2. Verificar variables de entorno
cat backend/.env

# 3. Verificar puerto no esté en uso
sudo lsof -i :3000

# 4. Reiniciar backend
pm2 delete sri-ats-backend
pm2 start ecosystem.config.js

# 5. Si persiste, reinstalar dependencias
cd backend
rm -rf node_modules
npm install
cd ..
pm2 restart sri-ats-backend
```

### 11.4 Frontend No Carga

```bash
# 1. Verificar archivos compilados
ls -la frontend/dist/

# 2. Recompilar frontend
npm run build:frontend

# 3. Verificar configuración Nginx
sudo nginx -t

# 4. Recargar Nginx
sudo systemctl reload nginx

# 5. Limpiar caché del navegador
# Presionar Ctrl+Shift+R en el navegador
```

### 11.5 Certificado SSL Expirado

```bash
# 1. Verificar estado del certificado
sudo certbot certificates

# 2. Renovar manualmente
sudo certbot renew --force-renewal

# 3. Recargar Nginx
sudo systemctl reload nginx

# 4. Verificar renovación automática
sudo certbot renew --dry-run
```

---

## 12. FAQ - PREGUNTAS FRECUENTES

### Instalación

**P: ¿Cuánto tiempo toma la instalación completa?**
R: En un VPS, entre 30-60 minutos. En hosting compartido puede variar según las limitaciones.

**P: ¿Necesito conocimientos técnicos avanzados?**
R: Para VPS, necesitas conocimientos básicos de Linux y línea de comandos. Para hosting compartido, es más limitado pero más simple.

**P: ¿Puedo instalar en Windows Server?**
R: Sí, pero esta guía está optimizada para Linux. Necesitarás adaptar los comandos.

**P: ¿Funciona en hosting gratuito?**
R: No. Los hosting gratuitos no soportan Node.js o tienen limitaciones severas.

### Configuración

**P: ¿Debo cambiar el JWT_SECRET?**
R: SÍ, OBLIGATORIO. Usa: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**P: ¿Qué hago si olvidé la contraseña de MySQL?**
R: Consulta la sección 8.3 de "Solución de Problemas Comunes"

**P: ¿Cómo cambio el puerto del backend?**
R: Modifica la variable `PORT` en `backend/.env` y reinicia con PM2

### Rendimiento

**P: ¿Cuántas empresas puede manejar el sistema?**
R: Depende de tu hardware. Con 4GB RAM, fácilmente 100+ empresas.

**P: ¿Cómo optimizo el rendimiento?**
R:
- Usa PM2 en modo cluster
- Habilita cache en Nginx
- Optimiza consultas MySQL (índices)
- Considera usar Redis para sesiones

**P: ¿El sistema escala horizontalmente?**
R: Sí, puedes usar múltiples instancias del backend con un load balancer.

### Seguridad

**P: ¿Es seguro exponer el sistema a internet?**
R: Sí, si sigues las recomendaciones de seguridad de la sección 6.

**P: ¿Necesito SSL/HTTPS?**
R: SÍ, especialmente en producción. Es GRATIS con Let's Encrypt.

**P: ¿Cómo manejo múltiples dominios?**
R: Configura server blocks adicionales en Nginx para cada dominio.

### Backups

**P: ¿Con qué frecuencia debo hacer backups?**
R: Mínimo diario. Para datos críticos, considera backups cada hora.

**P: ¿Dónde guardo los backups?**
R: En el mismo servidor Y en ubicación externa (cloud storage, otro servidor).

**P: ¿Cómo automatizo los backups?**
R: Usa cron. Ejemplo en la sección 7.1 de la guía.

### Actualizaciones

**P: ¿Cómo actualizo el sistema?**
R: Usa el script `./scripts/deploy.sh` o sigue el proceso manual en sección 3.4

**P: ¿Las actualizaciones causan downtime?**
R: Con PM2 en modo reload, el downtime es < 1 segundo.

**P: ¿Debo actualizar Node.js?**
R: Mantente en LTS (18.x). Actualiza solo cuando sea necesario.

### Soporte

**P: ¿Dónde obtengo ayuda?**
R:
1. Revisa esta guía completa
2. Consulta los logs (`pm2 logs`, `/var/log/nginx/`)
3. Usa el script `check-health.sh`
4. Abre un issue en GitHub con detalles del error

**P: ¿El sistema tiene soporte comercial?**
R: Contacta al desarrollador para opciones de soporte comercial.

---

## CONTACTO Y SOPORTE

Para reportar problemas o solicitar ayuda:
- Email: soporte@tudominio.com
- Repositorio: https://github.com/tu-usuario/sri_eks25
- Documentación: Ver carpeta `/docum/`

### Información a Incluir en Reportes de Problemas:

1. Sistema operativo y versión
2. Versiones de Node.js, npm, MySQL
3. Tipo de instalación (VPS, cPanel, Docker)
4. Logs completos del error
5. Pasos para reproducir el problema
6. Variables de entorno (sin credenciales)

---

## CHANGELOG

### v1.0.0 (2024-01-15)
- Versión inicial del sistema
- Multi-empresa con roles y permisos
- Importación XML facturas y retenciones
- Generación ATS con validación XSD
- API REST con autenticación JWT
- Guía completa de instalación y deployment
- Scripts de utilidad para VPS
- Soporte para Docker
- Configuración de seguridad robusta

---

## RECURSOS ADICIONALES

### Documentación Oficial
- [Node.js Documentation](https://nodejs.org/docs/)
- [MySQL 8.0 Reference](https://dev.mysql.com/doc/refman/8.0/en/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

### Tutoriales Recomendados
- [Securing Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04)
- [Setting Up Let's Encrypt](https://certbot.eff.org/instructions)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

### Herramientas Útiles
- **MySQL Workbench** - Cliente gráfico para MySQL
- **Postman** - Pruebas de API
- **htop** - Monitor de sistema
- **ncdu** - Análisis de espacio en disco

---

**Última actualización:** Enero 2025

**Versión de la Guía:** 2.0

**Autor:** Sistema ATS Ecuador

**Licencia:** Propietaria - Todos los derechos reservados

**IMPORTANTE:** Esta guía se actualiza constantemente. Verifica que estás usando la versión más reciente.
