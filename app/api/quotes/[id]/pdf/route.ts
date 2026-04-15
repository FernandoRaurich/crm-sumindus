import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { createClient } from '../../../../lib/supabase/server'
import { RentalQuotePdf } from '../../../../lib/pdf/rental-template'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Cotización
  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .select(`
      *,
      company:companies(*),
      contact:contacts(*)
    `)
    .eq('id', id)
    .single()

  if (qErr || !quote) return new NextResponse('Not found', { status: 404 })

  // Solo línea Rental (4000)
  if (quote.business_line !== 4000) {
    return new NextResponse('Este template es exclusivo para cotizaciones Rental (4000)', { status: 400 })
  }

  // Ítems
  const { data: items } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', id)
    .order('item_order')

  // Faena (puede no existir)
  const { data: faena } = await supabase
    .from('rental_faena')
    .select('*')
    .eq('quote_id', id)
    .maybeSingle()

  const pdf = React.createElement(RentalQuotePdf, {
    quote: quote as any,
    items: items ?? [],
    faena: faena ?? null,
  })

  const buffer = await renderToBuffer(pdf)

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cotizacion-${quote.quote_number}.pdf"`,
    },
  })
}
