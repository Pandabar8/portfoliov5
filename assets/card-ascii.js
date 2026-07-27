/* ============================================================
   Deck-card ASCII backdrop — "Ambient Corner Field".
   Companion to hero-ascii.js: the hero's ambient drift rendered as a
   faint accent-colored micro-texture in each deck card's upper-right
   corner. Self-owned vanilla canvas effect, dependency-free.
   - One canvas per .pl-stack card, inserted by JS; a page without
     scripts renders the plain cards.
   - Reads each card's live --ca accent (recolors on dark/light toggle).
   - Honors prefers-reduced-motion (one static frame, no loop).
   - Draws only cards in view, sleeps fully covered ones, idles at ~30fps.
   - Skips the flat <=900px deck; eases back on resize.
   ============================================================ */
(function () {
  "use strict";

  var CELL = 13;
  var D = " ·.:-~=+*∗×o◦•#%@";
  var DMAX = D.length - 1;
  // tuned by eye on a side-by-side treatment mock
  var INTENSITY = 0.075;

  // same coefficients as hero-ascii.js: the two fields read as one
  // family of motion, just without the pointer term
  function ambient(di, dj, t) {
    var b =
      0.34 * Math.sin(di * 0.15 + t * 0.00045) +
      0.26 * Math.sin(dj * 0.13 - t * 0.00037) +
      0.2 * Math.sin((di + dj) * 0.085 + t * 0.00061) +
      0.12 * Math.sin((di - dj) * 0.19 - t * 0.00052) +
      0.14 * Math.sin(di * 0.034 - dj * 0.021 + t * 0.00016);
    var a01 = (b + 1.06) / 2.12;
    if (a01 < 0) a01 = 0;
    else if (a01 > 1) a01 = 1;
    return a01;
  }

  function init() {
    var cards = document.querySelectorAll(".pl-stack > .pl-card");
    if (!cards.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // the deck flattens at <=900px; the field goes with it
    var mqSmall = window.matchMedia
      ? window.matchMedia("(max-width: 900px)")
      : null;
    function smallNow() {
      return !!(mqSmall && mqSmall.matches);
    }

    // decorative layer rendered at 1x, the same crispness-for-cost
    // trade hero-ascii.js accepts
    var fields = [];
    for (var c = 0; c < cards.length; c++) {
      var canvas = document.createElement("canvas");
      canvas.className = "pl-card-ascii";
      canvas.setAttribute("aria-hidden", "true");
      var cctx = canvas.getContext && canvas.getContext("2d");
      if (!cctx) return;
      cards[c].insertBefore(canvas, cards[c].firstChild);
      fields.push({
        card: cards[c],
        ctx: cctx,
        canvas: canvas,
        W: 0,
        H: 0,
        color: "#3f6dff",
        visible: true,
      });
    }

    function recolor() {
      for (var i = 0; i < fields.length; i++) {
        var v = getComputedStyle(fields[i].card).getPropertyValue("--ca");
        if (v) fields[i].color = v.trim();
      }
    }

    function sizeField(f) {
      // layout size, not getBoundingClientRect: the covered-card scale
      // transform must not feed back into the buffer size
      f.W = Math.max(1, f.card.offsetWidth);
      f.H = Math.max(1, f.card.offsetHeight);
      f.canvas.width = f.W;
      f.canvas.height = f.H;
      // sizing resets canvas state; restore the font with it
      f.ctx.font = '12px "IBM Plex Mono", ui-monospace, Menlo, monospace';
    }

    function drawField(f, t) {
      var ctx = f.ctx,
        W = f.W,
        H = f.H;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = f.color;
      var cols = Math.ceil(W / CELL);
      var rows = Math.ceil(H / CELL);
      // corner fade, equivalent to the mock's CSS mask
      // radial-gradient(95% 130% at 100% 0%, black, transparent 72%),
      // computed per cell so everything outside it skips the trig
      var rx = W * 0.95,
        ry = H * 1.3;
      for (var j = 0; j < rows; j++) {
        var y = (j + 1) * CELL;
        var dy = (j * CELL + CELL * 0.5) / ry;
        for (var i = 0; i < cols; i++) {
          var dx = (W - (i * CELL + CELL * 0.5)) / rx;
          var m = 1 - Math.sqrt(dx * dx + dy * dy) / 0.72;
          if (m <= 0.02) continue;
          if (m > 1) m = 1;
          var a = ambient(i, j, t);
          var idx = (a * DMAX + 0.5) | 0;
          if (idx <= 0) continue;
          ctx.globalAlpha = INTENSITY * (0.3 + 0.7 * a) * m;
          ctx.fillText(D.charAt(idx), i * CELL, y);
        }
      }
      ctx.globalAlpha = 1;
    }

    // a fully covered card sits behind the opaque card above it;
    // --covered is written inline by setupDeckMotion, so reading it
    // back costs no style recalc
    function coveredNow(f) {
      var v = parseFloat(f.card.style.getPropertyValue("--covered"));
      return v >= 0.999;
    }

    var raf = null,
      t0 = 0,
      elapsed = 0,
      lastDraw = -1e9;
    function now() {
      return window.performance && performance.now ? performance.now() : 0;
    }
    function anyOn() {
      for (var i = 0; i < fields.length; i++)
        if (fields[i].visible) return true;
      return false;
    }

    function loop() {
      if (reduce) {
        raf = null;
        return;
      }
      raf = requestAnimationFrame(loop);
      var t = now() - t0;
      if (t - lastDraw < 1000 / 30 - 1) return;
      lastDraw = t;
      elapsed = t;
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (!f.visible || coveredNow(f)) continue;
        try {
          drawField(f, t);
        } catch (e) {}
      }
    }

    function renderStatic() {
      for (var i = 0; i < fields.length; i++) {
        try {
          drawField(fields[i], 2600);
        } catch (e) {}
      }
    }
    function resizeAll() {
      for (var i = 0; i < fields.length; i++) sizeField(fields[i]);
      if (reduce) renderStatic();
    }
    function start() {
      if (smallNow()) return;
      if (reduce) {
        renderStatic();
        return;
      }
      if (raf) return;
      t0 = now() - elapsed; // resume where we paused
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    recolor();
    resizeAll();

    var rt;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(rt);
        rt = setTimeout(resizeAll, 150);
      },
      { passive: true },
    );
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(resizeAll);

    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(
        function (ents) {
          for (var i = 0; i < ents.length; i++) {
            for (var k = 0; k < fields.length; k++) {
              if (fields[k].card === ents[i].target) {
                fields[k].visible = ents[i].isIntersecting;
              }
            }
          }
          if (anyOn()) start();
          else stop();
        },
        { rootMargin: "0px" },
      );
      for (var o = 0; o < fields.length; o++) io.observe(fields[o].card);
    }

    if (window.MutationObserver) {
      new MutationObserver(function () {
        recolor();
        if (reduce) renderStatic();
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    if (mqSmall) {
      var onMqSmall = function () {
        if (smallNow()) {
          stop();
        } else {
          resizeAll();
          start();
        }
      };
      if (mqSmall.addEventListener)
        mqSmall.addEventListener("change", onMqSmall);
      else if (mqSmall.addListener) mqSmall.addListener(onMqSmall);
    }

    start();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
