# Criminalidade Facial Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o fluxo móvel fictício de identificação, confirmação de nascimento, foto, ArcFace real e perfil completo filtrado.

**Architecture:** Os dados brutos serão gerados para um módulo server-only e expostos por interfaces pequenas de desafio e verificação. A UI consumirá somente dados públicos e perfis filtrados, enquanto a pontuação removerá o fallback sintético e dependerá do contêiner ArcFace corrigido.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS v4, Cloudflare Workers/Containers, Python/InsightFace ArcFace.

**Spec:** `docs/superpowers/specs/2026-09-29-criminalidade-facial-mobile-design.md`

## Global Constraints

- Todo texto visível deve estar em pt-BR.
- Não criar commits nem mudar de branch.
- `pessoas.txt` é a fonte canônica fictícia.
- Excluir saúde, vacinas, CNS e dados identificáveis de familiares.
- Mascarar exatamente os dois últimos dígitos de identificadores e telefones.
- Não produzir pontuações faciais sintéticas.
- Preservar o visual preto, branco, laranja e índigo do site.
- A tela cheia real depende do suporte do navegador; não exibir prompt próprio.

## Review Focus

- Perfil sem nascimento deve ficar bloqueado sem quebrar a busca.
- Repetição de campos nas linhas extensas não pode apagar valores distintos.
- Bloco familiar ou de saúde aninhado não pode vazar por categoria genérica.
- Backend ArcFace com timeout, 5xx ou JSON inválido nunca pode produzir score 200.
- Se fullscreen for recusado, nome, ano, upload e resultado continuam utilizáveis.

---

### Task 1: Fonte server-only e projeção de perfis

