/* HodoGuides · carte des lieux recommandés (prototype Japon) */
(() => {
  "use strict";

  const MAPBOX_TOKEN = "pk.eyJ1IjoiZXJpa2FyYW1lbGwiLCJhIjoiY21jbmlteXJuMDBjaDJrc2swbnA0a29wZSJ9.F8aX2alF-PpnqInkyqba8g";
  const MAPBOX_STYLE = "mapbox://styles/erikaramell/cmcnjverq008y01qw6rir46gy";
  const DATA_URL = "../data/japan.yaml";
  const PLANNER_URL = "https://planner.erikaramel.com/";

  // ---------- Textes de l'interface / UI strings ----------
  const UI = {
    fr: {
      searchPlaceholder: "Rechercher un lieu, une ville…",
      all: "Tout",
      statusAll: "Tous",
      statusVisited: "Testés",
      statusWishlist: "Ma liste",
      prototype: "Prototype · textes d'exemple",
      list: (n) => `Liste · ${n} lieu${n > 1 ? "x" : ""}`,
      listTitle: (n) => `${n} lieu${n > 1 ? "x" : ""}`,
      noResult: "Aucun lieu ne correspond.",
      myReview: "Mon avis",
      myExperience: "Mon expérience",
      practical: "Infos pratiques",
      tips: "Mes astuces",
      go: "Y aller",
      share: "Partager",
      readGuide: "Lire mon guide complet",
      copied: "Lien copié !",
      verdicts: {
        love: ["Coup de cœur", "Un de mes lieux préférés"],
        recommend: ["Recommandé", "Ça vaut le détour"],
        optional: ["Si tu as le temps", "Sympa, mais pas indispensable"],
        wish: ["Pas encore testé", "Sur ma liste pour mon prochain voyage"],
      },
      info: { when: "Quand y aller", price: "Prix", duration: "Durée", booking: "Réservation", access: "Accès" },
      plannerTitle: "Un itinéraire sur mesure ?",
      plannerText: (c) => `Je construis ton voyage au ${c} selon tes envies, ton rythme et ton budget.`,
      plannerBtn: "Découvrir HodoPlanner",
      close: "Fermer",
    },
    en: {
      searchPlaceholder: "Search a place, a city…",
      all: "All",
      statusAll: "All",
      statusVisited: "Tried",
      statusWishlist: "My list",
      prototype: "Prototype · sample texts",
      list: (n) => `List · ${n} place${n > 1 ? "s" : ""}`,
      listTitle: (n) => `${n} place${n > 1 ? "s" : ""}`,
      noResult: "No place matches.",
      myReview: "My review",
      myExperience: "My experience",
      practical: "Practical info",
      tips: "My tips",
      go: "Directions",
      share: "Share",
      readGuide: "Read my full guide",
      copied: "Link copied!",
      verdicts: {
        love: ["Favourite", "One of my all-time favourites"],
        recommend: ["Recommended", "Worth the detour"],
        optional: ["If you have time", "Nice, but not essential"],
        wish: ["Not tried yet", "On my list for my next trip"],
      },
      info: { when: "When to go", price: "Price", duration: "Time needed", booking: "Booking", access: "Getting there" },
      plannerTitle: "Want a tailor-made itinerary?",
      plannerText: (c) => `I build your trip to ${c} around your interests, pace and budget.`,
      plannerBtn: "Discover HodoPlanner",
      close: "Close",
    },
  };

  const CATEGORIES = {
    food:     { icon: "fa-utensils",    fr: "Manger",       en: "Eat" },
    cafe:     { icon: "fa-mug-hot",     fr: "Café",         en: "Coffee" },
    see:      { icon: "fa-landmark",    fr: "À voir",       en: "Sights" },
    photo:    { icon: "fa-camera",      fr: "Spot photo",   en: "Photo spot" },
    activity: { icon: "fa-ticket",      fr: "Activité",     en: "Activity" },
    sleep:    { icon: "fa-bed",         fr: "Dormir",       en: "Stay" },
    hidden:   { icon: "fa-gem",         fr: "Pépite cachée", en: "Hidden gem" },
  };
  const INFO_ICONS = { when: "fa-clock", price: "fa-yen-sign", duration: "fa-hourglass-half", booking: "fa-calendar-check", access: "fa-train-subway" };
  const VERDICT_ICONS = { love: "fa-solid fa-heart", recommend: "fa-solid fa-thumbs-up", optional: "fa-solid fa-hand-point-right", wish: "fa-regular fa-bookmark" };

  // ---------- State ----------
  const state = {
    lang: pickLang(),
    category: "all",
    status: "all",
    query: "",
    country: null,
    places: [],
    activeId: null,
  };

  const $ = (sel) => document.querySelector(sel);
  const ui = () => UI[state.lang];

  function pickLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl === "fr" || fromUrl === "en") return fromUrl;
    try {
      const saved = localStorage.getItem("hodo-lang");
      if (saved === "fr" || saved === "en") return saved;
    } catch (_) {}
    return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  /** Bilingual value: a plain string, or { fr, en }. Falls back to the other language. */
  function tr(v) {
    if (v == null) return "";
    if (typeof v !== "object") return String(v);
    return v[state.lang] || v.fr || v.en || "";
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  // ---------- Filtering ----------
  function filteredPlaces() {
    const q = norm(state.query.trim());
    return state.places.filter((p) => {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (state.status === "visited" && !p.visited) return false;
      if (state.status === "wishlist" && p.visited) return false;
      if (q) {
        const hay = norm([p.name?.fr, p.name?.en, typeof p.name === "string" ? p.name : "", p.city, CATEGORIES[p.category]?.[state.lang]].join(" "));
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function toGeoJSON(places) {
    return {
      type: "FeatureCollection",
      features: places.map((p) => ({
        type: "Feature",
        id: p._idx,
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      })),
    };
  }

  // ---------- Map ----------
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const map = new mapboxgl.Map({
    container: "map",
    style: MAPBOX_STYLE,
    projection: "globe",
    center: [136, 35.2],
    zoom: 4.6,
    attributionControl: false,
  });
  map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
  map.on("style.load", () => map.setFog({}));

  const markers = new Map(); // key -> mapboxgl.Marker currently on screen

  function pinElement(p) {
    const cat = CATEGORIES[p.category] || CATEGORIES.see;
    const el = document.createElement("button");
    el.type = "button";
    el.className = "pin" + (p.visited ? "" : " wish") + (p.visited && p.verdict === "love" ? " love" : "");
    el.style.setProperty("--cat", `var(--c-${p.category})`);
    el.setAttribute("aria-label", tr(p.name));
    el.innerHTML = `<span class="pin-in"><svg viewBox="0 0 34 44" aria-hidden="true"><path d="M17 1.5C8.4 1.5 1.5 8.3 1.5 16.8c0 10.9 13.4 24.6 14.6 25.8a1.3 1.3 0 0 0 1.8 0c1.2-1.2 14.6-14.9 14.6-25.8C32.5 8.3 25.6 1.5 17 1.5z"/></svg><i class="fa-solid ${cat.icon}"></i></span>`;
    el.addEventListener("click", (e) => { e.stopPropagation(); openPlace(p.id); });
    return el;
  }

  function clusterElement(count, clusterId, coords) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "cluster";
    el.textContent = count;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      map.getSource("places").getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (!err) map.easeTo({ center: coords, zoom: zoom + 0.3 });
      });
    });
    return el;
  }

  /** Keep HTML markers in sync with the clustered source (Mapbox "HTML clusters" pattern). */
  function syncMarkers() {
    if (!map.getSource("places") || !map.isSourceLoaded("places")) return;
    const seen = new Set();
    for (const f of map.querySourceFeatures("places")) {
      const coords = f.geometry.coordinates;
      const props = f.properties;
      const key = props.cluster ? `c${props.cluster_id}` : `p${props.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!markers.has(key)) {
        let el;
        if (props.cluster) {
          el = clusterElement(props.point_count, props.cluster_id, coords);
        } else {
          const place = state.places.find((x) => x.id === props.id);
          if (!place) continue;
          el = pinElement(place);
          if (place.id === state.activeId) el.classList.add("active");
        }
        const anchor = props.cluster ? "center" : "bottom";
        markers.set(key, new mapboxgl.Marker({ element: el, anchor }).setLngLat(coords).addTo(map));
      }
    }
    for (const [key, m] of markers) {
      if (!seen.has(key)) { m.remove(); markers.delete(key); }
    }
  }

  function clearMarkers() {
    for (const m of markers.values()) m.remove();
    markers.clear();
  }

  function refreshMap() {
    const src = map.getSource("places");
    if (!src) return;
    clearMarkers();
    src.setData(toGeoJSON(filteredPlaces()));
  }

  function setupSource() {
    if (map.getSource("places")) return;
    map.addSource("places", {
      type: "geojson",
      data: toGeoJSON(filteredPlaces()),
      cluster: true,
      clusterRadius: 44,
      clusterMaxZoom: 11,
    });
    // Invisible layer: makes the source load so querySourceFeatures() works.
    map.addLayer({ id: "places-anchor", type: "circle", source: "places", paint: { "circle-radius": 1, "circle-opacity": 0 } });
    map.on("render", syncMarkers);
  }

  // ---------- Rendering: chrome ----------
  function renderChrome() {
    const t = ui();
    document.documentElement.lang = state.lang;
    document.title = `HodoGuides · ${tr(state.country?.name) || "Japan"}`;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t[el.dataset.i18nPlaceholder]; });
    document.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.lang === state.lang));
    document.querySelectorAll("#statusSeg button").forEach((b) => b.classList.toggle("on", b.dataset.status === state.status));
    document.querySelectorAll("[data-close]").forEach((b) => b.setAttribute("aria-label", t.close));

    const counts = {};
    for (const p of state.places) counts[p.category] = (counts[p.category] || 0) + 1;
    const chips = [`<button type="button" class="chip${state.category === "all" ? " on" : ""}" data-cat="all">${esc(t.all)}</button>`];
    for (const [id, c] of Object.entries(CATEGORIES)) {
      if (!counts[id]) continue;
      chips.push(`<button type="button" class="chip${state.category === id ? " on" : ""}" data-cat="${id}" style="--cat:var(--c-${id})"><i class="fa-solid ${c.icon}"></i>${esc(c[state.lang])}</button>`);
    }
    $("#categoryChips").innerHTML = chips.join("");

    const n = filteredPlaces().length;
    $("#listBtnLabel").textContent = t.list(n);
    renderList();
  }

  function renderList() {
    const t = ui();
    const list = filteredPlaces();
    $("#listTitle").textContent = t.listTitle(list.length);
    if (!list.length) {
      $("#placeList").innerHTML = `<li class="pl-empty">${esc(t.noResult)}</li>`;
      return;
    }
    $("#placeList").innerHTML = list.map((p) => {
      const c = CATEGORIES[p.category] || CATEGORIES.see;
      const verdict = p.visited ? t.verdicts[p.verdict]?.[0] : t.verdicts.wish[0];
      return `<li><button type="button" data-place="${esc(p.id)}">
        <span class="pl-icon${p.visited ? "" : " wish"}" style="--cat:var(--c-${p.category})"><i class="fa-solid ${c.icon}"></i></span>
        <span><span class="pl-name">${esc(tr(p.name))}</span>
        <span class="pl-meta" style="display:block">${esc(p.city || "")}${verdict ? " · " + esc(verdict) : ""}</span></span>
      </button></li>`;
    }).join("");
  }

  // ---------- Rendering: place sheet ----------
  function renderPlace(p) {
    const t = ui();
    const c = CATEGORIES[p.category] || CATEGORIES.see;
    const vKey = p.visited ? (p.verdict || "recommend") : "wish";
    const [vTitle, vSub] = t.verdicts[vKey];
    const countryName = tr(state.country?.name);

    const info = Object.entries(p.info || {})
      .filter(([, v]) => tr(v))
      .map(([k, v]) => `<li><i class="fa-solid ${INFO_ICONS[k] || "fa-circle-info"}"></i><div><small>${esc(t.info[k] || k)}</small>${esc(tr(v))}</div></li>`)
      .join("");
    const tips = (p.tips || []).map((x) => `<li>${esc(tr(x))}</li>`).join("");

    const directions = p.google_maps || `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
    const planner = `${PLANNER_URL}?destination=${encodeURIComponent(state.country?.id || "")}&place=${encodeURIComponent(p.id)}&lang=${state.lang}`;
    const photo = p.photo ? `<img src="../images/places/${esc(state.country.id)}/${esc(p.photo)}" alt="${esc(tr(p.name))}" onerror="this.remove()">` : "";

    $("#sheetBody").innerHTML = `
      <figure class="hero" style="--cat:var(--c-${p.category})">
        <i class="fa-solid ${c.icon}"></i>${photo}
        <button type="button" class="icon-btn" data-close="placeSheet" aria-label="${esc(t.close)}"><i class="fa-solid fa-xmark"></i></button>
      </figure>
      <div class="sheet-body" style="--cat:var(--c-${p.category})">
        <div class="sheet-title">
          <h2>${esc(tr(p.name))}</h2>
          <div class="sheet-meta">
            <span class="tag"><i class="fa-solid ${c.icon}"></i>${esc(c[state.lang])}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${esc(p.city || "")}${countryName ? ", " + esc(countryName) : ""}</span>
          </div>
        </div>

        <div class="verdict ${vKey === "wish" ? "wish" : vKey}">
          <i class="${VERDICT_ICONS[vKey]}"></i>
          <div><b>${esc(vTitle)}</b><span>${esc(vSub)}</span></div>
        </div>

        ${tr(p.review) ? `<div class="block"><h3>${esc(t.myReview)}</h3><p class="quote">${esc(tr(p.review))}</p></div>` : ""}
        ${tr(p.experience) ? `<div class="block"><h3>${esc(t.myExperience)}</h3><p>${esc(tr(p.experience))}</p></div>` : ""}
        ${info ? `<div class="block"><h3>${esc(t.practical)}</h3><ul class="info">${info}</ul></div>` : ""}
        ${tips ? `<div class="block"><h3>${esc(t.tips)}</h3><ul class="tips">${tips}</ul></div>` : ""}

        <div class="actions">
          <a class="btn primary" href="${esc(directions)}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i>${esc(t.go)}</a>
          <button type="button" class="btn" id="shareBtn"><i class="fa-solid fa-arrow-up-from-bracket"></i>${esc(t.share)}</button>
          ${p.guide ? `<a class="btn full" href="${esc(p.guide)}"><i class="fa-solid fa-book-open"></i>${esc(t.readGuide)}</a>` : ""}
        </div>

        <div class="planner">
          <b>${esc(t.plannerTitle)}</b>
          <p>${esc(t.plannerText(countryName))}</p>
          <a class="btn" href="${esc(planner)}" target="_blank" rel="noopener"><i class="fa-solid fa-route"></i>${esc(t.plannerBtn)}</a>
        </div>
      </div>`;

    $("#shareBtn").addEventListener("click", () => sharePlace(p));
  }

  async function sharePlace(p) {
    const url = location.href.split("#")[0].split("?")[0] + `?lang=${state.lang}#${p.id}`;
    try {
      if (navigator.share) { await navigator.share({ title: tr(p.name), text: tr(p.review), url }); return; }
      await navigator.clipboard.writeText(url);
      toast(ui().copied);
    } catch (_) {}
  }

  function toast(msg) {
    let el = $(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 1800);
  }

  // ---------- Panels ----------
  function openPanel(id) {
    document.querySelectorAll(".panel.open").forEach((p) => { if (p.id !== id) closePanel(p.id, true); });
    const el = document.getElementById(id);
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    el.scrollTop = 0;
  }

  function closePanel(id, silent) {
    const el = document.getElementById(id);
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
    if (id === "placeSheet" && !silent) {
      setActive(null);
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function setActive(id) {
    state.activeId = id;
    for (const [key, m] of markers) m.getElement().classList.toggle("active", key === `p${id}`);
  }

  function openPlace(id, { fly = true } = {}) {
    const p = state.places.find((x) => x.id === id);
    if (!p) return;
    renderPlace(p);
    openPanel("placeSheet");
    setActive(id);
    history.replaceState(null, "", `${location.pathname}${location.search}#${id}`);
    if (fly) {
      const desktop = matchMedia("(min-width:900px)").matches;
      map.flyTo({
        center: [p.lng, p.lat],
        zoom: Math.max(map.getZoom(), 12),
        offset: desktop ? [-215, 0] : [0, -Math.round(innerHeight * 0.25)],
        duration: 900,
      });
    }
  }

  // ---------- Events ----------
  function bindEvents() {
    document.querySelector(".lang").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (!b) return;
      state.lang = b.dataset.lang;
      try { localStorage.setItem("hodo-lang", state.lang); } catch (_) {}
      renderChrome();
      if (state.activeId && $("#placeSheet").classList.contains("open")) {
        renderPlace(state.places.find((x) => x.id === state.activeId));
      }
    });

    $("#categoryChips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.category = b.dataset.cat;
      renderChrome();
      refreshMap();
    });

    $("#statusSeg").addEventListener("click", (e) => {
      const b = e.target.closest("[data-status]");
      if (!b) return;
      state.status = b.dataset.status;
      renderChrome();
      refreshMap();
    });

    $("#search").addEventListener("input", (e) => {
      state.query = e.target.value;
      renderChrome();
      refreshMap();
    });
    $("#search").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.target.blur(); openPanel("listPanel"); }
    });

    $("#listBtn").addEventListener("click", () => openPanel("listPanel"));
    $("#placeList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-place]");
      if (b) openPlace(b.dataset.place);
    });

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-close]");
      if (b) closePanel(b.dataset.close);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") document.querySelectorAll(".panel.open").forEach((p) => closePanel(p.id));
    });
    window.addEventListener("hashchange", () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && id !== state.activeId) openPlace(id);
    });
  }

  // ---------- Boot ----------
  async function loadData() {
    const res = await fetch(DATA_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = jsyaml.load(await res.text());
    state.country = data.country;
    state.places = (data.places || [])
      .filter((p) => p && p.id && Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p, i) => ({ ...p, _idx: i, category: CATEGORIES[p.category] ? p.category : "see" }));
  }

  bindEvents();
  renderChrome();

  const dataReady = loadData().catch((err) => {
    console.error("Impossible de charger les lieux / Could not load places:", err);
  });

  map.on("load", async () => {
    await dataReady;
    renderChrome();
    setupSource();
    const initial = decodeURIComponent(location.hash.slice(1));
    if (initial && state.places.some((p) => p.id === initial)) {
      openPlace(initial);
    } else if (state.country?.center) {
      const v = state.country;
      map.jumpTo({ center: [v.center.lng, v.center.lat], zoom: v.zoom || 5 });
    } else if (state.places.length) {
      const b = new mapboxgl.LngLatBounds();
      state.places.forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: { top: 200, bottom: 120, left: 40, right: 40 }, maxZoom: 9, duration: 0 });
    }
  });
})();
