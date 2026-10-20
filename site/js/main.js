// Interactions and motion. Everything works without this file; it only adds to it.
(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const motion = root.classList.contains("motion");
  const DESKTOP = "(min-width: 1024px) and (min-height: 600px)";

  // ── live clock (Asia/Kolkata) ───────────────────────────
  function clock() {
    const el = $("[data-clock]");
    if (!el) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", { timeZone: el.dataset.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    } catch {
      return;
    }
    const tick = () => (el.textContent = fmt.format(new Date()));
    tick();
    setInterval(tick, 1000);
  }

  // ── CONNECT dropdown: hover/focus in CSS, click + Escape here ──
  function connect() {
    const box = $("[data-connect]");
    if (!box) return;
    const btn = $("button", box);
    const set = (open) => {
      box.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => set(!box.classList.contains("open")));
    document.addEventListener("click", (e) => !box.contains(e.target) && set(false));
    box.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        set(false);
        btn.focus();
      }
    });
  }

  // ── "ask me to explain" tabs ────────────────────────────
  function tabs() {
    $$("[data-tabs]").forEach((box) => {
      const list = $$('[role="tab"]', box);
      const select = (i, focus) => {
        list.forEach((t, j) => {
          const on = i === j;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        });
        if (focus) list[i].focus();
      };
      list.forEach((t, i) => {
        t.addEventListener("click", () => select(i));
        t.addEventListener("keydown", (e) => {
          const n = list.length;
          const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
          if (to === undefined) return;
          e.preventDefault();
          select(to, true);
        });
      });
    });
  }

  // ── playable games: nothing loads until Play is pressed ──
  function games() {
    const smallScreen = () => matchMedia("(max-width: 900px), (pointer: coarse)").matches;

    $$("[data-game]").forEach((tv) => {
      const slide = tv.closest(".slide");
      const screen = $("[data-game-screen]", tv);
      const msg = $("[data-game-msg]", tv);
      const playBtn = $("[data-game-play]", tv);
      const tools = $("[data-game-tools]", tv);
      const { embed, page, title } = tv.dataset;
      const repo = $(".repo-link a", slide)?.href;

      const say = (text, href, label) => {
        msg.textContent = text + " ";
        if (!href) return;
        const a = document.createElement("a");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = label;
        msg.append(a);
      };

      const start = () => {
        if (smallScreen()) return say("Best played on desktop: this game needs a keyboard.", page || repo, page ? "Open it on itch.io ↗" : "See the source ↗");
        if (!embed) return say("The web build isn't uploaded yet, so it can't be played here.", repo, "See the source on GitHub ↗");
        if ($("iframe", screen)) return;

        const frame = document.createElement("iframe");
        frame.src = embed;
        frame.title = `${title} (playable game)`;
        frame.allow = "fullscreen; autoplay; gamepad";
        frame.setAttribute("allowfullscreen", "");
        // Scripts must run for Unity; the game still can't touch this page (different origin).
        frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-popups-to-escape-sandbox");
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        screen.append(frame);

        msg.textContent = "";
        playBtn.hidden = true;
        tools.hidden = false;
        tv.classList.add("is-playing");
        frame.focus();
      };

      const stop = () => {
        $("iframe", screen)?.remove();
        if (document.fullscreenElement) document.exitFullscreen();
        playBtn.hidden = false;
        tools.hidden = true;
        tv.classList.remove("is-playing");
        playBtn.focus();
      };

      playBtn.addEventListener("click", start);
      $("[data-game-close]", tv).addEventListener("click", stop);
      $("[data-game-fs]", tv).addEventListener("click", () => {
        const go = screen.requestFullscreen || screen.webkitRequestFullscreen;
        if (go) go.call(screen);
      });
      $("[data-play-cta]", slide)?.addEventListener("click", (e) => {
        e.preventDefault();
        tv.scrollIntoView({ block: "nearest", behavior: motion ? "smooth" : "auto" });
        start();
        if (!$("iframe", screen)) playBtn.focus({ preventScroll: true });
      });
    });
  }

  // ── FitVision rep counter follows the squat loop ────────
  function reps() {
    const n = $("[data-reps]");
    const body = $(".pose-body");
    const cam = $(".cam");
    if (!n || !body || !motion) return;
    let count = 7;
    body.addEventListener("animationiteration", () => {
      count = count >= 12 ? 1 : count + 1;
      n.textContent = String(count).padStart(2, "0");
    });
    new IntersectionObserver(([e]) => cam.classList.toggle("paused", !e.isIntersecting)).observe(cam);
  }

  // ── page indicator + hiding chrome on hero/footer ───────
  function pager() {
    const nav = $("[data-pager]");
    if (!nav) return;
    const links = $$("[data-pager-for]", nav);
    const body = document.body;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const slide = e.target;
          body.classList.toggle("chrome-hidden", slide.classList.contains("hero"));
          body.classList.toggle("pager-hidden", slide.classList.contains("footer"));
          links.forEach((a) => a.removeAttribute("aria-current"));
          const a = links.find((l) => l.dataset.pagerFor === slide.id);
          if (a) {
            a.setAttribute("aria-current", "true");
            nav.style.setProperty("--pg", getComputedStyle(slide).getPropertyValue("--acc-ink").trim());
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    $$(".slide").forEach((s) => io.observe(s));
  }

  // ── motion (GSAP + ScrollTrigger) ───────────────────────
  function drawPrep(scope) {
    return $$(".draw", scope).map((p) => {
      const len = Math.ceil(p.getTotalLength()) + 1;
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = String(len);
      return p;
    });
  }

  function typeChat(chat) {
    const q = $("[data-chat-q]", chat);
    const a = $("[data-chat-a]", chat);
    const text = q.dataset.text;
    let i = 0;
    q.textContent = "";
    const step = () => {
      q.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 30 + Math.random() * 45);
      else gsap.fromTo(a, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.45, ease: "power3.out" });
    };
    setTimeout(step, 700);
  }

  function animate() {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!motion) return;
    if (!gsap || !ST) {
      root.classList.remove("motion");
      return;
    }
    gsap.registerPlugin(ST);
    const E = "power3.out";
    const mm = gsap.matchMedia();

    // GSAP takes over an element's CSS `rotate` when it first touches it, so every tween here is
    // relative to where the element already sits (from() + offsets). That keeps each sticker's tilt.
    const enter = (tl, els, offsets, pos, opts = {}) => {
      if (!els.length) return;
      const timing = { duration: 0.7, ease: E, ...opts };
      tl.fromTo(els, { opacity: 0 }, { opacity: 1, ...timing, ease: "none", duration: timing.duration * 0.6 }, pos);
      tl.from(els, { ...offsets, ...timing }, pos);
    };

    // Load: the name rises, the notes pop, the collage gets stuck down piece by piece.
    // Waits for the fonts (max 1s) so the name never rises in a fallback face.
    const hero = $(".hero");
    const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1000))]);
    const intro = gsap.timeline({ defaults: { ease: E }, paused: true });
    intro.fromTo($$(".hero-name .line-in"), { yPercent: 105, opacity: 1 }, { yPercent: 0, duration: 1, stagger: 0.1 });
    enter(intro, $$("[data-pop]", hero), { y: 16 }, "-=.55", { duration: 0.6, stagger: 0.06 });
    // The stamp only fades: Chrome leaves its per-letter text half-painted after a scale/rotate tween.
    const items = gsap.utils.shuffle($$(".c-item:not([data-no-spin])", hero));
    enter(intro, items, { scale: 0.82, rotation: () => "+=" + gsap.utils.random(-10, 10) }, "-=.9", { stagger: 0.06, ease: "back.out(1.5)" });
    intro.fromTo($$("[data-no-spin]", hero), { opacity: 0 }, { opacity: 1, duration: 0.5 }, "<+=.3");
    intro.to(drawPrep(hero), { strokeDashoffset: 0, duration: 0.8, stagger: 0.1, ease: "power2.inOut" }, "-=.4");
    fontsReady.then(() => intro.play());

    // Leaving the hero: it dims while the collage drifts up at different speeds.
    mm.add(DESKTOP, () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } });
      tl.to("[data-hero-text]", { opacity: 0.2, y: () => -innerHeight * 0.08, ease: "none" }, 0);
      tl.to("[data-collage]", { opacity: 0.35, ease: "none" }, 0);
      $$(".c-item", hero).forEach((el) => tl.to(el, { y: () => -innerHeight * 0.3 * parseFloat(el.dataset.speed || "1"), ease: "none" }, 0));
    });

    // Each slide: number, title rising from the bottom edge, tagline, text, visual, statement, button.
    $$(".slide:not(.hero):not(.notebook-slide)").forEach((slide) => {
      const tl = gsap.timeline({ paused: true });
      const q = (s) => $$(s, slide);
      const lines = q(".line-in");
      if (lines.length) tl.fromTo(lines, { yPercent: 105, opacity: 1 }, { yPercent: 0, duration: 0.9, stagger: 0.09, ease: E }, 0);
      enter(tl, q("[data-rv]"), { y: 18 }, 0.2, { stagger: 0.06 });
      enter(tl, q("[data-rv-visual]"), { y: 70, rotation: "-=3" }, 0.3, { duration: 1.1 });
      enter(tl, q("[data-rv-pop]"), { scale: 0.85, rotation: "-=5" }, 0.35, { stagger: 0.08, ease: "back.out(1.6)" });
      enter(tl, q("[data-rv-statement] span"), { yPercent: 60 }, 0.55, { stagger: 0.12 });
      enter(tl, q("[data-rv-cta]"), { xPercent: 40 }, 0.7);
      const draws = drawPrep(slide);
      if (draws.length) tl.to(draws, { strokeDashoffset: 0, duration: 0.8, stagger: 0.1, ease: "power2.inOut" }, 0.7);
      if (q(".bar").length) tl.from(q(".bar"), { scaleX: 0, duration: 0.6, stagger: 0.035, ease: E, transformOrigin: "0% 50%" }, 0.7);

      const chat = $("[data-chat]", slide);
      let typed = false;
      ST.create({
        trigger: slide,
        start: "top 62%",
        onEnter: () => {
          tl.play();
          if (chat && !typed) {
            typed = true;
            typeChat(chat);
          }
        },
        onLeaveBack: () => tl.reverse(),
      });
    });

    // Closing notebook: closed cover first, then it opens into the spread.
    const nb = $("[data-notebook]");
    if (nb) {
      const cover = $("[data-nb-cover]", nb);
      const draws = drawPrep(nb.closest(".slide"));
      mm.add(DESKTOP, () => {
        gsap.set(nb, { xPercent: -25 });
        gsap.set(cover, { rotationY: 0 });
        const tl = gsap
          .timeline({ paused: true })
          .fromTo(nb, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: E })
          .to(cover, { rotationY: -180, duration: 1.5, ease: "power2.inOut" }, 0.6)
          .to(nb, { xPercent: 0, duration: 1.5, ease: "power2.inOut" }, 0.6)
          .to(draws, { strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: "power2.inOut" }, 1.9);
        ST.create({ trigger: nb.closest(".slide"), start: "top 45%", onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
        return () => gsap.set([nb, cover], { clearProps: "transform,opacity" });
      });
      mm.add("(max-width: 1023.98px), (max-height: 599.98px)", () => {
        gsap.set(draws, { strokeDashoffset: 0 });
      });
    }

    document.fonts?.ready.then(() => ST.refresh());
    root.classList.add("ready");
  }

  // In-page links (#gamestash, ↑ TOP…) glide instead of jumping, and focus moves with them.
  function anchors() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: motion ? "smooth" : "auto" });
      history.pushState(null, "", a.getAttribute("href"));
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  clock();
  anchors();
  connect();
  tabs();
  games();
  reps();
  pager();
  animate();
})();
