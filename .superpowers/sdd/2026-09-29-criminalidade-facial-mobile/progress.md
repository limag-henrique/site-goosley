# SDD ledger — plan: docs/superpowers/plans/2026-09-29-criminalidade-facial-mobile.md

Setup: execução na branch atual `main`, exigida pelo AGENTS.md; nenhum commit será criado.
Setup: os scripts `sdd-workspace`/`task-start`/`task-done` não estão presentes na instalação local; o ledger será mantido manualmente.
Setup: alterações preexistentes detectadas em `src/components/Hero.tsx` e `src/components/Navbar.tsx`; serão preservadas e não fazem parte deste plano.
Pre-flight: Task 1 produz `getPeopleIndex`, `getBirthYearChallenge`, `verifyBirthYear`; Tasks 2 e 4 consomem exatamente essas interfaces.
Pre-flight: Task 2 produz os adapters HTTP `challenge` e `verify`; Task 4 consome seus contratos JSON.
Pre-flight: Task 3 preserva `PublicScoreResponse`/`scorePhoto`; Task 4 consome essa interface e passa a receber apenas resultados ArcFace reais.
Pre-flight: Task 5 é independente dos dados, mas o hook imersivo será consumido pela UI da Task 4.
Task 1: complete (sem commit; `npm test -- --test-name-pattern="perfil fictício"` → 17/17 pass; RED observado por módulos ausentes, GREEN com 4 testes novos).
Task 2: complete (sem commit; `npx tsx --test tests/criminalidadefacial-profile-api.test.ts tests/criminalidadefacial-profile.test.ts` → 8/8 pass; RED observado por rotas ausentes, GREEN com contrato HTTP completo).
Task 3: Ruling: a URL `/api/reference/:id` do Python já corresponde à interface do Worker; mantive-a e adicionei um adapter proxy no Next para o caso de cliente sem origem externa — custo se errado: uma requisição adicional por miniatura.
Task 3: complete (sem commit; score/client → 8/8 pass, proxy de referência → 2/2 pass, contrato Python → 2/2 pass; RED confirmou fallback sintético, ausência de retry, URL quebrada e import inexistente).
Task 4: Ruling: uma alteração paralela atingiu `CriminalidadeFacialClient.tsx`; preservei o arquivo e isolei o novo fluxo em `CriminalidadeFacialExperience.tsx`, ligado somente pela página — custo se errado: o componente legado permanece no bundle-fonte, mas não é importado pela rota.
Task 4: complete (sem commit; fluxo nome → ano → foto → carregamento → resultado, galeria sem `capture`, câmera separada, mensagens pedidas e painéis `<details>`; regressão do parser cobre blocos mistos de titular/família/vacina; testes focados 12/12 e typecheck aprovados).
Task 5: complete (sem commit; manifesto fullscreen, metadados Apple, viewport/safe areas, tentativa silenciosa no carregamento e primeira ativação, chrome comercial removido da rota; testes PWA 3/3 aprovados).
