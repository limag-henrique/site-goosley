> Atualização: o piloto de 12 gravações e a consulta opcional à IA são definidos em [research-pilot.md](research-pilot.md). O embargo global descrito abaixo é histórico e não se aplica à consulta opcional após salvar. Pareceres salvos são compartilhados antes do encerramento.

# Operação do portal

- Rota: `/pesquisa-musical`, sem link no menu comercial e com `noindex`.
- Não há autenticação por decisão do responsável. Distribuir o link diretamente
  às pesquisadoras; quem possuir o endereço também poderá acessá-lo.
- Cada pesquisadora escolhe sua vaga (1 ou 2) e usa sempre o mesmo nome declarado.
  Salvar registra uma nova revisão; encerrar congela o percurso inteiro.
- O corpus inicial usa 3.381 itens da amostra provisória já preparada. As letras ficam no D1, consultadas individualmente, e
  têm estado `RESEARCH_AUTHORIZED` e hash SHA-256 correspondente ao snapshot.
- As previsões individuais ficam no servidor e sob embargo até os dois
  encerramentos. Agregados históricos fixos com ao menos 300 classificadas
  continuam disponíveis na exploração; não são recalculados sobre a amostra.
- O banco remoto existente `goosley-prod` usa o binding `RESEARCH_DB`.
  `scripts/research-portal-schema.sql` cria somente as tabelas e os gatilhos do portal. Importar o arquivo privado
  `.wrangler/research-portal-lyrics.sql` separadamente, no mesmo banco.
- Desenvolvimento: aplicar a mesma migração com `npx wrangler d1 execute
  goosley-prod --local --file=scripts/research-portal-schema.sql` antes de `npm run dev`.
- Publicação: usar o fluxo Cloudflare/OpenNext do repositório. Não publicar o JSON
  do servidor em `public/`; nunca importá-lo em componentes cliente.
- `npm run cf-typegen` gera apenas tipos dos bindings, com interface
  `ResearchPortalEnv`; tipos globais de runtime conflitam com o Next.js existente.
- Não alterar corpus, letras, rubrica, método ou previsões após iniciar a campanha.
  O fingerprint bloqueia alterações; uma campanha futura exige versão própria.
- Exportação JSON de todos os pareceres, revisões e divergências só é liberada
  depois dos dois encerramentos. A comparação não é referência adjudicada e não
  calcula estimativas de acurácia como se fossem validação humana concluída.

## Verificações realizadas

Oito testes do contrato do portal, typecheck, geração OpenNext e conferência em
desktop/celular. API cega sem previsões; 26 dimensões; sem overflow horizontal.
O SQL foi conferido quanto a append e bloqueio de update/delete.
A suíte geral encontrou seis falhas nas APIs faciais preexistentes (410 em rotas
desativadas); os arquivos dessas APIs não foram alterados nesta entrega.
Nenhuma chamada de classificação de IA, commit ou troca de branch.

As letras são importadas como bytes UTF-8 em literais hexadecimais para preservar
quebras de linha. O servidor recalcula SHA-256 antes de entregar o texto e não
exibe versões cujo conteúdo difira do hash registrado.

## Download parcial dos pareceres

Em Avaliação cega, selecione o percurso correto e salve as alterações. Use
**Baixar meus pareceres salvos (JSON)**. Não é necessário encerrar a etapa.
Repita para cada avaliadora para reunir os dois arquivos na coordenação.
Cada exportação contém apenas a avaliadora selecionada, todas as suas revisões,
a versão mais recente de cada parecer, rubrica, documento/hash, justificativa,
idioma e identidade observados. Não inclui letras nem previsões da IA.
O download é somente leitura e não encerra, remove ou substitui avaliações.
Mudanças feitas no formulário ainda não salvas não entram na cópia.

API: `GET /api/pesquisa-musical?mode=review-export&reviewer=1` (ou 2).
O JSON contém `payload` e checksum SHA-256 sobre `JSON.stringify(payload)`
em UTF-8. Verifique sem modificar o original:
`node scripts/verify-research-review-export.mjs caminho/do/arquivo.json`.
O checksum detecta alterações acidentais; guarde cópias datadas fora do banco.
A comparação humano–IA e a exportação de divergências permanecem bloqueadas
até os dois encerramentos.

