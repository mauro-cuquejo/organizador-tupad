// Configuraciones específicas por entorno
export const environments = {
  development: {
    api: {
      baseURL: 'http://localhost:3001',
      timeout: 10000,
    },
    devServer: {
      port: 3000,
      host: true,
      proxyTarget: 'http://localhost:3001',
    },
    debug: true,
    logging: {
      level: 'debug',
      showApiCalls: true,
      showPerformance: true,
    },
  },

  staging: {
    api: {
      baseURL: 'https://staging-api.tupad.edu.ar',
      timeout: 15000,
    },
    devServer: {
      port: 3000,
      host: false,
      proxyTarget: 'https://staging-api.tupad.edu.ar',
    },
    debug: true,
    logging: {
      level: 'info',
      showApiCalls: true,
      showPerformance: false,
    },
  },

  production: {
    api: {
      baseURL: 'https://api.tupad.edu.ar',
      timeout: 20000,
    },
    devServer: {
      port: 80,
      host: false,
      proxyTarget: 'https://api.tupad.edu.ar',
    },
    debug: false,
    logging: {
      level: 'warn',
      showApiCalls: false,
      showPerformance: false,
    },
  },
}

// Función para obtener la configuración del entorno actual
export const getEnvironmentConfig = () => {
  const env = import.meta.env.VITE_APP_ENV || 'development'
  return environments[env as keyof typeof environments] || environments.development
}

// Función para verificar si estamos en un entorno específico
export const isEnvironment = (env: string): boolean => {
  return import.meta.env.VITE_APP_ENV === env
}

// Función para obtener la configuración de logging del entorno actual
export const getLoggingConfig = () => {
  const envConfig = getEnvironmentConfig()
  return envConfig.logging
}

// Función para verificar si debemos mostrar logs de API
export const shouldShowApiLogs = (): boolean => {
  const loggingConfig = getLoggingConfig()
  return loggingConfig.showApiCalls
}

// Función para verificar si debemos mostrar métricas de rendimiento
export const shouldShowPerformance = (): boolean => {
  const loggingConfig = getLoggingConfig()
  return loggingConfig.showPerformance
}
