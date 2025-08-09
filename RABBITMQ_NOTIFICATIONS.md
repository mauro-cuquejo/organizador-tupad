# Sistema de Notificaciones con RabbitMQ

## Descripción

El sistema TUPAD utiliza **RabbitMQ** para manejar las notificaciones en lugar de WebSockets. Esto proporciona una arquitectura más robusta y escalable para el manejo de mensajes asíncronos.

## Arquitectura

### Frontend (HTTP Polling)
- **Método**: Polling HTTP cada 10 segundos
- **Endpoint**: `/api/notificaciones/check`
- **Ventajas**:
  - No requiere conexiones persistentes
  - Compatible con firewalls y proxies
  - Más simple de implementar y debuggear

### Backend (RabbitMQ)
- **Broker**: RabbitMQ con AMQP
- **Colas**:
  - `notifications` - Notificaciones de usuario
  - `events` - Eventos del sistema
  - `emails` - Envío de emails
- **Exchanges**:
  - `user_events` (topic) - Para notificaciones específicas de usuario
  - `system_events` (fanout) - Para eventos del sistema

## Flujo de Notificaciones

### 1. Envío de Notificación
```javascript
// Backend - Enviar notificación a usuario específico
await amqpService.sendUserNotification(userId, {
    type: 'info',
    title: 'Nueva evaluación',
    message: 'Tienes una nueva evaluación programada',
    data: { evaluationId: 123 }
});
```

### 2. Consumo de Notificaciones
```javascript
// Backend - Consumir notificaciones
await amqpService.consumeNotifications((notification) => {
    // Procesar notificación
    // Guardar en base de datos
    // Enviar email si es necesario
});
```

### 3. Polling del Frontend
```javascript
// Frontend - Verificar nuevas notificaciones
$http.get('/api/notificaciones/check', {
    params: { lastCheck: lastCheckTime }
}).then(response => {
    // Procesar nuevas notificaciones
    response.data.notifications.forEach(notification => {
        // Mostrar notificación
        // Actualizar contador
    });
});
```

## Endpoints de la API

### Verificar Notificaciones
```
GET /api/notificaciones/check
Headers: Authorization: Bearer <token>
Params: lastCheck (opcional)
```

### Obtener Todas las Notificaciones
```
GET /api/notificaciones
Headers: Authorization: Bearer <token>
```

### Marcar como Leída
```
PUT /api/notificaciones/:id/read
Headers: Authorization: Bearer <token>
```

### Marcar Todas como Leídas
```
PUT /api/notificaciones/read-all
Headers: Authorization: Bearer <token>
```

### Eliminar Notificación
```
DELETE /api/notificaciones/:id
Headers: Authorization: Bearer <token>
```

### Enviar Notificación (Admin)
```
POST /api/notificaciones/send
Headers: Authorization: Bearer <token>
Body: {
    userIds: [1, 2, 3],
    title: "Título",
    message: "Mensaje",
    type: "info"
}
```

### Enviar Evento del Sistema (Admin)
```
POST /api/notificaciones/system-event
Headers: Authorization: Bearer <token>
Body: {
    title: "Evento del sistema",
    message: "Descripción del evento",
    type: "warning",
    severity: "medium"
}
```

## Configuración

### Variables de Entorno
```bash
# Backend
RABBITMQ_URL=amqp://localhost:5672
NODE_ENV=development

# Frontend
# No requiere configuración especial
```

### Dependencias
```json
// Backend
{
    "amqplib": "^0.10.3",
    "uuid": "^9.0.1"
}

// Frontend
{
    // No requiere dependencias adicionales
    // Usa $http de AngularJS para polling
}
```

## Ventajas del Sistema

### 1. Escalabilidad
- RabbitMQ puede manejar miles de mensajes por segundo
- Colas persistentes para mensajes importantes
- Balanceo de carga automático

### 2. Confiabilidad
- Mensajes persistentes en disco
- Confirmación de entrega (ACK)
- Reintentos automáticos

### 3. Flexibilidad
- Diferentes tipos de exchanges (topic, fanout)
- Routing complejo de mensajes
- Filtrado por patrones

### 4. Monitoreo
- Interfaz web de RabbitMQ
- Métricas detalladas
- Logs de actividad

## Comparación con WebSockets

| Aspecto | WebSockets | RabbitMQ + Polling |
|---------|------------|-------------------|
| Conexión | Persistente | HTTP requests |
| Escalabilidad | Limitada | Alta |
| Confiabilidad | Media | Alta |
| Complejidad | Alta | Media |
| Firewall | Problemas | Sin problemas |
| Debugging | Complejo | Simple |

## Implementación Futura

### Base de Datos
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    type TEXT,
    title TEXT,
    message TEXT,
    data TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Consumidor de Notificaciones
```javascript
// Guardar notificaciones en base de datos
await amqpService.consumeNotifications(async (notification) => {
    await db.run(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, ?, ?, ?, ?)
    `, [notification.userId, notification.type, notification.title,
        notification.message, JSON.stringify(notification.data)]);
});
```

### Endpoint de Verificación
```javascript
// Obtener notificaciones no leídas desde la última verificación
const notifications = await db.all(`
    SELECT * FROM notifications
    WHERE user_id = ? AND created_at > ?
    ORDER BY created_at DESC
`, [userId, lastCheck]);
```

## Troubleshooting

### Problema: No se reciben notificaciones
**Solución**: Verificar que RabbitMQ esté corriendo y accesible

### Problema: Polling no funciona
**Solución**: Verificar que el endpoint `/api/notificaciones/check` responda correctamente

### Problema: Notificaciones duplicadas
**Solución**: Implementar deduplicación basada en `lastCheck` timestamp

### Problema: Performance del polling
**Solución**: Ajustar el intervalo de polling según las necesidades (10s por defecto)
