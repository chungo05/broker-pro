import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  SELECTED: 'Seleccionada',
  EMITTED: 'Emitida',
}

export default async function AdminPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const statusFilter = typeof searchParams.status === 'string' && searchParams.status ? searchParams.status : undefined
  const q = typeof searchParams.q === 'string' && searchParams.q ? searchParams.q : undefined

  const where: any = {}
  if (statusFilter) {
    where.status = statusFilter
  }
  if (q) {
    where.OR = [
      { clientName: { contains: q, mode: 'insensitive' } },
      { clientEmail: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { model: { contains: q, mode: 'insensitive' } },
    ]
  }

  const elevenMonthsAgo = new Date()
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11)

  const [totalQuotes, convertedQuotes, premiumStats, quotes, expiringQuotes] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { status: { in: ['SELECTED', 'EMITTED'] } } }),
    prisma.quote.aggregate({
      where: { status: { in: ['SELECTED', 'EMITTED'] }, selectedPremium: { not: null } },
      _avg: { selectedPremium: true }
    }),
    prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.quote.findMany({
      where: { 
        status: 'EMITTED', 
        createdAt: { lte: elevenMonthsAgo }
      },
      orderBy: { createdAt: 'asc' },
      take: 5
    })
  ])

  const conversionRate = totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0
  const averagePremium = premiumStats._avg.selectedPremium ?? 0

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Panel de Administración</h1>
            <p className="text-stone-500 text-sm mt-1">
              Sesión iniciada como: {session.user?.email}
            </p>
          </div>
          <a
            className="text-sm font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-4 py-2 rounded-lg shadow-sm"
            href="/api/auth/signout?callbackUrl=/"
          >
            Cerrar sesión
          </a>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-stone-500 text-sm font-medium">Cotizaciones Totales</h3>
            <p className="text-3xl font-bold text-stone-900 mt-2">{totalQuotes}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-stone-500 text-sm font-medium">Tasa de Conversión</h3>
            <p className="text-3xl font-bold text-stone-900 mt-2">{conversionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-stone-500 text-sm font-medium">Prima Promedio (Conversiones)</h3>
            <p className="text-3xl font-bold text-stone-900 mt-2">
              ${averagePremium.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-amber-800 font-semibold mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Alertas: Pólizas próximas a vencer
          </h3>
          {expiringQuotes.length === 0 ? (
            <p className="text-amber-700 text-sm">No hay pólizas próximas a vencer (más de 11 meses de antigüedad).</p>
          ) : (
            <ul className="space-y-2 mt-4 text-sm text-amber-900">
              {expiringQuotes.map((q) => (
                <li key={q.id} className="flex items-center justify-between bg-amber-100/50 p-3 rounded-lg border border-amber-200/50">
                  <div>
                    <span className="font-semibold">{q.clientName || q.clientEmail || 'Cliente sin nombre'}</span>
                    <span className="mx-2 text-amber-700/50">|</span>
                    <span>{q.brand} {q.model} {q.year}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-amber-700 text-xs">
                      Emitida el {q.createdAt.toLocaleDateString('es-MX')}
                    </span>
                    <Link
                      href={`/cotizar/${q.id}`}
                      target="_blank"
                      className="text-amber-700 font-medium hover:text-amber-900 underline text-xs"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <form method="GET" className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar auto, email, nombre..."
              className="border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aa3a39] w-full md:w-64 text-[#aa3a39]"
            />
            <select
              name="status"
              defaultValue={statusFilter ?? ''}
              className="border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#aa3a39] w-full md:w-auto text-[#aa3a39]"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="SELECTED">Seleccionada</option>
              <option value="EMITTED">Emitida</option>
            </select>
            <button
              type="submit"
              className="bg-[#aa3a39] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8e2e2e] transition-colors"
            >
              Filtrar
            </button>
            {(q || statusFilter) && (
              <Link
                href="/admin"
                className="bg-stone-100 text-stone-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors text-center"
              >
                Limpiar
              </Link>
            )}
          </form>
          <div className="text-sm text-stone-500">
            Mostrando {quotes.length} resultados
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Vehículo</th>
                  <th className="px-4 py-3 font-semibold">Aseguradora</th>
                  <th className="px-4 py-3 font-semibold text-right">Prima anual</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                      No se encontraron cotizaciones con estos filtros.
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50/80"
                    >
                      <td className="px-4 py-2.5 text-stone-600 whitespace-nowrap">
                        {quote.createdAt.toLocaleString('es-MX', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-2.5 text-stone-800">
                        {STATUS_LABEL[quote.status] ?? quote.status}
                      </td>
                      <td className="px-4 py-2.5 text-stone-800">
                        <Link
                          className="font-medium text-[#aa3a39] hover:underline"
                          href={`/cotizar/${quote.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {quote.brand} {quote.model} {quote.year}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-stone-800">
                        {quote.selectedCarrier ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-800 tabular-nums">
                        {quote.selectedPremium != null
                          ? `$${quote.selectedPremium.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-stone-600 text-xs break-all max-w-[12rem]">
                        {quote.clientName && <div className="font-medium text-stone-800">{quote.clientName}</div>}
                        {quote.clientEmail ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
