/* HodoGuides bêta · shared helpers: language, data, header */
(() => {
  "use strict";

  const PLANNER_URL = "https://planner.erikaramel.com/";

  function pickLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl === "fr" || fromUrl === "en") return fromUrl;
    try {
      const saved = localStorage.getItem("hodo-lang");
      if (saved === "fr" || saved === "en") return saved;
    } catch (_) {}
    return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  const Hodo = {
    lang: pickLang(),
    PLANNER_URL,
    listeners: [],

    /** Bilingual value: a plain string, or { fr, en }. Falls back to the other language. */
    tr(v) {
      if (v == null) return "";
      if (typeof v !== "object") return String(v);
      return v[Hodo.lang] || v.fr || v.en || "";
    },

    /** Pick the right text from an inline { fr, en } pair. */
    t(fr, en) { return Hodo.lang === "fr" ? fr : en; },

    esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },

    async yaml(path) {
      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
      return jsyaml.load(await res.text());
    },

    plannerLink(params = {}) {
      const q = new URLSearchParams({ ...params, lang: Hodo.lang });
      return `${PLANNER_URL}?${q}`;
    },

    /** Call fn now and every time the language changes. */
    onLang(fn) { Hodo.listeners.push(fn); fn(Hodo.lang); },

    setLang(lang) {
      Hodo.lang = lang;
      try { localStorage.setItem("hodo-lang", lang); } catch (_) {}
      document.documentElement.lang = lang;
      document.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
      document.querySelectorAll("[data-fr][data-en]").forEach((el) => {
        const v = el.dataset[lang];
        if (el.tagName === "TITLE") el.textContent = v;
        else if (el.tagName === "META") el.content = v;
        else el.setAttribute("aria-label", v);
      });
      Hodo.listeners.forEach((fn) => fn(lang));
    },

    toast(msg) {
      let el = document.querySelector(".toast");
      if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(el._t);
      el._t = setTimeout(() => el.classList.remove("show"), 1800);
    },

    async share(title, text, url) {
      try {
        if (navigator.share) { await navigator.share({ title, text, url }); return; }
        await navigator.clipboard.writeText(url);
        Hodo.toast(Hodo.t("Lien copié !", "Link copied!"));
      } catch (_) {}
    },
  };

  window.Hodo = Hodo;

  document.addEventListener("DOMContentLoaded", () => {
    // Mascot in the header
    const slot = document.querySelector("[data-mascot]");
    if (slot && window.HodoIcons) slot.innerHTML = HodoIcons.icon("bunny", +slot.dataset.mascot || 30);

    document.querySelector(".lang")?.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (b) Hodo.setLang(b.dataset.lang);
    });
    document.addEventListener("click", (e) => {
      const menu = document.querySelector(".menu");
      if (menu?.open && !e.target.closest(".menu")) menu.open = false;
    });
    Hodo.setLang(Hodo.lang);
  });
})();
