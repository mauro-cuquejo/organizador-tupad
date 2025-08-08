// Tipos de usuario
export interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'admin' | 'profesor' | 'estudiante'
  createdAt: string
  updatedAt: string
}

// Tipos de autenticación
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  nombre: string
  apellido: string
  email: string
  password: string
  rol: 'profesor' | 'estudiante'
}

export interface AuthResponse {
  token: string
  user: User
}

// Tipos de API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Tipos de materias
export interface Materia {
  id: number
  nombre: string
  codigo: string
  descripcion?: string
  creditos: number
  profesorId?: number
  createdAt: string
  updatedAt: string
}

// Tipos de horarios
export interface Horario {
  id: number
  materiaId: number
  dia: string
  horaInicio: string
  horaFin: string
  aula: string
  tipo: 'teoria' | 'practica' | 'laboratorio'
  createdAt: string
  updatedAt: string
}

// Tipos de profesores
export interface Profesor {
  id: number
  nombre: string
  apellido: string
  email: string
  especialidad?: string
  createdAt: string
  updatedAt: string
}

// Tipos de notificaciones
export interface Notificacion {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Tipos de componentes UI
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type SpinnerSize = 'sm' | 'md' | 'lg'
