# Sistema de Notificaciones en Tiempo Real

## Descripción

Este sistema implementa notificaciones en tiempo real usando AMQP (RabbitMQ) y WebSockets (Socket.IO) para proporcionar una experiencia de usuario fluida y reactiva.

## Arquitectura

### Componentes Principales

1. **AMQPService** (`backend/services/amqpService.js`)
   - Maneja la comunicación con RabbitMQ
   - Gestiona exchanges y colas
   - Procesa mensajes de notificaciones

2. **SocketService** (`backend/services/socketService.js`)
   - Maneja conexiones WebSocket
   - Autentica usuarios mediante JWT
   - Distribuye notificaciones a clientes conectados

3. **NotificationService** (`frontend/src/services/notification.service.js`)
   - Cliente WebSocket para el frontend
   - Gestiona estado de conexión
   - Maneja notificaciones locales

## Configuración

### Variables de Entorno

```bash
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_VHOST=/

# WebSockets
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Notificaciones
NOTIFICATION_TTL=86400000
NOTIFICATION_MAX_RETRIES=3
```

### Instalación de Dependencias

#### Backend
```bash
cd backend
npm install amqplib socket.io uuid
```

#### Frontend
```bash
cd frontend
npm install socket.io-client
```

## Uso

### Envío de Notificaciones

#### Notificación a un usuario específico
```javascript
// Backend
await amqpService.sendUserNotification(userId, {
    type: 'info',
    title: 'Nueva evaluación',
    message: 'Tienes una nueva evaluación programada',
    data: { evaluationId: 123 }
});
```

#### Notificación masiva
```javascript
// Backend
await amqpService.sendBulkNotification([1, 2, 3], {
    type: 'warning',
    title: 'Mantenimiento programado',
    message: 'El sistema estará en mantenimiento mañana'
});
```

#### Evento del sistema
```javascript
// Backend
await amqpService.sendSystemEvent({
    type: 'info',
    title: 'Actualización del sistema',
    message: 'Nueva versión disponible',
    severity: 'medium'
});
```

### API REST

#### Obtener notificaciones
```http
GET /api/notificaciones
Authorization: Bearer <token>
```

#### Enviar notificación
```http
POST /api/notificaciones
Authorization: Bearer <token>
Content-Type: application/json

{
    "userId": 1,
    "title": "Nueva notificación",
    "message": "Contenido de la notificación",
    "type": "info",
    "data": {}
}
```

#### Enviar notificación masiva
```http
POST /api/notificaciones/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
    "userIds": [1, 2, 3],
    "title": "Notificación masiva",
    "message": "Contenido de la notificación",
    "type": "warning"
}
```

#### Enviar evento del sistema
```http
POST /api/notificaciones/system
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Evento del sistema",
    "message": "Descripción del evento",
    "type": "info",
    "severity": "medium"
}
```

#### Marcar como leída
```http
PUT /api/notificaciones/:id/read
Authorization: Bearer <token>
```

#### Eliminar notificación
```http
DELETE /api/notificaciones/:id
Authorization: Bearer <token>
```

#### Obtener estadísticas
```http
GET /api/notificaciones/stats
Authorization: Bearer <token>
```

#### Enviar notificación de prueba
```http
POST /api/notificaciones/test
Authorization: Bearer <token>
```

## Frontend

### Servicio de Notificaciones

El `NotificationService` en el frontend maneja:

- Conexión automática al WebSocket
- Reconexión automática en caso de desconexión
- Almacenamiento local de notificaciones
- Sincronización con el servidor

### Uso en Controladores

```javascript
// Inyectar el servicio
app.controller('MiController', ['NotificationService', function(NotificationService) {

    // Enviar notificación de prueba
    NotificationService.sendTestNotification()
        .then(function(response) {
            console.log('Notificación enviada');
        });

    // Obtener estadísticas
    NotificationService.getStats()
        .then(function(response) {
            console.log('Estadísticas:', response.data);
        });
}]);
```

