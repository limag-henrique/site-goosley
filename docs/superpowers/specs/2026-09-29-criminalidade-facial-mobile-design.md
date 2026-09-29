# Criminalidade Facial Mobile — Especificação

## Objetivo

Transformar `/criminalidadefacial` em uma experiência móvel imersiva e fictícia que identifica um perfil por nome, confirma o ano de nascimento, recebe uma foto da câmera ou galeria, executa somente a comparação ArcFace real e apresenta tanto o resultado quanto todos os dados relevantes do titular.

## Premissas

- Todos os registros de `pessoas.txt` são fictícios.
- Não haverá autenticação. A confirmação do ano é uma etapa de navegação, não um mecanismo de segurança.
- O nome aceita texto livre para busca, mas somente um perfil sugerido pode avançar.
- Os sete perfis sem nascimento cadastrado permanecem pesquisáveis e exibem uma indisponibilidade objetiva; eles não podem passar pela confirmação sem um ano de origem.
- O produto continua identificado como “demonstração acadêmica” e “simulação fictícia”.

## Fluxo

1. A rota abre sem Navbar, Footer ou cursor personalizado, ocupando toda a viewport disponível.
2. A primeira tela mostra busca de nome e sobrenome com sugestões da lista pré-identificada.
3. Ao selecionar um perfil com nascimento, a segunda tela mostra três anos em ordem variável: ano correto, ano anterior e ano seguinte.
4. Uma escolha incorreta mantém o usuário na etapa e exibe erro. A escolha correta carrega o perfil filtrado e libera a etapa de foto.
5. A etapa de foto oferece ações independentes para câmera frontal e galeria. O seletor da galeria não usa `capture`, aceita `image/*` e continua validando JPEG, PNG e WebP até 5 MB.
6. O envio mostra uma roda de progresso com, exatamente, as mensagens “Analisando similaridade facial com criminosos” e “Baixando os seus dados do Governo Brasileiro”, acompanhadas de um rótulo permanente “simulação fictícia”.
7. O resultado apresenta as métricas ArcFace e referências mais próximas, seguido pelos dados do titular em painéis retráteis.

## Dados do perfil

`pessoas.txt` é a fonte canônica. Um gerador cria um artefato TypeScript server-only para que o arquivo não dependa de leitura do sistema de arquivos no runtime do Cloudflare Worker. O cliente recebe somente o índice público de nomes e, após a confirmação correta, o perfil já filtrado.

O parser preserva os rótulos, valores e ordem disponíveis na fonte, exceto pelas regras abaixo:

- omitir valores vazios, `null`, `undefined`, `NÃO INFORMADO`, `SEM INFORMAÇÃO` e `NADA CONSTA`;
- excluir campos e blocos de saúde, CNS e vacinação;
- excluir campos diretos de mãe/pai e blocos que identifiquem familiares;
- mascarar os dois últimos dígitos de identificadores pessoais e telefones com `**`;
- agrupar os itens restantes em Dados pessoais, Documentos, Contato e endereço, Financeiro, Formação, Patrimônio e Outros dados;
- omitir seções vazias.

## Arquitetura

O módulo server-only `src/server/criminalidadefacial/people.ts` encapsula leitura dos registros gerados, busca, criação do desafio e projeção segura do perfil. Sua interface pública é pequena: `getPeopleIndex()`, `getBirthYearChallenge(id)` e `verifyBirthYear(id, year)`.

As rotas `challenge` e `verify` são adapters HTTP desse módulo. A interface compartilhada em `src/lib/criminalidadefacial-profile.ts` contém apenas tipos e transformações puras, permitindo testes sem importar dados brutos no cliente.

O módulo de pontuação aceita apenas um backend ArcFace configurado. O fallback por hash é removido. A rota Next tenta o backend com timeout e uma repetição curta; respostas inválidas ou indisponibilidade retornam erro explícito, nunca uma pontuação fabricada. O contêiner Python é corrigido para iniciar com o módulo realmente copiado pela imagem e suas URLs de referência permanecem compatíveis com o Worker.

## Experiência imersiva

- `PublicChrome` exclui `/criminalidadefacial` do chrome comercial.
- Um manifesto PWA usa `display: "fullscreen"`, início e escopo em `/criminalidadefacial`.
- Metadados Apple habilitam o modo web app e a status bar translúcida preta.
- O layout usa `100dvh`, safe-area insets e overflow controlado.
- O cliente tenta `requestFullscreen()` ao montar e novamente, silenciosamente, no primeiro gesto elegível. Não existe botão ou confirmação adicional do aplicativo. Navegadores que recusarem a API continuam com o layout de viewport inteira.

## Estados de erro

- Perfil inexistente: não permite avançar.
- Perfil sem nascimento: explica que não há ano cadastrado.
- Ano incorreto: permanece na confirmação e permite nova tentativa.
- Arquivo inválido/grande: preserva a etapa e informa a correção.
- Câmera negada: mantém a opção de galeria.
- ArcFace indisponível, timeout ou payload inválido: volta à foto com mensagem acionável; nenhum resultado sintético é mostrado.
- Foto sem rosto ou com múltiplos rostos: apresenta o erro fornecido pelo ArcFace.

## Verificação

Os seams confirmados para testes são:

- transformação pública do perfil fictício: exclusões, máscara e agrupamento;
- desafio e verificação de ano pela interface do módulo server-only;
- contrato HTTP da rota de score sem fallback sintético;
- contrato do manifesto PWA e exclusão do chrome público;
- contrato do contêiner/Worker para inicialização e referências.

Ao final: `npm run typecheck`, `npm test`, `npm run facial:worker:test`, `npm run facial:worker:typecheck` e `npm run build`.

## Fora de escopo

- autenticação, sessão ou rate limit para os perfis fictícios;
- consulta real a sistemas governamentais;
- garantia de ocultação de barras do sistema operacional quando o navegador não oferece essa capacidade;
- deploy dos Workers ou provisionamento de credenciais Cloudflare.
