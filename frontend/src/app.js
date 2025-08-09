(function () {
    'use strict';

    // Configuración de la aplicación
    angular.module('tupadApp', [
        'ngRoute',
        'ngSanitize',
        'ngAnimate',
        'ngMessages',
        'ngCookies',
        'LocalStorageModule',
        'ngFileUpload',
        'toastr',
        'angularMoment'
    ])

        // Configuración de moment.js (configuración directa)
        .run(['$injector', function ($injector) {
            // Configurar moment.js directamente si está disponible
            if (typeof moment !== 'undefined') {
                moment.locale('es');
            }
        }])

        // Configuración de rutas
        .config(['$routeProvider', '$locationProvider', 'localStorageServiceProvider', 'toastrConfig', function ($routeProvider, $locationProvider, localStorageServiceProvider, toastrConfig) {

            // Configuración de localStorage
            localStorageServiceProvider
                .setPrefix('tupadApp')
                .setStorageType('localStorage');

            // Configuración de toastr
            angular.extend(toastrConfig, {
                timeOut: 4000,
                extendedTimeOut: 2000,
                closeButton: true,
                progressBar: true,
                positionClass: 'toast-top-right'
            });

            // Configuración de location (hash mode por defecto)
            $locationProvider.hashPrefix('');

            // Configuración de rutas
            $routeProvider
                .when('/login', {
                    templateUrl: 'src/views/auth/login.html',
                    controller: 'LoginController',
                    controllerAs: 'loginCtrl'
                })
                .when('/register', {
                    templateUrl: 'src/views/auth/register.html',
                    controller: 'RegisterController',
                    controllerAs: 'registerCtrl'
                })
                .when('/dashboard', {
                    templateUrl: 'src/views/dashboard/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'dashboardCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/horarios', {
                    templateUrl: 'src/views/horarios/horarios.html',
                    controller: 'HorariosController',
                    controllerAs: 'horariosCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/materias', {
                    templateUrl: 'src/views/materias/materias.html',
                    controller: 'MateriasController',
                    controllerAs: 'materiasCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/contenidos', {
                    templateUrl: 'src/views/contenidos/contenidos.html',
                    controller: 'ContenidosController',
                    controllerAs: 'contenidosCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/evaluaciones', {
                    templateUrl: 'src/views/evaluaciones/evaluaciones.html',
                    controller: 'EvaluacionesController',
                    controllerAs: 'evaluacionesCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/profesores', {
                    templateUrl: 'src/views/profesores/profesores.html',
                    controller: 'ProfesoresController',
                    controllerAs: 'profesoresCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/perfil', {
                    templateUrl: 'src/views/perfil/perfil.html',
                    controller: 'PerfilController',
                    controllerAs: 'perfilCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/estadisticas', {
                    templateUrl: 'src/views/estadisticas/estadisticas.html',
                    controller: 'EstadisticasController',
                    controllerAs: 'statsCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/notificaciones', {
                    templateUrl: 'src/views/notificaciones/notificaciones.html',
                    controller: 'NotificacionesController',
                    controllerAs: 'notifCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .when('/admin/usuarios', {
                    templateUrl: 'src/views/admin/usuarios.html',
                    controller: 'AdminController',
                    controllerAs: 'adminCtrl',
                    resolve: {
                        auth: ['AuthService', function (AuthService) {
                            return AuthService.checkAuth();
                        }]
                    }
                })
                .otherwise({
                    redirectTo: '/dashboard'
                });

            // Configuración de location
            $locationProvider.hashPrefix('');
        }])

        // Configuración de interceptores HTTP
        .config(['$httpProvider', 'localStorageServiceProvider', function ($httpProvider, localStorageServiceProvider) {
            // Interceptor para agregar token de autenticación
            $httpProvider.interceptors.push(['localStorageService', '$q', function (localStorageService, $q) {
                return {
                    request: function (config) {
                        const token = localStorageService.get('tupadApp.authToken');
                        if (token) {
                            config.headers.Authorization = 'Bearer ' + token;
                        }
                        return config;
                    },
                    responseError: function (rejection) {
                        if (rejection.status === 401) {
                            // Limpiar datos de autenticación
                            localStorageService.remove('tupadApp.authToken');
                            localStorageService.remove('tupadApp.currentUser');
                            window.location.hash = '#/login';
                        }
                        return $q.reject(rejection);
                    }
                };
            }]);
        }])

        // Configuración global de la aplicación
        .run(['$rootScope', '$location', 'AuthService', 'ThemeService', 'NotificationService', 'AdBlockDetectorService', function ($rootScope, $location, AuthService, ThemeService, NotificationService, AdBlockDetectorService) {

            // Configuración global
            $rootScope.appName = 'TUPAD Organizador Académico';
            $rootScope.appVersion = '1.0.0';

            // Inicializar tema
            ThemeService.init();

            // Configurar notificaciones
            NotificationService.initialize();

            // Eventos globales - Simplificados para evitar conflictos de loading
            $rootScope.$on('$routeChangeStart', function (event, next, current) {
                console.log('🔄 Cambio de ruta iniciado:', next.originalPath || next.$$route?.originalPath);
            });

            $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                console.log('✅ Cambio de ruta completado:', current.originalPath || current.$$route?.originalPath);
            });

            $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
                console.error('❌ Error en cambio de ruta:', rejection);

                // Si el error es de autenticación, redirigir al login
                if (rejection === 'No autenticado' ||
                    rejection === 'No autorizado' ||
                    rejection === 'Unauthorized' ||
                    (typeof rejection === 'string' && rejection.toLowerCase().includes('autenticado'))) {

                    console.log('Usuario no autenticado, redirigiendo al login...');

                    // Mostrar notificación informativa
                    if (NotificationService && typeof NotificationService.info === 'function') {
                        NotificationService.info('Por favor, inicia sesión para continuar', 'Sesión requerida');
                    }

                    // Redirigir al login
                    window.location.hash = '#/login';
                }
            });

            // Eventos de autenticación
            $rootScope.$on('auth:login', function (event, user) {
                $rootScope.user = user;
                $rootScope.isAuthenticated = true;
            });

            $rootScope.$on('auth:logout', function () {
                $rootScope.user = null;
                $rootScope.isAuthenticated = false;
            });

            // Eventos de tema
            $rootScope.$on('theme:changed', function (event, theme) {
                $rootScope.currentTheme = theme;
            });

            // Inicializar estado de autenticación
            if (AuthService.isAuthenticated()) {
                $rootScope.user = AuthService.getUser();
                $rootScope.isAuthenticated = true;
            }

            // Inicializar detección de bloqueadores
            AdBlockDetectorService.init().then(function (result) {
                if (result.detected) {
                    console.warn('🚫 Bloqueador de anuncios detectado - Sistema funcionando en modo fallback');
                    // Mostrar notificación al usuario
                    if (NotificationService && typeof NotificationService.info === 'function') {
                        NotificationService.info('Sistema funcionando en modo compatible con bloqueadores de anuncios', 'Modo Fallback');
                    }
                }
            });

            // Inicializar AuthService
            AuthService.init();
        }]);

})();