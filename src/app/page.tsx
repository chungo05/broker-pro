import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <nav className="bg-surface-bright dark:bg-slate-950 docked full-width top-0 z-50 sticky">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary dark:text-blue-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            <span className="text-2xl font-black text-primary dark:text-blue-500 uppercase tracking-tighter">BrokerPro</span>
          </div>
          <button className="font-sans text-lg font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg px-4 py-2 transition-transform duration-200 scale-98 active:scale-95">
            Ayuda
          </button>
        </div>
      </nav>
      
      <main className="flex flex-col w-full">
        <section className="px-6 pt-12 pb-16 bg-gradient-to-b from-surface-container-lowest to-surface">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-[3.5rem] leading-[1.1] font-extrabold text-primary tracking-tight mb-8">
              Cotiza tu seguro de auto en 3 minutos.
            </h1>
            <p className="text-[1.125rem] font-medium text-on-surface-variant mb-12">
              Sin complicaciones. Diseñado para darte tranquilidad inmediata.
            </p>
            <div className="relative group">
              <Link href="/cotizar" className="w-full h-[64px] bg-secondary text-on-secondary text-[1.25rem] font-bold rounded-xl editorial-shadow active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                Cotizar Ahora
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full px-6 -mt-8 mb-12">
          <div className="rounded-3xl overflow-hidden editorial-shadow h-64 w-full bg-primary-fixed max-w-7xl mx-auto">
            <img alt="Safe Driving" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80" />
          </div>
        </section>

        <section className="px-6 space-y-6 mb-20 max-w-7xl mx-auto w-full">
          <div className="space-y-4 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
            <h2 className="text-[1.75rem] font-bold text-primary mb-2 md:col-span-3">Por qué elegirnos</h2>
            
            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 editorial-shadow border-l-4 border-primary">
              <div className="bg-primary-fixed w-16 h-16 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">bolt</span>
              </div>
              <div>
                <h3 className="text-[1.5rem] font-bold text-primary">Rápido</h3>
                <p className="text-[1.125rem] text-on-surface-variant leading-relaxed">Procesos optimizados que respetan tu tiempo. Cotización real en minutos.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 editorial-shadow border-l-4 border-secondary">
              <div className="bg-secondary-container w-16 h-16 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-4xl">verified_user</span>
              </div>
              <div>
                <h3 className="text-[1.5rem] font-bold text-primary">Seguro</h3>
                <p className="text-[1.125rem] text-on-surface-variant leading-relaxed">Respaldo total con las mejores aseguradoras del mercado nacional.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 editorial-shadow border-l-4 border-tertiary-fixed-dim">
              <div className="bg-tertiary-fixed w-16 h-16 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-4xl">visibility</span>
              </div>
              <div>
                <h3 className="text-[1.5rem] font-bold text-primary">Transparente</h3>
                <p className="text-[1.125rem] text-on-surface-variant leading-relaxed">Sin letras chiquitas. Entiende exactamente qué estás contratando.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 mb-20 max-w-4xl mx-auto w-full">
          <div className="bg-primary-fixed p-10 rounded-[2rem] text-center space-y-6">
            <span className="text-label-md font-bold tracking-[0.2em] text-on-primary-fixed-variant uppercase block">Tu Santuario Digital</span>
            <h2 className="text-[2rem] font-extrabold text-on-primary-fixed leading-tight">¿Listo para proteger lo que más importa?</h2>
            <p className="text-[1.125rem] text-on-primary-fixed-variant">Estamos aquí para guiarte en cada paso del camino.</p>
            <Link href="/cotizar" className="w-full h-[56px] bg-primary text-on-primary rounded-full font-bold text-lg flex items-center justify-center">
              Comenzar Ahora
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-surface-bright dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 gap-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            <span className="text-xl font-bold text-primary dark:text-blue-500">BrokerPro</span>
          </div>
          <p className="font-sans text-base font-medium text-slate-600 dark:text-slate-400 text-center">
            © 2026 BrokerPro. Tu camino guiado en seguros.
          </p>
          <div className="flex gap-6">
            <Link className="text-slate-600 dark:text-slate-400 font-medium hover:text-primary underline transition-all opacity-80 hover:opacity-100" href="#">Privacidad</Link>
            <Link className="text-slate-600 dark:text-slate-400 font-medium hover:text-primary underline transition-all opacity-80 hover:opacity-100" href="#">Términos</Link>
            <Link className="text-slate-600 dark:text-slate-400 font-medium hover:text-primary underline transition-all opacity-80 hover:opacity-100" href="#">Ayuda</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
