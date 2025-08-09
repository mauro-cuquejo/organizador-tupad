/**
 * Servicio para detectar bloqueadores de anuncios y proporcionar alternativas
 */
(function () {
    'use strict';

    angular.module('tupadApp')
        .factory('AdBlockDetectorService', ['$http', '$q', function ($http, $q) {

            var service = {};
            var isAdBlockDetected = false;
            var fallbackMode = false;

            // Detectar bloqueador de anuncios
            service.detectAdBlock = function () {
                var deferred = $q.defer();

                // Método 1: Intentar cargar un archivo que típicamente es bloqueado
                var testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

                $http.get(testUrl, { timeout: 3000 })
                    .then(function () {
                        // Si se carga exitosamente, probablemente no hay bloqueador
                        isAdBlockDetected = false;
                        fallbackMode = false;
                        console.log('✅ No se detectó bloqueador de anuncios');
                        deferred.resolve({ detected: false, mode: 'normal' });
                    })
                    .catch(function (error) {
                        // Si falla, probablemente hay un bloqueador
                        isAdBlockDetected = true;
                        fallbackMode = true;
                        console.warn('⚠️ Bloqueador de anuncios detectado, activando modo fallback');
                        deferred.resolve({ detected: true, mode: 'fallback' });
                    });

                return deferred.promise;
            };

            // Verificar si estamos en modo fallback
            service.isFallbackMode = function () {
                return fallbackMode;
            };

            // Verificar si se detectó bloqueador
            service.isAdBlockDetected = function () {
                return isAdBlockDetected;
            };

            // Configurar interceptores HTTP para modo fallback
            service.configureFallbackInterceptors = function ($httpProvider) {
                if (!fallbackMode) return;

                // Interceptor para manejar errores de bloqueador
                $httpProvider.interceptors.push(['$q', function ($q) {
                    return {
                        request: function (config) {
                            // Agregar headers adicionales para evitar bloqueo
                            config.headers = config.headers || {};
                            config.headers['X-Requested-With'] = 'XMLHttpRequest';
                            config.headers['Cache-Control'] = 'no-cache';

                            // Cambiar el User-Agent para evitar detección
                            if (config.url && config.url.includes('localhost:3000')) {
                                config.headers['User-Agent'] = 'TUPAD-Client/1.0';
                            }

                            return config;
                        },
                        responseError: function (rejection) {
                            // Si es un error de bloqueo, intentar con método alternativo
                            if (rejection.status === 0 || rejection.status === -1) {
                                console.warn('⚠️ Posible bloqueo detectado, intentando método alternativo');

                                // Intentar con fetch nativo como fallback
                                return service.fallbackRequest(rejection.config);
                            }
                            return $q.reject(rejection);
                        }
                    };
                }]);
            };

            // Método de fallback usando fetch nativo
            service.fallbackRequest = function (config) {
                var deferred = $q.defer();

                // Convertir configuración de $http a fetch
                var fetchConfig = {
                    method: config.method || 'GET',
                    headers: config.headers || {},
                    mode: 'cors',
                    credentials: 'omit'
                };

                if (config.data) {
                    fetchConfig.body = JSON.stringify(config.data);
                    fetchConfig.headers['Content-Type'] = 'application/json';
                }

                fetch(config.url, fetchConfig)
                    .then(function (response) {
                        if (!response.ok) {
                            throw new Error('HTTP ' + response.status);
                        }
                        return response.json();
                    })
                    .then(function (data) {
                        deferred.resolve({
                            data: data,
                            status: 200,
                            config: config,
                            headers: function () { return {}; }
                        });
                    })
                    .catch(function (error) {
                        deferred.reject({
                            data: null,
                            status: -1,
                            config: config,
                            statusText: error.message
                        });
                    });

                return deferred.promise;
            };

            // Configurar modo de desarrollo para evitar bloqueos
            service.configureDevelopmentMode = function () {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('🔧 Configurando modo desarrollo para evitar bloqueos');

                    // Agregar meta tags para evitar detección
                    var meta = document.createElement('meta');
                    meta.name = 'robots';
                    meta.content = 'noindex, nofollow';
                    document.head.appendChild(meta);

                    // Configurar CSP más permisivo para desarrollo
                    var cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                    if (cspMeta) {
                        cspMeta.content = cspMeta.content.replace(
                            /connect-src[^;]+/,
                            "connect-src 'self' http://localhost:* https://localhost:* ws: wss: data: blob:"
                        );
                    }
                }
            };

            // Inicializar el servicio
            service.init = function () {
                // Configurar modo desarrollo
                service.configureDevelopmentMode();

                // Detectar bloqueador
                return service.detectAdBlock().then(function (result) {
                    if (result.detected) {
                        console.warn('🚫 Bloqueador de anuncios detectado');
                        console.warn('💡 El sistema funcionará en modo fallback');
                        console.warn('💡 Para mejor experiencia, considera deshabilitar el bloqueador para localhost');
                    }
                    return result;
                });
            };

            return service;
        }]);

})();
