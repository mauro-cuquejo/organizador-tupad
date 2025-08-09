# Integración de Notificaciones con Módulo de Contenidos

## Descripción

Este documento describe la integración del sistema de notificaciones en tiempo real con el módulo de contenidos del sistema TUPAD Organizador Académico.

## Arquitectura

### Componentes Principales

1. **ContenidoNotificationService** (`backend/services/contenidoNotificationService.js`)
   - Servicio específico para notificaciones relacionadas con contenidos
   - Maneja diferentes tipos de eventos de contenidos
   - Integra con AMQPService para envío de notificaciones

2. **Rutas de Contenidos** (`backend/routes/contenidos.js`)
   - Rutas modificadas para incluir notificaciones automáticas
   - Eventos: creación, actualización, eliminación de contenidos

3. **Frontend** (`frontend/src/controllers/notificaciones.controller.js`)
   - Controlador actualizado con filtros por módulo
   - Iconos y clases CSS específicas para cada tipo de notificación

## Tipos de Notificaciones

### 1. Contenido Creado
- **Tipo**: `contenido_creado`
- **Trigger**: Creación de nuevo contenido académico
- **Datos incluidos**:
  - ID del contenido
  - Título del contenido
  - Tipo de contenido
  - Descripción
  - Información de la materia asociada

### 2. Contenido Actualizado
- **Tipo**: `contenido_actualizado`
- **Trigger**: Modificación de contenido existente
- **Datos incluidos**:
  - ID del contenido
  - Título del contenido
  - Tipo de contenido
  - Descripción
  - Cambios detectados (campos modificados)
  - Información de la materia asociada

### 3. Contenido Eliminado
- **Tipo**: `contenido_eliminado`
- **Trigger**: Eliminación (marcado como inactivo) de contenido
- **Datos incluidos**:
  - ID del contenido
  - Título del contenido
  - Tipo de contenido
  - Información de la materia asociada

### 4. Archivo Subido
- **Tipo**: `archivo_subido`
- **Trigger**: Subida de archivo a un contenido
- **Datos incluidos**:
  - ID del contenido
  - Título del contenido
  - Información del archivo (nombre, tipo, tamaño)
  - Información de la materia asociada

### 5. Archivo Eliminado
- **Tipo**: `archivo_eliminado`
- **Trigger**: Eliminación de archivo de un contenido
- **Datos incluidos**:
  - ID del contenido
  - Título del contenido
  - Información del archivo eliminado
  - Información de la materia asociada

### 6. Contenido Publicado
- **Tipo**: `contenido_publicado`
- **Trigger**: Publicación de contenido para estudiantes
- **Datos incluidos**:
  - ID del contenido
  - Título del contenido
  - Tipo de contenido
  - Información de la materia asociada

### 7. Contenido Archivado
- **Tipo**: `contenido_archivado`
- **Trigger**: Archivado de contenido
- **Datos incluidos**:
  - ID del contenido
  - Título del contenido
  - Tipo de contenido
  - Información de la materia asociada

## Estructura de Datos

### Notificación de Contenido
```javascript
{
    id: "uuid",
    userId: "user_id",
    type: "contenido_creado",
    title: "Nuevo contenido creado",
    message: "Se ha creado el contenido \"Título del contenido\" para Matemáticas",
    data: {
        contenidoId: 1,
        contenidoTitulo: "Título del contenido",
        contenidoTipo: "documento",
        contenidoDescripcion: "Descripción del contenido",
        materiaId: 1,
        materiaNombre: "Matemáticas",
        materiaCodigo: "MAT101",
        action: "view_contenido"
    },
    timestamp: "2024-01-15T10:30:00Z",
    read: false
}
```

### Detección de Cambios
```javascript
{
    titulo: { anterior: "Título anterior", nuevo: "Título nuevo" },
    descripcion: { anterior: "Descripción anterior", nuevo: "Descripción nueva" },
    semana: { anterior: 1, nuevo: 2 },
    tipo_contenido: { anterior: "documento", nuevo: "video" }
}
```

## Flujo de Notificaciones

### 1. Creación de Contenido
```
Usuario crea contenido →
Validación de datos →
Inserción en BD →
Notificación en tiempo real →
Notificaciones por email →
Respuesta al cliente
```

