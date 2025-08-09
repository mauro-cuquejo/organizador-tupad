/**
 * Servicio para notificaciones específicas de evaluaciones
 */
const amqpService = require('./amqpService');

class EvaluacionNotificationService {
    constructor() {
        this.notificationTypes = {
            EVALUACION_CREADA: 'evaluacion_creada',
            EVALUACION_ACTUALIZADA: 'evaluacion_actualizada',
            EVALUACION_ELIMINADA: 'evaluacion_eliminada',
            NOTA_PUBLICADA: 'nota_publicada',
            EVALUACION_PROXIMA: 'evaluacion_proxima',
            EVALUACION_VENCIDA: 'evaluacion_vencida'
        };
    }

    /**
     * Enviar notificación de evaluación creada
     */
    async notifyEvaluacionCreada(evaluacion, materia, userId) {
        const notification = {
            type: this.notificationTypes.EVALUACION_CREADA,
            title: 'Nueva evaluación creada',
            message: `Se ha creado la evaluación "${evaluacion.titulo}" para ${materia.nombre}`,
            data: {
                evaluacionId: evaluacion.id,
                evaluacionTitulo: evaluacion.titulo,
                evaluacionTipo: evaluacion.tipo,
                evaluacionFecha: evaluacion.fecha,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_evaluacion'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de evaluación actualizada
     */
    async notifyEvaluacionActualizada(evaluacion, materia, userId, cambios) {
        const notification = {
            type: this.notificationTypes.EVALUACION_ACTUALIZADA,
            title: 'Evaluación actualizada',
            message: `Se han actualizado los datos de la evaluación "${evaluacion.titulo}"`,
            data: {
                evaluacionId: evaluacion.id,
                evaluacionTitulo: evaluacion.titulo,
                evaluacionTipo: evaluacion.tipo,
                evaluacionFecha: evaluacion.fecha,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                cambios: cambios,
                action: 'view_evaluacion'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de evaluación eliminada
     */
    async notifyEvaluacionEliminada(evaluacion, materia, userId) {
        const notification = {
            type: this.notificationTypes.EVALUACION_ELIMINADA,
            title: 'Evaluación eliminada',
            message: `Se ha eliminado la evaluación "${evaluacion.titulo}" de ${materia.nombre}`,
            data: {
                evaluacionId: evaluacion.id,
                evaluacionTitulo: evaluacion.titulo,
                evaluacionTipo: evaluacion.tipo,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_evaluaciones'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de nota publicada
     */
    async notifyNotaPublicada(evaluacion, materia, nota, userId) {
        const notification = {
            type: this.notificationTypes.NOTA_PUBLICADA,
            title: 'Nota publicada',
            message: `Se ha publicado la nota para "${evaluacion.titulo}": ${nota}/10`,
            data: {
                evaluacionId: evaluacion.id,
                evaluacionTitulo: evaluacion.titulo,
                evaluacionTipo: evaluacion.tipo,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                nota: nota,
                notaMaxima: 10,
                porcentaje: (nota / 10) * 100,
                action: 'view_evaluacion'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de evaluación próxima
     */
    async notifyEvaluacionProxima(evaluacion, materia, diasRestantes, userId) {
        const notification = {
            type: this.notificationTypes.EVALUACION_PROXIMA,
            title: 'Evaluación próxima',
            message: `La evaluación "${evaluacion.titulo}" es en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`,
            data: {
                evaluacionId: evaluacion.id,
                evaluacionTitulo: evaluacion.titulo,
                evaluacionTipo: evaluacion.tipo,
                evaluacionFecha: evaluacion.fecha,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                diasRestantes: diasRestantes,
                action: 'view_evaluacion'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de evaluación vencida
     */
    async notifyEvaluacionVencida(evaluacion, materia, userId) {
        const notification = {
            type: this.notificationTypes.EVALUACION_VENCIDA,
            title: 'Evaluación vencida',
            message: `La evaluación "${evaluacion.titulo}" ha vencido`,
            data: {
                evaluacionId: evaluacion.id,
                evaluacionTitulo: evaluacion.titulo,
                evaluacionTipo: evaluacion.tipo,
                evaluacionFecha: evaluacion.fecha,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_evaluacion'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación a todos los usuarios del sistema
     */
    async notifyAllUsers(notification) {
        return await amqpService.sendSystemEvent({
            type: 'evaluacion_system_event',
            title: notification.title,
            message: notification.message,
            data: notification.data,
            severity: 'info'
        });
    }

    /**
     * Enviar notificación a usuarios específicos basado en roles
     */
    async notifyByRole(notification, roles) {
        return await amqpService.sendSystemEvent({
            type: 'evaluacion_role_event',
            title: notification.title,
            message: notification.message,
            data: {
                ...notification.data,
                targetRoles: roles
            },
            severity: 'info'
        });
    }
}

module.exports = new EvaluacionNotificationService();