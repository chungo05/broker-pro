import type { QuoteRequest, QuoteResult } from './types'
import { BRAND_BASE, COVERAGE_FACTOR, yearFactor } from './utils'

// Por ahora: mock con la estructura exacta de lo que devolverá
// la integración real con el micrositio de ANA.
// Cuando tengas las credenciales, solo reemplazas este cuerpo.
export async function quoteAna(req: QuoteRequest): Promise<QuoteResult> {
  const start = Date.now()

  // Simula latencia de red real (400–900ms)
  await new Promise(r => setTimeout(r, 400 + Math.random() * 500))

  const base = BRAND_BASE[req.brand.toLowerCase()] ?? 9_000
  const annual = Math.round(
    base
    * COVERAGE_FACTOR[req.coverage]
    * yearFactor(req.year)
    * 1.02  // factor ANA específico
    / 100
  ) * 100

  return {
    carrierId:     'ana',
    carrierName:   'ANA Seguros',
    rating:        'A+',
    annualPremium: annual,
    monthlyPremium: Math.round(annual / 12),
    coverage: {
      danosMaterialesDeducible: req.coverage !== 'rc' ? '5%' : undefined,
      roboTotal:      req.coverage === 'amplia_plus' ? 'Sin deducible' : '10%',
      rcMonto:        req.coverage !== 'basica' ? '3,000,000' : undefined,
      gastosMedicos:  '50,000',
      asistenciaVial: true,
      autoSustituto:  req.coverage === 'amplia_plus' ? '15 días' : undefined,
    },
    responseTime: Date.now() - start,
    available: true,
  }
}