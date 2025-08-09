/**
 * Directiva para tablas de datos
 */
(function () {
    'use strict';

    angular.module('tupadApp')
        .directive('tupadTable', function () {
            return {
                restrict: 'E',
                scope: {
                    data: '=',
                    columns: '=',
                    sortable: '=',
                    searchable: '=',
                    pagination: '=',
                    itemsPerPage: '=',
                    onRowClick: '&'
                },
                template: `
                    <div class="table-container">
                        <!-- Buscador -->
                        <div class="mb-3" ng-if="searchable">
                            <input type="text" class="form-control"
                                   ng-model="searchText"
                                   placeholder="Buscar...">
                        </div>

                        <!-- Tabla -->
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th ng-repeat="column in columns"
                                            ng-click="sortBy(column.field)"
                                            ng-class="{'sortable': sortable}"
                                            style="cursor: pointer;">
                                            {{ column.title }}
                                            <i ng-if="sortable"
                                               class="bi"
                                               ng-class="getSortIcon(column.field)"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr ng-repeat="item in filteredData | limitTo: itemsPerPage: (currentPage - 1) * itemsPerPage"
                                        ng-click="onRowClick({item: item})"
                                        style="cursor: pointer;">
                                        <td ng-repeat="column in columns">
                                            <span ng-if="column.type === 'date'">
                                                {{ item[column.field] | date:'dd/MM/yyyy' }}
                                            </span>
                                            <span ng-else-if="column.type === 'status'">
                                                <span class="badge"
                                                      ng-class="getStatusClass(item[column.field])">
                                                    {{ item[column.field] }}
                                                </span>
                                            </span>
                                            <span ng-else-if="column.type === 'role'">
                                                <span class="badge"
                                                      ng-class="getRoleClass(item[column.field])">
                                                    {{ item[column.field] }}
                                                </span>
                                            </span>
                                            <span ng-else>
                                                {{ item[column.field] }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Paginación -->
                        <nav ng-if="pagination && totalPages > 1">
                            <ul class="pagination justify-content-center">
                                <li class="page-item" ng-class="{disabled: currentPage === 1}">
                                    <a class="page-link" href="#" ng-click="setPage(currentPage - 1)">
                                        Anterior
                                    </a>
                                </li>
                                <li class="page-item"
                                    ng-repeat="page in getPages()"
                                    ng-class="{active: page === currentPage}">
                                    <a class="page-link" href="#" ng-click="setPage(page)">
                                        {{ page }}
                                    </a>
                                </li>
                                <li class="page-item" ng-class="{disabled: currentPage === totalPages}">
                                    <a class="page-link" href="#" ng-click="setPage(currentPage + 1)">
                                        Siguiente
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                `,
                link: function (scope, element, attrs) {
                    // Variables de estado
                    scope.currentPage = 1;
                    scope.sortField = null;
                    scope.sortDirection = 'asc';
                    scope.searchText = '';

                    // Función para ordenar
                    scope.sortBy = function (field) {
                        if (!scope.sortable) return;

                        if (scope.sortField === field) {
                            scope.sortDirection = scope.sortDirection === 'asc' ? 'desc' : 'asc';
                        } else {
                            scope.sortField = field;
                            scope.sortDirection = 'asc';
                        }
                    };

                    // Función para obtener ícono de ordenamiento
                    scope.getSortIcon = function (field) {
                        if (scope.sortField !== field) return 'bi-arrow-down-up';
                        return scope.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
                    };

                    // Función para obtener clase de estado
                    scope.getStatusClass = function (status) {
                        var classes = {
                            'activo': 'bg-success',
                            'inactivo': 'bg-secondary',
                            'pendiente': 'bg-warning',
                            'completado': 'bg-info'
                        };
                        return classes[status] || 'bg-secondary';
                    };

                    // Función para obtener clase de rol
                    scope.getRoleClass = function (role) {
                        var classes = {
                            'admin': 'bg-danger',
                            'profesor': 'bg-primary',
                            'estudiante': 'bg-success'
                        };
                        return classes[role] || 'bg-secondary';
                    };

                    // Función para establecer página
                    scope.setPage = function (page) {
                        if (page >= 1 && page <= scope.totalPages) {
                            scope.currentPage = page;
                        }
                    };

                    // Función para obtener páginas
                    scope.getPages = function () {
                        var pages = [];
                        var start = Math.max(1, scope.currentPage - 2);
                        var end = Math.min(scope.totalPages, scope.currentPage + 2);

                        for (var i = start; i <= end; i++) {
                            pages.push(i);
                        }
                        return pages;
                    };

                    // Observar cambios en los datos
                    scope.$watch('data', function (newData) {
                        if (newData) {
                            scope.filteredData = newData;
                            scope.totalPages = Math.ceil(scope.filteredData.length / (scope.itemsPerPage || 10));
                            scope.currentPage = 1;
                        }
                    });

                    // Observar cambios en el texto de búsqueda
                    scope.$watch('searchText', function (newText) {
                        if (scope.data) {
                            if (!newText) {
                                scope.filteredData = scope.data;
                            } else {
                                scope.filteredData = scope.data.filter(function (item) {
                                    return Object.keys(item).some(function (key) {
                                        return String(item[key]).toLowerCase().includes(newText.toLowerCase());
                                    });
                                });
                            }
                            scope.totalPages = Math.ceil(scope.filteredData.length / (scope.itemsPerPage || 10));
                            scope.currentPage = 1;
                        }
                    });

                    // Observar cambios en el ordenamiento
                    scope.$watchGroup(['sortField', 'sortDirection'], function () {
                        if (scope.filteredData && scope.sortField) {
                            scope.filteredData.sort(function (a, b) {
                                var aVal = a[scope.sortField];
                                var bVal = b[scope.sortField];

                                if (aVal < bVal) return scope.sortDirection === 'asc' ? -1 : 1;
                                if (aVal > bVal) return scope.sortDirection === 'asc' ? 1 : -1;
                                return 0;
                            });
                        }
                    });
                }
            };
        });
})();