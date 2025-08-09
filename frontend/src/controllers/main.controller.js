(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('MainController', ['$scope', '$rootScope', '$location', 'AuthService', 'ThemeService', 'NotificationService', 'StorageService', function ($scope, $rootScope, $location, AuthService, ThemeService, NotificationService, StorageService) {

            var vm = this;

            // Propiedades del controlador
            vm.isAuthenticated = false;
            vm.user = null;
            vm.currentTheme = 'light';
            vm.themeName = 'Claro';
            vm.themeIcon = 'bi-sun';
            vm.appName = 'TUPAD Organizador Académico';
            vm.unreadNotifications = 0;

            // Inicialización
            vm.init = function () {
                console.log('🔧 Inicializando MainController...');
                vm.checkAuthStatus();
                vm.loadTheme();
                vm.loadUserPreferences();

                // Exponer $rootScope.loading al scope del template
                $scope.loading = $rootScope.loading || false;
                console.log('🔧 Loading inicial:', $scope.loading);

                // Forzar desactivación del loading después de la inicialización
                setTimeout(function () {
                    $rootScope.loading = false;
                    $scope.loading = false;
                    console.log('🔧 Loading forzado a false');
                    $scope.$apply();
                }, 100);
            };

            // Verificar estado de autenticación
            vm.checkAuthStatus = function () {
                vm.isAuthenticated = AuthService.isAuthenticated();
                if (vm.isAuthenticated) {
                    vm.user = AuthService.getUser();
                }
            };

            // Cargar tema
            vm.loadTheme = function () {
                vm.currentTheme = ThemeService.getCurrentTheme();
                vm.themeName = ThemeService.getThemeName();
                vm.themeIcon = ThemeService.getThemeIcon();
                $scope.currentTheme = vm.currentTheme;
            };

            // Cargar preferencias del usuario
            vm.loadUserPreferences = function () {
                const preferences = StorageService.get('user_preferences', {});
                vm.userPreferences = preferences;
            };

            // Cambiar tema
            vm.toggleTheme = function () {
                if (ThemeService.toggleTheme()) {
                    vm.currentTheme = ThemeService.getCurrentTheme();
                    vm.themeName = ThemeService.getThemeName();
                    vm.themeIcon = ThemeService.getThemeIcon();
                    $scope.currentTheme = vm.currentTheme;

                    // Guardar preferencia
                    vm.userPreferences.theme = vm.currentTheme;
                    StorageService.set('user_preferences', vm.userPreferences);
                }
            };

            // Cerrar sesión
            vm.logout = function () {
                NotificationService.confirm(
                    '¿Estás seguro de que quieres cerrar sesión?',
                    'Confirmar cierre de sesión',
                    function (confirmed) {
                        if (confirmed) {
                            $rootScope.loading = true;
                            $scope.loading = true;
                            AuthService.logout()
                                .then(function () {
                                    vm.isAuthenticated = false;
                                    vm.user = null;
                                    NotificationService.success('Sesión cerrada correctamente');
                                    window.location.hash = '#/login';
                                })
                                .catch(function (error) {
                                    NotificationService.error('Error al cerrar sesión: ' + error.message);
                                })
                                .finally(function () {
                                    $rootScope.loading = false;
                                    $scope.loading = false;
                                });
                        }
                    }
                );
            };

            // Navegar a una ruta
            vm.navigateTo = function (route) {
                window.location.hash = '#' + route;
            };

            // Verificar permisos
            vm.hasPermission = function (permission) {
                if (!vm.user || !vm.user.rol) {
                    return false;
                }

                const permissions = {
                    'admin': ['all'],
                    'profesor': ['view_horarios', 'edit_materias', 'view_contenidos', 'edit_evaluaciones'],
                    'estudiante': ['view_horarios', 'view_materias', 'view_contenidos', 'view_evaluaciones']
                };

                const userPermissions = permissions[vm.user.rol] || [];
                return userPermissions.includes('all') || userPermissions.includes(permission);
            };

            // Verificar si es admin
            vm.isAdmin = function () {
                return vm.user && vm.user.rol === 'admin';
            };

            // Verificar si es profesor
            vm.isProfesor = function () {
                return vm.user && (vm.user.rol === 'profesor' || vm.user.rol === 'admin');
            };

            // Verificar si es estudiante
            vm.isEstudiante = function () {
                return vm.user && vm.user.rol === 'estudiante';
            };

            // Obtener nombre completo del usuario
            vm.getFullName = function () {
                if (!vm.user) return '';
                return (vm.user.nombre || '') + ' ' + (vm.user.apellido || '');
            };

            // Obtener iniciales del usuario
            vm.getInitials = function () {
                if (!vm.user) return '';
                const nombre = vm.user.nombre || '';
                const apellido = vm.user.apellido || '';
                return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
            };

            // Mostrar/ocultar loading global
            vm.showLoading = function () {
                $rootScope.loading = true;
                $scope.loading = true;
                console.log('🔧 Loading activado:', $scope.loading);
            };

            vm.hideLoading = function () {
                $rootScope.loading = false;
                $scope.loading = false;
                console.log('🔧 Loading desactivado:', $scope.loading);
            };

            // Eventos de la aplicación
            $scope.$on('$routeChangeStart', function () {
                vm.showLoading();
            });

            $scope.$on('$routeChangeSuccess', function () {
                vm.hideLoading();
            });

            $scope.$on('$routeChangeError', function () {
                vm.hideLoading();
                NotificationService.error('Error al cargar la página');
            });

            // Eventos de autenticación
            $scope.$on('auth:login', function (event, user) {
                vm.isAuthenticated = true;
                vm.user = user;
                vm.loadUserPreferences();
            });

            $scope.$on('auth:logout', function () {
                vm.isAuthenticated = false;
                vm.user = null;
            });

            // Eventos de tema
            $scope.$on('themeChanged', function (event, data) {
                vm.currentTheme = data.theme;
                vm.themeName = ThemeService.getThemeName();
                vm.themeIcon = ThemeService.getThemeIcon();
                $scope.currentTheme = data.effectiveTheme;
            });

            // Eventos de notificaciones
            $scope.$on('notification:show', function (event, type, message, title) {
                NotificationService.show(type, message, title);
            });

            // Eventos de notificaciones en tiempo real
            $scope.$on('notifications:updated', function () {
                vm.unreadNotifications = NotificationService.unreadCount || 0;
            });

            $scope.$on('notifications:new', function (event, notification) {
                vm.unreadNotifications = NotificationService.unreadCount || 0;
            });

            // Watcher para mantener sincronizado el loading
            $scope.$watch('loading', function (newVal) {
                if (newVal !== $rootScope.loading) {
                    $rootScope.loading = newVal;
                }
            });

            $scope.$watch(function () { return $rootScope.loading; }, function (newVal) {
                if (newVal !== $scope.loading) {
                    $scope.loading = newVal;
                }
            });

            // Inicializar controlador (al final, después de definir todas las funciones)
            vm.init();

        }]);
})();