import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Home,
  RotateCcw,
  Download,
  FileText,
  ClipboardCheck
} from 'lucide-react'

interface DashboardStats {
  totalMaterias: number
  totalHorarios: number
  totalContenidos: number
  totalEvaluaciones: number
  evaluacionesPendientes: number
  proximasClases: number
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterias: 0,
    totalHorarios: 0,
    totalContenidos: 0,
    totalEvaluaciones: 0,
    evaluacionesPendientes: 0,
    proximasClases: 0,
  })

  useEffect(() => {
    // Simular carga de datos
    setLoading(true)
    setTimeout(() => {
      setStats({
        totalMaterias: 12,
        totalHorarios: 48,
        totalContenidos: 25,
        totalEvaluaciones: 8,
        evaluacionesPendientes: 3,
        proximasClases: 5,
      })
      setLoading(false)
    }, 1000)
  }, [])

  const refreshDashboard = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
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
              <Home className="me-2" />
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
              <RotateCcw className="me-1" size={16} />
              Actualizar
            </button>
            <button
              className="btn btn-outline-light"
              onClick={exportReport}
            >
              <Download className="me-1" size={16} />
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
                      <BookOpen size={32} />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <a href="#/materias" className="text-decoration-none">
                      Ver todas <i className="bi bi-arrow-right"></i>
                    </a>
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
                      <Calendar size={32} />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <a href="#/horarios" className="text-decoration-none">
                      Ver horarios <i className="bi bi-arrow-right"></i>
                    </a>
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
                      <FileText size={32} />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <a href="#/contenidos" className="text-decoration-none">
                      Ver contenidos <i className="bi bi-arrow-right"></i>
                    </a>
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
                      <ClipboardCheck size={32} />
                    </div>
                  </div>
                  <div className="stat-footer">
                    <a href="#/evaluaciones" className="text-decoration-none">
                      Ver evaluaciones <i className="bi bi-arrow-right"></i>
                    </a>
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
                    <TrendingUp className="me-2" />
                    Acciones Rápidas
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 col-sm-6 mb-3">
                      <button className="btn btn-outline-primary w-100">
                        <i className="bi bi-plus-circle me-2"></i>
                        Nueva Materia
                      </button>
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
