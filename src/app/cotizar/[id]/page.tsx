import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import ResultsClient from './ResultsClient'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await prisma.quote.findUnique({
    where: { id },
  })

  if (!quote) notFound()

  return (
    <ResultsClient
      quote={{
        id: quote.id,
        brand: quote.brand,
        model: quote.model,
        year: quote.year,
        coverage: quote.coverage,
        results: quote.results as any,
      }}
    />
  )
}