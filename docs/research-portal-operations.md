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
