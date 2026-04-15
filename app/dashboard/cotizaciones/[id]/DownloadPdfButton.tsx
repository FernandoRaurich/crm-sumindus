'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

interface Props {
  quoteId: string
  quoteNumber: string
}

export default function DownloadPdfButton({ quoteId, quoteNumber }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleDownload() {
    setLoading(true)
    try {
      // Traer datos desde el cliente
      const [{ data: quote }, { data: items }, { data: faena }] = await Promise.all([
        supabase
          .from('quotes')
          .select('*, company:companies(*), contact:contacts(*)')
          .eq('id', quoteId)
          .single(),
        supabase
          .from('quote_items')
          .select('*')
          .eq('quote_id', quoteId)
          .order('item_order'),
        supabase
          .from('rental_faena')
          .select('*')
          .eq('quote_id', quoteId)
          .maybeSingle(),
      ])

      if (!quote) {
        alert('No se encontró la cotización')
        return
      }

      // Importar dinámicamente para que solo cargue en el browser
      const [{ pdf }, { default: React }, { RentalQuotePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('react'),
        import('../../../lib/pdf/rental-template'),
      ])

      const blob = await pdf(
        React.createElement(RentalQuotePdf, {
          quote: quote as any,
          items: items ?? [],
          faena: faena ?? null,
        }) as any
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `cotizacion-${quoteNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert('Error generando PDF: ' + (e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-700 text-gray-900 disabled:text-gray-400 text-sm font-medium rounded-lg transition-colors"
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
          Generando...
        </>
      ) : (
        <>↓ Descargar PDF</>
      )}
    </button>
  )
}
