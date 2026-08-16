# Review React Hooks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o fluxo de salvamento do histórico de quizzes para ser disparado por evento de usuário, revisar os hooks do front e remover a dependência de deduplicação por janela de tempo.

**Architecture:** O resultado do quiz continua sendo exibido por `QuizAttemptResult`, mas o POST do histórico sai desse componente e passa a acontecer nos handlers de finalização dos quizzes. O backend mantém idempotência por chave exata enviada pelo front, sem regra baseada em segundos.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Strapi 5.

---

### Task 1: Salvamento por Evento no Front

**Files:**
- Modify: `components/quiz/MultipleChoiceQuiz.tsx`
- Modify: `components/quiz/FillGapQuiz.tsx`
- Modify: `components/quiz/FlashcardQuiz.tsx`
- Modify: `components/quiz/QuizAttemptResult.tsx`
- Create: `lib/quiz-attempts/save.ts`
- Test: `lib/quiz-attempts/save.test.ts`

- [ ] **Step 1: Criar teste para salvar tentativa somente quando função de ação é chamada**

Run: `npm test -- lib/quiz-attempts/save.test.ts`
Expected: falha porque `saveQuizAttemptResult` ainda não existe.

- [ ] **Step 2: Implementar `saveQuizAttemptResult`**

Responsabilidade: montar payload, gerar `attemptKey` determinística por conclusão e chamar `/api/quiz-attempts` uma vez quando invocada.

- [ ] **Step 3: Mover chamadas para handlers de conclusão**

`handleSubmit` e `finishQuiz` devem chamar `saveQuizAttemptResult` depois de calcular `result`. `QuizAttemptResult` deve receber `saveState` por prop e não usar `useEffect`.

- [ ] **Step 4: Remover hooks desnecessários de `QuizAttemptResult`**

Remover `useEffect`, `useMemo` e estado local de salvamento automático.

### Task 2: Backend Idempotente sem Janela Temporal

**Files:**
- Modify: `fluent-too-api/src/api/quiz-attempt/services/access.ts`
- Modify: `fluent-too-api/src/api/quiz-attempt/services/access.test.ts`
- Modify: `fluent-too-api/src/api/quiz-attempt/controllers/quiz-attempt.ts`

- [ ] **Step 1: Ajustar teste de duplicidade**

Expected: filtro deve usar `user.id` e `attemptKey`, sem `completedAt`.

- [ ] **Step 2: Ajustar helper e controller**

Controller deve reutilizar tentativa existente apenas quando a mesma `attemptKey` existir para o usuário.

### Task 3: Revisão dos Outros Hooks

**Files:**
- Modify: `components/home/Header.tsx`
- Inspect: `components/auth/AuthStatus.tsx`
- Inspect: `components/home/QuizSectionClient.tsx`

- [ ] **Step 1: Remover `useCallback` sem ganho real em `Header`**

Manter função simples, já que não há memoização de filhos que dependa da identidade estável.

- [ ] **Step 2: Manter Effects justificados**

`AuthStatus` sincroniza sessão com API e `QuizSectionClient` sincroniza URL/popstate; ambos são integração com sistema externo.

### Task 4: Verificação

- [ ] **Step 1: Rodar testes do front**

Run: `npm test`

- [ ] **Step 2: Rodar TypeScript e lint do front**

Run: `npx tsc --noEmit`
Run: `npm run lint`

- [ ] **Step 3: Rodar build do front**

Run: `npm run build`

- [ ] **Step 4: Rodar testes e build do backend**

Run: `npm test`
Run: `npm run build`
