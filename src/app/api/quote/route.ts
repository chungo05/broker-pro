import { NextRequest, NextResponse } from 'next/server'
import { quoteAll } from '@/lib/carriers'
import { prisma } from '@/lib/db'
import { quoteRequestSchema } from '@/lib/quote-schema'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = quoteRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const results = await quoteAll(parsed.data)

  // Guardamos la cotización en DB
  const quote = await prisma.quote.create({
    data: {
      brand:    parsed.data.brand,
      model:    parsed.data.model,
      year:     parsed.data.year,
      uso:      parsed.data.uso,
      zipCode:  parsed.data.zipCode,
      coverage: parsed.data.coverage,
      results:  results as any,
    },
  })

  return NextResponse.json({ quoteId: quote.id, results })
}