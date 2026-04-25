import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { quoteAll } from '@/lib/carriers'
import { prisma } from '@/lib/db'

const QuoteSchema = z.object({
  brand:    z.string().min(1),
  model:    z.string().min(1),
  year:     z.number().int().min(2000).max(2026),
  uso:      z.enum(['particular', 'comercial']),
  zipCode:  z.string().length(5),
  coverage: z.enum(['amplia', 'amplia_plus', 'basica', 'rc']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = QuoteSchema.safeParse(body)

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