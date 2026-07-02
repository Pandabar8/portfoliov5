# Jose Andres Barrientos, Portfolio

A single-page data-analyst portfolio. Dependency-free static site: semantic HTML,
one stylesheet, vanilla JS. No build step, no framework, no CDN calls (fonts are
self-hosted), host-ready.

## Design

Direction **C3 "Final"**, a data-journalism editorial structure (annotated metrics,
fig-numbered projects, timeline) re-typeset in **Archivo** extra-wide caps, with
sparkline bars under each headline metric and a "ledger" footer (skills marquee,
outline "LET'S TALK" that fills on hover, three-column footer bar).

- **Theme:** dark by default, with a dark/light toggle in the header (persists per
  browser via `localStorage`; deep-linkable with `?theme=light` / `?theme=dark`)
- **Accent:** Electric blue, `#0145F2` in light mode, brightened to `#3f6dff` on
  dark for legible contrast
- **Type:** Archivo (display) · IBM Plex Sans (body) · IBM Plex Mono (labels)
- **Motion:** scroll-triggered reveals, count-up metrics, sparklines that draw on
  entry, lift-&-glow hover. All gated behind `prefers-reduced-motion`.
- **Behaviour:** sticky nav with scrollspy, mobile menu, expandable project cards
  (the chart grows to fill the card when opened), back-to-top.

## Run locally

It is plain static files, open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Serving (rather than `file://`) is recommended so the resume download and font
loading behave exactly as in production.

## Deploy

Drag the folder onto Netlify Drop, or push to GitHub and enable Pages / Vercel /
Cloudflare Pages. No configuration needed, `index.html` is the entry point.

## Structure

```
index.html                        Page markup + baked content, head metadata
favicon.ico                       Legacy favicon fallback (SVG is primary)
assets/styles.css                 All styling (tokens, components, deck, print, responsive)
assets/main.js                    Deck fit, Lenis, intro, charts, count-up, reveals,
                                  scrollspy, nav, accordion, theme toggle
assets/hero-ascii.js              Hero "pointer ripple field" canvas backdrop
assets/lenis.min.js               Vendored Lenis smooth-scroll runtime (v1.3.23)
assets/fonts/                     Self-hosted woff2 subsets (Archivo, IBM Plex)
assets/og.png                     1200x630 social share card
assets/favicon.svg                Favicon (JB monogram)
assets/apple-touch-icon.png       iOS home-screen icon
assets/photo.jpg                  About-section photo
assets/Jose-Barrientos-Resume.pdf Resume (linked from the nav + footer)
```

The canonical deployment is <https://pandabar8.github.io/portfoliov5/>
(declared via `<link rel="canonical">` and the Open Graph URL).

All metrics and project numbers come straight from the resume, nothing invented.
