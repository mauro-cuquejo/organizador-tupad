/**
 * Filtros para formateo de roles
 */
(function () {
    'use strict';

    angular.module('tupadApp')
        .filter('roleLabel', function () {
            return function (input) {
                if (!input) return '';

                var labels = {
                    'admin': 'Administrador',
                    'profesor': 'Profesor',
                    'estudiante': 'Estudiante',
                    'coordinador': 'Coordinador',
                    'asistente': 'Asistente',
                    'tutor': 'Tutor'
                };

                return labels[input.toLowerCase()] || input;
            };
        })
        .filter('roleClass', function () {
            return function (input) {
                if (!input) return '';

                var classes = {
                    'admin': 'danger',
                    'profesor': 'primary',
                    'estudiante': 'success',
                    'coordinador': 'warning',
                    'asistente': 'info',
                    'tutor': 'secondary'
                };

                return classes[input.toLowerCase()] || 'secondary';
            };
        })
        .filter('roleIcon', function () {
            return function (input) {
                if (!input) return '';

                var icons = {
                    'admin': 'bi-shield-fill-check',
                    'profesor': 'bi-person-badge-fill',
                    'estudiante': 'bi-mortarboard-fill',
                    'coordinador': 'bi-person-workspace',
                    'asistente': 'bi-person-plus-fill',
                    'tutor': 'bi-person-heart'
                };

                return icons[input.toLowerCase()] || 'bi-person';
            };
        })
        .filter('roleDescription', function () {
            return function (input) {
                if (!input) return '';

                var descriptions = {
                    'admin': 'Acceso completo al sistema',
                    'profesor': 'Gestiona materias y evaluaciones',
                    'estudiante': 'Accede a contenidos académicos',
                    'coordinador': 'Coordina actividades académicas',
                    'asistente': 'Asiste en tareas administrativas',
                    'tutor': 'Guía y orienta estudiantes'
                };

                return descriptions[input.toLowerCase()] || 'Sin descripción';
            };
        })
        .filter('rolePermissions', function () {
            return function (input) {
                if (!input) return [];

                var permissions = {
                    'admin': [
                        'Gestionar usuarios',
                        'Configurar sistema',
                        'Ver estadísticas',
                        'Administrar materias',
                        'Gestionar evaluaciones',
                        'Enviar notificaciones'
                    ],
                    'profesor': [
                        'Gestionar materias propias',
                        'Crear evaluaciones',
                        'Calificar estudiantes',
                        'Subir contenidos',
                        'Ver reportes'
                    ],
                    'estudiante': [
                        'Ver horarios',
                        'Acceder a contenidos',
                        'Ver evaluaciones',
                        'Recibir notificaciones',
                        'Actualizar perfil'
                    ],
                    'coordinador': [
                        'Coordinar materias',
                        'Asignar profesores',
                        'Gestionar horarios',
                        'Ver reportes generales'
                    ],
                    'asistente': [
                        'Asistir en tareas',
                        'Ver información básica',
                        'Generar reportes simples'
                    ],
                    'tutor': [
                        'Orientar estudiantes',
                        'Ver progreso académico',
                        'Enviar mensajes'
                    ]
                };

                return permissions[input.toLowerCase()] || [];
            };
        });
})();