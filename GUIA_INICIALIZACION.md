# Guía de Inicialización y Pruebas - TUPAD Organizador Académico

## 📋 Requisitos Previos

### Software Necesario
- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **RabbitMQ** (para notificaciones en tiempo real)
- **Postman** (para pruebas de API)

### Verificar Instalaciones
```bash
# Verificar Node.js
node --version
npm --version

# Verificar RabbitMQ (si está instalado)
rabbitmqctl status
```

## 🚀 Inicialización del Sistema

### 1. Configuración de RabbitMQ

#### Instalación en Windows:
```bash
# Descargar e instalar desde: https://www.rabbitmq.com/download.html
# O usar Chocolatey:
choco install rabbitmq

# Iniciar servicio
net start RabbitMQ
```

#### Instalación en macOS:
```bash
# Usar Homebrew
brew install rabbitmq
brew services start rabbitmq
```

#### Instalación en Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install rabbitmq-server
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server
```

### 2. Configuración del Backend

#### Paso 1: Instalar Dependencias
```bash
cd backend
npm install
```

#### Paso 2: Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Contenido mínimo del archivo `.env`:**
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
DB_PATH=./database/tupad.db

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Configuración de RabbitMQ (AMQP)
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_VHOST=/

# Configuración de WebSockets
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Configuración de notificaciones
NOTIFICATION_TTL=86400000
NOTIFICATION_MAX_RETRIES=3
```

#### Paso 3: Inicializar Base de Datos
```bash
# La base de datos se inicializa automáticamente al arrancar el servidor
# Pero puedes verificar que existe:
ls -la database/tupad.db
```

#### Paso 4: Iniciar el Backend
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

**Verificar que el backend está funcionando:**
- Abrir navegador en: `http://localhost:3000/api/health`
- Deberías ver: `{"status":"OK","timestamp":"...","environment":"development"}`

### 3. Configuración del Frontend

#### Paso 1: Instalar Dependencias
```bash
cd frontend
npm install
```

#### Paso 2: Iniciar el Frontend
```bash
# Modo desarrollo
npm start

# O usar http-server directamente
npx http-server -p 3000 -o
```

**Verificar que el frontend está funcionando:**
- Abrir navegador en: `http://localhost:3000`
- Deberías ver la aplicación TUPAD Organizador Académico

## 🧪 Pruebas del Sistema

### 1. Importar Collection de Postman

#### Paso 1: Importar Collection
1. Abrir Postman
2. Click en "Import"
3. Seleccionar archivo: `postman_collection.json`
4. La collection se importará con todas las rutas configuradas

#### Paso 2: Configurar Variables de Entorno
1. En Postman, ir a "Environments"
2. Crear nuevo environment llamado "TUPAD Local"
3. Agregar variables:
   - `base_url`: `http://localhost:3000`
   - `auth_token`: (se llenará automáticamente al hacer login)

### 2. Flujo de Pruebas Recomendado

#### Paso 1: Verificar Salud del Sistema
```bash
# En Postman, ejecutar:
GET {{base_url}}/api/health
```

#### Paso 2: Registrar Usuario
```bash
# En Postman, ejecutar:
POST {{base_url}}/api/auth/register
Body:
{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@email.com",
    "password": "password123",
    "rol": "estudiante"
}
```

#### Paso 3: Iniciar Sesión
```bash
# En Postman, ejecutar:
POST {{base_url}}/api/auth/login
Body:
{
    "email": "juan.perez@email.com",
    "password": "password123"
}
```

**Nota:** El token se guardará automáticamente en la variable `auth_token`

#### Paso 4: Crear Datos de Prueba

**Crear Materia:**
```bash
POST {{base_url}}/api/materias
Body:
{
    "nombre": "Matemáticas I",
    "codigo": "MAT101",
    "descripcion": "Fundamentos de matemáticas",
    "creditos": 4,
    "semestre": 1,
    "anio": 2024
}
```

**Crear Profesor:**
```bash
POST {{base_url}}/api/profesores
Body:
{
    "nombre": "María",
    "apellido": "González",
    "email": "maria.gonzalez@email.com",
    "tipo": "Titular",
    "telefono": "+1234567890"
}
```

**Crear Horario:**
```bash
POST {{base_url}}/api/horarios
Body:
{
    "materia_id": 1,
    "profesor_id": 1,
    "comision_id": 1,
    "dia_semana": 1,
    "hora_inicio": "08:00",
    "hora_fin": "10:00",
    "tipo_clase": "Teórica",
    "link_reunion": "https://meet.google.com/abc-defg-hij",
    "tipo_reunion": "Virtual"
}
```

### 3. Pruebas de Notificaciones en Tiempo Real

#### Paso 1: Verificar Conexión WebSocket
1. Abrir el frontend en el navegador
2. Ir a la sección "Notificaciones"
3. Verificar que el estado de conexión muestre "Conectado"

