import { api } from './api'
import { LoginCredentials, RegisterData, User } from '@/stores/authStore'

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  user: User
}

export interface RegisterResponse {
  success: boolean
  message: string
  user: User
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error: any) {
      console.error('Error en login:', error)
      throw new Error(error.response?.data?.message || 'Error en el login')
    }
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', data)
      return response.data
    } catch (error: any) {
      console.error('Error en registro:', error)
      throw new Error(error.response?.data?.message || 'Error en el registro')
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error: any) {
      console.error('Error obteniendo perfil:', error)
      throw new Error(error.response?.data?.message || 'Error obteniendo perfil')
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error: any) {
      console.error('Error en logout:', error)
      // No lanzamos error en logout para no interrumpir el flujo
    }
  },
}
