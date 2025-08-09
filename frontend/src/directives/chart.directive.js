/**
 * Directivo moderno para Chart.js v4
 * Reemplaza angular-chart.js con una implementación más moderna y compatible
 */
angular.module('tupadApp')
    .directive('tupadChart', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                options: '=',
                type: '@',
                width: '@',
                height: '@',
                responsive: '@',
                maintainAspectRatio: '@'
            },
            template: '<canvas></canvas>',
            link: function (scope, element, attrs) {
                var canvas = element.find('canvas')[0];
                var chart = null;
                var ctx = canvas.getContext('2d');

                // Configuración por defecto
                var defaultOptions = {
                    responsive: scope.responsive !== 'false',
                    maintainAspectRatio: scope.maintainAspectRatio !== 'false',
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    }
                };

                // Función para crear/actualizar el gráfico
                function createChart() {
                    if (chart) {
                        chart.destroy();
                    }

                    if (!scope.data || !scope.type) {
                        return;
                    }

                    var chartOptions = angular.extend({}, defaultOptions, scope.options || {});

                    chart = new Chart(ctx, {
                        type: scope.type,
                        data: scope.data,
                        options: chartOptions
                    });
                }

                // Observar cambios en los datos
                scope.$watch('data', function (newData, oldData) {
                    if (newData && newData !== oldData) {
                        $timeout(function () {
                            createChart();
                        });
                    }
                }, true);

                // Observar cambios en las opciones
                scope.$watch('options', function (newOptions, oldOptions) {
                    if (newOptions && newOptions !== oldOptions) {
                        $timeout(function () {
                            createChart();
                        });
                    }
                }, true);

                // Observar cambios en el tipo
                scope.$watch('type', function (newType, oldType) {
                    if (newType && newType !== oldType) {
                        $timeout(function () {
                            createChart();
                        });
                    }
                });

                // Limpiar al destruir el directivo
                scope.$on('$destroy', function () {
                    if (chart) {
                        chart.destroy();
                    }
                });

                // Crear gráfico inicial
                $timeout(function () {
                    createChart();
                });
            }
        };
    }])

    // Directivo para gráficos de línea
    .directive('tupadLineChart', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                options: '=',
                labels: '=',
                datasets: '='
            },
            template: '<canvas></canvas>',
            link: function (scope, element, attrs) {
                var canvas = element.find('canvas')[0];
                var chart = null;
                var ctx = canvas.getContext('2d');

                function createLineChart() {
                    if (chart) {
                        chart.destroy();
                    }

                    if (!scope.labels || !scope.datasets) {
                        return;
                    }

                    var chartData = {
                        labels: scope.labels,
                        datasets: scope.datasets
                    };

                    var defaultOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    };

                    var chartOptions = angular.extend({}, defaultOptions, scope.options || {});

                    chart = new Chart(ctx, {
                        type: 'line',
                        data: chartData,
                        options: chartOptions
                    });
                }

                scope.$watchGroup(['labels', 'datasets'], function () {
                    $timeout(function () {
                        createLineChart();
                    });
                }, true);

                scope.$on('$destroy', function () {
                    if (chart) {
                        chart.destroy();
                    }
                });

                $timeout(function () {
                    createLineChart();
                });
            }
        };
    }])

    // Directivo para gráficos de barras
    .directive('tupadBarChart', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                options: '=',
                labels: '=',
                datasets: '='
            },
            template: '<canvas></canvas>',
            link: function (scope, element, attrs) {
                var canvas = element.find('canvas')[0];
                var chart = null;
                var ctx = canvas.getContext('2d');

                function createBarChart() {
                    if (chart) {
                        chart.destroy();
                    }

                    if (!scope.labels || !scope.datasets) {
                        return;
                    }

                    var chartData = {
                        labels: scope.labels,
                        datasets: scope.datasets
                    };

                    var defaultOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    };

                    var chartOptions = angular.extend({}, defaultOptions, scope.options || {});

                    chart = new Chart(ctx, {
                        type: 'bar',
                        data: chartData,
                        options: chartOptions
                    });
                }

                scope.$watchGroup(['labels', 'datasets'], function () {
                    $timeout(function () {
                        createBarChart();
                    });
                }, true);

                scope.$on('$destroy', function () {
                    if (chart) {
                        chart.destroy();
                    }
                });

                $timeout(function () {
                    createBarChart();
                });
            }
        };
    }])

    // Directivo para gráficos de dona
    .directive('tupadDoughnutChart', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                options: '=',
                labels: '=',
                datasets: '='
            },
            template: '<canvas></canvas>',
            link: function (scope, element, attrs) {
                var canvas = element.find('canvas')[0];
                var chart = null;
                var ctx = canvas.getContext('2d');

                function createDoughnutChart() {
                    if (chart) {
                        chart.destroy();
                    }

                    if (!scope.labels || !scope.datasets) {
                        return;
                    }

                    var chartData = {
                        labels: scope.labels,
                        datasets: scope.datasets
                    };

                    var defaultOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        }
                    };

                    var chartOptions = angular.extend({}, defaultOptions, scope.options || {});

                    chart = new Chart(ctx, {
                        type: 'doughnut',
                        data: chartData,
                        options: chartOptions
                    });
                }

                scope.$watchGroup(['labels', 'datasets'], function () {
                    $timeout(function () {
                        createDoughnutChart();
                    });
                }, true);

                scope.$on('$destroy', function () {
                    if (chart) {
                        chart.destroy();
                    }
                });

                $timeout(function () {
                    createDoughnutChart();
                });
            }
        };
    }]);