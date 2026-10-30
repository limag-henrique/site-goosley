# Pesquisa musical: cinco percursos exclusivos

Decisão confirmada em 30/10/2026: cinco avaliadores, 20 músicas iniciais por percurso, lotes adicionais de 20 e nenhuma repetição de gravação entre os cinco percursos. Período 01/01/2017–13/03/2022; usar somente escores históricos, sem classificação nova.

## Escopo e critérios de aceite
- Seleção baseada em streams observados no Spotify Top 200 por país/ano, com fonte, hash, posição anual, dias e cobertura temporal rastreáveis. Países: DO, PA, CL, BR, ID, JP, TW (extremos do atlas e Brasil).
- Cruzar a população com o corpus autorizado já congelado. Cada lote inicial inclui exemplos com 26 zeros, escores altos (>=2), nota máxima em pelo menos três dimensões e músicas populares. Classificar a amostra como intencional; não alegar representatividade populacional nem concordância interavaliador para músicas diferentes.
- Reservar listas exclusivas determinísticas para os cinco percursos; mostrar inicialmente 20. Carregar mais persiste a expansão, mantém a ordem e não depende do navegador. Mostrar esgotamento e falhas sem alterar rascunhos.
- Preservar integralmente o JSON do corpus, notas, documentos, eventos, chaves e manifesto antigo. Aceitar somente o fingerprint exato da seleção anterior numa transição explícita. Fechamentos antigos não encerram a nova seleção. Alterações futuras do manifesto continuam bloqueadas.
- Nome e chave privada continuam exigidos para salvar, expandir e encerrar. Conteúdo de estratos da IA não entra na listagem cega. Consulta opcional à IA continua disponível.
- Pareceres e exportações abrangem os cinco avaliadores e preservam o histórico. Progresso e encerramento usam apenas os lotes carregados de cada percurso.

## Limites dos módulos
Serviço existente do portal: atribuição, expansão, persistência, validação e exportação. Manifesto separado do corpus: reservas e evidências da seleção. Interface existente: cinco vagas, lista paginada acumulativa e botão de novos lotes. Gerador reproduzível: leitura local dos dados históricos e interseção com gravações autorizadas, sem alterar dados de pesquisa.

## Verificação acordada
Testar pelo serviço público existente: cinco listas exclusivas, bloqueio de músicas alheias, lotes persistentes, conflitos, chaves, encerramento, fingerprints e histórico. Conferir interface, typecheck, suíte, build e Graphify. Sem commits, troca de branch, publicação ou escrita na coleta real.

## Resultado e validação — 30/10/2026
- Manifesto `research-disjoint-5-v1`: 1.299 IDs exclusivos reservados (260/260/260/260/259). Primeiros 100 itens: 20 por avaliador; cada percurso contém os sete países e cinco exemplos com os 26 escores zero; pelo menos cinco com três ou mais notas máximas.
- 76 das 100 músicas iniciais estão no top 200 anual observado; 24 são suplementos para cobrir os extremos solicitados, identificados no manifesto. Posição anual calculada antes da interseção com o corpus congelado. As músicas, escores e fontes estão documentados em `research-selection-evidence.md`.
- 27 testes musicais passaram (serviço, seleção, exportação e verificador real do arquivo exportado). A suíte geral mantém seis falhas preexistentes em endpoints faciais desativados (HTTP 410), já registradas em `research-pilot.md`.
- `npm run typecheck` e `npm run build` (Next.js/OpenNext) passaram. Revisões independentes de padrões e especificação não encontraram defeitos concretos.
- Navegador com armazenamento temporário isolado: cinco vagas, 20 músicas no quinto percurso, expansão para 40, recarregamento preservando as 40, parecer técnico de ausência de letra salvo e recuperado após refresh. O armazenamento local de teste não contém as letras privadas do D1; a ausência foi apresentada explicitamente, sem convertê-la em nota zero. Conferência em celular e desktop, sem overflow horizontal no desktop.
- Graphify atualizado: 997 nós e 1.714 arestas; seus avisos sobre JSON sem nós e parser SQL ausente não impedem a atualização do grafo de código.
- Corpus e manifesto do piloto anterior sem diferenças em relação ao HEAD. Nenhuma alteração de branch, commit, publicação ou escrita no D1 de produção.

Fluxo primário: TDD pelo serviço público, conforme fronteira de validação confirmada. Complementos: especificação local do escopo; pesquisa nas fontes de charts; design-for-ai/apple-design para conservar os controles e a apresentação existentes; revisão independente do diff. Critérios de parada: critérios de aceite cobertos, testes musicais, tipos e build aprovados, persistência conferida no navegador.
