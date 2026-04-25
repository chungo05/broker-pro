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
    <div className="bg-surface text-on-surface antialiased flex min-h-screen">
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r-0 bg-[#f2f4f6] dark:bg-slate-900 flex flex-col py-8 px-4 z-50">
        <div className="mb-12 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#003369] to-[#0a4a8f] rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-[#003369] dark:text-white leading-none">BrokerPro</h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mt-1">Editorial Concierge</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#003369] dark:text-blue-400 font-bold border-r-2 border-[#003369] bg-white/50 dark:bg-slate-800/50" href="#">
            <span className="material-symbols-outlined">request_quote</span>
            <span>Cotizaciones</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#424751] dark:text-slate-400 hover:text-[#003369] hover:bg-white/50 dark:hover:bg-slate-800/50" href="#">
            <span className="material-symbols-outlined">description</span>
            <span>Pólizas</span>
          </a>
        </nav>
        <div className="mt-auto border-t border-outline-variant/10 pt-6">
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#424751] dark:text-slate-400 hover:text-error hover:bg-red-50" href="/api/auth/signout?callbackUrl=/">
            <span className="material-symbols-outlined">logout</span>
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-40 bg-transparent flex items-center justify-between px-12 py-6">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-[#003369] dark:text-white">Panel de Control</h2>
            <p className="text-xs text-on-surface-variant font-medium">Bienvenido de nuevo, {session.user?.email}</p>
          </div>
          <div className="flex items-center gap-6">
            <form method="GET" className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input name="q" defaultValue={q} className="bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" placeholder="Buscar cotización..." type="text"/>
            </form>
            <div className="h-10 w-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold shadow-sm">
              {session.user?.email?.[0].toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        <div className="px-12 pb-12 space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Cotizaciones */}
            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between h-48 group hover:shadow-xl transition-all duration-500">
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Total Cotizaciones</span>
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                </div>
              </div>
              <div>
                <div className="text-[3.5rem] font-extrabold leading-none text-primary tracking-tighter">{totalQuotes}</div>
              </div>
            </div>
            {/* Tasa de Conversión */}
            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between h-48 group hover:shadow-xl transition-all duration-500">
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Tasa de Conversión</span>
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
                </div>
              </div>
              <div>
                <div className="text-[3.5rem] font-extrabold leading-none text-on-surface tracking-tighter">{conversionRate.toFixed(1)}%</div>
                <p className="text-on-surface-variant/60 text-xs mt-2 font-medium">Prima prom: ${averagePremium.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </div>
            {/* Próximas a Vencer */}
            <div className={`bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between h-48 group hover:shadow-xl transition-all duration-500 border-b-4 ${expiringQuotes.length > 0 ? 'border-tertiary-fixed-dim' : 'border-surface-container'}`}>
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Próximas a Vencer</span>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${expiringQuotes.length > 0 ? 'bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim' : 'bg-surface-container text-outline'}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                </div>
              </div>
              <div>
                <div className={`text-[3.5rem] font-extrabold leading-none tracking-tighter ${expiringQuotes.length > 0 ? 'text-tertiary-container' : 'text-outline'}`}>{expiringQuotes.length}</div>
                <p className={`text-xs mt-2 font-bold flex items-center gap-1 ${expiringQuotes.length > 0 ? 'text-tertiary-container/70' : 'text-outline'}`}>
                  {expiringQuotes.length > 0 ? 'Requiere atención inmediata' : 'Sin renovaciones pendientes'}
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-8">
            <section className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-primary">Cotizaciones Recientes</h3>
                  <p className="text-on-surface-variant text-xs mt-1">Mostrando {quotes.length} resultados</p>
                </div>
                <form method="GET" className="flex items-center gap-3">
                  <select
                    name="status"
                    defaultValue={statusFilter ?? ''}
                    className="bg-surface-container-low border-none rounded-lg py-2 px-4 text-xs font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="SELECTED">Seleccionada</option>
                    <option value="EMITTED">Emitida</option>
                  </select>
                  <button type="submit" className="text-xs font-bold bg-primary text-on-primary px-3 py-2 rounded-lg hover:bg-primary-container transition-colors">
                    Filtrar
                  </button>
                  {(q || statusFilter) && (
                    <Link href="/admin" className="text-xs font-bold text-primary hover:underline">Limpiar</Link>
                  )}
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-on-surface-variant/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                      <th className="pb-4 font-bold">Cliente</th>
                      <th className="pb-4 font-bold">Vehículo</th>
                      <th className="pb-4 font-bold">Aseguradora</th>
                      <th className="pb-4 font-bold">Estado</th>
                      <th className="pb-4 text-right font-bold">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/30">
                    {quotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant font-medium text-sm">
                          No se encontraron cotizaciones con estos filtros.
                        </td>
                      </tr>
                    ) : (
                      quotes.map((quote) => (
                        <tr key={quote.id} className="group hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">
                                {quote.clientName?.[0]?.toUpperCase() ?? quote.clientEmail?.[0]?.toUpperCase() ?? 'U'}
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-on-surface block">{quote.clientName ?? 'Sin Nombre'}</span>
                                <span className="text-xs text-on-surface-variant">{quote.clientEmail ?? quote.clientPhone ?? 'Sin contacto'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 text-sm text-on-surface-variant">
                            {quote.brand} {quote.model}
                            <span className="block text-xs opacity-70">{quote.year}</span>
                          </td>
                          <td className="py-5">
                            <span className="text-sm font-medium">{quote.selectedCarrier ?? '—'}</span>
                            {quote.selectedPremium != null && (
                              <span className="block text-xs text-on-surface-variant">${quote.selectedPremium.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</span>
                            )}
                          </td>
                          <td className="py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              quote.status === 'EMITTED' ? 'bg-secondary-container/30 text-secondary' :
                              quote.status === 'SELECTED' ? 'bg-primary-fixed text-primary' :
                              'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              {STATUS_LABEL[quote.status] ?? quote.status}
                            </span>
                          </td>
                          <td className="py-5 text-right">
                            <Link href={`/cotizar/${quote.id}`} target="_blank" className="text-primary hover:bg-primary-fixed inline-block p-1.5 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-sm">visibility</span>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="col-span-12 md:col-span-4 space-y-8">
              <div className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-[#003369] to-[#0a4a8f] text-white flex flex-col justify-end shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 pointer-events-none">
                  <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
                </div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-extrabold tracking-tighter leading-tight">Portafolio Pro</h4>
                  <p className="text-on-primary-container text-xs mt-3 leading-relaxed">Analítica avanzada y seguimientos automatizados para tu cartera.</p>
                  <button className="mt-6 bg-white text-primary px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary-fixed transition-colors">
                    Ver Reportes
                  </button>
                </div>
              </div>

              {expiringQuotes.length > 0 && (
                <div className="bg-surface-container-low rounded-xl p-8">
                  <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Próximos Pasos (Vencimientos)</h4>
                  <ul className="space-y-4">
                    {expiringQuotes.map(q => (
                      <li key={q.id} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm mt-0.5">
                          <span className="material-symbols-outlined text-sm">mail</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">Contactar a {q.clientName ?? 'Cliente'}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">Renovar {q.brand} {q.model}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
