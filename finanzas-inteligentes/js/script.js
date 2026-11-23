// ============================================
// FINANZAS INTELIGENTES - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  initHamburger();
  initHeaderScroll();
  initBackToTop();
  initCookieConsent();
  initFadeAnimations();
  initTicker();
  initMarketNews();
  initSports();
  initNewsletter();
  initContactForm();
  initYear();
  initActiveNav();
});

/* —— Hamburger Menu —— */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-overlay');
  if (!hamburger || !mobileMenu || !overlay) return;
  const toggle = function () {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  };
  hamburger.addEventListener('click', toggle);
  overlay.addEventListener('click', toggle);
  mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', toggle); });
}

/* —— Header Scroll —— */
function initHeaderScroll() {
  var h = document.querySelector('.header');
  if (h) window.addEventListener('scroll', function () { h.classList.toggle('scrolled', window.scrollY > 20); });
}

/* —— Back to Top —— */
function initBackToTop() {
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function () { btn.classList.toggle('visible', window.scrollY > 400); });
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* —— Cookie Consent —— */
function initCookieConsent() {
  var el = document.querySelector('.cookie-consent');
  var accept = document.querySelector('.btn-accept');
  var decline = document.querySelector('.btn-decline');
  if (!el) return;
  if (!localStorage.getItem('cookiesAccepted') && !localStorage.getItem('cookiesDeclined')) {
    setTimeout(function () { el.classList.add('show'); }, 1500);
  }
  function consent(granted) {
    if (typeof gtag === 'function') {
      var v = granted ? 'granted' : 'denied';
      gtag('consent', 'update', { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: 'granted' });
    }
  }
  if (localStorage.getItem('cookiesAccepted')) consent(true);
  if (accept) accept.addEventListener('click', function () { localStorage.setItem('cookiesAccepted', 'true'); consent(true); el.classList.remove('show'); });
  if (decline) decline.addEventListener('click', function () { localStorage.setItem('cookiesDeclined', 'true'); consent(false); el.classList.remove('show'); });
}

/* —— Fade Animations —— */
function initFadeAnimations() {
  var els = document.querySelectorAll('.fade-in');
  // Marcar inmediatamente como visible los que ya están en viewport al cargar — evita CLS
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });
  els.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    // Si ya es visible en el viewport inicial, activar sin animación
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    } else {
      obs.observe(el);
    }
  });
}

/* ============================================
   LIVE TICKER BAR - Real-time crypto & forex
   ============================================ */
