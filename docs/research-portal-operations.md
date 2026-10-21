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

Sete testes do contrato do portal, typecheck, geração OpenNext e conferência em
desktop/celular. API cega sem previsões; 26 dimensões; sem overflow horizontal.
O SQL foi conferido quanto a append e bloqueio de update/delete.
A suíte geral encontrou seis falhas nas APIs faciais preexistentes (410 em rotas
desativadas); os arquivos dessas APIs não foram alterados nesta entrega.
Nenhuma chamada de classificação de IA, commit ou troca de branch.
