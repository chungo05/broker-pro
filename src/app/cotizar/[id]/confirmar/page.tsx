import { prisma } from '@/lib/db'
import type { QuoteResult } from '@/lib/carriers/types'
import { notFound, redirect } from 'next/navigation'
import ConfirmarClient from './ConfirmarClient'

export default async function ConfirmarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ carrier?: string }>
}) {
  const { id } = await params
  const { carrier: carrierFromUrl } = await searchParams

  const quote = await prisma.quote.findUnique({
    where: { id },
  })

  if (!quote) notFound()

  if (quote.status === 'PENDING') {
    redirect(`/cotizar/${id}`)
  }

  const results = quote.results as unknown as QuoteResult[]
  const selectedId = quote.selectedCarrier

  if (quote.status === 'SELECTED') {
    if (!selectedId) redirect(`/cotizar/${id}`)
    if (carrierFromUrl && carrierFromUrl !== selectedId) {
      redirect(`/cotizar/${id}`)
    }
    const selectedResult = results.find((r) => r.carrierId === selectedId)
    if (!selectedResult) redirect(`/cotizar/${id}`)

    return (
      <ConfirmarClient
        quote={{
          id: quote.id,
          brand: quote.brand,
          model: quote.model,
          year: quote.year,
          coverage: quote.coverage,
          uso: quote.uso,
          zipCode: quote.zipCode,
          clientName: quote.clientName,
          clientEmail: quote.clientEmail,
          clientPhone: quote.clientPhone,
          clientRfc: quote.clientRfc,
        }}
        selectedResult={selectedResult}
        readOnly={false}
      />
    )
  }

  if (quote.status === 'EMITTED') {
    const selectedResult = results.find((r) => r.carrierId === selectedId)
    if (!selectedResult) notFound()

    return (
      <ConfirmarClient
        quote={{
          id: quote.id,
          brand: quote.brand,
          model: quote.model,
          year: quote.year,
          coverage: quote.coverage,
          uso: quote.uso,
          zipCode: quote.zipCode,
          clientName: quote.clientName,
          clientEmail: quote.clientEmail,
          clientPhone: quote.clientPhone,
          clientRfc: quote.clientRfc,
        }}
        selectedResult={selectedResult}
        readOnly
      />
    )
  }

  redirect(`/cotizar/${id}`)
}
