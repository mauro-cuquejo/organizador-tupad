/**
 * Servicio para comunicación AMQP con RabbitMQ
 */
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

class AMQPService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            NOTIFICATIONS: 'notifications',
            EVENTS: 'events',
            EMAILS: 'emails'
        };
        this.exchanges = {
            USER_EVENTS: 'user_events',
            SYSTEM_EVENTS: 'system_events'
        };
    }

    /**
     * Inicializar conexión con RabbitMQ
     */
    async initialize() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();

            // Configurar exchanges
            await this.setupExchanges();

            // Configurar colas
            await this.setupQueues();

            console.log('✅ Conexión AMQP establecida correctamente');

            // Manejar eventos de conexión
            this.connection.on('error', (err) => {
                console.error('❌ Error en conexión AMQP:', err);
                this.reconnect();
            });

            this.connection.on('close', () => {
                console.warn('⚠️ Conexión AMQP cerrada, intentando reconectar...');
                this.reconnect();
            });

        } catch (error) {
            console.error('❌ Error al inicializar AMQP:', error);
            throw error;
        }
    }

    /**
     * Configurar exchanges
     */
    async setupExchanges() {
        try {
            // Exchange para eventos de usuario
            await this.channel.assertExchange(this.exchanges.USER_EVENTS, 'topic', {
                durable: true
            });

            // Exchange para eventos del sistema
            await this.channel.assertExchange(this.exchanges.SYSTEM_EVENTS, 'fanout', {
                durable: true
            });

            console.log('✅ Exchanges configurados correctamente');
        } catch (error) {
            console.error('❌ Error al configurar exchanges:', error);
            throw error;
        }
    }

    /**
     * Configurar colas
     */
    async setupQueues() {
        try {
            // Cola de notificaciones
            await this.channel.assertQueue(this.queues.NOTIFICATIONS, {
                durable: true,
                arguments: {
                    'x-message-ttl': 86400000 // 24 horas
                }
            });

            // Cola de eventos
            await this.channel.assertQueue(this.queues.EVENTS, {
                durable: true
            });

            // Cola de emails
            await this.channel.assertQueue(this.queues.EMAILS, {
                durable: true
            });

            // Binding para notificaciones de usuario
            await this.channel.bindQueue(
                this.queues.NOTIFICATIONS,
                this.exchanges.USER_EVENTS,
                'user.*'
            );

            // Binding para eventos del sistema
            await this.channel.bindQueue(
                this.queues.EVENTS,
                this.exchanges.SYSTEM_EVENTS,
                ''
            );

            console.log('✅ Colas configuradas correctamente');
        } catch (error) {
            console.error('❌ Error al configurar colas:', error);
            throw error;
        }
    }

    /**
     * Enviar notificación a un usuario específico
     */
    async sendUserNotification(userId, notification) {
        try {
            const message = {
                id: uuidv4(),
                userId: userId,
                type: notification.type || 'info',
                title: notification.title,
                message: notification.message,
                data: notification.data || {},
                timestamp: new Date().toISOString(),
                read: false
            };

            await this.channel.publish(
                this.exchanges.USER_EVENTS,
                `user.${userId}`,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            );

            console.log(`📨 Notificación enviada al usuario ${userId}:`, message.title);
            return message;
        } catch (error) {
            console.error('❌ Error al enviar notificación:', error);
            throw error;
        }
    }

    /**
     * Enviar notificación a múltiples usuarios
     */
    async sendBulkNotification(userIds, notification) {
        try {
            const promises = userIds.map(userId =>
                this.sendUserNotification(userId, notification)
            );

            const results = await Promise.allSettled(promises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(`📨 Notificaciones enviadas: ${successful} exitosas, ${failed} fallidas`);
            return { successful, failed, results };
        } catch (error) {
            console.error('❌ Error al enviar notificaciones masivas:', error);
            throw error;
        }
    }

    /**
     * Enviar evento del sistema
     */
    async sendSystemEvent(event) {
        try {
            const message = {
                id: uuidv4(),
                type: event.type,
                title: event.title,
                message: event.message,
                data: event.data || {},
                timestamp: new Date().toISOString(),
                severity: event.severity || 'info'
            };

            await this.channel.publish(
                this.exchanges.SYSTEM_EVENTS,
                '',
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            );

            console.log(`🔔 Evento del sistema enviado:`, message.title);
            return message;
        } catch (error) {
            console.error('❌ Error al enviar evento del sistema:', error);
            throw error;
        }
    }

    /**
     * Consumir notificaciones
     */
    async consumeNotifications(callback) {
        try {
            await this.channel.consume(this.queues.NOTIFICATIONS, (msg) => {
                if (msg) {
                    const notification = JSON.parse(msg.content.toString());
                    console.log('📨 Notificación recibida:', notification.title);

                    callback(notification);

                    // Confirmar procesamiento
                    this.channel.ack(msg);
                }
            });

            console.log('✅ Consumidor de notificaciones iniciado');
        } catch (error) {
            console.error('❌ Error al consumir notificaciones:', error);
            throw error;
        }
    }

    /**
     * Consumir eventos del sistema
     */
    async consumeSystemEvents(callback) {
        try {
            await this.channel.consume(this.queues.EVENTS, (msg) => {
                if (msg) {
                    const event = JSON.parse(msg.content.toString());
                    console.log('🔔 Evento del sistema recibido:', event.title);

                    callback(event);

                    // Confirmar procesamiento
                    this.channel.ack(msg);
                }
            });

            console.log('✅ Consumidor de eventos del sistema iniciado');
        } catch (error) {
            console.error('❌ Error al consumir eventos del sistema:', error);
            throw error;
        }
    }

    /**
     * Enviar email a través de cola
     */
    async sendEmail(emailData) {
        try {
            const message = {
                id: uuidv4(),
                to: emailData.to,
                subject: emailData.subject,
                template: emailData.template,
                data: emailData.data || {},
                timestamp: new Date().toISOString()
            };

            await this.channel.sendToQueue(
                this.queues.EMAILS,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            );

            console.log(`📧 Email enviado a cola: ${emailData.to}`);
            return message;
        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            throw error;
        }
    }

    /**
     * Reconectar en caso de pérdida de conexión
     */
    async reconnect() {
        try {
            console.log('🔄 Intentando reconectar a RabbitMQ...');

            // Esperar antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 5000));

            await this.initialize();
        } catch (error) {
            console.error('❌ Error al reconectar:', error);
            // Reintentar después de un tiempo
            setTimeout(() => this.reconnect(), 10000);
        }
    }

    /**
     * Cerrar conexión
     */
    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('✅ Conexión AMQP cerrada correctamente');
        } catch (error) {
            console.error('❌ Error al cerrar conexión AMQP:', error);
        }
    }

    /**
     * Obtener estadísticas de las colas
     */
    async getQueueStats() {
        try {
            const stats = {};

            for (const [name, queue] of Object.entries(this.queues)) {
                const info = await this.channel.checkQueue(queue);
                stats[name] = {
                    queue: queue,
                    messageCount: info.messageCount,
                    consumerCount: info.consumerCount
                };
            }

            return stats;
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de colas:', error);
            throw error;
        }
    }
}

module.exports = new AMQPService();