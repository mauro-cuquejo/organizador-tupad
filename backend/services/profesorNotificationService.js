/**
 * Servicio para notificaciones específicas de profesores
 */
const amqpService = require('./amqpService');

class ProfesorNotificationService {
    constructor() {
        this.notificationTypes = {
            PROFESOR_CREADO: 'profesor_creado',
            PROFESOR_ACTUALIZADO: 'profesor_actualizado',
            PROFESOR_ELIMINADO: 'profesor_eliminado',
            MATERIA_ASIGNADA: 'materia_asignada',
            MATERIA_DESASIGNADA: 'materia_desasignada',
            HORARIO_ASIGNADO: 'horario_asignado',
            HORARIO_CAMBIADO: 'horario_cambiado'
        };
    }

    /**
     * Enviar notificación de profesor creado
     */
    async notifyProfesorCreado(profesor, userId) {
        const notification = {
            type: this.notificationTypes.PROFESOR_CREADO,
            title: 'Nuevo profesor registrado',
            message: `Se ha registrado el profesor ${profesor.nombre} ${profesor.apellido} (${profesor.email})`,
            data: {
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                profesorEmail: profesor.email,
                profesorTelefono: profesor.telefono,
                profesorEspecialidad: profesor.especialidad,
                action: 'view_profesor'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de profesor actualizado
     */
    async notifyProfesorActualizado(profesor, userId, cambios) {
        const notification = {
            type: this.notificationTypes.PROFESOR_ACTUALIZADO,
            title: 'Profesor actualizado',
            message: `Se han actualizado los datos del profesor ${profesor.nombre} ${profesor.apellido}`,
            data: {
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                profesorEmail: profesor.email,
                profesorTelefono: profesor.telefono,
                profesorEspecialidad: profesor.especialidad,
                cambios: cambios,
                action: 'view_profesor'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de profesor eliminado
     */
    async notifyProfesorEliminado(profesor, userId) {
        const notification = {
            type: this.notificationTypes.PROFESOR_ELIMINADO,
            title: 'Profesor eliminado',
            message: `Se ha eliminado el profesor ${profesor.nombre} ${profesor.apellido} (${profesor.email})`,
            data: {
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                profesorEmail: profesor.email,
                action: 'view_profesores'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de materia asignada a profesor
     */
    async notifyMateriaAsignada(profesor, materia, horario, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.MATERIA_ASIGNADA,
            title: 'Materia asignada',
            message: `Se ha asignado la materia "${materia.nombre}" al profesor ${profesor.nombre} ${profesor.apellido} - ${diaNombre} ${horario.hora_inicio}`,
            data: {
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
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
     * Enviar notificación de materia desasignada de profesor
     */
    async notifyMateriaDesasignada(profesor, materia, horario, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.MATERIA_DESASIGNADA,
            title: 'Materia desasignada',
            message: `Se ha desasignado la materia "${materia.nombre}" del profesor ${profesor.nombre} ${profesor.apellido} - ${diaNombre} ${horario.hora_inicio}`,
            data: {
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
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
     * Enviar notificación de horario asignado a profesor
     */
    async notifyHorarioAsignado(profesor, materia, horario, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.HORARIO_ASIGNADO,
            title: 'Horario asignado',
            message: `Se ha asignado un horario para ${profesor.nombre} ${profesor.apellido}: "${materia.nombre}" - ${diaNombre} ${horario.hora_inicio} - ${horario.hora_fin}`,
            data: {
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
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
     * Enviar notificación de horario cambiado para profesor
     */
    async notifyHorarioCambiado(profesor, materia, horario, cambios, userId) {
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaNombre = diasSemana[horario.dia_semana];

        const notification = {
            type: this.notificationTypes.HORARIO_CAMBIADO,
            title: 'Horario modificado',
            message: `Se han modificado los horarios para ${profesor.nombre} ${profesor.apellido}: "${materia.nombre}" - ${diaNombre} ${horario.hora_inicio} - ${horario.hora_fin}`,
            data: {
                profesorId: profesor.id,
                profesorNombre: `${profesor.nombre} ${profesor.apellido}`,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
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
     * Enviar notificación a todos los usuarios del sistema
     */
    async notifyAllUsers(notification) {
        return await amqpService.sendSystemEvent({
            type: 'profesor_system_event',
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
            type: 'profesor_role_event',
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

module.exports = new ProfesorNotificationService();