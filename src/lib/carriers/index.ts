import type { QuoteRequest, QuoteResult } from './types'
import { quoteAna } from './ana'
import { quoteAxa } from './axa'
import { quoteHdi } from './hdi'
import { quoteGnp } from './gnp'
import { quoteQualitas } from './qualitas'
import { quoteMapfre } from './mapfre'

const CARRIERS = [quoteAna, quoteAxa, quoteHdi, quoteGnp, quoteQualitas, quoteMapfre]

export async function quoteAll(req: QuoteRequest): Promise<QuoteResult[]> {
  // Todas en paralelo — si una falla, no rompe las demás
  const results = await Promise.allSettled(
    CARRIERS.map(fn => fn(req))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<QuoteResult> => r.status === 'fulfilled')
    .map(r => r.value)
    .sort((a, b) => a.annualPremium - b.annualPremium)
}