# Plano — refino de permissões por perfil

Decisões: quiz de professor **publica direto**; professor **mantém** acesso ao blog;
área administrativa do dono fica **no Next** (`/[locale]/admin`), painel do Strapi só para o dev.

Repos: `fluent-too` (Next) e `fluent-too-api` (Strapi v5).

---

## Fase 0 — corrigir leitura de quiz pelo aluno (bug)

Hoje `student` não tem `api::quiz.quiz.find/findOne`; só funciona porque o Next busca
quiz sem token (permissão `public`). Quiz com `isPublic: false` é invisível pro aluno logado.

- `src/auth/access-control.ts`: extrair `quizReadActions = ['api::quiz.quiz.find', 'api::quiz.quiz.findOne']`
  e incluir em `studentActions` (propaga para `teacher`, `teacher_pending`, `authenticated`).
- Teste em `src/auth/access-control.test.ts`: plano do `student` contém as duas ações.

## Fase 1 — idioma do professor

`languages` hoje morre na `teacher-application`. Precisa chegar no user e valer na criação.

- `src/extensions/users-permissions/content-types/user/schema.json` (novo): copiar o schema do
  plugin e acrescentar `teachingLanguages` (`json`, default `[]`).
- `src/api/teacher-application/services/review.ts`, no ramo `approved`: gravar
  `teachingLanguages: application.languages ?? []` junto com a troca de role.
- `src/auth/quiz-language.ts` (novo): `canManageQuizLanguage(user, targetLanguage)` —
  admin sempre true; `teacher` só se o idioma estiver em `teachingLanguages`.
- `src/policies/can-manage-quiz-language.ts` (novo), aplicada em `create` e `update` da rota de quiz.
  No `update`, barrar também a troca de `targetLanguage` para idioma não aprovado.
- `src/extensions/users-permissions/strapi-server.ts`: expor `teachingLanguages` no `me`.
- Backfill no bootstrap: para users já `teacher` com `teachingLanguages` vazio, preencher a partir
  da candidatura aprovada.

## Fase 2 — validar questões e publicar direto

- `src/api/quiz/services/questions.ts` (novo): `validateQuestions(type, questions)`.
  - `multiple-choice`: `id`, `prompt`, `options[]` (≥2), `correctAnswer` ∈ `options`.
  - `fill-gap`: `id`, `prompt`, `correctAnswers[]` não vazio.
  - `flashcard`: `id`, `front`, `back`.
  - Ids únicos; limite de questões por quiz.
- `src/api/quiz/controllers/quiz.ts`: validar em `create` e `update` antes de gravar (`400` com código).
- Publicação direta: após vincular o owner, `strapi.documents('api::quiz.quiz').publish({ documentId })`.
  Mantém `draftAndPublish: true` para o admin poder despublicar depois.
- Testes unitários de `validateQuestions` (um por tipo, mais casos inválidos).

## Fase 3 — API de quiz no Next

- `lib/quizzes/manage-client.ts` (novo): `listOwn`, `create`, `update`, `remove`, com accessToken.
- `app/api/quizzes/route.ts` (novo): `GET` (quizzes do próprio professor), `POST` (criar).
- `app/api/quizzes/[id]/route.ts` (novo): `PUT`, `DELETE`.
- Guarda em ambas: sessão válida + `canCreateContent(role)`, mesmo padrão de
  `app/api/quiz-attempts/route.ts` (refresh de cookie incluso).

## Fase 4 — UI do professor

- `app/[locale]/teacher/quizzes/page.tsx` (novo): server page, guarda `canCreateContent`,
  lista os quizzes do professor.
- `app/[locale]/teacher/quizzes/QuizEditorPanel.tsx` (novo): client, formulário com
  título, descrição, nível, tipo (os 3 fixos), idioma **restrito a `teachingLanguages`**,
  e editor de questões que muda de shape conforme o tipo.
- Link no dashboard, condicionado a `canCreateContent` (função hoje definida e nunca usada).
- Chaves novas em `messages/pt-br.json`, `en-us.json`, `fr-fr.json`.

## Fase 5 — área admin no Next (opção 14)

- `lib/auth/roles.ts`: `canManageContent(role)` (`app_admin` | `super_admin`) e `isSuperAdmin(role)`.
- `app/[locale]/admin/page.tsx`: hub com cards — Professores (já existe), Quizzes, Blog.
- `app/[locale]/admin/quizzes/`: listar todos, editar, publicar/despublicar, apagar.
- `app/[locale]/admin/blog/`: CRUD de `blog-post`.
- Rotas proxy correspondentes sob `app/api/admin/`.
- `src/auth/access-control.ts`: separar `superAdminActions` de `appAdminActions`
  (hoje são a mesma lista). `app_admin` = tudo de conteúdo + revisão de professores;
  `super_admin` = isso mais o que for de sistema daqui pra frente.
- Painel do Strapi deixa de ser caminho do dono; nenhuma conta de painel para ele.

---

## Ordem sugerida

Fase 0 → 1 → 2 (backend fechado e testado) → 3 → 4 (professor funcionando ponta a ponta) → 5.

## Riscos

- Alterar o schema do user via extensão exige recriar o arquivo completo do plugin; conferir
  se a migração roda limpa no banco existente.
- `questions` já gravadas no banco podem não passar na validação nova — a validação vale só
  na escrita, leitura fica intacta.
- Publicar direto significa que quiz de professor vai ao ar sem revisão; a despublicação
  no admin (Fase 5) é a rede de segurança.

---

## Status

- **Fase 0 — concluída.** `quizReadActions` em `studentActions`.
- **Fase 1 — concluída.** `teachingLanguages` no user, policy `can-manage-quiz-language`, propagação
  na aprovação, `me` expondo o campo, backfill no bootstrap.
- **Fase 2 — concluída.** `validateQuestions` / `resolveQuizType`, validação em create e update,
  publicação automática. Shape das questões alinhado ao que o front consome
  (`question` na múltipla escolha, `parts` + `correctAnswers` no fill-gap, `front`/`back` no flashcard).
- **Fase 3 — concluída.** `lib/quizzes/manage.ts`, `manage-client.ts`, `app/api/quizzes/` (GET/POST)
  e `app/api/quizzes/[id]/` (PUT/DELETE), com guarda `canCreateContent`.
- **Fase 4 — concluída.** `lib/quizzes/editor.ts`, `/[locale]/teacher/quizzes` com painel e editor
  por tipo, atalho no dashboard, traduções nos três locales.
- **Fase 5 — concluída.** Hub /admin no Next com Quizzes, Blog e Professores; moderação de quiz
  (publicar/despublicar) via rotas novas no Strapi; CRUD de blog-post; `app_admin` e `super_admin`
  com listas de permissão distintas; editor de quiz extraído para `components/quiz/QuizEditorForm.tsx`
  e reusado pelos dois painéis.

Nada foi validado contra a API rodando: só testes, `tsc` e build dos dois projetos.
