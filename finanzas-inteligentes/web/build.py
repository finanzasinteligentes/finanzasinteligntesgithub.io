#!/usr/bin/env python3
import re, sys, os, shutil
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, Undefined

BASE_DIR = Path(__file__).parent
SRC_DIR = BASE_DIR / "_src"
PAGES_DIR = SRC_DIR / "pages"

SITE = {
    # Root pages
    "index.html": {
        "title": "Finanzas Inteligentes - Tu Guía Financiera en Colombia y Latinoamérica 2026",
        "description": "Finanzas Inteligentes: guía completa de criptomonedas, forex, opciones binarias, índices sintéticos, trading automático con IA y finanzas personales para Colombia y Latinoamérica. Aprende a invertir, ahorrar y generar ingresos online con contenido verificado desde principiante a avanzado.",
        "keywords": "finanzas inteligentes, educación financiera Colombia, criptomonedas, forex, opciones binarias, índices sintéticos, trading automático, trading con IA, materias primas, inversión, ahorro, Colombia, Latinoamérica, ingresos extra, dinero online, brokers regulados, plataformas trading, guías financieras",
        "canonical": "/", "active": "inicio", "p": "",
        "og_image": "https://finanzasinteligentes.org/images/hero-bg.jpg"
    },
    "about.html": {
        "title": "Sobre Nosotros - Finanzas Inteligentes | Educación Financiera en Colombia",
        "description": "Conoce al equipo de Finanzas Inteligentes. Nuestra misión es democratizar la educación financiera en Colombia y Latinoamérica con contenido claro y útil sobre criptomonedas, forex, ahorro e inversión.",
        "keywords": "Finanzas Inteligentes, nosotros, equipo, educación financiera Colombia, Latinoamérica, misión, visión, valores financieros",
        "canonical": "/about.html", "active": "about", "p": "."
    },
    "contacto.html": {
        "title": "Contacto - Finanzas Inteligentes | Soporte y Consultas",
        "description": "Contáctanos en Finanzas Inteligentes. Resolvemos tus dudas sobre criptomonedas, forex, trading automático, ahorro e inversión en Colombia y Latinoamérica.",
        "keywords": "contacto Finanzas Inteligentes, soporte financiero, dudas trading, consultas inversión Colombia, atención al usuario",
        "canonical": "/contacto.html", "active": "contacto", "p": "."
    },
    "deportes.html": {
        "title": "Apuestas Deportivas en Colombia 2026 - Guía y Casas de Apuesta",
        "description": "Guía completa de apuestas deportivas en Colombia. Casas de apuesta legales, cuotas en vivo para fútbol, NBA, tenis y UFC. Estrategias, bonos y pronósticos para apostar con responsabilidad.",
        "keywords": "apuestas deportivas Colombia, casas de apuesta legales Colombia, apuestas fútbol, NBA apuestas, tenis apuestas, UFC apuestas, cuotas en vivo, bonos bienvenida",
        "canonical": "/deportes.html", "active": "deportes", "p": "."
    },
    "trading-automatico.html": {
        "title": "Trading Automático con IA: Guía Completa 2026 - Finanzas Inteligentes",
        "description": "Guía definitiva de trading automático y algorítmico con IA. Aprende a crear bots de trading en Python, estrategias automatizadas para MetaTrader, 3Commas, Binance. Grid trading, DCA, machine learning para forex, cripto e índices sintéticos.",
        "keywords": "trading automático, bots de trading, trading algorítmico, MetaTrader, 3Commas, Python trading, IA trading, machine learning trading, grid trading, DCA bot, trading bot Binance",
        "canonical": "/trading-automatico.html", "active": "trading", "p": "."
    },
    "privacidad.html": {
        "title": "Política de Privacidad - Finanzas Inteligentes",
        "description": "Política de privacidad de Finanzas Inteligentes. Conoce cómo protegemos tus datos.",
        "canonical": "/privacidad.html", "active": "", "p": ".",
        "og_title": "Política de Privacidad - Finanzas Inteligentes",
        "og_description": "Conoce cómo protegemos tus datos personales en Finanzas Inteligentes."
    },
    "cookies.html": {
        "title": "Política de Cookies - Finanzas Inteligentes",
        "description": "Política de cookies de Finanzas Inteligentes. Gestiona tus preferencias.",
        "canonical": "/cookies.html", "active": "", "p": ".",
        "og_title": "Política de Cookies - Finanzas Inteligentes",
        "og_description": "Conoce cómo utilizamos las cookies en Finanzas Inteligentes y gestiona tus preferencias."
    },
    "terminos.html": {
        "title": "Términos y Condiciones - Finanzas Inteligentes",
        "description": "Términos y condiciones de uso de Finanzas Inteligentes.",
        "canonical": "/terminos.html", "active": "", "p": ".",
        "og_title": "Términos y Condiciones - Finanzas Inteligentes",
        "og_description": "Términos y condiciones de uso del sitio web Finanzas Inteligentes."
    },
    "404.html": {
        "title": "Página no encontrada - 404 | Finanzas Inteligentes",
        "description": "Página no encontrada. El contenido que buscas no está disponible. Vuelve al inicio de Finanzas Inteligentes para encontrar guías de educación financiera.",
        "canonical": "/404.html", "active": "", "p": ".", "noindex": True,
        "og_title": "Página no encontrada - 404 | Finanzas Inteligentes",
        "og_description": "El contenido que buscas no está disponible. Vuelve al inicio para encontrar guías de educación financiera.",
        "og_type": "website",
        "css_file": "styles.css"
    },
    # Blog pages
    "blog/index.html": {
        "title": "Blog de Finanzas - Finanzas Inteligentes | Guías y Estrategias",
        "description": "Explora nuestro blog con guías completas sobre criptomonedas, forex, opciones binarias, índices sintéticos, ahorro e inversión. Contenido verificado para Colombia y Latinoamérica.",
        "keywords": "blog finanzas, criptomonedas Colombia, forex Latinoamérica, trading, inversiones, educación financiera, ahorro, ingresos online",
        "canonical": "/blog/", "active": "blog", "p": ".."
    },
    "blog/ahorro.html": {
        "title": "Cómo Ahorrar Dinero en Colombia: Guía Práctica 2026",
        "description": "Estrategias reales para ahorrar dinero en Colombia: regla 50/30/20, mejores cuentas de ahorro Nu y Lulo, CDT, fondos de inversión, apps financieras y cómo generar ingresos extras mientras ahorras.",
        "canonical": "/blog/ahorro.html", "active": "blog", "p": "..",
        "og_title": "Cómo Ahorrar Dinero en Colombia: Guía Práctica 2026 - Finanzas Inteligentes"
    },
    "blog/criptomonedas.html": {
        "title": "Cómo Invertir en Criptomonedas con Poco Dinero en Colombia 2026",
        "description": "Aprende a invertir en criptomonedas desde Colombia con montos pequeños. Descubre Binance, Coinbase, Buda.com, wallets seguras, cómo evitar estafas e impuestos DIAN. Guía paso a paso desde $10,000 COP.",
        "canonical": "/blog/criptomonedas.html", "active": "blog", "p": "..",
        "og_title": "Cómo Invertir en Criptomonedas con Poco Dinero en Colombia - Finanzas Inteligentes"
    },
    "blog/forex.html": {
        "title": "Forex para Principiantes: Guía Completa para Latinoamérica 2026",
        "description": "El mercado de divisas explicado paso a paso desde cero. Brokers regulados como IC Markets, XM, Exness. Estrategias de scalping y day trading, análisis técnico y fundamental para operar desde Colombia, México y Argentina.",
        "canonical": "/blog/forex.html", "active": "blog", "p": "..",
        "og_title": "Forex para Principiantes: Guía Completa para Latinoamérica - Finanzas Inteligentes"
    },
    "blog/ganar-dinero.html": {
        "title": "15 Formas de Ganar Dinero Online desde Colombia en 2026",
        "description": "15 métodos comprobados para generar ingresos desde casa en Colombia: freelance, trading, marketing de afiliados, dropshipping, bots de trading, IA, productos digitales. Empieza desde $0.",
        "canonical": "/blog/ganar-dinero.html", "active": "blog", "p": "..",
        "og_title": "15 Formas de Ganar Dinero Online desde Colombia en 2026 - Finanzas Inteligentes"
    },
    "blog/indices-sinteticos.html": {
        "title": "Índices Sintéticos: Guía Completa - Trading en Deriv 2026",
        "description": "Descubre qué son los índices sintéticos y cómo operarlos en Deriv. Estrategias para Volatility 75, Boom & Crash, índices de stepping. Trading 24/7 sin dependencia del mercado real. Guía para principiantes y avanzados.",
        "canonical": "/blog/indices-sinteticos.html", "active": "blog", "p": "..",
        "og_title": "Índices Sintéticos: Guía Completa - Finanzas Inteligentes"
    },
    "blog/materias-primas.html": {
        "title": "Inversión en Materias Primas: Oro, Petróleo y Más 2026",
        "description": "Guía completa para invertir en materias primas desde Latinoamérica: oro como refugio, petróleo, cobre, ETFs, futuros, CFDs. Estrategias de diversificación y plataformas recomendadas para tu portafolio.",
        "canonical": "/blog/materias-primas.html", "active": "blog", "p": "..",
        "og_title": "Inversión en Materias Primas: Guía Completa - Finanzas Inteligentes"
    },
    "blog/opciones-binarias.html": {
        "title": "Opciones Binarias: ¿Son Legales en Colombia? Guía 2026",
        "description": "Todo sobre opciones binarias en Colombia: legalidad, plataformas confiables como IQ Option, Deriv, Olymp Trade. Estrategias de trading ganadoras, gestión de riesgo y diferencias con el forex. Guía completa 2026.",
        "canonical": "/blog/opciones-binarias.html", "active": "blog", "p": "..",
        "og_title": "Opciones Binarias: Guía Completa 2026 - Finanzas Inteligentes"
    },
    "blog/page2.html": {
        "title": "Blog de Finanzas - Página 2 | Finanzas Inteligentes",
        "description": "Página 2 del blog de Finanzas Inteligentes. Explora más guías sobre criptomonedas, forex, ahorro e inversión para Colombia y Latinoamérica.",
        "canonical": "/blog/page2.html", "active": "blog", "p": "..",
        "noindex": True
    },
    "blog/page3.html": {
        "title": "Blog de Finanzas - Página 3 | Finanzas Inteligentes",
        "description": "Página 3 del blog de Finanzas Inteligentes. Más contenido sobre finanzas, trading y generación de ingresos para Colombia y Latinoamérica.",
        "canonical": "/blog/page3.html", "active": "blog", "p": "..",
        "noindex": True
    },
    # Entradas pages
    "entradas/index.html": {
        "title": "Artículos y Guías de Finanzas - Finanzas Inteligentes",
        "description": "Artículos y guías completas sobre finanzas, inversiones, trading y generación de ingresos para Colombia y Latinoamérica. Aprende sobre ETFs, forex, criptomonedas, ahorro inteligente y bolsa BVC.",
        "canonical": "/entradas/", "active": "", "p": "..",
        "og_image": "https://finanzasinteligentes.org/img/og-default.jpg"
    },
    "entradas/guia-completa-forex.html": {
        "title": "Guía Completa de Forex para Latinoamericanos: Cómo Operar Divisas 2026",
        "description": "Guía completa de Forex para Latinoamérica: aprende a operar divisas desde Colombia, México y Argentina. Pares mayores, análisis técnico, brokers regulados, estrategias de scalping y day trading.",
        "canonical": "/entradas/guia-completa-forex.html", "active": "", "p": "..",
        "og_image": "https://finanzasinteligentes.org/img/blog-forex.svg"
    },
    "entradas/guia-completa-etfs.html": {
        "title": "Guía Completa de ETFs: Cómo Invertir desde Colombia y Latinoamérica 2026",
        "description": "Guía completa sobre ETFs: qué son, cómo funcionan y cómo comprar ETFs desde Colombia con Trii, Interactive Brokers y eToro. Tipos de ETFs, comisiones, dividendos y estrategias de inversión para Latinoamérica.",
        "canonical": "/entradas/guia-completa-etfs.html", "active": "", "p": "..",
        "og_image": "https://finanzasinteligentes.org/img/blog-etf.svg"
    },
    "entradas/guia-completa-criptomonedas.html": {
        "title": "Guía Completa de Criptomonedas para Inversores Latinoamericanos 2026",
        "description": "La guía más completa de criptomonedas para Latinoamérica: Bitcoin, Ethereum, altcoins, DeFi, stablecoins, exchanges locales, wallets frías, impuestos DIAN y cómo comprar cripto con pesos colombianos.",
        "canonical": "/entradas/guia-completa-criptomonedas.html", "active": "", "p": "..",
        "og_image": "https://finanzasinteligentes.org/img/blog-cripto.svg"
    },
    "entradas/invertir-bolsa-colombia.html": {
        "title": "Cómo Invertir en la Bolsa de Valores de Colombia (BVC) 2026",
        "description": "Guía completa para invertir en la Bolsa de Valores de Colombia (BVC) en 2026. Abrir cuenta en Trii, comisiones, acciones como Ecopetrol y Bancolombia, COLCAP, dividendos e impuestos DIAN.",
        "canonical": "/entradas/invertir-bolsa-colombia.html", "active": "", "p": "..",
        "og_image": "https://finanzasinteligentes.org/img/blog-forex.svg"
    },
    "entradas/metodos-ahorro-inteligente.html": {
        "title": "Métodos de Ahorro Inteligente para Colombianos 2026",
        "description": "Descubre métodos de ahorro inteligente para Colombia: regla 50/30/20, fondo de emergencia, mejores cuentas Nu y Lulo, CDT, presupuesto personal, ahorro automatizado y sinking funds.",
        "canonical": "/entradas/metodos-ahorro-inteligente.html", "active": "", "p": "..",
        "og_image": "https://finanzasinteligentes.org/img/blog-ahorro.svg"
    },
    "entradas/15-formas-ingresos-extras.html": {
        "title": "15 Formas de Generar Ingresos Extras desde Casa en Colombia 2026",
        "description": "15 formas comprobadas de generar ingresos extras desde casa en Colombia: freelancing, marketing de afiliados, contenido digital, dropshipping, cursos online, print on demand, asistente virtual y más.",
        "canonical": "/entradas/15-formas-ingresos-extras.html", "active": "", "p": "..",
        "og_image": "https://finanzasinteligentes.org/img/blog-ingresos.svg"
    }
}


