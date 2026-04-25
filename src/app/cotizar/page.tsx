'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  { value: 'amplia_plus', label: 'Amplia Plus',  desc: 'Todo + auto sustituto' },
  { value: 'basica',      label: 'Básica',       desc: 'Robo total + RC' },
  { value: 'rc',          label: 'Solo RC',      desc: 'Responsabilidad civil' },
]

export default function CotizarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    brand: '', model: '', year: 2026,
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
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface-bright dark:bg-slate-950 docked full-width top-0 z-50 sticky editorial-shadow">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-blue-400" style={{ fontVariationSettings: "'FILL' 0" }}>security</span>
            <span className="text-2xl font-extrabold text-primary dark:text-white tracking-tighter">BrokerPro</span>
          </Link>
          <button className="font-sans text-sm uppercase tracking-widest text-primary dark:text-blue-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg">Ayuda</button>
        </div>
        <div className="bg-surface-container-low dark:bg-slate-900 h-1.5 w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-secondary w-1/3 transition-all duration-500 ease-in-out"></div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-xl mx-auto px-6 pt-12 pb-24">
        <div className="mb-8">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-sm font-semibold tracking-wide">
            Paso 1 de 3
          </span>
        </div>

        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight leading-tight mb-4">
            Datos de tu vehículo
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Para brindarte la mejor cobertura, necesitamos conocer un poco más sobre el auto que deseas asegurar.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-10">
          {error ? (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl font-medium border border-[#ffb4ab]">
              {error}
            </div>
          ) : null}

          <div className="group">
            <label className="block text-lg font-semibold text-on-surface mb-3 ml-1" htmlFor="marca">
              Marca del Auto
            </label>
            <div className="relative">
              <select
                id="marca"
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
                required
                className="w-full h-16 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
              >
                <option value="" disabled>Selecciona una marca</option>
                {BRANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">expand_more</span>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-lg font-semibold text-on-surface mb-3 ml-1" htmlFor="modelo">
              Modelo / Submarca
            </label>
            <div className="relative">
              <select
                id="modelo"
                value={form.model}
                onChange={e => set('model', e.target.value)}
                required
                disabled={!form.brand}
                className="w-full h-16 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>{form.brand ? 'Selecciona un modelo' : 'Primero selecciona marca'}</option>
                {(MODELS[form.brand] ?? []).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">expand_more</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-lg font-semibold text-on-surface mb-3 ml-1" htmlFor="anio">
                Año
              </label>
              <div className="relative">
                <select
                  id="anio"
                  value={form.year}
                  onChange={e => set('year', e.target.value)}
                  className="w-full h-16 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">calendar_today</span>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-lg font-semibold text-on-surface mb-3 ml-1" htmlFor="uso">
                Uso
              </label>
              <div className="relative">
                <select
                  id="uso"
                  value={form.uso}
                  onChange={e => set('uso', e.target.value)}
                  className="w-full h-16 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="particular">Particular</option>
                  <option value="comercial">Comercial</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-lg font-semibold text-on-surface mb-3 ml-1" htmlFor="cp">
              Código Postal
            </label>
            <input
              id="cp"
              type="text"
              value={form.zipCode}
              onChange={e => set('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Ej. 76000"
              required
              className="w-full h-16 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant"
            />
            <p className="mt-3 text-sm text-tertiary-container font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Lo usamos para calcular el costo por zona.
            </p>
          </div>

          <div className="group">
            <label className="block text-lg font-semibold text-on-surface mb-3 ml-1">
              Nivel de Cobertura
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COVERAGES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set('coverage', c.value)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    form.coverage === c.value
                      ? 'border-primary bg-primary-fixed/20'
                      : 'border-surface-variant hover:border-outline-variant bg-surface-container-lowest'
                  }`}
                >
                  <div className={`font-bold text-lg ${form.coverage === c.value ? 'text-primary' : 'text-on-surface'}`}>{c.label}</div>
                  <div className={`text-sm mt-1 leading-relaxed ${form.coverage === c.value ? 'text-on-primary-fixed-variant' : 'text-on-surface-variant'}`}>
                    {c.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[72px] bg-secondary text-on-secondary rounded-xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? 'Calculando opciones...' : 'Siguiente'}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </div>
        </form>
      </main>

      <footer className="bg-surface-bright dark:bg-slate-950 border-t border-surface-variant full-width py-12 mt-auto">
        <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 font-sans text-sm uppercase tracking-widest">
            <Link className="text-slate-400 hover:text-primary dark:hover:text-white transition-all" href="#">Privacidad</Link>
            <Link className="text-slate-400 hover:text-primary dark:hover:text-white transition-all" href="#">Términos</Link>
            <Link className="text-slate-400 hover:text-primary dark:hover:text-white transition-all" href="#">Ayuda</Link>
          </div>
          <p className="font-sans text-sm uppercase tracking-widest text-primary dark:text-blue-400 opacity-80">© 2026 BrokerPro Insurance</p>
        </div>
      </footer>
    </div>
  )
}