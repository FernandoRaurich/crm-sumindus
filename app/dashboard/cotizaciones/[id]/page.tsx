import { createClient } from '../../../lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DownloadPdfButton from './DownloadPdfButton'

export default async function CotizacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quote } = await supabase
    .from('quotes')
    .select(`*, company:companies(*), contact:contacts(*)`)
    .eq('id', id)
    .single()

  if (!quote) notFound()

  const { data: items } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', id)
    .order('item_order')

  const STATUS_LABEL: Record<string, string> = {
    pendiente:    'Pendiente',
    enviada:      'Enviada',
    aprobada:     'Aprobada',
    facturada:    'Facturada',
    por_facturar: 'Por facturar',
    no_aprobada:  'No aprobada',
  }

  const STATUS_COLOR: Record<string, string> = {
    pendiente:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    enviada:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
    aprobada:     'bg-green-500/10 text-green-400 border-green-500/20',
    facturada:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
    por_facturar: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    no_aprobada:  'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const ufItems  = (items ?? []).filter(i => i.currency === 'UF')
  const clpItems = (items ?? []).filter(i => i.currency === 'CLP')

  function fmtClp(n: number) {
    return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
  }
  function fmtUf(n: number) {
    return n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' UF'
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-white">{quote.quote_number}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLOR[quote.status] ?? ''}`}>
              {STATUS_LABEL[quote.status] ?? quote.status}
            </span>
          </div>
          {quote.short_name && (
            <p className="text-gray-400 text-sm">{quote.short_name}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {new Date(quote.quote_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {quote.business_line === 4000 && (
            <DownloadPdfButton quoteId={quote.id} quoteNumber={quote.quote_number} />
          )}
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Volver
          </a>
        </div>
      </div>

      <div className="space-y-5">

        {/* Cliente */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-medium mb-3 text-sm">Cliente</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Empresa</span>
              <p className="text-white">{quote.company?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">RUT</span>
              <p className="text-white">{quote.company?.rut ?? '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Contacto</span>
              <p className="text-white">{quote.contact?.full_name ?? '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Email</span>
              <p className="text-white">{quote.contact?.email ?? '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Dirección</span>
              <p className="text-white">{quote.company?.address ?? '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Teléfono</span>
              <p className="text-white">{quote.contact?.phone ?? '—'}</p>
            </div>
          </div>
        </section>

        {/* Ítems UF */}
        {ufItems.length > 0 && (
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-medium mb-3 text-sm">Ítems en UF</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left pb-2 pr-2">#</th>
                  <th className="text-left pb-2 pr-2">Descripción</th>
                  <th className="text-left pb-2 pr-2">Disp.</th>
                  <th className="text-left pb-2 pr-2">UM</th>
                  <th className="text-right pb-2 pr-2">Cant.</th>
                  <th className="text-right pb-2 pr-2">P.Unit (UF)</th>
                  <th className="text-right pb-2">Total (UF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {ufItems.map(item => (
                  <tr key={item.id}>
                    <td className="py-2 pr-2 text-gray-500">{item.item_order}</td>
                    <td className="py-2 pr-2 text-white">{item.description}</td>
                    <td className="py-2 pr-2 text-gray-400">{item.availability}</td>
                    <td className="py-2 pr-2 text-gray-400">{item.unit ?? '—'}</td>
                    <td className="py-2 pr-2 text-right text-gray-300">{item.quantity}</td>
                    <td className="py-2 pr-2 text-right text-gray-300">{item.unit_price.toFixed(2)}</td>
                    <td className="py-2 text-right text-white font-medium">{(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-end">
              <div className="space-y-1 text-xs w-48">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{fmtUf(ufItems.reduce((s, i) => s + i.quantity * i.unit_price, 0))}</span>
                </div>
                <div className="flex justify-between font-semibold text-white border-t border-gray-700 pt-1">
                  <span>Total (c/IVA)</span>
                  <span>{fmtUf(ufItems.reduce((s, i) => s + i.quantity * i.unit_price, 0) * 1.19)}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Ítems CLP */}
        {clpItems.length > 0 && (
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-medium mb-3 text-sm">Ítems en CLP</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left pb-2 pr-2">#</th>
                  <th className="text-left pb-2 pr-2">Descripción</th>
                  <th className="text-left pb-2 pr-2">Disp.</th>
                  <th className="text-left pb-2 pr-2">UM</th>
                  <th className="text-right pb-2 pr-2">Cant.</th>
                  <th className="text-right pb-2 pr-2">P.Unit (CLP)</th>
                  <th className="text-right pb-2">Total (CLP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {clpItems.map(item => (
                  <tr key={item.id}>
                    <td className="py-2 pr-2 text-gray-500">{item.item_order}</td>
                    <td className="py-2 pr-2 text-white">{item.description}</td>
                    <td className="py-2 pr-2 text-gray-400">{item.availability}</td>
                    <td className="py-2 pr-2 text-gray-400">{item.unit ?? '—'}</td>
                    <td className="py-2 pr-2 text-right text-gray-300">{item.quantity}</td>
                    <td className="py-2 pr-2 text-right text-gray-300">{fmtClp(item.unit_price)}</td>
                    <td className="py-2 text-right text-white font-medium">{fmtClp(item.quantity * item.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-end">
              <div className="space-y-1 text-xs w-52">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{fmtClp(clpItems.reduce((s, i) => s + i.quantity * i.unit_price, 0))}</span>
                </div>
                <div className="flex justify-between font-semibold text-white border-t border-gray-700 pt-1">
                  <span>Total (c/IVA)</span>
                  <span>{fmtClp(clpItems.reduce((s, i) => s + i.quantity * i.unit_price, 0) * 1.19)}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Alcances */}
        {(quote.payment_conditions || quote.delivery_time || quote.warranty || quote.dispatch || quote.contact_scope) && (
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-medium mb-3 text-sm">Alcances</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {quote.payment_conditions && (
                <div>
                  <span className="text-gray-500 text-xs">Condiciones comerciales</span>
                  <p className="text-white">{quote.payment_conditions}</p>
                </div>
              )}
              {quote.delivery_time && (
                <div>
                  <span className="text-gray-500 text-xs">Plazo de entrega</span>
                  <p className="text-white">{quote.delivery_time}</p>
                </div>
              )}
              {quote.warranty && (
                <div>
                  <span className="text-gray-500 text-xs">Garantía</span>
                  <p className="text-white">{quote.warranty}</p>
                </div>
              )}
              {quote.dispatch && (
                <div>
                  <span className="text-gray-500 text-xs">Despacho</span>
                  <p className="text-white">{quote.dispatch}</p>
                </div>
              )}
              {quote.contact_scope && (
                <div className="col-span-2">
                  <span className="text-gray-500 text-xs">Contacto</span>
                  <p className="text-white">{quote.contact_scope}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Notas */}
        {quote.notes && (
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-medium mb-2 text-sm">Notas</h2>
            <p className="text-gray-300 text-sm">{quote.notes}</p>
          </section>
        )}

      </div>
    </div>
  )
}
