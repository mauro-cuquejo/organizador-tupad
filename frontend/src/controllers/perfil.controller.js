/**
 * Controlador para el perfil de usuario
 */
angular.module('tupadApp').controller('PerfilController', ['$scope', '$rootScope', 'AuthService', 'ThemeService', 'NotificationService', 'ApiService', function ($scope, $rootScope, AuthService, ThemeService, NotificationService, ApiService) {
    'use strict';

    const perfilCtrl = this;

    // Estado del controlador
    perfilCtrl.loading = false;
    perfilCtrl.saving = false;
    perfilCtrl.currentUser = null;
    perfilCtrl.themes = [];
    perfilCtrl.currentTheme = '';
    perfilCtrl.themeName = '';
    perfilCtrl.themeIcon = '';

    // Formulario de perfil
    perfilCtrl.profileForm = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        departamento: '',
        cargo: '',
        bio: ''
    };

    // Formulario de cambio de contraseña
    perfilCtrl.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    // Configuraciones de notificaciones
    perfilCtrl.notificationSettings = {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        deadlineReminders: true,
        evaluationAlerts: true
    };

    // Configuraciones de interfaz
    perfilCtrl.interfaceSettings = {
        compactMode: false,
        showAnimations: true,
        autoRefresh: true,
        refreshInterval: 30
    };

    // Inicializar controlador
    perfilCtrl.init = function () {
        perfilCtrl.loadCurrentUser();
        perfilCtrl.loadThemes();
        perfilCtrl.loadSettings();
    };

    // Cargar usuario actual
    perfilCtrl.loadCurrentUser = function () {
        perfilCtrl.loading = true;

        AuthService.getCurrentUser()
            .then(function (user) {
                perfilCtrl.currentUser = user;
                perfilCtrl.profileForm = {
                    nombre: user.nombre || '',
                    apellido: user.apellido || '',
                    email: user.email || '',
                    telefono: user.telefono || '',
                    departamento: user.departamento || '',
                    cargo: user.cargo || '',
                    bio: user.bio || ''
                };
            })
            .catch(function (error) {
                console.error('Error al cargar usuario:', error);
                NotificationService.error('Error al cargar información del perfil');
            })
            .finally(function () {
                perfilCtrl.loading = false;
            });
    };

    // Cargar temas disponibles
    perfilCtrl.loadThemes = function () {
        perfilCtrl.themes = ThemeService.getAvailableThemes();
        perfilCtrl.currentTheme = ThemeService.getCurrentTheme();
        perfilCtrl.themeName = ThemeService.getThemeName();
        perfilCtrl.themeIcon = ThemeService.getThemeIcon();
    };

    // Cargar configuraciones guardadas
    perfilCtrl.loadSettings = function () {
        // Cargar configuraciones de notificaciones
        const savedNotifications = localStorage.getItem('notificationSettings');
        if (savedNotifications) {
            perfilCtrl.notificationSettings = JSON.parse(savedNotifications);
        }

        // Cargar configuraciones de interfaz
        const savedInterface = localStorage.getItem('interfaceSettings');
        if (savedInterface) {
            perfilCtrl.interfaceSettings = JSON.parse(savedInterface);
        }
    };

    // Cambiar tema
    perfilCtrl.changeTheme = function (theme) {
        if (ThemeService.setTheme(theme)) {
            perfilCtrl.currentTheme = theme;
            perfilCtrl.themeName = ThemeService.getThemeName();
            perfilCtrl.themeIcon = ThemeService.getThemeIcon();
            NotificationService.success('Tema cambiado correctamente');
        } else {
            NotificationService.error('Error al cambiar el tema');
        }
    };

    // Alternar tema
    perfilCtrl.toggleTheme = function () {
        if (ThemeService.toggleTheme()) {
            perfilCtrl.currentTheme = ThemeService.getCurrentTheme();
            perfilCtrl.themeName = ThemeService.getThemeName();
            perfilCtrl.themeIcon = ThemeService.getThemeIcon();
            NotificationService.success('Tema alternado correctamente');
        }
    };

    // Guardar perfil
    perfilCtrl.saveProfile = function () {
        if (!perfilCtrl.validateProfileForm()) {
            return;
        }

        perfilCtrl.saving = true;

        ApiService.auth.updateProfile(perfilCtrl.profileForm)
            .then(function (response) {
                perfilCtrl.currentUser = response.data;
                AuthService.updateCurrentUser(response.data);
                NotificationService.success('Perfil actualizado correctamente');
            })
            .catch(function (error) {
                console.error('Error al actualizar perfil:', error);
                NotificationService.error('Error al actualizar el perfil');
            })
            .finally(function () {
                perfilCtrl.saving = false;
            });
    };

    // Validar formulario de perfil
    perfilCtrl.validateProfileForm = function () {
        if (!perfilCtrl.profileForm.nombre || !perfilCtrl.profileForm.apellido) {
            NotificationService.error('El nombre y apellido son obligatorios');
            return false;
        }

        if (!perfilCtrl.profileForm.email) {
            NotificationService.error('El email es obligatorio');
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(perfilCtrl.profileForm.email)) {
            NotificationService.error('El formato del email no es válido');
            return false;
        }

        return true;
    };

    // Cambiar contraseña
    perfilCtrl.changePassword = function () {
        if (!perfilCtrl.validatePasswordForm()) {
            return;
        }

        perfilCtrl.saving = true;

        const passwordData = {
            currentPassword: perfilCtrl.passwordForm.currentPassword,
            newPassword: perfilCtrl.passwordForm.newPassword
        };

        ApiService.auth.changePassword(passwordData)
            .then(function (response) {
                NotificationService.success('Contraseña cambiada correctamente');
                perfilCtrl.resetPasswordForm();
            })
            .catch(function (error) {
                console.error('Error al cambiar contraseña:', error);
                if (error.status === 400) {
                    NotificationService.error('La contraseña actual es incorrecta');
                } else {
                    NotificationService.error('Error al cambiar la contraseña');
                }
            })
            .finally(function () {
                perfilCtrl.saving = false;
            });
    };

    // Validar formulario de contraseña
    perfilCtrl.validatePasswordForm = function () {
        if (!perfilCtrl.passwordForm.currentPassword) {
            NotificationService.error('La contraseña actual es obligatoria');
            return false;
        }

        if (!perfilCtrl.passwordForm.newPassword) {
            NotificationService.error('La nueva contraseña es obligatoria');
            return false;
        }

        if (perfilCtrl.passwordForm.newPassword.length < 8) {
            NotificationService.error('La nueva contraseña debe tener al menos 8 caracteres');
            return false;
        }

        if (perfilCtrl.passwordForm.newPassword !== perfilCtrl.passwordForm.confirmPassword) {
            NotificationService.error('Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    // Resetear formulario de contraseña
    perfilCtrl.resetPasswordForm = function () {
        perfilCtrl.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    };

    // Guardar configuraciones de notificaciones
    perfilCtrl.saveNotificationSettings = function () {
        localStorage.setItem('notificationSettings', JSON.stringify(perfilCtrl.notificationSettings));
        NotificationService.success('Configuraciones de notificaciones guardadas');
    };

    // Guardar configuraciones de interfaz
    perfilCtrl.saveInterfaceSettings = function () {
        localStorage.setItem('interfaceSettings', JSON.stringify(perfilCtrl.interfaceSettings));

        // Aplicar configuraciones inmediatamente
        $rootScope.$broadcast('interfaceSettingsChanged', perfilCtrl.interfaceSettings);

        NotificationService.success('Configuraciones de interfaz guardadas');
    };

    // Exportar datos del usuario
    perfilCtrl.exportUserData = function () {
        perfilCtrl.loading = true;

        ApiService.auth.exportUserData()
            .then(function (response) {
                // Crear y descargar archivo
                const dataStr = JSON.stringify(response, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                window.URL.revokeObjectURL(url);

                NotificationService.success('Datos exportados correctamente');
            })
            .catch(function (error) {
                console.error('Error al exportar datos:', error);
                NotificationService.error('Error al exportar los datos');
            })
            .finally(function () {
                perfilCtrl.loading = false;
            });
    };

    // Eliminar cuenta
    perfilCtrl.deleteAccount = function () {
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            perfilCtrl.loading = true;

            ApiService.auth.deleteAccount()
                .then(function (response) {
                    NotificationService.success('Cuenta eliminada correctamente');
                    AuthService.logout();
                    $rootScope.$broadcast('userDeleted');
                })
                .catch(function (error) {
                    console.error('Error al eliminar cuenta:', error);
                    NotificationService.error('Error al eliminar la cuenta');
                })
                .finally(function () {
                    perfilCtrl.loading = false;
                });
        }
    };

    // Obtener iniciales del usuario
    perfilCtrl.getUserInitials = function () {
        if (!perfilCtrl.currentUser) return '';

        const nombre = perfilCtrl.currentUser.nombre || '';
        const apellido = perfilCtrl.currentUser.apellido || '';

        return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    };

    // Obtener nombre completo
    perfilCtrl.getFullName = function () {
        if (!perfilCtrl.currentUser) return '';

        const nombre = perfilCtrl.currentUser.nombre || '';
        const apellido = perfilCtrl.currentUser.apellido || '';

        return `${nombre} ${apellido}`.trim();
    };

    // Obtener tiempo desde el registro
    perfilCtrl.getTimeSinceRegistration = function () {
        if (!perfilCtrl.currentUser || !perfilCtrl.currentUser.createdAt) {
            return '';
        }

        const now = new Date();
        const created = new Date(perfilCtrl.currentUser.createdAt);
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return '1 día';
        } else if (diffDays < 30) {
            return `${diffDays} días`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} mes${months > 1 ? 'es' : ''}`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} año${years > 1 ? 's' : ''}`;
        }
    };

    // Verificar si el tema es automático
    perfilCtrl.isAutoTheme = function () {
        return perfilCtrl.currentTheme === 'auto';
    };

    // Verificar si es modo oscuro
    perfilCtrl.isDarkMode = function () {
        return ThemeService.isDarkMode();
    };

    // Obtener estadísticas del usuario
    perfilCtrl.getUserStats = function () {
        if (!perfilCtrl.currentUser) return {};

        return {
            materias: perfilCtrl.currentUser.materiasCount || 0,
            evaluaciones: perfilCtrl.currentUser.evaluacionesCount || 0,
            contenidos: perfilCtrl.currentUser.contenidosCount || 0,
            profesores: perfilCtrl.currentUser.profesoresCount || 0
        };
    };

    // Inicializar controlador
    perfilCtrl.init();
}]);