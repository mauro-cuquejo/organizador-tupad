/**
 * Servicio para notificaciones específicas de materias
 */
const amqpService = require('./amqpService');

class MateriaNotificationService {
    constructor() {
        this.notificationTypes = {
            MATERIA_CREADA: 'materia_creada',
            MATERIA_ACTUALIZADA: 'materia_actualizada',
            MATERIA_ELIMINADA: 'materia_eliminada',
            HORARIO_ASIGNADO: 'horario_asignado',
            HORARIO_CAMBIADO: 'horario_cambiado',
            PROFESOR_ASIGNADO: 'profesor_asignado',
            PROFESOR_CAMBIADO: 'profesor_cambiado'
        };
    }

    /**
     * Enviar notificación de materia creada
     */
    async notifyMateriaCreada(materia, userId) {
        const notification = {
            type: this.notificationTypes.MATERIA_CREADA,
            title: 'Nueva materia creada',
            message: `Se ha creado la materia "${materia.nombre}" (${materia.codigo})`,
            data: {
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                creditos: materia.creditos,
                action: 'view_materia'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de materia actualizada
     */
    async notifyMateriaActualizada(materia, userId, cambios) {
        const notification = {
            type: this.notificationTypes.MATERIA_ACTUALIZADA,
            title: 'Materia actualizada',
            message: `Se han actualizado los datos de la materia "${materia.nombre}"`,
            data: {
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                cambios: cambios,
                action: 'view_materia'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de materia eliminada
     */
    async notifyMateriaEliminada(materia, userId) {
        const notification = {
            type: this.notificationTypes.MATERIA_ELIMINADA,
            title: 'Materia eliminada',
            message: `Se ha eliminado la materia "${materia.nombre}" (${materia.codigo})`,
            data: {
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_materias'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de horario asignado
     */
    async notifyHorarioAsignado(materia, horario, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.HORARIO_ASIGNADO,
            title: 'Nuevo horario asignado',
            message: `Se ha asignado un horario para "${materia.nombre}": ${diaNombre} ${horario.hora_inicio} - ${horario.hora_fin}`,
            data: {
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                horarioId: horario.id,
                diaSemana: horario.dia_semana,
                diaNombre: diaNombre,
                horaInicio: horario.hora_inicio,
                horaFin: horario.hora_fin,
                tipoClase: horario.tipo_clase,
                action: 'view_horarios'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de horario cambiado
     */
    async notifyHorarioCambiado(materia, horario, cambios, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.HORARIO_CAMBIADO,
            title: 'Horario modificado',
            message: `Se han modificado los horarios de "${materia.nombre}": ${diaNombre} ${horario.hora_inicio} - ${horario.hora_fin}`,
            data: {
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                horarioId: horario.id,
                diaSemana: horario.dia_semana,
                diaNombre: diaNombre,
                horaInicio: horario.hora_inicio,
                horaFin: horario.hora_fin,
                cambios: cambios,
                action: 'view_horarios'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de profesor asignado
     */
    async notifyProfesorAsignado(materia, profesor, horario, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.PROFESOR_ASIGNADO,
            title: 'Profesor asignado',
            message: `Se ha asignado el profesor ${profesor.nombre} ${profesor.apellido} a "${materia.nombre}" - ${diaNombre} ${horario.hora_inicio}`,
            data: {
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                horarioId: horario.id,
                diaSemana: horario.dia_semana,
                diaNombre: diaNombre,
                horaInicio: horario.hora_inicio,
                action: 'view_profesores'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de profesor cambiado
     */
    async notifyProfesorCambiado(materia, profesorAnterior, profesorNuevo, horario, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.PROFESOR_CAMBIADO,
            title: 'Profesor cambiado',
            message: `Se ha cambiado el profesor de "${materia.nombre}": ${profesorAnterior.nombre} ${profesorAnterior.apellido} → ${profesorNuevo.nombre} ${profesorNuevo.apellido}`,
            data: {
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                profesorAnteriorId: profesorAnterior.id,
                profesorAnteriorNombre: `${profesorAnterior.nombre} ${profesorAnterior.apellido}`,
                profesorNuevoId: profesorNuevo.id,
                profesorNuevoNombre: `${profesorNuevo.nombre} ${profesorNuevo.apellido}`,
                horarioId: horario.id,
                diaSemana: horario.dia_semana,
                diaNombre: diaNombre,
                horaInicio: horario.hora_inicio,
                action: 'view_profesores'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación a todos los usuarios del sistema
     */
    async notifyAllUsers(notification) {
        // Obtener todos los usuarios activos (esto requeriría una consulta a la base de datos)
        // Por ahora, enviaremos un evento del sistema
        return await amqpService.sendSystemEvent({
            type: 'materia_system_event',
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
        // Esta función requeriría una consulta a la base de datos para obtener usuarios por rol
        // Por ahora, enviaremos un evento del sistema con información de roles
        return await amqpService.sendSystemEvent({
            type: 'materia_role_event',
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

module.exports = new MateriaNotificationService();