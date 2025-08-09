(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('EvaluacionesController', ['$scope', '$http', 'ApiService', 'NotificationService', 'StorageService', 'moment', function ($scope, $http, ApiService, NotificationService, StorageService, moment) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.evaluaciones = [];
            vm.materias = [];
            vm.selectedEvaluacion = null;
            vm.showModal = false;
            vm.editMode = false;
            vm.currentPage = 1;
            vm.itemsPerPage = 10;
            vm.totalItems = 0;

            // Filtros y búsqueda
            vm.filters = {
                titulo: '',
                materia: '',
                tipo: '',
                estado: '',
                fecha_inicio: '',
                fecha_fin: ''
            };

            // Formulario de evaluación
            vm.evaluacionForm = {
                id: null,
                titulo: '',
                descripcion: '',
                tipo: 'examen',
                materia_id: '',
                fecha_evaluacion: '',
                fecha_limite: '',
                duracion: 0,
                puntaje_total: 100,
                peso: 0,
                instrucciones: '',
                estado: 'pendiente',
                ubicacion: '',
                observaciones: ''
            };

            // Tipos de evaluación
            vm.tiposEvaluacion = [
                { value: 'examen', label: 'Examen' },
                { value: 'quiz', label: 'Quiz' },
                { value: 'tarea', label: 'Tarea' },
                { value: 'proyecto', label: 'Proyecto' },
                { value: 'presentacion', label: 'Presentación' },
                { value: 'practica', label: 'Práctica' },
                { value: 'otro', label: 'Otro' }
            ];

            // Estados
            vm.estados = [
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'en_proceso', label: 'En Proceso' },
                { value: 'completada', label: 'Completada' },
                { value: 'vencida', label: 'Vencida' },
                { value: 'cancelada', label: 'Cancelada' }
            ];

            // Inicialización
            vm.init = function () {
                vm.loadEvaluaciones();
                vm.loadMaterias();
            };

            // Cargar evaluaciones
            vm.loadEvaluaciones = function () {
                vm.loading = true;

                const params = {
                    page: vm.currentPage,
                    limit: vm.itemsPerPage,
                    ...vm.filters
                };

                ApiService.evaluaciones.getAll(params)
                    .then(function (response) {
                        vm.evaluaciones = response.evaluaciones || [];
                        vm.totalItems = response.total || 0;
                        vm.applyFilters();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cargar evaluaciones: ' + error.message);
                        vm.evaluaciones = [];
                        vm.totalItems = 0;
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            };

            // Cargar materias
            vm.loadMaterias = function () {
                ApiService.materias.getAll()
                    .then(function (response) {
                        vm.materias = response || [];
                    })
                    .catch(function (error) {
                        console.error('Error al cargar materias:', error);
                        vm.materias = [];
                    });
            };

            // Aplicar filtros
            vm.applyFilters = function () {
                vm.currentPage = 1;
                vm.loadEvaluaciones();
            };

            // Limpiar filtros
            vm.clearFilters = function () {
                vm.filters = {
                    titulo: '',
                    materia: '',
                    tipo: '',
                    estado: '',
                    fecha_inicio: '',
                    fecha_fin: ''
                };
                vm.applyFilters();
            };

            // Cambiar página
            vm.changePage = function (page) {
                vm.currentPage = page;
                vm.loadEvaluaciones();
            };

            // Calcular total de páginas
            vm.getTotalPages = function () {
                return Math.ceil(vm.totalItems / vm.itemsPerPage);
            };

            // Obtener rango de páginas para paginación
            vm.getPageRange = function () {
                const totalPages = vm.getTotalPages();
                const current = vm.currentPage;
                const range = [];

                for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
                    range.push(i);
                }

                return range;
            };

            // Abrir modal para crear/editar
            vm.openModal = function (evaluacion) {
                vm.editMode = !!evaluacion;
                vm.selectedEvaluacion = evaluacion;

                if (evaluacion) {
                    vm.evaluacionForm = angular.copy(evaluacion);
                    // Convertir fechas a formato local
                    if (vm.evaluacionForm.fecha_evaluacion) {
                        vm.evaluacionForm.fecha_evaluacion = moment(vm.evaluacionForm.fecha_evaluacion).format('YYYY-MM-DDTHH:mm');
                    }
                    if (vm.evaluacionForm.fecha_limite) {
                        vm.evaluacionForm.fecha_limite = moment(vm.evaluacionForm.fecha_limite).format('YYYY-MM-DDTHH:mm');
                    }
                } else {
                    vm.resetForm();
                }

                vm.showModal = true;
            };

            // Cerrar modal
            vm.closeModal = function () {
                vm.showModal = false;
                vm.selectedEvaluacion = null;
                vm.resetForm();
            };

            // Resetear formulario
            vm.resetForm = function () {
                vm.evaluacionForm = {
                    id: null,
                    titulo: '',
                    descripcion: '',
                    tipo: 'examen',
                    materia_id: '',
                    fecha_evaluacion: '',
                    fecha_limite: '',
                    duracion: 0,
                    puntaje_total: 100,
                    peso: 0,
                    instrucciones: '',
                    estado: 'pendiente',
                    ubicacion: '',
                    observaciones: ''
                };
            };

            // Guardar evaluación
            vm.saveEvaluacion = function () {
                if (!vm.validateForm()) {
                    return;
                }

                vm.loading = true;

                const data = angular.copy(vm.evaluacionForm);

                if (vm.editMode) {
                    ApiService.evaluaciones.update(data.id, data)
                        .then(function (response) {
                            NotificationService.success('Evaluación actualizada correctamente');
                            vm.closeModal();
                            vm.loadEvaluaciones();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al actualizar evaluación: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                } else {
                    ApiService.evaluaciones.create(data)
                        .then(function (response) {
                            NotificationService.success('Evaluación creada correctamente');
                            vm.closeModal();
                            vm.loadEvaluaciones();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al crear evaluación: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                }
            };

            // Eliminar evaluación
            vm.deleteEvaluacion = function (evaluacion) {
                NotificationService.confirm(
                    '¿Estás seguro de que quieres eliminar esta evaluación? Esta acción no se puede deshacer.',
                    'Confirmar eliminación',
                    function (confirmed) {
                        if (confirmed) {
                            vm.loading = true;

                            ApiService.evaluaciones.delete(evaluacion.id)
                                .then(function (response) {
                                    NotificationService.success('Evaluación eliminada correctamente');
                                    vm.loadEvaluaciones();
                                })
                                .catch(function (error) {
                                    NotificationService.error('Error al eliminar evaluación: ' + error.message);
                                })
                                .finally(function () {
                                    vm.loading = false;
                                });
                        }
                    }
                );
            };

            // Cambiar estado de evaluación
            vm.changeEstado = function (evaluacion, nuevoEstado) {
                const data = { estado: nuevoEstado };

                ApiService.evaluaciones.update(evaluacion.id, data)
                    .then(function (response) {
                        NotificationService.success('Estado de evaluación actualizado');
                        vm.loadEvaluaciones();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cambiar estado: ' + error.message);
                    });
            };

            // Validar formulario
            vm.validateForm = function () {
                if (!vm.evaluacionForm.titulo) {
                    NotificationService.warning('Por favor, ingresa el título de la evaluación');
                    return false;
                }
                if (!vm.evaluacionForm.materia_id) {
                    NotificationService.warning('Por favor, selecciona una materia');
                    return false;
                }
                if (!vm.evaluacionForm.fecha_evaluacion) {
                    NotificationService.warning('Por favor, ingresa la fecha de evaluación');
                    return false;
                }
                if (!vm.evaluacionForm.fecha_limite) {
                    NotificationService.warning('Por favor, ingresa la fecha límite');
                    return false;
                }
                if (vm.evaluacionForm.puntaje_total <= 0) {
                    NotificationService.warning('El puntaje total debe ser mayor a 0');
                    return false;
                }
                if (vm.evaluacionForm.peso < 0 || vm.evaluacionForm.peso > 100) {
                    NotificationService.warning('El peso debe estar entre 0 y 100');
                    return false;
                }

                // Validar que fecha_limite sea mayor que fecha_evaluacion
                const fechaEvaluacion = moment(vm.evaluacionForm.fecha_evaluacion);
                const fechaLimite = moment(vm.evaluacionForm.fecha_limite);

                if (fechaLimite.isBefore(fechaEvaluacion)) {
                    NotificationService.warning('La fecha límite debe ser posterior a la fecha de evaluación');
                    return false;
                }

                return true;
            };

            // Obtener nombre de materia
            vm.getMateriaNombre = function (materiaId) {
                const materia = vm.materias.find(m => m.id === materiaId);
                return materia ? materia.nombre : 'N/A';
            };

            // Obtener color de tipo
            vm.getTipoColor = function (tipo) {
                const colors = {
                    'examen': 'danger',
                    'quiz': 'warning',
                    'tarea': 'info',
                    'proyecto': 'primary',
                    'presentacion': 'success',
                    'practica': 'secondary',
                    'otro': 'dark'
                };
                return colors[tipo] || 'secondary';
            };

            // Obtener icono de tipo
            vm.getTipoIcon = function (tipo) {
                const icons = {
                    'examen': 'bi-clipboard-check',
                    'quiz': 'bi-question-circle',
                    'tarea': 'bi-journal-text',
                    'proyecto': 'bi-folder',
                    'presentacion': 'bi-easel',
                    'practica': 'bi-tools',
                    'otro': 'bi-file-earmark'
                };
                return icons[tipo] || 'bi-file-earmark';
            };

            // Obtener color de estado
            vm.getEstadoColor = function (estado) {
                const colors = {
                    'pendiente': 'warning',
                    'en_proceso': 'info',
                    'completada': 'success',
                    'vencida': 'danger',
                    'cancelada': 'secondary'
                };
                return colors[estado] || 'secondary';
            };

            // Formatear fecha
            vm.formatDate = function (date) {
                return moment(date).format('DD/MM/YYYY HH:mm');
            };

            // Formatear fecha relativa
            vm.formatRelativeDate = function (date) {
                return moment(date).fromNow();
            };

            // Verificar si la evaluación está próxima
            vm.isProxima = function (evaluacion) {
                const ahora = moment();
                const fechaEvaluacion = moment(evaluacion.fecha_evaluacion);
                const diff = fechaEvaluacion.diff(ahora, 'days');
                return diff >= 0 && diff <= 7;
            };

            // Verificar si la evaluación está vencida
            vm.isVencida = function (evaluacion) {
                const ahora = moment();
                const fechaLimite = moment(evaluacion.fecha_limite);
                return ahora.isAfter(fechaLimite);
            };

            // Calcular tiempo restante
            vm.getTiempoRestante = function (evaluacion) {
                const ahora = moment();
                const fechaLimite = moment(evaluacion.fecha_limite);
                const diff = fechaLimite.diff(ahora);

                if (diff <= 0) {
                    return 'Vencida';
                }

                const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
                const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                if (dias > 0) {
                    return `${dias} día${dias > 1 ? 's' : ''}`;
                } else if (horas > 0) {
                    return `${horas} hora${horas > 1 ? 's' : ''}`;
                } else {
                    return 'Menos de 1 hora';
                }
            };

            // Exportar evaluaciones
            vm.exportEvaluaciones = function () {
                // Implementar exportación
                NotificationService.info('Función de exportación en desarrollo');
            };

            // Importar evaluaciones
            vm.importEvaluaciones = function () {
                // Implementar importación
                NotificationService.info('Función de importación en desarrollo');
            };

            // Ver detalles de evaluación
            vm.viewDetails = function (evaluacion) {
                // Implementar vista de detalles
                NotificationService.info('Vista de detalles en desarrollo');
            };

            // Inicializar controlador
            vm.init();

        }]);
})();