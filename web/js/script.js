ï»¿// ============================================
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

/* í€”í€” Hamburger Menu í€”í€” */
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
  mobileMenu.querySelectorAll('a:not(.mobile-dropdown-trigger)').forEach(function (a) { a.addEventListener('click', toggle); });
  /* Mobile dropdown submenu */
  mobileMenu.querySelectorAll('.mobile-dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var submenu = this.nextElementSibling;
      if (submenu && submenu.classList.contains('mobile-submenu')) {
        submenu.classList.toggle('open');
        this.classList.toggle('active');
      }
    });
  });
}

/* í€”í€” Header Scroll í€”í€” */
function initHeaderScroll() {
  var h = document.querySelector('.header');
  if (h) window.addEventListener('scroll', function () { h.classList.toggle('scrolled', window.scrollY > 20); });
}

/* í€”í€” Back to Top í€”í€” */
function initBackToTop() {
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function () { btn.classList.toggle('visible', window.scrollY > 400); });
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* í€”í€” Cookie Consent í€”í€” */
function initCookieConsent() {
  var el = document.querySelector('.cookie-consent');
  var accept = document.querySelector('.btn-accept');
  var decline = document.querySelector('.btn-decline');
  if (!el) return;
  if (!localStorage.getItem('cookiesAccepted') && !localStorage.getItem('cookiesDeclined')) {
    setTimeout(function () { el.classList.add('show'); }, 1500);
  }
  if (accept) accept.addEventListener('click', function () { localStorage.setItem('cookiesAccepted', 'true'); el.classList.remove('show'); });
  if (decline) decline.addEventListener('click', function () { localStorage.setItem('cookiesDeclined', 'true'); el.classList.remove('show'); });
}

/* í€”í€” Fade Animations í€”í€” */
function initFadeAnimations() {
  var els = document.querySelectorAll('.fade-in');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(function (el) { obs.observe(el); });
}

/* ============================================
   LIVE TICKER BAR - Real-time crypto & forex
   ============================================ */
