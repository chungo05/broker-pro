import { z } from 'zod'

export const emitQuoteSchema = z.object({
  name: z.string().trim().min(2, 'Nombre muy corto').max(120),
  email: z.string().trim().email('Correo inválido'),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/\D/g, ''))
    .refine((d) => d.length >= 10 && d.length <= 15, 'Teléfono inválido'),
  rfc: z
    .string()
    .trim()
    .max(13)
    .optional()
    .transform((s) => (s && s.length > 0 ? s.toUpperCase() : undefined)),
})

export type EmitQuoteBody = z.infer<typeof emitQuoteSchema>
