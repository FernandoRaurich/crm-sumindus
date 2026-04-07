import { createClient } from '../lib/supabase/server'
import { redirect } from 'next/navigation'
import PipelineTable from '../components/PipelineTable'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: quotes } = await supabase
    .from('v_pipeline')
    .select('*')
    .order('created_at', { ascending: false })

  // KPIs
  const active = quotes?.filter(q => !['facturada','no_aprobada'].includes(q.status)) ?? []
  const approved = quotes?.filter(q => q.status === 'aprobada') ?? []
  const total = active.reduce((sum, q) => sum + (q.total_clp ?? 0), 0)
  const closeRate = quotes?.length
    ? Math.round((approved.length / quotes.length) * 100)
    : 0

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pipeline comercial</h1>
          <p className="text-gray-400 text-sm mt-1">
            Bienvenido, {profile?.full_name}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Cotizaciones activas</p>
          <p className="text-2xl font-semibold text-white">{active.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Pipeline total (neto)</p>
          <p className="text-2xl font-semibold text-white">
            ${Math.round(total / 1000000)}M
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Aprobadas</p>
          <p className="text-2xl font-semibold text-white">{approved.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Tasa de cierre</p>
          <p className="text-2xl font-semibold text-white">{closeRate}%</p>
        </div>
      </div>

      {/* Tabla pipeline */}
      <PipelineTable quotes={quotes ?? []} />

    </div>
  )
}