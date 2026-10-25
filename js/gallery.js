// Moving photo wall + hero slideshow for the home page.
// Real photos live in images/gallery/ (see data/gallery.json). Missing photos become labelled placeholder tiles.
import { ROOT, esc } from './factstamp.js';

const root = document.documentElement;
const lowBand = () => root.classList.contains('low-bandwidth');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PH = [
  'linear-gradient(135deg,#0b3d91,#1d7fd8)', 'linear-gradient(135deg,#1d7fd8,#14a89a)', 'linear-gradient(135deg,#14a89a,#0b3d91)',
  'linear-gradient(135deg,#f5a524,#1d7fd8)', 'linear-gradient(135deg,#082c6b,#14a89a)'
];

const tile = (p, i, hidden = false) => {
  const src = lowBand() ? '' : `<img src="${esc(new URL(`images/gallery/${p.file}`, ROOT).href)}" alt="" loading="lazy" decoding="async">`;
  return `<figure class="photo${src ? '' : ' is-ph'}" style="--ph:${PH[i % PH.length]}"${hidden ? ' aria-hidden="true"' : ''}>${src}<span class="photo__ph">Placeholder photo</span><figcaption>${esc(p.caption)}</figcaption></figure>`;
};

async function main() {
  const host = document.getElementById('photo-wall');
  const res = await fetch(new URL('data/gallery.json', ROOT));
  const { photos } = await res.json();
  if (host) {
    const half = Math.ceil(photos.length / 2);
    const rows = [photos.slice(0, half), photos.slice(half)];
    host.innerHTML = rows.map((r, n) => {
      const base = r.map((p, i) => tile(p, i + n * 3)).join('');
      const dup = r.map((p, i) => tile(p, i + n * 3, true)).join('');
      return `<div class="photo-row${n ? ' photo-row--rev' : ''}">${base}${dup}</div>`;
    }).join('');
    // A photo that fails to load turns into a placeholder tile.
    host.addEventListener('error', (e) => {
      if (e.target.tagName !== 'IMG') return;
      e.target.closest('.photo')?.classList.add('is-ph');
      e.target.remove();
    }, true);
  }

  // Hero slideshow: only photos that really load take part.
  const slides = document.getElementById('hero-slides');
  if (!slides || lowBand() || reduce) return;
  const ok = [];
  await Promise.all(photos.map((p) => new Promise((done) => {
    const im = new Image();
    im.onload = () => { ok.push(im.src); done(); };
    im.onerror = done;
    im.src = new URL(`images/gallery/${p.file}`, ROOT).href;
  })));
  if (!ok.length) return;
  slides.innerHTML = ok.slice(0, 6).map((u) => `<div class="hero-slide" style="background-image:url('${esc(u)}')"></div>`).join('');
  slides.classList.add('has-photos');
  const els = [...slides.children];
  let i = 0;
  const show = () => { els.forEach((e, n) => e.classList.toggle('is-active', n === i)); i = (i + 1) % els.length; };
  show();
  if (els.length > 1) setInterval(show, 6500);
}
main().catch((e) => console.error(e));
