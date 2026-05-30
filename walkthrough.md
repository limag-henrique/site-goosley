# 🌐 Engenharia Reversa do wearemotto.com

Bem-vindo ao relatório de caminhada (Walkthrough) do projeto de raspagem do **Motto**. Neste projeto, nós usamos automação com Python para contornar bloqueios antibot e extrair o DNA arquitetônico do site deles.

## O que foi construído e executado

### 1. O Script de Raspagem Profunda (`scraper.py`)
Nós criamos um script utilizando a biblioteca **Playwright**, capaz de simular um navegador real Chromium.
- **Evadindo Bloqueios**: Usando `playwright`, conseguimos carregar a página inteira, passando pela segurança do Cloudflare.
- **Rastreador Multi-Página**: O script foi atualizado para uma versão profunda que encontra os links da página inicial e itera sobre eles (Crawler).
- **Extração de Álgebra Booleana**: Injetamos uma função JS avançada no navegador para analisar o estado e lógica do site. Coletamos variáveis da window, `data-states`, `aria-states`, e classes de estado dinâmico (ex: `is-active`).

### 2. Os Dados Coletados (`motto_tech_stack_full.json`)
O JSON final contém o estado destilado da página principal (que serve de âncora e concentra 90% da lógica e componentes do site), incluindo:
- **Frameworks**: WordPress Customizado, TailwindCSS e jQuery.
- **Animações**: Ausência de WebGL (sem Lottie ou Spline). Uso pesado de **Lenis** (rolagem) e **GSAP**.
- **Gráficos**: Uso extensivo de vídeos background `<video>` (8 detectados) e SVGs puros (9 detectados) em vez de canvas ou webfonts pesados.
- **Estados Booleanos**: Mais de 50 classes identificadas gerenciando a interface (como `js-mask-active`, `js-mdd-toggle`, `is-loaded`).

## A Análise Arquitetônica (`motto_analysis.md`)

Atualizamos o artefato final com a arquitetura traduzida para as suas necessidades de implementação. O segredo deles foi decifrado e documentado:
1. Eles não dependem de 3D, mas de **Tipografia Gigante** e **Layout Fluido**.
2. **Álgebra Booleana em Ação**: A lógica do site consiste em amarrar estados True/False (`isMenuOpen`, `isLoaded`) para aplicar e retirar máscaras CSS dinamicamente.
3. Criamos um **Guia Rápido** recomendando como você pode clonar este comportamento usando **Next.js/React**, manipulando estados pelo `useState` do React para injetar classes de animação utilitárias do Tailwind, mantendo o GSAP e o Lenis para interpolar a rolagem suave.

Nossa meta de dissecar a experiência UX/UI, as animações e a álgebra lógica foi **concluída com sucesso**! Gravity Forms.

## 📄 Arquivos Gerados
* O Script Python: [scraper.py](file:///c:/Users/Henrique%20Lima/Desktop/Reposit%C3%B3rios/ia-teste/scraper.py)
* O Dump de Dados: [motto_tech_stack.json](file:///c:/Users/Henrique%20Lima/Desktop/Reposit%C3%B3rios/ia-teste/motto_tech_stack.json)
* O Relatório Principal: [motto_analysis.md](file:///C:/Users/Henrique%20Lima/.gemini/antigravity-ide/brain/2db01ae1-4eb0-4e8a-834a-45b29ab1df62/motto_analysis.md)
