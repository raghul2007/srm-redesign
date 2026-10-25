// Programme finder: filters synced to the URL query string.
import { fetchJSON, cardHTML, esc, factStamp, INTERESTS, statusBadge, OFFICIAL } from './main.js';

const $ = (id) => document.getElementById(id);
const FIELDS = ['q', 'level', 'mode', 'type', 'college', 'campus', 'dept', 'sort'];
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
let data; let facts; let state;

function readState() {
  const p = new URLSearchParams(location.search);
  const s = { interest: (p.get('interest') || '').split(',').filter(Boolean) };
  FIELDS.forEach((k) => { s[k] = p.get(k) || ''; });
  if (!s.sort) s.sort = 'name';
  s.audience = p.get('audience') || '';
  return s;
}

function writeState() {
  const p = new URLSearchParams();
  FIELDS.forEach((k) => { if (state[k] && !(k === 'sort' && state[k] === 'name')) p.set(k, state[k]); });
  if (state.interest.length) p.set('interest', state.interest.join(','));
  if (state.audience) p.set('audience', state.audience);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function fillSelect(id, options, anyLabel) {
  $(id).innerHTML = `<option value="">${esc(anyLabel)}</option>${options.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}`;
}

// Academic departments only, de-duplicated case-insensitively.
function uniqueDepartments(list) {
  const seen = new Map();
  list.forEach((d) => { const name = d.name.trim().replace(/\s+/g, ' '); const k = name.toLowerCase(); if (name && !seen.has(k)) seen.set(k, name); });
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

const levelLabel = (id) => data.levels.find((l) => l.id === id)?.label || id;

function programCard(p) {
  const dur = p.durationMonths ? (p.durationMonths % 12 === 0 ? `${p.durationMonths / 12} years` : `${p.durationMonths} months`) : null;
  const unk = '<span class="muted">To be added</span>';
  const row = (k, v) => `<dt>${k}</dt><dd>${v ? esc(v) : unk}</dd>`;
  const verified = p.status === 'verified';
  return cardHTML({
    title: p.name, href: p.url, external: true, headingLevel: 2,
    badges: `<span class="badge">${esc(levelLabel(p.level))}</span>${statusBadge(p.status)}`,
    meta: [p.college, p.mode, p.type].filter(Boolean).map(esc),
    body: `<dl class="card__dl">${row('Duration', dur)}${row('Annual fee', p.annualFeeInr != null ? `${inr.format(p.annualFeeInr)} per year` : null)}${row('Intake', p.intake)}${row('Eligibility', p.eligibility || 'See official programme page')}${row('Campus', p.campus)}</dl>${factStamp({ value: verified ? 'Details as printed on the official page' : null, source: p.source, status: p.status, lastVerified: p.lastVerified })}`,
    actions: `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Official page<span class="visually-hidden"> for ${esc(p.name)} (opens in a new tab)</span></a>`
  });
}

const nullsLast = (a, b) => (a == null) - (b == null) || (a ?? 0) - (b ?? 0);

function filtered() {
  const term = state.q.trim().toLowerCase();
  const list = data.programs.filter((p) =>
    (!state.level || p.level === state.level) &&
    (!state.mode || p.mode === state.mode) &&
    (!state.type || p.type === state.type) &&
    (!state.college || p.college === state.college) &&
    (!state.campus || p.campus === state.campus) &&
    (!state.dept || p.department === state.dept) &&
    (!state.interest.length || p.interests.some((i) => state.interest.includes(i))) &&
    (!term || [p.name, p.college, p.department, p.campus, p.level].filter(Boolean).join(' ').toLowerCase().includes(term)));
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name),
    fee: (a, b) => nullsLast(a.annualFeeInr, b.annualFeeInr) || a.name.localeCompare(b.name),
    duration: (a, b) => nullsLast(a.durationMonths, b.durationMonths) || a.name.localeCompare(b.name)
  };
  return list.sort(sorters[state.sort] || sorters.name);
}

function render() {
  const list = filtered();
  $('result-count').textContent = `${list.length} ${list.length === 1 ? 'programme' : 'programmes'} found`;
  $('results').innerHTML = list.length
    ? list.map(programCard).join('')
    : `<div class="empty-state"><h2>No programmes match these filters</h2><p>Programmes with unknown values are hidden when you filter by that field, because those details are still to be added. Use Clear filters, or search the <a href="https://www.srmist.edu.in/program-finder/" target="_blank" rel="noopener noreferrer">official programme finder<span class="visually-hidden"> (opens in a new tab)</span></a>.</p></div>`;
  document.querySelectorAll('#f-interests button').forEach((b) => b.setAttribute('aria-pressed', String(state.interest.includes(b.dataset.interest))));
  const note = $('audience-note');
  if (state.audience === 'international') note.innerHTML = 'International applicants: see the <a href="https://www.srmist.edu.in/admission-international/" target="_blank" rel="noopener noreferrer">official international admissions page<span class="visually-hidden"> (opens in a new tab)</span></a>.';
  else if (state.audience === 'parent') note.innerHTML = 'Parents: see the <a href="admissions.html#parents">admissions journey</a> and the <a href="contact.html">admissions phone lines</a>.';
  else note.textContent = '';
  note.hidden = !note.textContent && !note.innerHTML;
  writeState();
}

function syncControls() {
  FIELDS.forEach((k) => { const el = $(`f-${k}`); if (el) el.value = state[k]; });
}

async function init() {
  [data, facts] = await Promise.all([fetchJSON('data/programs.json'), fetchJSON('data/facts.json')]);
  state = readState();
  fillSelect('f-level', data.levels.map((l) => ({ value: l.id, label: l.label })), 'Any level');
  fillSelect('f-mode', data.modes.map((m) => ({ value: m, label: m })), 'Any mode');
  fillSelect('f-type', data.types.map((t) => ({ value: t, label: t })), 'Any type');
  fillSelect('f-college', [...new Set(data.programs.map((p) => p.college).filter(Boolean))].sort().map((c) => ({ value: c, label: c })), 'Any college');
  fillSelect('f-campus', facts.campuses.map((c) => ({ value: c.name, label: c.name })), 'Any campus');
  fillSelect('f-dept', uniqueDepartments(data.departments).map((d) => ({ value: d, label: d })), 'Any department');
  $('f-interests').innerHTML = INTERESTS.map((i) => `<li><button type="button" class="chip" data-interest="${i.id}" aria-pressed="false">${esc(i.label)}</button></li>`).join('');
  syncControls();

  const form = $('finder-form');
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', (e) => {
    const k = e.target.id?.replace('f-', '');
    if (FIELDS.includes(k)) { state[k] = e.target.value; render(); }
  });
  $('f-interests').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-interest]'); if (!b) return;
    const id = b.dataset.interest;
    state.interest = state.interest.includes(id) ? state.interest.filter((x) => x !== id) : [...state.interest, id];
    render();
  });
  $('f-clear').addEventListener('click', () => {
    state = { interest: [], audience: '', sort: 'name' };
    FIELDS.forEach((k) => { if (k !== 'sort') state[k] = ''; });
    syncControls(); render();
    $('f-q').focus();
  });
  render();
}

init().catch((err) => {
  console.error(err);
  $('results').innerHTML = `<p class="alert alert--warn" role="alert">Programmes could not be loaded (${esc(err.message)}). Serve the folder with a local web server, or use the <a href="${OFFICIAL}program-finder/">official programme finder</a>.</p>`;
});
