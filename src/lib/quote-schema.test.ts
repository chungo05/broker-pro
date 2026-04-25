import { describe, expect, it } from 'vitest'
import { quoteRequestSchema } from './quote-schema'

const valid = {
  brand: 'toyota',
  model: 'Corolla',
  year: 2024,
  uso: 'particular' as const,
  zipCode: '01000',
  coverage: 'amplia' as const,
}

describe('quoteRequestSchema', () => {
  it('accepts a valid payload', () => {
    const r = quoteRequestSchema.safeParse(valid)
    expect(r.success).toBe(true)
  })

  it('rejects zip codes that are not 5 digits', () => {
    const r = quoteRequestSchema.safeParse({ ...valid, zipCode: '0100' })
    expect(r.success).toBe(false)
  })

  it('rejects year above max', () => {
    const r = quoteRequestSchema.safeParse({ ...valid, year: 2027 })
    expect(r.success).toBe(false)
  })

  it('rejects invalid coverage enum', () => {
    const r = quoteRequestSchema.safeParse({ ...valid, coverage: 'full' })
    expect(r.success).toBe(false)
  })
})
