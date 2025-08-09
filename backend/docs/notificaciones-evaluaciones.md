# Integración de Notificaciones con Módulo de Evaluaciones

## Descripción

Este documento describe la integración del sistema de notificaciones en tiempo real con el módulo de evaluaciones del sistema TUPAD Organizador Académico.

## Arquitectura

### Componentes Principales

1. **EvaluacionNotificationService** (`backend/services/evaluacionNotificationService.js`)
   - Servicio específico para notificaciones relacionadas con evaluaciones
   - Maneja diferentes tipos de eventos de evaluaciones
   - Integra con AMQPService para envío de notificaciones

2. **Rutas de Evaluaciones** (`backend/routes/evaluaciones.js`)
   - Rutas modificadas para incluir notificaciones automáticas
   - Eventos: creación, actualización, eliminación de evaluaciones
   - Eventos: publicación de notas

3. **Frontend** (`frontend/src/controllers/notificaciones.controller.js`)
   - Controlador actualizado con filtros por módulo
   - Iconos y clases CSS específicas para cada tipo de notificación

## Tipos de Notificaciones

### Evaluaciones

| Tipo | Descripción | Icono | Color |
|------|-------------|-------|-------|
| `evaluacion_creada` | Nueva evaluación creada | `bi-file-earmark-plus` | Verde |
| `evaluacion_actualizada` | Evaluación modificada | `bi-file-earmark-text` | Azul |
| `evaluacion_eliminada` | Evaluación eliminada | `bi-file-earmark-x` | Rojo |
| `nota_publicada` | Nota publicada | `bi-star` | Amarillo |
| `evaluacion_proxima` | Evaluación próxima | `bi-calendar-event` | Azul claro |
| `evaluacion_vencida` | Evaluación vencida | `bi-calendar-x` | Rojo |

## Flujo de Notificaciones

### 1. Creación de Evaluación

```javascript
// Cuando se crea una evaluación
await evaluacionNotificationService.notifyEvaluacionCreada(evaluacion, materia, userId);
```

**Datos incluidos:**
- ID de la evaluación
- Título de la evaluación
- Tipo de evaluación
- Fecha de evaluación
- Información de la materia (ID, nombre, código)

### 2. Actualización de Evaluación

```javascript
// Cuando se actualiza una evaluación
const cambios = {
    titulo: { anterior: 'Título anterior', nuevo: 'Nuevo título' },
    fecha_evaluacion: { anterior: '2024-01-01', nuevo: '2024-01-15' }
};

await evaluacionNotificationService.notifyEvaluacionActualizada(evaluacion, materia, userId, cambios);
```

**Datos incluidos:**
- Todos los datos de la evaluación
- Información de la materia
- Detalle de los cambios realizados

### 3. Eliminación de Evaluación

```javascript
// Cuando se elimina una evaluación
await evaluacionNotificationService.notifyEvaluacionEliminada(evaluacion, materia, userId);
```

**Datos incluidos:**
- ID de la evaluación
- Título de la evaluación
- Tipo de evaluación
- Información de la materia

### 4. Publicación de Nota

```javascript
// Cuando se publica una nota
await evaluacionNotificationService.notifyNotaPublicada(evaluacion, materia, nota, userId);
```

**Datos incluidos:**
- Información de la evaluación
- Información de la materia
- Nota obtenida
- Porcentaje de la nota
- Nota máxima (10)

### 5. Evaluación Próxima

```javascript
// Para evaluaciones próximas
await evaluacionNotificationService.notifyEvaluacionProxima(evaluacion, materia, diasRestantes, userId);
```

**Datos incluidos:**
- Información de la evaluación
- Información de la materia
- Días restantes hasta la evaluación

### 6. Evaluación Vencida

```javascript
// Para evaluaciones vencidas
await evaluacionNotificationService.notifyEvaluacionVencida(evaluacion, materia, userId);
```

**Datos incluidos:**
- Información de la evaluación
- Información de la materia
- Fecha de vencimiento

## Configuración

### Variables de Entorno

```env
# Configuración de notificaciones
NOTIFICATION_TTL=86400000
NOTIFICATION_MAX_RETRIES=3
```

### Configuración del Servicio

