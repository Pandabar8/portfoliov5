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
    hero: [4, 6, 5, 9, 7, 11, 9, 14, 12, 17, 15, 21, 19, 26],
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
      var series = key === "hero" ? SR_SERIES.hero : SR_SERIES.projects[key];
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
    var resizeTimer;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(fit, 200);
      },
      { passive: true },
    );
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

  /* Highlight the nav link for the section in view. */
  function setupScrollspy() {
    var links = {};
    document
      .querySelectorAll(".pl-nav-links a[href^='#']")
      .forEach(function (a) {
        links[a.getAttribute("href").slice(1)] = a;
      });
    var sections = Object.keys(links)
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            Object.keys(links).forEach(function (id) {
              links[id].classList.toggle("active", id === e.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
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

    // One restrained parallax: the hero chart drifts at a fraction of scroll.
    var heroChart = document.querySelector(".pl-hero-chart");
    if (heroChart) {
      lenis.on("scroll", function (e) {
        heroChart.style.transform = "translateY(" + e.scroll * 0.12 + "px)";
      });
    }

    // Pinned deck cards report their stuck rect (top 0), so element-target
    // scrolls resolve to "here" and upward navigation goes nowhere. Compute
    // the card's natural document offset from the stack (never sticky) and
    // its preceding siblings' layout heights instead.
    function anchorTarget(el) {
      var card = el.closest(".pl-stack > .pl-card");
      if (!card || getComputedStyle(card).position !== "sticky") return el;
      var stack = card.parentElement;
      var top = stack.getBoundingClientRect().top + lenis.scroll;
      for (
        var sib = stack.firstElementChild;
        sib && sib !== card;
        sib = sib.nextElementSibling
      ) {
        top += sib.offsetHeight;
      }
      return top;
    }

    // Route in-page anchors through Lenis so they share the eased settle.
    document.addEventListener("click", function (e) {
      if (!window.lenis) return;
      var link = e.target.closest("a[href^='#']");
      if (!link) return;
      var href = link.getAttribute("href");
      if (href === "#") return;
      var target = href === "#top" ? 0 : document.getElementById(href.slice(1));
      if (target === null) return;
      e.preventDefault();
      window.lenis.scrollTo(
        typeof target === "number" ? target : anchorTarget(target),
      );
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

  /* Single-open project accordion (first card open by default). */
  function setupProjects() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".pl-proj"),
    );
    cards.forEach(function (card) {
      var head = card.querySelector(".pl-proj-head");
      if (!head) return;
      head.addEventListener("click", function () {
        var isOpen = card.classList.contains("open");
        cards.forEach(function (c) {
          c.classList.remove("open");
          var h = c.querySelector(".pl-proj-head");
          if (h) h.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          card.classList.add("open");
          head.setAttribute("aria-expanded", "true");
        }
      });
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
    function apply(theme) {
      document.documentElement.dataset.theme = theme;
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {}
    }
    apply(current());

    // Toggle with a circle-expand reveal that grows from the button, via the
    // View Transitions API. Falls back to an instant swap when the API is
    // unavailable or motion is reduced.
    btn.addEventListener("click", function () {
      var next = current() === "light" ? "dark" : "light";
      if (reduceMotion || !document.startViewTransition) {
        apply(next);
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
        apply(next);
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
    setupLenis();
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
