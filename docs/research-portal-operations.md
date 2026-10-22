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
