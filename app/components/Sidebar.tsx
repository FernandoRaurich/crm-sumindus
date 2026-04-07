'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Pipeline', href: '/dashboard', icon: '▦' },
  { name: 'Nueva cotización', href: '/dashboard/cotizaciones/nueva', icon: '+' },
  { name: 'Historial precios', href: '/dashboard/historial', icon: '◷' },
  { name: 'Clientes', href: '/dashboard/clientes', icon: '◉' },
]

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">

      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <p className="text-white font-semibold text-sm">CRM Comercial</p>
        <p className="text-gray-500 text-xs mt-0.5">SUMINDUS · SP Rental</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
            {profile?.full_name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {profile?.full_name ?? 'Usuario'}
            </p>
            <p className="text-gray-500 text-xs capitalize">
              {profile?.role ?? 'comercial'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-gray-500 hover:text-red-400 text-xs rounded-lg hover:bg-gray-800 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

    </div>
  )
}