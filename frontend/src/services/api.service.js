'use strict';

angular.module('tupadApp')
    .service('ApiService', ['$http', '$q', 'localStorageService', 'CacheService', 'AdBlockDetectorService', function ($http, $q, localStorageService, CacheService, AdBlockDetectorService) {

        const API_BASE_URL = 'http://localhost:3000/api';

        // Configuración base de HTTP
        const httpConfig = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Función para hacer requests HTTP con fallback para bloqueadores
        function makeRequest(method, endpoint, data = null, config = {}) {
            const url = API_BASE_URL + endpoint;
            const requestConfig = angular.extend({}, httpConfig, config);

            // Si estamos en modo fallback, usar fetch nativo
            if (AdBlockDetectorService.isFallbackMode()) {
                return makeFallbackRequest(method, url, data, requestConfig);
            }

            let request;

            switch (method.toLowerCase()) {
                case 'get':
                    request = $http.get(url, requestConfig);
                    break;
                case 'post':
                    request = $http.post(url, data, requestConfig);
                    break;
                case 'put':
                    request = $http.put(url, data, requestConfig);
                    break;
                case 'delete':
                    request = $http.delete(url, requestConfig);
                    break;
                default:
                    return $q.reject(new Error('Método HTTP no válido'));
            }

            return request.then(function (response) {
                return response.data;
            }).catch(function (error) {
                console.error('Error en API request:', error);

                // Si es un error de bloqueo, intentar con fallback
                if (error.status === 0 || error.status === -1) {
                    console.warn('⚠️ Intentando fallback para bloqueador de anuncios...');
                    return makeFallbackRequest(method, url, data, requestConfig);
                }

                return $q.reject(error);
            });
        }

        // Función de fallback usando múltiples estrategias
        function makeFallbackRequest(method, url, data, config) {
            const deferred = $q.defer();

            // Obtener token de autenticación
            const token = localStorageService.get('tupadApp.authToken');

            // Estrategia 1: Fetch con configuración básica
            const tryFetchBasic = function () {
                const fetchConfig = {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    credentials: 'omit'
                };

                if (token) {
                    fetchConfig.headers['Authorization'] = 'Bearer ' + token;
                }

                if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
                    fetchConfig.body = JSON.stringify(data);
                }

                return fetch(url, fetchConfig);
            };

            // Estrategia 2: Fetch con configuración alternativa
            const tryFetchAlternative = function () {
                const fetchConfig = {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    mode: 'no-cors'
                };

                if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
                    fetchConfig.body = JSON.stringify(data);
                }

                return fetch(url, fetchConfig);
            };

            // Estrategia 3: XMLHttpRequest como último recurso
            const tryXHR = function () {
                return new Promise(function (resolve, reject) {
                    const xhr = new XMLHttpRequest();
                    xhr.open(method.toUpperCase(), url, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');

                    if (token) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    }

                    xhr.onload = function () {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (e) {
                                resolve(xhr.responseText);
                            }
                        } else {
                            reject(new Error('HTTP ' + xhr.status + ': ' + xhr.statusText));
                        }
                    };

                    xhr.onerror = function () {
                        reject(new Error('XHR Error'));
                    };

                    if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
                        xhr.send(JSON.stringify(data));
                    } else {
                        xhr.send();
                    }
                });
            };

            // Intentar estrategias en orden
            tryFetchBasic()
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                    }
                    return response.json();
                })
                .then(function (data) {
                    deferred.resolve(data);
                })
                .catch(function (error) {
                    console.warn('⚠️ Estrategia 1 falló, intentando estrategia 2...', error);

                    // Intentar estrategia 2
                    tryFetchAlternative()
                        .then(function (response) {
                            if (!response.ok) {
                                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                            }
                            return response.json();
                        })
                        .then(function (data) {
                            deferred.resolve(data);
                        })
                        .catch(function (error2) {
                            console.warn('⚠️ Estrategia 2 falló, intentando estrategia 3...', error2);

                            // Intentar estrategia 3 (XHR)
                            tryXHR()
                                .then(function (data) {
                                    deferred.resolve(data);
                                })
                                .catch(function (error3) {
                                    console.error('❌ Todas las estrategias de fallback fallaron:', error3);
                                    deferred.reject({
                                        data: null,
                                        status: -1,
                                        statusText: 'Todas las estrategias de fallback fallaron'
                                    });
                                });
                        });
                });

            return deferred.promise;
        }

        // Servicio de autenticación
        const auth = {
            login: function (credentials) {
                return makeRequest('POST', '/auth/login', credentials);
            },

            register: function (userData) {
                return makeRequest('POST', '/auth/register', userData);
            },

            getProfile: function () {
                return makeRequest('GET', '/auth/profile');
            },

            updateProfile: function (profileData) {
                return makeRequest('PUT', '/auth/profile', profileData);
            },

            changePassword: function (passwordData) {
                return makeRequest('PUT', '/auth/change-password', passwordData);
            },

            getNotificationConfig: function () {
                return makeRequest('GET', '/auth/notifications/config');
            },

            updateNotificationConfig: function (config) {
                return makeRequest('PUT', '/auth/notifications/config', config);
            },

            getUsers: function () {
                return makeRequest('GET', '/auth/users');
            },

            exportUserData: function () {
                return makeRequest('GET', '/auth/export-data');
            },

            deleteAccount: function () {
                return makeRequest('DELETE', '/auth/account');
            }
        };

        // Servicio de horarios
        const horarios = {
            getAll: function (params = {}) {
                const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                const endpoint = queryString ? `/horarios?${queryString}` : '/horarios';
                const cacheKey = 'horarios_all_' + queryString;

                // Intentar obtener del caché primero
                const cachedData = CacheService.get(cacheKey);
                if (cachedData) {
                    return $q.resolve(cachedData);
                }

                // Si no está en caché, hacer la petición
                return makeRequest('GET', endpoint).then(function (data) {
                    CacheService.set(cacheKey, data, 2 * 60 * 1000); // 2 minutos
                    return data;
                });
            },

            getById: function (id) {
                return makeRequest('GET', `/horarios/${id}`);
            },

            getByDay: function (day) {
                return makeRequest('GET', `/horarios/dia/${day}`);
            },

            getByMateria: function (materiaId) {
                return makeRequest('GET', `/horarios/materia/${materiaId}`);
            },

            getByProfesor: function (profesorId) {
                return makeRequest('GET', `/horarios/profesor/${profesorId}`);
            },

            getCount: function () {
                return makeRequest('GET', '/horarios/count');
            },

            getWeekly: function () {
                return makeRequest('GET', '/horarios/weekly');
            },

            create: function (horarioData) {
                return makeRequest('POST', '/horarios', horarioData).then(function (data) {
                    CacheService.clearHorarios();
                    return data;
                });
            },

            update: function (id, horarioData) {
                return makeRequest('PUT', `/horarios/${id}`, horarioData).then(function (data) {
                    CacheService.clearHorarios();
                    return data;
                });
            },

            delete: function (id) {
                return makeRequest('DELETE', `/horarios/${id}`).then(function (data) {
                    CacheService.clearHorarios();
                    return data;
                });
            }
        };

        // Servicio de materias
        const materias = {
            getAll: function (params = {}) {
                const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                const endpoint = queryString ? `/materias?${queryString}` : '/materias';
                const cacheKey = 'materias_all_' + queryString;

                // Intentar obtener del caché primero
                const cachedData = CacheService.get(cacheKey);
                if (cachedData) {
                    return $q.resolve(cachedData);
                }

                // Si no está en caché, hacer la petición
                return makeRequest('GET', endpoint).then(function (data) {
                    CacheService.set(cacheKey, data, 2 * 60 * 1000); // 2 minutos
                    return data;
                });
            },

            getById: function (id) {
                return makeRequest('GET', `/materias/${id}`);
            },

            search: function (query) {
                return makeRequest('GET', `/materias/search/${query}`);
            },

            getHorarios: function (id) {
                return makeRequest('GET', `/materias/${id}/horarios`);
            },

            getCronograma: function (id) {
                return makeRequest('GET', `/materias/${id}/cronograma`);
            },

            getEvaluaciones: function (id) {
                return makeRequest('GET', `/materias/${id}/evaluaciones`);
            },

            getCount: function () {
                return makeRequest('GET', '/materias/count');
            },

            getStats: function () {
                return makeRequest('GET', '/materias/stats');
            },

            create: function (materiaData) {
                return makeRequest('POST', '/materias', materiaData).then(function (data) {
                    CacheService.clearMaterias();
                    return data;
                });
            },

            update: function (id, materiaData) {
                return makeRequest('PUT', `/materias/${id}`, materiaData).then(function (data) {
                    CacheService.clearMaterias();
                    return data;
                });
            },

            delete: function (id) {
                return makeRequest('DELETE', `/materias/${id}`).then(function (data) {
                    CacheService.clearMaterias();
                    return data;
                });
            }
        };

        // Servicio de profesores
        const profesores = {
            getAll: function (params = {}) {
                const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                const endpoint = queryString ? `/profesores?${queryString}` : '/profesores';
                const cacheKey = 'profesores_all_' + queryString;

                // Intentar obtener del caché primero
                const cachedData = CacheService.get(cacheKey);
                if (cachedData) {
                    return $q.resolve(cachedData);
                }

                // Si no está en caché, hacer la petición
                return makeRequest('GET', endpoint).then(function (data) {
                    CacheService.set(cacheKey, data, 5 * 60 * 1000); // 5 minutos (profesores cambian menos)
                    return data;
                });
            },

            getById: function (id) {
                return makeRequest('GET', `/profesores/${id}`);
            },

            search: function (query) {
                return makeRequest('GET', `/profesores/search/${query}`);
            },

            getHorarios: function (id) {
                return makeRequest('GET', `/profesores/${id}/horarios`);
            },

            getMaterias: function (id) {
                return makeRequest('GET', `/profesores/${id}/materias`);
            },

            create: function (profesorData) {
                return makeRequest('POST', '/profesores', profesorData);
            },

            update: function (id, profesorData) {
                return makeRequest('PUT', `/profesores/${id}`, profesorData);
            },

            delete: function (id) {
                return makeRequest('DELETE', `/profesores/${id}`);
            }
        };

        // Servicio de contenidos
        const contenidos = {
            getAll: function (params = {}) {
                const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                const endpoint = queryString ? `/contenidos?${queryString}` : '/contenidos';
                return makeRequest('GET', endpoint);
            },

            getById: function (id) {
                return makeRequest('GET', `/contenidos/${id}`);
            },

            getPorSemana: function () {
                return makeRequest('GET', '/contenidos/por-semana');
            },

            getActual: function () {
                return makeRequest('GET', '/contenidos/actual');
            },

            search: function (query) {
                return makeRequest('GET', `/contenidos/search/${query}`);
            },

            getStats: function () {
                return makeRequest('GET', '/contenidos/stats/overview');
            },

            getCount: function () {
                return makeRequest('GET', '/contenidos/count');
            },

            getByMateria: function (materiaId) {
                return makeRequest('GET', `/contenidos/materia/${materiaId}`);
            },

            create: function (contenidoData, config = {}) {
                const url = API_BASE_URL + '/contenidos';
                const requestConfig = angular.extend({}, httpConfig, config);
                return $http.post(url, contenidoData, requestConfig)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (error) {
                        console.error('Error en API request:', error);
                        return $q.reject(error);
                    });
            },

            update: function (id, contenidoData, config = {}) {
                const url = API_BASE_URL + `/contenidos/${id}`;
                const requestConfig = angular.extend({}, httpConfig, config);
                return $http.put(url, contenidoData, requestConfig)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (error) {
                        console.error('Error en API request:', error);
                        return $q.reject(error);
                    });
            },

            delete: function (id) {
                return makeRequest('DELETE', `/contenidos/${id}`);
            }
        };

        // Servicio de evaluaciones
        const evaluaciones = {
            getAll: function (params = {}) {
                const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                const endpoint = queryString ? `/evaluaciones?${queryString}` : '/evaluaciones';
                return makeRequest('GET', endpoint);
            },

            getById: function (id) {
                return makeRequest('GET', `/evaluaciones/${id}`);
            },

            getProximas: function () {
                return makeRequest('GET', '/evaluaciones/proximas');
            },

            search: function (query) {
                return makeRequest('GET', `/evaluaciones/search/${query}`);
            },

            getNotasByUsuario: function (usuarioId) {
                return makeRequest('GET', `/evaluaciones/usuario/${usuarioId}/notas`);
            },

            getStats: function () {
                return makeRequest('GET', '/evaluaciones/stats');
            },

            create: function (evaluacionData) {
                return makeRequest('POST', '/evaluaciones', evaluacionData);
            },

            update: function (id, evaluacionData) {
                return makeRequest('PUT', `/evaluaciones/${id}`, evaluacionData);
            },

            delete: function (id) {
                return makeRequest('DELETE', `/evaluaciones/${id}`);
            },

            // Gestión de notas
            addNota: function (evaluacionId, notaData) {
                return makeRequest('POST', `/evaluaciones/${evaluacionId}/notas`, notaData);
            },

            updateNota: function (evaluacionId, notaId, notaData) {
                return makeRequest('PUT', `/evaluaciones/${evaluacionId}/notas/${notaId}`, notaData);
            },

            deleteNota: function (evaluacionId, notaId) {
                return makeRequest('DELETE', `/evaluaciones/${evaluacionId}/notas/${notaId}`);
            }
        };

        // Servicio de estadísticas
        const estadisticas = {
            getDashboardStats: function () {
                return makeRequest('GET', '/estadisticas/dashboard');
            },

            getAcademicStats: function (usuarioId) {
                return makeRequest('GET', `/estadisticas/academicas/${usuarioId}`);
            },

            getProgressStats: function (usuarioId) {
                return makeRequest('GET', `/estadisticas/progreso/${usuarioId}`);
            },

            exportStats: function (params = {}) {
                const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                const endpoint = queryString ? `/estadisticas/export?${queryString}` : '/estadisticas/export';
                return makeRequest('GET', endpoint);
            }
        };

        // Servicio de dashboard
        const dashboard = {
            getActivity: function () {
                return makeRequest('GET', '/dashboard/activity');
            },

            getUpcoming: function () {
                return makeRequest('GET', '/dashboard/upcoming');
            },

            getStats: function () {
                return makeRequest('GET', '/dashboard/stats');
            }
        };

        // Servicio de usuarios (para administradores)
        const usuarios = {
            getAll: function (params = {}) {
                const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                const endpoint = queryString ? `/usuarios?${queryString}` : '/usuarios';
                return makeRequest('GET', endpoint);
            },

            getById: function (id) {
                return makeRequest('GET', `/usuarios/${id}`);
            },

            updateRole: function (id, role) {
                return makeRequest('PATCH', `/usuarios/${id}/role`, { role: role });
            },

            updateStatus: function (id, status) {
                return makeRequest('PATCH', `/usuarios/${id}/status`, { status: status });
            },

            updatePassword: function (id, passwordData) {
                return makeRequest('PATCH', `/usuarios/${id}/password`, passwordData);
            },

            delete: function (id) {
                return makeRequest('DELETE', `/usuarios/${id}`);
            },

            getStats: function () {
                return makeRequest('GET', '/usuarios/stats/overview');
            }
        };

        // Servicio de notificaciones
        const notificaciones = {
            getAll: function () {
                return makeRequest('GET', '/notificaciones');
            },

            markAsRead: function (id) {
                return makeRequest('PUT', `/notificaciones/${id}/read`);
            },

            delete: function (id) {
                return makeRequest('DELETE', `/notificaciones/${id}`);
            }
        };

        // Retornar todos los servicios
        return {
            auth: auth,
            horarios: horarios,
            materias: materias,
            profesores: profesores,
            contenidos: contenidos,
            evaluaciones: evaluaciones,
            estadisticas: estadisticas,
            dashboard: dashboard,
            usuarios: usuarios,
            notificaciones: notificaciones,

            // Método genérico para requests personalizados
            request: makeRequest
        };
    }]);