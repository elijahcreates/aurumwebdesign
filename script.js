(() => {
  "use strict";
  window.__aurum = true;

  const root = document.documentElement;
  const motion = root.classList.contains("motion");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Each feature runs on its own so one failure can't break the rest of the page.
  const safely = (fn) => { try { fn(); } catch (err) { console.error(err); } };

  const WHATSAPP_NUMBER = "19147481692";
  const CONTACT_EMAIL = "elijahnisenbaum1@gmail.com";

  // Things that update while the page scrolls.
  const scrollTasks = [];
  let scrollQueued = false;
  const runScrollTasks = () => {
    scrollQueued = false;
    const y = window.scrollY;
    scrollTasks.forEach((task) => task(y));
  };
  const queueScroll = () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(runScrollTasks);
    }
  };
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll);

  /* ---------- Mobile menu ---------- */
  const toggle = $(".nav-toggle");
  const links = $("#nav-links");
  const setMenu = (open) => {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  safely(() => {
    toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
    links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  });

  /* ---------- Footer year ---------- */
  safely(() => { $("#year").textContent = new Date().getFullYear(); });

  /* ---------- Nav: gold progress bar, hides on the way down, returns on the way up ---------- */
  safely(() => {
    const nav = $(".nav");
    let lastY = window.scrollY;
    scrollTasks.push((y) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      nav.style.setProperty("--sp", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : "0");
      if (!motion) return;
      const menuOpen = links.classList.contains("open");
      if (y > lastY + 4 && y > 300 && !menuOpen) nav.classList.add("nav-hidden");
      else if (y < lastY - 4 || y <= 300) nav.classList.remove("nav-hidden");
      lastY = y;
    });
  });

  /* ---------- Split text into words ---------- */
  const splitWords = (el, className) => {
    const words = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((token) => {
            if (!token) return;
            if (/^\s+$/.test(token)) { frag.appendChild(document.createTextNode(" ")); return; }
            const word = document.createElement("span");
            word.className = className;
            const inner = document.createElement("span");
            inner.textContent = token;
            word.appendChild(inner);
            words.push(word);
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
    return words;
  };

  /* ---------- Reveal on scroll ---------- */
  safely(() => {
    if (!motion) return;

    $$("[data-split]").forEach((el) => {
      splitWords(el, "w").forEach((word, i) => word.firstChild.style.setProperty("--i", i));
    });
    $$("[data-stagger]").forEach((group) => {
      Array.from(group.children).forEach((child, i) => child.style.setProperty("--i", i));
    });

    const targets = $$("[data-reveal], [data-split], .wordmark");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((el) => observer.observe(el));
  });

  /* ---------- Hero: gold dust ---------- */
  safely(() => {
    const canvas = $(".hero-canvas");
    if (!motion || !canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const hero = $(".hero");
    let w = 0, h = 0, particles = [], running = false, visible = true;
    let targetX = 0, targetY = 0, mx = 0, my = 0;

    const makeParticle = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(Math.random() * 0.28 + 0.06),
      alpha: Math.random() * 0.55 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.006,
      depth: Math.random() * 0.8 + 0.2,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(clamp((w * h) / 13000, 28, 110));
      particles = Array.from({ length: count }, makeParticle);
    };

    const frame = () => {
      if (!running) return;
      mx = lerp(mx, targetX, 0.05);
      my = lerp(my, targetY, 0.05);
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.speed;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const alpha = p.alpha * (0.55 + 0.45 * Math.sin(p.phase));
        const x = p.x + mx * p.depth * 22;
        const y = p.y + my * p.depth * 22;
        ctx.fillStyle = `rgba(245, 217, 139, ${(alpha * 0.16).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(245, 217, 139, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    };

    const update = () => {
      const shouldRun = visible && !document.hidden;
      if (shouldRun && !running) { running = true; requestAnimationFrame(frame); }
      else if (!shouldRun) running = false;
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", update);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; update(); }).observe(hero);
    }
    update();

    // The dust and the glow drift gently with the mouse.
    if (finePointer) {
      const glow = $(".hero-glow");
      hero.addEventListener("pointermove", (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = (e.clientX - rect.left) / rect.width - 0.5;
        targetY = (e.clientY - rect.top) / rect.height - 0.5;
        glow.style.setProperty("--gx", `${(targetX * 90).toFixed(1)}px`);
        glow.style.setProperty("--gy", `${(targetY * 60).toFixed(1)}px`);
      });
    }
  });

  /* ---------- Hero: content drifts away as you scroll ---------- */
  safely(() => {
    if (!motion) return;
    const hero = $(".hero");
    const inner = $(".hero-inner");
    scrollTasks.push((y) => {
      const height = hero.offsetHeight;
      if (y > height) return;
      const t = clamp(y / height, 0, 1);
      inner.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0) scale(${(1 - t * 0.06).toFixed(4)})`;
      inner.style.opacity = (1 - t * 1.25).toFixed(3);
    });
  });

  /* ---------- Marquee: speeds up and leans when you scroll ---------- */
  safely(() => {
    const track = $(".marquee-track");
    if (!motion || !track) return;
    const set = $(".marquee-set", track);
    let setWidth = set.offsetWidth;
    const fill = () => {
      setWidth = set.offsetWidth;
      const needed = Math.ceil(window.innerWidth / setWidth) + 1;
      while (track.children.length < needed + 1) track.appendChild(set.cloneNode(true));
    };
    fill();
    window.addEventListener("resize", fill);

    let x = 0, velocity = 0, lastY = window.scrollY, lastTime = performance.now(), running = false, visible = true;
    const tick = (now) => {
      if (!running) return;
      const dt = Math.min(now - lastTime, 50) / 1000;
      lastTime = now;
      const y = window.scrollY;
      velocity = lerp(velocity, y - lastY, 0.12);
      lastY = y;
      x -= (55 + Math.abs(velocity) * 28) * dt;
      if (x <= -setWidth) x += setWidth;
      const skew = clamp(velocity * -0.35, -9, 9);
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      requestAnimationFrame(tick);
    };
    const update = () => {
      const shouldRun = visible && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        lastTime = performance.now();
        lastY = window.scrollY;
        requestAnimationFrame(tick);
      } else if (!shouldRun) running = false;
    };
    document.addEventListener("visibilitychange", update);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; update(); }).observe(track.parentElement);
    }
    update();
  });

  /* ---------- Manifesto: words light up as you scroll ---------- */
  safely(() => {
    const el = $("[data-fill]");
    if (!motion || !el) return;
    const words = splitWords(el, "fw");
    scrollTasks.push(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -vh || rect.top > vh * 2) return;
      const progress = clamp((vh * 0.82 - rect.top) / (vh * 0.42 + rect.height), 0, 1);
      const head = progress * (words.length + 4);
      words.forEach((word, i) => {
        word.style.opacity = (0.13 + 0.87 * clamp((head - i) / 4, 0, 1)).toFixed(3);
      });
    });
  });

  /* ---------- Process: the browser builds itself as you scroll ---------- */
  safely(() => {
    const section = $(".process");
    if (!section) return;
    const browser = $(".browser", section);
    const steps = $$(".pstep", section);
    if (!motion) return;

    let current = 0;
    const setStage = (stage) => {
      if (stage === current) return;
      current = stage;
      browser.dataset.stage = String(stage);
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === stage - 1);
        step.classList.toggle("is-done", i < stage - 1);
      });
    };
    const scrollRange = () => section.offsetHeight - window.innerHeight;

    scrollTasks.push(() => {
      const range = scrollRange();
      const progress = range > 0 ? clamp(-section.getBoundingClientRect().top / range, 0, 1) : 0;
      setStage(Math.min(steps.length, Math.floor(progress * steps.length) + 1));
      const line = steps.length > 1 ? clamp((progress * steps.length - 0.5) / (steps.length - 1), 0, 1) : 1;
      section.style.setProperty("--p", line.toFixed(4));
    });

    steps.forEach((step, i) => {
      step.addEventListener("click", () => {
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + scrollRange() * ((i + 0.5) / steps.length), behavior: "smooth" });
      });
    });
  });

  /* ---------- Cards: 3D tilt and a spotlight that follows the cursor ---------- */
  safely(() => {
    if (!motion || !finePointer) return;
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        card.classList.add("tilting");
        card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        card.style.setProperty("--ry", `${((px - 0.5) * 10).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${((0.5 - py) * 10).toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  });

  /* ---------- Magnetic buttons ---------- */
  safely(() => {
    if (!motion || !finePointer) return;
    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.translate = `${(dx * 0.28).toFixed(1)}px ${(dy * 0.4).toFixed(1)}px`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.translate = ""; });
    });
  });

  /* ---------- Cursor ring ---------- */
  safely(() => {
    const ring = $(".cursor");
    if (!ring) return;
    if (!motion || !finePointer) { ring.remove(); return; }
    let x = 0, y = 0, tx = 0, ty = 0, started = false, running = false;
    const tick = () => {
      x = lerp(x, tx, 0.2);
      y = lerp(y, ty, 0.2);
      ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.2) requestAnimationFrame(tick);
      else running = false;
    };
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (e.clientX === 0 && e.clientY === 0) return;
      tx = e.clientX;
      ty = e.clientY;
      if (!started) { started = true; x = tx; y = ty; }
      ring.classList.add("on");
      ring.classList.toggle("hover", Boolean(e.target.closest && e.target.closest("a, button, summary, .svc, .pstep, .compare, input, textarea")));
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });
    document.addEventListener("pointerleave", () => ring.classList.remove("on"));
  });

  /* ---------- Floating WhatsApp button appears after the first scroll ---------- */
  safely(() => {
    const fab = $(".wa-fab");
    if (!fab) return;
    let peeked = false;
    scrollTasks.push((y) => {
      fab.classList.toggle("show", y > 240);
      // Open the label once, briefly, so visitors notice they can ask for a quote.
      if (!peeked && y > 900) {
        peeked = true;
        fab.classList.add("peek");
        setTimeout(() => fab.classList.remove("peek"), 5000);
      }
    });
  });

  /* ---------- Price counts up when it scrolls into view ---------- */
  safely(() => {
    if (!motion || !("IntersectionObserver" in window)) return;
    $$("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      el.textContent = "0";
      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1800;
        const step = (now) => {
          const t = clamp((now - start) / duration, 0, 1);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 4))));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      observer.observe(el);
    });
  });

  /* ---------- Before / after slider ---------- */
  safely(() => {
    const compare = $(".compare");
    if (!compare) return;
    const input = $("input", compare);
    let touched = false;
    const set = (value) => compare.style.setProperty("--pos", `${value}%`);
    input.addEventListener("input", () => { touched = true; set(input.value); });
    set(input.value);

    // A short sweep the first time it appears, to show that it moves.
    if (!motion || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const start = performance.now() + 500;
      const duration = 2400;
      const step = (now) => {
        if (touched) return;
        const t = clamp((now - start) / duration, 0, 1);
        const value = 50 + 26 * Math.sin(t * Math.PI * 2) * (1 - t * 0.35);
        set(t < 1 ? value : 50);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    observer.observe(compare);
  });

  /* ---------- Contact form: sends through WhatsApp or the visitor's email app ---------- */
  safely(() => {
    const form = $("#contact-form");
    const status = $(".form-status", form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      $$("[required]", form).forEach((field) => {
        const ok = field.value.trim() !== "" && (field.type !== "email" || /\S+@\S+\.\S+/.test(field.value));
        field.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        status.textContent = "Please fill in your name, a valid email and a short message.";
        return;
      }

      const data = new FormData(form);
      const via = (e.submitter && e.submitter.dataset.via) || "whatsapp";
      const lines = [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Business: ${data.get("business") || "-"}`,
        "",
        data.get("message"),
      ];

      if (via === "email") {
        const subject = `New project inquiry from ${data.get("name")}`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
        status.textContent = "Thanks! Your email app should open with your message ready to send.";
      } else {
        const text = ["Hi Aurum Web Design, I'd like a quote for a website.", "", ...lines].join("\n");
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
        status.textContent = "Thanks! WhatsApp should open with your message ready to send.";
      }
      form.reset();
    });
  });

  runScrollTasks();
})();