A exportação parcial foi testada em cópia local isolada: salvamento real no D1
local, revisão, download no navegador, preservação de acentos/quebras de linha,
zero versus ausência e exclusão de pareceres da outra avaliadora. A verificação
do checksum aceitou o original e rejeitou uma cópia alterada. Nenhum parecer de
teste foi inserido na campanha real.


## Piloto e proteção dos registros

A configuração atual atribui as mesmas 12 gravações às duas pesquisadoras. O manifesto `src/data/research-pilot.json` documenta a distribuição e a fonte. O JSON original de 3.381 gravações fica intacto para preservar o fingerprint dos eventos existentes. Fechamento e progresso usam somente as 12 atribuídas. Eventos antigos e todas as revisões continuam armazenados.

`GET ?mode=community` publica o último parecer salvo de cada pesquisadora por gravação, inclusive pareceres históricos fora do piloto. A interface atualiza essa consulta a cada 15 segundos. `POST action=reveal` exige parecer salvo e identificação correspondente; registra a consulta uma única vez por avaliadora/gravação. `aiExposed` distingue revisões posteriores à consulta. O sistema sem autenticação continua em regime de confiança; o nome declarado não é prova de identidade. Os pareceres compartilhados também podem influenciar avaliações posteriores.

Salvar confirma somente depois do append no servidor. No D1, gatilhos existentes impedem UPDATE e DELETE dos eventos; conflitos de concorrência retornam erro em vez de descartar silenciosamente uma gravação. No desenvolvimento, há trava de escrita e fsync do arquivo de eventos. Não apagar nem recriar o banco ao publicar.

### Backup e recuperação

Executar `pwsh -NoProfile -File scripts/backup-research-portal.ps1` com as credenciais Cloudflare do projeto. Para o D1 local, acrescentar `-Local`. O script exporta somente `research_portal_events` e `research_portal_lyrics`; não altera o banco de origem. Um arquivo só recebe o nome final após uma exportação concluída; SHA-256 acompanha cada backup. Arquivos parciais não são backups válidos.

A pasta `.research-portal-backups/` está ignorada no Git. Guardar cópias privadas em armazenamento externo com acesso restrito; uma cópia no mesmo computador não protege contra perda do equipamento. Executar antes de publicar e periodicamente durante a coleta. O script não configura um agendamento automático.

Antes de restaurar, verificar SHA-256 e testar o SQL em um banco isolado; comparar contagens de eventos e letras, consultar os pareceres pelo portal e preservar o banco original. Restaurar em produção exige decisão do operador e não deve apagar o histórico existente. Os backups incluem letras autorizadas e nomes declarados: não disponibilizar na pasta pública do site.

Persistência ao atualizar a página depende do D1 configurado e disponível em produção. O teste automatizado reabre o adaptador real de disco e verifica histórico e conflito de escrita; isso não substitui a conferência do ambiente publicado.


## Chave privada de edição e congelamento do piloto

A leitura segue pública e não exige conta. O portal gera uma chave aleatória por percurso no navegador; a pesquisadora deve baixar uma cópia privada e pode colá-la no campo de chave em outro dispositivo. O servidor guarda somente SHA-256 da chave nos eventos. Nome público não autoriza escrita: salvar, consultar a IA e encerrar exigem a chave vinculada ao percurso. A primeira gravação vincula a chave; os slots ainda são autodeclarados, sem verificação institucional de identidade. Não há recuperação automática de chave perdida. Perder a chave não remove avaliações.

Registros legados sem chave permanecem legíveis e exportáveis, mas novas escritas nesse percurso falham explicitamente até a coordenação vincular uma credencial por procedimento administrativo. Não reclamar propriedade de dados antigos com base apenas no nome público. Verificar essa situação antes da publicação. Esta decisão substitui a edição apenas por nome do fluxo anterior.

