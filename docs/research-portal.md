> Atualização: o piloto de 12 gravações e a consulta opcional à IA são definidos em [research-pilot.md](research-pilot.md). O embargo global descrito abaixo é histórico e não se aplica à consulta opcional após salvar. Pareceres salvos são compartilhados antes do encerramento.

# Portal de pesquisa musical

Escopo confirmado: rota `/pesquisa-musical`, fora da navegação comercial e do sitemap,
sem autenticação, com identificação declarada das pesquisadoras. Link direto não
constitui controle de acesso. Não alterar branch nem criar commits.

## Percurso e linguagem visual

Reutilizar Next.js e identidade escura do Goosley, tipografia Inter, contraste alto,
acento laranja e cartões discretos. Sem cursor personalizado dentro do portal.
Navegação explícita: Exploração, Avaliação cega, Método e Comparação.
Em telas pequenas, filtros e formulário passam a uma coluna. Foco visível,
campos rotulados, mensagens de estado e nenhum movimento obrigatório.

Exploração: resultados congelados por dimensão/mercado/ano, numerador e denominador,
fontes e cobertura, contexto e ficha com identidade documental e proveniência.
Avaliação: escolher vaga 1/2 e nome declarado; ler a mesma letra autorizada/hash,
confirmar idioma e identidade, preencher 26 dimensões ou registrar ocorrência,
justificar e salvar. Encerrar apenas depois de avaliar todos os itens.
Comparação: liberar somente depois de ambas as etapas independentes encerradas;
diferenças não constituem adjudicação nem padrão-ouro automático.

## Fronteiras e aceite

API é a fronteira de validação. Testar remoção de previsões em respostas cegas,
inclusive erros/filtros/exports; preservação de ausência versus zero; avaliações
por vaga, persistência, revisão e fechamento; bloqueio de comparação antecipada.
Validar typecheck, testes do repositório, build e navegação renderizada.
Não fazer chamadas de classificação nem reprocessar letras com IA.

Dados: amostra provisória existente e agregados do artigo; períodos recentes só
entram quando existirem no snapshot exportado. Não fabricar anos, idiomas,
parâmetros históricos ou métricas de validação. Texto e previsões permanecem em
dados do servidor, nunca em `public/` ou em importações do componente cliente.

Persistência remota: Cloudflare D1, sem confiar em memória de Worker ou navegador.
Preparar migração e documentação operacional. Publicação depende da configuração
do binding no ambiente remoto; código local não comprova publicação.
