(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('HorariosController', ['$scope', '$http', 'ApiService', 'NotificationService', 'StorageService', 'moment', function ($scope, $http, ApiService, NotificationService, StorageService, moment) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.horarios = [];
            vm.filteredHorarios = [];
            vm.materias = [];
            vm.profesores = [];
            vm.currentWeek = moment().startOf('week');
            vm.selectedHorario = null;
            vm.showModal = false;
            vm.editMode = false;

            // Asegurar que las funciones de filtrado no se ejecuten hasta que los datos estén cargados
            vm.dataLoaded = {
                horarios: false,
                materias: false,
                profesores: false
            };

            // Filtros y búsqueda
            vm.filters = {
                materia: '',
                profesor: '',
                dia: '',
                hora: ''
            };

            // Formulario de horario
            vm.horarioForm = {
                id: null,
                materia_id: '',
                profesor_id: '',
                dia_semana: '',
                hora_inicio: '',
                hora_fin: '',
                aula: '',
                descripcion: '',
                estado: 'activo'
            };

            // Días de la semana
            vm.diasSemana = [
                { value: 'lunes', label: 'Lunes' },
                { value: 'martes', label: 'Martes' },
                { value: 'miercoles', label: 'Miércoles' },
                { value: 'jueves', label: 'Jueves' },
                { value: 'viernes', label: 'Viernes' },
                { value: 'sabado', label: 'Sábado' },
                { value: 'domingo', label: 'Domingo' }
            ];

            // Estados
            vm.estados = [
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'suspendido', label: 'Suspendido' }
            ];

            // Inicialización
            vm.init = function () {
                // Cargar datos en paralelo
                Promise.all([
                    vm.loadHorarios(),
                    vm.loadMaterias(),
                    vm.loadProfesores()
                ]).then(function () {
                    // Aplicar filtros después de que todos los datos estén cargados
                    vm.applyFilters();
                });
            };

            // Cargar horarios
            vm.loadHorarios = function () {
                vm.loading = true;

                return ApiService.horarios.getAll()
                    .then(function (response) {
                        vm.horarios = response || [];
                        vm.dataLoaded.horarios = true;
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cargar horarios: ' + error.message);
                        vm.horarios = [];
                        vm.dataLoaded.horarios = true;
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            };

            // Cargar materias
            vm.loadMaterias = function () {
                return ApiService.materias.getAll()
                    .then(function (response) {
                        vm.materias = response || [];
                        vm.dataLoaded.materias = true;
                    })
                    .catch(function (error) {
                        console.error('Error al cargar materias:', error);
                        vm.materias = [];
                        vm.dataLoaded.materias = true;
                    });
            };

            // Cargar profesores
            vm.loadProfesores = function () {
                return ApiService.profesores.getAll()
                    .then(function (response) {
                        vm.profesores = response || [];
                        vm.dataLoaded.profesores = true;
                    })
                    .catch(function (error) {
                        console.error('Error al cargar profesores:', error);
                        vm.profesores = [];
                        vm.dataLoaded.profesores = true;
                    });
            };

            // Aplicar filtros
            vm.applyFilters = function () {
                // No aplicar filtros hasta que todos los datos estén cargados
                if (!vm.dataLoaded.horarios || !vm.dataLoaded.materias || !vm.dataLoaded.profesores) {
                    return;
                }

                if (!vm.horarios || !Array.isArray(vm.horarios)) {
                    vm.filteredHorarios = [];
                    return;
                }

                vm.filteredHorarios = vm.horarios.filter(function (horario) {
                    if (!horario) return false;

                    const materiaNombre = vm.getMateriaNombre(horario.materia_id);
                    const profesorNombre = vm.getProfesorNombre(horario.profesor_id);

                    return (!vm.filters.materia || materiaNombre.toLowerCase().includes(vm.filters.materia.toLowerCase())) &&
                        (!vm.filters.profesor || profesorNombre.toLowerCase().includes(vm.filters.profesor.toLowerCase())) &&
                        (!vm.filters.dia || horario.dia_semana === vm.filters.dia) &&
                        (!vm.filters.hora || (horario.hora_inicio && horario.hora_inicio.includes(vm.filters.hora)));
                });
            };

            // Limpiar filtros
            vm.clearFilters = function () {
                vm.filters = {
                    materia: '',
                    profesor: '',
                    dia: '',
                    hora: ''
                };
                vm.applyFilters();
            };

            // Abrir modal para crear/editar
            vm.openModal = function (horario) {
                vm.editMode = !!horario;
                vm.selectedHorario = horario;

                if (horario) {
                    vm.horarioForm = angular.copy(horario);
                } else {
                    vm.resetForm();
                }

                vm.showModal = true;
            };

            // Cerrar modal
            vm.closeModal = function () {
                vm.showModal = false;
                vm.selectedHorario = null;
                vm.resetForm();
            };

            // Resetear formulario
            vm.resetForm = function () {
                vm.horarioForm = {
                    id: null,
                    materia_id: '',
                    profesor_id: '',
                    dia_semana: '',
                    hora_inicio: '',
                    hora_fin: '',
                    aula: '',
                    descripcion: '',
                    estado: 'activo'
                };
            };

            // Guardar horario
            vm.saveHorario = function () {
                if (!vm.validateForm()) {
                    return;
                }

                vm.loading = true;

                const data = angular.copy(vm.horarioForm);

                if (vm.editMode) {
                    ApiService.horarios.update(data.id, data)
                        .then(function (response) {
                            NotificationService.success('Horario actualizado correctamente');
                            vm.closeModal();
                            vm.loadHorarios();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al actualizar horario: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                } else {
                    ApiService.horarios.create(data)
                        .then(function (response) {
                            NotificationService.success('Horario creado correctamente');
                            vm.closeModal();
                            vm.loadHorarios();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al crear horario: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                }
            };

            // Eliminar horario
            vm.deleteHorario = function (horario) {
                NotificationService.confirm(
                    '¿Estás seguro de que quieres eliminar este horario?',
                    'Confirmar eliminación',
                    function (confirmed) {
                        if (confirmed) {
                            vm.loading = true;

                            ApiService.horarios.delete(horario.id)
                                .then(function (response) {
                                    NotificationService.success('Horario eliminado correctamente');
                                    vm.loadHorarios();
                                })
                                .catch(function (error) {
                                    NotificationService.error('Error al eliminar horario: ' + error.message);
                                })
                                .finally(function () {
                                    vm.loading = false;
                                });
                        }
                    }
                );
            };

            // Validar formulario
            vm.validateForm = function () {
                if (!vm.horarioForm.materia_id) {
                    NotificationService.warning('Por favor, selecciona una materia');
                    return false;
                }
                if (!vm.horarioForm.profesor_id) {
                    NotificationService.warning('Por favor, selecciona un profesor');
                    return false;
                }
                if (!vm.horarioForm.dia_semana) {
                    NotificationService.warning('Por favor, selecciona un día');
                    return false;
                }
                if (!vm.horarioForm.hora_inicio) {
                    NotificationService.warning('Por favor, ingresa la hora de inicio');
                    return false;
                }
                if (!vm.horarioForm.hora_fin) {
                    NotificationService.warning('Por favor, ingresa la hora de fin');
                    return false;
                }
                if (!vm.horarioForm.aula) {
                    NotificationService.warning('Por favor, ingresa el aula');
                    return false;
                }

                // Validar que hora_fin sea mayor que hora_inicio
                if (vm.horarioForm.hora_inicio >= vm.horarioForm.hora_fin) {
                    NotificationService.warning('La hora de fin debe ser mayor que la hora de inicio');
                    return false;
                }

                return true;
            };

            // Obtener nombre de materia
            vm.getMateriaNombre = function (materiaId) {
                if (!vm.materias || !Array.isArray(vm.materias)) {
                    return 'N/A';
                }
                const materia = vm.materias.find(m => m.id === materiaId);
                return materia ? materia.nombre : 'N/A';
            };

            // Obtener nombre de profesor
            vm.getProfesorNombre = function (profesorId) {
                if (!vm.profesores || !Array.isArray(vm.profesores)) {
                    return 'N/A';
                }
                const profesor = vm.profesores.find(p => p.id === profesorId);
                return profesor ? (profesor.nombre + ' ' + profesor.apellido) : 'N/A';
            };

            // Obtener etiqueta de día
            vm.getDiaLabel = function (dia) {
                const diaObj = vm.diasSemana.find(d => d.value === dia);
                return diaObj ? diaObj.label : dia;
            };

            // Obtener color de estado
            vm.getEstadoColor = function (estado) {
                const colors = {
                    'activo': 'success',
                    'inactivo': 'secondary',
                    'suspendido': 'warning'
                };
                return colors[estado] || 'secondary';
            };

            // Formatear hora
            vm.formatHora = function (hora) {
                return moment(hora, 'HH:mm').format('HH:mm');
            };

            // Navegar a semana anterior
            vm.previousWeek = function () {
                vm.currentWeek = moment(vm.currentWeek).subtract(1, 'week');
            };

            // Navegar a semana siguiente
            vm.nextWeek = function () {
                vm.currentWeek = moment(vm.currentWeek).add(1, 'week');
            };

            // Ir a semana actual
            vm.currentWeek = function () {
                vm.currentWeek = moment().startOf('week');
            };

            // Obtener horarios por día
            vm.getHorariosByDay = function (dia) {
                // Verificar que los datos estén cargados
                if (!vm.dataLoaded.horarios || !vm.filteredHorarios || !Array.isArray(vm.filteredHorarios)) {
                    return [];
                }

                return vm.filteredHorarios.filter(function (horario) {
                    return horario && horario.dia_semana === dia;
                });
            };

            // Exportar horarios
            vm.exportHorarios = function () {
                // Implementar exportación
                NotificationService.info('Función de exportación en desarrollo');
            };

            // Importar horarios
            vm.importHorarios = function () {
                // Implementar importación
                NotificationService.info('Función de importación en desarrollo');
            };

            // Inicializar controlador
            vm.init();

        }]);
})();