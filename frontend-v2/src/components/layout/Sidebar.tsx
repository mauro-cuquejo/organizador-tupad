import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Users,
  FileText,
  BarChart3,
  Bell
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Materias', href: '/materias', icon: BookOpen },
  { name: 'Horarios', href: '/horarios', icon: Clock },
  { name: 'Profesores', href: '/profesores', icon: Users },
  { name: 'Contenidos', href: '/contenidos', icon: FileText },
  { name: 'Estadísticas', href: '/estadisticas', icon: BarChart3 },
  { name: 'Notificaciones', href: '/notificaciones', icon: Bell },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'mr-3 flex-shrink-0 h-6 w-6',
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  )
                }
              />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
