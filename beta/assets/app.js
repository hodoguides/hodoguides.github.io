/* HodoGuides bêta · map-first app
 * World view: a calm globe with the visited countries (proposal C).
 * Country view: the map zooms in, a bottom panel lists the places, filters
 * them and opens a quick place sheet (proposal A). One page, URL hash routes:
 *   #japan · #japan/fushimi-inari · #explore
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
  const verdictOf = (p) => (p.visited ? (p.verdict || "recommend") : "wish");
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
    map.on("style.load", () => map.setFog({
      color: "#fdf8f2", "high-color": "#e3f0fc", "space-color": "#fdf8f2", "horizon-blend": 0.06, "star-intensity": 0,
    }));
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
    return places().filter((p) => {
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
    const list = state.view === "country" ? filtered() : [];
    map.getSource("places").setData({ type: "FeatureCollection", features: list.map((p) => ({
      type: "Feature", properties: { id: p.id }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } })) });
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
        if (!err) map.easeTo({ center: coords, zoom: zoom + 0.4, padding: mapPadding() });
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
    b.textContent = `☰ ${t("Liste", "List")} · ${places().length}`;
  }

  function chips() {
    const present = new Set(places().map((p) => p.category));
    const out = [
      `<button type="button" class="chip text${state.filter === "all" ? " on" : ""}" data-f="all">${esc(t("Tout", "All"))}</button>`,
      `<button type="button" class="chip text${state.filter === "love" ? " on" : ""}" data-f="love">♥ ${esc(t("Coups de cœur", "Favourites"))}</button>`,
    ];
    for (const [id, c] of Object.entries(CATEGORIES)) {
      if (present.has(id)) out.push(`<button type="button" class="chip${state.filter === id ? " on" : ""}" data-f="${id}">${HodoIcons.icon(catIcon(id), 24)}${esc(label(c))}</button>`);
    }
    if (places().some((p) => !p.visited)) out.push(`<button type="button" class="chip text${state.filter === "wish" ? " on" : ""}" data-f="wish">🔖 ${esc(t("À tester", "Not tried yet"))}</button>`);
    return `<div class="chips">${out.join("")}</div>`;
  }

  function placeCard(p, i) {
    const v = verdictOf(p);
    const thumb = p.photo ? `<img src="/images/places/${esc(state.countryId)}/${esc(p.photo)}" alt="" loading="lazy">` : HodoIcons.icon(iconOf(p), 58);
    return `<button type="button" class="card place" style="--sh:${SHADOWS[i % SHADOWS.length]}" data-place="${esc(p.id)}">
      <span class="icon-tile">${thumb}</span>
      <span class="place-body">
        <span class="place-meta">📍 ${esc(p.city || "")} · ${esc(label(CATEGORIES[p.category]))}</span>
        <b>${esc(tr(p.name))}</b>
        ${p.name_ja ? `<span class="jp">${esc(p.name_ja)}</span>` : ""}
        <span class="pill v-${v}">${esc(label(VERDICTS[v]))}</span>
        ${tr(p.review) ? `<p>${esc(tr(p.review))}</p>` : ""}
      </span></button>`;
  }

  function renderList() {
    const c = country(), m = c._meta || {};
    const all = places(), list = filtered();
    const loves = all.filter((p) => verdictOf(p) === "love").length;
    const groups = [
      { dot: "var(--pink)", title: t("Coups de cœur", "Favourites"), items: list.filter((p) => verdictOf(p) === "love") },
      { dot: "var(--mint)", title: t("Recommandés", "Recommended"), items: list.filter((p) => ["recommend", "optional"].includes(verdictOf(p))) },
      { dot: "var(--ink-3)", title: t("Sur ma liste, à tester", "On my list, not tried yet"), items: list.filter((p) => verdictOf(p) === "wish") },
    ].filter((g) => g.items.length);
    let i = 0;
    $("#panelBody").innerHTML = `
      <div class="p-head"><h2>${esc(tr(c.name))}</h2>${m.name_ja ? `<span class="jp">${esc(m.name_ja)}</span>` : ""}
        <span class="pill strong">📍 ${esc(plural(all.length, "lieu", "lieux", "place", "places"))}</span></div>
      ${m.intro ? `<p class="p-intro">${esc(tr(m.intro))}${loves ? ` · ♥ ${esc(plural(loves, "coup de cœur", "coups de cœur", "favourite", "favourites"))}` : ""}</p>` : ""}
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
      <button type="button" class="p-back" data-back>← ${esc(t("Tous les lieux", "All places"))} · ${esc(tr(country().name))}</button>
      <div class="sheet-hero">${HodoIcons.icon(iconOf(p), 110)}${photo}</div>
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
        <a class="mini-planner" href="${esc(Hodo.plannerLink({ destination: state.countryId, place: p.id }))}" target="_blank" rel="noopener">
          ${HodoIcons.icon("bunny", 46)}<span><b>${esc(t("Un itinéraire sur mesure ?", "Want a tailor-made itinerary?"))}</b>
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
        ${c.cover ? `<img src="/${esc(c.cover)}" alt="" loading="lazy">` : `<span class="noimg">${HodoIcons.icon("bunny", 44)}</span>`}
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
      <section class="card planner" style="--sh:var(--pink)"><span class="mascot">${HodoIcons.icon("bunny", 54)}</span>
        <div><span class="label" style="--lb:var(--yellow);color:var(--ink)">HodoPlanner</span></div>
        <h3>${esc(t("Un voyage pensé rien que pour toi ?", "A trip designed just for you?"))}</h3>
        <p>${esc(t("Je construis ton itinéraire selon tes envies, ton rythme et ton budget.", "I build your itinerary around your interests, pace and budget."))}</p>
        <a class="btn" href="${esc(Hodo.plannerLink())}" target="_blank" rel="noopener">${esc(t("Créer mon itinéraire", "Plan my trip"))}</a></section>
      <p class="foot">HodoGuides by Erika</p>`;
    $("#panelBody").querySelectorAll(".mini img").forEach((img) => img.addEventListener("error", () => {
      const ph = document.createElement("span"); ph.className = "noimg"; ph.innerHTML = HodoIcons.icon("bunny", 44); img.replaceWith(ph);
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
          <span class="icon-tile">${HodoIcons.icon(iconOf(p), 38)}</span><span><b>${esc(tr(p.name))}</b><small>${esc(p.city || "")} · ${esc(tr(c.name))}</small></span></button>`).join("")}
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
      refreshPlaces();
    }
    return changed;
  }

  /** Read the URL hash and show the matching view. */
  function route({ animate = true } = {}) {
    const [a, b] = decodeURIComponent(location.hash.slice(1)).split("/");
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
      state.view = "world"; state.countryId = null; state.activeId = null; state.mode = null;
      document.body.dataset.view = "world";
      $(".intro").classList.remove("faded");
      refreshPlaces();
      setPanel("closed");
      if (wasCountry || !animate) map?.flyTo({ ...worldView(), padding: mapPadding(), duration });
      return;
    }

    const changed = enterCountry(c, animate);
    const p = b && c._places.find((x) => x.id === b);
    if (p) {
      state.mode = "place";
      setActive(p.id);
      if ($("#panel").dataset.size === "closed") setPanel("peek");
      renderPanel();
      map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 11), padding: mapPadding(), duration: animate ? 900 : 0 });
    } else {
      state.mode = "list";
      setActive(null);
      if ($("#panel").dataset.size === "closed" || changed) setPanel("peek");
      renderPanel();
      if (changed) map.flyTo({ ...countryView(c), padding: mapPadding(), duration });
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
      if (e.target.closest("[data-back]")) { go(`#${state.countryId}`); return; }
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
      if (state.mode === "place") go(`#${state.countryId}`);
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
