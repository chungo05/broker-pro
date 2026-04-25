'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    try {
      const res = await fetch(`/api/quote/${quote.id}/select`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrierId, premium }),
      })
      if (!res.ok) {
        setSelected(null)
        return
      }
      router.push(`/cotizar/${quote.id}/confirmar?carrier=${carrierId}`)
    } catch {
      setSelected(null)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <header className="sticky top-0 z-50 bg-[#f8f9fb] dark:bg-slate-950 editorial-shadow">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="transition-all duration-300 ease-in-out active:scale-95 text-[#003369] dark:text-blue-400 p-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
            </button>
            <h1 className="font-sans font-bold text-3xl leading-tight text-[#003369] dark:text-blue-400">Paso 2 de 3</h1>
          </div>
          <button className="transition-all duration-300 ease-in-out active:scale-95 text-[#003369] dark:text-blue-400 p-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        <section className="mb-10 text-center md:text-left">
          <h2 className="text-[3.5rem] font-black leading-[1.1] tracking-tight text-primary mb-4">
            Opciones de Seguro para tu <span className="text-primary-container">{quote.brand.charAt(0).toUpperCase() + quote.brand.slice(1)} {quote.model}</span>
          </h2>
          <p className="text-[1.125rem] text-on-surface-variant font-medium">
            Compara y elige la mejor opción para ti. Cobertura {COVERAGE_LABEL[quote.coverage]}.
          </p>
        </section>

        <div className="space-y-8">
          {quote.results.map((r, i) => (
            <div key={r.carrierId} className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden transition-transform active:scale-[0.98]">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {r.carrierId === 'mapfre' ? 'verified_user' : r.carrierId === 'hdi' ? 'security' : 'shield'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold tracking-tight text-on-surface block">{r.carrierName}</span>
                      <span className="text-xs font-semibold text-outline-variant">{r.rating}</span>
                    </div>
                  </div>
                  {i === 0 && (
                    <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-widest">Recomendado</span>
                  )}
                </div>

                <div className="mb-8">
                  <span className="text-on-surface-variant block mb-1">Precio Anual</span>
                  <div className="text-[2.5rem] font-black text-primary leading-none">${r.annualPremium.toLocaleString('es-MX')} <span className="text-xl font-bold">MXN</span></div>
                </div>

                <ul className="space-y-3 mb-10 text-on-surface-variant">
                  {r.coverage.danosMaterialesDeducible && (
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Daños Materiales ({r.coverage.danosMaterialesDeducible})
                    </li>
                  )}
                  {r.coverage.roboTotal && (
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Robo Total ({r.coverage.roboTotal})
                    </li>
                  )}
                  {r.coverage.rcMonto && (
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      RC ${r.coverage.rcMonto}
                    </li>
                  )}
                  {r.coverage.gastosMedicos && (
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Gastos Médicos ${r.coverage.gastosMedicos}
                    </li>
                  )}
                  {r.coverage.asistenciaVial && (
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Asistencia Vial Incluida
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => handleSelect(r.carrierId, r.annualPremium)}
                  disabled={selected !== null}
                  className={`w-full py-6 rounded-xl text-xl font-bold editorial-shadow transition-all active:scale-95 flex items-center justify-center gap-3 ${
                    selected === r.carrierId
                      ? 'bg-secondary text-white'
                      : 'bg-primary text-white hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none'
                  }`}
                >
                  {selected === r.carrierId ? '✓ Seleccionado' : 'Elegir esta opción'}
                  {selected !== r.carrierId && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-primary-fixed text-on-primary-fixed p-8 rounded-xl flex flex-col items-center text-center gap-4">
          <span className="material-symbols-outlined text-4xl">contact_support</span>
          <h3 className="text-xl font-black">¿Necesitas ayuda para decidir?</h3>
          <p className="font-medium">Nuestros asesores están listos para guiarte en tu elección.</p>
          <button className="mt-2 text-primary font-bold border-2 border-primary px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-all">
            Llamar a un asesor
          </button>
        </div>
      </main>
    </div>
  )
}