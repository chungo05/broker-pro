import type { QuoteRequest, QuoteResult } from './types'
import { BRAND_BASE, COVERAGE_FACTOR, yearFactor } from './utils'

// Mock para Mapfre Seguros
export async function quoteMapfre(req: QuoteRequest): Promise<QuoteResult> {
  const start = Date.now()

  // Simula latencia de red real (500–1000ms)
  await new Promise(r => setTimeout(r, 500 + Math.random() * 500))

  const base = BRAND_BASE[req.brand.toLowerCase()] ?? 9_000
  const annual = Math.round(
    base
    * COVERAGE_FACTOR[req.coverage]
    * yearFactor(req.year)
    * 1.08  // factor Mapfre específico
    / 100
  ) * 100

  return {
    carrierId:     'mapfre',
    carrierName:   'Mapfre Seguros',
    rating:        'A',
    annualPremium: annual,
    monthlyPremium: Math.round(annual / 12),
    coverage: {
      danosMaterialesDeducible: req.coverage !== 'rc' ? '5%' : undefined,
      roboTotal:      req.coverage === 'amplia_plus' ? 'Sin deducible' : '10%',
      rcMonto:        req.coverage !== 'basica' ? '4,000,000' : undefined,
      gastosMedicos:  '40,000',
      asistenciaVial: true,
      autoSustituto:  req.coverage === 'amplia_plus' ? '10 días' : undefined,
    },
    responseTime: Date.now() - start,
    available: true,
  }
}