### Eventos del Servicio

```javascript
// Escuchar eventos
$scope.$on('notifications:connected', function() {
    console.log('Conectado al servidor de notificaciones');
});

$scope.$on('notifications:disconnected', function(event, data) {
    console.log('Desconectado:', data.reason);
});

$scope.$on('notifications:new', function(event, notification) {
    console.log('Nueva notificación:', notification);
});

$scope.$on('notifications:updated', function() {
    console.log('Notificaciones actualizadas');
});
```

## Estructura de Datos

### Notificación
```javascript
{
    id: "uuid",
    userId: 1,
    type: "info|success|warning|error",
    title: "Título de la notificación",
    message: "Mensaje de la notificación",
    data: {}, // Datos adicionales
    timestamp: "2024-01-01T00:00:00.000Z",
    read: false,
    isSystemEvent: false, // Solo para eventos del sistema
    severity: "low|medium|high|critical" // Solo para eventos del sistema
}
```

### Evento del Sistema
```javascript
{
    id: "uuid",
    type: "info|success|warning|error",
    title: "Título del evento",
    message: "Descripción del evento",
    data: {}, // Datos adicionales
    timestamp: "2024-01-01T00:00:00.000Z",
    severity: "low|medium|high|critical"
}
```

## Configuración de RabbitMQ

### Instalación

#### Docker
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

#### Ubuntu/Debian
```bash
sudo apt-get install rabbitmq-server
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server
```

### Configuración de Usuario
```bash
# Crear usuario
sudo rabbitmqctl add_user tupad password

# Dar permisos
sudo rabbitmqctl set_user_tags tupad administrator
sudo rabbitmqctl set_permissions -p / tupad ".*" ".*" ".*"
```

### Exchanges y Colas

El sistema crea automáticamente:

- **Exchanges:**
  - `user_events` (topic) - Para notificaciones de usuario
  - `system_events` (fanout) - Para eventos del sistema

- **Colas:**
  - `notifications` - Notificaciones de usuario
  - `events` - Eventos del sistema
  - `emails` - Cola de emails

## Monitoreo

### Estadísticas de Conexión
```javascript
// Obtener estadísticas
const stats = socketService.getConnectionStats();
console.log('Conexiones activas:', stats.totalConnections);
console.log('Usuarios conectados:', stats.connectedUsers);
```

### Estadísticas de AMQP
```javascript
// Obtener estadísticas de colas
const queueStats = await amqpService.getQueueStats();
console.log('Mensajes en cola:', queueStats.NOTIFICATIONS.messageCount);
```

## Troubleshooting

### Problemas Comunes

1. **Conexión AMQP fallida**
   - Verificar que RabbitMQ esté ejecutándose
   - Verificar credenciales en variables de entorno
   - Verificar puerto 5672

2. **WebSocket no conecta**
   - Verificar CORS en configuración
   - Verificar token JWT válido
   - Verificar puerto del servidor

3. **Notificaciones no llegan**
   - Verificar que el usuario esté autenticado
   - Verificar que el WebSocket esté conectado
   - Verificar logs del servidor

### Logs

El sistema genera logs detallados:

```
✅ Conexión AMQP establecida correctamente
✅ Exchanges configurados correctamente
✅ Colas configuradas correctamente
✅ Servicio de WebSockets inicializado
✅ Consumidores AMQP inicializados para WebSockets
🔌 Usuario 1 conectado (Socket: abc123)
📨 Notificación enviada al usuario 1: Nueva evaluación
```

## Seguridad

- Autenticación JWT para WebSockets
- Validación de entrada en todas las rutas
- Rate limiting en endpoints
- Sanitización de datos
- Logs de auditoría

## Escalabilidad

- RabbitMQ permite escalabilidad horizontal
- WebSockets con reconexión automática
- Colas persistentes para mensajes importantes
- TTL configurable para mensajes
- Reconexión automática con backoff exponencial