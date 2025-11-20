@echo off
REM ===========================================
REM Script de Inicio para Docker (Windows)
REM Sistema ATS - SRI Ecuador
REM ===========================================

echo ==========================================
echo Sistema ATS - SRI Ecuador
echo Iniciando contenedores Docker...
echo ==========================================

REM Verificar Docker
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado
    exit /b 1
)

REM Verificar archivo .env
if not exist ".env" (
    echo AVISO: Archivo .env no encontrado
    if exist ".env.docker.example" (
        echo Copiando desde .env.docker.example...
        copy ".env.docker.example" ".env"
        echo IMPORTANTE: Editar .env con tus valores reales antes de continuar
        pause
        exit /b 1
    ) else (
        echo ERROR: No se encontro .env.docker.example
        exit /b 1
    )
)

REM Construir imagenes
echo.
echo Paso 1/5: Construyendo imagenes...
docker compose build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al construir imagenes
    pause
    exit /b 1
)

REM Iniciar servicios
echo.
echo Paso 2/5: Iniciando servicios...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Fallo al iniciar servicios
    pause
    exit /b 1
)

REM Esperar a que MySQL este listo
echo.
echo Paso 3/5: Esperando a que MySQL este listo...
timeout /t 15 /nobreak >nul
echo MySQL deberia estar listo

REM Ejecutar migraciones
echo.
echo Paso 4/5: Ejecutando migraciones...
docker compose exec backend npm run migrate
if %errorlevel% neq 0 (
    echo ERROR: Fallo al ejecutar migraciones
    pause
    exit /b 1
)

REM Cargar datos iniciales
echo.
echo Paso 5/5: Cargando datos iniciales...
docker compose exec backend npm run seed
if %errorlevel% neq 0 (
    echo AVISO: Seeds ya ejecutados o error al cargar datos
)

echo.
echo ==========================================
echo Sistema iniciado correctamente!
echo ==========================================
echo.
echo URLs de acceso:
echo - Frontend: http://localhost
echo - API Backend: http://localhost:3000
echo - Health Check: http://localhost:3000/api/health
echo.
echo Comandos utiles:
echo - Ver logs: docker compose logs -f
echo - Detener: docker compose down
echo - Reiniciar: docker compose restart
echo.

pause
