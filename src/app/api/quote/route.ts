import { NextRequest, NextResponse } from 'next/server'
import { quoteAll } from '@/lib/carriers'
import { prisma } from '@/lib/db'
import { quoteRequestSchema } from '@/lib/quote-schema'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = quoteRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const results = await quoteAll(parsed.data)

    // Guardamos la cotización en DB
    const quote = await prisma.quote.create({
      data: {
        brand: parsed.data.brand,
        model: parsed.data.model,
        year: parsed.data.year,
        uso: parsed.data.uso,
        zipCode: parsed.data.zipCode,
        coverage: parsed.data.coverage,
        results: results as any,
      },
    })

    return NextResponse.json({ quoteId: quote.id, results })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error interno al crear cotización'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}