(function () {
    'use strict';

    angular.module('tupadApp')
        .directive('loadingSpinner', function () {
            return {
                restrict: 'E',
                scope: {
                    loading: '=',
                    message: '@',
                    size: '@',
                    color: '@'
                },
                template: `
                    <div ng-if="loading" class="loading-spinner-container">
                        <div class="spinner-wrapper">
                            <div class="spinner-border"
                                 ng-class="getSpinnerClasses()"
                                 role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p ng-if="message" class="loading-message">{{ message }}</p>
                        </div>
                    </div>
                `,
                link: function (scope) {
                    scope.getSpinnerClasses = function () {
                        var classes = [];

                        if (scope.size) {
                            classes.push('spinner-border-' + scope.size);
                        }

                        if (scope.color) {
                            classes.push('text-' + scope.color);
                        } else {
                            classes.push('text-primary');
                        }

                        return classes.join(' ');
                    };
                }
            };
        })
        .directive('loadingOverlay', function () {
            return {
                restrict: 'E',
                scope: {
                    loading: '=',
                    message: '@',
                    backdrop: '='
                },
                template: `
                    <div ng-if="loading" class="loading-overlay" ng-class="{ 'with-backdrop': backdrop }">
                        <div class="loading-content">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p ng-if="message" class="loading-message mt-3">{{ message }}</p>
                        </div>
                    </div>
                `
            };
        })
        .directive('loadingButton', function () {
            return {
                restrict: 'A',
                scope: {
                    loading: '=',
                    loadingText: '@',
                    originalText: '@'
                },
                link: function (scope, element, attrs) {
                    var originalText = element.text();

                    scope.$watch('loading', function (newVal) {
                        if (newVal) {
                            element.prop('disabled', true);
                            element.html('<span class="spinner-border spinner-border-sm me-2"></span>' +
                                (scope.loadingText || 'Cargando...'));
                        } else {
                            element.prop('disabled', false);
                            element.html(scope.originalText || originalText);
                        }
                    });
                }
            };
        });
})();