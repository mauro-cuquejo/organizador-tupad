import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { config, debugLog } from '@/config'

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout,
})

// Log de configuración en desarrollo
debugLog('API Configurada con:', {
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  environment: config.app.environment
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
    }

    // Manejar errores de red
    if (!error.response) {
      toast.error('Error de conexión. Verifica tu conexión a internet.')
    }

    // Manejar errores del servidor
    if (error.response?.status >= 500) {
      toast.error('Error del servidor. Intenta más tarde.')
    }

    return Promise.reject(error)
  }
)

// Funciones helper para hacer peticiones
export const apiClient = {
  get: <T = any>(url: string, config = {}) =>
    api.get<T>(url, config).then(response => response.data),

  post: <T = any>(url: string, data = {}, config = {}) =>
    api.post<T>(url, data, config).then(response => response.data),

  put: <T = any>(url: string, data = {}, config = {}) =>
    api.put<T>(url, data, config).then(response => response.data),

  delete: <T = any>(url: string, config = {}) =>
    api.delete<T>(url, config).then(response => response.data),

  patch: <T = any>(url: string, data = {}, config = {}) =>
    api.patch<T>(url, data, config).then(response => response.data),
}

export { api}
