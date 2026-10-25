// Visual effects only. Nothing here is required to use the site, and all of it is skipped for
// reduced-motion users and in Low bandwidth mode.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const low = () => root.classList.contains('low-bandwidth');

function init() {
  // Header gets a shadow once the page scrolls
  const onScrollHeader = () => document.getElementById('site-header')?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // Split the hero headline into words for the entrance animation (the text stays a single h1 for screen readers)
  const h1 = document.querySelector('.hero h1');
  if (h1 && !h1.dataset.split) {
    h1.dataset.split = '1';
    let i = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.append(t); return; }
            const s = document.createElement('span');
            s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = t;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) { wrap(n); }
      });
    };
    wrap(h1);
  }

  // Back-to-top button (works for everyone, including reduced motion)
  const top = document.createElement('button');
  top.type = 'button'; top.className = 'to-top'; top.setAttribute('aria-label', 'Back to top'); top.innerHTML = '&uarr;';
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  document.body.append(top);
  addEventListener('scroll', () => top.classList.toggle('is-on', scrollY > 700), { passive: true });

  if (reduce || low()) return;

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  addEventListener('scroll', progress, { passive: true });
  progress();

  // Scroll reveal. Content is injected after load by main.js, so watch for new nodes too.
  const targets = '.section__head, .card, .step, .accordion, .filters, .help-box, .dev-credit, .empty-state, .footer-grid > *';
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      el.classList.add('is-in');
      // Drop the reveal class afterwards so hover transitions on cards feel snappy
      setTimeout(() => el.classList.remove('reveal', 'is-in'), 1100);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const seen = new WeakSet();
  const scan = (scope = document) => {
    scope.querySelectorAll?.(targets).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      const sibs = el.parentElement ? [...el.parentElement.children] : [];
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6));
      el.classList.add('reveal');
      io.observe(el);
    });
  };
  scan();
  new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.matches?.(targets)) scan(n.parentElement); else scan(n);
  }))).observe(document.body, { childList: true, subtree: true });

  // Pointer effects: cursor glow + card spotlight (fine pointers only)
  if (matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow'; glow.setAttribute('aria-hidden', 'true');
    document.body.append(glow);
    let raf = 0; let px = 0; let py = 0;
    addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY; glow.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(() => { glow.style.transform = `translate(${px}px, ${py}px)`; raf = 0; });
      const card = e.target.closest?.('.card');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
