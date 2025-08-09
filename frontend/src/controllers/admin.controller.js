(function () {
    'use strict';

    angular.module('tupadApp')
        .controller('AdminController', ['$scope', '$location', 'ApiService', 'NotificationService', 'AuthService', function ($scope, $location, ApiService, NotificationService, AuthService) {

            var vm = this;

            // Propiedades del controlador
            vm.loading = false;
            vm.users = [];
            vm.filteredUsers = [];
            vm.stats = null;
            vm.searchTerm = '';
            vm.filterRol = '';
            vm.filterEstado = '';

            // Formularios
            vm.editForm = {
                id: null,
                nombre: '',
                apellido: '',
                email: '',
                rol: 'estudiante',
                activo: true
            };

            vm.passwordForm = {
                id: null,
                password: '',
                confirmPassword: ''
            };

            // Estados de modales
            vm.showEditModal = false;
            vm.showPasswordModal = false;

            // Inicialización
            vm.init = function () {
                vm.loadUsers();
                vm.loadStats();
            };

            // Cargar usuarios
            vm.loadUsers = function () {
                vm.loading = true;

                ApiService.usuarios.getAll()
                    .then(function (response) {
                        vm.users = response.usuarios || [];
                        vm.applyFilters();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al cargar usuarios: ' + (error.message || 'Error desconocido'));
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            };

            // Cargar estadísticas
            vm.loadStats = function () {
                ApiService.usuarios.getStats()
                    .then(function (response) {
                        vm.stats = response.stats;
                    })
                    .catch(function (error) {
                        console.error('Error al cargar estadísticas:', error);
                    });
            };

            // Aplicar filtros
            vm.applyFilters = function () {
                vm.filteredUsers = vm.users.filter(function (user) {
                    // Filtro de búsqueda
                    if (vm.searchTerm) {
                        const searchLower = vm.searchTerm.toLowerCase();
                        const matchesSearch =
                            user.nombre.toLowerCase().includes(searchLower) ||
                            user.apellido.toLowerCase().includes(searchLower) ||
                            user.email.toLowerCase().includes(searchLower);

                        if (!matchesSearch) return false;
                    }

                    // Filtro de rol
                    if (vm.filterRol && user.rol !== vm.filterRol) {
                        return false;
                    }

                    // Filtro de estado
                    if (vm.filterEstado !== '') {
                        const isActive = vm.filterEstado === 'true';
                        if (user.activo !== isActive) {
                            return false;
                        }
                    }

                    return true;
                });
            };

            // Limpiar filtros
            vm.clearFilters = function () {
                vm.searchTerm = '';
                vm.filterRol = '';
                vm.filterEstado = '';
                vm.applyFilters();
            };

            // Refrescar usuarios
            vm.refreshUsers = function () {
                vm.loadUsers();
                vm.loadStats();
            };

            // Verificar si es el último administrador
            vm.isLastAdmin = function (user) {
                if (user.rol !== 'admin') return false;

                const adminUsers = vm.users.filter(u => u.rol === 'admin' && u.activo);
                return adminUsers.length <= 1;
            };

            // Mostrar modal de creación de usuario
            vm.showCreateUserModal = function () {
                vm.editForm = {
                    id: null,
                    nombre: '',
                    apellido: '',
                    email: '',
                    rol: 'estudiante',
                    activo: true
                };
                vm.showEditModal = true;
            };

            // Editar usuario
            vm.editUser = function (user) {
                vm.editForm = {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    rol: user.rol,
                    activo: user.activo
                };
                vm.showEditModal = true;
            };

            // Cerrar modal de edición
            vm.closeEditModal = function () {
                vm.showEditModal = false;
                vm.editForm = {
                    id: null,
                    nombre: '',
                    apellido: '',
                    email: '',
                    rol: 'estudiante',
                    activo: true
                };
            };

            // Actualizar usuario
            vm.updateUser = function () {
                if (!vm.editForm.nombre || !vm.editForm.apellido || !vm.editForm.email) {
                    NotificationService.warning('Por favor, completa todos los campos requeridos');
                    return;
                }

                vm.loading = true;

                const updateData = {
                    nombre: vm.editForm.nombre,
                    apellido: vm.editForm.apellido,
                    email: vm.editForm.email,
                    rol: vm.editForm.rol,
                    activo: vm.editForm.activo
                };

                if (vm.editForm.id) {
                    // Actualizar usuario existente
                    ApiService.usuarios.updateRole(vm.editForm.id, vm.editForm.rol)
                        .then(function () {
                            return ApiService.usuarios.updateStatus(vm.editForm.id, vm.editForm.activo);
                        })
                        .then(function () {
                            NotificationService.success('Usuario actualizado exitosamente');
                            vm.closeEditModal();
                            vm.loadUsers();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al actualizar usuario: ' + (error.message || 'Error desconocido'));
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                } else {
                    // Crear nuevo usuario (usar endpoint de registro)
                    ApiService.auth.register(updateData)
                        .then(function () {
                            NotificationService.success('Usuario creado exitosamente');
                            vm.closeEditModal();
                            vm.loadUsers();
                            vm.loadStats();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al crear usuario: ' + (error.message || 'Error desconocido'));
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                }
            };

            // Cambiar contraseña
            vm.changePassword = function (user) {
                vm.passwordForm = {
                    id: user.id,
                    password: '',
                    confirmPassword: ''
                };
                vm.showPasswordModal = true;
            };

            // Cerrar modal de contraseña
            vm.closePasswordModal = function () {
                vm.showPasswordModal = false;
                vm.passwordForm = {
                    id: null,
                    password: '',
                    confirmPassword: ''
                };
            };

            // Actualizar contraseña
            vm.updatePassword = function () {
                if (!vm.passwordForm.password || vm.passwordForm.password.length < 6) {
                    NotificationService.warning('La contraseña debe tener al menos 6 caracteres');
                    return;
                }

                if (vm.passwordForm.password !== vm.passwordForm.confirmPassword) {
                    NotificationService.warning('Las contraseñas no coinciden');
                    return;
                }

                vm.loading = true;

                ApiService.usuarios.updatePassword(vm.passwordForm.id, {
                    password: vm.passwordForm.password
                })
                    .then(function () {
                        NotificationService.success('Contraseña actualizada exitosamente');
                        vm.closePasswordModal();
                    })
                    .catch(function (error) {
                        NotificationService.error('Error al actualizar contraseña: ' + (error.message || 'Error desconocido'));
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            };

            // Cambiar estado de usuario
            vm.toggleUserStatus = function (user) {
                const newStatus = !user.activo;
                const action = newStatus ? 'activar' : 'desactivar';

                if (vm.isLastAdmin(user) && !newStatus) {
                    NotificationService.warning('No se puede desactivar el último administrador del sistema');
                    return;
                }

                if (NotificationService.confirm(`¿Estás seguro de que quieres ${action} al usuario ${user.nombre} ${user.apellido}?`)) {
                    vm.loading = true;

                    ApiService.usuarios.updateStatus(user.id, newStatus)
                        .then(function () {
                            NotificationService.success(`Usuario ${action}do exitosamente`);
                            vm.loadUsers();
                            vm.loadStats();
                        })
                        .catch(function (error) {
                            NotificationService.error(`Error al ${action} usuario: ` + (error.message || 'Error desconocido'));
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                }
            };

            // Eliminar usuario
            vm.deleteUser = function (user) {
                if (vm.isLastAdmin(user)) {
                    NotificationService.warning('No se puede eliminar el último administrador del sistema');
                    return;
                }

                if (NotificationService.confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer.`)) {
                    vm.loading = true;

                    ApiService.usuarios.delete(user.id)
                        .then(function () {
                            NotificationService.success('Usuario eliminado exitosamente');
                            vm.loadUsers();
                            vm.loadStats();
                        })
                        .catch(function (error) {
                            NotificationService.error('Error al eliminar usuario: ' + (error.message || 'Error desconocido'));
                        })
                        .finally(function () {
                            vm.loading = false;
                        });
                }
            };

            // Watchers para filtros
            $scope.$watch('adminCtrl.searchTerm', function () {
                vm.applyFilters();
            });

            $scope.$watch('adminCtrl.filterRol', function () {
                vm.applyFilters();
            });

            $scope.$watch('adminCtrl.filterEstado', function () {
                vm.applyFilters();
            });

            // Inicializar
            vm.init();

        }]);
})();