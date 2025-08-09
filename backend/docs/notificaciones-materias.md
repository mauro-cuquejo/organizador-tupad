# Integración de Notificaciones con Módulo de Materias

## Descripción

Este documento describe la integración del sistema de notificaciones en tiempo real con el módulo de materias del sistema TUPAD Organizador Académico.

## Arquitectura

### Componentes Principales

1. **MateriaNotificationService** (`backend/services/materiaNotificationService.js`)
   - Servicio específico para notificaciones relacionadas con materias
   - Maneja diferentes tipos de eventos de materias
   - Integra con AMQPService para envío de notificaciones

2. **Rutas de Materias** (`backend/routes/materias.js`)
   - Rutas modificadas para incluir notificaciones automáticas
   - Eventos: creación, actualización, eliminación de materias

3. **Rutas de Horarios** (`backend/routes/horarios.js`)
   - Rutas modificadas para notificaciones de horarios
   - Eventos: asignación de horarios, cambios de profesores

4. **Frontend** (`frontend/src/controllers/notificaciones.controller.js`)
   - Controlador actualizado con filtros por módulo
   - Iconos y clases CSS específicas para cada tipo de notificación

## Tipos de Notificaciones

### Materias
- `materia_creada`: Nueva materia creada
- `materia_actualizada`: Datos de materia modificados
- `materia_eliminada`: Materia eliminada del sistema

### Horarios
- `horario_asignado`: Nuevo horario asignado a una materia
- `horario_cambiado`: Horario modificado
- `profesor_asignado`: Profesor asignado a un horario
- `profesor_cambiado`: Cambio de profesor en un horario

## Flujo de Notificaciones

### 1. Creación de Materia
```
Usuario crea materia → API valida datos → Base de datos inserta →
MateriaNotificationService.notifyMateriaCreada() → AMQPService.sendUserNotification() →
RabbitMQ → Socket.IO → Cliente recibe notificación
```

### 2. Actualización de Materia
```
Usuario actualiza materia → API valida cambios → Base de datos actualiza →
MateriaNotificationService.notifyMateriaActualizada() → Detección de cambios específicos →
AMQPService.sendUserNotification() → RabbitMQ → Socket.IO → Cliente recibe notificación
```

### 3. Asignación de Horario
```
Usuario asigna horario → API valida conflictos → Base de datos inserta →
MateriaNotificationService.notifyHorarioAsignado() →
MateriaNotificationService.notifyProfesorAsignado() →
AMQPService.sendUserNotification() → RabbitMQ → Socket.IO → Cliente recibe notificaciones
```

## Estructura de Datos

### Notificación de Materia Creada
```javascript
{
    type: 'materia_creada',
    title: 'Nueva materia creada',
    message: 'Se ha creado la materia "Matemáticas" (MAT101)',
    data: {
        materiaId: 1,
        materiaNombre: 'Matemáticas',
        materiaCodigo: 'MAT101',
        creditos: 4,
        action: 'view_materia'
    }
}
```

### Notificación de Materia Actualizada
```javascript
{
    type: 'materia_actualizada',
    title: 'Materia actualizada',
    message: 'Se han actualizado los datos de la materia "Matemáticas"',
    data: {
        materiaId: 1,
        materiaNombre: 'Matemáticas',
        materiaCodigo: 'MAT101',
        cambios: {
            nombre: { anterior: 'Matemática', nuevo: 'Matemáticas' },
            creditos: { anterior: 3, nuevo: 4 }
        },
        action: 'view_materia'
    }
}
```

### Notificación de Horario Asignado
```javascript
{
    type: 'horario_asignado',
    title: 'Nuevo horario asignado',
    message: 'Se ha asignado un horario para "Matemáticas": Lunes 08:00 - 10:00',
    data: {
        materiaId: 1,
        materiaNombre: 'Matemáticas',
        horarioId: 5,
        diaSemana: 1,
        diaNombre: 'Lunes',
        horaInicio: '08:00',
        horaFin: '10:00',
        tipoClase: 'teorica',
        action: 'view_horarios'
    }
}
```

## Configuración

### Variables de Entorno
```bash
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# WebSockets
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Notificaciones
NOTIFICATION_TTL=86400000
NOTIFICATION_MAX_RETRIES=3
```

## Uso en el Frontend

### Filtros por Módulo
```javascript
// Filtrar notificaciones de materias
notifCtrl.filters.module = 'materias';

// Filtrar notificaciones específicas
notifCtrl.filters.type = 'materia_creada';
```

### Iconos y Clases CSS
```javascript
// Obtener icono para tipo de notificación
const icon = notifCtrl.getNotificationIcon('materia_creada'); // 'bi-plus-circle'

// Obtener clase CSS
const cssClass = notifCtrl.getNotificationClass('materia_creada'); // 'text-success'
```

## Manejo de Errores

### Estrategia de Fallback
- Las notificaciones no fallan las operaciones principales
- Errores de notificación se registran pero no afectan la respuesta
- Reintentos automáticos en caso de fallo de conexión

### Logging
```javascript
// Error al enviar notificación
console.error('Error al enviar notificación:', notificationError);

// Notificación enviada exitosamente
console.log(`📨 Notificación enviada al usuario ${userId}:`, message.title);
```

## Próximos Pasos

### Integración con Otros Módulos
1. **Evaluaciones**: Notificaciones de nuevas evaluaciones, recordatorios, calificaciones
2. **Contenidos**: Notificaciones de nuevos contenidos, actualizaciones
3. **Profesores**: Notificaciones de cambios en información de profesores

### Mejoras Futuras
1. **Notificaciones por Email**: Integración con servicio de email
2. **Notificaciones Push**: Notificaciones del navegador
3. **Configuración de Usuario**: Permitir a usuarios configurar qué notificaciones recibir
4. **Notificaciones Masivas**: Envío a múltiples usuarios basado en roles

## Testing

### Pruebas de Integración
```bash
# Crear materia y verificar notificación
curl -X POST http://localhost:3000/api/materias \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","codigo":"TEST","descripcion":"Test","creditos":3}'

# Verificar notificaciones
curl -X GET http://localhost:3000/api/notificaciones \
  -H "Authorization: Bearer <token>"
```

### Pruebas de WebSocket
```javascript
// Conectar al WebSocket
const socket = io('http://localhost:3000', {
    auth: { token: 'user-jwt-token' }
});

// Escuchar notificaciones
socket.on('notification', (notification) => {
    console.log('Nueva notificación:', notification);
});
```

## Troubleshooting

### Problemas Comunes

1. **Notificaciones no llegan**
   - Verificar conexión RabbitMQ
   - Verificar WebSocket connection
   - Revisar logs del servidor

2. **Errores de AMQP**
   - Verificar configuración RabbitMQ
   - Verificar permisos de usuario
   - Revisar logs de RabbitMQ

3. **Problemas de WebSocket**
   - Verificar CORS configuration
   - Verificar autenticación JWT
   - Revisar logs del cliente

### Comandos de Diagnóstico
```bash
# Verificar estado de RabbitMQ
rabbitmqctl status

# Verificar colas
rabbitmqctl list_queues

# Verificar conexiones
rabbitmqctl list_connections
```