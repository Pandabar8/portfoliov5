/* ============================================================
   Hero ASCII backdrop — "Pointer Ripple Field".
   Self-owned vanilla canvas effect. Renders a monospace ripple field
   in the hero's upper-right, reactive to the pointer. Dependency-free.
   - Reads the live theme accent (recolors on dark/light toggle).
   - Honors prefers-reduced-motion (one static frame, no loop).
   - Pauses via IntersectionObserver when the hero scrolls out of view.
   - Skips small screens; eases back on resize.
   ============================================================ */
(function () {
  "use strict";

  var createEffect = function (ctx, env) {
  var W = env.width || 0, H = env.height || 0;
  var CELL = 13;
  var D = " ·.:-~=+*∗×o◦•#%@";
  var DMAX = D.length - 1;

  var px = -9999, py = -9999;
  var spx = -9999, spy = -9999;
  var prevpx = -9999, prevpy = -9999;
  var present = false;
  var amp = 0;
  var speed = 0;
  var firstPointer = true;
  var velx = 0, vely = 0;

  var PINGS = 5;
  var pingX = new Float32Array(PINGS);
  var pingY = new Float32Array(PINGS);
  var pingT = new Float32Array(PINGS);
  var pingA = new Float32Array(PINGS);
  var pingHead = 0;
  var lastPingEmit = -1e9;

  function smoothstep(a, b, x) {
    if (b === a) return x < a ? 0 : 1;
    var u = (x - a) / (b - a);
    if (u < 0) u = 0; else if (u > 1) u = 1;
    return u * u * (3 - 2 * u);
  }

  function ambient(di, dj, t) {
    var b =
        0.34 * Math.sin(di * 0.150 + t * 0.00045)
      + 0.26 * Math.sin(dj * 0.130 - t * 0.00037)
      + 0.20 * Math.sin((di + dj) * 0.085 + t * 0.00061)
      + 0.12 * Math.sin((di - dj) * 0.190 - t * 0.00052)
      + 0.14 * Math.sin(di * 0.034 - dj * 0.021 + t * 0.00016);
    var a01 = (b + 1.06) / 2.12;
    if (a01 < 0) a01 = 0; else if (a01 > 1) a01 = 1;
    return a01;
  }

  function draw(t, animate) {
    if (W <= 0 || H <= 0) return;

    var ac = env.accent();
    var ar = ac.r, ag = ac.g, ab = ac.b;

    var alphaFloor = 0.06;
    var gain = 0.62;
    var maxAlpha = 0.72;

    var cols = Math.ceil(W / CELL) + 1;
    var rows = Math.ceil(H / CELL) + 1;

    if (animate) {
      if (firstPointer && present) {
        spx = px; spy = py; firstPointer = false;
      }
      spx += (px - spx) * 0.16;
      spy += (py - spy) * 0.16;
      amp += ((present ? 1 : 0) - amp) * 0.07;

      var dxp = px - prevpx, dyp = py - prevpy;
      var instSpeed = Math.sqrt(dxp * dxp + dyp * dyp) / 38;
      if (instSpeed > 1) instSpeed = 1;
      speed += (instSpeed - speed) * 0.22;
      velx += (dxp - velx) * 0.20;
      vely += (dyp - vely) * 0.20;

      if (present && instSpeed > 0.42 && (t - lastPingEmit) > 90) {
        pingX[pingHead] = spx;
        pingY[pingHead] = spy;
        pingT[pingHead] = t;
        pingA[pingHead] = instSpeed;
        pingHead = (pingHead + 1) % PINGS;
        lastPingEmit = t;
      }

      prevpx = px; prevpy = py;
    } else {
      amp = 0;
    }

    var sigma = 165;
    var twoSigmaSq = 2 * sigma * sigma;
    var breathe = 0.5 + 0.5 * Math.sin(t * 0.00052);

    var useCursor = animate && amp > 0.003;
    var spxL = spx, spyL = spy, ampL = amp, speedL = speed;
    var vmag = Math.sqrt(velx * velx + vely * vely);
    var vnx = 0, vny = 0;
    if (vmag > 0.0001) { vnx = velx / vmag; vny = vely / vmag; }

    var lastBucket = -1, lastHot = -1;

    for (var i = 0; i < cols; i++) {
      var cx = i * CELL + CELL * 0.5;
      var mx = 1;
      if (mx <= 0.001) continue;
      var mxR = 1 - 0.18 * smoothstep(0.86, 1.0, i / cols);
      mx *= mxR;

      for (var j = 0; j < rows; j++) {
        var cy = j * CELL + CELL * 0.5;

        var di = i, dj = j;
        var boost = 0;
        var hot = 0;

        if (useCursor) {
          var ddx = cx - spxL, ddy = cy - spyL;
          var d2 = ddx * ddx + ddy * ddy;
          if (d2 < 270000) {
            var d = Math.sqrt(d2);
            var g = Math.exp(-d2 / twoSigmaSq);
            if (g > 0.004) {
              var ripple = Math.cos(d * 0.046 - t * 0.011) * Math.exp(-d / 250);
              var inv = d > 0.0001 ? 1 / d : 0;
              var dirx = ddx * inv, diry = ddy * inv;
              var wake = -(dirx * vnx + diry * vny);
              wake = wake > 0 ? wake * wake : 0;
              var core = ampL * g * (0.50 + 0.42 * ripple);
              boost = core * (0.66 + 0.62 * speedL) * (1 + 0.85 * wake);
              var warp = boost * 2.1;
              di = i + dirx * warp;
              dj = j + diry * warp;
              hot = core;
            }
          }
        }

        if (animate) {
          for (var p = 0; p < PINGS; p++) {
            var pa = pingA[p];
            if (pa <= 0.001) continue;
            var age = (t - pingT[p]) * 0.001;
            if (age > 1.5) { pingA[p] = 0; continue; }
            var life = 1 - age / 1.5;
            var rad = age * 360;
            var pdx = cx - pingX[p], pdy = cy - pingY[p];
            var pd = Math.sqrt(pdx * pdx + pdy * pdy);
            var band = pd - rad;
            var ring = Math.exp(-(band * band) / 1800);
            if (ring > 0.01) {
              boost += pa * life * life * ring * 0.55;
            }
          }
        }

        var a01 = ambient(di, dj, t);
        var v = a01 * (0.40 + 0.20 * breathe) + boost;
        if (v < 0) v = 0;

        var idx = (v * DMAX + 0.5) | 0;
        if (idx <= 0) continue;
        if (idx > DMAX) idx = DMAX;

        var alpha = (alphaFloor + v * gain) * mx;
        if (alpha > maxAlpha) alpha = maxAlpha;
        if (alpha < 0.014) continue;

        var hotState = (hot > 0.40) ? (hot > 0.72 ? 2 : 1) : 0;
        var bucket = (alpha * 16) | 0;

        if (bucket !== lastBucket || hotState !== lastHot) {
          lastBucket = bucket;
          lastHot = hotState;
          var fa = (bucket / 16 + 0.5 / 16);
          if (fa > maxAlpha) fa = maxAlpha;
          if (hotState === 0) {
            ctx.fillStyle = env.rgba(fa);
          } else {
            var k = hotState === 2 ? 0.42 : 0.22;
            var hr = (ar + (255 - ar) * k) | 0;
            var hg = (ag + (255 - ag) * k) | 0;
            var hb = (ab + (255 - ab) * k) | 0;
            ctx.fillStyle = "rgba(" + hr + "," + hg + "," + hb + "," + fa.toFixed(3) + ")";
          }
        }

        ctx.fillText(D.charAt(idx), cx, cy);
      }
    }
  }

  env.setFont(CELL);

  return {
    frame: function (t) {
      env.setFont(CELL);
      draw(t, !env.prefersReducedMotion);
    },
    resize: function (w, h) {
      W = w; H = h;
      env.setFont(CELL);
    },
    pointer: function (x, y, inside) {
      if (inside) {
        px = x; py = y;
        if (!present) {
          if (firstPointer) { spx = x; spy = y; prevpx = x; prevpy = y; }
          else { prevpx = x; prevpy = y; }
        }
        present = true;
      } else {
        present = false;
      }
    },
    stop: function () {}
  };
};

  function hexToRgb(hex) {
    hex = (hex || "").trim().replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(hex, 16);
    if (isNaN(n)) return { r: 63, g: 109, b: 255 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function init() {
    var canvas = document.getElementById("hero-ascii");
    if (!canvas || !canvas.getContext) return;
    // no cursor field on touch / small layouts
    if (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var sr = document.querySelector(".sr") || document.documentElement;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var accent = { r: 63, g: 109, b: 255 };
    var BOOST = 2.0;

    function recompute() {
      var v = getComputedStyle(sr).getPropertyValue("--accent");
      if (v) accent = hexToRgb(v);
    }

    var env = {
      width: 0, height: 0,
      accent: function () { return accent; },
      rgba: function (a) { a *= BOOST; if (a < 0) a = 0; else if (a > 1) a = 1; return "rgba(" + accent.r + "," + accent.g + "," + accent.b + "," + a + ")"; },
      density: " .:-=+*#%@",
      setFont: function (px) { ctx.font = px + 'px "IBM Plex Mono", ui-monospace, Menlo, monospace'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; },
      prefersReducedMotion: reduce,
    };

    var ctrl = null, raf = null, t0 = 0, elapsed = 0, visible = true;
    function now() { return (window.performance && performance.now) ? performance.now() : 0; }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      env.width = W; env.height = H;
      if (ctrl && ctrl.resize) { try { ctrl.resize(W, H); } catch (e) {} }
      if (reduce) renderStatic();
    }
    function renderStatic() {
      if (!ctrl) return;
      ctx.clearRect(0, 0, W, H);
      try { ctrl.frame(2600); } catch (e) {}
    }
    function loop() {
      if (!visible || reduce) { raf = null; return; }
      elapsed = now() - t0;
      ctx.clearRect(0, 0, W, H);
      try { ctrl.frame(elapsed); } catch (e) {}
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (reduce) { renderStatic(); return; }
      if (raf) return;
      t0 = now() - elapsed; // resume where we paused
      raf = requestAnimationFrame(loop);
    }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    recompute();
    resize();
    try { ctrl = createEffect(ctx, env); if (ctrl.resize) ctrl.resize(W, H); } catch (e) { return; }

    window.addEventListener("mousemove", function (e) {
      if (!ctrl || !ctrl.pointer) return;
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      try { ctrl.pointer(x, y, x >= 0 && y >= 0 && x <= W && y <= H); } catch (er) {}
    }, { passive: true });
    window.addEventListener("mouseout", function () { if (ctrl && ctrl.pointer) { try { ctrl.pointer(0, 0, false); } catch (e) {} } });

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    requestAnimationFrame(resize);

    var hero = (canvas.closest && canvas.closest(".pl-hero")) || canvas.parentNode;
    if (window.IntersectionObserver && hero) {
      new IntersectionObserver(function (ents) {
        for (var i = 0; i < ents.length; i++) {
          visible = ents[i].isIntersecting;
          if (visible) start(); else stop();
        }
      }, { rootMargin: "0px" }).observe(hero);
    }
    if (window.MutationObserver) {
      new MutationObserver(recompute).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    start();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