Novos eventos do piloto registram também o fingerprint do manifesto da seleção, separado do fingerprint histórico do corpus. Mudanças na seleção após o primeiro registro bloqueiam a campanha; a adoção inicial do piloto preserva eventos legados e não modifica seu hash original.


## Verificação do piloto — 22/10/2026

Fluxo principal: implement (Matt Pocock), com TDD na fronteira do serviço e do adaptador real para as mudanças de comportamento. Design-for-ai/usability e apple-design orientaram divulgação progressiva, foco e feedback sem alterar a identidade existente. Wrangler foi usado na tentativa de backup; code-review verificou padrões e aceite.

- 16 testes do portal passaram, incluindo compartilhamento antes do encerramento, consulta opcional, diferença de escores, armazenamento real após reabertura, conflito de escrita, chave privada e mudança de seleção.
- Typecheck passou. Suíte geral: 43 passaram e seis falhas nas APIs faciais desativadas, já documentadas antes deste trabalho.
- Navegador local com armazenamento isolado: salvar ocorrência de ausência de letra, consultar IA, atualizar, reabrir e recuperar texto e comparação; visualizar o parecer em Pareceres salvos. Os registros técnicos não foram gravados na coleta real. Teste em largura de celular sem overflow horizontal.
- Esquema SQLite conferido em memória: gatilhos bloquearam UPDATE/DELETE; dump SQL restaurou o evento em outro banco isolado.
- SHA-256 e posições do ranking conferidos no arquivo original do artigo. Corpus JSON original intacto. Revisão final sem novos achados. Graphify atualizado localmente.
- Backup remoto recusado pela Cloudflare (Authentication error 10000); nenhuma cópia remota foi validada. Não houve publicação nem teste de escrita no D1 de produção. Reautenticar o Wrangler antes do backup e da publicação; conferir também a migração de percursos legados sem chave.

## Atualização de 30/10/2026 — cinco avaliadores
Esta seção substitui as instruções anteriores sobre duas vagas e as mesmas 12 músicas. O servidor usa `src/data/research-selection.json`: cinco percursos exclusivos, 20 gravações iniciais e lotes opcionais de até 20. A reserva é fixa por avaliador e a expansão persiste como evento `extend`; POST exige nome, chave e `assignedCount` atual. GET blind aceita avaliadores 1 a 5 e mantém paginação (a interface reúne todas as páginas carregadas).

O manifesto antigo e o corpus permanecem intactos. A transição aceita somente o fingerprint exato do piloto anterior, preserva sua autoria/chaves e histórico e não herda seus encerramentos. Não editar o novo manifesto após iniciar a coleta. Encerramento exige parecer em cada música já carregada; a reserva opcional não impede encerrar. Pareceres históricos continuam em comunidade e downloads. O JSON individual informa `assignedRecordingIds`, distinguindo o progresso da seleção atual de todo o histórico preservado; o verificador de integridade foi ajustado para essa distinção.

Consulte `research-five-reviewers.md` para critérios e validação e `research-selection-evidence.md` para a seleção e suas fontes. Esta entrega é local, sem publicação nem migração destrutiva; não exige alteração do esquema D1 existente. Nas análises, as músicas diferentes não produzem medidas de concordância interavaliador.


## Oito participantes — 08/11/2026

Elaine Vilela foi adicionada com ID 8, após os sete participantes existentes. Por autorização do usuário, ela compartilha o percurso musical da Grazi: 20 músicas iniciais e reserva de 156, com pareceres, chave privada, progresso e encerramento independentes. O manifesto ativo é `research-shared-8-v1`; o catálogo geral não duplica músicas compartilhadas.

`src/data/research-selection-seven.json` congela a seleção anterior. `python scripts/extend-research-selection-eight.py` gera o manifesto ativo preservando todas as atribuições anteriores e seus fingerprints. O campo `preservedReviewerIds` vincula os sete autores ao fingerprint exato dessa seleção; a restrição de autoria das seleções mais antigas permanece em vigor. O gerador de sete participantes agora escreve somente o snapshot de sete; não executar o gerador de cinco sobre a seleção ativa. Consulte `research-eight-reviewers.md` para escopo e validação.

