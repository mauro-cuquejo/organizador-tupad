(function () {
    'use strict';

    angular.module('tupadApp')
        .service('AuthService', ['$q', '$rootScope', 'localStorageService', 'ApiService', 'toastr', function ($q, $rootScope, localStorageService, ApiService, toastr) {

            const USER_KEY = 'tupadApp.currentUser';
            const TOKEN_KEY = 'tupadApp.authToken';

            let currentUser = null;
            let authToken = null;

            // Inicializar servicio
            function init() {
                console.log('🔐 Inicializando AuthService...');
                authToken = localStorageService.get(TOKEN_KEY);
                currentUser = localStorageService.get(USER_KEY);

                if (authToken && currentUser) {
                    console.log('✅ Usuario autenticado encontrado:', currentUser.email);
                    $rootScope.isAuthenticated = true;
                    $rootScope.user = currentUser;
                } else {
                    console.log('ℹ️ No hay usuario autenticado');
                }
            }

            // Login
            function login(credentials) {
                console.log('🔐 Intentando login para:', credentials.email);
                return ApiService.auth.login(credentials)
                    .then(function (response) {
                        if (response.token && response.user) {
                            setAuthData(response.token, response.user);
                            $rootScope.$broadcast('auth:login', response.user);
                            toastr.success('¡Bienvenido ' + response.user.nombre + '!');
                            console.log('✅ Login exitoso para:', response.user.email);
                            return response;
                        } else {
                            throw new Error('Respuesta de login inválida');
                        }
                    })
                    .catch(function (error) {
                        console.error('❌ Error en login:', error);
                        toastr.error('Error al iniciar sesión. Verifica tus credenciales.');
                        throw error;
                    });
            }

            // Registro
            function register(userData) {
                console.log('📝 Intentando registro para:', userData.email);
                return ApiService.auth.register(userData)
                    .then(function (response) {
                        if (response.token && response.user) {
                            setAuthData(response.token, response.user);
                            $rootScope.$broadcast('auth:login', response.user);
                            toastr.success('¡Registro exitoso! Bienvenido ' + response.user.nombre);
                            console.log('✅ Registro exitoso para:', response.user.email);
                            return response;
                        } else {
                            throw new Error('Respuesta de registro inválida');
                        }
                    })
                    .catch(function (error) {
                        console.error('❌ Error en registro:', error);
                        if (error.data && error.data.error) {
                            toastr.error(error.data.error);
                        } else {
                            toastr.error('Error al registrar usuario.');
                        }
                        throw error;
                    });
            }

            // Logout
            function logout() {
                console.log('🚪 Cerrando sesión...');
                clearAuthData();
                $rootScope.$broadcast('auth:logout');
                toastr.info('Sesión cerrada correctamente');
            }

            // Verificar autenticación
            function isAuthenticated() {
                return !!(authToken && currentUser);
            }

            // Obtener token
            function getToken() {
                return authToken;
            }

            // Obtener usuario actual
            function getUser() {
                return currentUser;
            }

            // Obtener perfil actualizado
            function getProfile() {
                return ApiService.auth.getProfile()
                    .then(function (user) {
                        currentUser = user;
                        localStorageService.set(USER_KEY, user);
                        $rootScope.user = user;
                        return user;
                    })
                    .catch(function (error) {
                        console.error('Error al obtener perfil:', error);
                        throw error;
                    });
            }

            // Actualizar perfil
            function updateProfile(profileData) {
                return ApiService.auth.updateProfile(profileData)
                    .then(function (user) {
                        currentUser = user;
                        localStorageService.set(USER_KEY, user);
                        $rootScope.user = user;
                        toastr.success('Perfil actualizado correctamente');
                        return user;
                    })
                    .catch(function (error) {
                        console.error('Error al actualizar perfil:', error);
                        toastr.error('Error al actualizar perfil');
                        throw error;
                    });
            }

            // Cambiar contraseña
            function changePassword(passwordData) {
                return ApiService.auth.changePassword(passwordData)
                    .then(function (response) {
                        toastr.success('Contraseña actualizada correctamente');
                        return response;
                    })
                    .catch(function (error) {
                        console.error('Error al cambiar contraseña:', error);
                        if (error.data && error.data.error) {
                            toastr.error(error.data.error);
                        } else {
                            toastr.error('Error al cambiar contraseña');
                        }
                        throw error;
                    });
            }

            // Obtener configuración de notificaciones
            function getNotificationConfig() {
                return ApiService.auth.getNotificationConfig()
                    .catch(function (error) {
                        console.error('Error al obtener configuración de notificaciones:', error);
                        // Retornar configuración por defecto
                        return {
                            email_notificaciones: true,
                            app_notificaciones: true
                        };
                    });
            }

            // Actualizar configuración de notificaciones
            function updateNotificationConfig(config) {
                return ApiService.auth.updateNotificationConfig(config)
                    .then(function (response) {
                        toastr.success('Configuración de notificaciones actualizada');
                        return response;
                    })
                    .catch(function (error) {
                        console.error('Error al actualizar configuración de notificaciones:', error);
                        toastr.error('Error al actualizar configuración');
                        throw error;
                    });
            }

            // Verificar autenticación (para route resolve)
            function checkAuth() {
                if (isAuthenticated()) {
                    return $q.resolve(currentUser);
                } else {
                    return $q.reject('No autenticado');
                }
            }

            // Establecer datos de autenticación
            function setAuthData(token, user) {
                authToken = token;
                currentUser = user;
                localStorageService.set(TOKEN_KEY, token);
                localStorageService.set(USER_KEY, user);
                $rootScope.isAuthenticated = true;
                $rootScope.user = user;
            }

            // Limpiar datos de autenticación
            function clearAuthData() {
                authToken = null;
                currentUser = null;
                localStorageService.remove(TOKEN_KEY);
                localStorageService.remove(USER_KEY);
                $rootScope.isAuthenticated = false;
                $rootScope.user = null;
            }

            // Verificar permisos de rol
            function hasRole(role) {
                return currentUser && currentUser.rol === role;
            }

            // Verificar si es admin
            function isAdmin() {
                return hasRole('admin');
            }

            // Verificar si es profesor
            function isProfesor() {
                return hasRole('profesor');
            }

            // Verificar si es estudiante
            function isEstudiante() {
                return hasRole('estudiante');
            }

            // Verificar si puede editar (admin o profesor)
            function canEdit() {
                return isAdmin() || isProfesor();
            }

            // Retornar métodos públicos
            return {
                init: init,
                login: login,
                register: register,
                logout: logout,
                isAuthenticated: isAuthenticated,
                getToken: getToken,
                getUser: getUser,
                getProfile: getProfile,
                updateProfile: updateProfile,
                changePassword: changePassword,
                getNotificationConfig: getNotificationConfig,
                updateNotificationConfig: updateNotificationConfig,
                checkAuth: checkAuth,
                hasRole: hasRole,
                isAdmin: isAdmin,
                isProfesor: isProfesor,
                isEstudiante: isEstudiante,
                canEdit: canEdit
            };
        }]);
})();