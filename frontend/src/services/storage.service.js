(function () {
    'use strict';

    angular.module('tupadApp')
        .service('StorageService', ['localStorageService', '$q', function (localStorageService, $q) {

            // Prefijo para todas las claves
            const PREFIX = 'tupad_';

            // Métodos para localStorage
            this.set = function (key, value) {
                try {
                    const fullKey = PREFIX + key;
                    localStorageService.set(fullKey, value);
                    return true;
                } catch (error) {
                    console.error('Error al guardar en localStorage:', error);
                    return false;
                }
            };

            this.get = function (key, defaultValue) {
                try {
                    const fullKey = PREFIX + key;
                    const value = localStorageService.get(fullKey);
                    return value !== null ? value : defaultValue;
                } catch (error) {
                    console.error('Error al obtener de localStorage:', error);
                    return defaultValue;
                }
            };

            this.remove = function (key) {
                try {
                    const fullKey = PREFIX + key;
                    localStorageService.remove(fullKey);
                    return true;
                } catch (error) {
                    console.error('Error al eliminar de localStorage:', error);
                    return false;
                }
            };

            this.clear = function () {
                try {
                    localStorageService.clearAll();
                    return true;
                } catch (error) {
                    console.error('Error al limpiar localStorage:', error);
                    return false;
                }
            };

            // Métodos para sessionStorage
            this.setSession = function (key, value) {
                try {
                    const fullKey = PREFIX + key;
                    sessionStorage.setItem(fullKey, JSON.stringify(value));
                    return true;
                } catch (error) {
                    console.error('Error al guardar en sessionStorage:', error);
                    return false;
                }
            };

            this.getSession = function (key, defaultValue) {
                try {
                    const fullKey = PREFIX + key;
                    const value = sessionStorage.getItem(fullKey);
                    return value ? JSON.parse(value) : defaultValue;
                } catch (error) {
                    console.error('Error al obtener de sessionStorage:', error);
                    return defaultValue;
                }
            };

            this.removeSession = function (key) {
                try {
                    const fullKey = PREFIX + key;
                    sessionStorage.removeItem(fullKey);
                    return true;
                } catch (error) {
                    console.error('Error al eliminar de sessionStorage:', error);
                    return false;
                }
            };

            this.clearSession = function () {
                try {
                    sessionStorage.clear();
                    return true;
                } catch (error) {
                    console.error('Error al limpiar sessionStorage:', error);
                    return false;
                }
            };

            // Métodos para caché de datos
            this.setCache = function (key, data, ttl = 3600000) { // TTL por defecto: 1 hora
                const cacheData = {
                    data: data,
                    timestamp: Date.now(),
                    ttl: ttl
                };
                return this.set('cache_' + key, cacheData);
            };

            this.getCache = function (key) {
                const cacheData = this.get('cache_' + key);
                if (!cacheData) {
                    return null;
                }

                const now = Date.now();
                const isExpired = (now - cacheData.timestamp) > cacheData.ttl;

                if (isExpired) {
                    this.remove('cache_' + key);
                    return null;
                }

                return cacheData.data;
            };

            this.clearCache = function () {
                const keys = localStorageService.keys();
                const cacheKeys = keys.filter(key => key.startsWith(PREFIX + 'cache_'));
                cacheKeys.forEach(key => {
                    localStorageService.remove(key);
                });
            };

            // Métodos para datos de usuario
            this.setUserData = function (userData) {
                return this.set('user_data', userData);
            };

            this.getUserData = function () {
                return this.get('user_data');
            };

            this.clearUserData = function () {
                return this.remove('user_data');
            };

            // Métodos para configuración de la aplicación
            this.setAppConfig = function (config) {
                return this.set('app_config', config);
            };

            this.getAppConfig = function () {
                return this.get('app_config', {});
            };

            // Métodos para datos de formularios
            this.saveFormData = function (formName, data) {
                return this.set('form_' + formName, data);
            };

            this.getFormData = function (formName) {
                return this.get('form_' + formName);
            };

            this.clearFormData = function (formName) {
                return this.remove('form_' + formName);
            };

            // Método para obtener estadísticas de almacenamiento
            this.getStorageInfo = function () {
                const info = {
                    localStorage: {
                        used: 0,
                        available: 0
                    },
                    sessionStorage: {
                        used: 0,
                        available: 0
                    }
                };

                try {
                    // Calcular uso de localStorage
                    const keys = localStorageService.keys();
                    let used = 0;
                    keys.forEach(key => {
                        const value = localStorageService.get(key);
                        used += JSON.stringify(value).length;
                    });
                    info.localStorage.used = used;
                    info.localStorage.available = 5 * 1024 * 1024; // 5MB aproximado

                    // Calcular uso de sessionStorage
                    let sessionUsed = 0;
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        const value = sessionStorage.getItem(key);
                        sessionUsed += (key + value).length;
                    }
                    info.sessionStorage.used = sessionUsed;
                    info.sessionStorage.available = 5 * 1024 * 1024; // 5MB aproximado

                } catch (error) {
                    console.error('Error al obtener información de almacenamiento:', error);
                }

                return info;
            };

        }]);
})();