@echo off
echo Creando archivo .env...

if exist .env (
    echo El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/n)
    set /p choice=
    if /i "%choice%"=="s" (
        echo Sobrescribiendo .env...
    ) else (
        echo Operación cancelada.
        pause
        exit /b
    )
)

echo # Configuración del servidor > .env
echo PORT=3000 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # Configuración de la base de datos >> .env
echo DB_PATH=./database/academic_organizer.db >> .env
echo. >> .env
echo # Configuración JWT >> .env
echo JWT_SECRET=tupad_jwt_secret_2024_super_seguro_para_produccion >> .env
echo JWT_EXPIRES_IN=24h >> .env
echo. >> .env
echo # Configuración de email (para notificaciones) >> .env
echo EMAIL_HOST=smtp.gmail.com >> .env
echo EMAIL_PORT=587 >> .env
echo EMAIL_USER=tu_email@gmail.com >> .env
echo EMAIL_PASS=tu_password_de_aplicacion >> .env
echo EMAIL_FROM=tu_email@gmail.com >> .env
echo. >> .env
echo # Configuración de seguridad >> .env
echo BCRYPT_ROUNDS=12 >> .env
echo RATE_LIMIT_WINDOW_MS=900000 >> .env
echo RATE_LIMIT_MAX_REQUESTS=100 >> .env
echo. >> .env
echo # Configuración de RabbitMQ (AMQP) - Deshabilitado temporalmente >> .env
echo RABBITMQ_URL=amqp://localhost:5672 >> .env
echo RABBITMQ_USERNAME=guest >> .env
echo RABBITMQ_PASSWORD=guest >> .env
echo RABBITMQ_HOST=localhost >> .env
echo RABBITMQ_PORT=5672 >> .env
echo RABBITMQ_VHOST=/ >> .env
echo. >> .env
echo # Configuración de WebSockets >> .env
echo FRONTEND_URL=http://localhost:8080 >> .env
echo SOCKET_CORS_ORIGIN=http://localhost:8080 >> .env
echo. >> .env
echo # Configuración de notificaciones >> .env
echo NOTIFICATION_TTL=86400000 >> .env
echo NOTIFICATION_MAX_RETRIES=3 >> .env

echo Archivo .env creado exitosamente!
echo.
echo IMPORTANTE: Revisa y actualiza las siguientes variables según tu configuración:
echo - EMAIL_USER: Tu email de Gmail
echo - EMAIL_PASS: Tu contraseña de aplicación de Gmail
echo - EMAIL_FROM: Email remitente
echo.
pause