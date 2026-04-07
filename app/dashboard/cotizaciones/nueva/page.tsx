'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import type { BusinessLine } from '../../../lib/types'

const BUSINESS_LINES = [
  { value: 1000, label: '1000 · Suministro' },
  { value: 2000, label: '2000 · Maestranza' },
  { value: 3000, label: '3000 · Constructora' },
  { value: 4000, label: '4000 · Rental' },
]

interface QuoteItem {
  id: string
  description: string
  availability: string
  unit: string
  quantity: number
  currency: 'CLP' | 'UF'
  unit_price: number
}

export default function NuevaCotizacionPage() {
  const router = useRouter()
  const supabase = createClient()

  const [businessLine, setBusinessLine] = useState<BusinessLine>(1000)
  const [companySearch, setCompanySearch] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [shortName, setShortName] = useState('')

  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', availability: '-', unit: '', quantity: 1, currency: 'CLP', unit_price: 0 },
  ])
  const [discountPct, setDiscountPct] = useState(0)
  const [notes, setNotes] = useState('')

  const [paymentConditions, setPaymentConditions] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [warranty, setWarranty] = useState('')
  const [dispatch, setDispatch] = useState('')
  const [contactScope, setContactScope] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function searchCompanies(q: string) {
    setCompanySearch(q)
    if (q.length < 2) { setCompanies([]); return }
    const { data } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(6)
    setCompanies(data ?? [])
  }

  async function selectCompany(company: any) {
    setSelectedCompany(company)
    setCompanySearch(company.name)
    setCompanies([])
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company.id)
    setContacts(data ?? [])
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const discount = subtotal * (discountPct / 100)
  const base = subtotal - discount
  const iva = base * 0.19
  const total = base + iva

  function addItem() {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      description: '', availability: '-', unit: '',
      quantity: 1, currency: 'CLP', unit_price: 0,
    }])
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateItem(id: string, field: keyof QuoteItem, value: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function handleSave() {
    if (!selectedCompany) { setError('Selecciona un cliente'); return }
    if (items.every(i => !i.description)) { setError('Agrega al menos un ítem'); return }

    setSaving(true)
    setError(null)

    try {
      // Obtener número de cotización
      const { data: numData, error: numError } = await supabase
        .rpc('next_quote_number', { p_line: Number(businessLine) })

      console.log('RPC result:', numData, numError)

      if (numError || !numData) {
        setError('Error generando número: ' + (numError?.message ?? 'sin datos'))
        setSaving(false)
        return
      }

      const quoteNumber = numData as string

      // Crear cotización
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          quote_number: quoteNumber,
          short_name: shortName || null,
          company_id: selectedCompany.id,
          contact_id: selectedContact?.id ?? null,
          business_line: Number(businessLine),
          has_uf_section: Number(businessLine) === 4000,
          subtotal_clp: subtotal,
          discount_pct: discountPct,
          iva_clp: iva,
          total_clp: total,
          payment_conditions: paymentConditions || null,
          delivery_time: deliveryTime || null,
          warranty: warranty || null,
          dispatch: dispatch || null,
          contact_scope: contactScope || null,
          notes: notes || null,
          status: 'pendiente',
        })
        .select()
        .single()

      if (quoteError) {
        setError('Error creando cotización: ' + quoteError.message)
        setSaving(false)
        return
      }

      // Insertar ítems
      const itemsToInsert = items
        .filter(i => i.description)
        .map((i, idx) => ({
          quote_id: quote.id,
          item_order: idx + 1,
          description: i.description,
          availability: i.availability,
          unit: i.unit,
          quantity: i.quantity,
          currency: i.currency,
          unit_price: i.unit_price,
        }))

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsToInsert)

        if (itemsError) {
          setError('Error guardando ítems: ' + itemsError.message)
          setSaving(false)
          return
        }
      }

      router.push('/dashboard')
      router.refresh()

    } catch (e: any) {
      setError('Error inesperado: ' + e.message)
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Nueva cotización</h1>
          <p className="text-gray-400 text-sm mt-1">Completa las tres secciones</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Volver
        </button>
      </div>

      <div className="space-y-6">

        {/* ─── SECCIÓN 1: CLIENTE ─── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">1. Información del cliente</h2>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Línea de negocio</label>
              <select
                value={businessLine}
                onChange={(e) => setBusinessLine(Number(e.target.value) as BusinessLine)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {BUSINESS_LINES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Nombre corto (opcional)</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="ej: Arriendo minicargador mayo"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <label className="text-xs text-gray-400 mb-1.5 block">Empresa cliente</label>
              <input
                type="text"
                value={companySearch}
                onChange={(e) => searchCompanies(e.target.value)}
                placeholder="Buscar empresa..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
              {companies.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                  {companies.map(c => (
                    <button
                      key={c.id}
                      onClick={() => selectCompany(c)}
                      className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-700 transition-colors"
                    >
                      <span className="font-medium">{c.name}</span>
                      {c.rut && <span className="text-gray-400 ml-2 text-xs">{c.rut}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Contacto / Solicitante</label>
              <select
                value={selectedContact?.id ?? ''}
                onChange={(e) => setSelectedContact(contacts.find(c => c.id === e.target.value) ?? null)}
                disabled={contacts.length === 0}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-40"
              >
                <option value="">Seleccionar contacto...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>

          </div>

          {selectedCompany && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
              <span className="text-gray-500 mr-2">RUT:</span>{selectedCompany.rut ?? '—'}
              <span className="text-gray-500 mx-3">|</span>
              <span className="text-gray-500 mr-2">Dirección:</span>{selectedCompany.address ?? '—'}
            </div>
          )}
        </section>

        {/* ─── SECCIÓN 2: ÍTEMS ─── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">2. Itemizado</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left pb-2 w-6">#</th>
                  <th className="text-left pb-2">Descripción</th>
                  <th className="text-left pb-2 w-20">Disp.</th>
                  <th className="text-left pb-2 w-20">UM</th>
                  <th className="text-right pb-2 w-20">Cant.</th>
                  <th className="text-left pb-2 w-16">Mon.</th>
                  <th className="text-right pb-2 w-28">P. Unit</th>
                  <th className="text-right pb-2 w-28">Total</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-2 text-gray-500">{idx + 1}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descripción del ítem"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.availability}
                        onChange={(e) => updateItem(item.id, 'availability', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        placeholder="m, c/u, kg"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm text-right focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={item.currency}
                        onChange={(e) => updateItem(item.id, 'currency', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-1 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="CLP">CLP</option>
                        <option value="UF">UF</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm text-right focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2 text-right text-gray-300 whitespace-nowrap">
                      {(item.quantity * item.unit_price).toLocaleString('es-CL')}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addItem}
            className="mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            + Agregar ítem
          </button>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Descuento %</span>
                <input
                  type="number"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm text-right focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-between text-gray-400">
                <span>IVA (19%)</span>
                <span>{iva.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-white font-medium border-t border-gray-700 pt-2">
                <span>Total CLP</span>
                <span>{total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-400 mb-1.5 block">Notas internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas o aclaraciones..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </section>

        {/* ─── SECCIÓN 3: ALCANCES ─── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">3. Alcances</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Condiciones comerciales</label>
              <input
                type="text"
                value={paymentConditions}
                onChange={(e) => setPaymentConditions(e.target.value)}
                placeholder="ej: Crédito 30 días contra factura"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Plazo de entrega</label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="ej: 5 días hábiles"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Garantía</label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="ej: 6 meses"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Despacho</label>
              <input
                type="text"
                value={dispatch}
                onChange={(e) => setDispatch(e.target.value)}
                placeholder="ej: Incluido en precio"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            {Number(businessLine) === 4000 && (
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1.5 block">Contacto</label>
                <input
                  type="text"
                  value={contactScope}
                  onChange={(e) => setContactScope(e.target.value)}
                  placeholder="ej: Lucas Lobos / Sergio Aspe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </section>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Guardando...' : 'Crear cotización'}
          </button>
        </div>

      </div>
    </div>
  )
}