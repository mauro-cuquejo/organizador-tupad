/**
 * Filtros para formateo de fechas
 */
(function () {
    'use strict';

    angular.module('tupadApp')
        .filter('formatDate', function () {
            return function (input, format) {
                if (!input) return '';

                var date = moment(input);
                if (!date.isValid()) return input;

                switch (format) {
                    case 'short':
                        return date.format('DD/MM/YYYY');
                    case 'long':
                        return date.format('DD [de] MMMM [de] YYYY');
                    case 'time':
                        return date.format('HH:mm');
                    case 'datetime':
                        return date.format('DD/MM/YYYY HH:mm');
                    case 'relative':
                        return date.fromNow();
                    case 'weekday':
                        return date.format('dddd');
                    case 'month':
                        return date.format('MMMM YYYY');
                    default:
                        return date.format('DD/MM/YYYY');
                }
            };
        })
        .filter('timeAgo', function () {
            return function (input) {
                if (!input) return '';

                var date = moment(input);
                if (!date.isValid()) return input;

                return date.fromNow();
            };
        })
        .filter('duration', function () {
            return function (input, unit) {
                if (!input) return '';

                var duration = moment.duration(input, unit || 'minutes');
                return duration.humanize();
            };
        })
        .filter('academicPeriod', function () {
            return function (input) {
                if (!input) return '';

                var date = moment(input);
                if (!date.isValid()) return input;

                var month = date.month();
                var year = date.year();

                // Primer semestre: Marzo - Julio
                if (month >= 2 && month <= 6) {
                    return 'Primer Semestre ' + year;
                }
                // Segundo semestre: Agosto - Diciembre
                else if (month >= 7 && month <= 11) {
                    return 'Segundo Semestre ' + year;
                }
                // Verano: Enero - Febrero
                else {
                    return 'Verano ' + year;
                }
            };
        });
})();