**Files:**
- Create: `scripts/generate-people-data.mjs`
- Create: `src/server/criminalidadefacial/pessoas.generated.ts`
- Create: `src/server/criminalidadefacial/people.ts`
- Create: `src/lib/criminalidadefacial-profile.ts`
- Create: `tests/criminalidadefacial-profile.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: linhas de `pessoas.txt` no formato `Nome {conteúdo}`.
- Produces: `getPeopleIndex()`, `getBirthYearChallenge(id)` e `verifyBirthYear(id, year)`; tipos `PersonIndexEntry`, `PersonProfileResult` e `ProfileSection`.

- [ ] Escrever um teste falho que cobre busca, opções `ano-1/ano/ano+1`, bloqueio sem nascimento, máscara de dois dígitos, repetição de campos e exclusão de saúde/família.
- [ ] Executar `npm test -- --test-name-pattern="perfil fictício"` e confirmar falha pelas interfaces ausentes.
- [ ] Implementar gerador, parser, categorização e módulo server-only; gerar o artefato a partir de `pessoas.txt`.
- [ ] Reexecutar o teste e confirmar aprovação.
- [ ] Registrar conclusão no ledger sem commit, conforme a política do repositório.

### Task 2: Rotas de desafio e confirmação

**Files:**
- Create: `src/app/api/criminalidadefacial/profile/challenge/route.ts`
- Create: `src/app/api/criminalidadefacial/profile/verify/route.ts`
- Create: `tests/criminalidadefacial-profile-api.test.ts`

**Interfaces:**
- Consumes: interfaces server-only da Task 1.
- Produces: `POST challenge { personId }` e `POST verify { personId, year }`.

- [ ] Escrever testes falhos para perfil válido, desconhecido, sem nascimento, ano errado e ano correto.
- [ ] Executar o teste focado e confirmar falha por rotas ausentes.
- [ ] Implementar validação JSON, códigos 200/400/403/404/409 e `Cache-Control: no-store`.
- [ ] Reexecutar o teste e confirmar aprovação.
- [ ] Registrar conclusão no ledger sem commit.

### Task 3: ArcFace obrigatório e contêiner inicializável

**Files:**
- Modify: `src/app/api/score/route.ts`
- Modify: `tests/api-score.test.ts`
- Modify: `criminalidadefacial-service/container_api.py`
- Modify: `criminalidadefacial-service/serve_similarity_app.py`
- Create: `criminalidadefacial-service/test_container_contract.py`

**Interfaces:**
- Consumes: `FACIAL_SIMILARITY_BACKEND_URL` e corpo binário de imagem.
- Produces: score ArcFace validado ou erro explícito 502/503/504; referências servíveis pelo Worker.

- [ ] Trocar o teste do fallback por testes falhos para backend ausente, indisponível e resposta ArcFace válida.
- [ ] Executar `npm test -- --test-name-pattern="POST /api/score"` e confirmar o fallback indevido.
- [ ] Remover hash/gallery fallback, adicionar timeout/retry e validar o payload do backend.
- [ ] Escrever e executar teste Python falho para import de inicialização e URL de referência.
- [ ] Corrigir import do contêiner e normalizar o caminho público da referência.
- [ ] Reexecutar testes TypeScript e Python e confirmar aprovação.
- [ ] Registrar conclusão no ledger sem commit.

### Task 4: Fluxo móvel, galeria e painéis retráteis

**Files:**
- Modify: `src/app/criminalidadefacial/page.tsx`
- Rewrite: `src/components/CriminalidadeFacialClient.tsx`
- Modify: `src/lib/criminalidadefacial.ts`
- Modify: `tests/criminalidadefacial.test.ts`

**Interfaces:**
- Consumes: índice de pessoas, rotas da Task 2 e score da Task 3.
- Produces: passos nome → nascimento → foto → carregamento → resultado e seletores separados de câmera/galeria.

- [ ] Escrever testes falhos para clientes de challenge/verify e tratamento de erros.
- [ ] Executar o teste focado e confirmar falha pelas funções ausentes.
- [ ] Implementar clientes HTTP e reescrever o fluxo com as mensagens exatas e rótulo fictício.
- [ ] Implementar botão de galeria com input `image/*` sem `capture`, input de captura separado e preview local.
- [ ] Renderizar todas as seções retornadas como `<details>` retráteis.
- [ ] Reexecutar testes, typecheck e confirmar aprovação.
- [ ] Registrar conclusão no ledger sem commit.

### Task 5: Experiência PWA fullscreen

**Files:**
- Create: `src/app/manifest.ts`
- Create: `src/components/useImmersiveMode.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/PublicChrome.tsx`
- Modify: `src/app/globals.css`
- Create: `tests/criminalidadefacial-pwa.test.ts`

**Interfaces:**
- Consumes: APIs de manifesto, viewport e Fullscreen do navegador.
- Produces: PWA com início/escopo em `/criminalidadefacial`, layout `100dvh` e tentativa silenciosa de fullscreen.

- [ ] Escrever teste falho do manifesto e da exclusão do chrome comercial.
- [ ] Executar o teste focado e confirmar falha pela ausência do manifesto.
- [ ] Implementar manifesto, metadados Apple, viewport, safe areas e hook imersivo.
- [ ] Reexecutar o teste e confirmar aprovação.
- [ ] Registrar conclusão no ledger sem commit.

### Task 6: Verificação integrada e Graphify

**Files:**
- Modify: somente correções exigidas pelas verificações.
- Refresh: `graphify-out/`

**Interfaces:**
- Consumes: todos os módulos e adapters anteriores.
- Produces: build verificável do site e grafo local atualizado.

- [ ] Executar `npm run typecheck`.
- [ ] Executar `npm test`.
- [ ] Executar `npm run facial:worker:test` e `npm run facial:worker:typecheck`.
- [ ] Executar `npm run build`.
- [ ] Executar `graphify update .` e confirmar conclusão.
- [ ] Fazer revisão final independente do diff, corrigindo achados Critical/Important por RED→GREEN.
- [ ] Registrar conclusão no ledger sem commit.
