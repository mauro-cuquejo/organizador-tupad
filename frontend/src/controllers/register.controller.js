(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('RegisterController', ['$scope', '$rootScope', '$location', 'AuthService', 'NotificationService', function ($scope, $rootScope, $location, AuthService, NotificationService) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.registerPasswordVisible = false;
            vm.confirmPasswordVisible = false;
            vm.formData = {
                nombre: '',
                apellido: '',
                email: '',
                password: '',
                confirmPassword: '',
                rol: 'estudiante',
                acceptTerms: false
            };

            // Roles disponibles para registro público
            vm.roles = [
                { value: 'estudiante', label: 'Estudiante' },
                { value: 'profesor', label: 'Profesor' }
            ];

            // Inicialización
            vm.init = function () {
                console.log('📝 Inicializando RegisterController...');
            };

            // Registro
            vm.register = function () {
                if (!vm.validateForm()) {
                    return;
                }

                vm.loading = true;
                $rootScope.loading = true;

                const userData = {
                    nombre: vm.formData.nombre,
                    apellido: vm.formData.apellido,
                    email: vm.formData.email,
                    password: vm.formData.password,
                    rol: vm.formData.rol
                };

                AuthService.register(userData)
                    .then(function (response) {
                        NotificationService.success('Registro exitoso. Por favor, inicia sesión.');
                        $location.path('/login');
                    })
                    .catch(function (error) {
                        NotificationService.error('Error en el registro: ' + (error.message || 'No se pudo completar el registro'));
                    })
                    .finally(function () {
                        vm.loading = false;
                        $rootScope.loading = false;
                    });
            };

            // Validar formulario
            vm.validateForm = function () {
                if (!vm.formData.nombre) {
                    NotificationService.warning('Por favor, ingresa tu nombre');
                    return false;
                }
                if (!vm.formData.apellido) {
                    NotificationService.warning('Por favor, ingresa tu apellido');
                    return false;
                }
                if (!vm.formData.email) {
                    NotificationService.warning('Por favor, ingresa tu correo electrónico');
                    return false;
                }
                if (!vm.isValidEmail(vm.formData.email)) {
                    NotificationService.warning('Por favor, ingresa un correo electrónico válido');
                    return false;
                }
                if (!vm.formData.password) {
                    NotificationService.warning('Por favor, ingresa una contraseña');
                    return false;
                }
                if (vm.formData.password.length < 6) {
                    NotificationService.warning('La contraseña debe tener al menos 6 caracteres');
                    return false;
                }
                if (vm.formData.password !== vm.formData.confirmPassword) {
                    NotificationService.warning('Las contraseñas no coinciden');
                    return false;
                }
                if (!vm.formData.acceptTerms) {
                    NotificationService.warning('Debes aceptar los términos y condiciones');
                    return false;
                }
                return true;
            };

            // Mostrar/ocultar contraseña
            vm.togglePasswordVisibility = function (field) {
                if (field === 'password') {
                    vm.registerPasswordVisible = !vm.registerPasswordVisible;
                    const inputElement = document.getElementById('password');
                    if (inputElement) {
                        inputElement.type = vm.registerPasswordVisible ? 'text' : 'password';
                    }
                } else if (field === 'confirmPassword') {
                    vm.confirmPasswordVisible = !vm.confirmPasswordVisible;
                    const inputElement = document.getElementById('confirmPassword');
                    if (inputElement) {
                        inputElement.type = vm.confirmPasswordVisible ? 'text' : 'password';
                    }
                }
            };

            // Verificar fortaleza de contraseña
            vm.getPasswordStrength = function (password) {
                if (!password) return { score: 0, label: '', class: '' };

                let score = 0;
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

            // Validar email
            vm.isValidEmail = function (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };

            // Limpiar formulario
            vm.clearForm = function () {
                vm.formData = {
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    rol: 'estudiante',
                    acceptTerms: false
                };
            };

            // Inicializar controlador
            vm.init();

        }]);
})();
