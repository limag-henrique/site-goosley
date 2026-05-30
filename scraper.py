import json
import time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE_URL = "https://wearemotto.com"
START_URL = "https://wearemotto.com/"
OUTPUT_FILE = "motto_tech_stack_full.json"

visited_urls = set()
urls_to_visit = [START_URL]
scraped_data = {}

def normalize_url(url):
    parsed = urlparse(url)
    # Ignorar queries e fragments para evitar loops infinitos em mesma pagina
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

def is_internal(url):
    return url.startswith(BASE_URL) and "wp-content" not in url and "wp-json" not in url

def run_scraper(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport={"width": 1920, "height": 1080}
    )
    page = context.new_page()
    
    print(f"Iniciando raspagem profunda a partir de {START_URL}...")
    
    while urls_to_visit:
        current_url = urls_to_visit.pop(0)
        norm_url = normalize_url(current_url)
        
        if norm_url in visited_urls:
            continue
            
        print(f"[{len(visited_urls)+1}] Raspando: {norm_url}")
        visited_urls.add(norm_url)
        
        try:
            # networkidle pode travar se houver tracking continuo (ex: Hotjar). Usar domcontentloaded + sleep é mais robusto.
            page.goto(norm_url, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            print(f"Erro ao acessar {norm_url}: {e}")
            continue

        # Esperar 3 segundos para scripts e animações serem inicializados
        time.sleep(3)

        # Extrair links internos
        links = page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a[href]')).map(a => a.href);
        }''')
        
        for link in links:
            n_link = normalize_url(link)
            if is_internal(n_link) and n_link not in visited_urls and n_link not in [normalize_url(u) for u in urls_to_visit]:
                urls_to_visit.append(n_link)
        
        # Injeção JS para extrair informações avançadas e álgebra booleana (estados lógicos)
        page_data = page.evaluate('''() => {
            const info = {
                frameworks: [],
                animations: [],
                graphics: {
                    canvas_count: document.querySelectorAll('canvas').length,
                    svg_count: document.querySelectorAll('svg').length,
                    video_count: document.querySelectorAll('video').length,
                    lottie_count: document.querySelectorAll('lottie-player, dotlottie-player').length,
                    spline_count: document.querySelectorAll('spline-viewer').length
                },
                boolean_algebra: {
                    aria_states: {},
                    data_states: {},
                    active_classes: [],
                    window_flags: []
                },
                meta_tags: {}
            };

            // Frameworks
            if (window.__NEXT_DATA__) info.frameworks.push("Next.js");
            if (window.React || document.querySelector('[data-reactroot]')) info.frameworks.push("React");
            if (window.Vue || window.__NUXT__) info.frameworks.push("Vue.js / Nuxt");
            if (window.jQuery) info.frameworks.push("jQuery");
            if (document.querySelector('#wpadminbar') || document.querySelector('link[href*="wp-content"]')) info.frameworks.push("WordPress");

            // Animacoes
            if (window.gsap) info.animations.push("GSAP");
            if (window.ScrollTrigger) info.animations.push("GSAP ScrollTrigger");
            if (window.Lenis) info.animations.push("Lenis");
            if (document.querySelector('[class*="framer-motion"]')) info.animations.push("Framer Motion");

            // Extração de Álgebra Booleana e Estados
            
            // 1. Aria States (ex: aria-expanded, aria-hidden)
            document.querySelectorAll('[aria-expanded], [aria-hidden], [aria-pressed]').forEach(el => {
                const attrs = el.attributes;
                for (let i=0; i<attrs.length; i++) {
                    if (attrs[i].name.startsWith('aria-')) {
                        info.boolean_algebra.aria_states[attrs[i].name] = info.boolean_algebra.aria_states[attrs[i].name] ? info.boolean_algebra.aria_states[attrs[i].name] + 1 : 1;
                    }
                }
            });

            // 2. Data States (ex: data-active, data-state)
            document.querySelectorAll('*').forEach(el => {
                const attrs = el.attributes;
                for (let i=0; i<attrs.length; i++) {
                    if (attrs[i].name.startsWith('data-') && ['true','false','active','inactive','open','closed'].includes(attrs[i].value)) {
                        info.boolean_algebra.data_states[attrs[i].name] = attrs[i].value;
                    }
                }
                // Classes de estado (is-active, is-animating, etc)
                el.classList.forEach(cls => {
                    if (cls.startsWith('is-') || cls.startsWith('js-') || cls.includes('active')) {
                        if (!info.boolean_algebra.active_classes.includes(cls)) {
                            info.boolean_algebra.active_classes.push(cls);
                        }
                    }
                });
            });

            // 3. Variáveis Booleanas na Window
            for (let key in window) {
                try {
                    if (typeof window[key] === 'boolean') {
                        info.boolean_algebra.window_flags.push({key: key, value: window[key]});
                    }
                } catch(e) {}
            }

            // Metas
            document.querySelectorAll('meta[name], meta[property]').forEach(meta => {
                const name = meta.getAttribute('name') || meta.getAttribute('property');
                if (name) {
                    info.meta_tags[name] = meta.getAttribute('content');
                }
            });

            return info;
        }''')
        
        scraped_data[norm_url] = page_data
        
        # Salvar incrementalmente para não perder dados se o script falhar
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump({"total_pages_scraped": len(visited_urls), "pages": scraped_data}, f, indent=4, ensure_ascii=False)
            
    browser.close()
    print("Raspagem completa!")

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run_scraper(playwright)
