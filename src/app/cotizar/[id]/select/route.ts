import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { carrierId, premium } = await req.json()

  await prisma.quote.update({
    where: { id: params.id },
    data: {
      selectedCarrier: carrierId,
      selectedPremium: premium,
      status: 'SELECTED',
    },
  })

  return NextResponse.json({ ok: true })
}