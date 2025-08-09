import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '@/services/dashboardService'
import toast from 'react-hot-toast'
import {
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  HomeIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalMaterias: number
  totalHorarios: number
  totalContenidos: number
  totalEvaluaciones: number
  evaluacionesPendientes: number
  proximasClases: number
}

export function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterias: 0,
    totalHorarios: 0,
    totalContenidos: 0,
    totalEvaluaciones: 0,
    evaluacionesPendientes: 0,
    proximasClases: 0,
  })

  const loadDashboardStats = async () => {
    setLoading(true)
    try {
      // Cargar estadísticas del dashboard desde el backend
      const dashboardStats = await dashboardService.getStats()

      setStats({
        totalMaterias: dashboardStats.total_materias,
        totalHorarios: dashboardStats.total_horarios,
        totalContenidos: dashboardStats.total_contenidos,
        totalEvaluaciones: dashboardStats.total_evaluaciones,
        evaluacionesPendientes: dashboardStats.evaluaciones_proximas,
        proximasClases: dashboardStats.contenidos_recientes,
      })
    } catch (error: any) {
      console.error('Error al cargar estadísticas del dashboard:', error)

      // Mostrar detalles del error
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        toast.error(`Error ${error.response.status}: ${error.response.data?.error || error.message}`)
      } else if (error.request) {
        console.error('Request error:', error.request)
        toast.error('Error de conexión con el servidor')
      } else {
        toast.error('Error al cargar estadísticas del dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const refreshDashboard = () => {
    loadDashboardStats()
  }

  const exportReport = () => {
    // Implementar exportación
    console.log('Exportando reporte...')
  }

  return (
    <div className="dashboard-page">
      {/* Header del Dashboard */}
      <div className="dashboard-header mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="dashboard-title">
              <HomeIcon className="w-8 h-8 me-2" />
              Dashboard
            </h1>
            <p className="dashboard-subtitle">
              Bienvenido al panel de control de TUPAD Organizador
            </p>
          </div>
          <div className="col-md-6 text-end">
            <button
              className="btn btn-outline-light me-2"
              onClick={refreshDashboard}
              disabled={loading}
            >
              <ArrowPathIcon className="w-4 h-4 me-1" />
              Actualizar
            </button>
            <button
              className="btn btn-outline-light"
              onClick={exportReport}
            >
              <ArrowDownTrayIcon className="w-4 h-4 me-1" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando estadísticas...</p>
        </div>
      )}

      {/* Estadísticas Principales */}
      {!loading && (
        <>
          <div className="row mb-4">
            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card stat-card stat-card-primary">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title text-muted">Total Materias</h6>
                      <h2 className="stat-number">{stats.totalMaterias}</h2>
                    </div>
                    <div className="stat-icon">
                      <BookOpenIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <Link to="/materias" className="text-decoration-none">
                      Ver todas <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card stat-card stat-card-success">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title text-muted">Horarios</h6>
                      <h2 className="stat-number">{stats.totalHorarios}</h2>
                    </div>
                    <div className="stat-icon">
                      <CalendarIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <Link to="/horarios" className="text-decoration-none">
                      Ver horarios <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card stat-card stat-card-info">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title text-muted">Contenidos</h6>
                      <h2 className="stat-number">{stats.totalContenidos}</h2>
                    </div>
                    <div className="stat-icon">
                      <DocumentTextIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <Link to="/contenidos" className="text-decoration-none">
                      Ver contenidos <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card stat-card stat-card-warning">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title text-muted">Evaluaciones</h6>
                      <h2 className="stat-number">{stats.totalEvaluaciones}</h2>
                    </div>
                    <div className="stat-icon">
                      <ClipboardDocumentCheckIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <Link to="/evaluaciones" className="text-decoration-none">
                      Ver evaluaciones <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <ChartBarIcon className="w-5 h-5 me-2" />
                    Acciones Rápidas
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 col-sm-6 mb-3">
                      <Link to="/materias" className="btn btn-outline-primary w-100">
                        <i className="bi bi-plus-circle me-2"></i>
                        Nueva Materia
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <button className="btn btn-outline-success w-100">
                        <i className="bi bi-calendar-plus me-2"></i>
                        Agregar Horario
                      </button>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <button className="btn btn-outline-info w-100">
                        <i className="bi bi-file-earmark-plus me-2"></i>
                        Subir Contenido
                      </button>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <button className="btn btn-outline-warning w-100">
                        <i className="bi bi-clipboard-plus me-2"></i>
                        Nueva Evaluación
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
