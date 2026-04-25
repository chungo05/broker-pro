import { describe, expect, it } from 'vitest'
import { emitQuoteSchema } from './emit-quote-schema'

describe('emitQuoteSchema', () => {
  it('accepts valid body and strips phone to digits', () => {
    const r = emitQuoteSchema.safeParse({
      name: 'María Pérez',
      email: 'maria@example.com',
      phone: '+52 55 1234 5678',
      rfc: '',
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.phone).toBe('525512345678')
      expect(r.data.rfc).toBeUndefined()
    }
  })

  it('normalizes optional RFC', () => {
    const r = emitQuoteSchema.safeParse({
      name: 'Juan',
      email: 'j@example.com',
      phone: '5512345678',
      rfc: 'xaxx010101000',
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.rfc).toBe('XAXX010101000')
  })

  it('rejects short phone after digit strip', () => {
    const r = emitQuoteSchema.safeParse({
      name: 'Juan',
      email: 'j@example.com',
      phone: '123',
    })
    expect(r.success).toBe(false)
  })
})
