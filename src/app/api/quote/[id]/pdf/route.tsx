import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { QuoteResult } from '@/lib/carriers/types'
import { QuotePdfDocument } from '@/lib/pdf/quote-document'

const COVERAGE_LABEL: Record<string, string> = {
  amplia: 'Amplia',
  amplia_plus: 'Amplia Plus',
  basica: 'Básica',
  rc: 'Solo RC',
}

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) {
    return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  }

  if (!quote.selectedCarrier) {
    return NextResponse.json(
      { error: 'Primero elige una aseguradora en la cotización' },
      { status: 400 }
    )
  }

  const results = quote.results as unknown as QuoteResult[]
  const selected = results.find((r) => r.carrierId === quote.selectedCarrier)
  if (!selected) {
    return NextResponse.json(
      { error: 'No hay datos de la aseguradora seleccionada' },
      { status: 500 }
    )
  }

  const hasClient =
    quote.status === 'EMITTED' &&
    quote.clientName &&
    quote.clientEmail &&
    quote.clientPhone

  const annual = quote.selectedPremium ?? selected.annualPremium
  const buffer = await renderToBuffer(
    <QuotePdfDocument
      data={{
        quoteId: quote.id,
        createdAt: quote.createdAt,
        brand: quote.brand,
        model: quote.model,
        year: quote.year,
        uso: quote.uso,
        zipCode: quote.zipCode,
        coverageLabel: COVERAGE_LABEL[quote.coverage] ?? quote.coverage,
        carrierName: selected.carrierName,
        rating: selected.rating,
        annualPremium: annual,
        monthlyPremium: Math.round(annual / 12),
        coverage: selected.coverage,
        client: hasClient
          ? {
              name: quote.clientName!,
              email: quote.clientEmail!,
              phone: quote.clientPhone!,
              rfc: quote.clientRfc,
            }
          : undefined,
      }}
    />
  )

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cotizacion-${id.slice(0, 8)}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
