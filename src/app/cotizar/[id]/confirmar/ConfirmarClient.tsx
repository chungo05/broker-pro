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
    <main className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
            {readOnly ? 'Solicitud enviada' : 'Confirmar cotización'}
          </p>
          <h1 className="text-2xl font-bold text-stone-900">
            {readOnly ? 'Gracias por tu solicitud' : 'Tus datos'}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {readOnly
              ? 'Un asesor revisará tu caso y te contactará pronto.'
              : 'Completa el formulario para solicitar la póliza con la opción elegida.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
            Resumen
          </h2>
          <p className="text-stone-900 font-medium">
            {quote.brand.charAt(0).toUpperCase() + quote.brand.slice(1)} {quote.model}{' '}
            {quote.year}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            {quote.uso === 'particular' ? 'Uso particular' : 'Uso comercial'} · CP {quote.zipCode}
          </p>
          <p className="text-sm text-stone-500">
            Cobertura {COVERAGE_LABEL[quote.coverage] ?? quote.coverage}
          </p>
          <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-stone-900">{selectedResult.carrierName}</p>
              <p className="text-xs text-stone-400">{selectedResult.rating}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-stone-900">
                ${selectedResult.annualPremium.toLocaleString('es-MX')}
              </p>
              <p className="text-xs text-stone-400">anual</p>
            </div>
          </div>
          <a
            href={`/api/quote/${quote.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-red-700 hover:text-red-800 underline decoration-red-200 underline-offset-2"
          >
            Descargar cotización en PDF
          </a>
        </div>

        {readOnly ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-2 text-sm">
            <p>
              <span className="text-stone-500">Nombre:</span>{' '}
              <span className="font-medium text-stone-900">{quote.clientName}</span>
            </p>
            <p>
              <span className="text-stone-500">Correo:</span>{' '}
              <span className="font-medium text-stone-900">{quote.clientEmail}</span>
            </p>
            <p>
              <span className="text-stone-500">Teléfono:</span>{' '}
              <span className="font-medium text-stone-900">{quote.clientPhone}</span>
            </p>
            {quote.clientRfc ? (
              <p>
                <span className="text-stone-500">RFC:</span>{' '}
                <span className="font-medium text-stone-900">{quote.clientRfc}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            {error ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Nombre completo
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:outline-none focus:border-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:outline-none focus:border-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Teléfono (10 dígitos o más)
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:outline-none focus:border-stone-400"
                placeholder="55 1234 5678"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                RFC <span className="font-normal text-stone-400">(opcional)</span>
              </label>
              <input
                value={form.rfc}
                onChange={(e) => setForm((f) => ({ ...f, rfc: e.target.value.toUpperCase() }))}
                maxLength={13}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:outline-none focus:border-stone-400 uppercase"
                placeholder="XAXX010101000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold rounded-xl py-3 text-sm tracking-wide transition-colors"
            >
              {loading ? 'Enviando…' : 'Solicitar póliza'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
