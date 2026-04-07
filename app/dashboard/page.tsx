import { createClient } from '../lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">CRM Comercial</h1>
            <p className="text-gray-400 text-sm mt-1">
              Bienvenido, {profile?.full_name ?? user.email}
            </p>
          </div>
          <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">
            {profile?.role ?? 'comercial'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Cotizaciones activas', value: '0' },
            { label: 'Pipeline total', value: '$0' },
            { label: 'Aprobadas este mes', value: '0' },
            { label: 'Tasa de cierre', value: '0%' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{kpi.label}</p>
              <p className="text-2xl font-semibold">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Pipeline comercial</h2>
            <button className="bg-blue-600 hover:bg-blue-500 text-sm px-4 py-2 rounded-lg transition-colors">
              + Nueva cotización
            </button>
          </div>
          <p className="text-gray-500 text-sm text-center py-12">
            No hay cotizaciones aún. Crea la primera.
          </p>
        </div>
      </div>
    </div>
  )
}