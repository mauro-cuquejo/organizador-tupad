@echo off
echo ========================================
echo TUPAD Organizador Academico - Inicializacion
echo ========================================
echo.

:: Verificar si Node.js está instalado
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado:
node --version

:: Verificar si npm está instalado
echo.
echo [2/8] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no está instalado.
    pause
    exit /b 1
)
echo ✓ npm encontrado:
npm --version

:: Verificar si RabbitMQ está instalado
echo.
echo [3/8] Verificando RabbitMQ...
rabbitmqctl status >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: RabbitMQ no está instalado o no está corriendo.
    echo Para instalar RabbitMQ:
    echo 1. Descarga desde: https://www.rabbitmq.com/download.html
    echo 2. O usa: choco install rabbitmq
    echo 3. Inicia el servicio: net start RabbitMQ
    echo.
    set /p continue="¿Deseas continuar sin RabbitMQ? (s/n): "
    if /i not "%continue%"=="s" (
        pause
        exit /b 1
    )
) else (
    echo ✓ RabbitMQ está funcionando
)

:: Instalar dependencias del backend
echo.
echo [4/8] Instalando dependencias del backend...
cd backend
if not exist node_modules (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias del backend
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencias del backend ya instaladas
)

:: Configurar archivo .env si no existe
echo.
echo [5/8] Configurando variables de entorno...
if not exist .env (
    echo Creando archivo .env...
    copy env.example .env
    echo ✓ Archivo .env creado desde env.example
    echo IMPORTANTE: Revisa y edita el archivo .env según tus necesidades
) else (
    echo ✓ Archivo .env ya existe
)

:: Instalar dependencias del frontend
echo.
echo [6/8] Instalando dependencias del frontend...
cd ..\frontend
if not exist node_modules (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias del frontend
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencias del frontend ya instaladas
)

:: Verificar que la base de datos existe
echo.
echo [7/8] Verificando base de datos...
cd ..\backend
if not exist database\tupad.db (
    echo La base de datos se creará automáticamente al iniciar el backend
) else (
    echo ✓ Base de datos encontrada
)

:: Iniciar servicios
echo.
echo [8/8] Iniciando servicios...
echo.
echo ========================================
echo INICIALIZACION COMPLETADA
echo ========================================
echo.
echo Para iniciar el sistema:
echo.
echo 1. Iniciar el backend:
echo    cd backend
echo    npm run dev
echo.
echo 2. En otra terminal, iniciar el frontend:
echo    cd frontend
echo    npm start
echo.
echo 3. Abrir el navegador en: http://localhost:3000
echo.
echo 4. Para probar la API, importa el archivo postman_collection.json en Postman
echo.
echo ========================================
echo.

set /p start="¿Deseas iniciar el backend ahora? (s/n): "
if /i "%start%"=="s" (
    echo Iniciando backend...
    npm run dev
) else (
    echo Para iniciar manualmente, ejecuta: cd backend && npm run dev
)

pause