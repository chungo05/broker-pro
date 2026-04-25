# Arquitectura — BrokerPro

## Estructura de carpetas

```
broker-pro/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── quote/
│   │   │       ├── route.ts                  ← POST /api/quote
│   │   │       └── [id]/
│   │   │           └── select/
│   │   │               └── route.ts          ← PATCH /api/quote/[id]/select
│   │   ├── cotizar/
│   │   │   ├── page.tsx                      ← Formulario del cliente
│   │   │   └── [id]/
│   │   │       ├── page.tsx                  ← Server component — lee quote de DB
│   │   │       ├── ResultsClient.tsx         ← Client component — tarjetas de resultados
│   │   │       └── confirmar/
│   │   │           └── page.tsx              ← (PENDIENTE) Datos del cliente + resumen
│   │   ├── admin/                            ← (PENDIENTE) Dashboard protegido
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── lib/
│       ├── db.ts                             ← Singleton Prisma v7 con adapter pg
│       └── carriers/
│           ├── types.ts                      ← QuoteRequest, QuoteResult, Coverage
│           ├── utils.ts                      ← BRAND_BASE, COVERAGE_FACTOR, yearFactor()
│           ├── index.ts                      ← quoteAll() — orquestador paralelo
│           ├── ana.ts                        ← Mock ANA Seguros
│           ├── gnp.ts                        ← Mock GNP
│           ├── axa.ts                        ← Mock AXA
│           └── hdi.ts                        ← Mock HDI
├── prisma/
│   └── schema.prisma
├── prisma.config.ts                          ← Config de Prisma v7 (nuevo en v7)
├── .env.local
└── .env.example
```

## Flujo principal

```
Cliente llena formulario (/cotizar)
        ↓
POST /api/quote
  → Valida con Zod
  → quoteAll(req) — Promise.allSettled en paralelo
  → Guarda Quote en DB con status PENDING
  → Devuelve { quoteId, results }
        ↓
Redirect a /cotizar/[id]
  → Server component lee Quote de DB
  → ResultsClient muestra tarjetas ordenadas por precio
  → Cliente elige una
        ↓
PATCH /api/quote/[id]/select
  → Guarda selectedCarrier, selectedPremium
  → status → SELECTED
        ↓
(PENDIENTE) /cotizar/[id]/confirmar
  → Cliente llena nombre, email, teléfono
  → Resumen de cobertura elegida
  → Botón "Solicitar póliza" → status EMITTED
  → Genera PDF
        ↓
(PENDIENTE) Admin recibe notificación
  → Dashboard muestra nueva cotización
```

## Módulo de carriers

Cada carrier implementa la misma interfaz:

```typescript
async function quoteXxx(req: QuoteRequest): Promise<QuoteResult>
```

El orquestador (`index.ts`) los llama todos en paralelo con `Promise.allSettled` — si uno falla, los demás siguen. Los resultados se ordenan por `annualPremium` ascendente.

**Carriers actuales:** todos son mocks con latencia simulada (400–900ms).
**Integración real pendiente:** ANA Seguros tiene micrositio en `https://server.anaseguros.com.mx/Micrositios/GPOPOLCHUNG/`

## Schema de Prisma

```prisma
model Quote {
  id        String      @id @default(cuid())
  createdAt DateTime    @default(now())
  brand     String
  model     String
  year      Int
  uso       String
  zipCode   String
  coverage  String      // amplia | amplia_plus | basica | rc
  results         Json
  selectedCarrier String?
  selectedPremium Float?
  clientName      String?
  clientEmail     String?
  clientPhone     String?
  status    QuoteStatus @default(PENDING)

  @@index([createdAt])
  @@index([status])
}

enum QuoteStatus {
  PENDING    // cotizó, no eligió
  SELECTED   // eligió aseguradora
  EMITTED    // póliza emitida
}
```

## Variables de entorno

```env
DATABASE_URL=postgresql://user:pass@host:5432/brokerpro
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

## Notas de Prisma v7

Prisma 7 requiere `prisma.config.ts` en la raíz. La URL ya no va en `schema.prisma`.
El cliente se importa desde `generated/prisma`, no desde `@prisma/client`.
Se requiere `@prisma/adapter-pg` para conectar a PostgreSQL.

```typescript
// src/lib/db.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma'

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })
  return new PrismaClient({ adapter, log: ['error'] })
}
```

```typescript
// prisma.config.ts
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    },
  },
})
```