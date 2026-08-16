# Fluent Too Front-end

Aplicacao web em Next.js para a experiencia publica, autenticacao, dashboard do aluno e consumo dos quizzes publicados no Strapi.

## Ambientes

O projeto trabalha com tres ambientes:

| Ambiente | Front-end | API Strapi |
|---|---|---|
| Local | `http://localhost:3000` | `http://localhost:1337` |
| Dev | `https://dev.fluent-too.com` | `https://api-dev.fluent-too.com` |
| Prd | `https://fluent-too.com` | `https://api.fluent-too.com` |

Os arquivos reais de ambiente nao devem ser commitados. Use os exemplos versionados como base:

| Ambiente | Exemplo versionado | Arquivo real |
|---|---|---|
| Local | `.env.local.example` | `.env.local` ou `.env` |
| Dev | `.env.dev.example` | `.env.dev` ou variaveis do Dokploy |
| Prd | `.env.prd.example` | `.env.prd` ou variaveis do Dokploy |

Para rodar localmente:

```powershell
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis de ambiente

| Variavel | Uso |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publica do front-end usada em SEO, links e callbacks. |
| `NEXT_PUBLIC_ASSET_BASE_URL` | URL publica do CDN usado para imagens estaticas do front-end. |
| `STRAPI_INTERNAL_URL` | URL usada pelo servidor Next.js para acessar o Strapi. |
| `STRAPI_PUBLIC_URL` | URL publica do Strapi usada em redirecionamentos e OAuth. |
| `AUTH_COOKIE_SECURE` | Deve ser `false` em HTTP local e `true` em HTTPS. |
| `FRONTEND_URL` | URL usada por scripts auxiliares de validacao. |
| `MAILPIT_URL` | URL do Mailpit em testes locais de e-mail. |

Em deploy no Dokploy, configure as variaveis diretamente no painel do app. Nao coloque valores reais de producao em arquivos versionados.

## Scripts

| Comando | Descricao |
|---|---|
| `npm run dev` | Inicia o Next.js em modo desenvolvimento. |
| `npm run build` | Gera build de producao. |
| `npm run start` | Sobe o build de producao. |
| `npm run lint` | Executa ESLint. |
| `npm test` | Executa os testes. |

## Docker

Build local:

```powershell
docker build -t fluent-too:test .
```

O container escuta na porta `3000`. Em Dokploy, use as variaveis do ambiente correspondente e garanta que `STRAPI_INTERNAL_URL` aponte para a API acessivel pelo container.

## Autenticacao

O front-end usa rotas internas como BFF para login, cadastro, confirmacao de e-mail, recuperacao de senha, Google OAuth, sessao e logout. As telas privadas dependem dos cookies httpOnly emitidos por essas rotas.

## Seguranca

Arquivos `.env`, `.env.local`, `.env.dev`, `.env.prd` e variacoes locais estao protegidos pelo `.gitignore`. Somente exemplos sem segredos devem entrar no Git.