function initTicker() {
  var track = document.querySelector('.ticker-track');
  if (!track) return;

  // Fallback prices shown immediately while APIs load
  var fallbacks = {
    'btc-ticker':  { price: 94200,  change: 1.2,   label: 'BTC/USD' },
    'eth-ticker':  { price: 3480,   change: 0.8,   label: 'ETH/USD' },
    'sol-ticker':  { price: 198,    change: 2.1,   label: 'SOL/USD' },
    'xrp-ticker':  { price: 2.18,   change: -0.4,  label: 'XRP/USD' },
    'ada-ticker':  { price: 0.92,   change: 1.5,   label: 'ADA/USD' },
    'dot-ticker':  { price: 7.80,   change: 0.6,   label: 'DOT/USD' },
    'link-ticker': { price: 15.40,  change: 1.1,   label: 'LINK/USD'},
    'eur-ticker':  { price: 0.9230, change: null,  label: 'EUR/USD', isRate: true },
    'cop-ticker':  { price: 4150,   change: null,  label: 'COP/USD', isRate: true },
    'ars-ticker':  { price: 1050,   change: null,  label: 'ARS/USD', isRate: true },
    'mxn-ticker':  { price: 17.20,  change: null,  label: 'MXN/USD', isRate: true },
    'brl-ticker':  { price: 5.75,   change: null,  label: 'BRL/USD', isRate: true },
    'oro-ticker':  { price: 2650,   change: 0.3,   label: 'ORO/USD' }
  };

  // Build ticker HTML with fallback values immediately
  var staticHTML = '';
  Object.keys(fallbacks).forEach(function(id) {
    var s = fallbacks[id];
    var priceStr = s.isRate ? '$' + s.price.toFixed(2) : '$' + s.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var chgStr = '';
    var chgClass = '';
    if (s.change !== null && s.change !== undefined) {
      var arrow = s.change >= 0 ? '▲' : '▼';
      chgStr = arrow + ' ' + Math.abs(s.change).toFixed(2) + '%';
      chgClass = s.change >= 0 ? 'up' : 'down';
    }
    staticHTML += '<div class="ticker-item"><span class="ticker-symbol">' + s.label + '</span><span class="ticker-price" id="' + id + '">' + priceStr + '</span><span class="ticker-change ' + chgClass + '" id="' + id + '-chg">' + chgStr + '</span></div>';
  });

  // Render immediately with fallback data
  track.innerHTML = staticHTML + staticHTML;

  // Update prices from CoinGecko (best-effort, silent fail)
  function updatePrices() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,polkadot,chainlink,pax-gold&vs_currencies=usd&include_24hr_change=true')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        if (d.bitcoin)   setTicker('btc-ticker',  d.bitcoin.usd,   d.bitcoin.usd_24h_change);
        if (d.ethereum)  setTicker('eth-ticker',  d.ethereum.usd,  d.ethereum.usd_24h_change);
        if (d.solana)    setTicker('sol-ticker',  d.solana.usd,    d.solana.usd_24h_change);
        if (d.cardano)   setTicker('ada-ticker',  d.cardano.usd,   d.cardano.usd_24h_change);
        if (d.ripple)    setTicker('xrp-ticker',  d.ripple.usd,    d.ripple.usd_24h_change);
        if (d.polkadot)  setTicker('dot-ticker',  d.polkadot.usd,  d.polkadot.usd_24h_change);
        if (d.chainlink) setTicker('link-ticker', d.chainlink.usd, d.chainlink.usd_24h_change);
        if (d['pax-gold']) setTicker('oro-ticker', d['pax-gold'].usd, d['pax-gold'].usd_24h_change);
      })
      .catch(function () { /* Keep fallback values on failure */ });

    // Forex rates
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        if (d.rates) {
          setTicker('eur-ticker', d.rates.EUR, null, true);
          setTicker('cop-ticker', d.rates.COP, null, true);
          setTicker('ars-ticker', d.rates.ARS, null, true);
          setTicker('mxn-ticker', d.rates.MXN, null, true);
          setTicker('brl-ticker', d.rates.BRL, null, true);
        }
      })
      .catch(function () { /* Keep fallback values on failure */ });
  }

  function setTicker(id, price, change, isRate) {
    var el = document.getElementById(id);
    var chgEl = document.getElementById(id + '-chg');
    if (!el || price === undefined || price === null) return;
    if (isRate) {
      el.textContent = '$' + price.toFixed(2);
      if (chgEl) chgEl.textContent = '';
    } else {
      el.textContent = '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (chgEl && change !== null && change !== undefined) {
        var arrow = change >= 0 ? '▲' : '▼';
        chgEl.textContent = arrow + ' ' + Math.abs(change).toFixed(2) + '%';
        chgEl.className = 'ticker-change ' + (change >= 0 ? 'up' : 'down');
      }
    }
  }

  // Fetch live prices (delayed 1s to let page render first)
  setTimeout(updatePrices, 1000);
  setInterval(updatePrices, 120000);
}

/* ============================================
   MARKET NEWS - Simulated real-time feed
   ============================================ */
function initMarketNews() {
  var container = document.getElementById('news-container');
  if (!container) return;

  var newsPool = [
    { source: 'Bloomberg', title: 'Bitcoin supera los $75,000 tras anuncio de ETF en varios países', time: 'Hace 12 min' },
    { source: 'Reuters', title: 'Petróleo sube 3% por tensiones geopolíticas en Medio Oriente', time: 'Hace 25 min' },
    { source: 'Financial Times', title: 'La Fed mantiene tasas: impacto en mercados emergentes', time: 'Hace 38 min' },
    { source: 'CoinDesk', title: 'Ethereum completa actualización Dencun: tarifas caen 90%', time: 'Hace 1 h' },
    { source: 'El Financial', title: 'Peso colombiano se fortalece frente al dólar en junio 2026', time: 'Hace 1 h' },
    { source: 'Bloomberg', title: 'S&P 500 alcanza nuevo máximo histórico impulsado por tech', time: 'Hace 1 h' },
    { source: 'Investing.com', title: 'Oro cotiza estable cerca de $2,400 la onza', time: 'Hace 2 h' },
    { source: 'CoinTelegraph', title: 'Solana lidera ganancias semanales con +18% entre las top 10', time: 'Hace 2 h' },
    { source: 'Reuters', title: 'Mercados LATAM: Brasil y México atraen flujo de inversión', time: 'Hace 2 h' },
    { source: 'Binance Research', title: 'Trading algorítmico: el 70% de las operaciones ya son automatizadas', time: 'Hace 3 h' },
    { source: 'Bloomberg', title: 'Forex: Dólar débil beneficia a monedas emergentes en junio', time: 'Hace 3 h' },
    { source: 'Yahoo Finance', title: 'Índices sintéticos: nuevo récord de volumen en plataformas de trading', time: 'Hace 4 h' }
  ];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a.slice(0, 6);
  }

  function renderNews() {
    var items = shuffle(newsPool);
    container.innerHTML = items.map(function (n) {
      return '<div class="news-card fade-in"><span class="news-source">' + n.source + '</span><h4><a href="#">' + n.title + '</a></h4><div class="news-meta"><span class="news-time"><i class="far fa-clock"></i> ' + n.time + '</span></div></div>';
    }).join('');
    // Re-trigger animations
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    container.querySelectorAll('.fade-in').forEach(function (el) { obs.observe(el); });
  }

  renderNews();
  setInterval(renderNews, 120000); // Refresh news every 2 min
}

