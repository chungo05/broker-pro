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
| Deploy | Vercel + DigitalOcean |
| Testing | Vitest |

## Arrancar el proyecto

```bash
npm install
cp .env.example .env.local
# Rellena al menos: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ADMIN_EMAIL, ADMIN_PASSWORD
npx prisma generate
npx prisma migrate dev
npm run dev
```

Notas:
- Prisma CLI necesita que `DATABASE_URL` exista en el entorno. Este repo carga `.env` y `.env.local` desde `prisma.config.ts` (via `dotenv`), así que basta con tener `DATABASE_URL` en alguno de esos archivos.
- **Postgres en Digital Ocean** (u otro con TLS): ver variables opcionales `PGSSL_*` en `.env.example` si ves errores de certificado.
- **Formularios:** el texto que escribe el usuario en campos de entrada va en color **`#aa3a39`** (visible sobre fondo claro) en `/cotizar`, confirmación y login admin.

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

6. **Admin (Dashboard)**
- Abre `http://localhost:3000/admin` — te pide inicio de sesión
- Entra con `ADMIN_EMAIL` / `ADMIN_PASSWORD` (definidos en tu `.env`)
- Verás un dashboard con KPIs (cotizaciones totales, conversión, prima promedio)
- Puedes buscar clientes o filtrar las cotizaciones por su estado
- En la tabla de las últimas cotizaciones, el enlace del vehículo abre el detalle en otra pestaña

## Documentación

- [`ARQUITECTURA.md`](./ARQUITECTURA.md) — estructura, flujo y decisiones técnicas
- [`ESTADO.md`](./ESTADO.md) — qué está hecho, qué falta, errores conocidos
- [`ROADMAP.md`](./ROADMAP.md) — fases y backlog
- [`CONTEXTO.md`](./CONTEXTO.md) — prompt listo para pegar en Cursor/Claude