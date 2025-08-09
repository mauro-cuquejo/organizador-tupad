(function () {
    'use strict';

    angular.module('tupadApp')
        .service('CacheService', function () {
            var cache = {};
            var cacheExpiry = {};

            // Configuración de caché (5 minutos por defecto)
            var DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

            // Obtener datos del caché
            this.get = function (key) {
                if (!cache[key]) {
                    return null;
                }

                // Verificar si el caché ha expirado
                if (cacheExpiry[key] && Date.now() > cacheExpiry[key]) {
                    this.remove(key);
                    return null;
                }

                return cache[key];
            };

            // Guardar datos en caché
            this.set = function (key, data, ttl) {
                cache[key] = data;
                cacheExpiry[key] = Date.now() + (ttl || DEFAULT_TTL);
            };

            // Remover del caché
            this.remove = function (key) {
                delete cache[key];
                delete cacheExpiry[key];
            };

            // Limpiar todo el caché
            this.clear = function () {
                cache = {};
                cacheExpiry = {};
            };

            // Limpiar caché por patrón
            this.clearByPattern = function (pattern) {
                var keys = Object.keys(cache);
                keys.forEach(function (key) {
                    if (key.includes(pattern)) {
                        this.remove(key);
                    }
                }.bind(this));
            };

            // Limpiar caché de horarios
            this.clearHorarios = function () {
                this.clearByPattern('horarios_');
            };

            // Limpiar caché de materias
            this.clearMaterias = function () {
                this.clearByPattern('materias_');
            };

            // Limpiar caché de profesores
            this.clearProfesores = function () {
                this.clearByPattern('profesores_');
            };

            // Limpiar caché de evaluaciones
            this.clearEvaluaciones = function () {
                this.clearByPattern('evaluaciones_');
            };

            // Limpiar caché de contenidos
            this.clearContenidos = function () {
                this.clearByPattern('contenidos_');
            };

            // Obtener estadísticas del caché
            this.getStats = function () {
                var keys = Object.keys(cache);
                var expired = 0;
                var valid = 0;

                keys.forEach(function (key) {
                    if (cacheExpiry[key] && Date.now() > cacheExpiry[key]) {
                        expired++;
                    } else {
                        valid++;
                    }
                });

                return {
                    total: keys.length,
                    valid: valid,
                    expired: expired
                };
            };

            // Limpiar caché expirado
            this.cleanup = function () {
                var keys = Object.keys(cache);
                keys.forEach(function (key) {
                    if (cacheExpiry[key] && Date.now() > cacheExpiry[key]) {
                        this.remove(key);
                    }
                }.bind(this));
            };

            // Ejecutar limpieza automática cada minuto
            setInterval(function () {
                this.cleanup();
            }.bind(this), 60 * 1000);
        });
})();