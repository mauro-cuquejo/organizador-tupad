import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginCredentials, RegisterData } from '@/types'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true })
          const response = await authService.login(credentials)

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('¡Bienvenido!')
        } catch (error) {
          set({ isLoading: false })
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
          toast.error(message)
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })
          await authService.register(data)
          set({ isLoading: false })
          toast.success('Registro exitoso. Por favor, inicia sesión.')
        } catch (error) {
          set({ isLoading: false })
          const message = error instanceof Error ? error.message : 'Error en el registro'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
        toast.success('Sesión cerrada')
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true })
          const token = get().token

          if (!token) {
            set({ isLoading: false })
            return
          }

          const user = await authService.getProfile()
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
