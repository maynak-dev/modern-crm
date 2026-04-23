# Modern CRM — Vite + Node + Neon

A beautiful, dark, Linear-style CRM. Monorepo with:

- **apps/web** — React 18 + Vite + TypeScript + Tailwind UI
- **apps/api** — Node.js + Express + Drizzle ORM (Neon Postgres)
- **packages/shared** — shared Zod schemas and types

## Features

- 🔐 JWT auth (email + password) with bcrypt
- 👥 Contacts, Companies, Deals (Kanban pipeline), Tasks, Notes, Activities
- 📊 Dashboard with KPIs and pipeline value
- 🔍 Global search, filters, tags
- 🎨 Modern dark UI inspired by Linear / Vercel
- 🧱 Multi-user — each user only sees their own data (owner_id scoping)

## 1. Local setup

```bash
# Install root dev deps + workspace deps
npm install

# Configure env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit apps/api/.env with your Neon DATABASE_URL
```

### Push schema & seed (one time)

```bash
npm run db:push --workspace=apps/api
npm run db:seed --workspace=apps/api
```

Default seeded login: **demo@crm.app / demo1234**

### Run dev (web on :5173, api on :8080)

```bash
npm run dev
```

## 2. Deploy to Vercel

This repo deploys as **two Vercel projects** sharing the same Neon DB.

### a) Deploy the API
- Import the repo into Vercel
- **Root Directory**: `apps/api`
- **Framework**: Other
- **Build Command**: `npm run build`
- **Output Directory**: leave default
- Env vars:
  - `DATABASE_URL` — your Neon pooled URL
  - `JWT_SECRET` — long random string
  - `CORS_ORIGIN` — your web app URL, e.g. `https://crm-web.vercel.app`

The API exposes a single serverless function at `api/index.ts` that mounts Express.

### b) Deploy the Web
- Create a 2nd Vercel project from the same repo
- **Root Directory**: `apps/web`
- **Framework**: Vite
- Env vars:
  - `VITE_API_URL` — your API project URL, e.g. `https://crm-api.vercel.app`

After both deploy: open the web URL → register or sign in with seeded user.

## 3. First push of schema to Neon

Locally with `DATABASE_URL` set, run:

```bash
cd apps/api
npm run db:push
npm run db:seed
```

That's it — the same Neon DB is used by the deployed API.

## Security notes

- Never commit `.env`. Rotate any leaked credentials.
- `JWT_SECRET` must be long & random in production.
- All API routes (except `/auth/*` and `/health`) require `Authorization: Bearer <token>`.
- All queries are scoped by `owner_id = req.user.id`.

## Tech

React 18 · Vite 5 · Tailwind 3 · Zustand · React Query · React Router 6 · Express 4 · Drizzle ORM · Neon serverless · Zod · bcrypt · jsonwebtoken
