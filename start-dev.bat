@echo off
echo ====================================
echo Iniciando SRI_EKS
echo ====================================
echo.

echo Iniciando Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando Frontend...
cd frontend
start "Frontend Dev" cmd /k "npm run dev"
cd ..

echo.
echo ====================================
echo Aplicacion SRI_EKS iniciada!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo ====================================
