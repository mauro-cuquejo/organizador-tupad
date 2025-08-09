(function () {
    'use strict';

    angular.module('tupadApp')
        .filter('formatDate', function () {
            return function (input, format) {
                if (!input) return 'N/A';

                var moment = window.moment;
                if (!moment) return input;

                var date = moment(input);
                if (!date.isValid()) return 'Fecha inválida';

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
                    case 'timeAgo':
                        return date.fromNow();
                    default:
                        return date.format('DD/MM/YYYY');
                }
            };
        })
        .filter('formatFileSize', function () {
            return function (bytes) {
                if (!bytes || bytes === 0) return '0 Bytes';

                var k = 1024;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                var i = Math.floor(Math.log(bytes) / Math.log(k));

                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };
        })
        .filter('formatDuration', function () {
            return function (minutes) {
                if (!minutes || minutes === 0) return '0 min';

                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;

                if (hours > 0) {
                    return hours + 'h ' + mins + 'min';
                } else {
                    return mins + ' min';
                }
            };
        })
        .filter('formatPhone', function () {
            return function (phone) {
                if (!phone) return '';

                // Remover todos los caracteres no numéricos
                var cleaned = phone.replace(/\D/g, '');

                // Formatear según el país (ejemplo para España)
                if (cleaned.length === 9) {
                    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
                } else if (cleaned.length === 12 && cleaned.startsWith('34')) {
                    return '+' + cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
                }

                return phone;
            };
        })
        .filter('formatCurrency', function () {
            return function (amount, currency) {
                if (!amount && amount !== 0) return 'N/A';

                currency = currency || 'EUR';
                var formatter = new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: currency
                });

                return formatter.format(amount);
            };
        })
        .filter('truncate', function () {
            return function (text, length, suffix) {
                if (!text) return '';

                length = length || 50;
                suffix = suffix || '...';

                if (text.length <= length) {
                    return text;
                }

                return text.substring(0, length) + suffix;
            };
        })
        .filter('capitalize', function () {
            return function (input) {
                if (!input) return '';

                return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
            };
        })
        .filter('titleCase', function () {
            return function (input) {
                if (!input) return '';

                return input.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            };
        })
        .filter('formatPercentage', function () {
            return function (value, decimals) {
                if (!value && value !== 0) return '0%';

                decimals = decimals || 1;
                return parseFloat(value).toFixed(decimals) + '%';
            };
        })
        .filter('formatNumber', function () {
            return function (number, decimals) {
                if (!number && number !== 0) return '0';

                decimals = decimals || 0;
                return parseFloat(number).toFixed(decimals);
            };
        })
        .filter('formatCreditos', function () {
            return function (creditos) {
                if (!creditos && creditos !== 0) return '0 créditos';

                return creditos + ' crédito' + (creditos !== 1 ? 's' : '');
            };
        })
        .filter('formatHoras', function () {
            return function (horas) {
                if (!horas && horas !== 0) return '0h';

                return horas + 'h';
            };
        })
        .filter('formatPuntaje', function () {
            return function (puntaje, total) {
                if (!puntaje && puntaje !== 0) return '0 pts';

                if (total) {
                    return puntaje + '/' + total + ' pts';
                }

                return puntaje + ' pts';
            };
        })
        .filter('formatEstado', function () {
            return function (estado) {
                if (!estado) return 'N/A';

                var estados = {
                    'activo': 'Activo',
                    'inactivo': 'Inactivo',
                    'pendiente': 'Pendiente',
                    'completado': 'Completado',
                    'vencido': 'Vencido',
                    'cancelado': 'Cancelado',
                    'en_proceso': 'En Proceso',
                    'jubilado': 'Jubilado',
                    'licencia': 'En Licencia',
                    'borrador': 'Borrador',
                    'archivado': 'Archivado',
                    'suspendido': 'Suspendido'
                };

                return estados[estado] || estado;
            };
        })
        .filter('formatTipo', function () {
            return function (tipo) {
                if (!tipo) return 'N/A';

                var tipos = {
                    'examen': 'Examen',
                    'quiz': 'Quiz',
                    'tarea': 'Tarea',
                    'proyecto': 'Proyecto',
                    'presentacion': 'Presentación',
                    'practica': 'Práctica',
                    'documento': 'Documento',
                    'video': 'Video',
                    'presentacion': 'Presentación',
                    'enlace': 'Enlace',
                    'imagen': 'Imagen',
                    'audio': 'Audio'
                };

                return tipos[tipo] || tipo;
            };
        })
        .filter('highlight', function ($sce) {
            return function (text, search) {
                if (!search || !text) return $sce.trustAsHtml(text);

                var regex = new RegExp('(' + search + ')', 'gi');
                var result = text.replace(regex, '<mark>$1</mark>');

                return $sce.trustAsHtml(result);
            };
        })
        .filter('orderByProperty', function () {
            return function (array, property, reverse) {
                if (!array || !property) return array;

                var sorted = array.sort(function (a, b) {
                    var aVal = a[property];
                    var bVal = b[property];

                    if (typeof aVal === 'string') {
                        aVal = aVal.toLowerCase();
                        bVal = bVal.toLowerCase();
                    }

                    if (aVal < bVal) return -1;
                    if (aVal > bVal) return 1;
                    return 0;
                });

                if (reverse) {
                    sorted.reverse();
                }

                return sorted;
            };
        })
        .filter('filterByMultiple', function () {
            return function (array, filters) {
                if (!array || !filters) return array;

                return array.filter(function (item) {
                    return Object.keys(filters).every(function (key) {
                        var filterValue = filters[key];
                        var itemValue = item[key];

                        if (!filterValue || filterValue === '') return true;

                        if (typeof itemValue === 'string') {
                            return itemValue.toLowerCase().includes(filterValue.toLowerCase());
                        }

                        return itemValue === filterValue;
                    });
                });
            };
        });
})();