/**
 * Controlador para notificaciones en tiempo real
 */
angular.module('tupadApp').controller('NotificacionesController', ['$scope', '$rootScope', 'NotificationService', 'ApiService', function ($scope, $rootScope, NotificationService, ApiService) {
    'use strict';

    const notifCtrl = this;

    // Propiedades del controlador
    notifCtrl.loading = false;
    notifCtrl.notifications = [];
    notifCtrl.unreadCount = 0;
    notifCtrl.isConnected = false;
    notifCtrl.connectionStatus = 'disconnected';
    notifCtrl.selectedNotification = null;

    // Filtros
    notifCtrl.filters = {
        type: '',
        read: '',
        sort: 'timestamp',
        search: '',
        module: '' // Nuevo filtro para módulos específicos
    };

    // Tipos de notificaciones por módulo
    notifCtrl.moduleTypes = {
        materias: [
            'materia_creada',
            'materia_actualizada',
            'materia_eliminada',
            'horario_asignado',
            'horario_cambiado',
            'profesor_asignado',
            'profesor_cambiado'
        ],
        evaluaciones: [
            'evaluacion_creada',
            'evaluacion_actualizada',
            'evaluacion_eliminada',
            'nota_publicada',
            'evaluacion_proxima',
            'evaluacion_vencida'
        ],
        contenidos: [
            'contenido_creado',
            'contenido_actualizado',
            'contenido_eliminado',
            'archivo_subido',
            'archivo_eliminado',
            'contenido_publicado',
            'contenido_archivado'
        ],
        profesores: [
            'profesor_creado',
            'profesor_actualizado',
            'profesor_eliminado',
            'materia_asignada',
            'materia_desasignada',
            'horario_asignado',
            'horario_cambiado'
        ]
    };

    /**
     * Inicializar el controlador
     */
    notifCtrl.init = function () {
        console.log('🔔 Inicializando controlador de notificaciones...');

        // Cargar notificaciones desde el servicio
        notifCtrl.loadNotifications();

        // Escuchar eventos del servicio
        $scope.$on('notifications:updated', function () {
            notifCtrl.updateFromService();
        });

        $scope.$on('notifications:connected', function () {
            notifCtrl.updateConnectionStatus();
        });

        $scope.$on('notifications:disconnected', function () {
            notifCtrl.updateConnectionStatus();
        });

        $scope.$on('notifications:new', function (event, notification) {
            notifCtrl.handleNewNotification(notification);
        });

        // Actualizar estado inicial
        notifCtrl.updateFromService();
        notifCtrl.updateConnectionStatus();
    };

    /**
     * Cargar notificaciones desde el servicio
     */
    notifCtrl.loadNotifications = function () {
        notifCtrl.loading = true;

        // Obtener notificaciones del servicio
        notifCtrl.updateFromService();

        // También cargar desde la API si es necesario
        ApiService.notificaciones.getAll()
            .then(function (response) {
                if (response.success) {
                    // Combinar con las del servicio
                    const apiNotifications = response.data || [];
                    const serviceNotifications = NotificationService.notifications || [];

                    // Crear un mapa de notificaciones únicas
                    const notificationsMap = new Map();

                    // Agregar notificaciones del servicio
                    serviceNotifications.forEach(notification => {
                        notificationsMap.set(notification.id, notification);
                    });

                    // Agregar notificaciones de la API
                    apiNotifications.forEach(notification => {
                        if (!notificationsMap.has(notification.id)) {
                            notificationsMap.set(notification.id, notification);
                        }
                    });

                    notifCtrl.notifications = Array.from(notificationsMap.values());
                    notifCtrl.updateUnreadCount();
                }
            })
            .catch(function (error) {
                console.error('❌ Error al cargar notificaciones:', error);
            })
            .finally(function () {
                notifCtrl.loading = false;
            });
    };

    /**
     * Actualizar desde el servicio
     */
    notifCtrl.updateFromService = function () {
        notifCtrl.notifications = NotificationService.notifications || [];
        notifCtrl.unreadCount = NotificationService.unreadCount || 0;
        notifCtrl.isConnected = NotificationService.isConnected;
        notifCtrl.connectionStatus = NotificationService.connectionStatus;
    };

    /**
     * Actualizar estado de conexión
     */
    notifCtrl.updateConnectionStatus = function () {
        const status = NotificationService.getPollingStatus();
        notifCtrl.isConnected = status.isPolling;
        notifCtrl.connectionStatus = status.isPolling ? 'connected' : 'disconnected';
    };

    /**
     * Manejar nueva notificación
     */
    notifCtrl.handleNewNotification = function (notification) {
        // La notificación ya se agregó al servicio, solo actualizar la vista
        notifCtrl.updateFromService();

        // Mostrar notificación toast si no estamos en la página de notificaciones
        if ($scope.$parent.mainCtrl.currentRoute !== '/notificaciones') {
            notifCtrl.showToast(notification);
        }
    };

    /**
     * Obtener notificaciones filtradas
     */
    notifCtrl.getFilteredNotifications = function () {
        let filtered = notifCtrl.notifications;

        // Filtrar por tipo
        if (notifCtrl.filters.type) {
            filtered = filtered.filter(n => n.type === notifCtrl.filters.type);
        }

        // Filtrar por módulo
        if (notifCtrl.filters.module) {
            const moduleTypes = notifCtrl.moduleTypes[notifCtrl.filters.module] || [];
            filtered = filtered.filter(n => moduleTypes.includes(n.type));
        }

        // Filtrar por estado de lectura
        if (notifCtrl.filters.read !== '') {
            const read = notifCtrl.filters.read === 'true';
            filtered = filtered.filter(n => n.read === read);
        }

        // Filtrar por búsqueda
        if (notifCtrl.filters.search) {
            const search = notifCtrl.filters.search.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(search) ||
                n.message.toLowerCase().includes(search)
            );
        }

        // Ordenar
        filtered = notifCtrl.sortNotifications(filtered, notifCtrl.filters.sort);

        return filtered;
    };

    /**
     * Ordenar notificaciones
     */
    notifCtrl.sortNotifications = function (notifications, sortBy) {
        const sorted = [...notifications];

        switch (sortBy) {
            case 'timestamp':
                return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            case 'timestamp_asc':
                return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            case 'type':
                return sorted.sort((a, b) => a.type.localeCompare(b.type));
            case 'title':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sorted;
        }
    };

    /**
     * Obtener tipos de notificación para un módulo específico
     */
    notifCtrl.getModuleTypes = function (module) {
        return notifCtrl.moduleTypes[module] || [];
    };

    /**
 * Obtener icono para un tipo de notificación
 */
    notifCtrl.getNotificationIcon = function (type) {
        const icons = {
            // Materias
            'materia_creada': 'bi-plus-circle',
            'materia_actualizada': 'bi-pencil',
            'materia_eliminada': 'bi-trash',
            'horario_asignado': 'bi-clock',
            'horario_cambiado': 'bi-clock-history',
            'profesor_asignado': 'bi-person-plus',
            'profesor_cambiado': 'bi-person-check',

            // Evaluaciones
            'evaluacion_creada': 'bi-file-earmark-plus',
            'evaluacion_actualizada': 'bi-file-earmark-text',
            'evaluacion_eliminada': 'bi-file-earmark-x',
            'nota_publicada': 'bi-star',
            'evaluacion_proxima': 'bi-calendar-event',
            'evaluacion_vencida': 'bi-calendar-x',

            // Contenidos
            'contenido_creado': 'bi-folder-plus',
            'contenido_actualizado': 'bi-folder',
            'contenido_eliminado': 'bi-folder-x',
            'archivo_subido': 'bi-file-earmark-arrow-up',
            'archivo_eliminado': 'bi-file-earmark-x',
            'contenido_publicado': 'bi-globe',
            'contenido_archivado': 'bi-archive',

            // Profesores
            'profesor_creado': 'bi-person-plus',
            'profesor_actualizado': 'bi-person',
            'profesor_eliminado': 'bi-person-x',
            'materia_asignada': 'bi-link',
            'materia_desasignada': 'bi-link-break',
            'horario_asignado': 'bi-clock',
            'horario_cambiado': 'bi-clock-history'
        };

        return icons[type] || 'bi-bell';
    };

    /**
 * Obtener clase CSS para un tipo de notificación
 */
    notifCtrl.getNotificationClass = function (type) {
        const classes = {
            // Materias
            'materia_creada': 'text-success',
            'materia_actualizada': 'text-primary',
            'materia_eliminada': 'text-danger',
            'horario_asignado': 'text-info',
            'horario_cambiado': 'text-warning',
            'profesor_asignado': 'text-success',
            'profesor_cambiado': 'text-warning',

            // Evaluaciones
            'evaluacion_creada': 'text-success',
            'evaluacion_actualizada': 'text-primary',
            'evaluacion_eliminada': 'text-danger',
            'nota_publicada': 'text-warning',
            'evaluacion_proxima': 'text-info',
            'evaluacion_vencida': 'text-danger',

            // Contenidos
            'contenido_creado': 'text-success',
            'contenido_actualizado': 'text-primary',
            'contenido_eliminado': 'text-danger',
            'archivo_subido': 'text-info',
            'archivo_eliminado': 'text-warning',
            'contenido_publicado': 'text-success',
            'contenido_archivado': 'text-muted',

            // Profesores
            'profesor_creado': 'text-success',
            'profesor_actualizado': 'text-primary',
            'profesor_eliminado': 'text-danger',
            'materia_asignada': 'text-success',
            'materia_desasignada': 'text-warning',
            'horario_asignado': 'text-info',
            'horario_cambiado': 'text-warning'
        };

        return classes[type] || 'text-muted';
    };

    /**
     * Marcar notificación como leída
     */
    notifCtrl.markAsRead = function (notificationId) {
        // Marcar en el servicio
        NotificationService.markAsRead(notificationId);

        // También marcar en la API
        ApiService.notificaciones.markAsRead(notificationId)
            .catch(function (error) {
                console.error('❌ Error al marcar notificación como leída:', error);
            });

        // Actualizar vista
        notifCtrl.updateFromService();
    };

    /**
     * Marcar todas como leídas
     */
    notifCtrl.markAllAsRead = function () {
        // Marcar en el servicio
        NotificationService.markAllAsRead();

        // Actualizar vista
        notifCtrl.updateFromService();

        // Mostrar confirmación
        notifCtrl.showSuccess('Todas las notificaciones han sido marcadas como leídas');
    };

    /**
     * Eliminar notificación
     */
    notifCtrl.removeNotification = function (notificationId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
            // Eliminar del servicio
            NotificationService.removeNotification(notificationId);

            // También eliminar de la API
            ApiService.notificaciones.delete(notificationId)
                .catch(function (error) {
                    console.error('❌ Error al eliminar notificación:', error);
                });

            // Actualizar vista
            notifCtrl.updateFromService();

            notifCtrl.showSuccess('Notificación eliminada correctamente');
        }
    };

    /**
     * Limpiar todas las notificaciones
     */
    notifCtrl.clearAll = function () {
        if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones? Esta acción no se puede deshacer.')) {
            // Limpiar en el servicio
            NotificationService.clearAll();

            // Actualizar vista
            notifCtrl.updateFromService();

            notifCtrl.showSuccess('Todas las notificaciones han sido eliminadas');
        }
    };

    /**
     * Ver detalles de notificación
     */
    notifCtrl.viewDetails = function (notification) {
        notifCtrl.selectedNotification = notification;

        // Mostrar modal usando Bootstrap
        const modal = new bootstrap.Modal(document.getElementById('notificationDetailsModal'));
        modal.show();
    };

    /**
     * Enviar notificación de prueba
     */
    notifCtrl.sendTestNotification = function () {
        notifCtrl.loading = true;

        NotificationService.sendTestNotification()
            .then(function (response) {
                if (response.data.success) {
                    notifCtrl.showSuccess('Notificación de prueba enviada correctamente');
                } else {
                    notifCtrl.showError('Error al enviar notificación de prueba');
                }
            })
            .catch(function (error) {
                console.error('❌ Error al enviar notificación de prueba:', error);
                notifCtrl.showError('Error al enviar notificación de prueba');
            })
            .finally(function () {
                notifCtrl.loading = false;
            });
    };

    /**
     * Obtener texto del estado de conexión
     */
    notifCtrl.getConnectionStatusText = function () {
        switch (notifCtrl.connectionStatus) {
            case 'connected':
                return 'Conectado';
            case 'connecting':
                return 'Conectando...';
            case 'disconnected':
                return 'Desconectado';
            case 'error':
                return 'Error de conexión';
            case 'failed':
                return 'Conexión fallida';
            default:
                return 'Desconocido';
        }
    };

    /**
     * Obtener icono de notificación
     */
    notifCtrl.getNotificationIcon = function (type) {
        switch (type) {
            case 'success':
                return 'bi-check-circle-fill text-success';
            case 'warning':
                return 'bi-exclamation-triangle-fill text-warning';
            case 'error':
                return 'bi-x-circle-fill text-danger';
            default:
                return 'bi-info-circle-fill text-info';
        }
    };

    /**
     * Obtener clase de badge para notificación
     */
    notifCtrl.getNotificationBadgeClass = function (type) {
        switch (type) {
            case 'success':
                return 'bg-success';
            case 'warning':
                return 'bg-warning';
            case 'error':
                return 'bg-danger';
            default:
                return 'bg-info';
        }
    };

    /**
     * Obtener texto del tipo de notificación
     */
    notifCtrl.getNotificationTypeText = function (type) {
        switch (type) {
            case 'success':
                return 'Éxito';
            case 'warning':
                return 'Advertencia';
            case 'error':
                return 'Error';
            default:
                return 'Información';
        }
    };

    /**
     * Mostrar notificación toast
     */
    notifCtrl.showToast = function (notification) {
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
        }
    };

    /**
     * Mostrar mensaje de éxito
     */
    notifCtrl.showSuccess = function (message) {
        if (window.toastr) {
            toastr.success(message);
        } else {
            alert(message);
        }
    };

    /**
     * Mostrar mensaje de error
     */
    notifCtrl.showError = function (message) {
        if (window.toastr) {
            toastr.error(message);
        } else {
            alert(message);
        }
    };

    /**
     * Actualizar contador de no leídas
     */
    notifCtrl.updateUnreadCount = function () {
        notifCtrl.unreadCount = notifCtrl.notifications.filter(n => !n.read).length;
    };

    // Inicializar el controlador
    notifCtrl.init();
}]);