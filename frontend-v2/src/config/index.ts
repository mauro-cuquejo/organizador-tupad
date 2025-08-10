import { getEnvironmentConfig } from './environments'

// Configuración centralizada de la aplicación
export const config = {
  // Información de la aplicación
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Organizador TUPaD',
    version: import.meta.env.VITE_APP_VERSION || '2.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    debug: import.meta.env.VITE_APP_DEBUG === 'true',
  },

  // Configuración de la API (usando configuración por entorno)
  get api() {
    const envConfig = getEnvironmentConfig()
    return {
      baseURL: import.meta.env.VITE_API_BASE_URL || envConfig.api.baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || envConfig.api.timeout.toString()),
      endpoints: {
        materias: '/api/materias',
        contenidos: '/api/contenidos',
        objetivos: '/api/objetivos',
        recursos: '/api/recursos',
        evaluaciones: '/api/evaluaciones',
        horarios: '/api/horarios',
        auth: '/api/auth',
        health: '/api/health',
      },
    }
  },

  // Configuración del servidor de desarrollo (usando configuración por entorno)
  get devServer() {
    const envConfig = getEnvironmentConfig()
    return {
      port: parseInt(import.meta.env.VITE_DEV_SERVER_PORT || envConfig.devServer.port.toString()),
      host: import.meta.env.VITE_DEV_SERVER_HOST === 'true' || envConfig.devServer.host,
      proxyTarget: import.meta.env.VITE_PROXY_TARGET || envConfig.devServer.proxyTarget,
    }
  },

  // Configuración de autenticación
  auth: {
    storageKey: import.meta.env.VITE_AUTH_STORAGE_KEY || 'tupad_auth_token',
    refreshInterval: parseInt(import.meta.env.VITE_AUTH_REFRESH_INTERVAL || '300000'),
  },

  // Configuración de la interfaz
  ui: {
    theme: 'light', // Por defecto
    language: 'es', // Por defecto
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
  },
}

// Función helper para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint: string): string => {
  const baseURL = config.api.baseURL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseURL}${cleanEndpoint}`
}

// Función helper para verificar si estamos en desarrollo
export const isDevelopment = (): boolean => {
  return config.app.environment === 'development'
}

// Función helper para verificar si el debug está habilitado
export const isDebugEnabled = (): boolean => {
  return config.app.debug
}

// Función helper para logging condicional
export const debugLog = (message: string, data?: any): void => {
  if (isDebugEnabled()) {
    console.log(`[DEBUG] ${message}`, data || '')
  }
}

export default config
