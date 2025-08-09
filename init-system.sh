#!/bin/bash

echo "========================================"
echo "TUPAD Organizador Academico - Inicializacion"
echo "========================================"
echo

# Verificar si Node.js está instalado
echo "[1/8] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js encontrado: $(node --version)"

# Verificar si npm está instalado
echo
echo "[2/8] Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado."
    exit 1
fi
echo "✓ npm encontrado: $(npm --version)"

# Verificar si RabbitMQ está instalado
echo
echo "[3/8] Verificando RabbitMQ..."
if ! command -v rabbitmqctl &> /dev/null; then
    echo "ADVERTENCIA: RabbitMQ no está instalado o no está corriendo."
    echo "Para instalar RabbitMQ:"
    echo "  macOS: brew install rabbitmq && brew services start rabbitmq"
    echo "  Ubuntu/Debian: sudo apt-get install rabbitmq-server && sudo systemctl start rabbitmq-server"
    echo
    read -p "¿Deseas continuar sin RabbitMQ? (s/n): " continue
    if [[ ! $continue =~ ^[Ss]$ ]]; then
        exit 1
    fi
else
    if rabbitmqctl status &> /dev/null; then
        echo "✓ RabbitMQ está funcionando"
    else
        echo "ADVERTENCIA: RabbitMQ está instalado pero no está corriendo."
        echo "Para iniciarlo:"
        echo "  macOS: brew services start rabbitmq"
        echo "  Ubuntu/Debian: sudo systemctl start rabbitmq-server"
        echo
        read -p "¿Deseas continuar sin RabbitMQ? (s/n): " continue
        if [[ ! $continue =~ ^[Ss]$ ]]; then
            exit 1
        fi
    fi
fi

# Instalar dependencias del backend
echo
echo "[4/8] Instalando dependencias del backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Fallo al instalar dependencias del backend"
        exit 1
    fi
else
    echo "✓ Dependencias del backend ya instaladas"
fi

# Configurar archivo .env si no existe
echo
echo "[5/8] Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    echo "Creando archivo .env..."
    cp env.example .env
    echo "✓ Archivo .env creado desde env.example"
    echo "IMPORTANTE: Revisa y edita el archivo .env según tus necesidades"
else
    echo "✓ Archivo .env ya existe"
fi

# Instalar dependencias del frontend
echo
echo "[6/8] Instalando dependencias del frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Fallo al instalar dependencias del frontend"
        exit 1
    fi
else
    echo "✓ Dependencias del frontend ya instaladas"
fi

# Verificar que la base de datos existe
echo
echo "[7/8] Verificando base de datos..."
cd ../backend
if [ ! -f "database/tupad.db" ]; then
    echo "La base de datos se creará automáticamente al iniciar el backend"
else
    echo "✓ Base de datos encontrada"
fi

# Iniciar servicios
echo
echo "[8/8] Iniciando servicios..."
echo
echo "========================================"
echo "INICIALIZACION COMPLETADA"
echo "========================================"
echo
echo "Para iniciar el sistema:"
echo
echo "1. Iniciar el backend:"
echo "   cd backend"
echo "   npm run dev"
echo
echo "2. En otra terminal, iniciar el frontend:"
echo "   cd frontend"
echo "   npm start"
echo
echo "3. Abrir el navegador en: http://localhost:3000"
echo
echo "4. Para probar la API, importa el archivo postman_collection.json en Postman"
echo
echo "========================================"
echo

read -p "¿Deseas iniciar el backend ahora? (s/n): " start
if [[ $start =~ ^[Ss]$ ]]; then
    echo "Iniciando backend..."
    npm run dev
else
    echo "Para iniciar manualmente, ejecuta: cd backend && npm run dev"
fi