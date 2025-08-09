import { api } from './api'

export interface MateriaStats {
  total_materias: number
  materias_activas: number
  materias_inactivas: number
  materias_unicas: number
}

export interface Materia {
  id: number
  nombre: string
  codigo: string
  descripcion: string
  creditos: number
  activo: number
  created_at: string
  updated_at: string
}

export interface MateriasResponse {
  materias: Materia[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const materiasService = {
  // Obtener estadísticas de materias
  getStats: async (): Promise<MateriaStats> => {
    const response = await api.get('/materias/stats')
    return response.data.stats
  },

  // Obtener todas las materias con paginación
  getAll: async (params?: {
    page?: number
    limit?: number
    activo?: boolean
  }): Promise<MateriasResponse> => {
    const response = await api.get('/materias', { params })
    return response.data
  },

  // Buscar materias por nombre o código
  search: async (query: string): Promise<Materia[]> => {
    const response = await api.get(`/materias/search/${encodeURIComponent(query)}`)
    return response.data.materias
  },

  // Obtener una materia específica
  getById: async (id: number): Promise<Materia> => {
    const response = await api.get(`/materias/${id}`)
    return response.data
  },

  // Crear nueva materia
  create: async (materia: {
    nombre: string
    codigo: string
    descripcion: string
    creditos: number
  }): Promise<Materia> => {
    const response = await api.post('/materias', materia)
    return response.data
  },

  // Actualizar materia
  update: async (id: number, materia: Partial<Materia>): Promise<Materia> => {
    const response = await api.put(`/materias/${id}`, materia)
    return response.data
  },

  // Eliminar materia
  delete: async (id: number): Promise<void> => {
    await api.delete(`/materias/${id}`)
  }
}
