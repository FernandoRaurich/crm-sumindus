'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'
import type { QuoteStatus, PipelineView } from '../lib/types'

const STATUS_LABELS: Record<QuoteStatus, string> = {
  pendiente:    'Pendiente',
  enviada:      'Enviada',
  aprobada:     'Aprobada',
  facturada:    'Facturada',
  por_facturar: 'Por facturar',
  no_aprobada:  'No aprobada',
}

const STATUS_COLORS: Record<QuoteStatus, string> = {
  pendiente:    'bg-yellow-900 text-yellow-300',
  enviada:      'bg-blue-900 text-blue-300',
  aprobada:     'bg-green-900 text-green-300',
  facturada:    'bg-teal-900 text-teal-300',
  por_facturar: 'bg-purple-900 text-purple-300',
  no_aprobada:  'bg-red-900 text-red-300',
}

const LINE_COLORS: Record<number, string> = {
  1000: 'bg-blue-900 text-blue-300',
  2000: 'bg-orange-900 text-orange-300',
  3000: 'bg-green-900 text-green-300',
  4000: 'bg-purple-900 text-purple-300',
}

export default function PipelineTable({ quotes }: { quotes: PipelineView[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [lineFilter, setLineFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Filtros
  const filtered = quotes.filter(q => {
    const matchSearch = !search ||
      q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.short_name?.toLowerCase().includes(search.toLowerCase())
    const matchLine = lineFilter === 'all' || q.business_line === Number(lineFilter)
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    return matchSearch && matchLine && matchStatus
  })

  async function updateStatus(id: string, status: QuoteStatus) {
    setUpdatingId(id)
    await supabase.from('quotes').update({ status }).eq('id', id)
    setUpdatingId(null)
    router.refresh()
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">

      {/* Filtros */}
      <div className="p-4 border-b border-gray-800 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar cotización, cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
        />
        <select
          value={lineFilter}
          onChange={(e) => setLineFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todas las líneas</option>
          <option value="1000">1000 · Suministro</option>
          <option value="2000">2000 · Maestranza</option>
          <option value="3000">3000 · Constructora</option>
          <option value="4000">4000 · Rental</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-gray-800">
              <th className="text-left px-4 py-3">N° Cotización</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Contacto</th>
              <th className="text-left px-4 py-3">Línea</th>
              <th className="text-right px-4 py-3">Monto neto</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">
                  No hay cotizaciones. Crea la primera.
                </td>
              </tr>
            ) : (
              filtered.map(q => (
                <tr key={q.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/cotizaciones/${q.id}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      {q.quote_number}
                    </Link>
                    {q.short_name && (
                      <div className="text-gray-500 text-xs mt-0.5">{q.short_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {q.company_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {q.contact_name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${LINE_COLORS[q.business_line]}`}>
                      {q.business_line}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-medium">
                    ${q.total_clp?.toLocaleString('es-CL') ?? '0'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.status}
                      onChange={(e) => updateStatus(q.id, e.target.value as QuoteStatus)}
                      disabled={updatingId === q.id}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[q.status as QuoteStatus]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {q.quote_date?.slice(0, 10).split('-').reverse().join('/')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
        {filtered.length} cotización{filtered.length !== 1 ? 'es' : ''}
        {filtered.length !== quotes.length && ` (de ${quotes.length} total)`}
      </div>

    </div>
  )
}