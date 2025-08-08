import { useAuthStore } from '@/stores/authStore'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useBootstrap } from '@/hooks/useBootstrap'

export function Header() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  // Inicializar Bootstrap
  useBootstrap()

  const navItems = [
    { path: '/dashboard', icon: 'bi-house', label: 'Dashboard' },
    { path: '/horarios', icon: 'bi-calendar3', label: 'Horarios' },
    { path: '/materias', icon: 'bi-book', label: 'Materias' },
    { path: '/contenidos', icon: 'bi-file-text', label: 'Contenidos' },
    { path: '/evaluaciones', icon: 'bi-clipboard-check', label: 'Evaluaciones' },
    { path: '/notificaciones', icon: 'bi-bell', label: 'Notificaciones' },
  ]

  // Solo mostrar Profesores para admin o profesor
  if (user?.rol === 'admin' || user?.rol === 'profesor') {
    navItems.push({ path: '/profesores', icon: 'bi-person-badge', label: 'Profesores' })
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    logout()
  }

  const handleDropdownClick = (e: React.MouseEvent, option: string) => {
    e.preventDefault()
    toast(`${option} - Función en desarrollo`, {
      duration: 2000,
    })
  }

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    // Si no es dashboard, mostrar toast de desarrollo
    if (path !== '/dashboard') {
      e.preventDefault()
      const label = path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)
      toast(`${label} - Función en desarrollo`, {
        duration: 2000,
      })
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          <i className="bi bi-mortarboard-fill me-2"></i>
          TUPAD Organizador
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path

              return (
                <li className="nav-item" key={item.path}>
                  <Link
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                  >
                    <i className={`${item.icon} me-1`}></i>
                    {item.label}
                    {item.path === '/notificaciones' && (
                      <span className="badge bg-danger ms-1">3</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1"></i>
                {user?.nombre} {user?.apellido}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="#" onClick={(e) => handleDropdownClick(e, 'Mi Perfil')}>
                    <i className="bi bi-person me-2"></i>
                    Mi Perfil
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" onClick={(e) => handleDropdownClick(e, 'Estadísticas')}>
                    <i className="bi bi-graph-up me-2"></i>
                    Estadísticas
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item" href="#" onClick={(e) => handleDropdownClick(e, 'Cambiar Tema')}>
                    <i className="bi bi-sun me-2"></i>
                    Tema Claro
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item" href="#" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
