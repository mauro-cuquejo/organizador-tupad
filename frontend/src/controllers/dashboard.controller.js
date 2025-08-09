(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('DashboardController', ['$scope', '$http', 'ApiService', 'NotificationService', 'StorageService', 'moment', function ($scope, $http, ApiService, NotificationService, StorageService, moment) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.stats = {
                totalMaterias: 0,
                totalHorarios: 0,
                totalContenidos: 0,
                totalEvaluaciones: 0,
                evaluacionesPendientes: 0,
                proximasClases: 0
            };

            vm.recentActivity = [];
            vm.upcomingEvents = [];
            vm.chartData = {
                materias: {},
                evaluaciones: {},
                horarios: {}
            };

            // Configuración de gráficos
            vm.chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            };

            // Inicialización
            vm.init = function () {
                vm.loadDashboardData();
                vm.loadRecentActivity();
                vm.loadUpcomingEvents();
                vm.loadChartData();
            };

            // Cargar datos del dashboard
            vm.loadDashboardData = function () {
                vm.loading = true;

                // Intentar cargar desde caché primero
                const cachedData = StorageService.getCache('dashboard_stats');
                if (cachedData) {
                    vm.stats = cachedData;
                    vm.loading = false;
                }

                // Cargar datos frescos del servidor
                Promise.all([
                    vm.loadMateriasStats(),
                    vm.loadHorariosStats(),
                    vm.loadContenidosStats(),
                    vm.loadEvaluacionesStats()
                ])
                    .then(function (results) {
                        vm.stats = {
                            totalMaterias: results[0] || 0,
                            totalHorarios: results[1] || 0,
                            totalContenidos: results[2] || 0,
                            totalEvaluaciones: results[3] || 0,
                            evaluacionesPendientes: results[4] || 0,
                            proximasClases: results[5] || 0
                        };

                        // Guardar en caché por 5 minutos
                        StorageService.setCache('dashboard_stats', vm.stats, 300000);
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cargar estadísticas: ' + error.message);
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            };

            // Cargar estadísticas de materias
            vm.loadMateriasStats = function () {
                return ApiService.materias.getCount()
                    .then(function (response) {
                        return response.count || 0;
                    })
                    .catch(function () {
                        return 0;
                    });
            };

            // Cargar estadísticas de horarios
            vm.loadHorariosStats = function () {
                return ApiService.horarios.getCount()
                    .then(function (response) {
                        return response.count || 0;
                    })
                    .catch(function () {
                        return 0;
                    });
            };

            // Cargar estadísticas de contenidos
            vm.loadContenidosStats = function () {
                return ApiService.contenidos.getCount()
                    .then(function (response) {
                        return response.count || 0;
                    })
                    .catch(function () {
                        return 0;
                    });
            };

            // Cargar estadísticas de evaluaciones
            vm.loadEvaluacionesStats = function () {
                return ApiService.evaluaciones.getStats()
                    .then(function (response) {
                        const stats = response;
                        vm.stats.evaluacionesPendientes = stats.pendientes || 0;
                        return stats.total || 0;
                    })
                    .catch(function () {
                        return 0;
                    });
            };

            // Cargar actividad reciente
            vm.loadRecentActivity = function () {
                ApiService.dashboard.getActivity()
                    .then(function (response) {
                        vm.recentActivity = response || [];
                    })
                    .catch(function (error) {
                        console.error('Error al cargar actividad reciente:', error);
                        vm.recentActivity = [];
                    });
            };

            // Cargar eventos próximos
            vm.loadUpcomingEvents = function () {
                ApiService.dashboard.getUpcoming()
                    .then(function (response) {
                        vm.upcomingEvents = response || [];
                    })
                    .catch(function (error) {
                        console.error('Error al cargar eventos próximos:', error);
                        vm.upcomingEvents = [];
                    });
            };

            // Cargar datos para gráficos
            vm.loadChartData = function () {
                vm.loadMateriasChart();
                vm.loadEvaluacionesChart();
                vm.loadHorariosChart();
            };

            // Gráfico de materias por estado
            vm.loadMateriasChart = function () {
                ApiService.materias.getStats()
                    .then(function (response) {
                        const data = response;
                        vm.chartData.materias = {
                            labels: ['Activas', 'Inactivas', 'Completadas'],
                            datasets: [{
                                data: [data.activas || 0, data.inactivas || 0, data.completadas || 0],
                                backgroundColor: ['#28a745', '#ffc107', '#17a2b8'],
                                borderWidth: 0
                            }]
                        };
                    })
                    .catch(function (error) {
                        console.error('Error al cargar gráfico de materias:', error);
                    });
            };

            // Gráfico de evaluaciones por tipo
            vm.loadEvaluacionesChart = function () {
                ApiService.evaluaciones.getStats()
                    .then(function (response) {
                        const data = response;
                        vm.chartData.evaluaciones = {
                            labels: ['Pendientes', 'Completadas', 'Vencidas'],
                            datasets: [{
                                data: [data.pendientes || 0, data.completadas || 0, data.vencidas || 0],
                                backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
                                borderWidth: 0
                            }]
                        };
                    })
                    .catch(function (error) {
                        console.error('Error al cargar gráfico de evaluaciones:', error);
                    });
            };

            // Gráfico de horarios por día
            vm.loadHorariosChart = function () {
                ApiService.horarios.getWeekly()
                    .then(function (response) {
                        const data = response;
                        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

                        vm.chartData.horarios = {
                            labels: days,
                            datasets: [{
                                label: 'Clases por día',
                                data: days.map(day => data[day.toLowerCase()] || 0),
                                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                                borderColor: '#007bff',
                                borderWidth: 2,
                                fill: true
                            }]
                        };
                    })
                    .catch(function (error) {
                        console.error('Error al cargar gráfico de horarios:', error);
                    });
            };

            // Formatear fecha
            vm.formatDate = function (date) {
                return moment(date).format('DD/MM/YYYY HH:mm');
            };

            // Formatear fecha relativa
            vm.formatRelativeDate = function (date) {
                return moment(date).fromNow();
            };

            // Obtener color de estado
            vm.getStatusColor = function (status) {
                const colors = {
                    'activo': 'success',
                    'inactivo': 'warning',
                    'completado': 'info',
                    'pendiente': 'warning',
                    'vencido': 'danger'
                };
                return colors[status] || 'secondary';
            };

            // Obtener icono de actividad
            vm.getActivityIcon = function (type) {
                const icons = {
                    'materia': 'bi-book',
                    'horario': 'bi-calendar3',
                    'contenido': 'bi-file-text',
                    'evaluacion': 'bi-clipboard-check',
                    'profesor': 'bi-person-badge'
                };
                return icons[type] || 'bi-info-circle';
            };

            // Navegar a módulo específico
            vm.navigateToModule = function (module) {
                window.location.hash = '#/' + module;
            };

            // Refrescar dashboard
            vm.refreshDashboard = function () {
                StorageService.remove('cache_dashboard_stats');
                vm.init();
                NotificationService.success('Dashboard actualizado');
            };

            // Exportar reporte
            vm.exportReport = function () {
                // Implementar exportación de reporte
                NotificationService.info('Función de exportación en desarrollo');
            };

            // Inicializar controlador (solo una vez)
            vm.init();

        }]);
})();