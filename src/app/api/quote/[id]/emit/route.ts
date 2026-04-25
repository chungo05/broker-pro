import { NextRequest, NextResponse } from 'next/server'
import { emitQuoteSchema } from '@/lib/emit-quote-schema'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const json = await req.json()
  const parsed = emitQuoteSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const quote = await prisma.quote.findUnique({ where: { id } })

  if (!quote) {
    return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  }

  if (quote.status !== 'SELECTED') {
    return NextResponse.json(
      { error: 'La cotización no está lista para emitir' },
      { status: 409 }
    )
  }

  await prisma.quote.update({
    where: { id },
    data: {
      clientName: parsed.data.name,
      clientEmail: parsed.data.email,
      clientPhone: parsed.data.phone,
      clientRfc: parsed.data.rfc ?? null,
      status: 'EMITTED',
    },
  })

  return NextResponse.json({ ok: true })
}
