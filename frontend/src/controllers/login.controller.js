(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('LoginController', ['$scope', '$rootScope', '$location', 'AuthService', 'NotificationService', function ($scope, $rootScope, $location, AuthService, NotificationService) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.passwordVisible = false;
            vm.formData = {
                email: 'admin@tupad.edu.ar',
                password: 'AdminTupad2024!',
                rememberMe: false
            };

            // Inicialización
            vm.init = function () {
                console.log('🔐 Inicializando LoginController...');
            };

            // Login
            vm.login = function () {
                if (!vm.formData.email || !vm.formData.password) {
                    NotificationService.warning('Por favor, completa todos los campos');
                    return;
                }

                vm.loading = true;
                $rootScope.loading = true;

                AuthService.login({
                    email: vm.formData.email,
                    password: vm.formData.password
                })
                    .then(function (response) {
                        console.log('Login exitoso:', response);
                        $location.path('/dashboard');
                    })
                    .catch(function (error) {
                        console.error('Error en login:', error);
                        NotificationService.error('Error en el inicio de sesión: ' + (error.message || 'Credenciales inválidas'));
                    })
                    .finally(function () {
                        vm.loading = false;
                        $rootScope.loading = false;
                    });
            };

            // Mostrar/ocultar contraseña
            vm.togglePasswordVisibility = function () {
                vm.passwordVisible = !vm.passwordVisible;
                const inputElement = document.getElementById('password');
                if (inputElement) {
                    inputElement.type = vm.passwordVisible ? 'text' : 'password';
                }
            };

            // Validar email
            vm.isValidEmail = function (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };

            // Limpiar formulario
            vm.clearForm = function () {
                vm.formData = {
                    email: '',
                    password: '',
                    rememberMe: false
                };
            };

            // Inicializar controlador
            vm.init();

        }]);
})();
