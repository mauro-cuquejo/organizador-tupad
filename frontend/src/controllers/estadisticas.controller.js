/**
 * Controlador para las estadísticas de la aplicación
 */
angular.module('tupadApp').controller('EstadisticasController', ['$scope', '$rootScope', 'ApiService', 'NotificationService', function ($scope, $rootScope, ApiService, NotificationService) {
    'use strict';

    const statsCtrl = this;

    // Estado del controlador
    statsCtrl.loading = false;
    statsCtrl.stats = {};
    statsCtrl.charts = {};
    statsCtrl.filters = {
        periodo: 'mes',
        fechaInicio: null,
        fechaFin: null
    };

    // Inicializar controlador
    statsCtrl.init = function () {
        statsCtrl.loadStats();
        statsCtrl.setupCharts();
    };

    // Cargar estadísticas
    statsCtrl.loadStats = function () {
        statsCtrl.loading = true;

        const params = {
            periodo: statsCtrl.filters.periodo,
            fechaInicio: statsCtrl.filters.fechaInicio,
            fechaFin: statsCtrl.filters.fechaFin
        };

        ApiService.stats.getGeneral(params)
            .then(function (response) {
                statsCtrl.stats = response;
                statsCtrl.updateCharts();
            })
            .catch(function (error) {
                console.error('Error al cargar estadísticas:', error);
                NotificationService.error('Error al cargar las estadísticas');
            })
            .finally(function () {
                statsCtrl.loading = false;
            });
    };

    // Configurar gráficos
    statsCtrl.setupCharts = function () {
        // Gráfico de materias por estado
        statsCtrl.materiasLabels = ['Activas', 'Inactivas', 'Pendientes'];
        statsCtrl.materiasDatasets = [{
            data: [0, 0, 0],
            backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
            borderWidth: 2,
            borderColor: '#fff'
        }];
        statsCtrl.materiasOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Materias por Estado'
                }
            }
        };

        // Gráfico de evaluaciones por mes
        statsCtrl.evaluacionesLabels = [];
        statsCtrl.evaluacionesDatasets = [{
            label: 'Evaluaciones',
            data: [],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4,
            fill: true
        }];
        statsCtrl.evaluacionesOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Evaluaciones por Mes'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        };

        // Gráfico de contenidos por tipo
        statsCtrl.contenidosLabels = ['PDF', 'Video', 'Presentación', 'Otros'];
        statsCtrl.contenidosDatasets = [{
            label: 'Contenidos',
            data: [0, 0, 0, 0],
            backgroundColor: ['#17a2b8', '#6f42c1', '#fd7e14', '#6c757d']
        }];
        statsCtrl.contenidosOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Contenidos por Tipo'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        };

        // Gráfico de profesores por departamento
        statsCtrl.profesoresLabels = [];
        statsCtrl.profesoresDatasets = [{
            data: [],
            backgroundColor: [
                '#007bff', '#28a745', '#ffc107', '#dc3545',
                '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }];
        statsCtrl.profesoresData = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#007bff', '#28a745', '#ffc107', '#dc3545',
                    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };
        statsCtrl.profesoresOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Profesores por Departamento'
                }
            }
        };
    };

    // Actualizar gráficos con datos
    statsCtrl.updateCharts = function () {
        if (!statsCtrl.stats) return;

        // Actualizar gráfico de materias por estado
        if (statsCtrl.stats.materias) {
            statsCtrl.materiasDatasets[0].data = [
                statsCtrl.stats.materias.activas || 0,
                statsCtrl.stats.materias.inactivas || 0,
                statsCtrl.stats.materias.pendientes || 0
            ];
        }

        // Actualizar gráfico de evaluaciones por mes
        if (statsCtrl.stats.evaluaciones) {
            const evaluacionesData = statsCtrl.stats.evaluaciones.porMes || [];
            statsCtrl.evaluacionesLabels = evaluacionesData.map(item => item.mes);
            statsCtrl.evaluacionesDatasets[0].data = evaluacionesData.map(item => item.cantidad);
        }

        // Actualizar gráfico de contenidos por tipo
        if (statsCtrl.stats.contenidos) {
            statsCtrl.contenidosDatasets[0].data = [
                statsCtrl.stats.contenidos.pdf || 0,
                statsCtrl.stats.contenidos.video || 0,
                statsCtrl.stats.contenidos.presentacion || 0,
                statsCtrl.stats.contenidos.otros || 0
            ];
        }

        // Actualizar gráfico de profesores por departamento
        if (statsCtrl.stats.profesores) {
            const profesoresData = statsCtrl.stats.profesores.porDepartamento || [];
            statsCtrl.profesoresLabels = profesoresData.map(item => item.departamento);
            statsCtrl.profesoresDatasets[0].data = profesoresData.map(item => item.cantidad);
            statsCtrl.profesoresData.labels = profesoresData.map(item => item.departamento);
            statsCtrl.profesoresData.datasets[0].data = profesoresData.map(item => item.cantidad);
        }
    };

    // Cambiar filtro de período
    statsCtrl.changePeriodo = function (periodo) {
        statsCtrl.filters.periodo = periodo;
        statsCtrl.loadStats();
    };

    // Aplicar filtros de fecha
    statsCtrl.applyDateFilters = function () {
        if (statsCtrl.filters.fechaInicio && statsCtrl.filters.fechaFin) {
            statsCtrl.loadStats();
        }
    };

    // Limpiar filtros de fecha
    statsCtrl.clearDateFilters = function () {
        statsCtrl.filters.fechaInicio = null;
        statsCtrl.filters.fechaFin = null;
        statsCtrl.loadStats();
    };

    // Exportar estadísticas
    statsCtrl.exportStats = function () {
        statsCtrl.loading = true;

        const params = {
            periodo: statsCtrl.filters.periodo,
            fechaInicio: statsCtrl.filters.fechaInicio,
            fechaFin: statsCtrl.filters.fechaFin,
            formato: 'excel'
        };

        ApiService.estadisticas.exportStats(params)
            .then(function (response) {
                // Crear y descargar archivo
                const dataBlob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `estadisticas-${new Date().toISOString().split('T')[0]}.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);

                NotificationService.success('Estadísticas exportadas correctamente');
            })
            .catch(function (error) {
                console.error('Error al exportar estadísticas:', error);
                NotificationService.error('Error al exportar las estadísticas');
            })
            .finally(function () {
                statsCtrl.loading = false;
            });
    };

    // Obtener porcentaje de completitud
    statsCtrl.getCompletionPercentage = function () {
        if (!statsCtrl.stats.general) return 0;

        const total = statsCtrl.stats.general.totalMaterias || 0;
        const completadas = statsCtrl.stats.general.materiasCompletadas || 0;

        return total > 0 ? Math.round((completadas / total) * 100) : 0;
    };

    // Obtener color según el porcentaje
    statsCtrl.getCompletionColor = function () {
        const percentage = statsCtrl.getCompletionPercentage();

        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    };

    // Obtener estadísticas de rendimiento
    statsCtrl.getPerformanceStats = function () {
        if (!statsCtrl.stats.rendimiento) return {};

        return {
            promedioEvaluaciones: statsCtrl.stats.rendimiento.promedioEvaluaciones || 0,
            evaluacionesPendientes: statsCtrl.stats.rendimiento.evaluacionesPendientes || 0,
            evaluacionesCompletadas: statsCtrl.stats.rendimiento.evaluacionesCompletadas || 0,
            tasaCompletitud: statsCtrl.stats.rendimiento.tasaCompletitud || 0
        };
    };

    // Obtener tendencias
    statsCtrl.getTrends = function () {
        if (!statsCtrl.stats.tendencias) return [];

        return statsCtrl.stats.tendencias.map(trend => ({
            ...trend,
            icon: trend.tipo === 'incremento' ? 'bi-arrow-up' : 'bi-arrow-down',
            color: trend.tipo === 'incremento' ? 'success' : 'danger'
        }));
    };

    // Obtener alertas
    statsCtrl.getAlerts = function () {
        if (!statsCtrl.stats.alertas) return [];

        return statsCtrl.stats.alertas.map(alert => ({
            ...alert,
            icon: alert.tipo === 'evaluacion' ? 'bi-clipboard-check' :
                alert.tipo === 'materia' ? 'bi-book' : 'bi-exclamation-triangle',
            color: alert.prioridad === 'alta' ? 'danger' :
                alert.prioridad === 'media' ? 'warning' : 'info'
        }));
    };

    // Inicializar controlador
    statsCtrl.init();
}]);