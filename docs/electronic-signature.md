# Consulta de declaração

## Escopo acordado

- `/assinatura-eletronica`: formulário de consulta por chave.
- `/assinatura-eletronica/[chave]`: declaração correspondente; o logo fornecido leva ao formulário.
- Conteúdo e uso do logo autorizados pelo solicitante. Consulta ao registro cadastrado, sem implementação de certificação ou verificação criptográfica de assinatura.
- Endereços não listados na navegação ou sitemap, com indexação e cache desativados. O link permite acesso sem autenticação, conforme autorizado.
- Dados do documento permanecem em módulo do servidor; o formulário não recebe uma lista de registros nem a chave correta.
- Interface documental simples, fundo externo escuro e superfície branca para legibilidade do documento e do logo, sem animações.
- Cabeçalho padrão compartilhado entre consulta, declaração e documento não encontrado: logo CASU UFMG navegável, identificação da rede e endereço em HTML, e título “LAUDO MÉDICO” em caixa com borda. Três colunas em desktop e impressão; blocos empilhados em celular.
- A declaração apresenta as datas de emissão e expiração fornecidas pelo solicitante junto aos dados de assinatura. Esses dados não aparecem no formulário de consulta.

## Critérios de aceitação e verificação

- A chave cadastrada apresenta o texto fornecido, com os destaques, CIDs, emitente e chave.
- Entrada vazia ou malformada recebe orientação; chave desconhecida não revela dados e permite nova consulta.
- Logo navegável por teclado, formulário com rótulo visível, foco e estado de envio, layout legível em celular.
- Testes na consulta de registros e no limite existente de apresentação sem menu comercial; verificar o fluxo em execução, metadados e cabeçalhos HTTP.
- Executar typecheck, suíte do projeto e build OpenNext; atualizar Graphify localmente.

## Fora do escopo

Emissão de documentos, edição de declarações, verificação de certificados, autenticação e alterações nas demais experiências do site.

## Validação realizada

- Typecheck, ESLint dos arquivos alterados e build OpenNext: aprovados.
- Testes da consulta: 3/3 aprovados, com falhas observadas antes da implementação das respectivas funcionalidades.
- Suíte completa: 59/65 aprovados. As seis falhas são nas APIs de referência e perfil facial, que retornam 410 devido à desativação programada já existente em 29/09/2026; esses módulos não foram alterados.
- Servidor de produção local: formulário e chave correta retornam 200; chave desconhecida retorna 404, sem dados pessoais. As três respostas têm noindex, no-store e no-referrer.
- Navegador: entrada vazia, chave desconhecida, consulta com Enter e retorno pelo logo verificados. Largura de 390 px sem transbordamento horizontal; logo carregado.
- Nome e CPF ausentes dos arquivos JavaScript, HTML e JSON públicos do build. Dados somente na resposta do documento solicitado.
- Cabeçalho comparado à referência em desktop e celular (390 px), sem transbordamento horizontal. Logo preservado como imagem; identificação, endereço e título renderizados em HTML.
- Emissão e expiração conferidas no documento publicado, com ausência dessas datas na consulta. Build final OpenNext aprovado; atualização publicada no Worker `goosley-web`, versão `85890957-73f5-4956-9e86-bd85c3902a20`.
- Graphify atualizado localmente. Trabalho realizado na branch existente, sem criação de commit.
