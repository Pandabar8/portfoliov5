# Portfolio, Roadmap & Design Log

A living document: plain-language summary up top, the technical design and the
build plan below. Newest work first.

---

## 2026-07, Content parity: Fineas joins the portfolio, the resume matches the site

### In plain language

1. **Fineas is on the site.** The pre-launch personal-finance hub (co-founded)
   leads the projects grid as a full-width featured card: fig. 02, a wallet
   glyph, 3,400+ automated tests as the headline stat, and a dashed "in
   development, no public link yet" chip standing in for the Visit and Source
   buttons. The four existing cards renumber to figs. 03-06, with Margaux &
   Arden moving up to second.
2. **The downloadable resume now says the same thing as the site.** The PDF in
   assets/ was a June export of an older, bolder framing; the site was built
   from the July rewrite. The resume is rebuilt from that rewrite plus
   everything the site had that it lacked: Margaux & Arden, two missing
   courses (Database Systems, Software Engineering), and Fineas listed first
   with Co-founder credit.
3. **The two can't drift silently again.** The editable resume source lives at
   the repo root, untracked (`*.docx` is gitignored), and exports through
   LibreOffice. A local pre-push hook flags any push where portfolio content
   files and the resume PDF change on one side only.

### Design notes

- Featured card: `.pl-pcard-feat { grid-column: 1 / -1 }` on the existing
  2-col grid; mobile and print already collapse to one column, so the span is
  inert there. Tag capped at 62ch so the wide card doesn't run a full line.
- Status chip `.pl-pcard-status`: dashed border marks it non-interactive next
  to the solid link chips; the lightbox clones it like any acts row.
- New sprite glyph `pi-wallet` (body, card band, pocket clasp) in the house
  1.8px stroke language.
- Resume pipeline: edit `Jose-Barrientos-Resume.docx` at the repo root, then
  `soffice --headless --convert-to pdf`, output to
  `assets/Jose-Barrientos-Resume.pdf`. Word AppleScript export fails on this
  machine; LibreOffice is the converter.
- Spanish strings ship for every new key; fig labels and stack chips stay
  English by convention.

---

## 2026-07, Ambient card texture: the hero's ASCII field reaches the deck

### In plain language

1. **Every deck card has a live corner texture.** A faint field of drifting
   ASCII characters sits in each card's upper-right, colored by that
   section's own accent (emerald on Projects, cream on Experience, orchid on
   Education, the site blue on About and Skills). It uses the same character
   language and motion as the hero's ripple field, so hero and deck read as
   one system.
2. **Restraint is the point.** 7.5% intensity, picked against rendered
   side-by-side mocks of three candidate treatments; the field fades out
   well before it reaches body text, and text always paints above it.
3. **It disappears politely.** Only cards on screen draw (at ~30fps), cards
   fully covered by the next card sleep, reduced motion gets one static
   frame, and the flat mobile deck and print get nothing.

### Design notes

- `assets/card-ascii.js` mirrors `hero-ascii.js` (same ambient coefficients,
  no pointer term): one canvas per card at 1x, accent read from the card's
  live `--ca`, recolored by the same `data-theme` observer pattern.
- The corner fade is computed per cell (equivalent to a CSS corner mask), so
  cells outside it skip the trig entirely.
- Stacking: the canvas sits at `z-index: 0` and every other card child lifts
  to `z-index: 1`, so glyphs never cross text.

---

## 2026-07, Bilingual site + a leaner header

### In plain language

1. **The site speaks English and Spanish.** An EN / ES toggle sits in the
   header next to the theme button. Everything a recruiter reads translates:
   hero, bio console, project cards and their lightbox, experience,
   education, skills, footer, screen-reader labels, even the tab title.
   Tech flavor deliberately stays English: skill and tool names, stack
   chips, the Python code lines in the About console, fig. labels and the
   console UI (PROFILE LOADED, run, the trait meters).
