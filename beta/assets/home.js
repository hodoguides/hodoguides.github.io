/* HodoGuides bêta · home page: destinations from data/countries.yaml */
(() => {
  "use strict";
  const { esc, tr, t } = Hodo;
  const SHADOWS = ["var(--blue)", "var(--mint)", "var(--yellow)", "var(--lav)", "var(--pink)"];
  let countries = [];

  function fillIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = HodoIcons.icon(el.dataset.icon, +el.dataset.size || 44);
    });
  }

  function countryUrl(c) { return `/beta/pays/?c=${encodeURIComponent(c.id)}`; }

  function stats(c) {
    const places = c._places || [];
    return {
      places: places.length,
      loves: places.filter((p) => p.visited && p.verdict === "love").length,
      guides: places.filter((p) => p.guide).length,
      icons: [...new Set(places.map((p) => p.icon).filter(Boolean))].slice(0, 6),
    };
  }

  function render() {
    const ready = countries.filter((c) => c._places?.length);
    const soon = countries.filter((c) => !c._places?.length);

    document.getElementById("heroCta").innerHTML = ready[0]
      ? `<a class="btn dark" href="${countryUrl(ready[0])}">${esc(t("Explorer", "Explore"))} : ${esc(tr(ready[0].name))} →</a>` : "";

    document.getElementById("ready").innerHTML = ready.map((c, i) => {
      const s = stats(c);
      return `<a class="card dest" style="--sh:${SHADOWS[i % SHADOWS.length]}" href="${countryUrl(c)}">
        <div class="dest-img">${(c._meta?.photo || c.cover) ? `<img src="/${esc(c._meta?.photo || c.cover)}" alt="" loading="lazy">` : ""}
          <span class="pill strong">✓ ${esc(t("Prêt à explorer", "Ready to explore"))}</span></div>
        <div class="dest-body">
          <h3>${esc(tr(c.name))} ${c._meta?.name_ja ? `<span class="jp">${esc(c._meta.name_ja)}</span>` : ""}</h3>
          ${c._meta?.intro ? `<p>${esc(tr(c._meta.intro))}</p>` : ""}
          <div class="icons-row">${s.icons.map((n) => `<span class="icon-tile">${HodoIcons.icon(n, 32)}</span>`).join("")}</div>
          <div class="pills">
            <span class="pill strong">📍 ${s.places} ${esc(t(s.places > 1 ? "lieux" : "lieu", s.places > 1 ? "places" : "place"))}</span>
            ${s.loves ? `<span class="pill" style="--bg:var(--pink-soft)">♥ ${s.loves} ${esc(t(s.loves > 1 ? "coups de cœur" : "coup de cœur", s.loves > 1 ? "favourites" : "favourite"))}</span>` : ""}
            ${s.guides ? `<span class="pill" style="--bg:var(--yellow-soft)">📖 ${s.guides} ${esc(t(s.guides > 1 ? "guides" : "guide", s.guides > 1 ? "guides" : "guide"))}</span>` : ""}
          </div>
        </div></a>`;
    }).join("");

    // Countries with a cover photo first, the rest after
    const sorted = [...soon].sort((a, b) => (b.cover ? 1 : 0) - (a.cover ? 1 : 0));
    document.getElementById("soonCount").textContent = t(`${soon.length} pays en préparation`, `${soon.length} countries in the works`);
    document.getElementById("soon").innerHTML = sorted.map((c, i) => `
      <div class="card mini" style="--sh:${SHADOWS[(i + 1) % SHADOWS.length]}">
        ${c.cover ? `<img src="/${esc(c.cover)}" alt="" loading="lazy">` : `<span class="noimg">${HodoIcons.icon("bunny", 48)}</span>`}
        <div class="mini-body"><b>${esc(tr(c.name))}</b><small>${esc(tr(c.region))} · ${esc(t("guide en préparation", "guide in the works"))}</small></div>
      </div>`).join("");

    // A missing cover photo shows the mascot instead of a broken image
    document.querySelectorAll("#soon img").forEach((img) => img.addEventListener("error", () => {
      const ph = document.createElement("span");
      ph.className = "noimg";
      ph.innerHTML = HodoIcons.icon("bunny", 48);
      img.replaceWith(ph);
    }, { once: true }));
  }

  async function load() {
    const { countries: list = [] } = await Hodo.yaml("/data/countries.yaml");
    countries = list.filter((c) => c && c.id);
    await Promise.all(countries.filter((c) => c.places).map(async (c) => {
      try {
        const data = await Hodo.yaml(`/data/${c.places}`);
        c._meta = data.country || {};
        c._places = (data.places || []).filter((p) => p && p.id);
      } catch (err) { console.error(err); }
    }));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    fillIcons();
    try { await load(); } catch (err) { console.error("Could not load destinations:", err); }
    Hodo.onLang(render);
  });
})();
