import { useAuthStore } from '@/stores/authStore'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Popover } from '@headlessui/react'
import { Fragment, useState, useEffect, useRef } from 'react'
import {
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  UserGroupIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

export function Header() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/horarios', icon: CalendarIcon, label: 'Horarios' },
    { path: '/materias', icon: BookOpenIcon, label: 'Materias' },
    { path: '/contenidos', icon: DocumentTextIcon, label: 'Contenidos' },
    { path: '/evaluaciones', icon: ClipboardDocumentCheckIcon, label: 'Evaluaciones' },
    { path: '/notificaciones', icon: BellIcon, label: 'Notificaciones' },
  ]

  // Solo mostrar Profesores para admin o profesor
  if (user?.rol === 'admin' || user?.rol === 'profesor') {
    navItems.push({ path: '/profesores', icon: UserGroupIcon, label: 'Profesores' })
  }

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 992 // Bootstrap lg breakpoint
      if (mobile !== isMobile) {
        setIsMobile(mobile)
        // Cerrar dropdown cuando cambia el tamaño de pantalla
        setIsUserMenuOpen(false)
      }
    }

    // Verificar tamaño inicial
    checkScreenSize()

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [isMobile])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  const handleDropdownClick = (option: string) => {
    toast(`${option} - Función en desarrollo`, {
      duration: 2000,
    })
    setIsUserMenuOpen(false)
  }

  const handleNavClick = (path: string) => {
    // Si no es dashboard, mostrar toast de desarrollo
    if (path !== '/dashboard') {
      const label = path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)
      toast(`${label} - Función en desarrollo`, {
        duration: 2000,
      })
    }
  }

  const userMenuItems = [
    { id: 'profile', label: 'Mi Perfil', icon: 'bi-person', action: () => handleDropdownClick('Mi Perfil') },
    { id: 'stats', label: 'Estadísticas', icon: 'bi-graph-up', action: () => handleDropdownClick('Estadísticas') },
    { id: 'theme', label: 'Tema Claro', icon: SunIcon, action: () => handleDropdownClick('Cambiar Tema') },
    { id: 'logout', label: 'Cerrar Sesión', icon: ArrowRightOnRectangleIcon, action: handleLogout }
  ]

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          <i className="bi bi-mortarboard-fill me-2"></i>
          TUPAD Organizador
        </Link>

        {/* Mobile menu */}
        <Popover as="div" className="d-lg-none">
          {({ open }) => (
            <>
              <Popover.Button className="navbar-toggler border-0">
                {open ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </Popover.Button>
              <Popover.Panel className="navbar-collapse position-absolute top-100 start-0 w-100 bg-primary">
                <ul className="navbar-nav me-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                      <li className="nav-item" key={item.path}>
                        <Link
                          className={`nav-link ${isActive ? 'active' : ''}`}
                          to={item.path}
                          onClick={() => handleNavClick(item.path)}
                        >
                          <Icon className="w-5 h-5 me-1" />
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
                  <li className="nav-item dropdown" ref={dropdownRef}>
                    <button
                      className="nav-link dropdown-toggle d-flex align-items-center"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <UserCircleIcon className="w-5 h-5 me-1" />
                      {user?.nombre} {user?.apellido}
                      <ChevronDownIcon className="w-4 h-4 ms-1" />
                    </button>
                    {isUserMenuOpen && (
                      <div className="dropdown-menu dropdown-menu-end position-absolute show">
                        {userMenuItems.map((item) => (
                          <button
                            key={item.id}
                            className="dropdown-item"
                            onClick={item.action}
                          >
                            {typeof item.icon === 'string' ? (
                              <i className={`${item.icon} me-2`}></i>
                            ) : (
                              <item.icon className="w-4 h-4 me-2" />
                            )}
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                </ul>
              </Popover.Panel>
            </>
          )}
        </Popover>

        {/* Desktop menu */}
        <div className="navbar-collapse d-none d-lg-flex">
          <ul className="navbar-nav me-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <li className="nav-item" key={item.path}>
                  <Link
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    to={item.path}
                    onClick={() => handleNavClick(item.path)}
                  >
                    <Icon className="w-5 h-5 me-1" />
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
            <li className="nav-item dropdown" ref={dropdownRef}>
              <button
                className="nav-link dropdown-toggle d-flex align-items-center"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <UserCircleIcon className="w-5 h-5 me-1" />
                {user?.nombre} {user?.apellido}
                <ChevronDownIcon className="w-4 h-4 ms-1" />
              </button>
              {isUserMenuOpen && (
                <div className="dropdown-menu dropdown-menu-end position-absolute show">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.id}
                      className="dropdown-item"
                      onClick={item.action}
                    >
                      {typeof item.icon === 'string' ? (
                        <i className={`${item.icon} me-2`}></i>
                      ) : (
                        <item.icon className="w-4 h-4 me-2" />
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
