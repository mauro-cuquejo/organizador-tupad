import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Materias', href: '/materias', icon: BookOpenIcon },
  { name: 'Horarios', href: '/horarios', icon: ClockIcon },
  { name: 'Profesores', href: '/profesores', icon: UserGroupIcon },
  { name: 'Estadísticas', href: '/estadisticas', icon: ChartBarIcon },
  { name: 'Notificaciones', href: '/notificaciones', icon: BellIcon },
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
              <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
