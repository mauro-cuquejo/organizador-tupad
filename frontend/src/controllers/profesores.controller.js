(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('ProfesoresController', ['$scope', '$http', 'ApiService', 'NotificationService', 'StorageService', 'moment', function ($scope, $http, ApiService, NotificationService, StorageService, moment) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.profesores = [];
            vm.selectedProfesor = null;
            vm.showModal = false;
            vm.editMode = false;
            vm.currentPage = 1;
            vm.itemsPerPage = 10;
            vm.totalItems = 0;

            // Filtros y búsqueda
            vm.filters = {
                nombre: '',
                apellido: '',
                email: '',
                especialidad: '',
                estado: ''
            };

            // Formulario de profesor
            vm.profesorForm = {
                id: null,
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                especialidad: '',
                titulo: '',
                departamento: '',
                fecha_contratacion: '',
                estado: 'activo',
                biografia: '',
                horario_consultas: '',
                oficina: '',
                observaciones: ''
            };

            // Estados
            vm.estados = [
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'jubilado', label: 'Jubilado' },
                { value: 'licencia', label: 'En Licencia' }
            ];

            // Títulos académicos
            vm.titulos = [
                { value: 'licenciado', label: 'Licenciado' },
                { value: 'ingeniero', label: 'Ingeniero' },
                { value: 'magister', label: 'Magíster' },
                { value: 'doctor', label: 'Doctor' },
                { value: 'phd', label: 'PhD' },
                { value: 'otro', label: 'Otro' }
            ];

            // Departamentos
            vm.departamentos = [
                { value: 'informatica', label: 'Informática' },
                { value: 'matematicas', label: 'Matemáticas' },
                { value: 'fisica', label: 'Física' },
                { value: 'quimica', label: 'Química' },
                { value: 'biologia', label: 'Biología' },
                { value: 'administracion', label: 'Administración' },
                { value: 'economia', label: 'Economía' },
                { value: 'otro', label: 'Otro' }
            ];

            // Inicialización
            vm.init = function () {
                vm.loadProfesores();
            };

            // Cargar profesores
            vm.loadProfesores = function () {
                vm.loading = true;

                const params = {
                    page: vm.currentPage,
                    limit: vm.itemsPerPage,
                    ...vm.filters
                };

                ApiService.profesores.getAll(params)
                    .then(function (response) {
                        vm.profesores = response.profesores || [];
                        vm.totalItems = response.total || 0;
                        vm.applyFilters();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cargar profesores: ' + error.message);
                        vm.profesores = [];
                        vm.totalItems = 0;
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            };

            // Aplicar filtros
            vm.applyFilters = function () {
                vm.currentPage = 1;
                vm.loadProfesores();
            };

            // Limpiar filtros
            vm.clearFilters = function () {
                vm.filters = {
                    nombre: '',
                    apellido: '',
                    email: '',
                    especialidad: '',
                    estado: ''
                };
                vm.applyFilters();
            };

            // Cambiar página
            vm.changePage = function (page) {
                vm.currentPage = page;
                vm.loadProfesores();
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
            vm.openModal = function (profesor) {
                vm.editMode = !!profesor;
                vm.selectedProfesor = profesor;

                if (profesor) {
                    vm.profesorForm = angular.copy(profesor);
                    // Convertir fecha a formato local
                    if (vm.profesorForm.fecha_contratacion) {
                        vm.profesorForm.fecha_contratacion = moment(vm.profesorForm.fecha_contratacion).format('YYYY-MM-DD');
                    }
                } else {
                    vm.resetForm();
                }

                vm.showModal = true;
            };

            // Cerrar modal
            vm.closeModal = function () {
                vm.showModal = false;
                vm.selectedProfesor = null;
                vm.resetForm();
            };

            // Resetear formulario
            vm.resetForm = function () {
                vm.profesorForm = {
                    id: null,
                    nombre: '',
                    apellido: '',
                    email: '',
                    telefono: '',
                    especialidad: '',
                    titulo: '',
                    departamento: '',
                    fecha_contratacion: '',
                    estado: 'activo',
                    biografia: '',
                    horario_consultas: '',
                    oficina: '',
                    observaciones: ''
                };
            };

            // Guardar profesor
            vm.saveProfesor = function () {
                if (!vm.validateForm()) {
                    return;
                }

                vm.loading = true;

                const data = angular.copy(vm.profesorForm);

                if (vm.editMode) {
                    ApiService.profesores.update(data.id, data)
                        .then(function (response) {
                            NotificationService.success('Profesor actualizado correctamente');
                            vm.closeModal();
                            vm.loadProfesores();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al actualizar profesor: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                } else {
                    ApiService.profesores.create(data)
                        .then(function (response) {
                            NotificationService.success('Profesor creado correctamente');
                            vm.closeModal();
                            vm.loadProfesores();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al crear profesor: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                }
            };

            // Eliminar profesor
            vm.deleteProfesor = function (profesor) {
                NotificationService.confirm(
                    '¿Estás seguro de que quieres eliminar este profesor? Esta acción no se puede deshacer.',
                    'Confirmar eliminación',
                    function (confirmed) {
                        if (confirmed) {
                            vm.loading = true;

                            ApiService.profesores.delete(profesor.id)
                                .then(function (response) {
                                    NotificationService.success('Profesor eliminado correctamente');
                                    vm.loadProfesores();
                                })
                                .catch(function (error) {
                                    NotificationService.error('Error al eliminar profesor: ' + error.message);
                                })
                                .finally(function () {
                                    vm.loading = false;
                                });
                        }
                    }
                );
            };

            // Cambiar estado de profesor
            vm.changeEstado = function (profesor, nuevoEstado) {
                const data = { estado: nuevoEstado };

                ApiService.profesores.update(profesor.id, data)
                    .then(function (response) {
                        NotificationService.success('Estado de profesor actualizado');
                        vm.loadProfesores();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cambiar estado: ' + error.message);
                    });
            };

            // Validar formulario
            vm.validateForm = function () {
                if (!vm.profesorForm.nombre) {
                    NotificationService.warning('Por favor, ingresa el nombre del profesor');
                    return false;
                }
                if (!vm.profesorForm.apellido) {
                    NotificationService.warning('Por favor, ingresa el apellido del profesor');
                    return false;
                }
                if (!vm.profesorForm.email) {
                    NotificationService.warning('Por favor, ingresa el email del profesor');
                    return false;
                }
                if (!vm.profesorForm.especialidad) {
                    NotificationService.warning('Por favor, ingresa la especialidad del profesor');
                    return false;
                }

                // Validar formato de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(vm.profesorForm.email)) {
                    NotificationService.warning('Por favor, ingresa un email válido');
                    return false;
                }

                return true;
            };

            // Obtener color de estado
            vm.getEstadoColor = function (estado) {
                const colors = {
                    'activo': 'success',
                    'inactivo': 'secondary',
                    'jubilado': 'info',
                    'licencia': 'warning'
                };
                return colors[estado] || 'secondary';
            };

            // Obtener color de departamento
            vm.getDepartamentoColor = function (departamento) {
                const colors = {
                    'informatica': 'primary',
                    'matematicas': 'success',
                    'fisica': 'info',
                    'quimica': 'warning',
                    'biologia': 'danger',
                    'administracion': 'secondary',
                    'economia': 'dark',
                    'otro': 'light'
                };
                return colors[departamento] || 'light';
            };

            // Formatear fecha
            vm.formatDate = function (date) {
                return moment(date).format('DD/MM/YYYY');
            };

            // Calcular años de experiencia
            vm.getAniosExperiencia = function (profesor) {
                if (!profesor.fecha_contratacion) return 'N/A';

                const fechaContratacion = moment(profesor.fecha_contratacion);
                const ahora = moment();
                const anios = ahora.diff(fechaContratacion, 'years');

                if (anios === 0) {
                    const meses = ahora.diff(fechaContratacion, 'months');
                    return `${meses} mes${meses > 1 ? 'es' : ''}`;
                }

                return `${anios} año${anios > 1 ? 's' : ''}`;
            };

            // Obtener iniciales
            vm.getIniciales = function (profesor) {
                const nombre = profesor.nombre || '';
                const apellido = profesor.apellido || '';
                return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
            };

            // Enviar email
            vm.sendEmail = function (profesor) {
                if (profesor.email) {
                    window.open(`mailto:${profesor.email}`, '_blank');
                } else {
                    NotificationService.warning('No hay email disponible para este profesor');
                }
            };

            // Llamar por teléfono
            vm.callPhone = function (profesor) {
                if (profesor.telefono) {
                    window.open(`tel:${profesor.telefono}`, '_blank');
                } else {
                    NotificationService.warning('No hay teléfono disponible para este profesor');
                }
            };

            // Exportar profesores
            vm.exportProfesores = function () {
                // Implementar exportación
                NotificationService.info('Función de exportación en desarrollo');
            };

            // Importar profesores
            vm.importProfesores = function () {
                // Implementar importación
                NotificationService.info('Función de importación en desarrollo');
            };

            // Ver detalles de profesor
            vm.viewDetails = function (profesor) {
                // Implementar vista de detalles
                NotificationService.info('Vista de detalles en desarrollo');
            };

            // Inicializar controlador
            vm.init();

        }]);
})();