/**
 * Rutas para notificaciones
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const amqpService = require('../services/amqpService');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/notificaciones/check
 * Verificar nuevas notificaciones (para polling)
 */
router.get('/check', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const lastCheck = req.query.lastCheck;

        // Por ahora, devolver notificaciones de ejemplo
        // En una implementación real, consultarías la base de datos
        const notifications = [];

        // Si es la primera vez, enviar notificación de bienvenida
        if (!lastCheck) {
            notifications.push({
                id: `welcome_${userId}_${Date.now()}`,
                type: 'info',
                title: '¡Bienvenido al sistema!',
                message: 'Has sido conectado al sistema de notificaciones.',
                timestamp: new Date().toISOString(),
                read: false
            });
        }

        res.json({
            success: true,
            notifications: notifications,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error al verificar notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /api/notificaciones
 * Obtener todas las notificaciones del usuario
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Por ahora, devolver notificaciones de ejemplo
        const notifications = [
            {
                id: 'example_1',
                type: 'info',
                title: 'Ejemplo de notificación',
                message: 'Esta es una notificación de ejemplo.',
                timestamp: new Date().toISOString(),
                read: false
            }
        ];

        res.json({
            success: true,
            notifications: notifications
        });

    } catch (error) {
        console.error('❌ Error al obtener notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * PUT /api/notificaciones/:id/read
 * Marcar notificación como leída
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        // Aquí actualizarías el estado en la base de datos
        console.log(`✅ Notificación ${notificationId} marcada como leída por ${userId}`);

        res.json({
            success: true,
            message: 'Notificación marcada como leída'
        });

    } catch (error) {
        console.error('❌ Error al marcar notificación como leída:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * PUT /api/notificaciones/read-all
 * Marcar todas las notificaciones como leídas
 */
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Aquí actualizarías el estado en la base de datos
        console.log(`✅ Todas las notificaciones marcadas como leídas por ${userId}`);

        res.json({
            success: true,
            message: 'Todas las notificaciones marcadas como leídas'
        });

    } catch (error) {
        console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * DELETE /api/notificaciones/:id
 * Eliminar notificación
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        // Aquí eliminarías la notificación de la base de datos
        console.log(`🗑️ Notificación ${notificationId} eliminada por ${userId}`);

        res.json({
            success: true,
            message: 'Notificación eliminada'
        });

    } catch (error) {
        console.error('❌ Error al eliminar notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /api/notificaciones/test
 * Enviar notificación de prueba
 */
router.post('/test', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Enviar notificación de prueba usando RabbitMQ
        const testNotification = {
            type: 'info',
            title: 'Notificación de prueba',
            message: 'Esta es una notificación de prueba enviada desde el servidor.',
            data: {
                test: true,
                timestamp: new Date().toISOString()
            }
        };

        await amqpService.sendUserNotification(userId, testNotification);

        res.json({
            success: true,
            message: 'Notificación de prueba enviada',
            notification: testNotification
        });

    } catch (error) {
        console.error('❌ Error al enviar notificación de prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /api/notificaciones/stats
 * Obtener estadísticas de notificaciones
 */
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Por ahora, devolver estadísticas de ejemplo
        const stats = {
            total: 1,
            unread: 1,
            read: 0,
            byType: {
                info: 1,
                success: 0,
                warning: 0,
                error: 0
            }
        };

        res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /api/notificaciones/send
 * Enviar notificación a usuarios específicos (solo admin)
 */
router.post('/send', [
    authenticateToken,
    body('userIds').isArray().withMessage('userIds debe ser un array'),
    body('title').notEmpty().withMessage('El título es requerido'),
    body('message').notEmpty().withMessage('El mensaje es requerido'),
    body('type').isIn(['info', 'success', 'warning', 'error']).withMessage('Tipo inválido')
], async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo administradores pueden enviar notificaciones.'
            });
        }

        // Validar datos de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { userIds, title, message, type, data } = req.body;

        // Enviar notificación masiva usando RabbitMQ
        const notification = {
            type: type,
            title: title,
            message: message,
            data: data || {}
        };

        const results = await amqpService.sendBulkNotification(userIds, notification);

        res.json({
            success: true,
            message: 'Notificaciones enviadas',
            results: results
        });

    } catch (error) {
        console.error('❌ Error al enviar notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /api/notificaciones/system-event
 * Enviar evento del sistema (solo admin)
 */
router.post('/system-event', [
    authenticateToken,
    body('title').notEmpty().withMessage('El título es requerido'),
    body('message').notEmpty().withMessage('El mensaje es requerido'),
    body('type').isIn(['info', 'success', 'warning', 'error']).withMessage('Tipo inválido')
], async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo administradores pueden enviar eventos del sistema.'
            });
        }

        // Validar datos de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { title, message, type, data, severity } = req.body;

        // Enviar evento del sistema usando RabbitMQ
        const event = {
            type: type,
            title: title,
            message: message,
            data: data || {},
            severity: severity || 'info'
        };

        await amqpService.sendSystemEvent(event);

        res.json({
            success: true,
            message: 'Evento del sistema enviado',
            event: event
        });

    } catch (error) {
        console.error('❌ Error al enviar evento del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;