import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <main className="container p-4">
        <Outlet />
      </main>
    </div>
  )
}
