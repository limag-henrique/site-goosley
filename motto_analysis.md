# 🕵️‍♂️ Engenharia Reversa: wearemotto.com

Após realizar uma raspagem detalhada (bypassando o bloqueio 403/Cloudflare com automação via Playwright) e analisar o comportamento da página, o DOM, assets globais, classes CSS e métricas gráficas, aqui está a "receita" de tudo o que é utilizado no site para que você possa implementar em seus próprios projetos.

---

## 🛠️ Stack Tecnológica Base

### 1. Sistema de Gerenciamento (CMS)
- **WordPress:** O site roda utilizando o WordPress como backend. Isso é evidenciado pelos caminhos de assets `/wp-content/` e plugins listados na arquitetura (`gravityforms`, `duracelltomi-google-tag-manager`, `akismet`).
- **Tema Customizado (`wp-theme-motto`):** Eles não utilizam um tema genérico comprado (como Avada ou Divi), mas sim um tema desenvolvido do zero especificamente para a agência.

### 2. Estilização & Framework Front-end
- **Tailwind CSS:** Foi fortemente detectado pelo padrão de classes utilitárias no código (ex: `inset-0`, `z-[9999]`, `w-full`, `object-contain`, `text-40`, etc). 
  - *Como implementar:* Adicione TailwindCSS ao seu projeto (via NPM ou CDN no caso de protótipos rápidos) para obter essa estrutura utilitária flexível de UI.

### 3. Bibliotecas Utilitárias
- **jQuery (v3.7.1):** Devido à natureza do WordPress e seus plugins (como o Gravity Forms), o jQuery continua sendo carregado e utilizado em escopo.

---

## 🎭 Animações & Experiência (UI/UX)

O site possui um design premium, com rolagem suave e revelações tipográficas. As animações **não são baseadas em WebGL ou Canvas 3D** (não foram detectados `<canvas>`, Spline ou Lottie). Em vez disso, focam em manipulação avançada de DOM.

### 1. Smooth Scrolling (Rolagem Suave)
- **Lenis Scroll:** Encontramos a classe `lenis` instanciada na página. Lenis (do Studio Freight) é a biblioteca moderna mais popular atualmente para `smooth scroll`. Ela é extremamente leve, fluída e não sequestra a rolagem (scroll-jacking) de forma agressiva.
  - *Como implementar:* Instale via NPM `npm i @studio-freight/lenis`. Configure a instância do requestAnimationFrame atrelando as atualizações de rolagem a ele.

### 2. Álgebra Booleana: Controle Lógico e Estados da UI
A experiência do site é guiada por uma complexa "álgebra booleana", ou seja, gerenciamento de estados binários (ligado/desligado, ativo/inativo, visível/oculto) que engatilham animações em CSS ou manipulam componentes no JS. Durante a raspagem, extraímos os seguintes pilares lógicos:

#### A. Flags de Classe de Estado (`is-`/`js-`)
- **Máscaras e Transições:** Utilizam `js-mask-active`, `js-mask-spin`, `js-mask-flag` e `js-toggle-active` para alternar entre os estados de transição de tela. A presença da classe `is-loaded` indica a liberação do preloader.
- **Interações de Navegação:** Identificamos as booleanas `js-if-menu-open` e `js-mdd-toggle` que representam os estados de "Menu Aberto" e "Dropdown Ativo".
- **Comportamento Híbrido:** Classes como `js-mouse-follow-inner` sinalizam um estado True/False para quando o cursor personalizado deve entrar em ação sobre elementos interativos.

#### B. Atributos Condicionais (Data e Aria States)
- Farto uso de `aria-hidden="true"` (mais de 18 instâncias encontradas na home) atrelado a elementos puramente estéticos (como ícones de SVG e linhas de layout `js-t-lines`) que não devem ser lidos por screen readers.
- Atributos lógicos de analytics/tracking (`data-hs-ignore="true"`, `data-cfasync="false"`).

#### C. Variáveis Globais (Window)
- Identificadas flags de inicialização lógicas como `PIXELS_RAN = true`, `_hstc_loaded = true` para garantir que as integrações de marketing e rastreamento não inicializem de forma duplicada durante as transições de página fluídas (Single Page App feel).

---

## 🖼️ Gráficos, Mídia & Performance

A ausência de WebGL foca toda a performance no carregamento inteligente de mídias e no controle de raster/vetores:

- **SVG em Massa:** Detectamos a injeção de múltiplos arquivos SVG inline (ícones, logos, assets de UI). Isso mantém os elementos visuais vetoriais com máxima nitidez independente da tela, sem depender de webfonts.
- **Vídeos Nativos (HTML5 Video):** Para elementos dinâmicos, eles rodam múltiplos vídeos curtos (foram contados cerca de 8 vídeos estáticos ao longo do site) servindo de fundos mutáveis ou elementos gráficos pesados. 
- **Sem Iframes pesados para UI:** Os iframes presentes são puramente para rastreamento invisível/pixels.

### 📈 Rastreamento e Analytics Encontrados
- **Google Tag Manager & Google Ads** (GTM4WP).
- **Hotjar** (Mapas de calor e gravação de seção para UX analytics).
- **HubSpot** (Pixels de anúncios e formulários coletados).
- **Meta Pixel** (Facebook Events).

---

## 🚀 Como Implementar no Seu Site (Guia Rápido)

Para criar um clone ou replicar o "feeling" de `wearemotto.com`, siga esta arquitetura:

1. **Setup Inicial:** Crie um app com **Next.js** ou **Vite + React**.
2. **Estilização:** Configure o **Tailwind CSS**. Defina sua paleta estrita de cores neutras e contrastes no `tailwind.config.js`.
3. **Gerenciamento de Estado (Álgebra Booleana):** 
   - Ao invés de manipular o DOM diretamente como o jQuery faz no Motto, use `useState` no React para controlar as flags lógicas (`isMenuOpen`, `isLoaded`, `maskActive`).
   - Amarre esses estados para injetar classes condicionais, por exemplo: `className={isLoaded ? 'is-loaded' : ''}`.
4. **Scroll Suave:** Implemente o `Lenis`:
   ```javascript
   import Lenis from '@studio-freight/lenis'
   const lenis = new Lenis()
   function raf(time) {
     lenis.raf(time)
     requestAnimationFrame(raf)
   }
   requestAnimationFrame(raf)
   ```
5. **Animações ao Rolar e Máscaras:** Utilize `GSAP + ScrollTrigger`.
   ```javascript
   gsap.to(".js-mask-flag", {
      scrollTrigger: {
         trigger: ".js-mask",
         scrub: true
      },
      y: 100,
      opacity: 1
   });
   ```
6. **Backgrounds em Vídeo:** Substitua GIFs ou Animações pesadas por tags `<video autoplay loop muted playsinline>` em formatos eficientes (WebM / mp4 com alta compressão).

> [!TIP]
> O segredo do *Motto* não é a tecnologia complexa, mas sim o **design extremo, foco em tipografia gigantesca, uso inteligente de estados booleanos manipulando classes (`is-active`), e rolagem macia (Lenis) manipulada via JS!**
