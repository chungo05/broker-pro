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
| Testing | Vitest (pendiente de configurar) |

## Arrancar el proyecto

```bash
npm install
cp .env.example .env.local
# Llena DATABASE_URL y NEXTAUTH_SECRET en .env.local
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Documentación

- [`ARQUITECTURA.md`](./ARQUITECTURA.md) — estructura, flujo y decisiones técnicas
- [`ESTADO.md`](./ESTADO.md) — qué está hecho, qué falta, errores conocidos
- [`ROADMAP.md`](./ROADMAP.md) — fases y backlog
- [`CONTEXTO.md`](./CONTEXTO.md) — prompt listo para pegar en Cursor/Claude