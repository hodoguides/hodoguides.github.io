/* HodoGuides bêta · shared helpers: language, data, header */
(() => {
  "use strict";

  const PLANNER_URL = "https://planner.erikaramel.com/";
  const MAPBOX_TOKEN = "pk.eyJ1IjoiZXJpa2FyYW1lbGwiLCJhIjoiY21jbmlteXJuMDBjaDJrc2swbnA0a29wZSJ9.F8aX2alF-PpnqInkyqba8g";
  // Mapbox's light style, recoloured below to look like the travel journal map.
  const MAPBOX_STYLE = "mapbox://styles/mapbox/light-v11";
  // Globe looks: "nuit" (starry night) for everyone by default.
  // Another look can be tried with ?globe=ciel or ?globe=carnet (?globe=auto goes back to the default).
  // visited = countries Erika has been to; ready = countries with places on the map.
  const MAP_THEMES = {
    ciel: { water: "#a9d3f2", land: "#fff8ee", coast: "#6f9fd6", visited: "#fde6ec", ready: "#f4a0b3", border: "#eab2c0",
      fog: { color: "#fdf3f6", "high-color": "#cfe4fb", "space-color": "#e7ddf6", "horizon-blend": 0.08, "star-intensity": 0.12 } },
    nuit: { water: "#8ec5ec", land: "#fff8ec", coast: "#5b8fcf", visited: "#c7ecd6", ready: "#8fd6b1", border: "#79c29d",
      fog: { color: "#f3eefb", "high-color": "#7d8fd6", "space-color": "#25244a", "horizon-blend": 0.05, "star-intensity": 0.45 } },
    carnet: { water: "#bfe6df", land: "#f7ead0", coast: "#3b3a5e", visited: "#ffd98a", ready: "#f6a9b9", border: "#d9a94f",
      fog: { color: "#fdf8f2", "high-color": "#f6e3c3", "space-color": "#fbf1e2", "horizon-blend": 0.07, "star-intensity": 0 } },
  };
  function pickTheme() {
    const q = new URLSearchParams(location.search).get("globe");
    try {
      if (q === "auto") localStorage.removeItem("hodo-globe");
      else if (q && MAP_THEMES[q]) localStorage.setItem("hodo-globe", q);
      const saved = localStorage.getItem("hodo-globe");
      if (!q && saved && MAP_THEMES[saved]) return saved;
    } catch (_) {}
    if (MAP_THEMES[q]) return q;
    return "nuit";
  }
  const THEME_ID = pickTheme();
  const MAP_COLORS = MAP_THEMES[THEME_ID];

  /** Recolour the light style with the chosen globe look: land, sea and coastline. */
  function journalColors(map) {
    const set = (layer, prop, value) => { if (map.getLayer(layer)) map.setPaintProperty(layer, prop, value); };
    set("water", "fill-color", MAP_COLORS.water);
    set("land", "background-color", MAP_COLORS.land);
    // Draw the coastline right above the water, below roads and labels
    const water = map.getLayer("water");
    if (water && water.sourceLayer && !map.getLayer("hodo-coast")) {
      const layers = map.getStyle().layers;
      const next = layers[layers.findIndex((l) => l.id === "water") + 1];
      map.addLayer({ id: "hodo-coast", type: "line", source: water.source, "source-layer": water.sourceLayer,
        paint: { "line-color": MAP_COLORS.coast, "line-width": 1.4 } }, next?.id);
    }
  }

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
    theme: MAP_COLORS,
    themeId: THEME_ID,
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

    /** A Mapbox map in the journal style. Touch screens need two fingers to move it, so the page still scrolls. */
    createMap(options) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.Map({
        style: MAPBOX_STYLE, attributionControl: false,
        cooperativeGestures: matchMedia("(pointer: coarse)").matches, ...options,
      });
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
      map.on("style.load", () => journalColors(map));
      return map;
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
