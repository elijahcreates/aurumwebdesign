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
      const skew = clamp(velocity * -0.2, -3, 3);
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
