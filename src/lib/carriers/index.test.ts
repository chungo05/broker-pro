import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuoteResult } from './types'

const { quoteAna, quoteAxa, quoteHdi, quoteGnp, quoteQualitas } = vi.hoisted(() => ({
  quoteAna: vi.fn(),
  quoteAxa: vi.fn(),
  quoteHdi: vi.fn(),
  quoteGnp: vi.fn(),
  quoteQualitas: vi.fn(),
}))

vi.mock('./ana', () => ({ quoteAna }))
vi.mock('./axa', () => ({ quoteAxa }))
vi.mock('./hdi', () => ({ quoteHdi }))
vi.mock('./gnp', () => ({ quoteGnp }))
vi.mock('./qualitas', () => ({ quoteQualitas }))

import { quoteAll } from './index'

function result(id: string, name: string, premium: number): QuoteResult {
  return {
    carrierId: id,
    carrierName: name,
    rating: 'A',
    annualPremium: premium,
    monthlyPremium: Math.round(premium / 12),
    coverage: { asistenciaVial: true },
    responseTime: 1,
    available: true,
  }
}

const req = {
  brand: 'toyota',
  model: 'Corolla',
  year: 2024,
  uso: 'particular' as const,
  zipCode: '01000',
  coverage: 'amplia' as const,
}

describe('quoteAll', () => {
  beforeEach(() => {
    vi.mocked(quoteAna).mockResolvedValue(result('ana', 'ANA', 900))
    vi.mocked(quoteAxa).mockResolvedValue(result('axa', 'AXA', 300))
    vi.mocked(quoteHdi).mockRejectedValue(new Error('upstream'))
    vi.mocked(quoteGnp).mockResolvedValue(result('gnp', 'GNP', 600))
    vi.mocked(quoteQualitas).mockResolvedValue(result('qualitas', 'Qualitas', 450))
  })

  it('returns fulfilled carriers sorted by annualPremium ascending', async () => {
    const out = await quoteAll(req)
    expect(out.map(r => r.carrierId)).toEqual(['axa', 'qualitas', 'gnp', 'ana'])
  })

  it('omits carriers that reject', async () => {
    vi.mocked(quoteAxa).mockRejectedValue(new Error('down'))
    const out = await quoteAll(req)
    expect(out.map(r => r.carrierId)).toEqual(['qualitas', 'gnp', 'ana'])
  })
})
