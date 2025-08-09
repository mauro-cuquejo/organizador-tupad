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

export interface MateriaDetailResponse {
  materia: Materia
  horarios: any[]
  cronograma: any[]
  evaluaciones: any[]
  estadisticas: {
    total_horarios: number
    total_contenidos: number
    total_evaluaciones: number
    total_profesores: number
    total_comisiones: number
  }
}

export interface MateriasFilters {
  page?: number
  limit?: number
  activo?: boolean
  creditos?: '1-3' | '4-6' | '7-9' | '10+'
  nombre?: string
  codigo?: string
}

export const materiasService = {
  // Obtener estadísticas de materias
  getStats: async (): Promise<MateriaStats> => {
    const response = await api.get('/materias/stats')
    return response.data.stats
  },

  // Obtener todas las materias con paginación y filtros
  getAll: async (params?: MateriasFilters): Promise<MateriasResponse> => {
    const response = await api.get('/materias', { params })
    return response.data
  },

  // Buscar materias por nombre o código
  search: async (query: string): Promise<Materia[]> => {
    const response = await api.get(`/materias/search/${encodeURIComponent(query)}`)
    return response.data.materias
  },

  // Obtener una materia específica
  getById: async (id: number): Promise<MateriaDetailResponse> => {
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
