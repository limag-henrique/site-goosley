# Piloto de avaliação musical — 12 gravações

## Problema e decisão confirmada
O corpus de 3.381 gravações impõe carga excessiva às duas pesquisadoras. O responsável confirmou 12 gravações por pesquisadora, consulta opcional à IA após salvar e publicação dos pareceres para os visitantes do portal.

## Critérios de aceite
- As mesmas 12 gravações para ambas: DO 3, PA 2, CL 2, BR 2, ID 1, JP 1, TW 1.
- Ranking de explicitude sexual do atlas do artigo, 2017–13/03/2022; posições 1, 2, 3, 22, 66, 67, 68. A posição é temática e não uma nota de qualidade nacional.
- Seleção determinística dentro do estrato original de cada mercado, sem filtrar escores individuais da IA. Manifesto registra IDs, método e SHA-256 da fonte.
- Corpus e fingerprint originais permanecem intactos; avaliações históricas continuam no histórico e na exportação.
- Parecer salvo aparece em Pareceres salvos para qualquer visitante, antes dos encerramentos, com nome declarado, justificativa e escores.
- Consulta à IA exige parecer salvo, é opcional e gera evento de exposição. Revisões subsequentes recebem indicação de exposição.
- Comparação mostra escore humano, IA e diferença humano menos IA; ausências não são zeros. Template, versão e proveniência disponíveis são exibidos sem inventar a requisição histórica completa.
- Salvamento confirmado depende da escrita no servidor. Reabertura do armazenamento recupera o parecer; falhas e conflitos não são apresentados como sucesso.
- Histórico append-only preserva todas as revisões. Produção exige D1 e não recorre silenciosamente a armazenamento local.

## Verificação
Fronteiras: serviço público do portal (seleção, salvar, ler, compartilhar, revelar, exportar) e adaptador real de persistência local após reabertura. Testes de tipos, suíte geral, build e inspeção do portal no navegador.

## Limites
Amostra piloto exploratória, sem estimativa de validade populacional. Mantidos dois percursos declarados e sem autenticação, conforme decisão anterior documentada. Não reclassificar músicas, não apagar eventos, não trocar branch e não criar commits. Publicação e recuperação remota precisam de ambiente configurado. Esta especificação substitui o embargo global e o escopo de 3.381 itens para o trabalho atribuído no piloto; os agregados do artigo continuam históricos.


## Chave privada de edição e congelamento do piloto

A leitura segue pública e não exige conta. O portal gera uma chave aleatória por percurso no navegador; a pesquisadora deve baixar uma cópia privada e pode colá-la no campo de chave em outro dispositivo. O servidor guarda somente SHA-256 da chave nos eventos. Nome público não autoriza escrita: salvar, consultar a IA e encerrar exigem a chave vinculada ao percurso. A primeira gravação vincula a chave; os slots ainda são autodeclarados, sem verificação institucional de identidade. Não há recuperação automática de chave perdida. Perder a chave não remove avaliações.

Registros legados sem chave permanecem legíveis e exportáveis, mas novas escritas nesse percurso falham explicitamente até a coordenação vincular uma credencial por procedimento administrativo. Não reclamar propriedade de dados antigos com base apenas no nome público. Verificar essa situação antes da publicação. Esta decisão substitui a edição apenas por nome do fluxo anterior.

Novos eventos do piloto registram também o fingerprint do manifesto da seleção, separado do fingerprint histórico do corpus. Mudanças na seleção após o primeiro registro bloqueiam a campanha; a adoção inicial do piloto preserva eventos legados e não modifica seu hash original.


## Fluxo simplificado das avaliadoras — 22/10/2026

Decisão do responsável: retirar os blocos Resultados por tema e período e Fontes e cobertura do artigo e manter somente o necessário para avaliar músicas e ler a classificação da IA.

Aceite do fluxo atual:
- Entrada direta em Avaliar músicas, com apenas duas abas: Avaliar músicas e Pareceres salvos.
- Removidos da interface os agregados, fontes/cobertura, associações contextuais, método geral, comparação global e filtros de exploração. Os dados históricos do artigo não são apagados nem alterados no backend.
- Mantidas as mesmas 12 músicas e a rubrica existente. Identificação, progresso e acesso ficam concentrados; chave, download e encerramento ficam em um painel recolhido.
- Por música: letra, fundamento/escores da avaliadora, consulta opcional à IA após salvar, comparação por dimensão e prompt histórico disponível.
- Após consultar a IA, campo próprio para ponderar sobre concordâncias, divergências, contexto e fundamento pessoal.
- A ponderação é um evento append-only separado, vinculado ao ID do parecer comparado. Não altera escores nem justificativa inicial, pode ser salva após o encerramento e exige a mesma chave privada.
- O detalhe recupera a ponderação após recarregar e a lista pública mostra a ponderação vinculada ao parecer atual. Revisões anteriores continuam no histórico exportado.
- A classificação histórica contém escores e não inclui uma justificativa textual preservada da IA; a interface informa essa limitação sem gerar uma explicação nova.

Verificação: serviço do portal (salvar/consultar IA/ponderar/compartilhar/exportar), reabertura do adaptador real de disco e fluxo no navegador, incluindo refresh, erros e largura de celular. Nenhuma mudança de corpus, branch, commits ou publicação é necessária para este escopo.


### Evidências da simplificação