function initTicker() {
  var track = document.querySelector('.ticker-track');
  if (!track) return;

  // Static items always shown
  var staticHTML = '';
  var symbols = [
    { label: 'BTC/USD', id: 'btc-ticker' },
    { label: 'ETH/USD', id: 'eth-ticker' },
    { label: 'SOL/USD', id: 'sol-ticker' },
    { label: 'XRP/USD', id: 'xrp-ticker' },
    { label: 'ADA/USD', id: 'ada-ticker' },
    { label: 'DOT/USD', id: 'dot-ticker' },
    { label: 'LINK/USD', id: 'link-ticker' },
    { label: 'EUR/USD', id: 'eur-ticker' },
    { label: 'COP/USD', id: 'cop-ticker' },
    { label: 'ARS/USD', id: 'ars-ticker' },
    { label: 'MXN/USD', id: 'mxn-ticker' },
    { label: 'BRL/USD', id: 'brl-ticker' },
    { label: 'S&P 500', id: 'sp500-ticker' },
    { label: 'ORO/USD', id: 'oro-ticker' }
  ];
  symbols.forEach(function (s) {
    staticHTML += '<div class="ticker-item"><span class="ticker-symbol">' + s.label + '</span><span class="ticker-price" id="' + s.id + '">---</span><span class="ticker-change" id="' + s.id + '-chg"></span></div>';
  });

  // Update prices from CoinGecko
  function updatePrices() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,polkadot,chainlink&vs_currencies=usd&include_24hr_change=true')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        setTicker('btc-ticker', d.bitcoin.usd, d.bitcoin.usd_24h_change);
        setTicker('eth-ticker', d.ethereum.usd, d.ethereum.usd_24h_change);
        setTicker('sol-ticker', d.solana.usd, d.solana.usd_24h_change);
        setTicker('ada-ticker', d.cardano.usd, d.cardano.usd_24h_change);
        setTicker('xrp-ticker', d.ripple.usd, d.ripple.usd_24h_change);
        setTicker('dot-ticker', d.polkadot.usd, d.polkadot.usd_24h_change);
        setTicker('link-ticker', d.chainlink.usd, d.chainlink.usd_24h_change);
      })
      .catch(function () { /* silent fail */ });

    // Forex rates
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        setTicker('eur-ticker', d.rates.EUR, null, true);
        setTicker('cop-ticker', d.rates.COP, null, true);
        setTicker('ars-ticker', d.rates.ARS, null, true);
        setTicker('mxn-ticker', d.rates.MXN, null, true);
        setTicker('brl-ticker', d.rates.BRL, null, true);
      })
      .catch(function () { /* silent fail */ });

    // Indices & commodities via Yahoo Finance (no API key needed)
    fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=2m&range=1d')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var meta = d.chart.result[0].meta;
        var price = meta.regularMarketPrice;
        var prev = meta.previousClose;
        var chg = ((price - prev) / prev * 100);
        setTicker('sp500-ticker', price, chg, false);
      })
      .catch(function () { /* silent fail */ });

    fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=2m&range=1d')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var meta = d.chart.result[0].meta;
        var price = meta.regularMarketPrice;
        var prev = meta.previousClose;
        var chg = ((price - prev) / prev * 100);
        setTicker('oro-ticker', price, chg, false);
      })
      .catch(function () { /* silent fail */ });
  }

  function setTicker(id, price, change, isRate) {
    var el = document.getElementById(id);
    var chgEl = document.getElementById(id + '-chg');
    if (!el) return;
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

  // Render static items + spacer
  track.innerHTML = staticHTML + staticHTML;
  updatePrices();
  setInterval(updatePrices, 60000);
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
    { league: 'futbol', home: 'Atletico Nacional', away: 'Millonarios', score: '3-1', status: 'live', odds: { home: 1.85, draw: 3.40, away: 4.20 }, time: '75\'' },
    { league: 'futbol', home: 'Colombia', away: 'Argentina', score: '1-0', status: 'live', odds: { home: 2.60, draw: 3.10, away: 2.80 }, time: '38\'' },
    { league: 'futbol', home: 'Brasil', away: 'Uruguay', score: '0-0', status: 'live', odds: { home: 1.75, draw: 3.50, away: 4.50 }, time: '22\'' },
    { league: 'futbol', home: 'Junior FC', away: 'Santa Fe', score: '2-0', status: 'finished', odds: { home: 1.95, draw: 3.30, away: 3.90 }, time: 'FT' },
    { league: 'futbol', home: 'Barcelona SC', away: 'Flamengo', score: '4-2', status: 'finished', odds: { home: 2.40, draw: 3.10, away: 2.90 }, time: 'FT' },
    { league: 'futbol', home: 'River Plate', away: 'Boca Juniors', score: '-', status: 'soon', odds: { home: 2.20, draw: 3.00, away: 3.50 }, matchTime: 'Hoy 21:00' },
    { league: 'futbol', home: 'Real Madrid', away: 'Barcelona', score: '-', status: 'soon', odds: { home: 1.75, draw: 3.80, away: 4.50 }, matchTime: 'Mana 16:00' },
    { league: 'futbol', home: 'Manchester City', away: 'Arsenal', score: '-', status: 'soon', odds: { home: 1.65, draw: 3.90, away: 5.00 }, matchTime: 'Mana 14:30' },
    { league: 'nba', home: 'Celtics', away: 'Mavericks', score: '118-105', status: 'live', odds: { home: 1.55, away: 2.45 }, time: 'Q4 6:12' },
    { league: 'nba', home: 'Lakers', away: 'Nuggets', score: '98-112', status: 'live', odds: { home: 2.10, away: 1.75 }, time: 'Q3 2:30' },
    { league: 'nba', home: 'Warriors', away: 'Thunder', score: '125-120', status: 'finished', odds: { home: 1.70, away: 2.15 }, time: 'FT' },
    { league: 'nba', home: 'Bucks', away: '76ers', score: '-', status: 'soon', odds: { home: 1.55, away: 2.40 }, matchTime: 'Hoy 20:30' },
    { league: 'nba', home: 'Cavaliers', away: 'Knicks', score: '-', status: 'soon', odds: { home: 1.95, away: 1.85 }, matchTime: 'Hoy 19:00' },
    { league: 'tenis', home: 'Carlos Alcaraz', away: 'Jannik Sinner', score: '1-0', status: 'live', odds: { home: 1.65, away: 2.25 }, time: '2do set' },
    { league: 'tenis', home: 'Novak Djokovic', away: 'Rafael Nadal', score: '-', status: 'soon', odds: { home: 1.50, away: 2.60 }, matchTime: 'Hoy 18:00' },
    { league: 'tenis', home: 'Iga Swiatek', away: 'Coco Gauff', score: '2-0', status: 'finished', odds: { home: 1.55, away: 2.40 }, time: 'FT' },
    { league: 'tenis', home: 'Juan Pablo Varillas', away: 'Sebastian Baez', score: '1-1', status: 'live', odds: { home: 2.10, away: 1.75 }, time: '3er set' },
    { league: 'ufc', home: 'Alex Pereira', away: 'Magomed Ankalaev', score: '-', status: 'soon', odds: { home: 1.90, away: 1.90 }, matchTime: 'Sabado 22:00' },
    { league: 'ufc', home: 'Ilia Topuria', away: 'Max Holloway', score: '-', status: 'soon', odds: { home: 1.60, away: 2.35 }, matchTime: 'Sabado 20:00' }
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

/* í€”í€” Newsletter í€”í€” */
function initNewsletter() {
  var form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var input = this.querySelector('input');
    if (!input || !input.value.trim()) return;

    var btn = this.querySelector('button[type="submit"]');
    var originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    var formData = new FormData(form);
    formData.append('access_key', '12b40e27-d50c-49cc-99e2-56eb368aa799');
    formData.append('subject', 'Nuevo suscriptor - Finanzas Inteligentes');

    try {
      var response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      var data = await response.json();
      if (response.ok) {
        alert('Gracias por suscribirte, ' + input.value.split('@')[0] + '! Pronto recibirás nuestras mejores recomendaciones financieras.');
        form.reset();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

/* í€”í€” Contact Form í€”í€” */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    var formData = new FormData(form);
    formData.append('access_key', '12b40e27-d50c-49cc-99e2-56eb368aa799');

    try {
      var response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      var data = await response.json();
      if (response.ok) {
        alert('Mensaje enviado con éxito! Te responderemos a la brevedad posible.');
        form.reset();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

/* í€”í€” Year in Footer í€”í€” */
function initYear() {
  var el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* í€”í€” Active Nav í€”í€” */
function initActiveNav() {
  var path = window.location.pathname;
  document.querySelectorAll('.nav a, .mobile-menu a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && path.indexOf(href) !== -1 && href !== '/') { link.classList.add('active'); }
  });
}
