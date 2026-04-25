export interface QuoteRequest {
    brand: string
    model: string
    year: number
    uso: 'particular' | 'comercial'
    zipCode: string
    coverage: 'amplia' | 'amplia_plus' | 'basica' | 'rc'
  }
  
  export interface Coverage {
    danosMaterialesDeducible?: string  // "5%" | "10%"
    roboTotal?: string                 // "10%" | "Sin deducible"
    rcMonto?: string                   // "3,000,000" | null
    gastosMedicos?: string             // "$50,000" | null
    asistenciaVial: boolean
    autoSustituto?: string             // "15 días" | null
  }
  
  export interface QuoteResult {
    carrierId: string
    carrierName: string
    carrierLogo?: string
    rating: 'AAA' | 'AA' | 'A+' | 'A' | 'B+'
    annualPremium: number
    monthlyPremium: number
    coverage: Coverage
    responseTime: number  // ms — para mostrar "respondió en X ms"
    available: boolean
    error?: string
  }