// Client-side search over pages, programmes, stories, research and FAQ.
import { fetchJSON, esc, pageUrl } from './main.js';

const $ = (id) => document.getElementById(id);
const GROUPS = ['Pages', 'Programmes', 'Stories', 'Research', 'FAQ'];
const PAGES = [
  ['Home', 'index.html', 'home reimagine discover university overview'],
  ['Programmes', 'programs.html', 'programmes programs courses finder level undergraduate postgraduate phd interest'],
  ['Admissions', 'admissions.html', 'admissions apply steps portal international india parents scholarships'],
  ['Stories & Teams', 'stories.html', 'stories teams students achievements racing'],
  ['Research & Innovation', 'research.html', 'research labs centres projects innovation'],
  ['Campus Life', 'campus.html', 'campus life hostel clubs placements careers'],
  ['Contact', 'contact.html', 'contact phone campuses admissions helpline']
];
const SUGGESTIONS = ['admissions', 'engineering', 'scholarships', 'apply', 'research', 'phone'];
let index = [];

async function build() {
  const [programs, stories, research, faq] = await Promise.all([
    fetchJSON('data/programs.json'), fetchJSON('data/stories.json'), fetchJSON('data/research.json'), fetchJSON('data/faq.json')
  ]);
  index = [
    ...PAGES.map(([title, url, text]) => ({ group: 'Pages', title, url: pageUrl(url), text })),
    ...programs.programs.map((p) => ({ group: 'Programmes', title: p.name, url: p.url, external: true, text: [p.college, p.level, p.department, p.campus, ...p.interests].filter(Boolean).join(' ') })),
    ...stories.stories.map((s) => ({ group: 'Stories', title: s.title, url: `${pageUrl('story.html')}?id=${encodeURIComponent(s.id)}`, text: [s.summary, s.outcome, ...s.departments, ...s.technologies].join(' ') })),
    ...research.items.map((r) => ({ group: 'Research', title: r.name, url: r.url, external: true, text: `${r.type} ${r.interest}` })),
    ...faq.faqs.map((f) => ({ group: 'FAQ', title: f.question, url: `${pageUrl('admissions.html')}#${f.id}`, text: f.answer }))
  ];
}

function run(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return index.map((e) => {
    const title = e.title.toLowerCase(); const text = (e.text || '').toLowerCase();
    let score = 0;
    for (const w of words) {
      if (title.includes(w)) score += 3; else if (text.includes(w)) score += 1; else return null;
    }
    return { e, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title));
}

function render(q) {
  const out = $('s-results'); const count = $('s-count');
  const term = q.trim();
  if (!term) { count.textContent = 'Type to search.'; out.innerHTML = ''; return; }
  const hits = run(term);
  count.textContent = `${hits.length} ${hits.length === 1 ? 'result' : 'results'} for "${term}"`;
  if (!hits.length) {
    out.innerHTML = `<div class="empty-state"><h2>No results</h2><p>Try one of these:</p><ul class="chip-group" style="justify-content:center">${SUGGESTIONS.map((s) => `<li><a class="chip" href="?q=${encodeURIComponent(s)}">${esc(s)}</a></li>`).join('')}</ul><p><a href="${pageUrl('programs.html')}">Browse programmes</a> or visit the <a href="https://www.srmist.edu.in/" target="_blank" rel="noopener noreferrer">official site<span class="visually-hidden"> (opens in a new tab)</span></a>.</p></div>`;
    return;
  }
  out.innerHTML = GROUPS.map((g) => {
    const items = hits.filter((h) => h.e.group === g);
    if (!items.length) return '';
    return `<section class="section" aria-labelledby="g-${g}"><h2 id="g-${g}">${g} (${items.length})</h2><ul class="list-reset stack" role="list">${items.map(({ e }) => `<li><a href="${esc(e.url)}"${e.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(e.title)}${e.external ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a></li>`).join('')}</ul></section>`;
  }).join('');
}

function sync(q) {
  history.replaceState(null, '', q.trim() ? `?q=${encodeURIComponent(q.trim())}` : location.pathname);
}

async function init() {
  const input = $('s-q');
  input.value = new URLSearchParams(location.search).get('q') || '';
  await build();
  render(input.value);
  let timer;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { render(input.value); sync(input.value); }, 150); });
  $('s-form').addEventListener('submit', (e) => { e.preventDefault(); render(input.value); sync(input.value); });

  // Keyboard: ArrowDown from the box enters the results; Up/Down move between links; Up from the first returns.
  const links = () => [...$('s-results').querySelectorAll('a')];
  input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { const l = links(); if (l.length) { e.preventDefault(); l[0].focus(); } } });
  $('s-results').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const l = links(); const i = l.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    if (e.key === 'ArrowDown') l[Math.min(i + 1, l.length - 1)].focus();
    else if (i === 0) input.focus(); else l[i - 1].focus();
  });
}

init().catch((err) => {
  console.error(err);
  $('s-count').textContent = `Search could not load (${err.message}). Serve the folder with a local web server.`;
});
