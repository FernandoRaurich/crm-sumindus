'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function HistorialPage() {
  const supabase = createClient()

  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lineFilter, setLineFilter] = useState<string>('all')

  useEffect(() => { loadHistory() }, [])

  async function loadHistory() {
    setLoading(true)
    const { data } = await supabase
      .from('v_price_history')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(500)
    setHistory(data ?? [])
    setLoading(false)
  }

  const filtered = history.filter(h => {
    const matchSearch = !search ||
      h.description?.toLowerCase().includes(search.toLowerCase()) ||
      h.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      h.supplier?.toLowerCase().includes(search.toLowerCase())
    const matchLine = lineFilter === 'all' || h.business_line === Number(lineFilter)
    return matchSearch && matchLine
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Historial de precios</h1>
        <p className="text-gray-400 text-sm mt-1">
          Registro automático de todos los ítems cotizados
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar descripción, empresa, proveedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
        />
        <select
          value={lineFilter}
          onChange={(e) => setLineFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todas las líneas</option>
          <option value="1000">1000 · Suministro</option>
          <option value="2000">2000 · Maestranza</option>
          <option value="3000">3000 · Constructora</option>
          <option value="4000">4000 · Rental</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left px-4 py-3">Cotización</th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Descripción</th>
                <th className="text-left px-4 py-3">Proveedor</th>
                <th className="text-left px-4 py-3">UM</th>
                <th className="text-right px-4 py-3">P. Compra</th>
                <th className="text-right px-4 py-3">P. Venta</th>
                <th className="text-right px-4 py-3">Margen</th>
                <th className="text-left px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No hay registros aún. El historial se llena automáticamente
                    cuando una cotización pasa a estado <span className="text-blue-400">Enviada</span>.
                  </td>
                </tr>
              ) : filtered.map(h => (
                <tr key={h.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-blue-400 font-medium text-xs">{h.quote_number}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{h.company_name ?? '—'}</td>
                  <td className="px-4 py-3 text-white max-w-xs">
                    <div className="truncate" title={h.description}>{h.description}</div>
                    {h.material_code && (
                      <div className="text-gray-500 text-xs mt-0.5">{h.material_code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{h.supplier ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{h.unit ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    {h.cost_unit ? `$${Math.round(h.cost_unit).toLocaleString('es-CL')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-white font-medium text-xs">
                    {h.unit_price ? `$${Math.round(h.unit_price).toLocaleString('es-CL')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    {h.margin_pct_calc != null ? (
                      <span className={h.margin_pct_calc > 0 ? 'text-green-400' : 'text-red-400'}>
                        {h.margin_pct_calc}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(h.recorded_at).toLocaleDateString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== history.length && ` (de ${history.length} total)`}
        </div>
      </div>

    </div>
  )
}