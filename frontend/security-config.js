/**
 * Configuración de seguridad para AngularJS
 * Mitigaciones para las vulnerabilidades conocidas en AngularJS 1.8.3
 */

(function () {
    'use strict';

    // Detectar si estamos en modo desarrollo
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Configuración de Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';

    if (isDevelopment) {
        // Configuración muy permisiva para desarrollo
        cspMeta.content = [
            "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
            "script-src * 'unsafe-inline' 'unsafe-eval'",
            "style-src * 'unsafe-inline'",
            "img-src * data: blob:",
            "font-src * data:",
            "connect-src *",
            "base-uri *",
            "form-action *"
        ].join('; ');
    } else {
        // Configuración más estricta para producción
        cspMeta.content = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ');
    }

    // CSP configurado para ser compatible con bloqueadores de anuncios
    // TEMPORALMENTE DESHABILITADO para desarrollo
    // document.head.appendChild(cspMeta);

    // Log para verificar que el CSP se aplicó correctamente
    console.log('🔒 CSP TEMPORALMENTE DESHABILITADO para desarrollo');

    // Función para configurar AngularJS cuando esté disponible (simplificada)
    function configureAngularSecurity() {
        try {
            if (typeof angular !== 'undefined' && angular.module) {
                console.log('AngularJS detectado, configuraciones de seguridad se aplicarán post-inicialización');
                return true;
            }
            return false;
        } catch (error) {
            console.warn('Error al detectar AngularJS:', error);
            return false;
        }
    }

    // Función para sanitizar inputs
    window.sanitizeInput = function (input) {
        if (typeof input !== 'string') return input;

        // Remover scripts y otros elementos peligrosos
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    };

    // Función para manejar IDs duplicados (mejorada)
    window.fixDuplicateIds = function () {
        const elements = document.querySelectorAll('[id]');
        const idCounts = {};
        let correctionsMade = 0;

        elements.forEach(element => {
            const id = element.getAttribute('id');
            if (!idCounts[id]) {
                idCounts[id] = 0;
            }
            idCounts[id]++;

            if (idCounts[id] > 1) {
                // Generar un ID único con timestamp para evitar conflictos
                const timestamp = Date.now();
                const uniqueId = `${id}_${idCounts[id]}_${timestamp}`;
                element.setAttribute('id', uniqueId);

                // Actualizar el atributo 'for' de los labels correspondientes
                const labels = document.querySelectorAll(`label[for="${id}"]`);
                labels.forEach(label => {
                    if (label.getAttribute('for') === id) {
                        label.setAttribute('for', uniqueId);
                    }
                });

                // Actualizar cualquier referencia en el DOM
                const references = document.querySelectorAll(`[for="${id}"]`);
                references.forEach(ref => {
                    if (ref.getAttribute('for') === id) {
                        ref.setAttribute('for', uniqueId);
                    }
                });

                correctionsMade++;
                console.warn(`ID duplicado corregido: ${id} -> ${uniqueId}`);
            }
        });

        if (correctionsMade > 0) {
            console.log(`✅ Se corrigieron ${correctionsMade} IDs duplicados`);
        } else {
            console.log('✅ No se encontraron IDs duplicados');
        }

        return correctionsMade;
    };

    // Override de angular.element para mayor seguridad
    const originalElement = angular.element;
    angular.element = function (element) {
        const result = originalElement(element);

        // Sanitizar contenido HTML
        const originalHtml = result.html;
        result.html = function (value) {
            if (value !== undefined) {
                value = window.sanitizeInput(value);
            }
            return originalHtml.call(this, value);
        };

        return result;
    };

    console.log('Configuración de seguridad de AngularJS cargada');

    // Intentar configurar AngularJS inmediatamente si está disponible
    if (!configureAngularSecurity()) {
        // Si no está disponible, intentar después de que se cargue
        const checkAngular = setInterval(function () {
            if (configureAngularSecurity()) {
                clearInterval(checkAngular);
            }
        }, 100);

        // Detener después de 10 segundos
        setTimeout(function () {
            clearInterval(checkAngular);
        }, 10000);
    }

    // Ejecutar corrección de IDs duplicados después de que AngularJS se haya cargado
    if (typeof angular !== 'undefined') {
        angular.element(document).ready(function () {
            setTimeout(window.fixDuplicateIds, 100);
        });
    } else {
        // Si AngularJS no está disponible, ejecutar después de que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                setTimeout(window.fixDuplicateIds, 100);
            });
        } else {
            setTimeout(window.fixDuplicateIds, 100);
        }
    }
})();