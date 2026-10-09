/* HodoGuides bêta · shared helpers: language, data, header */
(() => {
  "use strict";

  const PLANNER_URL = "https://planner.erikaramel.com/";
  const MAPBOX_TOKEN = "pk.eyJ1IjoiZXJpa2FyYW1lbGwiLCJhIjoiY21jbmlteXJuMDBjaDJrc2swbnA0a29wZSJ9.F8aX2alF-PpnqInkyqba8g";
  // Mapbox's light style, recoloured below to look like the travel journal map.
  const MAPBOX_STYLE = "mapbox://styles/mapbox/light-v11";
  const MAP_COLORS = { water: "#dcebf9", land: "#fffdf9", coast: "#8fb8e6" };

  /** Recolour the light style: cream land, pale blue sea, blue coastline. */
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