El servicio `EvaluacionNotificationService` incluye:

- **Tipos de notificación**: Definidos en el constructor
- **Métodos de envío**: Para cada tipo de evento
- **Manejo de errores**: No interrumpe operaciones principales
- **Datos enriquecidos**: Incluye información contextual

## Uso en el Frontend

### Filtros por Módulo

```javascript
// Filtrar notificaciones de evaluaciones
notifCtrl.filters.module = 'evaluaciones';
```

### Iconos Dinámicos

```html
<i class="bi" ng-class="notifCtrl.getNotificationIcon(notification.type) + ' ' + notifCtrl.getNotificationClass(notification.type)"></i>
```

### Tipos de Notificación Disponibles

```javascript
evaluaciones: [
    'evaluacion_creada',
    'evaluacion_actualizada',
    'evaluacion_eliminada',
    'nota_publicada',
    'evaluacion_proxima',
    'evaluacion_vencida'
]
```

## Manejo de Errores

### Backend

```javascript
try {
    await evaluacionNotificationService.notifyEvaluacionCreada(evaluacion, materia, req.user.id);
} catch (notificationError) {
    console.error('Error al enviar notificación:', notificationError);
    // No fallamos la operación principal por un error de notificación
}
```

### Frontend

```javascript
// El servicio maneja automáticamente los errores de conexión
// y reintenta la conexión según la configuración
```

## Pruebas

### Crear Evaluación

```bash
curl -X POST http://localhost:3000/api/evaluaciones \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "materia_id": 1,
    "titulo": "Parcial 1",
    "descripcion": "Primer parcial de la materia",
    "tipo_evaluacion": "parcial",
    "fecha_evaluacion": "2024-01-15",
    "hora_inicio": "14:00",
    "hora_fin": "16:00",
    "peso": 30
  }'
```

### Publicar Nota

```bash
curl -X POST http://localhost:3000/api/evaluaciones/1/notas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "nota": 8,
    "comentarios": "Excelente trabajo"
  }'
```

## Monitoreo

### Logs del Servidor

```bash
# Verificar que las notificaciones se envían correctamente
tail -f logs/server.log | grep "notificación"
```

### Estado de Conexión

```javascript
// Verificar estado de conexión WebSocket
console.log('Estado:', NotificationService.getConnectionStatus());
```

## Consideraciones de Rendimiento

1. **Notificaciones Asíncronas**: No bloquean operaciones principales
2. **Detección de Cambios**: Solo se envían notificaciones cuando hay cambios reales
3. **Datos Optimizados**: Se incluye solo la información necesaria
4. **Reintentos Automáticos**: El servicio maneja reconexiones automáticamente

## Seguridad

1. **Autenticación**: Todas las notificaciones requieren autenticación
2. **Autorización**: Solo usuarios autorizados pueden recibir notificaciones
3. **Validación**: Los datos se validan antes del envío
4. **Auditoría**: Se registran todos los eventos de notificación

## Mantenimiento

### Limpieza de Notificaciones

```sql
-- Eliminar notificaciones antiguas (más de 30 días)
DELETE FROM notificaciones
WHERE created_at < datetime('now', '-30 days');
```

### Estadísticas

```sql
-- Obtener estadísticas de notificaciones por tipo
SELECT tipo, COUNT(*) as total,
       COUNT(CASE WHEN leida = 1 THEN 1 END) as leidas
FROM notificaciones
WHERE tipo LIKE 'evaluacion_%'
GROUP BY tipo;
```

## Troubleshooting

### Problemas Comunes

1. **Notificaciones no llegan**
   - Verificar conexión WebSocket
   - Revisar logs del servidor
   - Confirmar que RabbitMQ está funcionando

2. **Notificaciones duplicadas**
   - Verificar configuración de reconexión
   - Revisar lógica de deduplicación

3. **Errores de conexión**
   - Verificar configuración de RabbitMQ
   - Revisar firewall y puertos
   - Confirmar que el servicio está iniciado

### Logs Útiles

```bash
# Logs de AMQP
grep "AMQP" logs/server.log

# Logs de WebSocket
grep "Socket" logs/server.log

# Logs de notificaciones
grep "notificación" logs/server.log
```