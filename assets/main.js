/* ============================================================
   Portfolio behaviour, dependency-free.
   Decorative sparklines, count-up, scroll reveals, scrollspy,
   sticky nav, mobile menu, project accordion, back-to-top.
   ============================================================ */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // The intro plays once per session and only when motion is allowed. Other
  // setup steps key off this so they do not fire behind the curtain.
  var introWillPlay = (function () {
    if (reduceMotion) return false;
    try {
      return sessionStorage.getItem("hasNavigated") !== "true";
    } catch (e) {
      return true;
    }
  })();
  // Callbacks waiting for the intro to finish (or run now if it never plays).
  var introDoneQueue = [];
  function onIntroDone(fn) {
    if (introWillPlay) introDoneQueue.push(fn);
    else fn();
  }
  function fireIntroDone() {
    var q = introDoneQueue;
    introDoneQueue = [];
    q.forEach(function (fn) {
      fn();
    });
  }

  /* Decorative data series (shape only, no fabricated labels). */
  var SR_SERIES = {
    metrics: [
      [2, 4, 3, 6, 5, 8, 9, 12],
      [3, 3, 5, 4, 7, 8, 7, 10],
      [10, 9, 7, 8, 5, 4, 3, 2],
      [3, 5, 7, 6, 9, 11, 12, 14],
    ],
    projects: {
      "gh-issues": [3, 6, 4, 8, 7, 12, 10, 15, 13, 18],
      "road-damage": [12, 10, 11, 8, 7, 5, 6, 4, 3, 2],
      minimax: [14, 11, 12, 8, 9, 6, 5, 4, 3, 2],
      "margaux-arden": [2, 4, 3, 6, 8, 7, 11, 10, 14, 17],
    },
  };

  var MARQUEE_SKILLS = [
    "Excel",
    "Power BI",
    "Python",
    "SQL",
    "JavaScript",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "PyTorch",
    "TensorFlow",
    "Git",
    "AWS",
    "Tableau",
  ];

  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) node.setAttribute(k, attrs[k]);
      }
    }
    return node;
  }

  /* Map a 1-D series to [x, y] points inside a w x h box. */
  function srPoints(data, w, h, pad) {
    pad = pad || 2;
    var max = Math.max.apply(null, data);
    var min = Math.min.apply(null, data);
    var span = max - min || 1;
    return data.map(function (d, i) {
      var x = pad + (i / (data.length - 1)) * (w - pad * 2);
      var y = h - pad - ((d - min) / span) * (h - pad * 2);
      return [x, y];
    });
  }

  /* Area chart with optional grid lines (matches prototype SparkArea). */
  function buildSparkArea(data, id, grid) {
    var w = 560,
      h = 320;
    var pts = srPoints(data, w, h, 6);
    var line = pts
      .map(function (p, i) {
        return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1);
      })
      .join(" ");
    var area = line + " L" + (w - 6) + " " + h + " L6 " + h + " Z";
    var gid = "srg-" + id;

    var svg = el("svg", {
      class: "spark-area",
      width: "100%",
      height: "100%",
      viewBox: "0 0 " + w + " " + h,
      preserveAspectRatio: "none",
      "aria-hidden": "true",
    });

    var defs = el("defs");
    var grad = el("linearGradient", {
      id: gid,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    grad.appendChild(
      el("stop", {
        offset: "0%",
        "stop-color": "var(--accent)",
        "stop-opacity": "0.30",
      }),
    );
    grad.appendChild(
      el("stop", {
        offset: "100%",
        "stop-color": "var(--accent)",
        "stop-opacity": "0",
      }),
    );
    defs.appendChild(grad);
    svg.appendChild(defs);

    for (var i = 0; i < (grid || 0); i++) {
      svg.appendChild(
        el("line", {
          x1: "0",
          x2: w,
          y1: (h / grid) * (i + 0.5),
          y2: (h / grid) * (i + 0.5),
          stroke: "var(--line-soft)",
          "stroke-width": "1",
        }),
      );
    }

    svg.appendChild(
      el("path", { class: "fill", d: area, fill: "url(#" + gid + ")" }),
    );
    svg.appendChild(
      el("path", {
        class: "stroke",
        d: line,
        pathLength: "1",
        fill: "none",
        stroke: "var(--accent)",
        "stroke-width": "1.5",
      }),
    );
    return svg;
  }

  /* Bar sparkline (matches prototype SparkBars). */
  function buildSparkBars(data, w, h) {
    w = w || 150;
    h = h || 26;
    var max = Math.max.apply(null, data);
    var bw = w / data.length - 3;
    var svg = el("svg", {
      class: "spark-bars",
      width: w,
      height: h,
      viewBox: "0 0 " + w + " " + h,
      "aria-hidden": "true",
    });
    data.forEach(function (d, i) {
      var rect = el("rect", {
        x: i * (w / data.length),
        y: h - (d / max) * h,
        width: bw,
        height: (d / max) * h,
        fill: "var(--accent)",
        opacity: 0.25 + 0.75 * (i / (data.length - 1)),
      });
      rect.style.animationDelay = i * 70 + "ms";
      svg.appendChild(rect);
    });
    return svg;
  }

  function buildCharts() {
    document.querySelectorAll("[data-spark-area]").forEach(function (host) {
      var key = host.getAttribute("data-spark-area");
      var grid = parseInt(host.getAttribute("data-grid"), 10) || 0;
      var series = SR_SERIES.projects[key];
      if (series) host.appendChild(buildSparkArea(series, key, grid));
    });
    document.querySelectorAll("[data-spark-bars]").forEach(function (host) {
      var idx = parseInt(host.getAttribute("data-spark-bars"), 10);
      var series = SR_SERIES.metrics[idx];
      if (series) host.appendChild(buildSparkBars(series));
    });
  }

  function buildMarquee() {
    var marquee = document.querySelector(".lg-marquee");
    var track = marquee && marquee.querySelector(".track");
    var sets = Array.prototype.slice.call(
      document.querySelectorAll(".marquee-set"),
    );
    if (!marquee || !track || !sets.length) return;

    // word immediately followed by a dot; the dot's symmetric padding (CSS)
    // is the only spacing, so each dot sits centered between its two words.
    var unit = MARQUEE_SKILLS.map(function (s) {
      return s + "<i>&middot;</i>";
    }).join("");

    // The track holds two identical sets and animates translateX(0 -> -50%),
    // which only loops cleanly while ONE set is at least the viewport wide. The
    // skills run (~1444px) is narrower than wide screens, so on its own it
    // leaves a gap at the loop point. Repeat the run inside each set until a
    // set spans the viewport, and scale the duration with the run count so the
    // scroll speed stays constant regardless of how many runs are needed.
    var SECONDS_PER_RUN = 26;
    var unitW = 0;
    var reps = 0;

    function measureUnit() {
      var probe = document.createElement("span");
      probe.className = "marquee-set";
      probe.style.cssText =
        "position:absolute;visibility:hidden;white-space:nowrap";
      probe.innerHTML = unit;
      marquee.appendChild(probe);
      var w = probe.getBoundingClientRect().width;
      marquee.removeChild(probe);
      return w;
    }

    function fit() {
      if (!unitW) unitW = measureUnit();
      var need = unitW > 0 ? Math.ceil(marquee.clientWidth / unitW) + 1 : 1;
      if (need === reps) return;
      reps = need;
      var html = "";
      for (var i = 0; i < reps; i++) html += unit;
      sets.forEach(function (node) {
        node.innerHTML = html;
      });
      track.style.animationDuration = reps * SECONDS_PER_RUN + "s";
    }

    fit();
    // the mono font's real metrics change the measured width once it loads
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        unitW = 0;
        reps = 0;
        fit();
      });
    }
    // refit when the viewport grows past the current fill
    window.addEventListener("resize", debounce(fit, 200), { passive: true });
  }

  /* Count metric numbers up from 0 with an eased curve. */
  function countUp(node, target, duration, delay) {
    if (reduceMotion) {
      node.textContent = String(target);
      return;
    }
    var start = null;
    function tick(now) {
      if (start === null) start = now + delay;
      if (now < start) {
        requestAnimationFrame(tick);
        return;
      }
      var p = Math.min(1, (now - start) / duration);
      var v = target * (1 - Math.pow(1 - p, 3));
      node.textContent = String(Math.round(v));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // Safety net: guarantee the final value even if rAF is throttled.
    setTimeout(
      function () {
        node.textContent = String(target);
      },
      delay + duration + 200,
    );
  }

  /* Choreographed hero reveal, run once the curtain opens (or immediately when
     no intro plays). The kicker fades, the name rises line-by-line behind a
     clip mask, the summary follows, then the four metrics land one at a time
     with their numbers counting up as each card arrives. */
  function revealHero() {
    var hero = document.querySelector(".pl-hero");
    if (!hero) return;
    var kicker = hero.querySelector(".pl-kicker");
    var name = hero.querySelector(".pl-name");
    var intro = hero.querySelector(".pl-hero-intro");
    var metrics = Array.prototype.slice.call(
      hero.querySelectorAll(".pl-metric"),
    );
    var foot = hero.querySelector(".pl-footnotes");

    function countMetric(m) {
      var c = m.querySelector(".cnt");
      if (c) countUp(c, parseInt(c.getAttribute("data-count"), 10), 1100, 0);
    }

    // Reduced motion: the hidden states live behind the motion query, so the
    // hero is already visible, just settle the numbers and bail.
    if (reduceMotion) {
      metrics.forEach(countMetric);
      return;
    }

    if (kicker)
      setTimeout(function () {
        kicker.classList.add("in");
      }, 60);
    if (name)
      setTimeout(function () {
        name.classList.add("in");
      }, 260);
    if (intro)
      setTimeout(function () {
        intro.classList.add("in");
      }, 900);

    var base = 1500;
    var step = 230;
    metrics.forEach(function (m, i) {
      setTimeout(
        function () {
          m.classList.add("in");
          countMetric(m);
        },
        base + i * step,
      );
    });
    if (foot)
      setTimeout(
        function () {
          foot.classList.add("in");
        },
        base + metrics.length * step + 100,
      );
  }

  /* Reveal-on-scroll for static elements + project cards. */
  function setupReveals() {
    var els = Array.prototype.slice
      .call(document.querySelectorAll(".reveal, .reveal-group"))
      // Hero elements are choreographed by revealHero() once the curtain
      // opens, so keep them out of the scroll observer.
      .filter(function (node) {
        return !node.closest(".pl-hero");
      });
    if (!els.length) return;
    var show = function (node) {
      node.classList.add("in");
    };

    if (!("IntersectionObserver" in window)) {
      els.forEach(show);
      return;
    }
    // Reveal each element as it scrolls in. Elements marked data-reveal-mid
    // hold until they reach the middle of the viewport rather than its edge.
    function onIntersect(entries, observer) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          show(e.target);
          observer.unobserve(e.target);
        }
      });
    }
    var ioEdge = new IntersectionObserver(onIntersect, {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    });
    var ioMid = new IntersectionObserver(onIntersect, {
      threshold: 0,
      rootMargin: "0px 0px -35% 0px",
    });
    els.forEach(function (node) {
      (node.hasAttribute("data-reveal-mid") ? ioMid : ioEdge).observe(node);
    });
  }

  /* Debounced trailing-edge callback for settle-sensitive listeners. */
  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  /* Document-space top of a pinned deck card. Stuck sticky cards report
     their pinned rect (top 0), which breaks any geometry that reads it, so
     cards resolve via the stack container (never sticky) plus the preceding
     siblings' layout heights. Returns null when the element is not a pinned
     deck card so callers fall back to rect math or native behavior. */
  function stackDocTop(el, scroll) {
    var card = el.closest(".pl-stack > .pl-card");
    if (!card || getComputedStyle(card).position !== "sticky") return null;
    var top = card.parentElement.getBoundingClientRect().top + scroll;
    for (
      var sib = card.parentElement.firstElementChild;
      sib && sib !== card;
      sib = sib.nextElementSibling
    ) {
      top += sib.offsetHeight;
    }
    return top;
  }

  /* Highlight the nav link for the section in view. Position-based rather
     than IntersectionObserver: pinned deck cards stay "intersecting" while
     later cards slide over them, so an observer never re-fires for an
     earlier card when scrolling back up. */
  function setupScrollspy() {
    var links = {};
    var order = [];
    document
      .querySelectorAll(".pl-nav-links a[href^='#']")
      .forEach(function (a) {
        var id = a.getAttribute("href").slice(1);
        var el = id !== "top" && document.getElementById(id);
        if (!el) return;
        links[id] = a;
        order.push(el);
      });
    if (!order.length) return;

    function docTop(el) {
      var top = stackDocTop(el, window.scrollY);
      return top !== null
        ? top
        : el.getBoundingClientRect().top + window.scrollY;
    }

    var active = null;
    function spy() {
      var y = window.scrollY;
      var line = y + window.innerHeight * 0.4;
      var atEnd =
        y + window.innerHeight >= document.documentElement.scrollHeight - 2;
      var current = null;
      for (var i = 0; i < order.length; i++) {
        if (docTop(order[i]) <= line) current = order[i].id;
      }
      // the last section may never reach the 40% line on short pages
      if (atEnd) current = order[order.length - 1].id;
      if (current === active) return;
      active = current;
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle("active", id === current);
      });
    }
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          spy();
        });
      },
      { passive: true },
    );
    spy();
  }

  /* Sticky header shadow + back-to-top visibility. */
  function setupScrollChrome() {
    var header = document.getElementById("site-header");
    var toTop = document.querySelector(".pf-totop");
    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle("stuck", y > 12);
      if (toTop) toTop.classList.toggle("show", y > 700);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Stacking deck: cards pin just below the sticky header so a covered
     card's top edge stays visible while the next slides over it. Cards
     taller than the remaining viewport pin lower so their bottom scrolls
     into view before the next card arrives. Sticky mode only engages after
     the first measurement (html.deck-ready), so a JS failure leaves the
     flat, fully readable layout. */
  function setupDeckFit() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".pl-stack > .pl-card"),
    );
    if (!cards.length) return;
    var header = document.getElementById("site-header");
    function fit() {
      var headerH = header ? header.offsetHeight : 0;
      document.documentElement.style.setProperty("--header-h", headerH + "px");
      // read every height before writing: interleaving reads with the
      // --deck-top writes forces a layout per card while the accordion
      // transition has the observer refitting every frame
      var overs = cards.map(function (card) {
        return card.offsetHeight - (window.innerHeight - headerH);
      });
      cards.forEach(function (card, i) {
        var top = headerH - Math.max(0, overs[i]) + "px";
        if (card.style.getPropertyValue("--deck-top") !== top) {
          card.style.setProperty("--deck-top", top);
        }
      });
      document.documentElement.classList.add("deck-ready");
    }
    fit();
    // Re-measure when anything changes a card's height: viewport resizes,
    // web fonts swapping in, or the projects accordion opening/closing.
    window.addEventListener("resize", debounce(fit, 150), { passive: true });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(fit);
      cards.forEach(function (c) {
        ro.observe(c);
      });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* Smooth scroll via Lenis; native scroll when motion is reduced. */
  function setupLenis() {
    if (reduceMotion || !window.Lenis) return;
    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      touchMultiplier: 2,
    });
    window.lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* Route in-page anchors. Independent of Lenis on purpose: native fragment
     navigation resolves a pinned deck card's stuck rect and goes nowhere
     when navigating upward, so deck targets always scroll to their computed
     stack offset (through Lenis for the eased settle when it's running, an
     animated window scroll when it is not). Flat-layout targets keep native
     behavior without Lenis: scroll-margin handles the sticky header. */
  function setupAnchorNav() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href^='#']");
      if (!link) return;
      var href = link.getAttribute("href");
      if (href === "#") return;
      var el = href === "#top" ? null : document.getElementById(href.slice(1));
      if (href !== "#top" && !el) return;
      var scroll = window.lenis ? window.lenis.scroll : window.scrollY;
      var top = href === "#top" ? 0 : stackDocTop(el, scroll);
      if (top === null) {
        if (window.lenis) {
          e.preventDefault();
          window.lenis.scrollTo(el);
        }
        return;
      }
      e.preventDefault();
      if (window.lenis) window.lenis.scrollTo(top);
      else window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* First-visit intro: monogram + crosshair, a sparkline that draws and a
     0->100 counter, then two curtains split apart to reveal the page.
     Shown once per session; skipped entirely when motion is reduced. */
  function setupIntro() {
    var host = document.querySelector(".sr") || document.body;
    var locked = false;
    var overlay = null;

    function unarm() {
      document.documentElement.classList.remove("intro-arming");
    }
    // Make the page behind the overlay unreachable by keyboard and AT while
    // the intro covers it. Skips the overlay itself so its (aria-hidden)
    // visuals are unaffected. Restored on every exit path via release().
    function pageInert(on) {
      Array.prototype.forEach.call(host.children, function (node) {
        if (node === overlay || node.nodeType !== 1) return;
        if (on) {
          node.setAttribute("inert", "");
          node.setAttribute("aria-hidden", "true");
        } else {
          node.removeAttribute("inert");
          node.removeAttribute("aria-hidden");
        }
      });
    }
    // Release scroll no matter which path we exit through.
    function release() {
      if (!locked) return;
      locked = false;
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      pageInert(false);
      if (window.lenis) window.lenis.start();
      fireIntroDone();
    }
    function lock() {
      locked = true;
      if (window.lenis) window.lenis.stop();
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    var seen = false;
    try {
      seen = sessionStorage.getItem("hasNavigated") === "true";
    } catch (e) {}

    // No intro when motion is reduced or we have already navigated this
    // session: make sure the page is visible and scrolling is free.
    if (reduceMotion || seen) {
      unarm();
      release();
      return;
    }

    // Build the overlay (static content only, no untrusted markup).
    overlay = document.createElement("div");
    overlay.className = "intro";
    overlay.setAttribute("aria-hidden", "true");

    var curtainTop = document.createElement("div");
    curtainTop.className = "intro-curtain top";
    var curtainBottom = document.createElement("div");
    curtainBottom.className = "intro-curtain bottom";
    var crossH = document.createElement("div");
    crossH.className = "intro-cross-h";
    var crossV = document.createElement("div");
    crossV.className = "intro-cross-v";

    var center = document.createElement("div");
    center.className = "intro-center";
    var cluster = document.createElement("div");
    cluster.className = "intro-cluster";

    var mark = document.createElement("div");
    mark.className = "intro-mark";
    mark.appendChild(document.createTextNode("JB"));
    var dot = document.createElement("em");
    dot.textContent = ".";
    mark.appendChild(dot);

    var spark = el("svg", {
      class: "intro-spark",
      viewBox: "0 0 300 46",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
    });
    spark.appendChild(el("polyline", { class: "grid", points: "0,40 300,40" }));
    var line = el("polyline", {
      points:
        "0,38 30,30 55,33 80,18 110,24 140,10 170,20 205,8 240,16 270,4 300,12",
    });
    spark.appendChild(line);

    var pct = document.createElement("div");
    pct.className = "intro-pct";
    var pctNum = document.createElement("b");
    pctNum.textContent = "0";
    pct.appendChild(pctNum);
    pct.appendChild(document.createTextNode("% · "));
    var cap = document.createElement("span");
    cap.className = "cap";
    cap.textContent = "loading dataset";
    pct.appendChild(cap);

    cluster.appendChild(mark);
    cluster.appendChild(spark);
    cluster.appendChild(pct);
    center.appendChild(cluster);
    overlay.appendChild(curtainTop);
    overlay.appendChild(curtainBottom);
    overlay.appendChild(crossH);
    overlay.appendChild(crossV);
    overlay.appendChild(center);

    try {
      lock();
      host.appendChild(overlay);
      // Page behind is now covered: take it out of the tab order and AT.
      pageInert(true);
      // Overlay now covers the page; the pre-paint guard can stand down.
      unarm();

      // Prime the sparkline as fully hidden, then fade the cluster in.
      var len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.getBoundingClientRect();

      requestAnimationFrame(function () {
        overlay.classList.add("in");
        // draw the line + count up to 100 over 2.4s
        line.style.transition =
          "stroke-dashoffset 2400ms cubic-bezier(0.22, 0.61, 0.36, 1)";
        line.style.strokeDashoffset = 0;
        countUp(pctNum, 100, 2400, 0);
      });

      // Curtain split fires at max(2.4s, window load), capped at ~4s, so the
      // percentage is honest about load without dragging on.
      var split = false;
      var minElapsed = false;
      var loaded = document.readyState === "complete";

      function reveal() {
        if (split) return;
        split = true;
        overlay.classList.remove("in");
        overlay.classList.add("reveal");
        // Begin the hero choreography as the curtains slide away, so the name
        // rises into the widening gap instead of already being settled there.
        window.setTimeout(fireIntroDone, 400);
        // After the curtain transition, unmount and free the page for good.
        window.setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          try {
            sessionStorage.setItem("hasNavigated", "true");
          } catch (e) {}
          release();
        }, 1100);
      }
      function maybeReveal() {
        if (minElapsed && loaded) reveal();
      }

      window.setTimeout(function () {
        minElapsed = true;
        maybeReveal();
      }, 2400);
      if (!loaded) {
        window.addEventListener("load", function onLoad() {
          window.removeEventListener("load", onLoad);
          loaded = true;
          maybeReveal();
        });
      }
      // Hard cap: never hold the overlay past ~4s.
      window.setTimeout(reveal, 4000);
    } catch (err) {
      // Any failure must still leave a visible, scrollable page.
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      unarm();
      release();
      // release() no-ops if we never locked; make sure deferred reveals run.
      fireIntroDone();
    }
  }

  /* Mobile nav toggle. */
  function setupNav() {
    var toggle = document.querySelector(".pl-nav-toggle");
    var nav = document.querySelector(".pl-nav-links");
    if (!toggle || !nav) return;
    function close() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "≡";
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "✕" : "≡";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* Project cards open a focus-trapped detail lightbox. Each card's detail
     markup (.pl-pcard-detail) lives in the DOM so it is present for no-JS and
     print; here it is lifted into one reusable dialog on demand. */
  function setupProjects() {
    var grid = document.querySelector(".pl-proj-grid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".pl-pcard"));
    if (!cards.length) return;

    var overlay = document.createElement("div");
    overlay.className = "pl-lightbox";
    overlay.setAttribute("hidden", "");
    var panel = document.createElement("div");
    panel.className = "pl-lightbox-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "pl-lightbox-title");
    panel.setAttribute("tabindex", "-1");
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "pl-lightbox-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = "&times;";
    var content = document.createElement("div");
    panel.appendChild(closeBtn);
    panel.appendChild(content);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    var lastFocus = null;

    function build(card) {
      content.innerHTML = "";
      var fig = card.querySelector(".pl-proj-fig");
      var title = card.querySelector(".pl-pcard-title");
      var stat = card.querySelector(".pl-proj-stat");
      var stack = card.querySelector(".pl-proj-stack");
      var detail = card.querySelector(".pl-pcard-detail");
      var acts = card.querySelector(".pl-pcard-acts");

      var head = document.createElement("div");
      head.className = "pl-lightbox-head";
      if (fig) head.appendChild(fig.cloneNode(true));
      var h = document.createElement("h3");
      h.id = "pl-lightbox-title";
      h.textContent = title ? title.textContent : "";
      head.appendChild(h);
      if (stat) head.appendChild(stat.cloneNode(true));
      content.appendChild(head);

      if (stack) content.appendChild(stack.cloneNode(true));
      if (detail) {
        // the grid copy is display:none under html.js; the clone is the
        // dialog's main content, so force it visible (inline beats the rule)
        var d = detail.cloneNode(true);
        d.style.display = "block";
        content.appendChild(d);
      }
      if (acts) content.appendChild(acts.cloneNode(true));
    }

    function focusable() {
      return Array.prototype.slice
        .call(panel.querySelectorAll("a[href], button:not([disabled])"))
        .filter(function (n) {
          return n.offsetParent !== null;
        });
    }

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      var f = focusable();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function open(card) {
      lastFocus = document.activeElement;
      build(card);
      overlay.removeAttribute("hidden");
      document.documentElement.classList.add("lightbox-open");
      if (window.lenis) window.lenis.stop();
      document.addEventListener("keydown", onKey, true);
      panel.focus();
    }

    function close() {
      overlay.setAttribute("hidden", "");
      document.documentElement.classList.remove("lightbox-open");
      if (window.lenis) window.lenis.start();
      document.removeEventListener("keydown", onKey, true);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    cards.forEach(function (card) {
      var main = card.querySelector(".pl-pcard-main");
      if (main) {
        main.addEventListener("click", function () {
          open(card);
        });
      }
    });
  }

  /* Skills: feed the cursor position into each card so the accent spotlight
     (CSS ::before) tracks the pointer. Reduced motion keeps the centered
     hover glow and skips the tracking. */
  function setupSkillSpotlight() {
    if (reduceMotion) return;
    document.querySelectorAll(".pl-skill-card").forEach(function (card) {
      card.addEventListener(
        "mousemove",
        function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty("--mx", e.clientX - r.left + "px");
          card.style.setProperty("--my", e.clientY - r.top + "px");
        },
        { passive: true },
      );
    });
  }

  /* dark/light theme toggle (persists choice in localStorage). */
  function setupThemeToggle() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    function current() {
      return document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";
    }
    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    var probeCtx = null;
    // styles.css owns the surface colors; read what it actually paints and
    // normalize (dark is authored in oklch, which fillStyle readback keeps
    // verbatim) through getImageData to an rgb() string every theme-color
    // parser accepts, instead of hand-maintaining hex copies here
    function pageBgColor() {
      var bg = getComputedStyle(document.body).backgroundColor;
      if (!probeCtx) {
        var c = document.createElement("canvas");
        c.width = c.height = 1;
        probeCtx = c.getContext("2d", { willReadFrequently: true });
      }
      if (!probeCtx) return bg;
      probeCtx.fillStyle = bg;
      probeCtx.fillRect(0, 0, 1, 1);
      var d = probeCtx.getImageData(0, 0, 1, 1).data;
      return "rgb(" + d[0] + ", " + d[1] + ", " + d[2] + ")";
    }
    function apply(theme, persist) {
      document.documentElement.dataset.theme = theme;
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      // keep mobile browser chrome in step with the surface behind it
      if (themeColorMeta) {
        themeColorMeta.setAttribute("content", pageBgColor());
      }
      // Persist only explicit toggle choices. Syncing on load would let a
      // shared ?theme= link silently overwrite the visitor's saved theme.
      if (persist) {
        try {
          localStorage.setItem("theme", theme);
        } catch (e) {}
      }
    }
    apply(current(), false);

    // Toggle with a circle-expand reveal that grows from the button, via the
    // View Transitions API. Falls back to an instant swap when the API is
    // unavailable or motion is reduced.
    btn.addEventListener("click", function () {
      var next = current() === "light" ? "dark" : "light";
      if (reduceMotion || !document.startViewTransition) {
        apply(next, true);
        return;
      }
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = r.top + r.height / 2;
      var end = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      var root = document.documentElement;
      root.classList.add("theme-vt");
      var vt = document.startViewTransition(function () {
        apply(next, true);
      });
      vt.ready.then(function () {
        root.animate(
          {
            clipPath: [
              "circle(0px at " + x + "px " + y + "px)",
              "circle(" + end + "px at " + x + "px " + y + "px)",
            ],
          },
          {
            duration: 540,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
      vt.finished.finally(function () {
        root.classList.remove("theme-vt");
      });
    });
  }

  function init() {
    setupDeckFit();
    setupLenis();
    setupAnchorNav();
    setupThemeToggle();
    buildCharts();
    buildMarquee();
    setupReveals();
    setupScrollspy();
    setupScrollChrome();
    setupNav();
    setupProjects();
    setupSkillSpotlight();
    onIntroDone(revealHero);
    setupIntro();
    // tells the inline head failsafe the reveal engine is live, so the
    // html.js gate stays (a missing/broken main.js lifts it at 4s instead)
    window.__mainReady = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
