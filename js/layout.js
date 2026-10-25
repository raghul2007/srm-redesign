// Header and footer. All links are built from ROOT so they work on any URL depth (incl. 404).
import { ROOT, OFFICIAL, esc } from './factstamp.js';
import { setLang, getLang } from './i18n.js';

export const DEV_URL = 'https://jervis-olive.vercel.app/';
const PORTALS = [
  { label: 'Apply from India', url: 'https://applications.srmist.edu.in/' },
  { label: 'Apply as an international student', url: 'https://intlapplications.srmist.edu.in/' }
];
const PHONES = [
  { group: 'Engineering, Agriculture, Architecture', tel: '+917026452645', text: '+91 70 2645 2645' },
  { group: 'Liberal Arts & Business Studies, Law, Management, Medical & Allied Health, Hotel Management', tel: '+917026472647', text: '+91 70 2647 2647' }
];
const MAIN_LINES = [
  { tel: '+914427417000', text: '+91-44-27417000' },
  { tel: '+914427417777', text: '+91-44-27417777' }
];
const NAV = [
  { key: 'programs', label: 'Academics', href: 'programs.html' },
  { key: 'admissions', label: 'Admissions', href: 'admissions.html' },
  { key: 'research', label: 'Research & Innovation', href: 'research.html' },
  { key: 'campus', label: 'Campus Life', href: 'campus.html' },
  { key: 'placements', label: 'Placements & Careers', href: 'campus.html#placements' },
  { key: 'tour', label: 'Virtual Tour', href: 'tour.html' },
  { key: 'contact', label: 'About', href: 'contact.html' }
];
const AUDIENCES = [
  { label: 'Prospective student', href: 'programs.html' },
  { label: 'Parent', href: 'admissions.html#parents' },
  { label: 'Current student', href: OFFICIAL, external: true },
  { label: 'International', href: 'admissions.html#international' },
  { label: 'Faculty', href: OFFICIAL, external: true },
  { label: 'Alumni', href: OFFICIAL, external: true }
];
const FOOTER_LINKS = [
  ['Home', 'index.html'], ['Programmes', 'programs.html'], ['Admissions', 'admissions.html'],
  ['Stories & Teams', 'stories.html'], ['Research & Innovation', 'research.html'],
  ['Campus Life', 'campus.html'], ['Virtual Tour', 'tour.html'], ['Contact', 'contact.html'], ['Search', 'search.html']
];

const SIZES = ['sm', 'md', 'lg', 'xl'];
const getSize = () => { try { return localStorage.getItem('fs') || 'md'; } catch (e) { return 'md'; } };
function applySize(s) {
  const root = document.documentElement;
  SIZES.forEach((k) => root.classList.remove(`fs-${k}`));
  if (s !== 'md') root.classList.add(`fs-${s}`);
  try { localStorage.setItem('fs', s); } catch (e) { /* ignore */ }
}
applySize(getSize());

const url = (p) => (/^https?:/i.test(p) ? p : new URL(p, ROOT).href);
const ext = (l) => (l.external ? ' target="_blank" rel="noopener noreferrer"' : '');
const extHint = (l) => (l.external ? '<span class="visually-hidden"> (opens in a new tab)</span>' : '');

