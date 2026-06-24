# Portfolio, Roadmap & Design Log

A living document: plain-language summary up top, the technical design and the
build plan below. Newest work first.

---

## 2026-06, Homepage redesign: stacking deck, section identity, reactive hero

### In plain language

A major visual pass on the homepage, still a plain static site (no framework,
no build step) and still fully respectful of the "reduce motion" OS setting:

1. **Scroll-stacking sections.** About, Projects, Experience, Education and
   Skills now behave like a deck of full-screen cards: each one pins to the top
   of the screen and the next slides up over it as you scroll, instead of one
   long continuous page.
2. **A colour identity per section.** Each section owns one accent colour used
   for both its background tint and its highlights, so they read as distinct
   chapters: Projects in emerald, Experience in a warm cream (a deeper bronze in
   light mode), Education in orchid. About and Skills keep the signature blue.
   Every colour is tuned to stay legible in both the dark and light themes.
3. **Livelier Skills.** The proficiency meters fill one bar at a time when the
   section appears, each bar giving a small "tick" and glow as it lands, and
   each skill card lights up with a soft glow that follows the cursor.
4. **An interactive hero.** Behind the name, the hero now carries a subtle field
   of moving characters (ASCII art) that ripples toward the cursor as you move
   across the section and recolours with the theme. It turns off for anyone who
   prefers reduced motion and on small screens.

---

## 2026-06, Motion upgrade (litebox-inspired, on-brand)

### In plain language

The portfolio gains three pieces of motion, borrowed in _behaviour_ from
litebox.ai but dressed entirely in this site's own identity (electric blue,
Archivo, the editorial sparkline look):

1. A short **intro** the first time you arrive in a session: the `JB.` monogram
   sits in a thin crosshair frame while a sparkline draws itself and a counter
   ticks `0 → 100%`, then the screen splits open (top half up, bottom half down)
   to reveal the page. About 2.4 seconds, and only on the first visit.
2. **Smooth scrolling** across the whole page, momentum with an eased settle,
   instead of the browser's stepped scroll.
3. Richer **section animations** as you scroll: content fades and staggers in,
   a few elements pop with a springy curve, and one element drifts gently
   (parallax).

Everything stays a plain static site, no framework, no build step. Anyone who
has motion turned off in their OS sees none of it and gets the page instantly.

---

### Design

Adapt litebox's mechanics to this site's brand. Stack stays vanilla; the only
new dependency is Lenis (smooth scroll), vendored locally.

**Decisions locked**

- Intro = Concept A (sparkline draw + count-up), 2.4s, first-visit-per-session.
- Aesthetic = this site's tokens (`--accent` `#3f6dff`/`#0145f2`, Archivo / IBM
  Plex), not litebox's green/Neue Montreal.
- Smooth scroll = Lenis, `duration: 1.2`, easing `t => Math.min(1, 1.001 - 2**(-10*t))`.
- Lenis is **vendored** at `assets/lenis.min.js` (no CDN) to keep the site
  dependency-free and offline-capable.

**Files touched**

| File                  | Change                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `assets/lenis.min.js` | New, vendored Lenis runtime (~10 KB)                                                                                               |
| `index.html`          | Inline pre-paint guard in `<head>` (mirrors the existing theme script); `<script src="assets/lenis.min.js">` before `main.js`      |
| `assets/main.js`      | Same IIFE: Lenis init + RAF loop, scroll-lock helper, anchor-click interception, parallax hook, intro controller, enriched reveals |
| `assets/styles.css`   | Intro-overlay styles + reveal variants (`--i` stagger, `.reveal.pop`). Reuses existing tokens and the `srDraw` keyframe            |

**Piece 1, Intro (Concept A, 2.4s).** A JS-injected fixed overlay above the real
hero. Sequence: monogram + crosshair fade in → sparkline draws (reusing the
`buildSparkArea` `.stroke` path + `srDraw`) while `countUp` runs `0→100` over
2.4s → curtains split (`cubic-bezier(.76,0,.24,1)`), crosshair collapses, overlay
unmounts. Lenis is `stop()`-ed during the intro, `start()`-ed after.

**Piece 2, Lenis smooth scroll.** Instance exposed on `window.lenis`. Anchor nav
(`a[href^='#']`) and back-to-top (`.pf-totop`) intercepted to `lenis.scrollTo()`.
The Lenis-recommended CSS in `styles.css` (`.lenis.lenis-smooth { scroll-behavior: auto !important }` plus the `height:auto`/overscroll guards) neutralizes the existing `scroll-behavior:smooth` once Lenis mounts.
`setupScrollspy()` (IntersectionObserver) and `setupScrollChrome()` (`window.scrollY`)
keep working unchanged.

**Piece 3, Section animations.** Extend the existing `.reveal`/`.in` system, do
not duplicate it:

- Stagger children via a `--i` index → `transition-delay` (metrics, skills, projects).
- `.reveal.pop` variant, scale + springy `cubic-bezier(0,.71,.2,1.4)`.
- One restrained parallax (hero chart or a section header) via `lenis.on('scroll')`.

**Safeguards**

- `prefers-reduced-motion` → no intro, no Lenis (native scroll), reveals show
  immediately. Reuses the existing `reduceMotion` flag.
- First-visit-per-session via `sessionStorage` (`hasNavigated`); otherwise skip
  the intro.
- No FOUC: pre-paint guard holds a solid `--bg` screen until the overlay mounts;
  if JS fails, the page renders normally (progressive enhancement).
- Min-duration: intro starts on `DOMContentLoaded`; curtain-split waits for
  `max(2.4s, window.load)` capped at ~4s so the percentage isn't pure theatre.

---

### Build plan

Each phase is verified on `http://localhost:8000` (`python3 -m http.server 8000`
from the project root) before the next. Reduced-motion checked every phase.

- [ ] **P0, Vendor Lenis.** Add `assets/lenis.min.js`; wire the `<script>` tag.
      Verify `window.Lenis` is defined.
- [ ] **P1, Smooth scroll.** Init Lenis + RAF loop; intercept anchor/back-to-top
      clicks. Verify: wheel/trackpad momentum, nav links glide, scrollspy still
      highlights, header shadow + back-to-top still toggle, reduced-motion = native.
- [ ] **P2, Enrich reveals.** Add `--i` stagger + `.reveal.pop` in CSS; apply to
      metrics/skills/projects; add one parallax element. Verify stagger order,
      pop curve, no layout shift, reduced-motion shows all immediately.
- [ ] **P3, Intro overlay.** Build the Concept-A overlay + scroll-lock +
      first-visit gate + pre-paint guard. Verify: first load plays once (~2.4s),
      reload in same tab skips, split reveal is clean, no FOUC, reduced-motion
      skips entirely, Lenis locked during and released after.
- [ ] **P4, Cross-cut pass.** Responsive (mobile/tablet), light + dark themes,
      Safari/Chrome/Firefox, keyboard focus not trapped under the overlay.

**Out of scope** (existing TODOs / separate decisions): real LinkedIn/GitHub
links, the photo placeholder, PDF resume, deployment, and git initialization.

**Verification gate.** No phase is "done" until its checks pass on localhost with
output observed, not assumed.