def extract_content(filepath):
    """Extract main content from an existing HTML file by removing header/footer."""
    # Read file as single string (may be minified)
    text = filepath.read_text(encoding="utf-8-sig")

    # For formatted files (blog/*, entradas/*), find by markers
    # Content is between: after mobile-overlay closing div, before footer
    # Pattern: ...</div> (end of mobile-overlay) ... <content> ... <footer class="footer">

    # Strategy: find footer marker and work backwards
    footer_idx = text.rfind('<footer class="footer">')
    if footer_idx == -1:
        # Fallback for 404.html which has different structure
        footer_idx = text.rfind('<footer')
        if footer_idx == -1:
            return text

    # Find mobile-overlay close (the end of the header section)
    overlay_close = text.rfind('</div>', 0, footer_idx)
    # If we're in a formatted file, the overlay close is the last </div> before content
    # Find the specific mobile-overlay close
    mob_overlay = text.rfind('mobile-overlay">', 0, footer_idx)
    if mob_overlay != -1:
        # Find the closing </div> after this
        content_start = text.find('</div>', mob_overlay)
        if content_start != -1:
            content_start += len('</div>')
        else:
            content_start = overlay_close + len('</div>') if overlay_close != -1 else 0
    else:
        content_start = 0

    # Extract content between header end and footer start
    raw = text[content_start:footer_idx].strip()
    return raw


