/**
 * Filtros para formateo de estados
 */
(function () {
    'use strict';

    angular.module('tupadApp')
        .filter('statusLabel', function () {
            return function (input) {
                if (!input) return '';

                var labels = {
                    'activo': 'Activo',
                    'inactivo': 'Inactivo',
                    'pendiente': 'Pendiente',
                    'completado': 'Completado',
                    'cancelado': 'Cancelado',
                    'en_proceso': 'En Proceso',
                    'aprobado': 'Aprobado',
                    'reprobado': 'Reprobado',
                    'ausente': 'Ausente',
                    'presente': 'Presente',
                    'publicado': 'Publicado',
                    'borrador': 'Borrador',
                    'archivado': 'Archivado'
                };

                return labels[input.toLowerCase()] || input;
            };
        })
        .filter('statusClass', function () {
            return function (input) {
                if (!input) return '';

                var classes = {
                    'activo': 'success',
                    'inactivo': 'secondary',
                    'pendiente': 'warning',
                    'completado': 'info',
                    'cancelado': 'danger',
                    'en_proceso': 'primary',
                    'aprobado': 'success',
                    'reprobado': 'danger',
                    'ausente': 'secondary',
                    'presente': 'success',
                    'publicado': 'success',
                    'borrador': 'warning',
                    'archivado': 'secondary'
                };

                return classes[input.toLowerCase()] || 'secondary';
            };
        })
        .filter('statusIcon', function () {
            return function (input) {
                if (!input) return '';

                var icons = {
                    'activo': 'bi-check-circle-fill',
                    'inactivo': 'bi-x-circle-fill',
                    'pendiente': 'bi-clock-fill',
                    'completado': 'bi-check-circle',
                    'cancelado': 'bi-x-circle',
                    'en_proceso': 'bi-arrow-clockwise',
                    'aprobado': 'bi-check-circle-fill',
                    'reprobado': 'bi-x-circle-fill',
                    'ausente': 'bi-person-x-fill',
                    'presente': 'bi-person-check-fill',
                    'publicado': 'bi-globe',
                    'borrador': 'bi-pencil-square',
                    'archivado': 'bi-archive-fill'
                };

                return icons[input.toLowerCase()] || 'bi-question-circle';
            };
        })
        .filter('evaluationStatus', function () {
            return function (input) {
                if (!input) return '';

                var status = {
                    'programada': 'Programada',
                    'en_curso': 'En Curso',
                    'finalizada': 'Finalizada',
                    'calificada': 'Calificada',
                    'cancelada': 'Cancelada'
                };

                return status[input.toLowerCase()] || input;
            };
        })
        .filter('contentStatus', function () {
            return function (input) {
                if (!input) return '';

                var status = {
                    'disponible': 'Disponible',
                    'no_disponible': 'No Disponible',
                    'en_revision': 'En Revisión',
                    'actualizado': 'Actualizado',
                    'obsoleto': 'Obsoleto'
                };

                return status[input.toLowerCase()] || input;
            };
        });
})();