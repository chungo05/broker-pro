import { z } from 'zod'

export const quoteRequestSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(2000).max(2026),
  uso: z.enum(['particular', 'comercial']),
  zipCode: z.string().length(5),
  coverage: z.enum(['amplia', 'amplia_plus', 'basica', 'rc']),
})

export type QuoteRequestBody = z.infer<typeof quoteRequestSchema>
