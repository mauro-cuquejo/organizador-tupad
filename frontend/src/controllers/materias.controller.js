(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('MateriasController', ['$scope', '$http', 'ApiService', 'NotificationService', 'StorageService', 'moment', function ($scope, $http, ApiService, NotificationService, StorageService, moment) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.materias = [];
            vm.profesores = [];
            vm.selectedMateria = null;
            vm.showModal = false;
            vm.editMode = false;
            vm.currentPage = 1;
            vm.itemsPerPage = 10;
            vm.totalItems = 0;

            // Filtros y búsqueda
            vm.filters = {
                nombre: '',
                codigo: '',
                profesor: '',
                estado: '',
                creditos: ''
            };

            // Formulario de materia
            vm.materiaForm = {
                id: null,
                nombre: '',
                codigo: '',
                descripcion: '',
                creditos: 0,
                horas_teoricas: 0,
                horas_practicas: 0,
                profesor_id: '',
                prerequisitos: '',
                estado: 'activa',
                fecha_inicio: '',
                fecha_fin: ''
            };

            // Estados
            vm.estados = [
                { value: 'activa', label: 'Activa' },
                { value: 'inactiva', label: 'Inactiva' },
                { value: 'completada', label: 'Completada' },
                { value: 'suspendida', label: 'Suspendida' }
            ];

            // Inicialización
            vm.init = function () {
                vm.loadMaterias();
                vm.loadProfesores();
            };

            // Cargar materias
            vm.loadMaterias = function () {
                vm.loading = true;

                const params = {
                    page: vm.currentPage,
                    limit: vm.itemsPerPage,
                    ...vm.filters
                };

                ApiService.materias.getAll(params)
                    .then(function (response) {
                        vm.materias = response.materias || [];
                        vm.totalItems = response.total || 0;
                        vm.applyFilters();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cargar materias: ' + error.message);
                        vm.materias = [];
                        vm.totalItems = 0;
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            };

            // Cargar profesores
            vm.loadProfesores = function () {
                ApiService.profesores.getAll()
                    .then(function (response) {
                        vm.profesores = response || [];
                    })
                    .catch(function (error) {
                        console.error('Error al cargar profesores:', error);
                        vm.profesores = [];
                    });
            };

            // Aplicar filtros
            vm.applyFilters = function () {
                vm.currentPage = 1;
                vm.loadMaterias();
            };

            // Limpiar filtros
            vm.clearFilters = function () {
                vm.filters = {
                    nombre: '',
                    codigo: '',
                    profesor: '',
                    estado: '',
                    creditos: ''
                };
                vm.applyFilters();
            };

            // Cambiar página
            vm.changePage = function (page) {
                vm.currentPage = page;
                vm.loadMaterias();
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
            vm.openModal = function (materia) {
                vm.editMode = !!materia;
                vm.selectedMateria = materia;

                if (materia) {
                    vm.materiaForm = angular.copy(materia);
                    // Convertir fechas a formato local
                    if (vm.materiaForm.fecha_inicio) {
                        vm.materiaForm.fecha_inicio = moment(vm.materiaForm.fecha_inicio).format('YYYY-MM-DD');
                    }
                    if (vm.materiaForm.fecha_fin) {
                        vm.materiaForm.fecha_fin = moment(vm.materiaForm.fecha_fin).format('YYYY-MM-DD');
                    }
                } else {
                    vm.resetForm();
                }

                vm.showModal = true;
            };

            // Cerrar modal
            vm.closeModal = function () {
                vm.showModal = false;
                vm.selectedMateria = null;
                vm.resetForm();
            };

            // Resetear formulario
            vm.resetForm = function () {
                vm.materiaForm = {
                    id: null,
                    nombre: '',
                    codigo: '',
                    descripcion: '',
                    creditos: 0,
                    horas_teoricas: 0,
                    horas_practicas: 0,
                    profesor_id: '',
                    prerequisitos: '',
                    estado: 'activa',
                    fecha_inicio: '',
                    fecha_fin: ''
                };
            };

            // Guardar materia
            vm.saveMateria = function () {
                if (!vm.validateForm()) {
                    return;
                }

                vm.loading = true;

                const data = angular.copy(vm.materiaForm);

                if (vm.editMode) {
                    ApiService.materias.update(data.id, data)
                        .then(function (response) {
                            NotificationService.success('Materia actualizada correctamente');
                            vm.closeModal();
                            vm.loadMaterias();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al actualizar materia: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                } else {
                    ApiService.materias.create(data)
                        .then(function (response) {
                            NotificationService.success('Materia creada correctamente');
                            vm.closeModal();
                            vm.loadMaterias();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al crear materia: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                }
            };

            // Eliminar materia
            vm.deleteMateria = function (materia) {
                NotificationService.confirm(
                    '¿Estás seguro de que quieres eliminar esta materia? Esta acción no se puede deshacer.',
                    'Confirmar eliminación',
                    function (confirmed) {
                        if (confirmed) {
                            vm.loading = true;

                            ApiService.materias.delete(materia.id)
                                .then(function (response) {
                                    NotificationService.success('Materia eliminada correctamente');
                                    vm.loadMaterias();
                                })
                                .catch(function (error) {
                                    NotificationService.error('Error al eliminar materia: ' + error.message);
                                })
                                .finally(function () {
                                    vm.loading = false;
                                });
                        }
                    }
                );
            };

            // Cambiar estado de materia
            vm.changeEstado = function (materia, nuevoEstado) {
                const data = { estado: nuevoEstado };

                ApiService.materias.update(materia.id, data)
                    .then(function (response) {
                        NotificationService.success('Estado de materia actualizado');
                        vm.loadMaterias();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cambiar estado: ' + error.message);
                    });
            };

            // Validar formulario
            vm.validateForm = function () {
                if (!vm.materiaForm.nombre) {
                    NotificationService.warning('Por favor, ingresa el nombre de la materia');
                    return false;
                }
                if (!vm.materiaForm.codigo) {
                    NotificationService.warning('Por favor, ingresa el código de la materia');
                    return false;
                }
                if (!vm.materiaForm.profesor_id) {
                    NotificationService.warning('Por favor, selecciona un profesor');
                    return false;
                }
                if (vm.materiaForm.creditos <= 0) {
                    NotificationService.warning('Los créditos deben ser mayores a 0');
                    return false;
                }
                if (vm.materiaForm.horas_teoricas < 0 || vm.materiaForm.horas_practicas < 0) {
                    NotificationService.warning('Las horas no pueden ser negativas');
                    return false;
                }

                return true;
            };

            // Obtener nombre de profesor
            vm.getProfesorNombre = function (profesorId) {
                if (!vm.profesores || !Array.isArray(vm.profesores)) {
                    return 'N/A';
                }
                const profesor = vm.profesores.find(p => p.id === profesorId);
                return profesor ? (profesor.nombre + ' ' + profesor.apellido) : 'N/A';
            };

            // Obtener color de estado
            vm.getEstadoColor = function (estado) {
                const colors = {
                    'activa': 'success',
                    'inactiva': 'secondary',
                    'completada': 'info',
                    'suspendida': 'warning'
                };
                return colors[estado] || 'secondary';
            };

            // Formatear fecha
            vm.formatDate = function (date) {
                return moment(date).format('DD/MM/YYYY');
            };

            // Calcular horas totales
            vm.getHorasTotales = function (materia) {
                return (materia.horas_teoricas || 0) + (materia.horas_practicas || 0);
            };

            // Verificar si la materia está activa
            vm.isMateriaActiva = function (materia) {
                if (materia.estado !== 'activa') return false;

                const hoy = moment();
                const fechaInicio = moment(materia.fecha_inicio);
                const fechaFin = moment(materia.fecha_fin);

                return hoy.isBetween(fechaInicio, fechaFin, 'day', '[]');
            };

            // Exportar materias
            vm.exportMaterias = function () {
                // Implementar exportación
                NotificationService.info('Función de exportación en desarrollo');
            };

            // Importar materias
            vm.importMaterias = function () {
                // Implementar importación
                NotificationService.info('Función de importación en desarrollo');
            };

            // Ver detalles de materia
            vm.viewDetails = function (materia) {
                // Implementar vista de detalles
                NotificationService.info('Vista de detalles en desarrollo');
            };

            // Inicializar controlador
            vm.init();

        }]);
})();