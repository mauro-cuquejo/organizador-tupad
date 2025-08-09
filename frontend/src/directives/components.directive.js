(function () {
    'use strict';

    angular.module('tupadApp')
        .directive('statusBadge', function () {
            return {
                restrict: 'E',
                scope: {
                    status: '@',
                    text: '@',
                    size: '@'
                },
                template: `
                    <span class="badge"
                          ng-class="getBadgeClasses()"
                          ng-bind="getDisplayText()">
                    </span>
                `,
                link: function (scope) {
                    scope.getBadgeClasses = function () {
                        var classes = ['badge'];

                        // Color basado en el status
                        var colorMap = {
                            'activo': 'bg-success',
                            'inactivo': 'bg-secondary',
                            'pendiente': 'bg-warning',
                            'completado': 'bg-info',
                            'vencido': 'bg-danger',
                            'cancelado': 'bg-dark',
                            'en_proceso': 'bg-info',
                            'jubilado': 'bg-info',
                            'licencia': 'bg-warning',
                            'borrador': 'bg-warning',
                            'archivado': 'bg-dark',
                            'suspendido': 'bg-warning'
                        };

                        var color = colorMap[scope.status] || 'bg-secondary';
                        classes.push(color);

                        // Tamaño
                        if (scope.size) {
                            classes.push('badge-' + scope.size);
                        }

                        return classes.join(' ');
                    };

                    scope.getDisplayText = function () {
                        return scope.text || scope.status || 'N/A';
                    };
                }
            };
        })
        .directive('userAvatar', function () {
            return {
                restrict: 'E',
                scope: {
                    name: '@',
                    email: '@',
                    size: '@',
                    showName: '='
                },
                template: `
                    <div class="user-avatar" ng-class="getAvatarClasses()">
                        <div class="avatar-circle">
                            <span class="avatar-text">{{ getInitials() }}</span>
                        </div>
                        <span ng-if="showName" class="avatar-name">{{ name }}</span>
                    </div>
                `,
                link: function (scope) {
                    scope.getAvatarClasses = function () {
                        var classes = ['user-avatar'];

                        if (scope.size) {
                            classes.push('avatar-' + scope.size);
                        }

                        return classes.join(' ');
                    };

                    scope.getInitials = function () {
                        if (!scope.name) return '?';

                        var names = scope.name.split(' ');
                        var initials = '';

                        if (names.length >= 2) {
                            initials = names[0].charAt(0) + names[1].charAt(0);
                        } else {
                            initials = names[0].charAt(0);
                        }

                        return initials.toUpperCase();
                    };
                }
            };
        })
        .directive('infoCard', function () {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    title: '@',
                    icon: '@',
                    color: '@',
                    collapsible: '=',
                    collapsed: '='
                },
                template: `
                    <div class="card info-card" ng-class="getCardClasses()">
                        <div class="card-header" ng-if="title">
                            <h5 class="card-title mb-0">
                                <i ng-if="icon" class="bi" ng-class="icon"></i>
                                {{ title }}
                                <button ng-if="collapsible"
                                        class="btn btn-sm btn-outline-secondary float-end"
                                        ng-click="toggleCollapse()">
                                    <i class="bi" ng-class="collapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
                                </button>
                            </h5>
                        </div>
                        <div class="card-body" ng-transclude ng-show="!collapsed"></div>
                    </div>
                `,
                link: function (scope) {
                    scope.getCardClasses = function () {
                        var classes = ['info-card'];

                        if (scope.color) {
                            classes.push('card-' + scope.color);
                        }

                        return classes.join(' ');
                    };

                    scope.toggleCollapse = function () {
                        scope.collapsed = !scope.collapsed;
                    };
                }
            };
        })
        .directive('confirmDialog', function () {
            return {
                restrict: 'E',
                scope: {
                    show: '=',
                    title: '@',
                    message: '@',
                    confirmText: '@',
                    cancelText: '@',
                    onConfirm: '&',
                    onCancel: '&'
                },
                template: `
                    <div ng-if="show" class="modal fade show" style="display: block;" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">{{ title || 'Confirmar acción' }}</h5>
                                    <button type="button" class="btn-close" ng-click="cancel()"></button>
                                </div>
                                <div class="modal-body">
                                    <p>{{ message || '¿Estás seguro de que quieres realizar esta acción?' }}</p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" ng-click="cancel()">
                                        {{ cancelText || 'Cancelar' }}
                                    </button>
                                    <button type="button" class="btn btn-danger" ng-click="confirm()">
                                        {{ confirmText || 'Confirmar' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-backdrop fade show"></div>
                    </div>
                `,
                link: function (scope) {
                    scope.confirm = function () {
                        scope.onConfirm();
                        scope.show = false;
                    };

                    scope.cancel = function () {
                        scope.onCancel();
                        scope.show = false;
                    };
                }
            };
        })
        .directive('fileUpload', function () {
            return {
                restrict: 'E',
                scope: {
                    onFileSelect: '&',
                    accept: '@',
                    multiple: '=',
                    maxSize: '@',
                    showProgress: '='
                },
                template: `
                    <div class="file-upload-container">
                        <div class="file-upload-area"
                             ng-class="{ 'dragover': isDragOver }"
                             ng-drop="onDrop($event)"
                             ng-drag-over="onDragOver($event)"
                             ng-drag-leave="onDragLeave($event)">
                            <input type="file"
                                   class="file-input"
                                   ng-file-select="onFileSelect($files)"
                                   accept="{{ accept }}"
                                   ng-multiple="multiple">
                            <div class="file-upload-content">
                                <i class="bi bi-cloud-upload"></i>
                                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                                <small class="text-muted">{{ getAcceptText() }}</small>
                            </div>
                        </div>
                        <div ng-if="showProgress && uploadProgress > 0" class="upload-progress mt-3">
                            <div class="progress">
                                <div class="progress-bar"
                                     role="progressbar"
                                     ng-style="{'width': uploadProgress + '%'}"
                                     ng-bind="uploadProgress + '%'">
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                link: function (scope, element) {
                    scope.isDragOver = false;
                    scope.uploadProgress = 0;

                    scope.onDragOver = function (event) {
                        event.preventDefault();
                        scope.isDragOver = true;
                        scope.$apply();
                    };

                    scope.onDragLeave = function (event) {
                        event.preventDefault();
                        scope.isDragOver = false;
                        scope.$apply();
                    };

                    scope.onDrop = function (event) {
                        event.preventDefault();
                        scope.isDragOver = false;

                        var files = event.dataTransfer.files;
                        if (files.length > 0) {
                            scope.onFileSelect({ $files: files });
                        }

                        scope.$apply();
                    };

                    scope.getAcceptText = function () {
                        if (scope.accept) {
                            return 'Tipos permitidos: ' + scope.accept;
                        }
                        return 'Todos los tipos de archivo';
                    };
                }
            };
        });
})();