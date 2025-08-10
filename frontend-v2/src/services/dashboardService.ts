import { api } from './api'

export interface DashboardStats {
  total_materias: number
  total_horarios: number
  total_contenidos: number
  total_evaluaciones: number
  evaluaciones_proximas: number
  contenidos_recientes: number
}

export const dashboardService = {
  // Obtener estadísticas del dashboard
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/dashboard/stats')
    return response.data.stats
  }
}
