// Static-JSON i18n. No machine translation at runtime.
// Elements with data-i18n="key" get their text from i18n/<lang>.json (strings[key]).
import { ROOT } from './factstamp.js';

const KEY = 'lang';
export const SUPPORTED = ['en', 'ta', 'hi'];
let current = { lang: 'en', data: null };

export function getLang() {
  try {
    const l = localStorage.getItem(KEY);
    if (SUPPORTED.includes(l)) return l;
  } catch (e) { /* storage unavailable */ }
  return 'en';
}

export function t(key, fallback = '') {
  return current.data?.strings?.[key] ?? fallback;
}

async function load(lang) {
  const res = await fetch(new URL(`i18n/${lang}.json`, ROOT));
  if (!res.ok) throw new Error(`i18n ${lang}: ${res.status}`);
  return res.json();
}

function syncBanner(data, hasTargets) {
  let el = document.getElementById('i18n-banner');
  const show = hasTargets && data && data.translationStatus === 'draft';
  if (!show) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('div');
    el.id = 'i18n-banner';
    el.className = 'alert alert--warn';
    el.setAttribute('role', 'status');
    const header = document.getElementById('site-header');
    (header || document.body).after(el);
  }
  el.textContent = `Draft translation, English version governs (translated on ${data.translatedOn}).`;
}

async function apply(lang) {
  const targets = document.querySelectorAll('[data-i18n]');
  const select = document.getElementById('lang-select');
  if (select) select.value = lang;
  try {
    const data = await load(lang);
    current = { lang, data };
    targets.forEach((el) => {
      if (el.dataset.i18nOrig === undefined) el.dataset.i18nOrig = el.textContent;
      const text = data.strings?.[el.dataset.i18n];
      if (text) {
        el.textContent = text;
        if (lang === 'en') el.removeAttribute('lang'); else el.lang = lang;
      } else {
        el.textContent = el.dataset.i18nOrig;
        el.removeAttribute('lang');
      }
    });
    syncBanner(data, targets.length > 0);
  } catch (err) {
    console.error(err);
    syncBanner(null, false);
  }
}

export async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  try { localStorage.setItem(KEY, lang); } catch (e) { /* ignore */ }
  await apply(lang);
}

export async function initI18n() {
  const lang = getLang();
  current.lang = lang;
  if (lang !== 'en') await apply(lang);
}
