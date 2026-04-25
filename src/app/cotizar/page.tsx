'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const BRANDS = [
  { value: 'nissan',    label: 'Nissan' },
  { value: 'vw',        label: 'Volkswagen' },
  { value: 'chevrolet', label: 'Chevrolet' },
  { value: 'toyota',    label: 'Toyota' },
  { value: 'honda',     label: 'Honda' },
  { value: 'mazda',     label: 'Mazda' },
  { value: 'kia',       label: 'Kia' },
  { value: 'ford',      label: 'Ford' },
  { value: 'seat',      label: 'SEAT' },
]

const MODELS: Record<string, string[]> = {
  nissan:    ['Sentra', 'Versa', 'Kicks', 'March', 'Frontier'],
  vw:        ['Jetta', 'Golf', 'Tiguan', 'Vento', 'T-Cross'],
  chevrolet: ['Spark', 'Aveo', 'Trax', 'Equinox', 'Trailblazer'],
  toyota:    ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Yaris'],
  honda:     ['Civic', 'City', 'HR-V', 'CR-V', 'Accord'],
  mazda:     ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-30'],
  kia:       ['Rio', 'Forte', 'Sportage', 'Sorento', 'Seltos'],
  ford:      ['Fiesta', 'Focus', 'Mustang', 'Explorer', 'F-150'],
  seat:      ['Ibiza', 'León', 'Arona', 'Ateca'],
}

const YEARS = Array.from({ length: 20 }, (_, i) => 2026 - i)

const COVERAGES = [
  { value: 'amplia',      label: 'Amplia',      desc: 'Daños, robo, RC, GM' },
  { value: 'amplia_plus', label: 'Amplia Plus',  desc: 'Todo + auto sustituto y sin deducible en robo' },
  { value: 'basica',      label: 'Básica',       desc: 'Robo total + RC' },
  { value: 'rc',          label: 'Solo RC',      desc: 'Responsabilidad civil únicamente' },
]

export default function CotizarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    brand: '', model: '', year: 2024,
    uso: 'particular', zipCode: '', coverage: 'amplia',
  })

  const set = (key: string, value: any) =>
    setForm(f => ({ ...f, [key]: value, ...(key === 'brand' ? { model: '' } : {}) }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.brand || !form.model || !form.zipCode) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: Number(form.year) }),
      })
      const contentType = res.headers.get('content-type') ?? ''
      const payload =
        contentType.includes('application/json')
          ? await res.json()
          : await res.text()

      if (!res.ok) {
        const msg =
          typeof payload === 'string'
            ? payload
            : typeof payload?.error === 'string'
              ? payload.error
              : 'No se pudo crear la cotización'
        setError(msg)
        setLoading(false)
        return
      }

      const quoteId =
        typeof payload === 'string' ? null : (payload?.quoteId as string | undefined)
      if (!quoteId) {
        setError('Respuesta inválida del servidor')
        setLoading(false)
        return
      }
      router.push(`/cotizar/${quoteId}`)
    } catch (err) {
      console.error(err)
      setError('Error de red. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Cotiza tu auto
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Comparamos entre las mejores aseguradoras en segundos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
          {/* Marca */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Marca
            </label>
            <select
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              required
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-[#aa3a39] bg-stone-50 focus:outline-none focus:border-stone-400"
            >
              <option value="">Selecciona marca</option>
              {BRANDS.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Modelo
            </label>
            <select
              value={form.model}
              onChange={e => set('model', e.target.value)}
              required
              disabled={!form.brand}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-[#aa3a39] bg-stone-50 focus:outline-none focus:border-stone-400 disabled:opacity-40"
            >
              <option value="">
                {form.brand ? 'Selecciona modelo' : 'Primero selecciona marca'}
              </option>
              {(MODELS[form.brand] ?? []).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Año + Uso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Año
              </label>
              <select
                value={form.year}
                onChange={e => set('year', e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-[#aa3a39] bg-stone-50 focus:outline-none focus:border-stone-400"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Uso
              </label>
              <select
                value={form.uso}
                onChange={e => set('uso', e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-[#aa3a39] bg-stone-50 focus:outline-none focus:border-stone-400"
              >
                <option value="particular">Particular</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
          </div>

          {/* CP */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Código Postal
            </label>
            <input
              type="text"
              value={form.zipCode}
              onChange={e => set('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="76000"
              required
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-[#aa3a39] bg-stone-50 focus:outline-none focus:border-stone-400"
            />
          </div>

          {/* Cobertura */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Cobertura
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COVERAGES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set('coverage', c.value)}
                  className={`text-left p-3 rounded-lg border text-sm transition-all ${
                    form.coverage === c.value
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="font-semibold">{c.label}</div>
                  <div className={`text-xs mt-0.5 ${form.coverage === c.value ? 'text-stone-300' : 'text-stone-400'}`}>
                    {c.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold rounded-xl py-3 text-sm tracking-wide transition-colors mt-2"
          >
            {loading ? 'Consultando aseguradoras...' : '⚡ Ver cotizaciones'}
          </button>
        </form>
      </div>
    </main>
  )
}