- 17 testes do portal passaram, incluindo ponderação separada, encerramento, rejeição de comparação desatualizada, leitura pública/exportação e recuperação com o adaptador real de disco.
- Typecheck passou. Suíte geral: 46 testes passaram e seis falhas preexistentes em rotas faciais desativadas (HTTP 410), fora deste escopo.
- Navegador local com dados técnicos isolados: entrada direta em avaliação, duas abas, consulta opcional à IA, ponderação salva, refresh com recuperação do texto e fundamento preservado, ponderação visível na lista compartilhada.
- A revisão encontrou e corrigiu cliques repetidos na aba e música ativas. Uma segunda inspeção confirmou os retornos antecipados e não encontrou pendências. Nova interação no navegador ficou indisponível porque o controle local foi desativado nas configurações do Work; não houve tentativa de contornar essa configuração.
- HTTP local retornou 200 com os títulos Avaliar músicas e Pareceres salvos, sem Resultados por tema e período, Fontes e cobertura do artigo ou Indicadores e associações contextuais.
- Graphify atualizado. Nenhum commit, troca de branch, modificação do corpus original ou escrita no banco de produção.


## Consulta opcional antes de preencher — decisão posterior de 22/10/2026

A pedido do responsável, a avaliadora pode consultar a classificação da IA antes de preencher qualquer campo do parecer, inclusive sem preencher o nome. Esta decisão substitui a exigência de salvar primeiro nas seções históricas acima.

O botão Ver análise da IA antes de avaliar aparece acima do formulário de cada música. A consulta permanece opcional e não apaga o rascunho; a classificação continua visível enquanto a avaliadora preenche seus escores e fundamento. A tabela identifica escores humanos como salvos e mostra ausência até o primeiro salvamento, sem inventar concordância ou diferença.

Uma consulta prévia registra um evento técnico `preview` identificado pelo hash da chave aleatória do navegador, sem nome e sem reservar uma vaga de avaliadora. Ao salvar, somente a consulta correspondente à chave privada daquele parecer marca `aiExposed=true`. Consultas de outros visitantes não alteram a autoria nem a classificação de exposição da avaliadora. As credenciais não são divulgadas. O parecer salvo e sua ponderação continuam protegidos pela chave privada.

A ponderação separada continua disponível após salvar o fundamento e os escores, já que se vincula à versão do parecer comparado. A justificativa do parecer também pode comentar diretamente os acertos e erros da IA. O corpus, a amostra e as respostas históricas do modelo não são alterados.


Verificação da consulta prévia: 19 testes do portal passaram; TypeScript passou. A suíte geral teve 48 aprovações e as mesmas seis falhas preexistentes nas APIs faciais desativadas. Uma integração HTTP local, com diretório de eventos técnico isolado, consultou os 26 escores sem nome ou avaliação, salvou o parecer com exposição registrada, criou a ponderação e recuperou os dados no detalhe e na leitura pública. A revisão não encontrou pendências. O botão foi conferido no código acima do formulário e sem bloqueio por nome, escores, justificativa ou rascunho. A interação visual desta alteração não foi repetida porque o controle de navegador local está desativado nas configurações do Work. Graphify atualizado; nenhum commit, troca de branch, publicação ou escrita na coleta real.


## Download comparativo — 23/10/2026

Em Pareceres salvos, os botões Baixar comparação com IA (CSV) e Baixar dados completos (JSON) exportam as avaliações durante a coleta, sem exigir encerramento. Em Acesso e cópia dos pareceres há também o CSV da avaliadora selecionada.

CSV: uma linha por música, avaliadora e dimensão, com os últimos escores humano/IA, diferença humano menos IA, concordância/divergência, fundamento, ponderação correspondente à versão do parecer, situação, exposição à IA e rastreabilidade. Zero permanece zero; ausência gera célula vazia e Sem comparação. UTF-8 com BOM, separador ponto e vírgula e aspas preservam textos multilinha e acentos. Strings que poderiam ser fórmulas são neutralizadas sem alterar diferenças numéricas negativas.

JSON: comparação dos últimos pareceres, prompt/proveniência da IA e histórico dos pareceres e ponderações. Hashes privados de edição/consulta e letras não integram os arquivos. A exportação é somente leitura e não muda o corpus, a seleção nem os eventos. O download individual anterior permanece disponível.

Verificação: teste de contrato com dois pareceres por avaliadora, revisão anterior, ausência de letra, ponderação vinculada e exportação antes de fechar; teste de CSV com Unicode, aspas, quebras, zero, deltas negativos, fórmulas e conjunto vazio; checagem de tipos, suíte geral, integração HTTP e build.


Validação do download: 22 testes do portal/CSV passaram e o TypeScript passou. A integração HTTP local gerou e reabriu um CSV com 52 linhas para duas avaliadoras e 26 dimensões, um CSV individual com 26 linhas e o JSON com dois pareceres. Cabeçalhos de download, BOM, textos com acentos/aspas/quebras, ponderação, filtro por avaliadora, ausência de hashes privados e rejeição de formato inválido foram verificados. O diretório de dados era técnico e isolado. As revisões de padrões e aceite não encontraram defeitos pendentes. A suíte geral mantém as seis falhas preexistentes nas APIs faciais desativadas. Graphify atualizado; sem publicação, commits ou mudança de branch. A implementação seguiu o fluxo implement, com TDD nas fronteiras do serviço e do formatador e controles visuais existentes do portal.
