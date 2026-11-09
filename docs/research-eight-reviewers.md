# Pesquisa musical — inclusão de Elaine Vilela

Escopo confirmado em 08/11/2026: adicionar Elaine Vilela como avaliadora de ID 8. O usuário autorizou que ela avalie músicas já atribuídas a outras pessoas.

Elaine recebe uma cópia do percurso da Grazi: 20 músicas iniciais, com os sete países e os mesmos exemplos de intensidade, e a mesma reserva para lotes adicionais. Compartilhar músicas não compartilha pareceres, progresso, encerramento ou chave privada. Os sete percursos existentes permanecem integrais.

O manifesto de sete participantes fica congelado em `src/data/research-selection-seven.json`. O gerador de oito participantes parte desse arquivo e aceita somente seu fingerprint exato na transição. A lista de autores preservados é vinculada a esse fingerprint; a restrição das seleções anteriores continua válida. Nenhum evento, letra, escore histórico ou credencial é reescrito.

O catálogo de exploração apresenta cada música uma única vez, mesmo quando há mais de uma atribuição. Pareceres e exportações permanecem separados por avaliador. A comparação com a IA não passa a calcular concordância entre pessoas por causa do compartilhamento.

Manifesto ativo: `research-shared-8-v1`, reproduzível com `python scripts/extend-research-selection-eight.py`. Elaine tem 156 músicas na reserva, sendo 20 carregadas inicialmente. São 1.455 atribuições e 1.299 gravações distintas; a inclusão não exige músicas novas, alteração de letras ou migração do esquema D1.

Validação pelo serviço público `PortalService`, já usado pelos testes: inclusão no ranking, leitura de 20 músicas, sobreposição autorizada, persistência independente de pareceres e expansões, isolamento das chaves, preservação do histórico e bloqueio de alterações não reconhecidas no manifesto. Conferir também TypeScript, suíte geral, build e atualização local do Graphify. Sem commit, troca de branch ou publicação.

Validação concluída: 31 testes musicais aprovados; `npm run typecheck` e `npm run build` aprovados. O HTML gerado contém oito opções no seletor, incluindo Elaine Vilela (8). Snapshot anterior conferido contra o original e gerador reproduzível por hash. Suíte geral: 63 aprovados e as mesmas seis falhas nas APIs faciais desativadas (HTTP 410). Graphify atualizado localmente. Fluxo principal: `grill-with-docs`; especificação local registra a decisão de compartilhar músicas, e `tdd` cobre a independência dos percursos. Critérios de aceite atendidos.