/** Injects the site header into <header id="site-header">. `page` is the nav key of the current page. */
export function renderHeader(page = '') {
  const host = document.getElementById('site-header');
  if (!host) return;
  host.classList.add('site-header');
  const nav = NAV.map((n) => `<li><a class="nav-link" href="${esc(url(n.href))}"${n.key === page ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('');
  const aud = AUDIENCES.map((a) => `<li><a href="${esc(url(a.href))}"${ext(a)}>${esc(a.label)}${extHint(a)}</a></li>`).join('');
  const lang = getLang();
  host.innerHTML = `
  <div class="utility-bar">
    <div class="container">
      <div class="utility-bar__links">
        <a href="${OFFICIAL}" target="_blank" rel="noopener noreferrer">Official SRMIST website<span class="visually-hidden"> (opens in a new tab)</span> &#8599;</a>
        <a class="hide-xs" href="tel:${PHONES[0].tel}">Admissions helpline: ${esc(PHONES[0].text)}</a>
        <a class="hide-xs" href="${esc(url('contact.html'))}">Contact</a>
      </div>
      <div class="fs-ctrl" role="group" aria-label="Text size">
        <span class="fs-ctrl__label hide-xs">Text size</span>
        <button type="button" data-fs="sm" aria-label="Smaller text" aria-pressed="false">A-</button>
        <button type="button" data-fs="md" aria-label="Default text size" aria-pressed="false">A</button>
        <button type="button" data-fs="lg" aria-label="Larger text" aria-pressed="false">A+</button>
        <button type="button" data-fs="xl" aria-label="Largest text" aria-pressed="false">A++</button>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="header-top">
      <a class="wordmark" href="${esc(url('index.html'))}" aria-label="SRMIST redesign concept, home">SRMIST<span class="wordmark__sub">Redesign concept</span></a>
      <div class="header-top__actions">
        <a class="btn btn--dev" href="${DEV_URL}" target="_blank" rel="noopener noreferrer" aria-label="Portfolio of the developer, Raghul S (opens in a new tab)"><span><span class="hide-sm">Developer </span>Portfolio</span> <span class="arrow" aria-hidden="true">&#8599;</span></a>
        <button type="button" class="btn btn--primary" id="apply-open" aria-haspopup="dialog">Apply</button>
        <button type="button" class="btn btn--ghost menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="header-panel">Menu</button>
      </div>
    </div>
    <div id="header-panel" class="header-panel">
      <nav aria-label="Primary"><ul class="nav-list">${nav}</ul></nav>
      <form class="search-form" role="search" action="${esc(url('search.html'))}" method="get">
        <label class="visually-hidden" for="site-search">Search the site</label>
        <input type="search" id="site-search" name="q" placeholder="Search programmes, stories, FAQs" autocomplete="off">
        <button type="submit" class="btn">Search</button>
      </form>
      <div class="header-tools">
        <div class="menu" data-menu>
          <button type="button" class="btn btn--ghost" aria-expanded="false" aria-controls="audience-list" data-menu-button>I am a&hellip; <span aria-hidden="true">&#9662;</span></button>
          <ul class="menu__list" id="audience-list" hidden>${aud}</ul>
        </div>
        <label class="lang-field">Language
          <select id="lang-select">
            <option value="en"${lang === 'en' ? ' selected' : ''}>EN - English</option>
            <option value="ta"${lang === 'ta' ? ' selected' : ''}>TA - Tamil</option>
            <option value="hi"${lang === 'hi' ? ' selected' : ''}>HI - Hindi</option>
          </select>
        </label>
        <button type="button" class="btn btn--ghost" id="lowband-toggle" aria-pressed="false">Low bandwidth</button>
        <button type="button" class="btn btn--ghost" id="theme-toggle" aria-pressed="false">Dark mode</button>
      </div>
    </div>
  </div>
  <dialog class="dialog" id="apply-dialog" aria-labelledby="apply-title">
    <h2 id="apply-title">Apply to SRMIST</h2>
    <p>Applications are made only on the official SRMIST portals. These links open in a new tab and leave this concept site.</p>
    <div class="dialog__actions">
      ${PORTALS.map((p) => `<a class="btn btn--primary" href="${p.url}" target="_blank" rel="noopener noreferrer">${esc(p.label)}<span class="visually-hidden"> (opens in a new tab)</span></a>`).join('')}
    </div>
    <button type="button" class="btn btn--ghost" id="apply-close">Close</button>
  </dialog>`;
  bindHeader();
}

function bindHeader() {
  const root = document.documentElement;

  // Mobile menu
  const toggle = document.getElementById('menu-toggle');
  const panel = document.getElementById('header-panel');
  const setPanel = (open) => { panel.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setPanel(!panel.classList.contains('is-open')));
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open') && toggle.offsetParent !== null) { setPanel(false); toggle.focus(); }
  });

  // Disclosure menu (audience)
  document.querySelectorAll('[data-menu]').forEach((menu) => {
    const btn = menu.querySelector('[data-menu-button]');
    const list = menu.querySelector('.menu__list');
    const links = () => [...list.querySelectorAll('a')];
    const set = (open, focusFirst = false) => {
      list.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open && focusFirst) links()[0]?.focus();
    };
    btn.addEventListener('click', () => set(list.hidden));
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); set(true, true); } });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !list.hidden) { e.stopPropagation(); set(false); btn.focus(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = links(); const i = items.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
      }
    });
    menu.addEventListener('focusout', (e) => { if (!menu.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) set(false); });
  });

  // Text size
  const fsBtns = [...document.querySelectorAll('[data-fs]')];
  const syncFs = () => fsBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fs === getSize())));
  fsBtns.forEach((b) => b.addEventListener('click', () => { applySize(b.dataset.fs); syncFs(); }));
  syncFs();

  // Language
  document.getElementById('lang-select').addEventListener('change', (e) => setLang(e.target.value));

  // Low bandwidth
  const low = document.getElementById('lowband-toggle');
  const syncLow = () => low.setAttribute('aria-pressed', String(root.classList.contains('low-bandwidth')));
  syncLow();
  low.addEventListener('click', () => {
    root.classList.toggle('low-bandwidth');
    try { localStorage.setItem('lowband', root.classList.contains('low-bandwidth') ? '1' : '0'); } catch (e) { /* ignore */ }
    syncLow();
  });

  // Theme
  const theme = document.getElementById('theme-toggle');
  const effective = () => root.dataset.theme || 'light';
  const syncTheme = () => theme.setAttribute('aria-pressed', String(effective() === 'dark'));
  syncTheme();
  theme.addEventListener('click', () => {
    const next = effective() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    syncTheme();
  });

  // Apply dialog: native modal gives inert background + Esc; we add an explicit Tab trap and backdrop close.
  const dlg = document.getElementById('apply-dialog');
  document.getElementById('apply-open').addEventListener('click', () => {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('a, button')?.focus();
  });
  document.getElementById('apply-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { dlg.close(); return; }
    if (e.key !== 'Tab') return;
    const f = [...dlg.querySelectorAll('a[href], button:not([disabled])')];
    const first = f[0]; const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

/** Injects the footer into <footer id="site-footer">. */
export function renderFooter() {
  const host = document.getElementById('site-footer');
  if (!host) return;
  host.classList.add('site-footer');
  host.innerHTML = `
  <div class="container">
    <div class="footer-grid">
      <section aria-labelledby="ft-sitemap">
        <h2 id="ft-sitemap" class="h4">Sitemap</h2>
        <ul>${FOOTER_LINKS.map(([l, h]) => `<li><a href="${esc(url(h))}">${esc(l)}</a></li>`).join('')}</ul>
      </section>
      <section aria-labelledby="ft-contacts">
        <h2 id="ft-contacts" class="h4">Official contacts</h2>
        <ul>
          ${PHONES.map((p) => `<li><a href="tel:${p.tel}">${esc(p.text)}</a><br><span class="muted">${esc(p.group)}</span></li>`).join('')}
          <li>Main lines: ${MAIN_LINES.map((m) => `<a href="tel:${m.tel}">${esc(m.text)}</a>`).join(', ')}</li>
          <li><a href="${OFFICIAL}" target="_blank" rel="noopener noreferrer">Official SRMIST website<span class="visually-hidden"> (opens in a new tab)</span></a></li>
        </ul>
      </section>
      <section aria-labelledby="ft-apply">
        <h2 id="ft-apply" class="h4">Official application portals</h2>
        <ul>${PORTALS.map((p) => `<li><a href="${p.url}" target="_blank" rel="noopener noreferrer">${esc(p.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`).join('')}</ul>
      </section>
    </div>
    <div class="footer-note">
      <p>Unofficial redesign concept for the SRM Website Design Challenge. Not affiliated with or endorsed by SRMIST. Always confirm details on the official website.</p>
      </div>
    <div class="dev-credit">
      <div>
        <span class="dev-credit__label">Designed &amp; developed by</span>
        <a class="dev-name" href="${DEV_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">Raghul S<span class="visually-hidden"> (opens portfolio in a new tab)</span></a>
      </div>
      <a class="btn btn--dev" href="${DEV_URL}" target="_blank" rel="noopener noreferrer"><span>Portfolio of Developer</span> <span class="arrow" aria-hidden="true">&#8599;</span><span class="visually-hidden"> (opens in a new tab)</span></a>
    </div>
  </div>`;
}