#### Paso 2: Probar Notificaciones Automáticas
1. Crear una nueva materia (debería generar notificación automática)
2. Actualizar un profesor (debería generar notificación automática)
3. Crear una evaluación (debería generar notificación automática)

#### Paso 3: Probar Notificación Manual
```bash
# En Postman, ejecutar:
POST {{base_url}}/api/notificaciones
Body:
{
    "type": "info",
    "title": "Notificación de Prueba",
    "message": "Esta es una notificación de prueba para verificar el sistema",
    "data": {
        "test": true,
        "timestamp": "2024-01-01T00:00:00Z"
    }
}
```

### 4. Pruebas del Frontend

#### Funcionalidades a Probar:

1. **Autenticación:**
   - Registro de usuario
   - Inicio de sesión
   - Cerrar sesión

2. **Dashboard:**
   - Ver estadísticas generales
   - Ver próximas evaluaciones
   - Ver horarios del día

3. **Materias:**
   - Listar materias
   - Crear nueva materia
   - Editar materia existente
   - Eliminar materia

4. **Profesores:**
   - Listar profesores
   - Crear nuevo profesor
   - Editar profesor existente
   - Eliminar profesor

5. **Horarios:**
   - Ver horarios por día
   - Crear nuevo horario
   - Editar horario existente
   - Eliminar horario

6. **Evaluaciones:**
   - Listar evaluaciones
   - Crear nueva evaluación
   - Editar evaluación existente
   - Agregar notas

7. **Contenidos:**
   - Listar contenidos
   - Crear nuevo contenido
   - Editar contenido existente
   - Eliminar contenido

8. **Notificaciones:**
   - Ver notificaciones en tiempo real
   - Filtrar por módulo
   - Marcar como leída
   - Eliminar notificación

9. **Perfil de Usuario:**
   - Ver información del perfil
   - Cambiar contraseña
   - Configurar notificaciones
   - Cambiar tema (claro/oscuro)

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a RabbitMQ
```bash
# Verificar que RabbitMQ esté corriendo
rabbitmqctl status

# Si no está corriendo, iniciarlo:
# Windows:
net start RabbitMQ

# macOS:
brew services start rabbitmq

# Linux:
sudo systemctl start rabbitmq-server
```

#### 2. Error de Puerto en Uso
```bash
# Verificar qué está usando el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso si es necesario
taskkill /PID <PID> /F
```

#### 3. Error de Base de Datos
```bash
# Eliminar base de datos corrupta y reiniciar
rm backend/database/tupad.db
# Reiniciar el backend
```

#### 4. Error de CORS en Frontend
```bash
# Verificar que las URLs en .env coincidan
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

#### 5. Notificaciones No Funcionan
```bash
# Verificar logs del backend
# Verificar conexión WebSocket en frontend
# Verificar que RabbitMQ esté funcionando
```

### Logs Útiles

#### Backend Logs:
```bash
# Ver logs en tiempo real
tail -f backend/logs/app.log

# Ver errores específicos
grep "ERROR" backend/logs/app.log
```

#### Frontend Logs:
```bash
# Abrir DevTools en el navegador
# Ir a la pestaña Console
# Verificar errores de JavaScript
```

## 📊 Verificación de Funcionalidades

### Checklist de Pruebas

- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] RabbitMQ está funcionando
- [ ] Base de datos se inicializa correctamente
- [ ] API responde en `/api/health`
- [ ] Registro de usuario funciona
- [ ] Login funciona y genera token
- [ ] CRUD de materias funciona
- [ ] CRUD de profesores funciona
- [ ] CRUD de horarios funciona
- [ ] CRUD de evaluaciones funciona
- [ ] CRUD de contenidos funciona
- [ ] Notificaciones en tiempo real funcionan
- [ ] WebSockets se conectan correctamente
- [ ] Filtros de notificaciones funcionan
- [ ] Temas (claro/oscuro) funcionan
- [ ] Perfil de usuario funciona

### Métricas de Rendimiento

- **Tiempo de respuesta API**: < 500ms
- **Tiempo de carga frontend**: < 3s
- **Latencia de notificaciones**: < 100ms
- **Uso de memoria**: < 100MB (backend), < 50MB (frontend)

## 🎯 Próximos Pasos

Una vez que el sistema esté funcionando correctamente:

1. **Configurar producción:**
   - Cambiar `NODE_ENV=production`
   - Configurar base de datos de producción
   - Configurar RabbitMQ de producción

2. **Implementar monitoreo:**
   - Logs estructurados
   - Métricas de rendimiento
   - Alertas automáticas

3. **Optimizaciones:**
   - Caché de consultas frecuentes
   - Compresión de respuestas
   - Optimización de imágenes

4. **Seguridad:**
   - Rate limiting
   - Validación de entrada
   - Auditoría de logs

## 📞 Soporte

Si encuentras problemas:

1. Revisar los logs del sistema
2. Verificar la configuración
3. Consultar la documentación
4. Crear un issue en el repositorio

¡El sistema TUPAD Organizador Académico está listo para usar! 🚀