/* ============================================
   SPORTS - Live matches with auto-refresh
   ============================================ */
function initSports() {
  var container = document.getElementById('matches-container');
  var filterBtns = document.querySelectorAll('.sports-filters button');
  if (!container) return;

  var currentLeague = 'all';

  var allMatches = [
    { league: 'futbol', home: 'Atlético Nacional', away: 'Millonarios', score: '2-1', status: 'live', odds: { home: 1.85, draw: 3.40, away: 4.20 }, time: '60\'' },
    { league: 'futbol', home: 'América de Cali', away: 'Deportivo Cali', score: '0-0', status: 'live', odds: { home: 2.10, draw: 3.20, away: 3.60 }, time: '32\'' },
    { league: 'futbol', home: 'Junior FC', away: 'Santa Fe', score: '1-0', status: 'finished', odds: { home: 1.95, draw: 3.30, away: 3.90 }, time: 'FT' },
    { league: 'futbol', home: 'Barcelona SC', away: 'Flamengo', score: '3-2', status: 'live', odds: { home: 2.40, draw: 3.10, away: 2.90 }, time: '75\'' },
    { league: 'futbol', home: 'River Plate', away: 'Boca Juniors', score: '-', status: 'soon', odds: { home: 2.20, draw: 3.00, away: 3.50 }, matchTime: 'Hoy 21:00' },
    { league: 'futbol', home: 'Real Madrid', away: 'Barcelona', score: '-', status: 'soon', odds: { home: 1.75, draw: 3.80, away: 4.50 }, matchTime: 'Mañana 16:00' },
    { league: 'futbol', home: 'Manchester City', away: 'Arsenal', score: '-', status: 'soon', odds: { home: 1.65, draw: 3.90, away: 5.00 }, matchTime: 'Mañana 14:30' },
    { league: 'futbol', home: 'Colo Colo', away: 'Universidad de Chile', score: '1-1', status: 'live', odds: { home: 2.30, draw: 3.10, away: 3.30 }, time: '44\'' },
    { league: 'nba', home: 'Lakers', away: 'Celtics', score: '108-102', status: 'live', odds: { home: 1.90, away: 1.90 }, time: 'Q4 3:42' },
    { league: 'nba', home: 'Warriors', away: 'Bulls', score: '95-98', status: 'live', odds: { home: 1.70, away: 2.15 }, time: 'Q4 1:15' },
    { league: 'nba', home: 'Heat', away: 'Nuggets', score: '112-105', status: 'finished', odds: { home: 2.10, away: 1.75 }, time: 'FT' },
    { league: 'nba', home: 'Bucks', away: '76ers', score: '-', status: 'soon', odds: { home: 1.55, away: 2.40 }, matchTime: 'Hoy 20:30' },
    { league: 'nba', home: 'Cavaliers', away: 'Knicks', score: '-', status: 'soon', odds: { home: 1.95, away: 1.85 }, matchTime: 'Hoy 19:00' },
    { league: 'tenis', home: 'Carlos Alcaraz', away: 'Novak Djokovic', score: '2-1', status: 'live', odds: { home: 1.80, away: 2.00 }, time: '3er set' },
    { league: 'tenis', home: 'Rafael Nadal', away: 'Jannik Sinner', score: '-', status: 'soon', odds: { home: 2.50, away: 1.55 }, matchTime: 'Hoy 18:00' },
    { league: 'tenis', home: 'Iga Swiatek', away: 'Aryna Sabalenka', score: '2-0', status: 'finished', odds: { home: 1.65, away: 2.25 }, time: 'FT' },
    { league: 'tenis', home: 'Juan Pablo Varillas', away: 'Sebastián Báez', score: '1-1', status: 'live', odds: { home: 2.10, away: 1.75 }, time: '2do set' },
    { league: 'ufc', home: 'Alex Pereira', away: 'Israel Adesanya', score: '-', status: 'soon', odds: { home: 1.90, away: 1.90 }, matchTime: 'Sábado 22:00' },
    { league: 'ufc', home: 'Charles Oliveira', away: 'Justin Gaethje', score: '-', status: 'soon', odds: { home: 1.70, away: 2.15 }, matchTime: 'Sábado 20:00' }
  ];

  function renderMatches(league) {
    currentLeague = league;
    var filtered = league === 'all' ? allMatches : allMatches.filter(function (m) { return m.league === league; });
    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px 0;">No hay partidos disponibles para esta categoría. Próximamente más eventos.</p>';
      return;
    }
    filtered.forEach(function (m) {
      var statusLabel = '';
      if (m.status === 'live') statusLabel = '<span class="live-pulse"></span>EN VIVO' + (m.time ? ' <span style="font-size:0.75rem;color:var(--text-light)">' + m.time + '</span>' : '');
      else if (m.status === 'soon') statusLabel = m.matchTime || 'Próximamente';
      else statusLabel = 'Finalizado';

      var oddsHTML = '';
      if (m.odds.home) {
        oddsHTML = '<div class="match-odds">';
        if (m.league === 'tenis') {
          oddsHTML += '<span class="odd">1: ' + m.odds.home.toFixed(2) + '</span><span class="odd">2: ' + m.odds.away.toFixed(2) + '</span>';
        } else {
          oddsHTML += '<span class="odd">1: ' + m.odds.home.toFixed(2) + '</span>';
          if (m.odds.draw) oddsHTML += '<span class="odd">X: ' + m.odds.draw.toFixed(2) + '</span>';
          oddsHTML += '<span class="odd">2: ' + m.odds.away.toFixed(2) + '</span>';
        }
        oddsHTML += '</div>';
      }

      var card = document.createElement('div');
      card.className = 'match-card fade-in';
      card.innerHTML = '<div class="match-teams"><div class="team"><span>' + m.home + '</span></div><span class="vs">vs</span><div class="team"><span>' + m.away + '</span></div></div><div class="match-score">' + m.score + '</div><div><span class="match-status ' + m.status + '">' + statusLabel + '</span></div>' + oddsHTML;
      container.appendChild(card);
    });
    initFadeAnimations();
  }

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderMatches(btn.dataset.league || 'all');
      });
    });
  }

  renderMatches('all');

  // Auto-update scores every 20 seconds
  setInterval(function () {
    var scoreEls = container.querySelectorAll('.match-score');
    scoreEls.forEach(function (el) {
      if (el.textContent !== '-' && el.textContent !== 'FT') {
        var parts = el.textContent.split('-').map(function (s) { return parseInt(s.trim()); });
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          if (Math.random() > 0.75) {
            if (Math.random() > 0.5) parts[0]++; else parts[1]++;
            el.textContent = parts[0] + '-' + parts[1];
          }
        }
      }
    });
    // Randomly start/end matches for realism
    if (Math.random() > 0.9) {
      renderMatches(currentLeague);
    }
  }, 20000);
}

/* —— Newsletter —— */
function initNewsletter() {
  var form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = this.querySelector('input');
    if (input && input.value.trim()) {
      alert('¡Gracias por suscribirte, ' + input.value.split('@')[0] + '! Pronto recibirás nuestras mejores recomendaciones financieras en tu correo.');
      input.value = '';
    }
  });
}

/* —— Contact Form —— */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('¡Mensaje enviado con éxito! Te responderemos a la brevedad posible.');
    this.reset();
  });
}

/* —— Year in Footer —— */
function initYear() {
  var el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* —— Active Nav —— */
function initActiveNav() {
  var path = window.location.pathname;
  document.querySelectorAll('.nav a, .mobile-menu a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && path.indexOf(href) !== -1 && href !== '/') { link.classList.add('active'); }
  });
}
