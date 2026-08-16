# Fluent Too

Front-end Next.js 16 com App Router, i18n e BFF de autenticação para Strapi.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis

Veja `.env.example`.

- `NEXT_PUBLIC_SITE_URL`: URL pública do Next.
- `STRAPI_INTERNAL_URL`: URL interna usada pelo servidor Next para falar com Strapi.
- `STRAPI_PUBLIC_URL`: URL pública do Strapi, usada para admin e OAuth.
- `AUTH_COOKIE_SECURE`: `true` em produção HTTPS.

## Autenticação

Rotas BFF:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/resend-confirmation`
- `POST /api/auth/change-password`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

Rotas privadas:

- `/:locale/dashboard`
- `/:locale/dashboard/security`

`/:locale/admin` redireciona para o admin nativo do Strapi.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest |

## Docker

```powershell
docker build -t fluent-too:test .
```

O container escuta na porta `3000` e usa o build standalone do Next.
