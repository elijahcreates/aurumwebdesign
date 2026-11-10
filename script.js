// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

links.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Fade-in on scroll
const revealTargets = document.querySelectorAll(".card, .step, .why-list li, .section h2, .section-lead");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

// Contact form: validates, then opens the visitor's email app with the message filled in.
// To receive messages without email apps, connect a form service (e.g. Formspree) and
// set the form's action/method instead.
const form = document.getElementById("contact-form");
const status = form.querySelector(".form-status");
const CONTACT_EMAIL = "elijahnisenbaum1@gmail.com";

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  form.querySelectorAll("[required]").forEach((field) => {
    const ok = field.value.trim() !== "" && (field.type !== "email" || /\S+@\S+\.\S+/.test(field.value));
    field.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });

  if (!valid) {
    status.textContent = "Please fill in your name, a valid email and a short message.";
    return;
  }

  const data = new FormData(form);
  const subject = `New project inquiry from ${data.get("name")}`;
  const body = [
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Business: ${data.get("business") || "-"}`,
    "",
    data.get("message"),
  ].join("\n");

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Thanks! Your email app should open with your message ready to send.";
  form.reset();
});
