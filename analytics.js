/*
 * Estatísticas do site (Google Analytics 4) com aviso de cookies.
 *
 * COMO ATIVAR: troque o valor de GA_ID abaixo pelo "ID de métricas" do GA4
 * (começa com G-). Enquanto estiver como G-XXXXXXXXXX, nada é coletado
 * e o aviso de cookies não aparece.
 */
(function () {
  'use strict';

  // ====== CONFIGURAÇÃO ======
  var GA_ID = 'G-XXXXXXXXXX';
  // ==========================

  var KEY = 'cookie-consent';
  var PLACEHOLDER = 'G-XXXXXXXXXX';
  var hasId = /^G-[A-Z0-9]{6,}$/i.test(GA_ID) && GA_ID.toUpperCase() !== PLACEHOLDER;
  var preview = location.search.indexOf('preview-cookies') > -1; // só para visualizar o aviso
  var memory = null; // usado se o navegador bloquear o armazenamento local

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return memory; }
  }
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { memory = v; }
  }

  function loadGA() {
    if (!hasId || window.__gaLoaded) return;
    window.__gaLoaded = true;
    window['ga-disable-' + GA_ID] = false;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function clearGaCookies() {
    var host = location.hostname;
    var domains = [host, '.' + host];
    var parts = host.split('.');
    if (parts.length > 2) domains.push('.' + parts.slice(-3).join('.'), '.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
        });
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
    });
  }

  function disableGA() {
    if (hasId) window['ga-disable-' + GA_ID] = true;
    clearGaCookies();
  }

  // ---- eventos de clique (só são enviados se o visitante aceitou os cookies) ----
  document.addEventListener('click', function (e) {
    if (typeof window.gtag !== 'function') return;
    var el = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!el) return;
    var href = el.getAttribute('href') || '';
    if (/wa\.me|api\.whatsapp\.com/.test(href)) {
      window.gtag('event', 'whatsapp_click', {
        button_location: el.getAttribute('data-wa') || 'outro',
        page_path: location.pathname,
        transport_type: 'beacon'
      });
    } else if (/instagram\.com/.test(href)) {
      window.gtag('event', 'instagram_click', {
        button_location: el.getAttribute('data-ig') || 'outro',
        page_path: location.pathname,
        transport_type: 'beacon'
      });
    }
  });

  // ---- aviso de cookies ----
  var banner = null;

  function injectStyle() {
    if (document.getElementById('cookie-style')) return;
    var st = document.createElement('style');
    st.id = 'cookie-style';
    st.textContent =
      '.cookie-banner{position:fixed;left:16px;bottom:16px;z-index:130;max-width:460px;width:calc(100% - 32px);' +
      'background:rgba(255,255,255,0.88);-webkit-backdrop-filter:saturate(180%) blur(22px);backdrop-filter:saturate(180%) blur(22px);' +
      'border:1px solid rgba(255,255,255,0.85);border-radius:22px;padding:18px 22px;' +
      'box-shadow:0 2px 4px rgba(20,24,53,0.06),0 18px 40px rgba(20,24,53,0.16);color:#141835;font-family:Inter,system-ui,sans-serif;' +
      'opacity:0;transform:translateY(12px);transition:opacity .3s ease,transform .3s ease}' +
      '.cookie-banner.show{opacity:1;transform:none}' +
      '.cookie-banner p{margin:0 0 12px;font-size:13.5px;line-height:1.55;font-weight:400;color:#2b2f45}' +
      '.cookie-banner a{color:#8a6a3a;text-decoration:underline;text-underline-offset:2px}' +
      '.cookie-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '.cookie-actions button{font:inherit;font-size:13px;font-weight:500;letter-spacing:.02em;border-radius:999px;padding:10px 20px;cursor:pointer;border:1px solid rgba(20,24,53,0.18);background:#fff;color:#141835}' +
      '.cookie-actions button.accept{background:#141835;border-color:#141835;color:#f6f6f2}' +
      '.cookie-actions button:focus-visible{outline:2px solid #b08e55;outline-offset:2px}' +
      '@media(max-width:600px){.cookie-banner{left:10px;right:10px;bottom:10px;width:auto;max-width:none;padding:18px}}' +
      '@media(prefers-reduced-motion:reduce){.cookie-banner{transition:none}}';
    document.head.appendChild(st);
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('show');
    var b = banner;
    banner = null;
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 320);
  }

  function showBanner() {
    if (banner) return;
    injectStyle();
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');

    var p = document.createElement('p');
    p.appendChild(document.createTextNode('Este site usa cookies (Google Analytics) para estatísticas de acesso. '));
    var a = document.createElement('a');
    a.href = 'privacidade.html';
    a.textContent = 'Política de Privacidade';
    p.appendChild(a);

    var actions = document.createElement('div');
    actions.className = 'cookie-actions';
    var ok = document.createElement('button');
    ok.type = 'button'; ok.className = 'accept'; ok.textContent = 'Aceitar';
    var no = document.createElement('button');
    no.type = 'button'; no.textContent = 'Recusar';
    actions.appendChild(ok); actions.appendChild(no);

    banner.appendChild(p); banner.appendChild(actions);
    document.body.appendChild(banner);
    requestAnimationFrame(function () { if (banner) banner.classList.add('show'); });

    ok.addEventListener('click', function () { setConsent('granted'); hideBanner(); loadGA(); });
    no.addEventListener('click', function () { setConsent('denied'); hideBanner(); disableGA(); });
  }

  function init() {
    var consent = getConsent();
    if (consent === 'granted') loadGA();
    else if (consent !== 'denied' && (hasId || preview)) showBanner();

    var prefs = document.querySelectorAll('[data-cookie-prefs]');
    for (var i = 0; i < prefs.length; i++) {
      if (!(hasId || preview)) { prefs[i].style.display = 'none'; continue; }
      prefs[i].addEventListener('click', function (ev) {
        ev.preventDefault();
        if (hasId || preview) showBanner();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
