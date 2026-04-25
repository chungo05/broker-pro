'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuoteResult } from '@/lib/carriers/types'

const COVERAGE_LABEL: Record<string, string> = {
  amplia: 'Amplia',
  amplia_plus: 'Amplia Plus',
  basica: 'Básica',
  rc: 'Solo RC',
}

type QuoteSummary = {
  id: string
  brand: string
  model: string
  year: number
  coverage: string
  uso: string
  zipCode: string
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  clientRfc: string | null
}

interface Props {
  quote: QuoteSummary
  selectedResult: QuoteResult
  readOnly: boolean
}

export default function ConfirmarClient({ quote, selectedResult, readOnly }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: quote.clientName ?? '',
    email: quote.clientEmail ?? '',
    phone: quote.clientPhone ?? '',
    rfc: quote.clientRfc ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/quote/${quote.id}/emit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          rfc: form.rfc,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo enviar la solicitud')
        setLoading(false)
        return
      }
      router.refresh()
    } catch {
      setError('Error de red. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface flex flex-col min-h-screen">
      <nav className="bg-gradient-to-r from-[#003369] to-[#0A4A8F] dark:from-slate-900 dark:to-blue-900 text-white font-sans text-lg font-bold tracking-tight docked full-width top-0 rounded-b-none no-border shadow-2xl shadow-blue-900/20 shadow-[0px_40px_60px_rgba(25,28,30,0.08)] flex items-center justify-between px-6 h-20 w-full fixed z-50">
        <div onClick={() => router.back()} className="flex items-center gap-4 active:scale-95 duration-200 cursor-pointer">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-white opacity-100">Paso 3 de 3</span>
        </div>
        <div className="text-white font-black text-xl">BrokerPro</div>
      </nav>

      <main className="flex-grow pt-28 pb-12 px-6 max-w-md mx-auto w-full">
        {!readOnly && (
          <div className="flex gap-2 mb-8 justify-center">
            <div className="h-2 w-12 rounded-full bg-secondary"></div>
            <div className="h-2 w-12 rounded-full bg-secondary"></div>
            <div className="h-2 w-12 rounded-full bg-primary"></div>
          </div>
        )}

        <header className="mb-10 text-center">
          <h1 className="text-on-surface font-black text-[2.5rem] leading-tight tracking-tighter mb-2">
            {readOnly ? '¡Póliza Emitida!' : '¡Excelente elección!'}
          </h1>
          <p className="text-on-surface-variant text-lg">
            {readOnly ? 'Tus datos han sido registrados con éxito.' : 'Confirma tus datos para finalizar la contratación.'}
          </p>
        </header>

        <section className="bg-surface-container-lowest rounded-xl shadow-[0px_40px_60px_rgba(25,28,30,0.08)] p-8 mb-10 overflow-hidden relative border border-outline-variant/15">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {selectedResult.carrierId === 'mapfre' ? 'verified_user' : selectedResult.carrierId === 'hdi' ? 'security' : 'shield'}
                </span>
              </div>
              <div>
                <p className="text-on-surface-variant font-medium text-xs uppercase tracking-widest">Aseguradora</p>
                <p className="text-on-surface font-bold text-xl">{selectedResult.carrierName}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-on-surface-variant font-medium text-xs uppercase tracking-widest mb-1">Vehículo</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">directions_car</span>
                <p className="text-on-surface font-semibold text-lg">{quote.brand.charAt(0).toUpperCase() + quote.brand.slice(1)} {quote.model} {quote.year}</p>
              </div>
              <p className="text-on-surface-variant text-sm mt-1 ml-8">Cobertura {COVERAGE_LABEL[quote.coverage]} · Uso {quote.uso}</p>
            </div>

            <div className="pt-6 border-t border-surface-container-highest">
              <p className="text-on-surface-variant font-medium text-xs uppercase tracking-widest mb-1">Precio Final</p>
              <p className="text-primary font-black text-4xl">${selectedResult.annualPremium.toLocaleString('es-MX')} <span className="text-lg font-bold">MXN</span></p>
              <p className="text-secondary font-bold text-sm mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Incluye todos los impuestos
              </p>
            </div>
          </div>
        </section>

        {readOnly ? (
          <section className="bg-surface-container-lowest rounded-xl shadow-[0px_40px_60px_rgba(25,28,30,0.08)] p-8 mb-10 overflow-hidden relative border border-outline-variant/15 space-y-4">
            <h2 className="font-bold text-lg text-primary mb-2">Tus Datos</h2>
            <div>
              <p className="text-on-surface-variant text-sm">Nombre</p>
              <p className="text-on-surface font-medium">{quote.clientName}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm">Correo</p>
              <p className="text-on-surface font-medium">{quote.clientEmail}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm">Teléfono</p>
              <p className="text-on-surface font-medium">{quote.clientPhone}</p>
            </div>
            {quote.clientRfc && (
              <div>
                <p className="text-on-surface-variant text-sm">RFC</p>
                <p className="text-on-surface font-medium">{quote.clientRfc}</p>
              </div>
            )}
            
            <a href={`/api/quote/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full h-16 border-2 border-primary text-primary rounded-xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-3 bg-transparent hover:bg-primary-fixed/20">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              Descargar PDF de Póliza
            </a>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mb-12">
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-xl font-medium border border-[#ffb4ab]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-on-surface-variant font-bold text-sm px-1">Tu Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-surface-container-highest border-none rounded-xl h-16 px-6 text-lg text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline"
                  placeholder="Ej. Juan Pérez García"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-on-surface-variant font-bold text-sm px-1">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-surface-container-highest border-none rounded-xl h-16 px-6 text-lg text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline"
                  placeholder="nombre@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-on-surface-variant font-bold text-sm px-1">Teléfono Celular</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-surface-container-highest border-none rounded-xl h-16 px-6 text-lg text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline"
                  placeholder="55 0000 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-on-surface-variant font-bold text-sm px-1">RFC <span className="font-normal text-outline">(opcional)</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={form.rfc}
                  onChange={(e) => setForm((f) => ({ ...f, rfc: e.target.value.toUpperCase() }))}
                  maxLength={13}
                  className="w-full bg-surface-container-highest border-none rounded-xl h-16 px-6 text-lg text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline uppercase"
                  placeholder="XAXX010101000"
                />
              </div>
            </div>

            <section className="flex flex-col gap-4 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-secondary to-[#008542] text-white rounded-xl font-bold text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none hover:brightness-110"
              >
                {loading ? 'Procesando...' : 'Emitir Póliza'}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
              <a href={`/api/quote/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer" className="w-full h-16 border-2 border-primary text-primary rounded-xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-3 bg-transparent hover:bg-primary-fixed/20">
                <span className="material-symbols-outlined">picture_as_pdf</span>
                Descargar PDF de Cotización
              </a>
            </section>
          </form>
        )}
      </main>

      <footer className="bg-[#f2f4f6] dark:bg-slate-900 w-full py-8 flex flex-col items-center gap-4 mt-auto">
        <div className="flex gap-6">
          <a className="font-sans text-[12px] font-medium uppercase tracking-widest text-[#0A4A8F] dark:text-blue-400 hover:text-primary transition-colors" href="#">Privacidad</a>
          <a className="font-sans text-[12px] font-medium uppercase tracking-widest text-[#0A4A8F] dark:text-blue-400 hover:text-primary transition-colors" href="#">Soporte</a>
        </div>
        <p className="font-sans text-[12px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">© 2026 BrokerPro Insurance</p>
      </footer>
    </div>
  )
}
