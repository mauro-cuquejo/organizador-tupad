/**
 * Servicio para notificaciones usando polling HTTP (sin WebSocket)
 */
angular.module('tupadApp').service('NotificationService', ['$rootScope', '$http', '$interval', 'AuthService', 'StorageService', function ($rootScope, $http, $interval, AuthService, StorageService) {
    'use strict';

    const notificationCtrl = this;
    const API_BASE = 'http://localhost:3000/api';

    // Propiedades del servicio
    notificationCtrl.notifications = [];
    notificationCtrl.unreadCount = 0;
    notificationCtrl.isPolling = false;
    notificationCtrl.lastCheck = null;

    // Configuración
    notificationCtrl.config = {
        maxNotifications: 50,
        pollingInterval: 10000, // 10 segundos
        maxRetries: 3,
        retryDelay: 5000
    };

    let pollingTimer = null;
    let retryCount = 0;

    /**
     * Inicializar el servicio de notificaciones
     */
    notificationCtrl.initialize = function () {
        console.log('🔔 Inicializando servicio de notificaciones (HTTP Polling)...');

        // Cargar notificaciones guardadas
        notificationCtrl.loadStoredNotifications();

        // Iniciar polling si el usuario está autenticado
        if (AuthService.isAuthenticated()) {
            notificationCtrl.startPolling();
        }

        // Escuchar cambios de autenticación
        $rootScope.$on('auth:login', function () {
            notificationCtrl.startPolling();
        });

        $rootScope.$on('auth:logout', function () {
            notificationCtrl.stopPolling();
        });
    };

    /**
     * Iniciar polling de notificaciones
     */
    notificationCtrl.startPolling = function () {
        if (notificationCtrl.isPolling) {
            console.log('🔔 Polling ya está activo');
            return;
        }

        notificationCtrl.isPolling = true;
        console.log('🔔 Iniciando polling de notificaciones...');

        // Realizar primera verificación inmediatamente
        notificationCtrl.checkForNotifications();

        // Configurar polling periódico
        pollingTimer = $interval(function () {
            notificationCtrl.checkForNotifications();
        }, notificationCtrl.config.pollingInterval);

        // Broadcast del evento
        $rootScope.$broadcast('notifications:polling_started');
    };

    /**
     * Detener polling de notificaciones
     */
    notificationCtrl.stopPolling = function () {
        if (pollingTimer) {
            $interval.cancel(pollingTimer);
            pollingTimer = null;
        }

        notificationCtrl.isPolling = false;
        retryCount = 0;
        console.log('🔔 Polling de notificaciones detenido');

        // Broadcast del evento
        $rootScope.$broadcast('notifications:polling_stopped');
    };

    /**
     * Verificar nuevas notificaciones
     */
    notificationCtrl.checkForNotifications = function () {
        if (!AuthService.isAuthenticated()) {
            return;
        }

        const token = AuthService.getToken();
        if (!token) {
            console.warn('⚠️ No hay token de autenticación para verificar notificaciones');
            return;
        }

        $http.get(`${API_BASE}/notificaciones/check`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                lastCheck: notificationCtrl.lastCheck
            }
        }).then(function (response) {
            retryCount = 0;
            notificationCtrl.lastCheck = new Date().toISOString();

            if (response.data && response.data.notifications) {
                const newNotifications = response.data.notifications;

                if (newNotifications.length > 0) {
                    console.log(`📨 ${newNotifications.length} nuevas notificaciones recibidas`);

                    // Agregar nuevas notificaciones
                    newNotifications.forEach(notification => {
                        notificationCtrl.addNotification(notification);
                        notificationCtrl.showToast(notification);
                    });

                    // Broadcast del evento
                    $rootScope.$broadcast('notifications:new_batch', newNotifications);
                }
            }

            // Broadcast del evento de verificación completada
            $rootScope.$broadcast('notifications:checked');

        }).catch(function (error) {
            console.error('❌ Error al verificar notificaciones:', error);
            retryCount++;

            if (retryCount >= notificationCtrl.config.maxRetries) {
                console.error('❌ Máximo número de reintentos alcanzado, deteniendo polling');
                notificationCtrl.stopPolling();
            } else {
                console.log(`🔄 Reintentando en ${notificationCtrl.config.retryDelay}ms (intento ${retryCount})`);
                setTimeout(() => {
                    if (notificationCtrl.isPolling) {
                        notificationCtrl.checkForNotifications();
                    }
                }, notificationCtrl.config.retryDelay);
            }
        });
    };

    /**
     * Agregar nueva notificación
     */
    notificationCtrl.addNotification = function (notification) {
        // Verificar si la notificación ya existe
        const exists = notificationCtrl.notifications.find(n => n.id === notification.id);
        if (exists) {
            return;
        }

        // Agregar al inicio de la lista
        notificationCtrl.notifications.unshift(notification);

        // Limitar el número de notificaciones
        if (notificationCtrl.notifications.length > notificationCtrl.config.maxNotifications) {
            notificationCtrl.notifications = notificationCtrl.notifications.slice(0, notificationCtrl.config.maxNotifications);
        }

        // Actualizar contador de no leídas
        if (!notification.read) {
            notificationCtrl.unreadCount++;
        }

        // Guardar en localStorage
        notificationCtrl.saveNotifications();

        // Broadcast del evento
        $rootScope.$broadcast('notifications:updated');
    };

    /**
     * Establecer lista de notificaciones
     */
    notificationCtrl.setNotifications = function (notifications) {
        notificationCtrl.notifications = notifications || [];
        notificationCtrl.updateUnreadCount();
        notificationCtrl.saveNotifications();

        // Broadcast del evento
        $rootScope.$broadcast('notifications:updated');
    };

    /**
     * Marcar notificación como leída
     */
    notificationCtrl.markAsRead = function (notificationId) {
        const notification = notificationCtrl.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            notificationCtrl.unreadCount = Math.max(0, notificationCtrl.unreadCount - 1);
            notificationCtrl.saveNotifications();

            // Enviar al backend
            notificationCtrl.markAsReadOnServer(notificationId);

            // Broadcast del evento
            $rootScope.$broadcast('notifications:updated');
        }
    };

    /**
     * Marcar notificación como leída en el servidor
     */
    notificationCtrl.markAsReadOnServer = function (notificationId) {
        const token = AuthService.getToken();
        if (!token) return;

        $http.put(`${API_BASE}/notificaciones/${notificationId}/read`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(function (response) {
            console.log('✅ Notificación marcada como leída en el servidor');
        }).catch(function (error) {
            console.error('❌ Error al marcar notificación como leída:', error);
        });
    };

    /**
     * Marcar todas las notificaciones como leídas
     */
    notificationCtrl.markAllAsRead = function () {
        notificationCtrl.notifications.forEach(notification => {
            notification.read = true;
        });

        notificationCtrl.unreadCount = 0;
        notificationCtrl.saveNotifications();

        // Enviar al backend
        notificationCtrl.markAllAsReadOnServer();

        // Broadcast del evento
        $rootScope.$broadcast('notifications:updated');
    };

    /**
     * Marcar todas las notificaciones como leídas en el servidor
     */
    notificationCtrl.markAllAsReadOnServer = function () {
        const token = AuthService.getToken();
        if (!token) return;

        $http.put(`${API_BASE}/notificaciones/read-all`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(function (response) {
            console.log('✅ Todas las notificaciones marcadas como leídas en el servidor');
        }).catch(function (error) {
            console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
        });
    };

    /**
     * Eliminar notificación
     */
    notificationCtrl.removeNotification = function (notificationId) {
        const index = notificationCtrl.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const notification = notificationCtrl.notifications[index];
            if (!notification.read) {
                notificationCtrl.unreadCount = Math.max(0, notificationCtrl.unreadCount - 1);
            }

            notificationCtrl.notifications.splice(index, 1);
            notificationCtrl.saveNotifications();

            // Enviar al backend
            notificationCtrl.removeNotificationOnServer(notificationId);

            // Broadcast del evento
            $rootScope.$broadcast('notifications:updated');
        }
    };

    /**
     * Eliminar notificación en el servidor
     */
    notificationCtrl.removeNotificationOnServer = function (notificationId) {
        const token = AuthService.getToken();
        if (!token) return;

        $http.delete(`${API_BASE}/notificaciones/${notificationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(function (response) {
            console.log('✅ Notificación eliminada del servidor');
        }).catch(function (error) {
            console.error('❌ Error al eliminar notificación:', error);
        });
    };

    /**
     * Actualizar contador de no leídas
     */
    notificationCtrl.updateUnreadCount = function () {
        notificationCtrl.unreadCount = notificationCtrl.notifications.filter(n => !n.read).length;
    };

    /**
     * Guardar notificaciones en localStorage
     */
    notificationCtrl.saveNotifications = function () {
        try {
            StorageService.set('notifications', notificationCtrl.notifications);
            StorageService.set('notifications_unread_count', notificationCtrl.unreadCount);
        } catch (error) {
            console.error('❌ Error al guardar notificaciones:', error);
        }
    };

    /**
     * Cargar notificaciones guardadas
     */
    notificationCtrl.loadStoredNotifications = function () {
        try {
            const stored = StorageService.get('notifications');
            const unreadCount = StorageService.get('notifications_unread_count');

            if (stored) {
                notificationCtrl.notifications = stored;
            }

            if (unreadCount !== null) {
                notificationCtrl.unreadCount = unreadCount;
            } else {
                notificationCtrl.updateUnreadCount();
            }
        } catch (error) {
            console.error('❌ Error al cargar notificaciones guardadas:', error);
        }
    };

    /**
     * Mostrar notificación toast
     */
    notificationCtrl.showToast = function (notification) {
        // Usar toastr si está disponible
        if (window.toastr) {
            const options = {
                timeOut: 5000,
                extendedTimeOut: 2000,
                closeButton: true,
                progressBar: true,
                preventDuplicates: true
            };

            switch (notification.type) {
                case 'success':
                    toastr.success(notification.message, notification.title, options);
                    break;
                case 'warning':
                    toastr.warning(notification.message, notification.title, options);
                    break;
                case 'error':
                    toastr.error(notification.message, notification.title, options);
                    break;
                default:
                    toastr.info(notification.message, notification.title, options);
            }
        } else {
            // Fallback: usar alert nativo
            console.log(`📨 ${notification.title}: ${notification.message}`);
        }
    };

    /**
     * Enviar notificación de prueba
     */
    notificationCtrl.sendTestNotification = function () {
        return $http.post(`${API_BASE}/notificaciones/test`, {}, {
            headers: {
                'Authorization': `Bearer ${AuthService.getToken()}`
            }
        });
    };

    /**
     * Obtener estadísticas de notificaciones
     */
    notificationCtrl.getStats = function () {
        return $http.get(`${API_BASE}/notificaciones/stats`, {
            headers: {
                'Authorization': `Bearer ${AuthService.getToken()}`
            }
        });
    };

    /**
     * Obtener estado del polling
     */
    notificationCtrl.getPollingStatus = function () {
        return {
            isPolling: notificationCtrl.isPolling,
            lastCheck: notificationCtrl.lastCheck,
            retryCount: retryCount
        };
    };

    /**
     * Limpiar todas las notificaciones
     */
    notificationCtrl.clearAll = function () {
        notificationCtrl.notifications = [];
        notificationCtrl.unreadCount = 0;
        notificationCtrl.saveNotifications();

        // Broadcast del evento
        $rootScope.$broadcast('notifications:updated');
    };

    /**
     * Métodos de conveniencia para mostrar notificaciones
     */
    notificationCtrl.show = function (type, message, title) {
        const notification = {
            type: type,
            message: message,
            title: title || 'Notificación',
            timestamp: new Date().toISOString()
        };
        this.showToast(notification);
    };

    notificationCtrl.success = function (message, title) {
        this.show('success', message, title);
    };

    notificationCtrl.error = function (message, title) {
        this.show('error', message, title);
    };

    notificationCtrl.warning = function (message, title) {
        this.show('warning', message, title);
    };

    notificationCtrl.info = function (message, title) {
        this.show('info', message, title);
    };

    notificationCtrl.confirm = function (message, title, callback) {
        if (window.confirm) {
            const result = window.confirm(message);
            if (callback && typeof callback === 'function') {
                callback(result);
            }
            return result;
        } else {
            // Fallback si no hay confirm disponible
            console.log(`Confirmación: ${message}`);
            if (callback && typeof callback === 'function') {
                callback(true);
            }
            return true;
        }
    };

    return notificationCtrl;
}]);