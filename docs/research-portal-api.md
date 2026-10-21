# API de leitura e avaliação

Endpoint `/api/pesquisa-musical`, sem cache. `GET` padrão: `mode=exploration`.

- Lista: `mode=exploration|blind`, `reviewer=1|2` obrigatório em blind; `search`, `market`, `year`, `language`, `genre`, `page=1`, `pageSize=30` (máximo 100). `theme=dimensionCode` só após encerramento global, em exploração.
- Detalhe: mesmos parâmetros + `id=recordingId`. A lista não inclui letras; detalhe inclui `recording.lyrics` quando autorizado no dataset.
- Comparação: `mode=compare`; exportação JSON: `mode=export`. Ambas retornam 403 antes dos dois encerramentos.

Lista retorna `{state,dimensions,methodology,total,page,pageSize,recordings,filters}`. `filters` tem `markets`, `years`, `languages`, `genres`. Exploração acrescenta `sources`, `annual`, `context`, `predictionsEmbargoed`. `annual` contém somente agregados fixos do artigo com `classified_tracks >= 300`; esses resultados não são recalculados em função da amostra ou dos filtros. Cego nunca recebe annual/context e acrescenta `reviewer,completed`. Detalhe retorna `recording` em vez da lista e, no cego, `review` (último parecer próprio ou null). `state`: `{closedReviewers:[1|2],closed:boolean,assigned:number,rubricVersion:string}`.

`POST` JSON para salvar:

```json
{"action":"save","reviewer":1,"evaluator":"Nome da especialista","recordingId":"id","status":"scored","scores":{"dimensionCode":0},"justification":"Fundamentação"}
```

`status`: `scored`, `missing-lyrics`, `doubt`, `abstain`, `identity-error`. Em `scored` todos os códigos precisam de inteiro 0–3 e a letra deve existir. Nos demais estados, omitir `scores` ou usar valores null; ausência nunca vira zero. Justificativa sempre obrigatória. Opcionais: `recordedLanguage` (texto|null), `identityVerdict` (`confirmed`, `uncertain`, `mismatch` ou null). Dados de versão, identidade documental, hash e horário são gerados no servidor. Salvamentos são novas revisões imutáveis.

Encerrar: `{"action":"close","reviewer":1,"evaluator":"Nome da especialista"}`. Exige um parecer por gravação; bloqueia o percurso. Ambas devem encerrar antes da liberação global. Não existe reabertura pela API.

Erros `{error:string}` com HTTP 400/403/404/409/413/503. A interface deve exibir o erro e preservar texto do formulário. Após 409 de concorrência, atualizar dados antes de tentar novamente.

## Persistência e implantação

Cloudflare: binding D1 `RESEARCH_DB`; aplicar `scripts/research-portal-schema.sql`. Sem binding em produção, falha 503; nunca troca para disco silenciosamente. O binding deve ser privado e compartilhado pelas instâncias. Eventos persistem rubricVersion e fingerprint da amostra/documentos/rubrica; mudanças no corpus bloqueiam a campanha existente. No desenvolvimento local usa `.research-portal-local/events.jsonl`, com trava exclusiva e fsync; excluir este diretório do Git e proteger seus backups. Uma trava residual após interrupção abrupta deve ser removida pelo operador somente após verificar que não há gravação em andamento.

As letras ficam na tabela D1 `research_portal_lyrics`, fora do bundle do Worker. Após criar o schema, importar o SQL privado gerado em `.wrangler/research-portal-lyrics.sql` no mesmo binding (local e remoto conforme o destino). Não publicar nem versionar esse SQL. O dataset empacotado mantém `lyrics:null`, documento/hash e, opcionalmente, `lyricAvailable:true`; esta indicação não substitui a consulta real. Somente o detalhe selecionado consulta texto por documento + hash com `rights_status='RESEARCH_AUTHORIZED'`. Listagens nunca recuperam todas as letras. Salvamento com escores exige texto efetivamente recuperado; ausência de texto retorna erro e permite registrar ausência ou abstenção. Desenvolvimento sem D1 não substitui letras por arquivos locais: com o dataset sem textos, exibe ausência.

Identificação é autodeclarada e vinculada ao slot no primeiro parecer, não autenticação. Conforme decisão do responsável, o portal opera sem autenticação, em regime de confiança, fora do menu público. O link não impõe exclusividade técnica; slots não são contas autenticadas. O embargo global impede descobrir a previsão da amostra via exploração antes dos encerramentos, mas não apaga exposição anterior fora da plataforma.

O schema exporta revisões e divergências (última revisão de cada avaliadora); comparação ordinal só usa campos numéricos disponíveis no AI. Métricas de acurácia e adjudicação final não são inferidas automaticamente.

Validação: `npx tsx --test tests/research-portal.test.ts` (ou o runner TS já instalado no site). Testes cobrem contratos públicos de cegamento, embargo cruzado, encerramento, não conversão de ausências em zero, separação de avaliadoras e congelamento documental.

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

### Filtros e ordenação da lista

`market` seleciona circulação em qualquer mercado da gravação; não indica nacionalidade. `displayMarket` informa o mercado selecionado, preservando `market` original e `markets` completo. Os filtros de território, ano, idioma, gênero e busca são combinados por interseção. `sort=sample` preserva a amostra; `sort=market` ordena por mercado exibido, título e ID; `sort=title` por título e ID. A ordenação antecede a paginação, cuja página é limitada ao intervalo existente. Nenhuma dessas consultas grava pareceres ou altera o corpus congelado.
