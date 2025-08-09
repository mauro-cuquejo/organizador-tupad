(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('ContenidosController', ['$scope', '$http', 'ApiService', 'NotificationService', 'StorageService', 'moment', function ($scope, $http, ApiService, NotificationService, StorageService, moment) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.contenidos = [];
            vm.materias = [];
            vm.selectedContenido = null;
            vm.showModal = false;
            vm.editMode = false;
            vm.currentPage = 1;
            vm.itemsPerPage = 10;
            vm.totalItems = 0;
            vm.uploadProgress = 0;

            // Filtros y búsqueda
            vm.filters = {
                titulo: '',
                materia: '',
                tipo: '',
                autor: '',
                fecha: ''
            };

            // Formulario de contenido
            vm.contenidoForm = {
                id: null,
                titulo: '',
                descripcion: '',
                tipo: 'documento',
                materia_id: '',
                autor: '',
                url: '',
                archivo: null,
                fecha_publicacion: '',
                estado: 'activo',
                etiquetas: '',
                observaciones: ''
            };

            // Tipos de contenido
            vm.tiposContenido = [
                { value: 'documento', label: 'Documento' },
                { value: 'video', label: 'Video' },
                { value: 'presentacion', label: 'Presentación' },
                { value: 'enlace', label: 'Enlace' },
                { value: 'imagen', label: 'Imagen' },
                { value: 'audio', label: 'Audio' },
                { value: 'otro', label: 'Otro' }
            ];

            // Estados
            vm.estados = [
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'borrador', label: 'Borrador' },
                { value: 'archivado', label: 'Archivado' }
            ];

            // Inicialización
            vm.init = function () {
                vm.loadContenidos();
                vm.loadMaterias();
            };

            // Cargar contenidos
            vm.loadContenidos = function () {
                vm.loading = true;

                const params = {
                    page: vm.currentPage,
                    limit: vm.itemsPerPage,
                    ...vm.filters
                };

                ApiService.contenidos.getAll(params)
                    .then(function (response) {
                        vm.contenidos = response.contenidos || [];
                        vm.totalItems = response.total || 0;
                        vm.applyFilters();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cargar contenidos: ' + error.message);
                        vm.contenidos = [];
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
                vm.loadContenidos();
            };

            // Limpiar filtros
            vm.clearFilters = function () {
                vm.filters = {
                    titulo: '',
                    materia: '',
                    tipo: '',
                    autor: '',
                    fecha: ''
                };
                vm.applyFilters();
            };

            // Cambiar página
            vm.changePage = function (page) {
                vm.currentPage = page;
                vm.loadContenidos();
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
            vm.openModal = function (contenido) {
                vm.editMode = !!contenido;
                vm.selectedContenido = contenido;

                if (contenido) {
                    vm.contenidoForm = angular.copy(contenido);
                    // Convertir fecha a formato local
                    if (vm.contenidoForm.fecha_publicacion) {
                        vm.contenidoForm.fecha_publicacion = moment(vm.contenidoForm.fecha_publicacion).format('YYYY-MM-DD');
                    }
                } else {
                    vm.resetForm();
                }

                vm.showModal = true;
            };

            // Cerrar modal
            vm.closeModal = function () {
                vm.showModal = false;
                vm.selectedContenido = null;
                vm.resetForm();
            };

            // Resetear formulario
            vm.resetForm = function () {
                vm.contenidoForm = {
                    id: null,
                    titulo: '',
                    descripcion: '',
                    tipo: 'documento',
                    materia_id: '',
                    autor: '',
                    url: '',
                    archivo: null,
                    fecha_publicacion: '',
                    estado: 'activo',
                    etiquetas: '',
                    observaciones: ''
                };
                vm.uploadProgress = 0;
            };

            // Manejar selección de archivo
            vm.onFileSelect = function (files) {
                if (files && files.length > 0) {
                    vm.contenidoForm.archivo = files[0];
                }
            };

            // Guardar contenido
            vm.saveContenido = function () {
                if (!vm.validateForm()) {
                    return;
                }

                vm.loading = true;

                const formData = new FormData();
                const data = angular.copy(vm.contenidoForm);

                // Agregar campos al FormData
                Object.keys(data).forEach(key => {
                    if (key !== 'archivo' && data[key] !== null && data[key] !== undefined) {
                        formData.append(key, data[key]);
                    }
                });

                // Agregar archivo si existe
                if (vm.contenidoForm.archivo) {
                    formData.append('archivo', vm.contenidoForm.archivo);
                }

                if (vm.editMode) {
                    ApiService.contenidos.update(data.id, formData, {
                        headers: { 'Content-Type': undefined },
                        transformRequest: angular.identity,
                        uploadEventHandlers: {
                            progress: function (e) {
                                vm.uploadProgress = Math.round((e.loaded * 100) / e.total);
                            }
                        }
                    })
                        .then(function (response) {
                            NotificationService.success('Contenido actualizado correctamente');
                            vm.closeModal();
                            vm.loadContenidos();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al actualizar contenido: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                            vm.uploadProgress = 0;
                        });
                } else {
                    ApiService.contenidos.create(formData, {
                        headers: { 'Content-Type': undefined },
                        transformRequest: angular.identity,
                        uploadEventHandlers: {
                            progress: function (e) {
                                vm.uploadProgress = Math.round((e.loaded * 100) / e.total);
                            }
                        }
                    })
                        .then(function (response) {
                            NotificationService.success('Contenido creado correctamente');
                            vm.closeModal();
                            vm.loadContenidos();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al crear contenido: ' + error.message);
                        })
                        .finally(function () {
                            vm.loading = false;
                            vm.uploadProgress = 0;
                        });
                }
            };

            // Eliminar contenido
            vm.deleteContenido = function (contenido) {
                NotificationService.confirm(
                    '¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer.',
                    'Confirmar eliminación',
                    function (confirmed) {
                        if (confirmed) {
                            vm.loading = true;

                            ApiService.contenidos.delete(contenido.id)
                                .then(function (response) {
                                    NotificationService.success('Contenido eliminado correctamente');
                                    vm.loadContenidos();
                                })
                                .catch(function (error) {
                                    NotificationService.error('Error al eliminar contenido: ' + error.message);
                                })
                                .finally(function () {
                                    vm.loading = false;
                                });
                        }
                    }
                );
            };

            // Descargar contenido
            vm.downloadContenido = function (contenido) {
                if (contenido.url) {
                    window.open(contenido.url, '_blank');
                } else if (contenido.archivo_url) {
                    window.open(contenido.archivo_url, '_blank');
                } else {
                    NotificationService.warning('No hay archivo disponible para descargar');
                }
            };

            // Validar formulario
            vm.validateForm = function () {
                if (!vm.contenidoForm.titulo) {
                    NotificationService.warning('Por favor, ingresa el título del contenido');
                    return false;
                }
                if (!vm.contenidoForm.materia_id) {
                    NotificationService.warning('Por favor, selecciona una materia');
                    return false;
                }
                if (!vm.contenidoForm.autor) {
                    NotificationService.warning('Por favor, ingresa el autor del contenido');
                    return false;
                }
                if (vm.contenidoForm.tipo === 'enlace' && !vm.contenidoForm.url) {
                    NotificationService.warning('Por favor, ingresa la URL del enlace');
                    return false;
                }
                if (vm.contenidoForm.tipo !== 'enlace' && !vm.contenidoForm.archivo && !vm.editMode) {
                    NotificationService.warning('Por favor, selecciona un archivo');
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
                    'documento': 'primary',
                    'video': 'danger',
                    'presentacion': 'warning',
                    'enlace': 'info',
                    'imagen': 'success',
                    'audio': 'secondary',
                    'otro': 'dark'
                };
                return colors[tipo] || 'secondary';
            };

            // Obtener icono de tipo
            vm.getTipoIcon = function (tipo) {
                const icons = {
                    'documento': 'bi-file-text',
                    'video': 'bi-camera-video',
                    'presentacion': 'bi-easel',
                    'enlace': 'bi-link-45deg',
                    'imagen': 'bi-image',
                    'audio': 'bi-music-note',
                    'otro': 'bi-file-earmark'
                };
                return icons[tipo] || 'bi-file-earmark';
            };

            // Obtener color de estado
            vm.getEstadoColor = function (estado) {
                const colors = {
                    'activo': 'success',
                    'inactivo': 'secondary',
                    'borrador': 'warning',
                    'archivado': 'dark'
                };
                return colors[estado] || 'secondary';
            };

            // Formatear fecha
            vm.formatDate = function (date) {
                return moment(date).format('DD/MM/YYYY');
            };

            // Formatear tamaño de archivo
            vm.formatFileSize = function (bytes) {
                if (!bytes) return 'N/A';

                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(1024));
                return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
            };

            // Exportar contenidos
            vm.exportContenidos = function () {
                // Implementar exportación
                NotificationService.info('Función de exportación en desarrollo');
            };

            // Importar contenidos
            vm.importContenidos = function () {
                // Implementar importación
                NotificationService.info('Función de importación en desarrollo');
            };

            // Ver detalles de contenido
            vm.viewDetails = function (contenido) {
                // Implementar vista de detalles
                NotificationService.info('Vista de detalles en desarrollo');
            };

            // Inicializar controlador
            vm.init();

        }]);
})();