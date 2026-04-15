'use client'

import { useState } from 'react'

interface Props {
  quoteId: string
  quoteNumber: string
}

export default function DownloadPdfButton({ quoteId, quoteNumber }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/pdf`)
      if (!res.ok) {
        const msg = await res.text()
        alert('Error generando PDF: ' + msg)
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `cotizacion-${quoteNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error inesperado al generar PDF')
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
        <>
          ↓ Descargar PDF
        </>
      )}
    </button>
  )
}
