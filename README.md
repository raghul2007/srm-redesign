# SRMIST redesign concept

Unofficial redesign concept for the Next-Gen SRM Website Design Challenge ("Reimagine how the world discovers a university"). Plain HTML, CSS and vanilla JavaScript (ES modules). No framework, no build step, no paid APIs.

## Run locally

Browsers block ES modules and `fetch` on `file://`, so serve the folder:

```
cd srm-redesign
python3 -m http.server 8000
```

Open http://localhost:8000/. Any static server works.

## Deploy to Vercel

1. Push the folder to a Git repository, or run `npx vercel` inside it.
2. Framework preset: **Other**. No build command, no output directory (serve the root).
3. Vercel serves `404.html` automatically for unknown paths.
4. Replace `YOUR-DOMAIN.example` in `sitemap.xml` with the deployed domain.
5. Pages carry `noindex` and `robots.txt` disallows everything while this is a concept. Remove both only if it becomes an approved public site.

## Structure

- `css/tokens.css` is the only place colours live. TODO: replace with official brand values.
- `js/main.js` boots every page (header, footer, i18n) and holds the shared card and page initialisers.
- `js/factstamp.js` renders value + source + "Last verified". Records older than 180 days or marked `placeholder` show a warning.
- `data/*.json` holds all content. Every record has `status`, `source`, `lastVerified`.

## How to add verified data

1. Open the official page (for programmes: https://www.srmist.edu.in/program-finder/ then each programme page).
2. Copy only what is printed there. Leave anything you cannot see as `null`.
3. Set `status` to `"verified"`, `source` to the exact page URL, `lastVerified` to today (ISO, e.g. `2026-10-25`).
4. For programmes, fill `durationMonths`, `annualFeeInr` (number), `intake`, `eligibility`, `mode`, `type`, `campus`, `department` and `url`.
5. Re-verify at least every 180 days; older records show the out-of-date warning automatically.

## Known placeholders

- All six programmes are placeholders standing for programme groups.
- Campus entries (names other than Kattankulathur and canonical URLs), proof (rankings/accreditation), research entries, news dates and the two extra stories are placeholders.
- `ta.json` and `hi.json` are **draft** translations and need human review before use.
- Values marked verified in `facts.json` come from the project seed and should be re-checked on the official site.

## Gen-Z restyle (v2)

- **Look:** dark "aurora" theme by default (violet, hot pink, amber, cyan on near-black, acid-lime buttons). Light theme is still available from the theme toggle.
- **Fonts (Google Fonts):** Syne for headings, Plus Jakarta Sans for body text, Space Mono for small labels. Fallbacks to system fonts if offline.
- **Motion:** word-by-word hero entrance, floating blobs and stickers, scrolling marquee, scroll-reveal, card spotlight and lift on hover, cursor glow, scroll progress bar, animated gradient borders. All in `css/motion.css` and `js/fx.js`.
- **Accessibility kept:** motion is switched off by `prefers-reduced-motion` and by the **Low bandwidth** toggle. Contrast and focus outlines were kept.
- **Developer:** "Developer Portfolio" gradient button in the header (and "Portfolio of Developer" in the footer) plus a stylised animated name. Change the link in `DEV_URL` in `js/layout.js`.

## v3: light official theme, new features, photos and 3D tour

- **Light theme by default** (white, navy, blue, gold accent). Dark mode is still available from the "Dark mode" toggle.
- **Features borrowed from top university sites:** utility bar with official-site link, admissions helpline and text-size controls (A- / A / A+ / A++); "I am a..." audience menu; quick-link tiles; moving photo gallery; virtual tour; back-to-top button; language switcher and Low bandwidth mode.
- **Moving SRM photos:** add licensed photos to `images/gallery/` using the names in `data/gallery.json` (see `images/gallery/README.txt`). Until then the gallery shows labelled placeholder tiles. Real photos also play as a slow zoom slideshow behind the home headline.
- **Virtual tour:** `tour.html` embeds the two 3D pages kept in `tour/` (`srm-tech-park-3d.html`, `tech-park-2-hologram.html`). Tech Park 2 opens in its bright daylight mode. The hologram model needs a dark stage to look right, so it stays dark inside its frame. The 3D pages load three.js from a CDN, so they need internet.
