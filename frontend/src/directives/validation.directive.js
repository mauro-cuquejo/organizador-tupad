(function () {
    'use strict';

    angular.module('tupadApp')
        .directive('passwordStrength', function () {
            return {
                restrict: 'A',
                scope: {
                    password: '='
                },
                template: `
                    <div class="password-strength" ng-if="password">
                        <div class="strength-bar">
                            <div class="progress">
                                <div class="progress-bar"
                                     ng-class="getStrengthClass()"
                                     ng-style="{'width': getStrengthPercentage() + '%'}">
                                </div>
                            </div>
                        </div>
                        <div class="strength-text">
                            <small ng-class="getStrengthTextClass()">
                                {{ getStrengthText() }}
                            </small>
                        </div>
                        <div class="strength-requirements">
                            <ul class="list-unstyled small">
                                <li ng-class="{ 'text-success': hasLength, 'text-muted': !hasLength }">
                                    <i class="bi" ng-class="hasLength ? 'bi-check-circle' : 'bi-circle'"></i>
                                    Al menos 8 caracteres
                                </li>
                                <li ng-class="{ 'text-success': hasUppercase, 'text-muted': !hasUppercase }">
                                    <i class="bi" ng-class="hasUppercase ? 'bi-check-circle' : 'bi-circle'"></i>
                                    Al menos una mayúscula
                                </li>
                                <li ng-class="{ 'text-success': hasLowercase, 'text-muted': !hasLowercase }">
                                    <i class="bi" ng-class="hasLowercase ? 'bi-check-circle' : 'bi-circle'"></i>
                                    Al menos una minúscula
                                </li>
                                <li ng-class="{ 'text-success': hasNumber, 'text-muted': !hasNumber }">
                                    <i class="bi" ng-class="hasNumber ? 'bi-check-circle' : 'bi-circle'"></i>
                                    Al menos un número
                                </li>
                                <li ng-class="{ 'text-success': hasSpecial, 'text-muted': !hasSpecial }">
                                    <i class="bi" ng-class="hasSpecial ? 'bi-check-circle' : 'bi-circle'"></i>
                                    Al menos un carácter especial
                                </li>
                            </ul>
                        </div>
                    </div>
                `,
                link: function (scope) {
                    scope.$watch('password', function (newVal) {
                        if (newVal) {
                            scope.checkPasswordStrength();
                        }
                    });

                    scope.checkPasswordStrength = function () {
                        var password = scope.password;

                        scope.hasLength = password.length >= 8;
                        scope.hasUppercase = /[A-Z]/.test(password);
                        scope.hasLowercase = /[a-z]/.test(password);
                        scope.hasNumber = /\d/.test(password);
                        scope.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

                        var strength = 0;
                        if (scope.hasLength) strength += 20;
                        if (scope.hasUppercase) strength += 20;
                        if (scope.hasLowercase) strength += 20;
                        if (scope.hasNumber) strength += 20;
                        if (scope.hasSpecial) strength += 20;

                        scope.strength = strength;
                    };

                    scope.getStrengthPercentage = function () {
                        return scope.strength || 0;
                    };

                    scope.getStrengthClass = function () {
                        if (scope.strength >= 80) return 'bg-success';
                        if (scope.strength >= 60) return 'bg-warning';
                        if (scope.strength >= 40) return 'bg-info';
                        return 'bg-danger';
                    };

                    scope.getStrengthText = function () {
                        if (scope.strength >= 80) return 'Muy fuerte';
                        if (scope.strength >= 60) return 'Fuerte';
                        if (scope.strength >= 40) return 'Media';
                        if (scope.strength >= 20) return 'Débil';
                        return 'Muy débil';
                    };

                    scope.getStrengthTextClass = function () {
                        if (scope.strength >= 80) return 'text-success';
                        if (scope.strength >= 60) return 'text-warning';
                        if (scope.strength >= 40) return 'text-info';
                        return 'text-danger';
                    };
                }
            };
        })
        .directive('emailValidator', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$validators.email = function (value) {
                        if (!value) return true; // Permitir campo vacío si no es requerido

                        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(value);
                    };
                }
            };
        })
        .directive('phoneValidator', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$validators.phone = function (value) {
                        if (!value) return true;

                        var phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
                        return phoneRegex.test(value);
                    };
                }
            };
        })
        .directive('numberRange', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    min: '@',
                    max: '@'
                },
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$validators.range = function (value) {
                        if (!value) return true;

                        var num = parseFloat(value);
                        if (isNaN(num)) return false;

                        if (scope.min && num < parseFloat(scope.min)) return false;
                        if (scope.max && num > parseFloat(scope.max)) return false;

                        return true;
                    };
                }
            };
        })
        .directive('dateValidator', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$validators.date = function (value) {
                        if (!value) return true;

                        var moment = window.moment;
                        if (!moment) return true;

                        return moment(value).isValid();
                    };
                }
            };
        })
        .directive('uniqueValidator', function ($http) {
            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    uniqueUrl: '@',
                    currentId: '='
                },
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$asyncValidators.unique = function (value) {
                        if (!value) return Promise.resolve();

                        var url = scope.uniqueUrl + '?value=' + encodeURIComponent(value);
                        if (scope.currentId) {
                            url += '&exclude=' + scope.currentId;
                        }

                        return $http.get(url).then(function (response) {
                            if (response.data.exists) {
                                return Promise.reject('Ya existe');
                            }
                            return Promise.resolve();
                        });
                    };
                }
            };
        })
        .directive('formValidator', function () {
            return {
                restrict: 'A',
                scope: {
                    form: '=',
                    onSubmit: '&'
                },
                link: function (scope, element) {
                    element.on('submit', function (event) {
                        if (scope.form && scope.form.$invalid) {
                            event.preventDefault();

                            // Marcar todos los campos inválidos como tocados
                            angular.forEach(scope.form.$error, function (invalidFields, errorName) {
                                angular.forEach(invalidFields, function (field) {
                                    field.$setTouched();
                                });
                            });

                            // Mostrar el primer error
                            var firstError = element.find('.ng-invalid.ng-touched').first();
                            if (firstError.length) {
                                firstError.focus();
                            }

                            return false;
                        }

                        if (scope.onSubmit) {
                            scope.onSubmit();
                        }
                    });
                }
            };
        })
        .directive('autoFocus', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    $timeout(function () {
                        element.focus();
                    }, 100);
                }
            };
        })
        .directive('autoResize', function () {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    element.on('input', function () {
                        this.style.height = 'auto';
                        this.style.height = (this.scrollHeight) + 'px';
                    });
                }
            };
        });
})();