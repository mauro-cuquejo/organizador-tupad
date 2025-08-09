/**
 * Servicio para notificaciones específicas de contenidos
 */
const amqpService = require('./amqpService');

class ContenidoNotificationService {
    constructor() {
        this.notificationTypes = {
            CONTENIDO_CREADO: 'contenido_creado',
            CONTENIDO_ACTUALIZADO: 'contenido_actualizado',
            CONTENIDO_ELIMINADO: 'contenido_eliminado',
            ARCHIVO_SUBIDO: 'archivo_subido',
            ARCHIVO_ELIMINADO: 'archivo_eliminado',
            CONTENIDO_PUBLICADO: 'contenido_publicado',
            CONTENIDO_ARCHIVADO: 'contenido_archivado'
        };
    }

    /**
     * Enviar notificación de contenido creado
     */
    async notifyContenidoCreado(contenido, materia, userId) {
        const notification = {
            type: this.notificationTypes.CONTENIDO_CREADO,
            title: 'Nuevo contenido creado',
            message: `Se ha creado el contenido "${contenido.titulo}" para ${materia.nombre}`,
            data: {
                contenidoId: contenido.id,
                contenidoTitulo: contenido.titulo,
                contenidoTipo: contenido.tipo_contenido,
                contenidoDescripcion: contenido.descripcion,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_contenido'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de contenido actualizado
     */
    async notifyContenidoActualizado(contenido, materia, userId, cambios) {
        const notification = {
            type: this.notificationTypes.CONTENIDO_ACTUALIZADO,
            title: 'Contenido actualizado',
            message: `Se han actualizado los datos del contenido "${contenido.titulo}"`,
            data: {
                contenidoId: contenido.id,
                contenidoTitulo: contenido.titulo,
                contenidoTipo: contenido.tipo_contenido,
                contenidoDescripcion: contenido.descripcion,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                cambios: cambios,
                action: 'view_contenido'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de contenido eliminado
     */
    async notifyContenidoEliminado(contenido, materia, userId) {
        const notification = {
            type: this.notificationTypes.CONTENIDO_ELIMINADO,
            title: 'Contenido eliminado',
            message: `Se ha eliminado el contenido "${contenido.titulo}" de ${materia.nombre}`,
            data: {
                contenidoId: contenido.id,
                contenidoTitulo: contenido.titulo,
                contenidoTipo: contenido.tipo_contenido,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_contenidos'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de archivo subido
     */
    async notifyArchivoSubido(contenido, materia, archivo, userId) {
        const notification = {
            type: this.notificationTypes.ARCHIVO_SUBIDO,
            title: 'Archivo subido',
            message: `Se ha subido el archivo "${archivo.nombre}" al contenido "${contenido.titulo}"`,
            data: {
                contenidoId: contenido.id,
                contenidoTitulo: contenido.titulo,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                archivoId: archivo.id,
                archivoNombre: archivo.nombre,
                archivoTipo: archivo.tipo,
                archivoTamaño: archivo.tamaño,
                action: 'view_contenido'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de archivo eliminado
     */
    async notifyArchivoEliminado(contenido, materia, archivo, userId) {
        const notification = {
            type: this.notificationTypes.ARCHIVO_ELIMINADO,
            title: 'Archivo eliminado',
            message: `Se ha eliminado el archivo "${archivo.nombre}" del contenido "${contenido.titulo}"`,
            data: {
                contenidoId: contenido.id,
                contenidoTitulo: contenido.titulo,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                archivoId: archivo.id,
                archivoNombre: archivo.nombre,
                action: 'view_contenido'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de contenido publicado
     */
    async notifyContenidoPublicado(contenido, materia, userId) {
        const notification = {
            type: this.notificationTypes.CONTENIDO_PUBLICADO,
            title: 'Contenido publicado',
            message: `El contenido "${contenido.titulo}" ha sido publicado y está disponible para los estudiantes`,
            data: {
                contenidoId: contenido.id,
                contenidoTitulo: contenido.titulo,
                contenidoTipo: contenido.tipo_contenido,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_contenido'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación de contenido archivado
     */
    async notifyContenidoArchivado(contenido, materia, userId) {
        const notification = {
            type: this.notificationTypes.CONTENIDO_ARCHIVADO,
            title: 'Contenido archivado',
            message: `El contenido "${contenido.titulo}" ha sido archivado`,
            data: {
                contenidoId: contenido.id,
                contenidoTitulo: contenido.titulo,
                contenidoTipo: contenido.tipo_contenido,
                materiaId: materia.id,
                materiaNombre: materia.nombre,
                materiaCodigo: materia.codigo,
                action: 'view_contenidos'
            }
        };

        return await amqpService.sendUserNotification(userId, notification);
    }

    /**
     * Enviar notificación a todos los usuarios del sistema
     */
    async notifyAllUsers(notification) {
        return await amqpService.sendSystemEvent({
            type: 'contenido_system_event',
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
            type: 'contenido_role_event',
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

module.exports = new ContenidoNotificationService();