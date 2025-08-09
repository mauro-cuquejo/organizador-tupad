(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('AuthController', ['$scope', '$rootScope', '$location', '$routeParams', 'AuthService', 'NotificationService', 'StorageService', function ($scope, $rootScope, $location, $routeParams, AuthService, NotificationService, StorageService) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.currentView = 'login'; // login, register, forgot-password
            vm.passwordVisible = false; // Para mostrar/ocultar contraseña en login
            vm.registerPasswordVisible = false; // Para mostrar/ocultar contraseña en registro
            vm.confirmPasswordVisible = false; // Para mostrar/ocultar confirmación de contraseña
            vm.formData = {
                login: {
                    email: 'admin@tupad.edu.ar',
                    password: 'AdminTupad2024!',
                    rememberMe: false
                },
                register: {
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    rol: 'estudiante'
                },
                forgotPassword: {
                    email: ''
                }
            };

            // Roles disponibles para registro público (sin administrador)
            vm.roles = [
                { value: 'estudiante', label: 'Estudiante' },
                { value: 'profesor', label: 'Profesor' }
            ];

            // Roles completos (solo para administradores)
            vm.allRoles = [
                { value: 'estudiante', label: 'Estudiante' },
                { value: 'profesor', label: 'Profesor' },
                { value: 'admin', label: 'Administrador' }
            ];

            // Inicialización - simplificada para evitar duplicaciones
            vm.init = function () {
                // Solo determinar la vista actual
                vm.determineView();
            };

            // Determinar vista actual
            vm.determineView = function () {
                const path = $location.path();
                if (path === '/register') {
                    vm.currentView = 'register';
                } else if (path === '/forgot-password') {
                    vm.currentView = 'forgot-password';
                } else {
                    vm.currentView = 'login';
                }
            };



            // Login - simplificado
            vm.login = function () {
                if (!vm.formData.login.email || !vm.formData.login.password) {
                    alert('Por favor, completa todos los campos');
                    return;
                }

                $rootScope.loading = true;

                AuthService.login({
                    email: vm.formData.login.email,
                    password: vm.formData.login.password
                })
                    .then(function (response) {
                        console.log('Login exitoso:', response);
                        $location.path('/dashboard');
                    })
                    .catch(function (error) {
                        console.error('Error en login:', error);
                        alert('Error en el inicio de sesión: ' + (error.message || 'Credenciales inválidas'));
                    })
                    .finally(function () {
                        $rootScope.loading = false;
                    });
            };

            // Registro
            vm.register = function () {
                if (!vm.validateRegisterForm()) {
                    return;
                }

                $rootScope.loading = true;

                const userData = {
                    nombre: vm.formData.register.nombre,
                    apellido: vm.formData.register.apellido,
                    email: vm.formData.register.email,
                    password: vm.formData.register.password,
                    rol: vm.formData.register.rol
                };

                AuthService.register(userData)
                    .then(function (response) {
                        NotificationService.success('Registro exitoso. Por favor, inicia sesión.');
                        vm.currentView = 'login';
                        vm.clearRegisterForm();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error en el registro: ' + (error.message || 'No se pudo completar el registro'));
                    })
                    .finally(function () {
                        $rootScope.loading = false;
                    });
            };

            // Recuperar contraseña
            vm.forgotPassword = function () {
                if (!vm.validateForgotPasswordForm()) {
                    return;
                }

                $rootScope.loading = true;

                AuthService.forgotPassword(vm.formData.forgotPassword.email)
                    .then(function (response) {
                        NotificationService.success('Se ha enviado un enlace de recuperación a tu correo electrónico.');
                        vm.currentView = 'login';
                        vm.clearForgotPasswordForm();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al enviar el enlace de recuperación: ' + (error.message || 'No se pudo enviar el correo'));
                    })
                    .finally(function () {
                        $rootScope.loading = false;
                    });
            };



            vm.validateRegisterForm = function () {
                if (!vm.formData.register.nombre) {
                    NotificationService.warning('Por favor, ingresa tu nombre');
                    return false;
                }
                if (!vm.formData.register.apellido) {
                    NotificationService.warning('Por favor, ingresa tu apellido');
                    return false;
                }
                if (!vm.formData.register.email) {
                    NotificationService.warning('Por favor, ingresa tu correo electrónico');
                    return false;
                }
                if (!vm.isValidEmail(vm.formData.register.email)) {
                    NotificationService.warning('Por favor, ingresa un correo electrónico válido');
                    return false;
                }
                if (!vm.formData.register.password) {
                    NotificationService.warning('Por favor, ingresa una contraseña');
                    return false;
                }
                if (vm.formData.register.password.length < 6) {
                    NotificationService.warning('La contraseña debe tener al menos 6 caracteres');
                    return false;
                }
                if (vm.formData.register.password !== vm.formData.register.confirmPassword) {
                    NotificationService.warning('Las contraseñas no coinciden');
                    return false;
                }
                return true;
            };

            vm.validateForgotPasswordForm = function () {
                if (!vm.formData.forgotPassword.email) {
                    NotificationService.warning('Por favor, ingresa tu correo electrónico');
                    return false;
                }
                if (!vm.isValidEmail(vm.formData.forgotPassword.email)) {
                    NotificationService.warning('Por favor, ingresa un correo electrónico válido');
                    return false;
                }
                return true;
            };

            // Validar email


            // Limpiar formularios
            vm.clearLoginForm = function () {
                vm.formData.login = {
                    email: '',
                    password: '',
                    rememberMe: false
                };
            };

            vm.clearRegisterForm = function () {
                vm.formData.register = {
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    rol: 'estudiante'
                };
            };

            vm.clearForgotPasswordForm = function () {
                vm.formData.forgotPassword = {
                    email: ''
                };
            };

            // Navegación entre vistas
            vm.showLogin = function () {
                vm.currentView = 'login';
                $location.path('/login');
            };

            vm.showRegister = function () {
                vm.currentView = 'register';
                $location.path('/register');
            };

            vm.showForgotPassword = function () {
                vm.currentView = 'forgot-password';
                $location.path('/forgot-password');
            };

            // Verificar fortaleza de contraseña
            vm.getPasswordStrength = function (password) {
                if (!password) return { score: 0, label: '', class: '' };

                let score = 0;
                let feedback = [];

                if (password.length >= 6) score++;
                if (password.length >= 8) score++;
                if (/[a-z]/.test(password)) score++;
                if (/[A-Z]/.test(password)) score++;
                if (/[0-9]/.test(password)) score++;
                if (/[^A-Za-z0-9]/.test(password)) score++;

                let label, cssClass;
                if (score <= 2) {
                    label = 'Débil';
                    cssClass = 'text-danger';
                } else if (score <= 4) {
                    label = 'Media';
                    cssClass = 'text-warning';
                } else {
                    label = 'Fuerte';
                    cssClass = 'text-success';
                }

                return { score: score, label: label, class: cssClass };
            };

            // Mostrar/ocultar contraseña - simplificado
            vm.togglePasswordVisibility = function () {
                vm.passwordVisible = !vm.passwordVisible;
                const inputElement = document.getElementById('password');
                if (inputElement) {
                    inputElement.type = vm.passwordVisible ? 'text' : 'password';
                }
            };

            // Inicializar controlador (al final, después de definir todas las funciones)
            vm.init();

        }]);
})();