// Shared utilities + factStamp. ROOT is the site root, derived from this module's URL.
export const ROOT = new URL('../', import.meta.url).href;
export const OFFICIAL = 'https://www.srmist.edu.in/';
export const STALE_DAYS = 180;

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function isStale(fact, now = new Date()) {
  if (!fact || fact.status === 'placeholder') return true;
  const t = Date.parse(fact.lastVerified);
  if (Number.isNaN(t)) return true;
  return (now.getTime() - t) / 86400000 > STALE_DAYS;
}

export function formatDate(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * factStamp(fact) -> HTML string.
 * fact: { label?, value?, href?, source, lastVerified, status }
 * Unknown value => "Official information to be added after verification".
 */
export function factStamp(fact) {
  const f = fact || {};
  const hasValue = f.value !== undefined && f.value !== null && String(f.value).trim() !== '';
  const stale = isStale(f);
  const label = f.label ? `<span class="fact__label">${esc(f.label)}</span>` : '';
  let value;
  if (!hasValue) {
    value = '<span class="fact__value fact__value--missing">Official information to be added after verification</span>';
  } else if (f.href) {
    const ext = /^https?:/i.test(f.href);
    value = `<a class="fact__value" href="${esc(f.href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(f.value)}${ext ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a>`;
  } else {
    value = `<span class="fact__value">${esc(f.value)}</span>`;
  }
  const src = f.source
    ? `<a href="${esc(f.source)}" target="_blank" rel="noopener noreferrer">Official source<span class="visually-hidden"> (opens in a new tab)</span></a>`
    : '<span>No source recorded</span>';
  const date = f.lastVerified && formatDate(f.lastVerified)
    ? `Last verified: <time datetime="${esc(f.lastVerified)}">${esc(formatDate(f.lastVerified))}</time>`
    : 'Last verified: not yet';
  const warn = stale ? '<p class="alert alert--warn fact__warn" role="note">May be out of date, check the official page</p>' : '';
  return `<div class="fact${stale ? ' fact--stale' : ''}">${label}${value}<span class="fact__meta"><span>${src}</span><span>${date}</span></span>${warn}</div>`;
}
