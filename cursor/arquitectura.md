# Arquitectura — BrokerPro

## Estructura de carpetas

```
broker-pro/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts              ← NextAuth (GET+POST)
│   │   │   └── quote/
│   │   │       ├── route.ts                  ← POST /api/quote
│   │   │       └── [id]/
│   │   │           ├── select/
│   │   │           │   └── route.ts          ← PATCH /api/quote/[id]/select
│   │   │           ├── emit/
│   │   │           │   └── route.ts          ← PATCH /api/quote/[id]/emit
│   │   │           └── pdf/
│   │   │               └── route.tsx         ← GET /api/quote/[id]/pdf (Node runtime)
│   │   ├── cotizar/
│   │   │   ├── page.tsx                      ← Formulario del cliente
│   │   │   └── [id]/
│   │   │       ├── page.tsx                  ← Server component — lee quote de DB
│   │   │       ├── ResultsClient.tsx         ← Client component — tarjetas de resultados
│   │   │       └── confirmar/
│   │   │           ├── page.tsx              ← Datos del cliente + resumen + PDF
│   │   │           └── ConfirmarClient.tsx   ← Client component — formulario + UX
│   │   ├── admin/
│   │   │   ├── page.tsx                      ← Listado (server) — requiere sesión
│   │   │   └── login/
│   │   │       └── page.tsx                  ← Inicio de sesión
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── providers.tsx                  ← `SessionProvider` (NextAuth)
│   │   └── globals.css
│   ├── middleware.ts                        ← Protege `/admin/*` excepto `/admin/login`
│   └── lib/
│       ├── db.ts                             ← Prisma v7 + `pg.Pool` (SSL, Digital Ocean)
│       ├── auth.ts                           ← `authOptions` NextAuth (Credentials)
│       ├── quote-schema.ts                    ← Zod schema para POST /api/quote
│       ├── emit-quote-schema.ts               ← Zod schema para PATCH /emit
│       ├── pdf/
│       │   └── quote-document.tsx             ← React-PDF Document
│       └── carriers/
│           ├── types.ts                      ← QuoteRequest, QuoteResult, Coverage
│           ├── utils.ts                      ← BRAND_BASE, COVERAGE_FACTOR, yearFactor()
│           ├── index.ts                      ← quoteAll() — orquestador paralelo
│           ├── ana.ts                        ← Mock ANA Seguros
│           ├── gnp.ts                        ← Mock GNP
│           ├── axa.ts                        ← Mock AXA
│           ├── hdi.ts                        ← Mock HDI
│           ├── qualitas.ts                   ← Mock Qualitas
│           └── mapfre.ts                     ← Mock Mapfre
├── prisma/
│   └── schema.prisma
├── prisma.config.ts                          ← Config de Prisma v7 (nuevo en v7)
├── .env (o .env.local)
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
/cotizar/[id]/confirmar
  → Cliente llena nombre, email, teléfono
  → Resumen de cobertura elegida
  → PATCH /api/quote/[id]/emit → status EMITTED
  → Descarga de PDF: GET /api/quote/[id]/pdf
        ↓
(Parcial) /admin
  → Login: NextAuth (Credentials) en `/admin/login`
  → Dashboard con KPIs, filtros (estado/búsqueda) y listado de cotizaciones
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
  clientRfc       String?
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
# Opcionales: TLS con Postgres gestionado (p. ej. Digital Ocean)
# PGSSL_REJECT_UNAUTHORIZED=true
# PGSSL_CA=-----BEGIN CERTIFICATE-----...
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=define-una-fuerte
```

**UI (formularios):** en `/cotizar`, `/cotizar/.../confirmar` y `/admin/login` el texto de input usa el color de marca `text-[#aa3a39]` para asegurar legibilidad sobre `bg-stone-50`.

## Notas de Prisma v7

Prisma 7 requiere `prisma.config.ts` en la raíz. La URL ya no va en `schema.prisma`.
El cliente se importa desde `@prisma/client` (generado en `node_modules/@prisma/client`).
Se requiere `@prisma/adapter-pg` para conectar a PostgreSQL.

```typescript
// src/lib/db.ts (resumen)
// `pg.Pool` con `ssl: { rejectUnauthorized, ca }` según `PGSSL_*` y URL (Digital Ocean, etc.)
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
// new PrismaPg(new Pool({ host, user, database, port, password, ssl }))
```

```typescript
// prisma.config.ts
import { existsSync } from 'node:fs'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## Nota importante (Next.js 16)

En rutas dinámicas (`app/.../[id]`), `params` y `searchParams` llegan tipados como `Promise<...>` en los handlers/server components. Se usa `const { id } = await params`.