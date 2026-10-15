/* HodoGuides bêta · map-first app
 * World view: a calm globe with the visited countries (proposal C).
 * Country view: the map zooms in on region bubbles; a region shows its cities
 * and places in the bottom panel, with filters and a quick place sheet
 * (proposal A). One page, URL hash routes:
 *   #japan · #japan/~kansai · #japan/~kansai/Kyoto · #japan/fushimi-inari-taisha · #explore
 */
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
    been:      { fr: "✓ J'y suis allée",     en: "✓ Been there" },
    wish:      { fr: "🔖 À tester",          en: "🔖 Not tried yet" },
  };
  const INFO = {
    when:     { fr: "Quand",       en: "When",    s: "var(--yellow)" },
    price:    { fr: "Prix",        en: "Price",   s: "var(--mint)" },
    duration: { fr: "Durée",       en: "Time",    s: "var(--blue)" },
    booking:  { fr: "Réservation", en: "Booking", s: "var(--pink)" },
    access:   { fr: "Accès",       en: "Access",  s: "var(--lav)" },
  };
  const SHADOWS = ["var(--pink)", "var(--blue)", "var(--mint)", "var(--yellow)", "var(--lav)"];
  // Below REGION_ZOOM, countries without a guide are dots; above, photo bubbles.
  const REGION_ZOOM = 2.4;

  const state = {
    countries: [],
    view: "world",        // world | country
    countryId: null,
    region: null,         // region id inside the country, null = all regions
    city: null,           // city inside the region, null = all cities
    filter: "all",
    activeId: null,
    mode: null,           // list | place | explore | search
    query: "",
  };

  const $ = (s) => document.querySelector(s);
  const label = (o) => (o ? o[Hodo.lang] || o.fr : "");
  const wide = () => matchMedia("(min-width:960px)").matches;
  const country = () => state.countries.find((c) => c.id === state.countryId);
  const places = () => country()?._places || [];
  const isReady = (c) => !!c._places?.length;
  const verdictOf = (p) => (p.visited ? (p.verdict || "been") : "wish");
  const regions = () => country()?._meta?.regions || [];
  const regionOf = (id) => regions().find((r) => r.id === id);
  const inScope = (p) => (!state.region || p.region === state.region) && (!state.city || p.city === state.city);
  const scoped = () => places().filter(inScope);
  const cityLabel = (c) => String(c || "").replace(/^près de /, "");
  // A country can swap the default drawing of a category (China: a pagoda rather than a torii for "Sights")
  const catIcon = (cat) => country()?._meta?.icons?.[cat] || HodoIcons.CATEGORY_ICON[cat] || "torii";
  const iconOf = (p) => (HodoIcons.has(p.icon) ? p.icon : catIcon(p.category));
  const plural = (n, fr1, frN, en1, enN) => `${n} ${t(n > 1 ? frN : fr1, n > 1 ? enN : en1)}`;

  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function allLangs(v) { return v && typeof v === "object" ? Object.values(v).join(" ") : String(v || ""); }

  // ===================== Map =====================
  let map = null;
  const placeMarkers = new Map();

  function worldView() {
    const ready = state.countries.find(isReady);
    return {
      center: ready ? [ready.lng - (wide() ? 40 : 22), ready.lat - 4] : [40, 30],
      zoom: wide() ? 1.7 : 1.05,
    };
  }

  function countryView(c) {
    const m = c._meta || {};
    return { center: m.center ? [m.center.lng, m.center.lat] : [c.lng, c.lat], zoom: m.zoom || c.zoom || 5 };
  }

  /** Keep the map's focus area clear of the panel. */
  function mapPadding() {
    const panel = $("#panel");
    if (panel.dataset.size === "closed") return { top: 0, bottom: 0, left: 0, right: 0 };
    if (wide()) return { top: 0, bottom: 0, left: 430, right: 0 };
    return { top: 110, bottom: Math.min(panel.getBoundingClientRect().height || innerHeight * 0.44, innerHeight * 0.5), left: 0, right: 0 };
  }

  function initMap() {
    map = Hodo.createMap({ container: "map", projection: "globe", ...worldView() });
    map.on("style.load", () => { map.setFog(Hodo.theme.fog); paintVisitedCountries(); });
    const level = () => { document.body.dataset.level = map.getZoom() < REGION_ZOOM ? "world" : "region"; };
    map.on("zoom", level);
    // The intro fades as soon as the visitor starts exploring
    const fade = (e) => { if (e.originalEvent) $(".intro").classList.add("faded"); };
    map.on("dragstart", fade);
    map.on("zoomstart", fade);
    map.on("click", hideWorldCard);
    map.on("load", () => {
      level();
      addCountryMarkers();
      map.addSource("places", { type: "geojson", data: emptyFC(), cluster: true, clusterRadius: 46, clusterMaxZoom: 12 });
      map.addLayer({ id: "places-anchor", type: "circle", source: "places", paint: { "circle-radius": 1, "circle-opacity": 0 } });
      map.on("render", syncPlaceMarkers);
      route({ animate: false });
    });
  }

  /** Colour the countries Erika has visited, a bit stronger for the ones with places on the map. */
  function paintVisitedCountries() {
    if (map.getSource("hodo-countries")) return;
    const codes = (list) => [...new Set(list.filter((c) => c.iso).map((c) => c.iso))];
    const visited = codes(state.countries), ready = codes(state.countries.filter(isReady));
    if (!visited.length) return;
    // Mapbox's country shapes; the worldview filter keeps one shape per disputed area
    map.addSource("hodo-countries", { type: "vector", url: "mapbox://mapbox.country-boundaries-v1" });
    const before = map.getStyle().layers.find((l) => l.type === "symbol" || l.id === "hodo-coast")?.id;
    const shown = ["all", ["any", ["==", "all", ["get", "worldview"]], ["in", "US", ["get", "worldview"]]], ["match", ["get", "iso_3166_1"], visited, true, false]];
    map.addLayer({ id: "hodo-visited", type: "fill", source: "hodo-countries", "source-layer": "country_boundaries", filter: shown,
      paint: { "fill-color": ["match", ["get", "iso_3166_1"], ready.length ? ready : ["--"], Hodo.theme.ready, Hodo.theme.visited],
        // strong on the globe, fading out once zoomed into a country so the place markers stay readable
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 2.5, 0.85, 5, 0.3, 8, 0] } }, before);
    map.addLayer({ id: "hodo-visited-line", type: "line", source: "hodo-countries", "source-layer": "country_boundaries", filter: shown,
      paint: { "line-color": Hodo.theme.border, "line-width": 0.8 } }, before);
  }

  // ----- countries -----
  function bubble(c, size) {
    // No cover photo (or a missing file): show the country's drawing instead
    const drawing = HodoIcons.has(c.icon) ? c.icon : "bunny";
    const img = c.cover
      ? `<img src="/${esc(c.cover)}" alt="" loading="lazy" onerror="this.outerHTML=window.HodoIcons.icon('${drawing}', ${size - 14})">`
      : HodoIcons.icon(drawing, size - 14);
    return `<span class="wm-bubble">${img}</span>`;
  }

  function addCountryMarkers() {
    for (const c of state.countries) {
      if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) continue;
      const el = document.createElement("button");
      el.type = "button";
      el.className = "wm" + (isReady(c) ? " ready" : "") + (c.cover ? " has-cover" : "");
      el.innerHTML = isReady(c)
        ? `${bubble(c, 60)}<span class="wm-count">${c._places.length}</span><span class="wm-name"></span>`
        : `<span class="wm-dot"></span>${bubble(c, 42)}`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isReady(c)) go(`#${c.id}`);
        else showWorldCard(c);
      });
      c._el = el;
      new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([c.lng, c.lat]).addTo(map);
    }
    labelCountryMarkers();
  }

  function labelCountryMarkers() {
    for (const c of state.countries) {
      if (!c._el) continue;
      c._el.title = tr(c.name);
      c._el.setAttribute("aria-label", tr(c.name));
      const name = c._el.querySelector(".wm-name");
      if (name) name.textContent = tr(c.name);
    }
  }

  function showWorldCard(c) {
    const card = $("#worldCard");
    card.innerHTML = `<button type="button" class="wm-close" aria-label="${esc(t("Fermer", "Close"))}">✕</button>
      <div class="wm-card">${c.cover ? `<img src="/${esc(c.cover)}" alt="" onerror="this.remove()">` : ""}
      <div class="wm-card-body"><b>${esc(tr(c.name))}</b>
        <span class="pill v-wish">🔖 ${esc(t("J'y suis allée · guide bientôt", "I've been there · guide soon"))}</span>
        <a href="${esc(Hodo.plannerLink({ destination: c.id }))}" target="_blank" rel="noopener">${esc(t("Préparer ce voyage avec HodoPlanner →", "Plan this trip with HodoPlanner →"))}</a>
      </div></div>`;
    card.hidden = false;
    card.querySelector(".wm-close").addEventListener("click", hideWorldCard);
  }
  function hideWorldCard() { $("#worldCard").hidden = true; }

  // ----- places -----
  function emptyFC() { return { type: "FeatureCollection", features: [] }; }

  function filtered() {
    return scoped().filter((p) => {
      if (state.filter === "all") return true;
      if (state.filter === "love") return verdictOf(p) === "love";
      if (state.filter === "wish") return verdictOf(p) === "wish";
      return p.category === state.filter;
    });
  }

  function refreshPlaces() {
    if (!map?.getSource("places")) return;
    for (const m of placeMarkers.values()) m.remove();
    placeMarkers.clear();
    // With regions, the places only show once a region is open (the country shows region bubbles)
    const list = state.view === "country" && (state.region || state.mode === "place" || !regions().length) ? filtered() : [];
    showRegionMarkers();
    map.getSource("places").setData({ type: "FeatureCollection", features: list.map((p) => ({
      type: "Feature", properties: { id: p.id }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } })) });
  }

  // ----- regions -----
  const regionMarkers = [];
  function showRegionMarkers() {
    const on = state.view === "country" && !state.region && state.mode !== "place" && regions().length;
    const cid = on ? state.countryId : null;
    if (regionMarkers.cid === cid) return;
    regionMarkers.forEach((m) => m.remove());
    regionMarkers.length = 0;
    regionMarkers.cid = cid;
    if (!on) return;
    for (const r of regions()) {
      const ps = places().filter((p) => p.region === r.id);
      if (!ps.length) continue;
      const { lng, lat } = r.at || regionCentre(ps);
      const el = document.createElement("button");
      el.type = "button";
      el.className = "rg";
      el.setAttribute("aria-label", `${tr(r.name)} · ${ps.length}`);
      el.innerHTML = `<span class="rg-in">${HodoIcons.icon(HodoIcons.has(r.icon) ? r.icon : regionIcon(ps), 40)}<span class="rg-count">${ps.length}</span></span><span class="rg-name">${esc(tr(r.short || r.name))}</span>`;
      el.addEventListener("click", (e) => { e.stopPropagation(); go(`#${state.countryId}/~${r.id}`); });
      regionMarkers.push(new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([lng, lat]).addTo(map));
    }
  }
  function regionCentre(ps) {
    const c = core(ps);
    return { lng: c.reduce((a, p) => a + p.lng, 0) / c.length, lat: c.reduce((a, p) => a + p.lat, 0) / c.length };
  }
  /** The drawing a region is best known for: the most common one among the places Erika visited there. */
  function regionIcon(ps) {
    const pool = ps.some((p) => p.visited) ? ps.filter((p) => p.visited) : ps;
    const n = new Map();
    for (const p of pool) { const i = iconOf(p); if (!["ramen", "cup", "ticket", "camera", "shop"].includes(i)) n.set(i, (n.get(i) || 0) + 1); }
    return [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || iconOf(pool[0]);
  }
  /** Leave out far-flung places (a remote island) so the map frames where most places are. */
  function core(ps) {
    if (ps.length < 4) return ps;
    const mid = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    const lat = mid(ps.map((p) => p.lat)), lng = mid(ps.map((p) => p.lng));
    const d = ps.map((p) => Math.hypot(p.lat - lat, p.lng - lng));
    const lim = Math.max(mid(d) * 4, 0.6);
    return ps.filter((p, i) => d[i] <= lim);
  }
  /** Frame a set of places in the part of the map the panel leaves free (fitBounds is unreliable on the globe). */
  function farOff(ps, maxDeg) {
    const mid = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    const lat = mid(ps.map((p) => p.lat)), lng = mid(ps.map((p) => p.lng));
    const keep = ps.filter((p) => Math.hypot(p.lat - lat, p.lng - lng) <= maxDeg);
    return keep.length ? keep : ps;
  }
  function fitTo(ps, duration, { keepAll = false } = {}) {
    if (!ps.length) return;
    // keepAll: frame every point except the very far ones (a region 12° away, like Okinawa, stays reachable from the list)
    const pts = keepAll ? farOff(ps, wide() ? 11.5 : 10) : core(ps);
    const y = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / (2 * Math.PI);   // Mercator, in world widths
    const lngs = pts.map((p) => p.lng), ys = pts.map((p) => y(p.lat));
    const pad = mapPadding(), w = innerWidth - pad.left - pad.right - 80, h = innerHeight - pad.top - pad.bottom - 150;
    const spanX = Math.max(Math.max(...lngs) - Math.min(...lngs), 0.02) / 360, spanY = Math.max(Math.max(...ys) - Math.min(...ys), 0.0001);
    const zoom = Math.min(12, Math.log2(Math.max(w, 120) / 512 / spanX), Math.log2(Math.max(h, 120) / 512 / spanY));
    const midY = (Math.max(...ys) + Math.min(...ys)) / 2;
    const lat = (Math.atan(Math.exp(midY * 2 * Math.PI)) - Math.PI / 4) * 360 / Math.PI;
    flyCentered([(Math.max(...lngs) + Math.min(...lngs)) / 2, lat], zoom, duration, 70);
  }

  /** Fly so that a point sits in the middle of the area the panel leaves free.
   * The globe ignores camera padding, so the map centre is shifted by hand instead. */
  function flyCentered([lng, lat], zoom, duration, extraTop = 0) {
    const pad = mapPadding(), W = innerWidth, H = innerHeight, scale = 512 * 2 ** zoom;
    const cx = (pad.left + W - pad.right) / 2, cy = (pad.top + extraTop + H - pad.bottom) / 2;
    const y = Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / (2 * Math.PI) + (cy - H / 2) / scale;
    map.flyTo({
      center: [lng - (cx - W / 2) / scale * 360, (Math.atan(Math.exp(y * 2 * Math.PI)) - Math.PI / 4) * 360 / Math.PI],
      zoom, padding: { top: 0, bottom: 0, left: 0, right: 0 }, duration,
    });
  }

  function placeEl(p) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "mk" + (p.visited ? "" : " wish") + (p.id === state.activeId ? " active" : "");
    el.setAttribute("aria-label", tr(p.name));
    el.innerHTML = `<span class="mk-in">${HodoIcons.icon(iconOf(p), 32)}${verdictOf(p) === "love" ? '<span class="heart">♥</span>' : ""}</span>`;
    el.addEventListener("click", (e) => { e.stopPropagation(); go(`#${state.countryId}/${p.id}`); });
    return el;
  }

  function clusterEl(count, id, coords) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "cluster";
    el.textContent = count;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      map.getSource("places").getClusterExpansionZoom(id, (err, zoom) => {
        if (!err) flyCentered(coords, zoom + 0.4, 600);
      });
    });
    return el;
  }

  /** Keep HTML markers in sync with the clustered source (Mapbox "HTML clusters" pattern). */
  function syncPlaceMarkers() {
    if (!map.getSource("places") || !map.isSourceLoaded("places")) return;
    const seen = new Set();
    for (const f of map.querySourceFeatures("places")) {
      const props = f.properties, coords = f.geometry.coordinates;
      const key = props.cluster ? `c${props.cluster_id}` : `p${props.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (placeMarkers.has(key)) continue;
      let el;
      if (props.cluster) el = clusterEl(props.point_count, props.cluster_id, coords);
      else {
        const p = places().find((x) => x.id === props.id);
        if (!p) continue;
        el = placeEl(p);
      }
      placeMarkers.set(key, new mapboxgl.Marker({ element: el, anchor: props.cluster ? "center" : "bottom", offset: props.cluster ? [0, 0] : [0, -8] })
        .setLngLat(coords).addTo(map));
    }
    for (const [key, m] of placeMarkers) if (!seen.has(key)) { m.remove(); placeMarkers.delete(key); }
  }

  function setActive(id) {
    state.activeId = id;
    for (const [key, m] of placeMarkers) m.getElement().classList.toggle("active", key === `p${id}`);
  }

  // ===================== Panel =====================
  function setPanel(size) {
    const panel = $("#panel");
    panel.dataset.size = size;
    panel.setAttribute("aria-hidden", size === "closed" ? "true" : "false");
    document.body.classList.toggle("panel-open", size !== "closed");
    renderListToggle();
  }

  /** In the country view, a closed panel leaves a small "List" button to bring it back. */
  function renderListToggle() {
    const bar = $(".country-bar");
    let b = bar.querySelector("[data-list]");
    const show = state.view === "country" && $("#panel").dataset.size === "closed";
    if (!show) { b?.remove(); return; }
    if (!b) {
      b = document.createElement("button");
      b.type = "button"; b.className = "btn small"; b.dataset.list = "";
      b.addEventListener("click", () => { setPanel("peek"); });
      bar.appendChild(b);
    }
    b.textContent = `☰ ${t("Liste", "List")} · ${state.region ? scoped().length : places().length}`;
  }

  function chips() {
    const present = new Set(scoped().map((p) => p.category));
    const out = [
      `<button type="button" class="chip text${state.filter === "all" ? " on" : ""}" data-f="all">${esc(t("Tout", "All"))}</button>`,
      `<button type="button" class="chip text${state.filter === "love" ? " on" : ""}" data-f="love">♥ ${esc(t("Coups de cœur", "Favourites"))}</button>`,
    ];
    for (const [id, c] of Object.entries(CATEGORIES)) {
      if (present.has(id)) out.push(`<button type="button" class="chip${state.filter === id ? " on" : ""}" data-f="${id}">${HodoIcons.icon(catIcon(id), 24)}${esc(label(c))}</button>`);
    }
    if (scoped().some((p) => !p.visited)) out.push(`<button type="button" class="chip text${state.filter === "wish" ? " on" : ""}" data-f="wish">🔖 ${esc(t("À tester", "Not tried yet"))}</button>`);
    return `<div class="chips">${out.join("")}</div>`;
  }

  function placeCard(p, i) {
    const v = verdictOf(p);
    const thumb = p.photo ? `<img src="/images/places/${esc(state.countryId)}/${esc(p.photo)}" alt="" loading="lazy">` : HodoIcons.icon(iconOf(p), 58);
    return `<button type="button" class="card place" style="--sh:${SHADOWS[i % SHADOWS.length]}" data-place="${esc(p.id)}">
      <span class="icon-tile">${thumb}</span>
      <span class="place-body">
        <span class="place-meta">📍 ${esc(cityLabel(p.city))} · ${esc(label(CATEGORIES[p.category]))}</span>
        <b>${esc(tr(p.name))}</b>
        ${p.name_ja ? `<span class="jp">${esc(p.name_ja)}</span>` : ""}
        <span class="pill v-${v}">${esc(label(VERDICTS[v]))}</span>
        ${tr(p.review) ? `<p>${esc(tr(p.review))}</p>` : ""}
      </span></button>`;
  }

  /** Country root: one card per region. */
  function renderRegions() {
    const c = country(), m = c._meta || {}, all = places();
    const been = all.filter((p) => p.visited).length;
    $("#panelBody").innerHTML = `
      <div class="p-head"><h2>${esc(tr(c.name))}</h2>${m.name_ja ? `<span class="jp">${esc(m.name_ja)}</span>` : ""}
        <span class="pill strong">📍 ${esc(plural(all.length, "lieu", "lieux", "place", "places"))}</span></div>
      ${m.intro ? `<p class="p-intro">${esc(tr(m.intro))}${been ? ` · ✓ ${esc(t(`${been} où je suis allée`, `${been} I've been to`))}` : ""}</p>` : ""}
      <h3 class="p-section">${esc(t("Choisis une région", "Pick a region"))}</h3>
      ${regions().map((r, i) => {
        const ps = all.filter((p) => p.region === r.id);
        if (!ps.length) return "";
        const cities = topCities(ps).slice(0, 4).map(([n]) => cityLabel(n));
        const v = ps.filter((p) => p.visited).length;
        return `<button type="button" class="card region" style="--sh:${SHADOWS[i % SHADOWS.length]}" data-region="${esc(r.id)}">
          <span class="icon-tile">${HodoIcons.icon(HodoIcons.has(r.icon) ? r.icon : regionIcon(ps), 46)}</span>
          <span class="place-body"><b>${esc(tr(r.name))}</b>
            <span class="place-meta">${esc(cities.join(" · "))}</span>
            <span class="pills"><span class="pill strong">${esc(plural(ps.length, "lieu", "lieux", "place", "places"))}</span>${v ? `<span class="pill v-been">✓ ${v}</span>` : ""}</span>
          </span></button>`;
      }).join("")}`;
  }
  function topCities(ps) {
    const n = new Map();
    for (const p of ps) n.set(p.city, (n.get(p.city) || 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
  }
  function cityChips() {
    const ps = places().filter((p) => p.region === state.region);
    const cities = topCities(ps);
    if (cities.length < 2) return "";
    const base = `#${state.countryId}/~${state.region}`;
    return `<div class="chips cities">
      <a class="chip text${state.city ? "" : " on"}" href="${esc(base)}">${esc(t("Toute la région", "Whole region"))} · ${ps.length}</a>
      ${cities.map(([n, k]) => `<a class="chip text${state.city === n ? " on" : ""}" href="${esc(base + "/" + encodeURIComponent(n))}">${esc(cityLabel(n))} · ${k}</a>`).join("")}</div>`;
  }

  function renderList() {
    if (regions().length && !state.region) return renderRegions();
    const c = country(), m = c._meta || {}, r = regionOf(state.region);
    const all = scoped(), list = filtered();
    const loves = all.filter((p) => verdictOf(p) === "love").length;
    const groups = [
      { dot: "var(--pink)", title: t("Coups de cœur", "Favourites"), items: list.filter((p) => verdictOf(p) === "love") },
      { dot: "var(--mint)", title: t("Recommandés", "Recommended"), items: list.filter((p) => ["recommend", "optional"].includes(verdictOf(p))) },
      { dot: "var(--blue)", title: t("J'y suis allée", "Been there"), items: list.filter((p) => verdictOf(p) === "been") },
      { dot: "var(--ink-3)", title: t("Sur ma liste, à tester", "On my list, not tried yet"), items: list.filter((p) => verdictOf(p) === "wish") },
    ].filter((g) => g.items.length);
    let i = 0;
    $("#panelBody").innerHTML = `
      ${r ? `<button type="button" class="p-back" data-go-country>← ${esc(t("Toutes les régions", "All regions"))} · ${esc(tr(c.name))}</button>` : ""}
      <div class="p-head"><h2>${esc(r ? tr(r.name) : tr(c.name))}</h2>${!r && m.name_ja ? `<span class="jp">${esc(m.name_ja)}</span>` : ""}
        <span class="pill strong">📍 ${esc(plural(all.length, "lieu", "lieux", "place", "places"))}</span></div>
      ${!r && m.intro ? `<p class="p-intro">${esc(tr(m.intro))}${loves ? ` · ♥ ${esc(plural(loves, "coup de cœur", "coups de cœur", "favourite", "favourites"))}` : ""}</p>` : ""}
      ${r ? cityChips() : ""}
      ${chips()}
      ${groups.length ? groups.map((g) => `<div class="group-title" style="--dot:${g.dot}"><i></i>${esc(g.title)}</div>${g.items.map((p) => placeCard(p, i++)).join("")}`).join("")
        : `<div class="card empty">${esc(t("Aucun lieu ici pour l'instant.", "No place here yet."))}</div>`}`;
  }

  function renderPlace(p) {
    const v = verdictOf(p);
    const photo = p.photo ? `<img src="/images/places/${esc(state.countryId)}/${esc(p.photo)}" alt="${esc(tr(p.name))}" onerror="this.remove()">` : "";
    const tiles = Object.entries(p.info || {}).filter(([, x]) => tr(x))
      .map(([k, x]) => `<div class="tile" style="--s:${INFO[k]?.s || "var(--yellow)"}"><small>${esc(label(INFO[k]) || k)}</small><b>${esc(tr(x))}</b></div>`).join("");
    const tips = (p.tips || []).map((x) => `<div class="tip">💡 <b>${esc(t("Astuce", "Tip"))}</b> : ${esc(tr(x))}</div>`).join("");
    const directions = p.google_maps || `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
    $("#panelBody").innerHTML = `
      <button type="button" class="p-back" data-back>← ${esc(regionOf(p.region) ? tr(regionOf(p.region).name) : `${t("Tous les lieux", "All places")} · ${tr(country().name)}`)}</button>
      <div class="sheet-hero">${HodoIcons.icon(iconOf(p), 110)}${photo}</div>
      <div class="sheet-body">
        <div>${p.name_ja ? `<div class="jp">${esc(p.name_ja)}</div>` : ""}<h2>${esc(tr(p.name))}</h2></div>
        <div class="pills">
          <span class="pill strong">📍 ${esc(cityLabel(p.city))}</span>
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
        <a class="mini-planner" href="${esc(Hodo.plannerLink({ destination: state.countryId, place: p.id }))}" target="_blank" rel="noopener">
          ${HodoIcons.icon("bunnymap", 52)}<span><b>${esc(t("Un itinéraire sur mesure ?", "Want a tailor-made itinerary?"))}</b>
          <span>${esc(t("HodoPlanner construit ton voyage selon tes envies.", "HodoPlanner builds your trip around you."))}</span></span></a>
      </div>`;
  }

  function renderExplore() {
    const ready = state.countries.filter(isReady);
    const soon = state.countries.filter((c) => !isReady(c)).sort((a, b) => (b.cover ? 1 : 0) - (a.cover ? 1 : 0));
    $("#panelBody").innerHTML = `
      <div class="p-head"><h2>${esc(t("Guides & pays", "Guides & countries"))}</h2><button type="button" class="square" data-close style="margin-left:auto" aria-label="${esc(t("Fermer", "Close"))}">✕</button></div>
      <h3 class="p-section">${esc(t("Destinations prêtes", "Ready destinations"))} <span class="jp">目的地</span></h3>
      <div class="dest-grid">${ready.map((c, i) => {
        const ps = c._places, loves = ps.filter((p) => verdictOf(p) === "love").length;
        const icons = [...new Set(ps.map((p) => p.icon).filter(Boolean))].slice(0, 6);
        return `<a class="card dest" style="--sh:${SHADOWS[(i + 1) % SHADOWS.length]}" href="#${esc(c.id)}">
          <div class="dest-img">${(c._meta?.photo || c.cover) ? `<img src="/${esc(c._meta?.photo || c.cover)}" alt="" loading="lazy">` : ""}<span class="pill strong">✓ ${esc(t("Prêt à explorer", "Ready to explore"))}</span></div>
          <div class="dest-body"><h3>${esc(tr(c.name))} ${c._meta?.name_ja ? `<span class="jp">${esc(c._meta.name_ja)}</span>` : ""}</h3>
            <div class="icons-row">${icons.map((n) => `<span class="icon-tile">${HodoIcons.icon(n, 30)}</span>`).join("")}</div>
            <div class="pills"><span class="pill strong">📍 ${esc(plural(ps.length, "lieu", "lieux", "place", "places"))}</span>${loves ? `<span class="pill" style="--bg:var(--pink-soft)">♥ ${loves}</span>` : ""}</div>
          </div></a>`;
      }).join("")}</div>
      <h3 class="p-section">${esc(t("Bientôt", "Coming soon"))} <span class="jp">近日公開</span></h3>
      <div class="rail">${soon.map((c, i) => `<button type="button" class="card mini" style="--sh:${SHADOWS[i % SHADOWS.length]}" data-soon="${esc(c.id)}">
        ${c.cover ? `<img src="/${esc(c.cover)}" alt="" loading="lazy">` : `<span class="noimg">${HodoIcons.icon("bunnypaws", 48)}</span>`}
        <span class="mini-body"><b>${esc(tr(c.name))}</b><small>${esc(tr(c.region))}</small></span></button>`).join("")}</div>
      <h3 class="p-section">${esc(t("Guides pratiques", "Practical guides"))}</h3>
      <div class="guides">
        <a class="card guide" style="--sh:var(--mint)" href="/asia/japan/nagoya/ghibli-park/"><span class="icon-tile" style="background:var(--mint-soft)">${HodoIcons.icon("acorn", 44)}</span>
          <span><small>${esc(t("Japon · Nagoya · en anglais", "Japan · Nagoya"))}</small><b>${esc(t("Parc Ghibli : billets et réservation", "Ghibli Park: passes and booking"))}</b></span></a>
        <a class="card guide" style="--sh:var(--yellow)" href="/asia/japan/osaka/universal-studios.html"><span class="icon-tile" style="background:var(--yellow-soft)">${HodoIcons.icon("wheel", 44)}</span>
          <span><small>${esc(t("Japon · Osaka · en anglais", "Japan · Osaka"))}</small><b>${esc(t("Universal Studios Japan : bien préparer sa journée", "Universal Studios Japan: plan your day"))}</b></span></a>
      </div>
      <section class="card about" style="--sh:var(--lav)"><img src="/asia/japan/cover.jpg" alt="Erika" />
        <div><span class="label" style="--lb:var(--lav)">${esc(t("Qui suis-je", "About me"))}</span>
        <p>${esc(t("Moi c'est Erika ! Je partage ici uniquement les lieux où je suis vraiment allée, avec mon avis honnête.", "Hi, I'm Erika! I only share places I've actually been to, with my honest opinion."))} <i>${esc(t("(texte à écrire)", "(text to write)"))}</i></p></div></section>
      <section class="card planner" style="--sh:var(--pink)"><span class="mascot">${HodoIcons.icon("bunnymap", 72)}</span>
        <div><span class="label" style="--lb:var(--yellow);color:var(--ink)">HodoPlanner</span></div>
        <h3>${esc(t("Un voyage pensé rien que pour toi ?", "A trip designed just for you?"))}</h3>
        <p>${esc(t("Je construis ton itinéraire selon tes envies, ton rythme et ton budget.", "I build your itinerary around your interests, pace and budget."))}</p>
        <a class="btn" href="${esc(Hodo.plannerLink())}" target="_blank" rel="noopener">${esc(t("Créer mon itinéraire", "Plan my trip"))}</a></section>
      <p class="foot">HodoGuides by Erika</p>`;
    $("#panelBody").querySelectorAll(".mini img").forEach((img) => img.addEventListener("error", () => {
      const ph = document.createElement("span"); ph.className = "noimg"; ph.innerHTML = HodoIcons.icon("bunnypaws", 48); img.replaceWith(ph);
    }, { once: true }));
  }

  function renderSearch() {
    const keepFocus = document.activeElement?.id === "q";
    const q = norm(state.query.trim()).replace(/[^a-z0-9]+/g, " ");
    const hit = (text) => !q || (" " + norm(text).replace(/[^a-z0-9]+/g, " ")).includes(" " + q);
    const cs = state.countries.filter((c) => hit(allLangs(c.name))).sort((a, b) => (isReady(b) ? 1 : 0) - (isReady(a) ? 1 : 0)).slice(0, q ? 20 : 6);
    const ps = q ? state.countries.flatMap((c) => (c._places || []).map((p) => ({ p, c }))).filter(({ p }) => hit([allLangs(p.name), p.city, p.name_ja].join(" "))) : [];
    $("#panelBody").innerHTML = `
      <div class="p-head"><h2>${esc(t("Rechercher", "Search"))}</h2><button type="button" class="square" data-close style="margin-left:auto" aria-label="${esc(t("Fermer", "Close"))}">✕</button></div>
      <label class="search-box">🔍<input id="q" type="search" autocomplete="off" value="${esc(state.query)}" placeholder="${esc(t("Un pays, une ville, un lieu…", "A country, a city, a place…"))}"></label>
      ${ps.map(({ p, c }) => `<button type="button" class="card result" style="--sh:var(--blue)" data-goto="#${esc(c.id)}/${esc(p.id)}">
          <span class="icon-tile">${HodoIcons.icon(iconOf(p), 38)}</span><span><b>${esc(tr(p.name))}</b><small>${esc(cityLabel(p.city))} · ${esc(tr(c.name))}</small></span></button>`).join("")}
      ${cs.map((c) => `<button type="button" class="card result" style="--sh:${isReady(c) ? "var(--pink)" : "var(--lav)"}" ${isReady(c) ? `data-goto="#${esc(c.id)}"` : `data-soon="${esc(c.id)}"`}>
          <span class="icon-tile">${c.cover ? `<img src="/${esc(c.cover)}" alt="" onerror="this.remove()">` : HodoIcons.icon("bunny", 36)}</span>
          <span><b>${esc(tr(c.name))}</b><small>${esc(isReady(c) ? plural(c._places.length, "lieu", "lieux", "place", "places") : t("guide bientôt", "guide soon"))}</small></span></button>`).join("")}
      ${!ps.length && !cs.length ? `<div class="card empty">${esc(t("Rien trouvé…", "Nothing found…"))}</div>` : ""}`;
    const input = $("#q");
    input.addEventListener("input", (e) => { state.query = e.target.value; renderSearch(); });
    if (keepFocus || !q) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }

  function renderPanel() {
    if (state.mode === "list") renderList();
    else if (state.mode === "place") renderPlace(places().find((p) => p.id === state.activeId));
    else if (state.mode === "explore") renderExplore();
    else if (state.mode === "search") renderSearch();
    $("#panelBody").scrollTop = 0;
  }

  // ===================== Navigation =====================
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function enterCountry(c, animate) {
    const changed = state.countryId !== c.id || state.view !== "country";
    state.view = "country";
    state.countryId = c.id;
    document.body.dataset.view = "country";
    hideWorldCard();
    if (changed) {
      state.filter = "all";
      state.region = null; state.city = null;
    }
    return changed;
  }

  /** Read the URL hash and show the matching view. */
  function route({ animate = true } = {}) {
    const [a, b, cityPart] = decodeURIComponent(location.hash.slice(1)).split("/");
    const c = state.countries.find((x) => x.id === a && isReady(x));
    const duration = animate ? 1600 : 0;

    if (a === "explore") {
      state.mode = "explore";
      setPanel("full"); renderPanel();
      return;
    }
    if (!c) {
      // World
      const wasCountry = state.view === "country";
      state.view = "world"; state.countryId = null; state.activeId = null; state.mode = null; state.region = null; state.city = null;
      document.body.dataset.view = "world";
      $(".intro").classList.remove("faded");
      refreshPlaces();
      setPanel("closed");
      if (wasCountry || !animate) map?.flyTo({ ...worldView(), padding: mapPadding(), duration });
      return;
    }

    const changed = enterCountry(c, animate);
    const p = b && !b.startsWith("~") && c._places.find((x) => x.id === b);
    const r = b && b.startsWith("~") && (c._meta?.regions || []).find((x) => x.id === b.slice(1));
    if (p) {
      state.mode = "place";
      if (p.region && state.region !== p.region) { state.region = p.region; state.city = null; }
      refreshPlaces();
      setActive(p.id);
      if ($("#panel").dataset.size === "closed") setPanel("peek");
      renderPanel();
      flyCentered([p.lng, p.lat], Math.max(map.getZoom(), 11), animate ? 900 : 0);
    } else {
      const prev = `${state.region}/${state.city}`;
      state.mode = "list";
      state.region = r ? r.id : null;
      state.city = r && cityPart && c._places.some((x) => x.region === r.id && x.city === cityPart) ? cityPart : null;
      if (prev !== `${state.region}/${state.city}`) state.filter = "all";
      setActive(null);
      if ($("#panel").dataset.size === "closed" || changed) setPanel("peek");
      refreshPlaces();
      renderPanel();
      if (state.region) fitTo(scoped(), duration);
      else if (changed || prev !== "null/null") {
        if (regions().length) fitTo(regions().filter((x) => c._places.some((q) => q.region === x.id)).map((x) => x.at || regionCentre(c._places.filter((q) => q.region === x.id))), duration, { keepAll: true });
        else { const v = countryView(c); flyCentered(v.center, v.zoom, duration); }
      }
    }
  }

  // ===================== Events =====================
  function bind() {
    document.addEventListener("click", (e) => {
      const toWorld = e.target.closest("[data-go='world']");
      if (toWorld) { e.preventDefault(); history.pushState(null, "", location.pathname + location.search); route(); return; }
      const f = e.target.closest("[data-f]");
      if (f) { state.filter = f.dataset.f; renderList(); refreshPlaces(); return; }
      const card = e.target.closest("[data-place]");
      if (card) { go(`#${state.countryId}/${card.dataset.place}`); return; }
      const goto = e.target.closest("[data-goto]");
      if (goto) { state.query = ""; go(goto.dataset.goto); return; }
      const soon = e.target.closest("[data-soon]");
      if (soon) {
        const c = state.countries.find((x) => x.id === soon.dataset.soon);
        closeOverlay();
        map.flyTo({ center: [c.lng, c.lat], zoom: Math.max(map.getZoom(), 2.8), duration: 1200 });
        showWorldCard(c);
        return;
      }
      const rg = e.target.closest("[data-region]");
      if (rg) { go(`#${state.countryId}/~${rg.dataset.region}`); return; }
      if (e.target.closest("[data-go-country]")) { go(`#${state.countryId}`); return; }
      if (e.target.closest("[data-back]")) {
        const p = places().find((x) => x.id === state.activeId);
        go(p?.region && regionOf(p.region) ? `#${state.countryId}/~${p.region}` : `#${state.countryId}`); return;
      }
      if (e.target.closest("[data-close]")) { closeOverlay(); return; }
      if (e.target.closest("[data-share]") && state.activeId) {
        const p = places().find((x) => x.id === state.activeId);
        Hodo.share(tr(p.name), tr(p.review), `${location.origin}${location.pathname}#${state.countryId}/${p.id}`);
      }
    });

    $("#exploreBtn").addEventListener("click", () => go("#explore"));
    $("#searchBtn").addEventListener("click", () => {
      state.mode = "search"; state.query = "";
      setPanel("full"); renderPanel();
    });

    // Grip: tap to toggle, swipe up/down to resize
    const grip = $("#grip");
    let startY = null;
    grip.addEventListener("click", () => setPanel($("#panel").dataset.size === "full" ? "peek" : "full"));
    grip.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; }, { passive: true });
    grip.addEventListener("touchend", (e) => {
      if (startY == null) return;
      const dy = e.changedTouches[0].clientY - startY;
      startY = null;
      const size = $("#panel").dataset.size;
      if (dy < -30) setPanel("full");
      else if (dy > 30) setPanel(size === "full" ? "peek" : "closed");
      if (Math.abs(dy) > 30) e.preventDefault();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (state.mode === "place") $("[data-back]")?.click();
      else closeOverlay();
    });
    window.addEventListener("hashchange", () => route());
    window.addEventListener("popstate", () => route());
  }

  /** Close the search / explore panel and go back to what was under it. */
  function closeOverlay() {
    if (location.hash === "#explore") history.replaceState(null, "", location.pathname + location.search);
    if (state.view === "country") { state.mode = "list"; setPanel("peek"); renderPanel(); }
    else { state.mode = null; setPanel("closed"); }
  }

  // ===================== Boot =====================
  async function load() {
    const { countries = [] } = await Hodo.yaml("/data/countries.yaml");
    state.countries = countries.filter((c) => c && c.id);
    await Promise.all(state.countries.filter((c) => c.places).map(async (c) => {
      try {
        const data = await Hodo.yaml(`/data/${c.places}`);
        c._meta = data.country || {};
        c._places = (data.places || [])
          .filter((p) => p && p.id && Number.isFinite(p.lat) && Number.isFinite(p.lng))
          .map((p) => ({ ...p, category: CATEGORIES[p.category] ? p.category : "see" }));
      } catch (err) { console.error(err); }
    }));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try { await load(); } catch (err) { console.error("Could not load the data:", err); }
    bind();
    Hodo.onLang(() => {
      labelCountryMarkers();
      regionMarkers.cid = undefined;   // rebuild the region bubbles in the new language
      if (map?.getSource("places")) refreshPlaces();
      hideWorldCard();
      renderListToggle();
      if (state.mode && $("#panel").dataset.size !== "closed") {
        const top = $("#panelBody").scrollTop;
        renderPanel();
        $("#panelBody").scrollTop = top;
      }
    });
    initMap();
  });
})();
