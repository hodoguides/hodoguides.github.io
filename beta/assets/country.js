/* HodoGuides bêta · country page: map, filters, place list and place sheet */
(() => {
  "use strict";
  const { esc, tr, t } = Hodo;

  const CATEGORIES = {
    food:     { fr: "Manger",        en: "Eat" },
    cafe:     { fr: "Café",          en: "Coffee" },
    see:      { fr: "À voir",        en: "Sights" },
    photo:    { fr: "Spot photo",    en: "Photo spot" },
    activity: { fr: "Activité",      en: "Activity" },
    sleep:    { fr: "Dormir",        en: "Stay" },
    hidden:   { fr: "Pépite cachée", en: "Hidden gem" },
  };
  const VERDICTS = {
    love:      { fr: "♥ Coup de cœur",       en: "♥ Favourite" },
    recommend: { fr: "👍 Recommandé",        en: "👍 Recommended" },
    optional:  { fr: "👌 Si tu as le temps", en: "👌 If you have time" },
    wish:      { fr: "🔖 À tester",          en: "🔖 Not tried yet" },
  };
  const INFO = {
    when:     { fr: "Quand",       en: "When",     s: "var(--yellow)" },
    price:    { fr: "Prix",        en: "Price",    s: "var(--mint)" },
    duration: { fr: "Durée",       en: "Time",     s: "var(--blue)" },
    booking:  { fr: "Réservation", en: "Booking",  s: "var(--pink)" },
    access:   { fr: "Accès",       en: "Access",   s: "var(--lav)" },
  };
  const SHADOWS = ["var(--pink)", "var(--blue)", "var(--mint)", "var(--yellow)", "var(--lav)"];

  const state = { country: null, meta: {}, places: [], filter: "all", activeId: null };
  const $ = (s) => document.querySelector(s);

  const verdictOf = (p) => (p.visited ? (p.verdict || "recommend") : "wish");
  const iconOf = (p) => (HodoIcons.has(p.icon) ? p.icon : HodoIcons.CATEGORY_ICON[p.category] || "torii");
  const label = (o) => (o ? o[Hodo.lang] || o.fr : "");

  function filtered() {
    return state.places.filter((p) => {
      if (state.filter === "all") return true;
      if (state.filter === "love") return verdictOf(p) === "love";
      if (state.filter === "wish") return verdictOf(p) === "wish";
      return p.category === state.filter;
    });
  }

  // ---------- Header & chips ----------
  function renderHead() {
    const c = state.country, m = state.meta;
    const n = state.places.length;
    const loves = state.places.filter((p) => verdictOf(p) === "love").length;
    const guides = state.places.filter((p) => p.guide).length;
    document.title = `${tr(c.name)} · HodoGuides`;
    $("#countryHead").innerHTML = `
      <div><span class="label">${esc(tr(m.region || c.region))} · Destination</span></div>
      <h1>${esc(tr(c.name))} ${m.name_ja ? `<span class="jp">${esc(m.name_ja)}</span>` : ""}</h1>
      ${m.intro ? `<p>${esc(tr(m.intro))}</p>` : ""}
      <div class="pills">
        <span class="pill strong">📍 ${n} ${esc(t(n > 1 ? "lieux" : "lieu", n > 1 ? "places" : "place"))}</span>
        ${loves ? `<span class="pill" style="--bg:var(--pink-soft)">♥ ${loves} ${esc(t(loves > 1 ? "coups de cœur" : "coup de cœur", loves > 1 ? "favourites" : "favourite"))}</span>` : ""}
        ${guides ? `<span class="pill" style="--bg:var(--yellow-soft)">📖 ${guides} ${esc(t(guides > 1 ? "guides" : "guide", guides > 1 ? "guides" : "guide"))}</span>` : ""}
      </div>`;
  }

  function renderChips() {
    const present = new Set(state.places.map((p) => p.category));
    const chips = [
      `<button type="button" class="chip text${state.filter === "all" ? " on" : ""}" data-f="all">${esc(t("Tout", "All"))}</button>`,
      `<button type="button" class="chip text${state.filter === "love" ? " on" : ""}" data-f="love">♥ ${esc(t("Coups de cœur", "Favourites"))}</button>`,
    ];
    for (const [id, c] of Object.entries(CATEGORIES)) {
      if (!present.has(id)) continue;
      chips.push(`<button type="button" class="chip${state.filter === id ? " on" : ""}" data-f="${id}">${HodoIcons.icon(HodoIcons.CATEGORY_ICON[id], 26)}${esc(label(c))}</button>`);
    }
    if (state.places.some((p) => !p.visited)) {
      chips.push(`<button type="button" class="chip text${state.filter === "wish" ? " on" : ""}" data-f="wish">🔖 ${esc(t("À tester", "Not tried yet"))}</button>`);
    }
    $("#chips").innerHTML = chips.join("");
  }

  // ---------- List ----------
  function placeCard(p, i) {
    const v = verdictOf(p);
    const photo = p.photo ? `<img src="/images/places/${esc(state.country.id)}/${esc(p.photo)}" alt="" loading="lazy">` : HodoIcons.icon(iconOf(p), 62);
    return `<button type="button" class="card place${p.id === state.activeId ? " active" : ""}" style="--sh:${SHADOWS[i % SHADOWS.length]}" data-place="${esc(p.id)}">
      <span class="icon-tile">${photo}</span>
      <span class="place-body">
        <span class="place-meta">📍 ${esc(p.city || "")} · ${esc(label(CATEGORIES[p.category]))}</span>
        <b>${esc(tr(p.name))}</b>
        ${p.name_ja ? `<span class="jp">${esc(p.name_ja)}</span>` : ""}
        <span class="pill v-${v}">${esc(label(VERDICTS[v]))}</span>
        ${tr(p.review) ? `<p>${esc(tr(p.review))}</p>` : ""}
      </span></button>`;
  }

  function renderList() {
    const list = filtered();
    if (!list.length) { $("#list").innerHTML = `<div class="card empty">${esc(t("Aucun lieu ici pour l'instant.", "No place here yet."))}</div>`; return; }
    const groups = [
      { dot: "var(--pink)", title: t("Coups de cœur", "Favourites"), items: list.filter((p) => verdictOf(p) === "love") },
      { dot: "var(--mint)", title: t("Recommandés", "Recommended"), items: list.filter((p) => ["recommend", "optional"].includes(verdictOf(p))) },
      { dot: "var(--ink-3)", title: t("Sur ma liste, à tester", "On my list, not tried yet"), items: list.filter((p) => verdictOf(p) === "wish") },
    ].filter((g) => g.items.length);
    let i = 0;
    $("#list").innerHTML = groups.map((g) => `
      <div class="group-title" style="--dot:${g.dot}"><i></i>${esc(g.title)}</div>
      ${g.items.map((p) => placeCard(p, i++)).join("")}`).join("");
  }

  // ---------- Map ----------
  let map = null;
  const markers = new Map();

  function toGeoJSON(places) {
    return { type: "FeatureCollection", features: places.map((p) => ({
      type: "Feature", properties: { id: p.id }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } })) };
  }

  function markerEl(p) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "mk" + (p.visited ? "" : " wish") + (p.id === state.activeId ? " active" : "");
    el.setAttribute("aria-label", tr(p.name));
    el.innerHTML = `<span class="mk-in">${HodoIcons.icon(iconOf(p), 32)}${verdictOf(p) === "love" ? '<span class="heart">♥</span>' : ""}</span>`;
    el.addEventListener("click", (e) => { e.stopPropagation(); openPlace(p.id); });
    return el;
  }

  function clusterEl(count, id, coords) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "cluster";
    el.textContent = count;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      map.getSource("places").getClusterExpansionZoom(id, (err, zoom) => { if (!err) map.easeTo({ center: coords, zoom: zoom + 0.4 }); });
    });
    return el;
  }

  /** Keep HTML markers in sync with the clustered source (Mapbox "HTML clusters" pattern). */
  function syncMarkers() {
    if (!map.getSource("places") || !map.isSourceLoaded("places")) return;
    const seen = new Set();
    for (const f of map.querySourceFeatures("places")) {
      const props = f.properties, coords = f.geometry.coordinates;
      const key = props.cluster ? `c${props.cluster_id}` : `p${props.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (markers.has(key)) continue;
      let el;
      if (props.cluster) el = clusterEl(props.point_count, props.cluster_id, coords);
      else {
        const p = state.places.find((x) => x.id === props.id);
        if (!p) continue;
        el = markerEl(p);
      }
      markers.set(key, new mapboxgl.Marker({ element: el, anchor: props.cluster ? "center" : "bottom", offset: props.cluster ? [0, 0] : [0, -8] }).setLngLat(coords).addTo(map));
    }
    for (const [key, m] of markers) if (!seen.has(key)) { m.remove(); markers.delete(key); }
  }

  function refreshMap() {
    if (!map?.getSource("places")) return;
    for (const m of markers.values()) m.remove();
    markers.clear();
    map.getSource("places").setData(toGeoJSON(filtered()));
  }

  function fitAll(animate) {
    const pts = filtered();
    if (!pts.length) return;
    const b = new mapboxgl.LngLatBounds();
    pts.forEach((p) => b.extend([p.lng, p.lat]));
    map.fitBounds(b, { padding: 50, maxZoom: 11, duration: animate ? 800 : 0 });
  }

  function initMap() {
    const m = state.meta;
    map = Hodo.createMap({
      container: "map",
      center: m.center ? [m.center.lng, m.center.lat] : [state.country.lng, state.country.lat],
      zoom: m.zoom || state.country.zoom || 5,
    });
    map.on("load", () => {
      map.addSource("places", { type: "geojson", data: toGeoJSON(filtered()), cluster: true, clusterRadius: 46, clusterMaxZoom: 12 });
      map.addLayer({ id: "places-anchor", type: "circle", source: "places", paint: { "circle-radius": 1, "circle-opacity": 0 } });
      map.on("render", syncMarkers);
      // Start on the view set in the country file; fit all places otherwise
      const id = decodeURIComponent(location.hash.slice(1));
      if (!state.meta.center && !state.places.some((p) => p.id === id)) fitAll(false);
    });
  }

  // ---------- Place sheet ----------
  function renderSheet(p) {
    const v = verdictOf(p);
    const photo = p.photo ? `<img src="/images/places/${esc(state.country.id)}/${esc(p.photo)}" alt="${esc(tr(p.name))}" onerror="this.remove()">` : "";
    const tiles = Object.entries(p.info || {}).filter(([, x]) => tr(x))
      .map(([k, x]) => `<div class="tile" style="--s:${INFO[k]?.s || "var(--yellow)"}"><small>${esc(label(INFO[k]) || k)}</small><b>${esc(tr(x))}</b></div>`).join("");
    const tips = (p.tips || []).map((x) => `<div class="tip">💡 <b>${esc(t("Astuce", "Tip"))}</b> : ${esc(tr(x))}</div>`).join("");
    const directions = p.google_maps || `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
    $("#sheet").innerHTML = `
      <div class="sheet-hero">${HodoIcons.icon(iconOf(p), 120)}${photo}
        <button type="button" class="sheet-close" data-close aria-label="${esc(t("Fermer", "Close"))}">✕</button></div>
      <div class="sheet-body">
        <div>${p.name_ja ? `<div class="jp">${esc(p.name_ja)}</div>` : ""}<h2>${esc(tr(p.name))}</h2></div>
        <div class="pills">
          <span class="pill strong">📍 ${esc(p.city || "")}</span>
          <span class="pill strong">${esc(label(CATEGORIES[p.category]))}</span>
          <span class="pill v-${v}">${esc(label(VERDICTS[v]))}</span>
        </div>
        ${tr(p.review) ? `<div class="box"><h3><i></i>${esc(v === "wish" ? t("Pourquoi je veux y aller", "Why it's on my list") : t("Mon avis", "My review"))}</h3><p>${esc(tr(p.review))}</p></div>` : ""}
        ${tr(p.experience) ? `<div class="box" style="--dot:var(--lav)"><h3><i></i>${esc(t("Mon expérience", "My experience"))}</h3><p>${esc(tr(p.experience))}</p></div>` : ""}
        ${tiles ? `<div class="tiles">${tiles}</div>` : ""}
        ${tips}
        <div class="actions">
          <a class="btn dark" href="${esc(directions)}" target="_blank" rel="noopener">➜ ${esc(t("Y aller", "Directions"))}</a>
          <button type="button" class="btn" data-share>↗ ${esc(t("Partager", "Share"))}</button>
          ${p.guide ? `<a class="btn wide" href="/${esc(p.guide)}">📖 ${esc(t("Lire mon guide complet", "Read my full guide"))}</a>` : ""}
        </div>
        <a class="mini-planner" href="${esc(Hodo.plannerLink({ destination: state.country.id, place: p.id }))}" target="_blank" rel="noopener">
          ${HodoIcons.icon("bunny", 48)}<span><b>${esc(t("Un itinéraire sur mesure ?", "Want a tailor-made itinerary?"))}</b>
          <span>${esc(t("HodoPlanner construit ton voyage selon tes envies.", "HodoPlanner builds your trip around you."))}</span></span></a>
      </div>`;
  }

  function setActive(id) {
    state.activeId = id;
    for (const [key, m] of markers) m.getElement().classList.toggle("active", key === `p${id}`);
    document.querySelectorAll(".place").forEach((el) => el.classList.toggle("active", el.dataset.place === id));
  }

  function openPlace(id) {
    const p = state.places.find((x) => x.id === id);
    if (!p) return;
    renderSheet(p);
    $("#sheet").classList.add("open");
    $("#sheet").setAttribute("aria-hidden", "false");
    $("#sheet").scrollTop = 0;
    $("#backdrop").classList.add("show");
    setActive(id);
    history.replaceState(null, "", `${location.pathname}${location.search}#${id}`);
    if (map) map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 11), duration: 700 });
  }

  function closeSheet() {
    $("#sheet").classList.remove("open");
    $("#sheet").setAttribute("aria-hidden", "true");
    $("#backdrop").classList.remove("show");
    setActive(null);
    history.replaceState(null, "", location.pathname + location.search);
  }

  // ---------- Events ----------
  function bind() {
    $("#chips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-f]");
      if (!b) return;
      state.filter = b.dataset.f;
      renderChips(); renderList(); refreshMap();
      if (map) fitAll(true);
    });
    $("#list").addEventListener("click", (e) => {
      const b = e.target.closest("[data-place]");
      if (b) openPlace(b.dataset.place);
    });
    $("#backdrop").addEventListener("click", closeSheet);
    $("#sheet").addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeSheet();
      if (e.target.closest("[data-share]") && state.activeId) {
        const p = state.places.find((x) => x.id === state.activeId);
        Hodo.share(tr(p.name), tr(p.review), `${location.origin}${location.pathname}${location.search}#${p.id}`);
      }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
    $("#expandBtn").addEventListener("click", () => {
      $("#mapCard").classList.toggle("full");
      document.body.style.overflow = $("#mapCard").classList.contains("full") ? "hidden" : "";
      setTimeout(() => map?.resize(), 50);
    });
  }

  // ---------- Boot ----------
  async function load() {
    const id = new URLSearchParams(location.search).get("c") || "japan";
    const { countries = [] } = await Hodo.yaml("/data/countries.yaml");
    const c = countries.find((x) => x && x.id === id);
    if (!c || !c.places) { location.replace("/beta/"); return false; }
    const data = await Hodo.yaml(`/data/${c.places}`);
    state.country = c;
    state.meta = data.country || {};
    state.places = (data.places || [])
      .filter((p) => p && p.id && Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p) => ({ ...p, category: CATEGORIES[p.category] ? p.category : "see" }));
    return true;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    let ok = false;
    try { ok = await load(); } catch (err) { console.error("Could not load the country:", err); }
    if (!ok) return;
    bind();
    Hodo.onLang(() => {
      renderHead(); renderChips(); renderList();
      if (state.activeId && $("#sheet").classList.contains("open")) renderSheet(state.places.find((x) => x.id === state.activeId));
    });
    initMap();
    const id = decodeURIComponent(location.hash.slice(1));
    if (state.places.some((p) => p.id === id)) openPlace(id);
  });
})();