def build():
    """Build the site from templates."""
    env = Environment(
        loader=FileSystemLoader(str(SRC_DIR)),
        autoescape=False,
        undefined=Undefined
    )
    template = env.get_template("_base.html")

    built = 0
    for rel_path, meta in SITE.items():
        out_path = BASE_DIR / rel_path
        content_file = PAGES_DIR / rel_path

        # Try to get content from _src/pages, or extract from existing file
        if content_file.exists():
            content = content_file.read_text(encoding="utf-8")
        elif out_path.exists():
            content = extract_content(out_path)
            content_file.parent.mkdir(parents=True, exist_ok=True)
            content_file.write_text(content, encoding="utf-8")
            print(f"  Extracted: {rel_path}")
        else:
            print(f"  WARNING: No source for {rel_path}, skipping")
            continue

        # Add default values for all template variables
        page_data = dict(meta)
        page_data.setdefault("breadcrumb", "")
        page_data.setdefault("extra_head", "")
        page_data.setdefault("css_file", "style.css")
        page_data.setdefault("og_image", "")
        page_data.setdefault("og_type", "website")
        page_data.setdefault("noindex", False)
        page_data.setdefault("keywords", "")
        page_data.setdefault("active", "")

        html = template.render(content=content, **page_data)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html, encoding="utf-8")
        built += 1
        print(f"  Built: {rel_path}")

    print(f"\nDone! {built} pages built.")
    return built > 0


