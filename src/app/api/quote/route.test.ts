import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { prisma } from '@/lib/db'
import { quoteAll } from '@/lib/carriers'

vi.mock('@/lib/db', () => ({
  prisma: {
    quote: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/carriers', () => ({
  quoteAll: vi.fn(),
}))

describe('POST /api/quote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar 400 si el body es inválido', async () => {
    const req = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      body: JSON.stringify({ brand: '' }), // Falta model, year, etc.
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  it('debería crear la cotización y retornar 200 con resultados válidos', async () => {
    // Simulamos la respuesta de quoteAll
    const mockResults = [
      { carrierId: 'axa', annualPremium: 10000 },
      { carrierId: 'gnp', annualPremium: 12000 },
    ]
    vi.mocked(quoteAll).mockResolvedValue(mockResults as any)

    // Simulamos la respuesta de Prisma
    vi.mocked(prisma.quote.create).mockResolvedValue({ id: 'test-quote-id' } as any)

    const req = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        brand: 'Nissan',
        model: 'Versa',
        year: 2023,
        uso: 'particular',
        zipCode: '12345',
        coverage: 'amplia',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.quoteId).toBe('test-quote-id')
    expect(json.results).toEqual(mockResults)

    expect(quoteAll).toHaveBeenCalledWith({
      brand: 'Nissan',
      model: 'Versa',
      year: 2023,
      uso: 'particular',
      zipCode: '12345',
      coverage: 'amplia',
    })

    expect(prisma.quote.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        brand: 'Nissan',
        model: 'Versa',
        year: 2023,
        results: mockResults,
      }),
    })
  })
})
