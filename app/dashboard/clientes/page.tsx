'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function ClientesPage() {
  const supabase = createClient()

  const [companies, setCompanies] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'empresas' | 'contactos'>('empresas')

  // Modal nueva empresa
  const [showNewCompany, setShowNewCompany] = useState(false)
  const [newCompany, setNewCompany] = useState({ name: '', short_name: '', rut: '', address: '' })
  const [savingCompany, setSavingCompany] = useState(false)

  // Modal nuevo contacto
  const [showNewContact, setShowNewContact] = useState(false)
  const [newContact, setNewContact] = useState({ full_name: '', email: '', phone: '', company_id: '' })
  const [savingContact, setSavingContact] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: comp }, { data: cont }] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('contacts').select('*, companies(name)').order('full_name'),
    ])
    setCompanies(comp ?? [])
    setContacts(cont ?? [])
    setLoading(false)
  }

  async function saveCompany() {
    if (!newCompany.name) return
    setSavingCompany(true)
    await supabase.from('companies').insert(newCompany)
    setNewCompany({ name: '', short_name: '', rut: '', address: '' })
    setShowNewCompany(false)
    setSavingCompany(false)
    loadData()
  }

  async function saveContact() {
    if (!newContact.full_name) return
    setSavingContact(true)
    await supabase.from('contacts').insert(newContact)
    setNewContact({ full_name: '', email: '', phone: '', company_id: '' })
    setShowNewContact(false)
    setSavingContact(false)
    loadData()
  }

  const filteredCompanies = companies.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.rut?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredContacts = contacts.filter(c =>
    !search || c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clientes</h1>
          <p className="text-gray-400 text-sm mt-1">Maestro de empresas y contactos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewContact(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700"
          >
            + Contacto
          </button>
          <button
            onClick={() => setShowNewCompany(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            + Empresa
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {(['empresas', 'contactos'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors capitalize ${
              tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t} ({t === 'empresas' ? companies.length : contacts.length})
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder={tab === 'empresas' ? 'Buscar empresa o RUT...' : 'Buscar contacto o email...'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
      />

      {/* Tabla empresas */}
      {tab === 'empresas' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Nombre corto</th>
                <th className="text-left px-4 py-3">RUT</th>
                <th className="text-left px-4 py-3">Dirección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No hay empresas</td></tr>
              ) : filteredCompanies.map(c => (
                <tr key={c.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400">{c.short_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{c.rut ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.address ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Tabla contactos */}
      {tab === 'contactos' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No hay contactos</td></tr>
              ) : filteredContacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{c.full_name}</td>
                  <td className="px-4 py-3 text-gray-400">{c.companies?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{c.phone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            {filteredContacts.length} contacto{filteredContacts.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Modal nueva empresa */}
      {showNewCompany && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-medium mb-4">Nueva empresa</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre corto</label>
                <input
                  type="text"
                  value={newCompany.short_name}
                  onChange={(e) => setNewCompany(p => ({ ...p, short_name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">RUT</label>
                <input
                  type="text"
                  value={newCompany.rut}
                  onChange={(e) => setNewCompany(p => ({ ...p, rut: e.target.value }))}
                  placeholder="76.123.456-7"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Dirección</label>
                <input
                  type="text"
                  value={newCompany.address}
                  onChange={(e) => setNewCompany(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowNewCompany(false)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveCompany}
                disabled={savingCompany || !newCompany.name}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                {savingCompany ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo contacto */}
      {showNewContact && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-medium mb-4">Nuevo contacto</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre completo *</label>
                <input
                  type="text"
                  value={newContact.full_name}
                  onChange={(e) => setNewContact(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Empresa</label>
                <select
                  value={newContact.company_id}
                  onChange={(e) => setNewContact(p => ({ ...p, company_id: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sin empresa</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+56 9 1234 5678"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowNewContact(false)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveContact}
                disabled={savingContact || !newContact.full_name}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                {savingContact ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}