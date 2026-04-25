'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

const inputClass =
  'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-[#aa3a39] bg-stone-50 focus:outline-none focus:border-stone-400'

export default function AdminLoginPage() {
  const [callbackUrl, setCallbackUrl] = useState('/admin')
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setCallbackUrl(p.get('callbackUrl') ?? '/admin')
  }, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const r = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })
    setLoading(false)
    if (r?.error) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    if (r?.url) {
      window.location.href = r.url
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">Admin — BrokerPro</h1>
        <p className="text-stone-500 text-sm mt-1 mb-6">Inicia sesión con las credenciales de tu `.env`.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Correo
            </label>
            <input
              type="email"
              autoComplete="username"
              required
              className={inputClass}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-red-600 disabled:bg-stone-300 text-white font-bold rounded-xl py-3 text-sm"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
