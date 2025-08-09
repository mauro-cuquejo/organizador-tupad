/**
 * Configuración de CORS y conexiones para desarrollo
 * Maneja las conexiones al backend de forma segura
 */

(function () {
    'use strict';

    // Configuración de CORS para desarrollo
    const corsConfig = {
        // URLs permitidas para desarrollo
        allowedOrigins: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://localhost:3000',
            'https://127.0.0.1:3000'
        ],

        // Headers permitidos
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin'
        ],

        // Métodos permitidos
        allowedMethods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'OPTIONS'
        ]
    };

    // Función para verificar si una URL está permitida
    window.isAllowedOrigin = function (url) {
        try {
            const urlObj = new URL(url);
            return corsConfig.allowedOrigins.includes(urlObj.origin);
        } catch (e) {
            console.warn('URL inválida:', url);
            return false;
        }
    };

    // Función para agregar headers CORS a las peticiones
    window.addCorsHeaders = function (config) {
        if (!config.headers) {
            config.headers = {};
        }

        // Agregar headers CORS
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods'] = corsConfig.allowedMethods.join(', ');
        config.headers['Access-Control-Allow-Headers'] = corsConfig.allowedHeaders.join(', ');

        return config;
    };

    // Función para configurar CORS cuando AngularJS esté disponible (simplificada)
    function configureCORS() {
        try {
            if (typeof angular !== 'undefined' && angular.module) {
                console.log('CORS: AngularJS detectado, configuración se aplicará post-inicialización');
                return true;
            }
            return false;
        } catch (error) {
            console.warn('Error al detectar AngularJS para CORS:', error);
            return false;
        }
    }

    // Intentar detectar AngularJS
    if (!configureCORS()) {
        const checkAngular = setInterval(function () {
            if (configureCORS()) {
                clearInterval(checkAngular);
            }
        }, 100);

        setTimeout(function () {
            clearInterval(checkAngular);
        }, 10000);
    }

    console.log('Configuración de CORS cargada para desarrollo');
})();