2. **Spanish finds its audience on its own.** A browser set to Spanish gets
   Spanish on first visit; everyone else gets English. Flipping the toggle
   saves the choice (localStorage, same contract as the theme toggle) and an
   explicit choice always wins over auto-detection. The About console types
   itself in whichever language is active, and a toggle after it has typed
   swaps the text in place without replaying.
3. **The navbar is gone.** The section links and the mobile hamburger are
   removed: the page is a linear scroll deck, so the scroll is the
   navigation. The header now carries exactly five things: a Resume button,
   GitHub and LinkedIn icons (drawn in the site's stroke-icon language), the
   EN / ES toggle and the theme toggle. Under 600px the Resume button yields
   to the toggles (the footer still has a resume link).

### Open items

- The Resume button downloads the English PDF in both languages; a Spanish
  resume PDF could be added later and swapped by the same mechanism.

### Design notes

- English is never written twice: main.js harvests it from the markup
  (`data-i18n` / `data-i18n-aria` attributes) at boot, and
  `assets/i18n-es.js` carries only the Spanish strings. Strings with inline
  markup (`<mark>`, `<b>`) swap as HTML fragments, so the Spanish file
  mirrors those tags.
- An inline head script resolves `<html lang>` before first paint (saved
  choice, else `navigator.language`); `init()` applies the content swap
  first so the About window snapshot and the intro caption are built from
  the active language.
- `setupAboutWindow` re-snapshots its typed segments on language change:
  mid-type or after typing it settles instantly on the full new-language
  text; before first view it simply types the new language when scrolled in.
- Deleted with the navbar: `setupScrollspy`, `setupNav`, the hamburger
  branch of `setupAutoHideNav`, and all `.pl-nav-*` CSS including the
  mobile overlay menu. Anchor routing stays (brand and back-to-top).
- Social-card and Open Graph metadata stay English: scrapers do not run JS,
  and the canonical page is the English arrival.

---

## 2026-07, Scroll feel + section identity: tighter deck, icons, console About, overlay nav

### In plain language

1. **Scrolling tracks the wheel.** The smooth-scroll glide is much tighter
   (Lenis duration 0.75, was 1.2), so the page stops floating past where you
   pointed it.
2. **Sections get room to breathe.** Each deck card now holds fully composed
   for half a screen of scrolling before the next card starts sliding over it
   (a 50vh gap between cards; the pinned card hides the gap itself).
3. **Covered cards recede.** While the next card slides over, the covered one
   dims, scales down slightly and drifts up, so the hand-off reads as depth
   instead of a hard freeze.
4. **Icons everywhere.** A hand-set stroke-icon sprite (same language as the
   Skills cards) adds accent chips to every section head, per-project glyphs
   with faint corner watermarks, role chips in Experience, degree chips in
   Education, and small glyphs on the About facts.
5. **About is a console.** The bio now lives in a dark editor window
   (`~/profile/about_me.py`) that types itself out the first time it scrolls
   into view, ending with three personality meters. Click finishes it
   instantly, a "run" control replays it, and the full text always ships in
   the page, so no-JS, reduced-motion and print read everything.
6. **The nav gets out of the way.** The header auto-hides on downward scroll
   and returns on any upward intent (or keyboard focus); deck cards now pin
   at the very top of the screen and own the full viewport.

### Design notes

- Covered-card motion: main.js drives one `--covered` custom property per
  card; CSS maps it to the veil, scale and drift. Flow tops sum sibling
  heights AND margins (the dwell lives in `margin-top`), in both
  `stackDocTop()` and `setupDeckMotion()`.
- The About window keeps a literal dark palette in both themes; emphasized
  phrases are green syntax-colored text, not highlight pills.
- Nav overlay: the deck no longer reserves header space (`--header-h`
  removed); the bar slides via transform and keeps its layout slot, so
  nothing shifts when it hides.

---

## 2026-07, Projects revamp: fourth project, card grid, uniform deck

### In plain language

1. **New project (fig. 05): Margaux & Arden.** A one-page demo site for a
   fictional luxury wedding studio in San Salvador, built in vanilla
   HTML/CSS/JS with zero runtime dependencies and no build step. Headline
   stat: 0 runtime dependencies.
2. **Projects are now a card grid.** The four projects sit in a two-by-two
   grid of cards instead of an expandable list. Each card shows its figure,
   headline stat, title, tagline and stack (as bordered chips), plus a
   "Source" link (and a filled "View live site" link for projects that have a
   public demo). Clicking a card opens a focus-trapped detail lightbox with
   the project's bullet points; the detail also stays in the page for no-JS
   and print. The grid fits one screen, so Projects now stacks uniformly with
   the other deck cards instead of being the tall exception.
3. **Real source links.** All four projects link to their real repositories,
   and Margaux & Arden also links to its deployed live demo.
4. **Section cards stack uniformly.** About through Skills pin to the top of
   the screen and stack like a deck, and every card is sized to one screen so
   they meet the header consistently. Skills lays its four category cards in a
   single row and Experience tightens its role spacing so both clear one
   screen. (Refines the scroll-stacking deck from the 2026-06 redesign below.)

### Open items

None. Margaux & Arden's "Visit" button links to the live demo
(`pandabar8.github.io/wedding-planner-demo/`) and its "Source" link to the
`Pandabar8/wedding-planner-demo` repo.

---

## 2026-07, Audit hardening: navigation, resilience, reach

### In plain language

A deep audit of the site surfaced 21 confirmed issues; all are now fixed. The
site looks the same but behaves better in the situations that used to break:

1. **Navigation works in every direction.** Clicking an earlier section from
   lower on the page used to do nothing on desktop (the pinned deck confused
   the scroll math), and the nav highlight never updated when scrolling back
   up. Both fixed; the highlight also reaches Contact at the bottom now.
2. **Nothing gets cut off.** On common laptop screens the Projects and Skills
   cards were clipping their bottom rows unreachably. Deck cards now grow to
   their content and taller ones scroll fully into view before pinning.
3. **The page survives failure.** With JavaScript blocked or broken, the whole
   page now renders (it used to be blank below the header). Printing or
   save-as-PDF produces a clean black-on-white document instead of empty dark
   pages.
4. **Easier to find and share.** Shared links now render a proper preview card
   (og image + URL), search engines get one canonical URL, the meta
   description no longer overstates the degree, and the tab shows a JB
   favicon.
5. **Faster and more private.** Fonts are self-hosted (no Google request, no
   render-blocking stylesheet, ~128 KB of subsets), and the hero ASCII field
   draws at a quarter of its old cost when idle.
6. **Accessibility.** The skills marquee now respects the reduced-motion
   setting (and pauses on hover), and every small accent-colored label meets
   WCAG contrast in both themes.
7. **Housekeeping.** The LinkedIn footer link (which 404'd) is fixed, the
   editable resume .docx is no longer publicly served, a ?theme= link no
   longer overwrites a visitor's saved theme, scrollbars/mobile chrome match
   the theme, the ASCII field handles window resizes across the 760px
   breakpoint, and README/footer content is current.

### Design notes

- Deck cards: `min-height: 100svh` + JS-measured negative sticky `top`
  (`--deck-top`), gated behind `html.deck-ready` so no-JS gets the flat page.
  Offsets re-measure on resize, font load and accordion changes.
- Anchor scrolls and the scrollspy both derive deck positions from stack
  geometry (pinned sticky cards report their stuck rect, which is useless).
- No-JS: an inline head script sets `html.js`; all reveal hidden states are
  scoped under `:where(html.js)` (zero specificity change).
- Fonts: latin woff2 subsets under `assets/fonts/` (Archivo variable 700-800
  at 108-122% width, Plex Sans 400, Plex Mono 400/500), `font-display: swap`,
  two preloads.
- Contrast: new `--accent-text` token (brighter on dark, darker emerald on
  light projects card); fills and display text keep the original accents.

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
