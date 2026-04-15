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
  const [shortName, setShortName] = useState('')

  // Cliente
  const [companySearch, setCompanySearch] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)

  // Nuevo cliente inline
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '', short_name: '', rut: '', address: '', email: '', phone: ''
  })

  // Nuevo contacto inline
  const [newContactInline, setNewContactInline] = useState({
    full_name: '', email: '', phone: ''
  })
  const [showNewContact, setShowNewContact] = useState(false)

  // Ítems
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', availability: 'Inmediata', unit: '', quantity: 1, currency: 'CLP', unit_price: 0 },
  ])
  const [discountPct, setDiscountPct] = useState(0)
  const [notes, setNotes] = useState('')

  // Alcances
  const [paymentConditions, setPaymentConditions] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [warranty, setWarranty] = useState('')
  const [dispatch, setDispatch] = useState('')
  const [contactScope, setContactScope] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar empresas
  async function searchCompanies(q: string) {
    setCompanySearch(q)
    setSelectedCompany(null)
    setShowNewClient(false)
    if (q.length < 2) { setCompanies([]); return }
    const { data } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(6)
    setCompanies(data ?? [])
  }

  // Seleccionar empresa existente
  async function selectCompany(company: any) {
    setSelectedCompany(company)
    setCompanySearch(company.name)
    setCompanies([])
    setShowNewClient(false)
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company.id)
    setContacts(data ?? [])
  }

  // Crear nueva empresa + contacto
  async function createNewClient() {
    if (!newClient.name) { setError('El nombre de la empresa es obligatorio'); return }

    // Insertar empresa
    const { data: company, error: compError } = await supabase
      .from('companies')
      .insert({
        name: newClient.name,
        short_name: newClient.short_name || null,
        rut: newClient.rut || null,
        address: newClient.address || null,
      })
      .select()
      .single()

    if (compError) { setError('Error creando empresa: ' + compError.message); return }

    // Insertar contacto si hay nombre
    let contact = null
    if (newContactInline.full_name) {
      const { data: cont } = await supabase
        .from('contacts')
        .insert({
          company_id: company.id,
          full_name: newContactInline.full_name,
          email: newContactInline.email || null,
          phone: newContactInline.phone || null,
        })
        .select()
        .single()
      contact = cont
    }

    setSelectedCompany(company)
    setCompanySearch(company.name)
    setSelectedContact(contact)
    setContacts(contact ? [contact] : [])
    setShowNewClient(false)
    setError(null)
  }

  // Crear contacto para empresa ya existente
  async function createContactForCompany() {
    if (!newContactInline.full_name) { setError('El nombre del contacto es obligatorio'); return }
    const { data: cont, error: contError } = await supabase
      .from('contacts')
      .insert({
        company_id: selectedCompany.id,
        full_name: newContactInline.full_name,
        email: newContactInline.email || null,
        phone: newContactInline.phone || null,
      })
      .select()
      .single()
    if (contError) { setError('Error creando contacto: ' + contError.message); return }
    setContacts([cont])
    setSelectedContact(cont)
    setNewContactInline({ full_name: '', email: '', phone: '' })
    setShowNewContact(false)
    setError(null)
  }

  // Cálculos
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const discountAmt = subtotal * (discountPct / 100)
  const base = subtotal - discountAmt
  const iva = base * 0.19
  const total = base + iva

  function addItem() {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      description: '', availability: 'Inmediata', unit: '',
      quantity: 1, currency: 'CLP', unit_price: 0,
    }])
  }

  function removeItem(id: string) {
    if (items.length === 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateItem(id: string, field: keyof QuoteItem, value: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  // Guardar
  async function handleSave() {
    if (!selectedCompany) { setError('Selecciona o crea un cliente'); return }
    if (items.every(i => !i.description)) { setError('Agrega al menos un ítem con descripción'); return }

    setSaving(true)
    setError(null)

    try {
      // Secuencia
      const { data: seqData, error: seqError } = await supabase
        .from('quote_sequences')
        .select('last_number')
        .eq('business_line', Number(businessLine))
        .single()

      if (seqError || !seqData) { setError('Error obteniendo secuencia'); setSaving(false); return }

      const nextNumber = seqData.last_number + 1
      await supabase
        .from('quote_sequences')
        .update({ last_number: nextNumber })
        .eq('business_line', Number(businessLine))

      const quoteNumber = `${businessLine}-${String(nextNumber).padStart(4, '0')}`

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

      if (quoteError) { setError('Error: ' + quoteError.message); setSaving(false); return }

      // Ítems
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
        await supabase.from('quote_items').insert(itemsToInsert)
      }

      router.push('/dashboard')
      router.refresh()

    } catch (e: any) {
      setError('Error inesperado: ' + e.message)
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
  const labelClass = "text-xs text-gray-400 mb-1.5 block"

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Nueva cotización</h1>
          <p className="text-gray-400 text-sm mt-1">Completa las tres secciones</p>
        </div>
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Volver
        </button>
      </div>

      <div className="space-y-6">

        {/* ── SECCIÓN 1: CLIENTE ── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">1. Información del cliente</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Línea de negocio</label>
              <select
                value={businessLine}
                onChange={(e) => setBusinessLine(Number(e.target.value) as BusinessLine)}
                className={inputClass}
              >
                {BUSINESS_LINES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Nombre corto (opcional)</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="ej: Arriendo minicargador mayo"
                className={inputClass}
              />
            </div>
          </div>

          {/* Buscador empresa */}
          <div className="relative mb-3">
            <label className={labelClass}>Empresa cliente</label>
            <input
              type="text"
              value={companySearch}
              onChange={(e) => searchCompanies(e.target.value)}
              placeholder="Escribe para buscar empresa..."
              className={inputClass}
            />
            {/* Dropdown resultados */}
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
                {/* Opción crear nuevo */}
                <button
                  onClick={() => {
                    setNewClient(p => ({ ...p, name: companySearch }))
                    setShowNewClient(true)
                    setCompanies([])
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-blue-400 hover:bg-gray-700 transition-colors border-t border-gray-700"
                >
                  + Crear "{companySearch}" como nueva empresa
                </button>
              </div>
            )}
            {/* Botón crear si no hay resultados */}
            {companySearch.length >= 2 && companies.length === 0 && !selectedCompany && !showNewClient && (
              <button
                onClick={() => {
                  setNewClient(p => ({ ...p, name: companySearch }))
                  setShowNewClient(true)
                }}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                + No existe — crear "{companySearch}" como nueva empresa
              </button>
            )}
          </div>

          {/* Formulario nueva empresa inline */}
          {showNewClient && (
            <div className="border border-blue-800 bg-blue-950/30 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-blue-400 text-sm font-medium">Nueva empresa</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient(p => ({ ...p, name: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nombre corto</label>
                  <input
                    type="text"
                    value={newClient.short_name}
                    onChange={(e) => setNewClient(p => ({ ...p, short_name: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>RUT</label>
                  <input
                    type="text"
                    value={newClient.rut}
                    onChange={(e) => setNewClient(p => ({ ...p, rut: e.target.value }))}
                    placeholder="76.123.456-7"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Dirección</label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient(p => ({ ...p, address: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="border-t border-gray-700 pt-3">
                <p className="text-gray-400 text-xs mb-3">Contacto / Solicitante (opcional)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Nombre completo</label>
                    <input
                      type="text"
                      value={newContactInline.full_name}
                      onChange={(e) => setNewContactInline(p => ({ ...p, full_name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={newContactInline.email}
                      onChange={(e) => setNewContactInline(p => ({ ...p, email: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <input
                      type="text"
                      value={newContactInline.phone}
                      onChange={(e) => setNewContactInline(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+56 9 1234 5678"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={createNewClient}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                >
                  Guardar empresa
                </button>
                <button
                  onClick={() => setShowNewClient(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Empresa seleccionada */}
          {selectedCompany && !showNewClient && (
            <div className="flex items-start justify-between p-3 bg-gray-800 rounded-lg mb-3">
              <div className="text-sm text-gray-300 space-y-0.5">
                <p className="text-white font-medium">{selectedCompany.name}</p>
                <p className="text-xs text-gray-400">
                  RUT: {selectedCompany.rut ?? '—'} · {selectedCompany.address ?? '—'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCompany(null)
                  setCompanySearch('')
                  setContacts([])
                  setSelectedContact(null)
                }}
                className="text-gray-500 hover:text-red-400 text-xs transition-colors ml-4"
              >
                Cambiar
              </button>
            </div>
          )}

          {/* Contacto */}
          {selectedCompany && contacts.length > 0 && (
            <div>
              <label className={labelClass}>Contacto / Solicitante</label>
              <select
                value={selectedContact?.id ?? ''}
                onChange={(e) => setSelectedContact(contacts.find(c => c.id === e.target.value) ?? null)}
                className={inputClass}
              >
                <option value="">Seleccionar contacto...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedCompany && contacts.length === 0 && !showNewClient && !showNewContact && (
            <p className="text-gray-500 text-xs">
              Esta empresa no tiene contactos registrados.{' '}
              <button
                onClick={() => setShowNewContact(true)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Agregar contacto
              </button>
            </p>
          )}

          {selectedCompany && showNewContact && (
            <div className="border border-blue-800 bg-blue-950/30 rounded-xl p-4 space-y-3">
              <p className="text-blue-400 text-sm font-medium">Nuevo contacto</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Nombre completo *</label>
                  <input
                    type="text"
                    value={newContactInline.full_name}
                    onChange={(e) => setNewContactInline(p => ({ ...p, full_name: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={newContactInline.email}
                    onChange={(e) => setNewContactInline(p => ({ ...p, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input
                    type="text"
                    value={newContactInline.phone}
                    onChange={(e) => setNewContactInline(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={createContactForCompany}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                >
                  Guardar contacto
                </button>
                <button
                  onClick={() => { setShowNewContact(false); setNewContactInline({ full_name: '', email: '', phone: '' }) }}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── SECCIÓN 2: ÍTEMS ── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">2. Itemizado</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left pb-3 pr-2 w-6">#</th>
                  <th className="text-left pb-3 pr-2">Descripción</th>
                  <th className="text-left pb-3 pr-2 w-28">Disponibilidad</th>
                  <th className="text-left pb-3 pr-2 w-20">UM</th>
                  <th className="text-right pb-3 pr-2 w-24">Cantidad</th>
                  <th className="text-left pb-3 pr-2 w-16">Moneda</th>
                  <th className="text-right pb-3 pr-2 w-32">Precio unit.</th>
                  <th className="text-right pb-3 w-32">Total</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-2 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descripción del ítem"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={item.availability}
                        onChange={(e) => updateItem(item.id, 'availability', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option>Inmediata</option>
                        <option>En stock</option>
                        <option>Por confirmar</option>
                        <option>Sin stock</option>
                        <option>-</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        placeholder="m, c/u, Hrs"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9.]/g, '')
                          updateItem(item.id, 'quantity', v === '' ? 0 : Number(v))
                        }}
                        placeholder="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-sm text-right placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={item.currency}
                        onChange={(e) => updateItem(item.id, 'currency', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-1 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="CLP">CLP</option>
                        <option value="UF">UF</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.unit_price === 0 ? '' : item.unit_price.toLocaleString('es-CL')}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                          updateItem(item.id, 'unit_price', v === '' ? 0 : Number(v))
                        }}
                        placeholder="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-sm text-right placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 text-right text-gray-300 text-sm font-medium whitespace-nowrap">
                      {(item.quantity * item.unit_price).toLocaleString('es-CL')}
                    </td>
                    <td className="py-2 pl-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="text-gray-600 hover:text-red-400 disabled:opacity-20 transition-colors"
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
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            + Agregar ítem
          </button>

          {/* Totales */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">{subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Descuento</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discountPct === 0 ? '' : discountPct}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, '')
                      setDiscountPct(v === '' ? 0 : Number(v))
                    }}
                    placeholder="0"
                    className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm text-right focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-gray-500">%</span>
                  {discountPct > 0 && (
                    <span className="text-red-400 text-xs">
                      -{discountAmt.toLocaleString('es-CL')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>IVA (19%)</span>
                <span>{Math.round(iva).toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-base border-t border-gray-700 pt-2.5">
                <span>Total CLP</span>
                <span>{Math.round(total).toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="mt-5">
            <label className={labelClass}>Notas internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas o aclaraciones visibles solo internamente..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </section>

        {/* ── SECCIÓN 3: ALCANCES ── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">3. Alcances</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Condiciones comerciales</label>
              <input
                type="text"
                value={paymentConditions}
                onChange={(e) => setPaymentConditions(e.target.value)}
                placeholder="ej: Crédito 30 días contra factura"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Plazo de entrega</label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="ej: 5 días hábiles"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Garantía</label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="ej: 6 meses"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Despacho</label>
              <input
                type="text"
                value={dispatch}
                onChange={(e) => setDispatch(e.target.value)}
                placeholder="ej: Incluido en precio"
                className={inputClass}
              />
            </div>
            {Number(businessLine) === 4000 && (
              <div className="col-span-2">
                <label className={labelClass}>Contacto</label>
                <input
                  type="text"
                  value={contactScope}
                  onChange={(e) => setContactScope(e.target.value)}
                  placeholder="ej: Lucas Lobos / Sergio Aspe"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </section>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/30 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
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