# Estado del proyecto

Última actualización: Abril 2026

## ✅ Hecho

### Estructura base
- [x] Proyecto Next.js 16 creado con TypeScript + Tailwind v4
- [x] Dependencias instaladas: Prisma v7, NextAuth, Zod, TanStack Query
- [x] Estructura de carpetas correcta (`src/lib/carriers/` separado de `src/app/`)

### Módulo de carriers
- [x] `types.ts` — interfaces `QuoteRequest`, `QuoteResult`, `Coverage`
- [x] `utils.ts` — `BRAND_BASE`, `COVERAGE_FACTOR`, `yearFactor()`
- [x] `index.ts` — `quoteAll()` con `Promise.allSettled`
- [x] `ana.ts` — mock con estructura real
- [x] `gnp.ts` — mock
- [x] `axa.ts` — mock
- [x] `hdi.ts` — mock

### API
- [x] `POST /api/quote` — valida con Zod, llama carriers, guarda en DB
- [x] `PATCH /api/quote/[id]/select` — guarda selección del cliente
- [x] `PATCH /api/quote/[id]/emit` — guarda datos del cliente y marca `status = EMITTED`
- [x] `GET /api/quote/[id]/pdf` — genera PDF de la cotización (Node runtime)

### UI del cliente
- [x] `/cotizar` — formulario (marca, modelo, año, uso, CP, cobertura)
- [x] `/cotizar/[id]` — resultados con tarjetas ordenadas por precio
- [x] `ResultsClient.tsx` — client component con selección
- [x] `/cotizar/[id]/confirmar` — datos del cliente + resumen + descarga PDF

### Base de datos
- [x] Schema de Prisma definido (Quote, QuoteStatus)
- [x] `prisma.config.ts` creado para Prisma v7
- [x] `src/lib/db.ts` — conexión `pg.Pool` + SSL compatible con **Digital Ocean** (env `PGSSL_*`)

### Admin (MVP)
- [x] NextAuth v4 (Credentials) — usuario definido con `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [x] `GET+POST /api/auth/[...nextauth]`
- [x] `/admin/login` — inicio de sesión
- [x] `/admin` — listado de cotizaciones (últimas 200)
- [x] `middleware` — protege rutas bajo `/admin` excepto `/admin/login`
- [ ] Filtros (status, fecha) y KPIs

---

## ⚠️ Pendiente de verificar

- [x] `npx tsc --noEmit` pasa sin errores
- [x] `npx prisma generate` corre sin errores
- [ ] `npx prisma migrate dev` crea las tablas (depende de tener Postgres y `DATABASE_URL` válido)
- [ ] El formulario de cotización conecta con el API y redirige a resultados
- [ ] Los resultados se renderizan correctamente
- [ ] Flujo completo `SELECTED → EMITTED` (confirmación) con DB real
- [ ] Descarga de PDF con DB real (verifica contenido y headers)

---

## ❌ Por construir

### Testing
- [x] Vitest instalado y configurado
- [x] Tests unitarios de `utils.ts` — `yearFactor()`, factores de cobertura
- [x] Tests del orquestador — orden por precio, manejo de fallos parciales (con mocks)
- [x] Tests de schemas Zod (`quote` y `emit`)
- [ ] Tests de API routes (pendiente; ideal con DB efímera o test DB)

### Página de confirmación
- [x] `/cotizar/[id]/confirmar` — formulario de datos del cliente
  - Campos: nombre, email, teléfono, RFC (opcional)
  - Resumen de la cotización seleccionada (carrier, prima, coberturas)
  - Botón "Solicitar póliza" → `status = EMITTED`

### Generación de PDF
- [x] `@react-pdf/renderer`
- [x] Componente PDF con: datos del auto, carrier elegido, coberturas, prima
- [x] API route `GET /api/quote/[id]/pdf` que devuelve el PDF

### Dashboard admin
- [x] Configurar NextAuth con un usuario vía `ADMIN_*` + `NEXTAUTH_SECRET` en `.env`
- [x] `/admin` protegido con `middleware` (complementado con comprobación en server)
- [x] Lista básica de cotizaciones
- [x] Filtros (status, fecha) y búsqueda
- [x] KPIs: total cotizaciones, tasa conversión (SELECTED/total), prima promedio
- [ ] Alertas de pólizas próximas a vencer

### Carriers adicionales
- [x] `qualitas.ts` — mock
- [x] `mapfre.ts` — mock
- [ ] Integración real ANA Seguros (cuando el cliente entregue credenciales)

### Infraestructura
- [ ] Configurar proyecto en Railway (PostgreSQL)
- [ ] Configurar proyecto en Vercel
- [ ] Variables de entorno en producción
- [ ] `npx prisma migrate deploy` en producción

---

## 🐛 Errores conocidos resueltos

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'generated/prisma'` | Falta correr generate | `npx prisma generate` |
| `datasource url no longer supported` | Prisma v7 cambió config | Quitar `url` de schema, usar `prisma.config.ts` |
| Carriers en `src/app/carriers/` | Path incorrecto | Movidos a `src/lib/carriers/` |
| `db.ts` en `src/app/lib/` | Path incorrecto | Movido a `src/lib/db.ts` |
| Select route en `src/app/cotizar/[id]/select/` | Era ruta de página | Movido a `src/app/api/quote/[id]/select/` |
| Caché de Next.js apuntando a paths viejos | `.next/` desactualizado | `rm -rf .next` |
| `PrismaConfigEnvError: DATABASE_URL` | Prisma CLI no leía `.env` | Cargar `.env`/`.env.local` en `prisma.config.ts` con `dotenv` |
| `self-signed certificate in certificate chain` (Postgres, p. ej. DO) | TLS y CA del proveedor / Node | `pg` con SSL explícito; opcional `PGSSL_CA` o no verificar mientras (ver `.env.example`) |
| Texto de inputs casi invisible en formularios | Sin `text-*` en inputs sobre fondo claro | Clase `text-[#aa3a39]` en inputs de `/cotizar` y `/cotizar/.../confirmar` (y admin login) |