def extract_all():
    """Extract content from all existing HTML files to _src/pages/."""
    extracted = 0
    for rel_path in SITE:
        src_file = BASE_DIR / rel_path
        dst_file = PAGES_DIR / rel_path
        if src_file.exists():
            content = extract_content(src_file)
            dst_file.parent.mkdir(parents=True, exist_ok=True)
            dst_file.write_text(content, encoding="utf-8")
            extracted += 1
            print(f"  Extracted: {rel_path}")
    print(f"\nExtracted {extracted} pages to _src/pages/")


def deploy():
    """Build and deploy to Cloudflare Pages."""
    if not build():
        return
    print("\nDeploying to Cloudflare Pages...")
    result = os.system(
        'npx wrangler pages deploy . --project-name=finanzas-inteligentes 2>&1'
    )
    if result == 0:
        print("Deploy complete!")
    else:
        print(f"Deploy failed (exit code {result})")


if __name__ == "__main__":
    os.chdir(str(BASE_DIR))

    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "extract":
            extract_all()
        elif cmd == "deploy":
            deploy()
        elif cmd in ("login", "auth"):
            os.system("npx wrangler login")
        else:
            print(f"Unknown command: {cmd}")
            print("Usage: python build.py [extract|deploy|login]")
            print("  (no args)  Build all pages from templates")
            print("  extract    Extract content from existing HTML to _src/pages/")
            print("  deploy     Build + deploy to Cloudflare Pages")
            print("  login      Authenticate wrangler with Cloudflare")
    else:
        build()
