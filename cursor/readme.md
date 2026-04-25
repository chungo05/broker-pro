# BrokerPro — Cotizador Multi-Aseguradora

Software para el broker de seguros Grupo Póliza Chung. Permite cotizar en múltiples aseguradoras simultáneamente, comparar resultados y gestionar pólizas.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL + Prisma v7 |
| Auth | NextAuth v4 |
| Pagos (futuro) | MercadoPago / SPEI |
| Deploy | Vercel + Railway |
| Testing | Vitest |

## Arrancar el proyecto

```bash
npm install
cp .env.example .env.local
# Llena DATABASE_URL y NEXTAUTH_SECRET en .env.local
npx prisma generate
npx prisma migrate dev
npm run dev
```

Notas:
- Prisma CLI necesita que `DATABASE_URL` exista en el entorno. Este repo carga `.env` y `.env.local` desde `prisma.config.ts` (via `dotenv`), así que basta con tener `DATABASE_URL` en alguno de esos archivos.

## Ver y probar el flujo (manual)

1. **Levanta la app**

```bash
npm run dev
```

2. **Cotiza**
- Abre `http://localhost:3000/cotizar`
- Llena el formulario y envía
- Te redirige a `/cotizar/[id]`

3. **Selecciona aseguradora**
- En `/cotizar/[id]` elige una opción
- Esto llama `PATCH /api/quote/[id]/select` y te lleva a `/cotizar/[id]/confirmar`

4. **Confirma y “emite”**
- En `/cotizar/[id]/confirmar` llena tus datos
- Esto llama `PATCH /api/quote/[id]/emit` y cambia el estado a `EMITTED`

5. **Descarga PDF**
- En la misma pantalla usa “Descargar cotización en PDF”
- Endpoint: `GET /api/quote/[id]/pdf`

## Documentación

- [`ARQUITECTURA.md`](./ARQUITECTURA.md) — estructura, flujo y decisiones técnicas
- [`ESTADO.md`](./ESTADO.md) — qué está hecho, qué falta, errores conocidos
- [`ROADMAP.md`](./ROADMAP.md) — fases y backlog
- [`CONTEXTO.md`](./CONTEXTO.md) — prompt listo para pegar en Cursor/Claude