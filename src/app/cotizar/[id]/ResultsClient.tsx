'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuoteResult } from '@/lib/carriers/types'

interface Props {
  quote: {
    id: string
    brand: string
    model: string
    year: number
    coverage: string
    results: QuoteResult[]
  }
}

const COVERAGE_LABEL: Record<string, string> = {
  amplia:      'Amplia',
  amplia_plus: 'Amplia Plus',
  basica:      'Básica',
  rc:          'Solo RC',
}

export default function ResultsClient({ quote }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  async function handleSelect(carrierId: string, premium: number) {
    setSelected(carrierId)
    await fetch(`/api/quote/${quote.id}/select`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrierId, premium }),
    })
    router.push(`/cotizar/${quote.id}/confirmar?carrier=${carrierId}`)
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Cotización
          </p>
          <h1 className="text-2xl font-bold text-stone-900">
            {quote.brand.charAt(0).toUpperCase() + quote.brand.slice(1)} {quote.model} {quote.year}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Cobertura {COVERAGE_LABEL[quote.coverage]} · {quote.results.length} aseguradoras
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {quote.results.map((r, i) => (
            <div
              key={r.carrierId}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                i === 0
                  ? 'border-green-400 shadow-sm shadow-green-50'
                  : 'border-stone-200'
              }`}
            >
              {i === 0 && (
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">
                  ★ Mejor precio
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                {/* Carrier info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-stone-900">{r.carrierName}</span>
                    <span className="text-xs font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded">
                      {r.rating}
                    </span>
                  </div>

                  {/* Coberturas */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.coverage.danosMaterialesDeducible && (
                      <span className="text-xs bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                        DM {r.coverage.danosMaterialesDeducible}
                      </span>
                    )}
                    {r.coverage.roboTotal && (
                      <span className="text-xs bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                        RT {r.coverage.roboTotal}
                      </span>
                    )}
                    {r.coverage.rcMonto && (
                      <span className="text-xs bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                        RC ${r.coverage.rcMonto}
                      </span>
                    )}
                    {r.coverage.gastosMedicos && (
                      <span className="text-xs bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                        GM ${r.coverage.gastosMedicos}
                      </span>
                    )}
                    {r.coverage.asistenciaVial && (
                      <span className="text-xs bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                        Asistencia vial
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-400 mt-2">
                    Respondió en {r.responseTime}ms
                  </p>
                </div>

                {/* Precio + CTA */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-extrabold text-stone-900 leading-none">
                    ${r.annualPremium.toLocaleString('es-MX')}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5 mb-3">
                    ≈ ${r.monthlyPremium.toLocaleString('es-MX')}/mes
                  </div>
                  <button
                    onClick={() => handleSelect(r.carrierId, r.annualPremium)}
                    disabled={selected !== null}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      selected === r.carrierId
                        ? 'bg-green-600 text-white'
                        : 'bg-stone-900 hover:bg-red-600 text-white disabled:opacity-40'
                    }`}
                  >
                    {selected === r.carrierId ? '✓ Seleccionado' : 'Seleccionar →'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Precios estimados. La prima final puede variar según verificación de datos.
        </p>
      </div>
    </main>
  )
}