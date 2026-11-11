// Reveals each panel's content as it scrolls into view.
(() => {
  "use strict";
  window.__aurumAd = true;
  const root = document.documentElement;
  const panels = Array.from(document.querySelectorAll(".panel"));

  panels.forEach((panel) => {
    panel.querySelectorAll("[data-r]").forEach((el, i) => el.style.setProperty("--i", i));
  });

  if (!root.classList.contains("motion")) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  panels.forEach((panel) => observer.observe(panel));
})();
