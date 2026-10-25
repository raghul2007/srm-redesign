// Entry point for every page: renders chrome, then runs the page-specific initialiser keyed by <body data-page>.
import { renderHeader, renderFooter } from './layout.js';
import { initI18n } from './i18n.js';
import { ROOT, OFFICIAL, esc, factStamp, formatDate } from './factstamp.js';

export { ROOT, OFFICIAL, esc, factStamp };

export const INTERESTS = [
  { id: 'ai-data', label: 'AI & data' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'medicine-health', label: 'Medicine & health' },
  { id: 'law', label: 'Law' },
  { id: 'management', label: 'Management' },
  { id: 'design', label: 'Design' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'science', label: 'Science' }
];

export const pageUrl = (p) => new URL(p, ROOT).href;
const absUrl = (p) => (/^https?:|^tel:/i.test(p) ? p : pageUrl(p));
const $ = (id) => document.getElementById(id);

export async function fetchJSON(path) {
  const res = await fetch(new URL(path, ROOT));
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

/** Clearly labelled, decorative placeholder image block. */
export const phImg = (label) => `<div class="ph-img" aria-hidden="true" data-decorative>Placeholder image: ${esc(label)}</div>`;

export const statusBadge = (status) => (status === 'verified'
  ? '<span class="badge badge--ok">Verified</span>'
  : '<span class="badge badge--warn">Placeholder</span>');

/** The one reusable card. badges/meta items/body/actions are trusted HTML built by callers with esc(). */
export function cardHTML({ title, href = '', external = false, headingLevel = 3, media = '', badges = '', meta = [], body = '', actions = '' }) {
  const h = `h${headingLevel}`;
  const t = href
    ? `<a class="card__link" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(title)}${external ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a>`
    : esc(title);
  return `<article class="card">${media ? `<div class="card__media">${media}</div>` : ''}<div class="card__body">${badges ? `<p class="card__badges">${badges}</p>` : ''}<${h} class="card__title">${t}</${h}>${meta.length ? `<ul class="card__meta">${meta.map((m) => `<li>${m}</li>`).join('')}</ul>` : ''}${body ? `<div class="card__text">${body}</div>` : ''}${actions ? `<div class="card__actions">${actions}</div>` : ''}</div></article>`;
}

export function storyCard(s, level = 3) {
  return cardHTML({
    title: s.title,
    href: `${pageUrl('story.html')}?id=${encodeURIComponent(s.id)}`,
    headingLevel: level,
    media: phImg(s.title),
    badges: statusBadge(s.status),
    meta: [esc(s.outcome || ''), ...(s.departments || []).map(esc)].filter(Boolean),
    body: `<p>${esc(s.summary)}</p>`
  });
}

export function researchCard(r, level = 3) {
  return cardHTML({
    title: r.name, href: r.url, external: true, headingLevel: level,
    badges: `<span class="badge">${esc(r.type)}</span>${statusBadge(r.status)}`,
    body: factStamp({ value: null, source: r.source, lastVerified: r.lastVerified, status: r.status })
  });
}

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export function newsCard(n, level = 3) {
  const dated = n.date && !Number.isNaN(Date.parse(n.date));
  const past = n.type === 'event' && dated && new Date(n.date) < startOfToday();
  return cardHTML({
    title: n.title, href: n.url, external: true, headingLevel: level,
    badges: `<span class="badge">${n.type === 'event' ? 'Event' : 'News'}</span>${past ? '<span class="badge badge--warn">Past</span>' : ''}${statusBadge(n.status)}`,
    meta: [dated ? `<time datetime="${esc(n.date)}">${esc(formatDate(n.date))}</time>` : 'Date to be confirmed'],
    body: `<p>${esc(n.summary)}</p>`
  });
}

export const phoneList = (phones) => `<ul class="list-reset stack">${phones.map((p) => `<li>${factStamp(p)}</li>`).join('')}</ul>`;
const fail = (err) => {
  console.error(err);
  const main = document.querySelector('main');
  if (main) main.insertAdjacentHTML('afterbegin', `<div class="container"><p class="alert alert--warn" role="alert">Some content could not be loaded (${esc(err.message)}). If you opened this file directly, serve the folder with a local web server. See README.md. Official site: <a href="${OFFICIAL}">srmist.edu.in</a>.</p></div>`);
};

/* ---------------- page initialisers ---------------- */
const pages = {
  async home() {
    const [facts, stories, news, research] = await Promise.all([fetchJSON('data/facts.json'), fetchJSON('data/stories.json'), fetchJSON('data/news.json'), fetchJSON('data/research.json')]);
    $('home-steps').innerHTML = facts.steps.map((s) => `<li class="step"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${factStamp(s.fact)}</li>`).join('');
    $('home-proof').innerHTML = facts.proof.map((p) => `<div class="card"><div class="card__body"><h3 class="card__title">${esc(p.label)}</h3>${factStamp({ value: p.value ? `${p.value}${p.year ? ` (${p.year})` : ''}` : null, source: p.source, status: p.status, lastVerified: p.lastVerified })}</div></div>`).join('');
    const ordered = [...stories.stories].sort((a, b) => (a.status === 'verified' ? -1 : 1) - (b.status === 'verified' ? -1 : 1));
    $('home-stories').innerHTML = ordered.slice(0, 3).map((s) => storyCard(s)).join('');
    $('home-research').innerHTML = research.items.slice(0, 3).map((r) => researchCard(r)).join('');
    const sorted = [...news.items].sort((a, b) => (Date.parse(b.date) || -Infinity) - (Date.parse(a.date) || -Infinity));
    $('home-news').innerHTML = sorted.map((n) => newsCard(n)).join('');
    $('home-phones').innerHTML = phoneList(facts.phones);
  },

  async admissions() {
    const [facts, faq] = await Promise.all([fetchJSON('data/facts.json'), fetchJSON('data/faq.json')]);
    $('adm-steps').innerHTML = facts.steps.map((s) => `<li class="step"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${factStamp(s.fact)}</li>`).join('');
    $('adm-portals').innerHTML = facts.portals.map((p) => `<li>${factStamp(p)}</li>`).join('');
    $('adm-pages').innerHTML = facts.pages.map((p) => `<li>${factStamp(p)}</li>`).join('');
    $('adm-faq').innerHTML = faq.faqs.map((f) => `<details class="accordion" id="${esc(f.id)}"><summary>${esc(f.question)}</summary><div class="accordion__panel"><p>${esc(f.answer)}</p>${factStamp({ value: f.link.label, href: absUrl(f.link.href), source: f.source, status: f.status, lastVerified: f.lastVerified })}</div></details>`).join('');
    if (location.hash) $(location.hash.slice(1))?.setAttribute('open', '');
  },

  async contact() {
    const facts = await fetchJSON('data/facts.json');
    $('contact-phones').innerHTML = phoneList(facts.phones);
    $('contact-main').innerHTML = phoneList(facts.mainLines);
    $('contact-campuses').innerHTML = facts.campuses.map((c) => cardHTML({
      title: c.name, href: c.url, external: true, headingLevel: 3,
      badges: statusBadge(c.status),
      body: `<p class="muted">${esc(c.note || '')}</p>${factStamp({ label: 'Campus page', value: null, source: c.url, status: c.status, lastVerified: c.lastVerified })}`
    })).join('');
  },

  async campus() {
    document.querySelectorAll('[data-fact-placeholder]').forEach((el) => {
      el.innerHTML = factStamp({ label: el.dataset.factPlaceholder, value: null, source: OFFICIAL, status: 'placeholder', lastVerified: '2026-10-25' });
    });
  },

  async stories() {
    const { stories } = await fetchJSON('data/stories.json');
    const tagsOf = (s) => [...(s.departments || []), ...(s.technologies || []), ...(s.programs || []), s.outcome].filter(Boolean);
    const all = [...new Set(stories.flatMap(tagsOf))].sort((a, b) => a.localeCompare(b));
    const sel = new Set((new URLSearchParams(location.search).get('tag') || '').split('|').filter(Boolean));
    const chips = $('story-tags'); const out = $('story-results'); const count = $('story-count');
    const draw = () => {
      const list = stories.filter((s) => !sel.size || tagsOf(s).some((t) => sel.has(t)));
      count.textContent = `${list.length} ${list.length === 1 ? 'story' : 'stories'} shown`;
      out.innerHTML = list.length ? list.map((s) => storyCard(s)).join('') : '<div class="empty-state"><p>No stories match the selected tags.</p></div>';
      chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(sel.has(b.dataset.tag))));
      $('story-clear').hidden = !sel.size;
      const q = sel.size ? `?tag=${encodeURIComponent([...sel].join('|'))}` : location.pathname;
      history.replaceState(null, '', q);
    };
    chips.innerHTML = all.map((t) => `<li><button type="button" class="chip" data-tag="${esc(t)}" aria-pressed="false">${esc(t)}</button></li>`).join('');
    chips.addEventListener('click', (e) => { const b = e.target.closest('button[data-tag]'); if (!b) return; sel.has(b.dataset.tag) ? sel.delete(b.dataset.tag) : sel.add(b.dataset.tag); draw(); });
    $('story-clear').addEventListener('click', () => { sel.clear(); draw(); });
    draw();
  },

  async story() {
    const [{ stories }, programs] = await Promise.all([fetchJSON('data/stories.json'), fetchJSON('data/programs.json')]);
    const id = new URLSearchParams(location.search).get('id');
    const s = stories.find((x) => x.id === id);
    const root = $('story-root');
    if (!s) {
      root.innerHTML = `<div class="empty-state"><h1>Story not found</h1><p>We could not find that story.</p><a class="btn btn--primary" href="${pageUrl('stories.html')}">All stories</a></div>`;
      return;
    }
    document.title = `${s.title} | SRMIST redesign concept`;
    const related = s.programs.map((pid) => programs.programs.find((p) => p.id === pid)).filter(Boolean);
    const tags = new Set([...s.departments, ...s.technologies]);
    const sim = stories.filter((x) => x.id !== s.id);
    const rel = sim.filter((x) => [...x.departments, ...x.technologies].some((t) => tags.has(t)));
    const relStories = (rel.length ? rel : sim).slice(0, 3);
    const unknown = (label) => factStamp({ label, value: null, source: s.source, status: 'placeholder', lastVerified: s.lastVerified });
    root.innerHTML = `
      <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${pageUrl('index.html')}">Home</a></li><li><a href="${pageUrl('stories.html')}">Stories &amp; Teams</a></li><li aria-current="page">${esc(s.title)}</li></ol></nav>
      <h1>${esc(s.title)}</h1>
      <p class="card__badges">${statusBadge(s.status)}</p>
      <p class="lede">${esc(s.summary)}</p>
      <section class="section" aria-labelledby="st-results"><h2 id="st-results">Results</h2>${s.results.length ? `<ul>${s.results.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : unknown('Results')}</section>
      <section class="section" aria-labelledby="st-roster"><h2 id="st-roster">Team roster by department</h2>${s.roster.length ? `<ul>${s.roster.map((r) => `<li><strong>${esc(r.department)}</strong>: ${esc(r.note)}</li>`).join('')}</ul>` : unknown('Roster')}</section>
      <section class="section" aria-labelledby="st-mentor"><h2 id="st-mentor">Mentor</h2>${s.mentor ? `<p>${esc(s.mentor)}</p>` : unknown('Mentor')}</section>
      <section class="section" aria-labelledby="st-tech"><h2 id="st-tech">Technologies</h2>${s.technologies.length ? `<ul class="chip-group">${s.technologies.map((t) => `<li class="badge">${esc(t)}</li>`).join('')}</ul>` : unknown('Technologies')}</section>
      <section class="section" aria-labelledby="st-prog"><h2 id="st-prog">Related programmes</h2>${related.length ? `<div class="grid">${related.map((p) => cardHTML({ title: p.name, href: p.url, external: true, headingLevel: 3 })).join('')}</div>` : `${unknown('Related programmes')}<p><a href="${pageUrl('programs.html')}">Browse the programme finder</a></p>`}</section>
      <section class="section" aria-labelledby="st-join"><h2 id="st-join">How to join</h2><p>Joining details are published on the official SRMIST website. This concept site does not list contacts.</p><a class="btn btn--primary" href="${esc(s.howToJoin)}" target="_blank" rel="noopener noreferrer">Official SRMIST website<span class="visually-hidden"> (opens in a new tab)</span></a></section>
      <section class="section" aria-labelledby="st-src"><h2 id="st-src">Source</h2>${factStamp({ label: 'Official source', value: s.status === 'verified' ? 'Read the official article' : null, href: s.status === 'verified' ? s.source : '', source: s.source, status: s.status, lastVerified: s.lastVerified })}</section>
      <section class="section" aria-labelledby="st-rel"><h2 id="st-rel">Related stories</h2><div class="grid">${relStories.map((x) => storyCard(x)).join('')}</div></section>`;
  },

  async research() {
    const { items } = await fetchJSON('data/research.json');
    const q = $('r-q'); const type = $('r-type'); const out = $('r-results'); const count = $('r-count');
    const types = [...new Set(items.map((i) => i.type))].sort();
    type.insertAdjacentHTML('beforeend', types.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join(''));
    const draw = () => {
      const term = q.value.trim().toLowerCase();
      const list = items.filter((i) => (!type.value || i.type === type.value) && (!term || `${i.name} ${i.type} ${i.summary}`.toLowerCase().includes(term)));
      count.textContent = `${list.length} ${list.length === 1 ? 'entry' : 'entries'} found`;
      out.innerHTML = list.length ? list.map((r) => researchCard(r)).join('') : '<div class="empty-state"><p>No entries match. Try a different search.</p></div>';
    };
    q.addEventListener('input', draw); type.addEventListener('change', draw);
    $('r-form').addEventListener('submit', (e) => e.preventDefault());
    draw();
  }
};

/* ---------------- boot ---------------- */
const page = document.body.dataset.page || '';
renderHeader(page);
renderFooter();
initI18n();
pages[page]?.().catch(fail);
