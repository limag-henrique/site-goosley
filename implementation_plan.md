# Plano de Raspagem Completa e Análise do wearemotto.com

O objetivo desta tarefa foi expandido: realizar uma raspagem **profunda e completa de todas as páginas** do site `https://wearemotto.com/` para identificar todas as tecnologias, animações, gráficos, experiência UX/UI, e a **álgebra booleana** (estados lógicos, variáveis de controle de interface, e sinalizadores CSS/JS) utilizados na sua construção.

## Proposta de Solução

Para varrer o site por completo sem ser bloqueado, vamos aprimorar o script de automação (`scraper.py`) utilizando **Playwright**.

### Ferramentas a serem utilizadas:
- **Python** com **Playwright** (Chromium já instalado) para renderização real.
- **Extração de Estados (Álgebra Booleana)**: Buscar ativamente por atributos como `data-state`, `aria-expanded`, variáveis `window` de escopo lógico, e flags de animação (`is-active`, `is-animating`, etc.).

### Passos de Execução:
1. **Rastreador (Crawler) Multi-página**:
   - O script começará na home page, extrairá todos os links internos (`<a href="/...">`) que pertencem ao domínio `wearemotto.com`.
   - Navegará para cada página encontrada e executará o script de extração profunda.
2. **Coleta de Dados em Cada Página**:
   - **Frameworks e Tecnologias**: Identificação de bibliotecas (Tailwind, GSAP, Lenis, WP, etc.).
   - **Animações e UI/UX**: Captura de instâncias de scroll, parallax, modais e transições.
   - **Álgebra Booleana e Lógica**: Extrair variáveis globais (`window.*`), arrays de estado, atributos condicionais no DOM (ex: `aria-*`, `data-*`) que controlam a UI.
   - **Gráficos e Mídia**: Identificar `<canvas>`, `<svg>`, vídeos, texturas.
3. **Agregação e Exportação**:
   - Os dados de todas as páginas serão consolidados em um único arquivo de saída robusto (`motto_tech_stack_full.json`).
4. **Relatório Final**:
   - O documento `motto_analysis.md` será atualizado com um mapeamento da arquitetura do site, os fluxos lógicos encontrados, e como replicar essas experiências em novos projetos.

## User Review Required

> [!IMPORTANT]
> Raspar **todas** as páginas de um site moderno pode demorar consideravelmente (vários minutos dependendo da quantidade de projetos no portfólio/artigos no blog).
> **Preciso da sua aprovação para rodar este rastreador completo.**

## Open Questions

- Você prefere que eu limite a raspagem a um número máximo de páginas (por exemplo, 20-30 páginas representativas: Home, Sobre, Portfolio, etc.) para acelerar o processo, ou devo varrer literalmente todas as páginas possíveis, sem limite?
- A raspagem pode ser iniciada imediatamente após sua confirmação.

## Proposed Changes

### Scripts de Raspagem

#### [MODIFY] [scraper.py](file:///c:/Users/Henrique%20Lima/Desktop/Reposit%C3%B3rios/site-goosley/scraper.py)
Reescrever o script para incluir um `crawler` que descubra páginas, controle a fila de visitas e execute a injeção JS avançada para "álgebra booleana".

## Verification Plan

### Testes Automatizados
- O crawler imprimirá no terminal cada página visitada para que possamos monitorar o progresso em tempo real.
- Verificar se `motto_tech_stack_full.json` contém arrays de dados segmentados por URL.
