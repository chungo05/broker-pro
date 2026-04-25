# Estado del proyecto

Última actualización: Abril 2025

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

### UI del cliente
- [x] `/cotizar` — formulario (marca, modelo, año, uso, CP, cobertura)
- [x] `/cotizar/[id]` — resultados con tarjetas ordenadas por precio
- [x] `ResultsClient.tsx` — client component con selección

### Base de datos
- [x] Schema de Prisma definido (Quote, QuoteStatus)
- [x] `prisma.config.ts` creado para Prisma v7

---

## ⚠️ Pendiente de verificar

- [ ] `npx tsc --noEmit` pasa sin errores
  - Error conocido: `db.ts` importa de `generated/prisma` pero falta correr `npx prisma generate`
  - Error conocido: `schema.prisma` no debe tener `url` en el datasource (Prisma v7)
- [ ] `npx prisma generate` corre sin errores
- [ ] `npx prisma migrate dev` crea las tablas
- [ ] El formulario de cotización conecta con el API y redirige a resultados
- [ ] Los resultados se renderizan correctamente

---

## ❌ Por construir

### Testing (próximo paso inmediato)
- [ ] Instalar y configurar Vitest
- [ ] Tests unitarios de `utils.ts` — `yearFactor()`, factores de cobertura
- [ ] Tests unitarios de carriers — estructura del `QuoteResult`
- [ ] Tests del orquestador — orden por precio, manejo de fallos parciales
- [ ] Tests del API route — validación Zod rechaza inputs inválidos

### Página de confirmación
- [ ] `/cotizar/[id]/confirmar` — formulario de datos del cliente
  - Campos: nombre, email, teléfono, RFC (opcional)
  - Resumen de la cotización seleccionada (carrier, prima, coberturas)
  - Botón "Solicitar póliza" → `status = EMITTED`

### Generación de PDF
- [ ] Instalar `@react-pdf/renderer` (más simple) o Puppeteer
- [ ] Componente PDF con: datos del auto, carrier elegido, coberturas, prima
- [ ] API route `GET /api/quote/[id]/pdf` que devuelve el PDF

### Dashboard admin
- [ ] Configurar NextAuth con un usuario hardcodeado (email + password en `.env`)
- [ ] `/admin` protegido con middleware
- [ ] Lista de cotizaciones con filtros (status, fecha)
- [ ] KPIs: total cotizaciones, tasa conversión (SELECTED/total), prima promedio
- [ ] Alertas de pólizas próximas a vencer

### Carriers adicionales
- [ ] `qualitas.ts` — mock (olvidado en la sesión anterior)
- [ ] `mapfre.ts` — mock
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