### 2. Actualización de Contenido
```
Usuario actualiza contenido →
Validación de datos →
Obtención de datos actuales →
Actualización en BD →
Detección de cambios →
Notificación en tiempo real (si hay cambios) →
Respuesta al cliente
```

### 3. Eliminación de Contenido
```
Usuario elimina contenido →
Obtención de datos del contenido →
Marcado como inactivo →
Notificación en tiempo real →
Respuesta al cliente
```

## Configuración

### Variables de Entorno
```bash
# Configuración de RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# Configuración de WebSockets
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Configuración de notificaciones
NOTIFICATION_TTL=86400000
NOTIFICATION_MAX_RETRIES=3
```

### Dependencias
```json
{
    "amqplib": "^0.10.3",
    "socket.io": "^4.7.4",
    "uuid": "^9.0.1"
}
```

## Uso en Frontend

### Filtrado por Módulo
```javascript
// Filtrar notificaciones de contenidos
notifCtrl.filters.module = 'contenidos';

// Obtener tipos específicos de contenidos
const tiposContenidos = notifCtrl.getModuleTypes('contenidos');
```

### Iconos y Clases CSS
```javascript
// Obtener icono para tipo de notificación
const icono = notifCtrl.getNotificationIcon('contenido_creado');
// Resultado: 'bi-folder-plus'

// Obtener clase CSS para tipo de notificación
const clase = notifCtrl.getNotificationClass('contenido_creado');
// Resultado: 'text-success'
```

## Manejo de Errores

### Errores de Notificación
- Los errores de notificación no afectan las operaciones principales
- Se registran en consola para debugging
- Se implementa retry automático en AMQP

### Errores de Conexión
- Reconexión automática en WebSockets
- Fallback a notificaciones por email
- Estado de conexión visible en UI

## Testing

### Pruebas de Notificación
```javascript
// Enviar notificación de prueba
notifCtrl.sendTestNotification();

// Verificar recepción en tiempo real
// Verificar almacenamiento local
// Verificar actualización de contador
```

### Pruebas de Integración
1. Crear contenido y verificar notificación
2. Actualizar contenido y verificar notificación con cambios
3. Eliminar contenido y verificar notificación
4. Verificar filtros por módulo en frontend

## Monitoreo

### Métricas a Monitorear
- Número de notificaciones enviadas por tipo
- Tiempo de entrega de notificaciones
- Tasa de éxito en envío
- Uso de recursos AMQP

### Logs
```javascript
// Logs de notificación
console.log(`📨 Notificación enviada al usuario ${userId}:`, message.title);

// Logs de error
console.error('❌ Error al enviar notificación:', error);
```

## Consideraciones de Rendimiento

### Optimizaciones
- Notificaciones asíncronas
- Detección de cambios para evitar notificaciones innecesarias
- Límite de notificaciones almacenadas localmente
- Compresión de datos en WebSockets

### Escalabilidad
- Uso de colas AMQP para distribución de carga
- WebSockets para comunicación en tiempo real
- Almacenamiento local para reducir carga del servidor

## Seguridad

### Autenticación
- JWT tokens para WebSocket connections
- Validación de permisos en rutas
- Sanitización de datos de entrada

### Privacidad
- Notificaciones solo para usuarios autorizados
- Datos sensibles filtrados en notificaciones
- Logs sin información personal

## Mantenimiento

### Actualizaciones
- Versiones de dependencias AMQP y WebSocket
- Configuración de RabbitMQ
- Estructura de notificaciones

### Backup
- Configuración de RabbitMQ
- Datos de notificaciones en base de datos
- Logs de sistema

## Troubleshooting

### Problemas Comunes
1. **Notificaciones no llegan**: Verificar conexión AMQP y WebSocket
2. **Errores de conexión**: Verificar configuración de RabbitMQ
3. **Notificaciones duplicadas**: Verificar configuración de consumidores
4. **Rendimiento lento**: Verificar configuración de colas y exchanges

### Comandos de Diagnóstico
```bash
# Verificar estado de RabbitMQ
rabbitmqctl status

# Verificar colas
rabbitmqctl list_queues

# Verificar exchanges
rabbitmqctl list_exchanges
```