/**
 * Configuración de seguridad post-inicialización
 * Se ejecuta después de que AngularJS esté completamente cargado
 */

(function () {
    'use strict';

    // Esperar a que AngularJS esté completamente inicializado
    function waitForAngular() {
        if (typeof angular !== 'undefined' && angular.element) {
            angular.element(document).ready(function () {
                console.log('🔒 Aplicando configuraciones de seguridad post-inicialización...');

                // Configurar SCE (Strict Contextual Escaping)
                try {
                    angular.module('tupadApp').config(['$sceProvider', function ($sceProvider) {
                        $sceProvider.enabled(true);
                        console.log('✅ SCE habilitado');
                    }]);
                } catch (e) {
                    console.warn('⚠️ No se pudo configurar SCE:', e.message);
                }

                // Configurar interceptor de seguridad y CORS
                try {
                    angular.module('tupadApp').factory('SecurityInterceptor', ['$sce', function ($sce) {
                        return {
                            request: function (config) {
                                // Sanitizar URLs
                                if (config.url && typeof config.url === 'string') {
                                    try {
                                        config.url = $sce.trustAsResourceUrl(config.url);
                                    } catch (e) {
                                        console.warn('URL no confiable:', config.url);
                                    }
                                }

                                // Agregar headers CORS para peticiones al backend
                                if (config.url && config.url.includes('localhost:3000') && typeof window.addCorsHeaders === 'function') {
                                    config = window.addCorsHeaders(config);
                                }

                                return config;
                            },
                            response: function (response) {
                                // Sanitizar datos de respuesta si es necesario
                                if (response.data && typeof response.data === 'string') {
                                    try {
                                        response.data = $sce.trustAsHtml(response.data);
                                    } catch (e) {
                                        console.warn('Datos de respuesta no confiables');
                                    }
                                }
                                return response;
                            },
                            responseError: function (rejection) {
                                // Manejar errores de CORS
                                if (rejection.status === 0) {
                                    console.error('Error de CORS o conexión rechazada:', rejection);
                                }
                                return rejection;
                            }
                        };
                    }]);

                    angular.module('tupadApp').config(['$httpProvider', function ($httpProvider) {
                        $httpProvider.interceptors.push('SecurityInterceptor');
                        console.log('✅ Interceptor de seguridad y CORS configurado');
                    }]);
                } catch (e) {
                    console.warn('⚠️ No se pudo configurar interceptor de seguridad:', e.message);
                }

                // Ejecutar corrección de IDs duplicados
                if (typeof window.fixDuplicateIds === 'function') {
                    setTimeout(function () {
                        const corrections = window.fixDuplicateIds();
                        console.log('✅ Corrección de IDs duplicados ejecutada');

                        // Si se corrigieron muchos IDs, puede haber un problema de duplicación
                        if (corrections > 5) {
                            console.warn('⚠️ Se detectaron muchos IDs duplicados. Esto puede indicar que el contenido se está renderizando múltiples veces.');
                            console.warn('💡 Recomendación: Verificar el routing de AngularJS y los controladores.');
                        }
                    }, 500);
                }

                // Configurar un watcher para detectar duplicaciones futuras
                try {
                    const originalCompile = angular.module('tupadApp')._invokeQueue.find(item =>
                        item[0] === '$compileProvider' && item[1] === 'directive'
                    );

                    if (originalCompile) {
                        console.log('🔍 Configurando watcher para detectar duplicaciones de contenido');
                    }
                } catch (e) {
                    console.warn('⚠️ No se pudo configurar watcher de duplicaciones:', e.message);
                }

                console.log('🔒 Configuraciones de seguridad aplicadas correctamente');

                // Detectar múltiples instancias de controladores
                setTimeout(function () {
                    detectMultipleControllers();
                }, 1000);
            });
        } else {
            // Si AngularJS no está disponible, reintentar en 100ms
            setTimeout(waitForAngular, 100);
        }
    }

    // Función para detectar múltiples instancias de controladores
    function detectMultipleControllers() {
        try {
            // Buscar elementos con el mismo ng-controller
            const controllers = {};
            const elements = document.querySelectorAll('[ng-controller]');

            elements.forEach(element => {
                const controllerName = element.getAttribute('ng-controller');
                if (!controllers[controllerName]) {
                    controllers[controllerName] = [];
                }
                controllers[controllerName].push(element);
            });

            // Verificar si hay múltiples instancias
            Object.keys(controllers).forEach(controllerName => {
                if (controllers[controllerName].length > 1) {
                    console.warn(`⚠️ Múltiples instancias del controlador '${controllerName}' detectadas:`, controllers[controllerName].length);
                    console.warn('💡 Esto puede causar IDs duplicados y problemas de rendimiento.');
                }
            });

            // Buscar formularios duplicados
            const forms = document.querySelectorAll('form');
            const formIds = {};

            forms.forEach(form => {
                const formName = form.getAttribute('name') || 'unnamed';
                if (!formIds[formName]) {
                    formIds[formName] = [];
                }
                formIds[formName].push(form);
            });

            Object.keys(formIds).forEach(formName => {
                if (formIds[formName].length > 1) {
                    console.warn(`⚠️ Múltiples formularios con nombre '${formName}' detectados:`, formIds[formName].length);
                    console.warn('💡 Esto indica que el contenido se está renderizando múltiples veces.');
                    console.warn('🔧 Solución: Verificar scripts duplicados en index.html');
                }
            });

            // Detectar scripts duplicados
            detectDuplicateScripts();

        } catch (e) {
            console.warn('⚠️ Error al detectar múltiples controladores:', e.message);
        }
    }

    // Función para detectar scripts duplicados
    function detectDuplicateScripts() {
        try {
            const scripts = document.querySelectorAll('script[src]');
            const scriptSources = {};
            const duplicates = [];

            scripts.forEach(script => {
                const src = script.getAttribute('src');
                if (!scriptSources[src]) {
                    scriptSources[src] = 0;
                }
                scriptSources[src]++;

                if (scriptSources[src] === 2) {
                    duplicates.push(src);
                }
            });

            if (duplicates.length > 0) {
                console.error('❌ Scripts duplicados detectados:', duplicates);
                console.error('💡 Esto puede causar problemas de renderizado y formularios duplicados.');
                console.error('🔧 Solución: Remover scripts duplicados del index.html');
            }

        } catch (e) {
            console.warn('⚠️ Error al detectar scripts duplicados:', e.message);
        }
    }

    // Iniciar el proceso cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForAngular);
    } else {
        waitForAngular();
    }

})();
