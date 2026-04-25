import type { QuoteRequest, QuoteResult } from './types'

export async function quoteAna(req: QuoteRequest): Promise<QuoteResult> {
  const start = Date.now()

  // Este token fue extraído del script Cotizador.js
  const tokenDataGuide = '815750ef475c48fba215c349281b18f9'
  const endpoint = 'https://server.anaseguros.com.mx/Micrositios/GPOPOLCHUNG/DataProviders/Cotizador.aspx'

  // TODO: Ajustar los nombres de los parámetros exactos según lo que espera el ASMX/ASPX
  // Generalmente en .NET webforms esperan algo parecido a form-urlencoded
  const formData = new URLSearchParams()
  formData.append('servicio', 'Cotizar')
  formData.append('DataGuide', tokenDataGuide)
  formData.append('Marca', req.brand)
  formData.append('Modelo', req.model)
  formData.append('Anio', req.year.toString())
  formData.append('Uso', req.uso)
  formData.append('CodigoPostal', req.zipCode)
  // Añadir más parámetros detectados según necesidad (ej. cLlave, ccAgente, etc.)

  try {
    // ESTO ESTÁ COMENTADO HASTA QUE SE REALICE LA PRUEBA PARA EVITAR BLOQUEOS O EXCEPCIONES FALLIDAS EN PRD
    /*
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!response.ok) {
      throw new Error(`Error de ANA Seguros: ${response.status}`)
    }

    const textData = await response.text()
    // TODO: Parsear la respuesta `textData`. A veces los scripts legacy retornan JS para hacer un eval().
    */

    // MOCK TEMPORAL HASTA CONFIRMAR LA RESPUESTA REAL
    await new Promise(r => setTimeout(r, 600))
    const mockAnnual = 12500

    return {
      carrierId:     'ana',
      carrierName:   'ANA Seguros',
      rating:        'A+',
      annualPremium: mockAnnual,
      monthlyPremium: Math.round(mockAnnual / 12),
      coverage: {
        danosMaterialesDeducible: req.coverage !== 'rc' ? '5%' : undefined,
        roboTotal:      req.coverage === 'amplia_plus' ? 'Sin deducible' : '10%',
        rcMonto:        req.coverage !== 'basica' ? '3,000,000' : undefined,
        gastosMedicos:  '50,000',
        asistenciaVial: true,
        autoSustituto:  req.coverage === 'amplia_plus' ? '15 días' : undefined,
      },
      responseTime: Date.now() - start,
      available: true,
    }

  } catch (error) {
    console.error('Error integrando con ANA:', error)
    return {
      carrierId: 'ana',
      carrierName: 'ANA Seguros',
      rating: 'A+',
      annualPremium: 0,
      monthlyPremium: 0,
      coverage: {
        danosMaterialesDeducible: undefined,
        roboTotal: '10%',
        rcMonto: '3,000,000',
        gastosMedicos: '50,000',
        asistenciaVial: false,
        autoSustituto: undefined,
      },
      responseTime: Date.now() - start,
      available: false,
    }
  }
}