/* HodoGuides · icônes kawaii (64x64, contour marine, couleurs pastel) */
(() => {
const INK = "#3b3a5e";
const C = { red:"#ec5866", pink:"#f6a9b9", blue:"#a9cdf2", sky:"#d9ecfb", mint:"#8fd6b1", green:"#5fbf8c", yellow:"#ffd98a",
  lav:"#c9b9f2", brown:"#c99a6e", tan:"#e9c9a0", cream:"#fff6e3", grey:"#b9bfd3", teal:"#7fd3d8", white:"#ffffff", dark:"#5a4b6e" };
const S = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;

/** Kawaii face centred on (x,y); s = scale. kind: "full" (eyes, smile, cheeks) or "eyes". */
function face(x, y, s = 1, kind = "full") {
  const eyes = `<circle cx="${-5}" cy="0" r="1.9" fill="${INK}"/><circle cx="5" cy="0" r="1.9" fill="${INK}"/>`;
  const rest = `<path d="M-2.2 2.6 Q0 4.6 2.2 2.6" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="-8.6" cy="3.2" rx="2.4" ry="1.5" fill="${C.pink}" opacity=".9"/><ellipse cx="8.6" cy="3.2" rx="2.4" ry="1.5" fill="${C.pink}" opacity=".9"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${eyes}${kind === "full" ? rest : ""}</g>`;
}

const ICONS = {
  torii: (f) => `
    <rect x="15" y="51" width="10" height="5" rx="1" fill="${C.dark}" ${S}/><rect x="39" y="51" width="10" height="5" rx="1" fill="${C.dark}" ${S}/>
    <rect x="17" y="20" width="6" height="32" fill="${C.red}" ${S}/><rect x="41" y="20" width="6" height="32" fill="${C.red}" ${S}/>
    <rect x="11" y="27" width="42" height="5" rx="1" fill="${C.red}" ${S}/>
    <path d="M5 15 Q32 9 59 15 L57 21 Q32 16 7 21 Z" fill="${C.red}" ${S}/>
    ${f ? `<rect x="22" y="18" width="20" height="16" rx="3" fill="${C.cream}" ${S}/>${face(32, 25.5, .78)}` : `<rect x="28" y="19" width="8" height="9" rx="1.5" fill="${C.cream}" ${S}/>`}`,
  deer: (f) => `
    <path d="M22 17 L18 6 M20 12 L13 10 M42 17 L46 6 M44 12 L51 10" fill="none" ${S}/>
    <ellipse cx="13" cy="27" rx="8" ry="4.2" transform="rotate(-25 13 27)" fill="${C.brown}" ${S}/>
    <ellipse cx="51" cy="27" rx="8" ry="4.2" transform="rotate(25 51 27)" fill="${C.brown}" ${S}/>
    <ellipse cx="32" cy="35" rx="15" ry="16" fill="${C.tan}" ${S}/>
    <circle cx="24" cy="25" r="1.6" fill="#fff"/><circle cx="40" cy="26" r="1.6" fill="#fff"/><circle cx="29" cy="21" r="1.3" fill="#fff"/>
    <ellipse cx="32" cy="44" rx="8.5" ry="6" fill="${C.cream}" ${S}/><ellipse cx="32" cy="41.5" rx="2.8" ry="1.9" fill="${INK}"/>
    ${face(32, 34, .95, f ? "full" : "eyes")}`,
  bamboo: (f) => `
    <path d="M6 58 H58" fill="none" ${S}/>
    <rect x="13" y="12" width="8" height="46" rx="3" fill="${C.mint}" ${S}/><rect x="27" y="5" width="10" height="53" rx="3" fill="${C.mint}" ${S}/><rect x="43" y="15" width="8" height="43" rx="3" fill="${C.mint}" ${S}/>
    <path d="M13 26 H21 M13 42 H21 M27 20 H37 M27 46 H37 M43 30 H51 M43 46 H51" fill="none" ${S}/>
    <path d="M21 26 Q27 22 26 17 Q21 20 21 26 Z M43 30 Q37 27 38 21 Q43 24 43 30 Z M37 20 Q44 16 46 10 Q39 12 37 20 Z" fill="${C.green}" ${S}/>
    ${f ? face(32, 33, .72) : ""}`,
  funaya: (f) => `
    <rect x="4" y="44" width="56" height="15" rx="4" fill="${C.blue}" ${S}/>
    <path d="M10 52 q4 -3 8 0 t8 0 M36 52 q4 -3 8 0 t8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <rect x="12" y="24" width="40" height="22" fill="${C.tan}" ${S}/>
    <path d="M7 26 L32 11 L57 26 Z" fill="#7a88b8" ${S}/>
    <path d="M20 46 V36 H44 V46" fill="${C.dark}" ${S}/>
    ${f ? face(32, 30.5, .75) : `<path d="M24 30 H40" fill="none" ${S}/>`}`,
  lantern: (f) => `
    <rect x="21" y="51" width="22" height="6" rx="1.5" fill="${C.grey}" ${S}/><rect x="28" y="39" width="8" height="12" fill="${C.grey}" ${S}/>
    <rect x="19" y="24" width="26" height="15" rx="2" fill="${C.yellow}" ${S}/>
    <path d="M12 25 L32 13 L52 25 Z" fill="${C.grey}" ${S}/><circle cx="32" cy="10" r="3" fill="${C.grey}" ${S}/>
    <path d="M14 25 q4 3 8 0" fill="${C.green}" stroke="none"/><path d="M42 57 q3 -3 6 0" fill="${C.green}" stroke="none"/>
    ${f ? face(32, 31.5, .7) : `<path d="M27 28 V35 M37 28 V35" fill="none" ${S}/>`}`,
  takoyaki: (f) => `
    <path d="M5 40 H59 L52 53 H12 Z" fill="${C.tan}" ${S}/>
    <circle cx="19" cy="36" r="8" fill="#d9a35b" ${S}/><circle cx="45" cy="36" r="8" fill="#d9a35b" ${S}/><circle cx="32" cy="33" r="9.5" fill="#d9a35b" ${S}/>
    <path d="M14 33 q5 -4 10 0 M40 33 q5 -4 10 0 M25 28 q7 -5 14 0" fill="none" stroke="#7a3e1d" stroke-width="3" stroke-linecap="round"/>
    <path d="M27 26 q2 2 4 0 t4 0" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 22 L58 12" fill="none" ${S}/>
    ${f ? face(32, 36, .62) : ""}`,
  cup: (f) => `
    <ellipse cx="31" cy="53" rx="23" ry="5" fill="#fff" ${S}/>
    <path d="M46 30 Q57 30 55 39 Q53 45 45 43" fill="none" ${S}/>
    <path d="M13 26 H48 V39 Q48 51 30.5 51 Q13 51 13 39 Z" fill="#fff" ${S}/>
    <ellipse cx="30.5" cy="26" rx="17.5" ry="4" fill="${C.brown}" ${S}/>
    <path d="M25 16 q-3 -4 0 -8 M33 17 q-3 -4 0 -8" fill="none" stroke="${C.grey}" stroke-width="2.4" stroke-linecap="round"/>
    ${f ? face(30.5, 38, .7) : `<path d="M24 37 q6.5 5 13 0" fill="none" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/>`}`,
  wheel: (f) => `
    <path d="M18 59 L32 30 L46 59" fill="none" ${S}/><path d="M14 59 H50" fill="none" ${S}/>
    <circle cx="32" cy="27" r="20" fill="${C.sky}" ${S}/>
    <path d="M32 7 V47 M12 27 H52 M18 13 L46 41 M46 13 L18 41" fill="none" stroke="${INK}" stroke-width="1.8"/>
    ${[[32,7,C.pink],[52,27,C.yellow],[32,47,C.mint],[12,27,C.lav],[46,13,C.blue],[46,41,C.pink],[18,41,C.yellow],[18,13,C.mint]].map(([x,y,c]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${c}" ${S}/>`).join("")}
    <circle cx="32" cy="27" r="${f ? 10 : 4.5}" fill="${C.yellow}" ${S}/>${f ? face(32, 27, .62) : ""}`,
  acorn: (f) => `
    <path d="M33 9 Q35 5 39 5" fill="none" ${S}/>
    <ellipse cx="32" cy="38" rx="15" ry="17" fill="${C.tan}" ${S}/>
    <path d="M14 26 Q14 10 32 10 Q50 10 50 26 Q41 30 32 29 Q23 30 14 26 Z" fill="#9a6b45" ${S}/>
    <path d="M20 16 L26 26 M28 12 L34 28 M37 12 L41 27 M45 17 L46 24" fill="none" stroke="#7a5233" stroke-width="1.6"/>
    <path d="M44 10 Q52 4 58 9 Q52 15 44 10 Z" fill="${C.green}" ${S}/>
    ${f ? face(32, 41, .8) : ""}`,
  pagoda: (f) => `
    <path d="M32 3 V10" fill="none" ${S}/><circle cx="32" cy="4" r="2" fill="${C.yellow}" ${S}/>
    <rect x="25" y="14" width="14" height="8" fill="${C.cream}" ${S}/><path d="M17 15 L32 9 L47 15 Z" fill="#7a88b8" ${S}/>
    <rect x="21" y="26" width="22" height="9" fill="${C.cream}" ${S}/><path d="M12 27 L32 19 L52 27 Z" fill="#7a88b8" ${S}/>
    <rect x="17" y="40" width="30" height="17" fill="${C.red}" ${S}/><path d="M7 41 L32 31 L57 41 Z" fill="#7a88b8" ${S}/>
    <path d="M10 57 H54" fill="none" ${S}/>
    ${f ? `<rect x="21" y="42" width="22" height="13" rx="2.5" fill="${C.cream}" ${S}/>${face(32, 48, .68)}` : `<rect x="28" y="46" width="8" height="11" fill="${C.dark}" ${S}/>`}`,
  boat: (f) => `
    <path d="M44 34 Q50 26 58 34 Z M4 34 Q8 28 14 34 Z" fill="${C.green}" ${S}/>
    <rect x="3" y="34" width="58" height="23" rx="4" fill="${C.teal}" ${S}/>
    <path d="M8 50 q4 -3 8 0 t8 0 M40 52 q4 -3 8 0 t8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <rect x="24" y="22" width="16" height="10" rx="2" fill="${C.sky}" ${S}/>
    <path d="M12 32 H52 L46 44 H18 Z" fill="#fff" ${S}/>
    ${f ? face(32, 37.5, .72) : `<path d="M22 38 H42" fill="none" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/>`}`,
  dango: (f) => `
    <path d="M32 4 V60" fill="none" stroke="#9a6b45" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="32" cy="17" r="9" fill="${C.pink}" ${S}/><circle cx="32" cy="33" r="9" fill="#fff" ${S}/><circle cx="32" cy="49" r="9" fill="${C.mint}" ${S}/>
    ${f ? face(32, 17.5, .5) + face(32, 33.5, .5) + face(32, 49.5, .5) : ""}`,
  ramen: (f) => `
    <path d="M40 4 L30 30 M48 6 L36 30" fill="none" ${S}/>
    <path d="M7 31 H57 Q55 52 32 54 Q9 52 7 31 Z" fill="${C.blue}" ${S}/>
    <ellipse cx="32" cy="31" rx="25" ry="5.5" fill="#f3d9a0" ${S}/>
    <circle cx="20" cy="30" r="4" fill="#fff" ${S}/><path d="M18 30 a2 2 0 1 1 3 1" fill="none" stroke="${C.pink}" stroke-width="1.6"/>
    <path d="M28 31 q3 -3 6 0 t6 0" fill="none" stroke="#e0b860" stroke-width="2"/>
    ${f ? face(32, 42, .75) : `<path d="M14 42 H50" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`}`,
  camera: (f) => `
    <rect x="19" y="13" width="14" height="9" rx="2" fill="${C.lav}" ${S}/>
    <rect x="7" y="19" width="50" height="34" rx="7" fill="${C.lav}" ${S}/>
    <circle cx="47" cy="27" r="2.6" fill="${C.yellow}" ${S}/>
    <circle cx="32" cy="36" r="11" fill="#fff" ${S}/>
    ${f ? face(32, 36.5, .72) : `<circle cx="32" cy="36" r="5.5" fill="${C.blue}" ${S}/>`}`,
  ticket: (f) => `
    <g transform="rotate(-10 32 32)">
      <path d="M6 20 H58 V28 A4 4 0 0 0 58 36 V44 H6 V36 A4 4 0 0 0 6 28 Z" fill="${C.yellow}" ${S}/>
      <path d="M44 22 V42" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M51 28 l1.6 3.2 3.4 .5 -2.5 2.4 .6 3.4 -3.1 -1.6 -3.1 1.6 .6 -3.4 -2.5 -2.4 3.4 -.5 Z" fill="${C.red}" stroke="none"/>
      ${f ? face(25, 32, .7) : `<path d="M14 29 H34 M14 35 H28" fill="none" ${S}/>`}
    </g>`,
  gem: (f) => `
    <path d="M18 12 H46 L57 26 L32 56 L7 26 Z" fill="${C.teal}" ${S}/>
    <path d="M7 26 H57 M18 12 L25 26 L32 56 L39 26 L46 12 M25 26 L32 12 L39 26" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    ${f ? face(32, 32, .8) : ""}`,
  wall: (f) => `
    <path d="M2 57 Q14 46 28 52 Q44 42 62 48 V61 H2 Z" fill="${C.mint}" ${S}/>
    <path d="M4 50 L34 41 L60 36 V44 L34 49 L4 58 Z" fill="${C.tan}" ${S}/>
    <path d="M8 47 v-4 h4 v3 M17 44 v-4 h4 v3 M26 42 v-4 h4 v3" fill="none" ${S}/>
    <rect x="38" y="20" width="16" height="21" fill="${C.tan}" ${S}/>
    <path d="M38 20 v-5 h4 v5 M44 20 v-5 h4 v5 M50 20 v-5 h4 v5" fill="none" ${S}/>
    <path d="M43 41 V34 a3 3 0 0 1 6 0 V41" fill="${C.dark}" ${S}/>
    ${f ? face(46, 27, .55) : `<rect x="43.5" y="24" width="5" height="4" rx="1" fill="${C.dark}" stroke="none"/>`}`,
  panda: (f) => `
    <circle cx="16" cy="17" r="8" fill="${C.dark}" ${S}/><circle cx="48" cy="17" r="8" fill="${C.dark}" ${S}/>
    <ellipse cx="32" cy="35" rx="24" ry="21" fill="#fff" ${S}/>
    <ellipse cx="22" cy="33" rx="6" ry="8" transform="rotate(25 22 33)" fill="${C.dark}"/><ellipse cx="42" cy="33" rx="6" ry="8" transform="rotate(-25 42 33)" fill="${C.dark}"/>
    <circle cx="23" cy="32" r="2.2" fill="#fff"/><circle cx="41" cy="32" r="2.2" fill="#fff"/>
    <ellipse cx="32" cy="42" rx="3.4" ry="2.4" fill="${INK}"/>
    ${f ? `<path d="M28 46 Q32 49 36 46" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>` : ""}`,
  bunny: () => `
    <ellipse cx="24" cy="18" rx="5.5" ry="13" transform="rotate(-8 24 18)" fill="#fff" ${S}/><ellipse cx="24" cy="19" rx="2.2" ry="8" transform="rotate(-8 24 19)" fill="${C.pink}"/>
    <ellipse cx="40" cy="18" rx="5.5" ry="13" transform="rotate(8 40 18)" fill="#fff" ${S}/><ellipse cx="40" cy="19" rx="2.2" ry="8" transform="rotate(8 40 19)" fill="${C.pink}"/>
    <path d="M44 8 Q52 2 58 7 Q52 13 44 8 Z" fill="${C.green}" ${S}/>
    <ellipse cx="32" cy="43" rx="24" ry="15" fill="#fff" ${S}/>
    ${face(32, 42, 1)}`,
};

// Style rule: only food, drinks and the mascot get a smiling face; places and
// practical icons stay plain (animals keep their eyes).
const WITH_FACE = new Set(["dango", "cup", "takoyaki", "ramen", "bunny"]);

// Default drawing for each place category, used when a place has no "icon".
const CATEGORY_ICON = { food: "ramen", cafe: "cup", see: "torii", photo: "camera", activity: "ticket", sleep: "pagoda", hidden: "gem" };

function icon(name, size = 56) {
  const draw = ICONS[name] || ICONS.torii;
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${draw(WITH_FACE.has(name))}</svg>`;
}

window.HodoIcons = { icon, has: (n) => n in ICONS, CATEGORY_ICON, names: Object.keys(ICONS) };
})();