## Sete participantes nomeados — 07/11/2026 (histórico)

Esta seção substitui as instruções de cinco vagas e consulta antecipada à IA. A apresentação segue Henrique Lima, Miguel Offerman (Mosov), Grazi, Gabriela, Geovana, Pedro Inácio e Rafael Medeiros. Os IDs internos continuam 2, 3, 1, 4, 5, 6 e 7 para preservar chaves, nomes antigos, vínculos e eventos. Não renumerar os eventos nem as credenciais exportadas. `Henrique Lima Gusmão` e `Mesov`/`Mosov` são apresentados sob as identidades canônicas; `originalEvaluator` conserva o nome declarado nas leituras normalizadas, sem reescrever o armazenamento.

`src/data/research-selection-five.json` conserva o manifesto anterior. `scripts/extend-research-selection.py` gera o manifesto de sete percursos a partir dessa fonte congelada; não executar o gerador histórico de cinco percursos sobre o manifesto ativo. Filas completas de Henrique e Miguel, suas expansões e encerramentos da seleção anterior permanecem válidos. Eventos antigos de outros percursos ou autores desconhecidos bloqueiam a transição para conferência, em vez de atribuir trabalho a novos nomes.

GET `mode=community` inclui `ranking` com `reviewer`, `name`, `count`, `position` e `minimum`. Conta somente a última avaliação completa com escores por pessoa/música, inclusive pareceres históricos preservados. Empates compartilham posição; nomes empatados seguem ordem alfabética pt-BR. Ausência, dúvida, abstenção e erro de identidade não somam pontos. O ranking não altera o artigo.

POST `preview` retorna 409 sem revelar IA ou gravar evento. POST `reveal` exige parecer salvo e a chave privada de edição. Consultas históricas continuam preservadas e revisões após exposição ficam identificadas. O bloco de idioma permanece aberto; `confirmed`, `uncertain` e `mismatch` são apresentados como corresponde, corresponde parcialmente e não corresponde. Sem resposta não equivale a confirmação.

Antes de publicar, conferir o D1 real: nesta sessão não havia credencial Cloudflare e o PostgreSQL local não estava acessível. A verificação local dos 1.299 vínculos está em `docs/research-links-verification.json`; fontes, proporções e reservas estão em `docs/research-seven-reviewers.md`. Nenhuma escrita na coleta real foi feita.

### Validação local da atualização

- `npm run typecheck`: aprovado. Os 29 testes musicais passaram; suíte geral: 67 testes, 61 aprovados e seis falhas preexistentes nas APIs faciais que retornam HTTP 410, já documentadas no piloto.
- Navegador Chromium com armazenamento técnico separado: sete nomes na ordem combinada, 20 músicas iniciais, salvamento e recarga, botão de IA somente após salvar, opções de correspondência persistidas, ranking de sete pessoas, desktop 1440px e celular 390px sem overflow horizontal. Foco de teclado visível verificado. Letras ausentes no adaptador local foram registradas como ausência, sem inventar escores. Testes de serviço cobrem escores, empates e progresso do ranking.
- `scripts/verify-research-links.py`: 1.299 gravações verificadas por ID nativo, título, artista, documento, hash do texto privado, snapshot e 26 escores históricos; nenhuma divergência. Quatro diferenças de capitalização de artistas são preservadas. O relatório não substitui validação semântica humana nem conferência do D1 real.
- `npm run build`: Next.js compilou, validou tipos e gerou as páginas; OpenNext falhou no empacotamento em Windows com ENOENT ao copiar `.open-next/.build/open-next.config.edge.mjs`. A tentativa sem reconstruir Next reproduziu a mesma falha. Nenhuma dependência ou configuração de deploy foi alterada para contornar o problema.
- ESLint dos arquivos alterados encontra os mesmos quatro erros `react-hooks/set-state-in-effect` presentes no `portal.tsx` do HEAD; comparação com o arquivo original confirmou a preexistência. Demais arquivos alterados sem novos erros.
- `graphify update .` foi tentado, mas o executável não está instalado nesta sessão. Sem commit, publicação ou escrita no D1/PostgreSQL.
