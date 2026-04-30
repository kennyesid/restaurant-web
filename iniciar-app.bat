@echo off
title Mi Aplicación Next.js
echo ========================================
echo   Iniciando Mi Aplicación Next.js
echo ========================================
echo.

cd /d "%~dp0"

echo Construyendo la imagen (solo la primera vez o si hay cambios)...
docker compose build

echo.
echo Iniciando el contenedor...
docker compose up -d

echo.
echo ========================================
echo   ✅ Aplicación iniciada con exito!
echo   🌐 Abre tu navegador en: http://localhost:3000
echo ========================================
echo.
echo La aplicacion se reiniciara automaticamente
echo cuando la computadora se encienda.
echo.
pause