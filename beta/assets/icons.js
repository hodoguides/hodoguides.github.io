/* HodoGuides · icônes kawaii (64x64, style « autocollant » du lapin : contour marine autour de la forme, traits fins dedans, pastels) */
(() => {
const INK = "#3b3a5e";
const C = { red:"#ec5866", pink:"#f6a9b9", blue:"#a9cdf2", sky:"#d9ecfb", mint:"#8fd6b1", green:"#5fbf8c", yellow:"#ffd98a",
  lav:"#c9b9f2", brown:"#c99a6e", tan:"#e9c9a0", cream:"#fff6e3", grey:"#b9bfd3", teal:"#7fd3d8", white:"#ffffff", dark:"#5a4b6e" };
const S = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;

/** The bunny's face centred on (x,y): oval eyes, a little "ω" mouth and pink cheeks; s = scale.
 * kind: "full" (eyes, mouth, cheeks) or "eyes" (animals other than the mascot). */
function face(x, y, s = 1, kind = "full") {
  const eyes = `<ellipse cx="-6" cy="0" rx="1.5" ry="1.9" fill="${INK}"/><ellipse cx="6" cy="0" rx="1.5" ry="1.9" fill="${INK}"/>`;
  const rest = `<path d="M-3.2 2.1 q1.6 2.1 3.2 0 q1.6 2.1 3.2 0" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="-10" cy="3" rx="2.8" ry="1.9" fill="#f8b8bf"/><ellipse cx="10" cy="3" rx="2.8" ry="1.9" fill="#f8b8bf"/>`;
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
  // ----- place themes (no face: places stay plain) -----
  castle: () => `
    <path d="M8 58 L14 45 H50 L56 58 Z" fill="${C.grey}" ${S}/>
    <path d="M18 51 h6 M30 51 h6 M42 51 h4" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="18" y="34" width="28" height="11" fill="#fff" ${S}/>
    <rect x="23" y="20" width="18" height="10" fill="#fff" ${S}/>
    <path d="M14 23 L32 13 L50 23 Z" fill="#7a88b8" ${S}/><path d="M24 13 L32 7 L40 13 Z" fill="#7a88b8" ${S}/>
    <path d="M10 37 L32 27 L54 37 Z" fill="#7a88b8" ${S}/>
    <path d="M25 40 H29 M35 40 H39 M30 24 H34" fill="none" ${S}/>`,
  onsen: () => `
    <path d="M7 40 Q7 57 32 57 Q57 57 57 40 Z" fill="${C.teal}" ${S}/>
    <ellipse cx="32" cy="40" rx="25" ry="6" fill="${C.sky}" ${S}/>
    <path d="M20 32 q-4 -5 0 -10 q4 -5 0 -10 M32 32 q-4 -5 0 -10 q4 -5 0 -10 M44 32 q-4 -5 0 -10 q4 -5 0 -10" fill="none" stroke="${C.red}" stroke-width="3.2" stroke-linecap="round"/>`,
  waterfall: () => `
    <path d="M3 58 V18 Q10 10 21 14 V58 Z" fill="${C.green}" ${S}/>
    <path d="M61 58 V22 Q54 14 43 18 V58 Z" fill="${C.green}" ${S}/>
    <rect x="21" y="12" width="22" height="40" fill="${C.sky}" ${S}/>
    <path d="M27 17 V43 M32 15 V47 M37 17 V43" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M10 57 Q18 47 26 53 Q32 46 38 53 Q46 47 54 57 Z" fill="#fff" ${S}/>`,
  mountain: () => `
    <circle cx="51" cy="13" r="6" fill="${C.pink}" ${S}/>
    <path d="M2 56 L24 18 Q32 12 40 18 L62 56 Z" fill="${C.blue}" ${S}/>
    <path d="M24 18 Q32 12 40 18 L46 28 L41 26 L37 30 L32 25 L27 30 L23 26 L18 28 Z" fill="#fff" ${S}/>`,
  lake: () => `
    <path d="M5 36 L20 16 L30 28 L41 13 L59 36 Z" fill="${C.green}" ${S}/>
    <ellipse cx="32" cy="45" rx="28" ry="13" fill="${C.sky}" ${S}/>
    <path d="M13 44 q4 -3 8 0 t8 0 M34 49 q4 -3 8 0 t8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  beach: () => `
    <rect x="2" y="44" width="60" height="16" rx="4" fill="${C.teal}" ${S}/>
    <path d="M8 47 Q32 31 56 47 Z" fill="#f3d9a0" ${S}/>
    <path d="M12 55 q4 -3 8 0 t8 0 M38 55 q4 -3 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <path d="M31 41 Q29 27 34 15" fill="none" stroke="#9a6b45" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M34 15 Q24 8 15 14 Q25 14 34 15 Z M34 15 Q44 6 53 12 Q43 14 34 15 Z M34 15 Q30 5 21 5 Q29 10 34 15 Z M34 15 Q42 19 46 27 Q39 19 34 15 Z" fill="${C.green}" ${S}/>`,
  garden: () => `
    <path d="M8 58 H56" fill="none" ${S}/>
    <ellipse cx="15" cy="54" rx="7" ry="3.5" fill="${C.grey}" ${S}/>
    <path d="M33 58 V36 Q31 29 23 27 M33 40 Q38 33 44 32" fill="none" stroke="#9a6b45" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="21" cy="24" rx="12" ry="6" fill="${C.green}" ${S}/>
    <ellipse cx="38" cy="16" rx="13" ry="6.5" fill="${C.green}" ${S}/>
    <ellipse cx="46" cy="30" rx="10" ry="5" fill="${C.green}" ${S}/>`,
  temple: () => `
    <rect x="22" y="22" width="20" height="9" fill="${C.tan}" ${S}/>
    <path d="M14 24 Q32 10 50 24 Z" fill="#7a88b8" ${S}/>
    <rect x="12" y="35" width="40" height="19" fill="${C.tan}" ${S}/>
    <path d="M3 38 Q32 20 61 38 Q46 32 32 32 Q18 32 3 38 Z" fill="#7a88b8" ${S}/>
    <path d="M19 39 V54 M45 39 V54" fill="none" ${S}/>
    <rect x="27" y="41" width="10" height="13" fill="${C.red}" ${S}/>
    <path d="M7 58 H57" fill="none" ${S}/>`,
  shop: () => `
    <path d="M24 22 V16 a8 8 0 0 1 16 0 V22" fill="none" ${S}/>
    <path d="M11 22 H53 L49 58 H15 Z" fill="${C.pink}" ${S}/>
    <path d="M32 29 l3.5 7.1 7.8 1.1 -5.7 5.5 1.4 7.8 -7 -3.7 -7 3.7 1.4 -7.8 -5.7 -5.5 7.8 -1.1 Z" fill="${C.yellow}" ${S}/>`,
  museum: () => `
    <path d="M6 22 L32 8 L58 22 Z" fill="${C.lav}" ${S}/>
    <rect x="8" y="22" width="48" height="5" fill="#fff" ${S}/>
    ${[12, 23, 35, 46].map((x) => `<rect x="${x}" y="27" width="6" height="22" fill="#fff" ${S}/>`).join("")}
    <rect x="5" y="49" width="54" height="8" rx="1" fill="${C.grey}" ${S}/>`,
  house: () => `
    <rect x="12" y="45" width="40" height="13" fill="${C.cream}" ${S}/>
    <rect x="28" y="48" width="8" height="10" fill="${C.dark}" ${S}/>
    <path d="M32 5 L57 46 H7 Z" fill="${C.brown}" ${S}/>
    <path d="M23 30 H41 M17 39 H47" fill="none" stroke="#8a5f3c" stroke-width="2" stroke-linecap="round"/>
    <rect x="28" y="17" width="8" height="7" fill="${C.cream}" ${S}/>`,
  bridge: () => `
    <rect x="2" y="46" width="60" height="13" rx="3" fill="${C.sky}" ${S}/>
    <path d="M12 52 q4 -3 8 0 M40 53 q4 -3 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 40 V50 M52 40 V50" fill="none" ${S}/>
    <path d="M4 36 Q32 18 60 36 V42 Q32 26 4 42 Z" fill="${C.red}" ${S}/>
    <path d="M6 31 Q32 13 58 31" fill="none" ${S}/>
    <path d="M14 26 V33 M24 21 V28 M32 19 V26 M40 21 V28 M50 26 V33" fill="none" ${S}/>`,
  tower: () => `
    <path d="M32 4 L27 24 L19 58 H45 L37 24 Z" fill="${C.red}" ${S}/>
    <rect x="24" y="19" width="16" height="6" rx="1.5" fill="#fff" ${S}/>
    <rect x="20" y="37" width="24" height="6" rx="1.5" fill="#fff" ${S}/>
    <path d="M27 58 Q32 48 37 58 Z" fill="${C.cream}" ${S}/>`,
  cablecar: () => `
    <path d="M2 60 L16 45 L28 57 L42 43 L62 60 Z" fill="${C.green}" ${S}/>
    <path d="M2 10 L62 22" fill="none" ${S}/>
    <path d="M32 16 V26" fill="none" ${S}/>
    <rect x="18" y="26" width="28" height="23" rx="6" fill="${C.yellow}" ${S}/>
    <rect x="22" y="31" width="9" height="8" rx="2" fill="${C.sky}" ${S}/><rect x="33" y="31" width="9" height="8" rx="2" fill="${C.sky}" ${S}/>`,
  train: () => `
    <path d="M6 58 H58 M18 50 L14 58 M46 50 L50 58" fill="none" ${S}/>
    <path d="M10 50 V26 Q10 11 32 11 Q54 11 54 26 V50 Z" fill="#fff" ${S}/>
    <path d="M16 28 Q16 17 32 17 Q48 17 48 28 Z" fill="${C.sky}" ${S}/>
    <rect x="11.5" y="35" width="41" height="5" fill="${C.blue}"/>
    <circle cx="19" cy="45" r="2.8" fill="${C.yellow}" ${S}/><circle cx="45" cy="45" r="2.8" fill="${C.yellow}" ${S}/>`,
  flower: () => `
    ${[0, 72, 144, 216, 288].map((a) => { const r = (a - 90) * Math.PI / 180; return `<circle cx="${(32 + 12 * Math.cos(r)).toFixed(1)}" cy="${(30 + 12 * Math.sin(r)).toFixed(1)}" r="9.5" fill="${C.pink}" ${S}/>`; }).join("")}
    <circle cx="32" cy="30" r="6" fill="${C.yellow}" ${S}/>
    <path d="M32 46 V60 M32 54 Q24 50 20 53" fill="none" stroke="${C.green}" stroke-width="3" stroke-linecap="round"/>`,
  // ----- famous places: each one drawn the way it looks -----
  kinkakuji: () => `
    <ellipse cx="32" cy="55" rx="29" ry="6.5" fill="${C.sky}" ${S}/>
    <rect x="16" y="41" width="32" height="11" fill="${C.tan}" ${S}/>
    <path d="M10 43 L32 35 L54 43 Z" fill="#7a5233" ${S}/>
    <rect x="19" y="27" width="26" height="9" fill="#f2c94c" ${S}/>
    <path d="M13 29 L32 21 L51 29 Z" fill="#7a5233" ${S}/>
    <rect x="24" y="15" width="16" height="7" fill="#f2c94c" ${S}/>
    <path d="M18 17 L32 9 L46 17 Z" fill="#7a5233" ${S}/>
    <path d="M32 9 V5" fill="none" ${S}/><circle cx="32" cy="4" r="2" fill="#f2c94c" ${S}/>
    <path d="M22 46 V52 M42 46 V52" fill="none" ${S}/>`,
  senbon: () => `
    <path d="M4 62 L27 40 H37 L60 62 Z" fill="${C.tan}" stroke="none"/>
    <rect x="26" y="33" width="3" height="14" fill="${C.red}" ${S}/><rect x="35" y="33" width="3" height="14" fill="${C.red}" ${S}/>
    <path d="M23 30 Q32 28 41 30 L40 33 Q32 32 24 33 Z" fill="${C.red}" ${S}/>
    <rect x="19" y="26" width="4" height="27" fill="${C.red}" ${S}/><rect x="41" y="26" width="4" height="27" fill="${C.red}" ${S}/>
    <path d="M15 22 Q32 19 49 22 L48 26 Q32 24 16 26 Z" fill="${C.red}" ${S}/><rect x="17" y="29" width="30" height="3" fill="${C.red}" ${S}/>
    <rect x="10" y="18" width="6" height="43" fill="${C.red}" ${S}/><rect x="48" y="18" width="6" height="43" fill="${C.red}" ${S}/>
    <path d="M4 12 Q32 7 60 12 L58 18 Q32 14 6 18 Z" fill="${C.red}" ${S}/><rect x="8" y="23" width="48" height="4" fill="${C.red}" ${S}/>`,
  itsukushima: () => `
    <rect x="2" y="42" width="60" height="18" rx="4" fill="${C.blue}" ${S}/>
    <path d="M8 55 q4 -3 8 0 t8 0 M40 55 q4 -3 8 0 t8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <rect x="17" y="20" width="6" height="30" fill="${C.red}" ${S}/><rect x="41" y="20" width="6" height="30" fill="${C.red}" ${S}/>
    <rect x="13" y="25" width="38" height="5" rx="1" fill="${C.red}" ${S}/>
    <path d="M6 14 Q32 8 58 14 L56 20 Q32 15 8 20 Z" fill="${C.red}" ${S}/>`,
  chureito: () => `
    <path d="M24 54 L41 20 Q46 15 51 20 L64 42 V54 Z" fill="${C.blue}" ${S}/>
    <path d="M41 20 Q46 15 51 20 L55 27 L51 25 L47 28 L43 25 L38 27 Z" fill="#fff" ${S}/>
    <path d="M18 24 V15" fill="none" ${S}/>
    <rect x="14" y="27" width="8" height="6" fill="${C.red}" ${S}/><path d="M8 29 L18 23 L28 29 Z" fill="#7a88b8" ${S}/>
    <rect x="13" y="36" width="10" height="6" fill="${C.red}" ${S}/><path d="M6 38 L18 32 L30 38 Z" fill="#7a88b8" ${S}/>
    <rect x="11" y="46" width="14" height="10" fill="${C.red}" ${S}/><path d="M4 48 L18 41 L32 48 Z" fill="#7a88b8" ${S}/>
    <circle cx="36" cy="56" r="5" fill="${C.pink}" ${S}/><circle cx="44" cy="58" r="4" fill="${C.pink}" ${S}/><circle cx="4" cy="58" r="4" fill="${C.pink}" ${S}/>`,
  daibutsu: () => `
    <path d="M8 58 Q8 36 32 34 Q56 36 56 58 Z" fill="#8fb3a4" ${S}/>
    <ellipse cx="19.5" cy="27" rx="3.5" ry="7" fill="#8fb3a4" ${S}/><ellipse cx="44.5" cy="27" rx="3.5" ry="7" fill="#8fb3a4" ${S}/>
    <circle cx="32" cy="24" r="12" fill="#8fb3a4" ${S}/>
    <path d="M20 21 Q21 10 32 10 Q43 10 44 21 Q38 17 32 17 Q26 17 20 21 Z" fill="#6f9486" ${S}/><circle cx="32" cy="9" r="3.5" fill="#6f9486" ${S}/>
    <path d="M26 25 q2 1.6 4 0 M34 25 q2 1.6 4 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/><circle cx="32" cy="20.5" r="1.2" fill="${INK}"/>
    <ellipse cx="32" cy="50" rx="10" ry="5" fill="#a4c4b6" ${S}/>`,
  kiyomizu: () => `
    <path d="M2 61 Q20 41 40 47 Q52 51 62 44 V62 H2 Z" fill="${C.green}" ${S}/>
    <path d="M12 35 V58 M20 35 V56 M28 35 V54 M36 35 V52 M10 42 H40 M10 50 H38" fill="none" stroke="#9a6b45" stroke-width="2.6" stroke-linecap="round"/>
    <rect x="7" y="30" width="36" height="5" fill="${C.tan}" ${S}/>
    <rect x="25" y="19" width="29" height="11" fill="${C.tan}" ${S}/>
    <path d="M18 21 Q39 7 61 21 Q50 17 39.5 17 Q29 17 18 21 Z" fill="#7a88b8" ${S}/>
    <circle cx="54" cy="39" r="5" fill="${C.red}" ${S}/><circle cx="47" cy="44" r="3.5" fill="#f08a4b" ${S}/>`,
  pokeball: () => `
    <circle cx="32" cy="32" r="25" fill="#fff" ${S}/>
    <path d="M7 32 A25 25 0 0 1 57 32 Z" fill="${C.red}" ${S}/>
    <circle cx="32" cy="32" r="8" fill="#fff" ${S}/><circle cx="32" cy="32" r="3.5" fill="#fff" stroke="${INK}" stroke-width="2"/>`,
  star: () => `
    <path d="M6 44 H18 M4 52 H16 M10 36 H20" fill="none" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/>
    <path d="M38 8 l7.2 14.6 16.1 2.3 -11.6 11.4 2.7 16 -14.4 -7.6 -14.4 7.6 2.7 -16 -11.6 -11.4 16.1 -2.3 Z" fill="${C.yellow}" ${S}/>
    <circle cx="38" cy="31" r="4" fill="${C.pink}" ${S}/>`,
  gamepad: () => `
    <rect x="5" y="20" width="54" height="27" rx="13.5" fill="${C.pink}" ${S}/>
    <path d="M14 31 h4 v-4 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 Z" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="43" cy="30" r="3.2" fill="${C.yellow}" ${S}/><circle cx="50" cy="36" r="3.2" fill="${C.blue}" ${S}/>`,
  monkey: () => `
    <path d="M6 46 Q6 58 32 58 Q58 58 58 46 Z" fill="${C.teal}" ${S}/>
    <ellipse cx="32" cy="46" rx="26" ry="5" fill="${C.sky}" ${S}/>
    <path d="M14 22 q-3 -4 0 -8 M50 22 q-3 -4 0 -8" fill="none" stroke="${C.grey}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="17" cy="31" r="5" fill="${C.pink}" ${S}/><circle cx="47" cy="31" r="5" fill="${C.pink}" ${S}/>
    <circle cx="32" cy="30" r="15" fill="#b8a48c" ${S}/>
    <ellipse cx="32" cy="34" rx="10" ry="9" fill="#f4b7b0" ${S}/>
    <circle cx="28" cy="31" r="1.8" fill="${INK}"/><circle cx="36" cy="31" r="1.8" fill="${INK}"/>
    <path d="M30 37 h4" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
  teamlab: () => `
    <rect x="5" y="5" width="54" height="54" rx="13" fill="#8f82c4" ${S}/>
    ${[[18,18,C.pink],[33,14,C.yellow],[47,22,C.blue],[16,34,C.mint],[30,30,"#fff"],[44,38,C.pink],[22,47,C.lav],[36,48,C.yellow],[49,51,C.mint]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${c}" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`).join("")}`,
  terraces: () => `
    <path d="M2 18 Q32 6 62 18 V26 Q32 14 2 26 Z" fill="${C.green}" ${S}/>
    <path d="M2 30 Q32 18 62 30 V38 Q32 26 2 38 Z" fill="${C.mint}" ${S}/>
    <path d="M2 42 Q32 30 62 42 V50 Q32 38 2 50 Z" fill="${C.green}" ${S}/>
    <path d="M2 54 Q32 42 62 54 V60 H2 Z" fill="${C.mint}" ${S}/>
    <path d="M14 25 Q22 22 30 21 M34 36 Q42 35 50 36 M12 49 Q20 46 28 45" fill="none" stroke="${C.sky}" stroke-width="2.4" stroke-linecap="round"/>`,
  crossing: () => `
    <rect x="4" y="4" width="56" height="56" rx="10" fill="#b9bfd3" ${S}/>
    ${[12, 20, 28, 36, 44].map((y) => `<rect x="${y}" y="8" width="4" height="14" fill="#fff"/><rect x="${y}" y="42" width="4" height="14" fill="#fff"/><rect x="8" y="${y}" width="14" height="4" fill="#fff"/><rect x="42" y="${y}" width="14" height="4" fill="#fff"/>`).join("")}
    <circle cx="32" cy="32" r="6" fill="${C.yellow}" ${S}/>`,
  heaven: () => `
    <path d="M5 58 H59 L55 52 H9 Z" fill="#fff" ${S}/><path d="M10 52 H54 L50 47 H14 Z" fill="#fff" ${S}/>
    <rect x="18" y="38" width="28" height="9" fill="${C.red}" ${S}/><path d="M9 40 Q32 29 55 40 Z" fill="#4f6fb5" ${S}/>
    <rect x="22" y="27" width="20" height="7" fill="${C.red}" ${S}/><path d="M14 29 Q32 20 50 29 Z" fill="#4f6fb5" ${S}/>
    <rect x="26" y="17" width="12" height="6" fill="${C.red}" ${S}/><path d="M19 19 Q32 10 45 19 Z" fill="#4f6fb5" ${S}/>
    <circle cx="32" cy="9" r="3" fill="#f2c94c" ${S}/>`,
  warrior: () => `
    <path d="M9 61 Q9 42 32 40 Q55 42 55 61 Z" fill="#b07a4f" ${S}/>
    <path d="M16 48 H48 M14 55 H50" fill="none" stroke="#7a5233" stroke-width="1.8" stroke-dasharray="2 3"/>
    <ellipse cx="32" cy="27" rx="12" ry="14" fill="#c98f5f" ${S}/>
    <path d="M20 23 Q20 11 32 11 Q44 11 44 23 Q38 17 32 17 Q26 17 20 23 Z" fill="#9a6b45" ${S}/>
    <ellipse cx="40" cy="10" rx="5.5" ry="4.5" fill="#9a6b45" ${S}/>
    <path d="M26 27 h4 M34 27 h4 M28 34 q4 2 8 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
  forbidden: () => `
    <rect x="2" y="40" width="60" height="18" fill="${C.red}" ${S}/>
    <path d="M14 58 V51 a4 4 0 0 1 8 0 V58 Z M28 58 V49 a4 4 0 0 1 8 0 V58 Z M42 58 V51 a4 4 0 0 1 8 0 V58 Z" fill="${C.dark}" ${S}/>
    <rect x="12" y="27" width="40" height="13" fill="${C.red}" ${S}/>
    <path d="M4 31 L12 25 H52 L60 31 Z" fill="#f2c94c" ${S}/>
    <rect x="19" y="18" width="26" height="7" fill="${C.red}" ${S}/>
    <path d="M10 20 L18 13 H46 L54 20 Z" fill="#f2c94c" ${S}/>`,
  karst: () => `
    <path d="M20 50 Q22 28 30 26 Q38 28 40 50 Z" fill="${C.mint}" ${S}/>
    <path d="M3 50 Q3 22 13 19 Q22 22 22 50 Z" fill="${C.green}" ${S}/>
    <path d="M40 50 Q40 14 50 11 Q60 14 60 50 Z" fill="${C.green}" ${S}/>
    <path d="M2 49 Q32 42 62 49 V60 H2 Z" fill="${C.sky}" ${S}/>
    <rect x="23" y="50" width="18" height="4" rx="1" fill="${C.tan}" ${S}/><path d="M38 50 L44 40" fill="none" ${S}/>`,
  pillars: () => `
    <rect x="7" y="22" width="11" height="38" rx="3" fill="${C.grey}" ${S}/>
    <rect x="26" y="11" width="12" height="49" rx="3" fill="${C.grey}" ${S}/>
    <rect x="46" y="27" width="11" height="33" rx="3" fill="${C.grey}" ${S}/>
    <ellipse cx="12.5" cy="21" rx="7" ry="4" fill="${C.green}" ${S}/><ellipse cx="32" cy="10" rx="8" ry="4.5" fill="${C.green}" ${S}/><ellipse cx="51.5" cy="26" rx="7" ry="4" fill="${C.green}" ${S}/>
    <ellipse cx="32" cy="52" rx="30" ry="6" fill="#fff" ${S}/>`,
  potala: () => `
    <path d="M2 61 Q32 44 62 61 Z" fill="${C.green}" ${S}/>
    <rect x="6" y="32" width="52" height="22" fill="#fff" ${S}/>
    <rect x="22" y="19" width="20" height="35" fill="#b4474f" ${S}/>
    <path d="M24 19 L28 13 H36 L40 19 Z" fill="#f2c94c" ${S}/>
    <path d="M10 40 H18 M46 40 H54 M10 47 H18 M46 47 H54 M26 27 H38 M26 35 H38" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  pearl: () => `
    <path d="M18 61 L29 40 M46 61 L35 40 M32 61 V44" fill="none" ${S}/>
    <rect x="29" y="12" width="6" height="22" fill="#fff" ${S}/>
    <circle cx="32" cy="38" r="10" fill="${C.pink}" ${S}/>
    <circle cx="32" cy="17" r="6.5" fill="${C.pink}" ${S}/>
    <path d="M32 10 V2" fill="none" ${S}/>`,
  // Erika's mascot (drawn on a 200 grid, scaled to 64; outline thickened to match the other drawings)
  bunny: () => `<g transform="scale(.32)"><g fill="#3b3a5e" stroke="#3b3a5e" stroke-width="13" stroke-linejoin="round"><ellipse cx="67" cy="68" rx="15" ry="33" transform="rotate(-17 67 68)"/><ellipse cx="133" cy="68" rx="15" ry="33" transform="rotate(17 133 68)"/><path d="M100 86 C136 86 159 109 159 137 C159 157 137 165 100 165 C63 165 41 157 41 137 C41 109 64 86 100 86 Z"/></g><g fill="#fffdf9"><ellipse cx="67" cy="68" rx="15" ry="33" transform="rotate(-17 67 68)"/><ellipse cx="133" cy="68" rx="15" ry="33" transform="rotate(17 133 68)"/><path d="M100 86 C136 86 159 109 159 137 C159 157 137 165 100 165 C63 165 41 157 41 137 C41 109 64 86 100 86 Z"/></g><ellipse cx="66" cy="69" rx="6.5" ry="21" transform="rotate(-17 66 69)" fill="#f6a9b9"/><ellipse cx="134" cy="69" rx="6.5" ry="21" transform="rotate(17 134 69)" fill="#f6a9b9"/><g transform="translate(99 92) rotate(24)"><path d="M0 0 C13 -6 14 -22 0 -32 C-14 -22 -13 -6 0 0 Z" fill="#9fd8b0" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M0 -3 C2 -11 2 -18 -1 -24" fill="none" stroke="#3b3a5e" stroke-width="2.6" stroke-linecap="round"/></g><ellipse cx="80" cy="126" rx="4.6" ry="5.8" fill="#3b3a5e"/><ellipse cx="120" cy="126" rx="4.6" ry="5.8" fill="#3b3a5e"/>   <path d="M90 132 q5 6.5 10 0 q5 6.5 10 0" fill="none" stroke="#3b3a5e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>   <ellipse cx="67" cy="135" rx="9" ry="6" fill="#f8b8bf"/><ellipse cx="133" cy="135" rx="9" ry="6" fill="#f8b8bf"/></g>`,
  bunnymap: () => `<g transform="scale(.32)"><ellipse cx="100" cy="190" rx="44" ry="5" fill="#cfe3f8" opacity=".7"/>     <path d="M122 132 C150 126 166 138 166 158 C166 176 156 184 140 184 L124 184 Z" fill="#f6a9b9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/>     <path d="M150 150 C158 152 160 164 156 172" fill="none" stroke="#e58aa0" stroke-width="3" stroke-linecap="round"/>     <rect x="128" y="114" width="36" height="20" rx="10" fill="#cfe3f8" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M156 120 a4.5 4.5 0 1 1 -4.5 5.5" fill="none" stroke="#7fa9dc" stroke-width="2.6" stroke-linecap="round"/>     <path d="M62 150 C60 176 74 186 100 186 C126 186 140 176 138 150 Z" fill="#fffdf9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/>     <ellipse cx="84" cy="184" rx="12" ry="7" fill="#fffdf9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="116" cy="184" rx="12" ry="7" fill="#fffdf9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/>     <g fill="#3b3a5e" stroke="#3b3a5e" stroke-width="13" stroke-linejoin="round"><ellipse cx="67" cy="48" rx="15" ry="33" transform="rotate(-17 67 48)"/><ellipse cx="133" cy="48" rx="15" ry="33" transform="rotate(17 133 48)"/><path d="M100 66 C136 66 159 89 159 117 C159 137 137 145 100 145 C63 145 41 137 41 117 C41 89 64 66 100 66 Z"/></g><g fill="#fffdf9"><ellipse cx="67" cy="48" rx="15" ry="33" transform="rotate(-17 67 48)"/><ellipse cx="133" cy="48" rx="15" ry="33" transform="rotate(17 133 48)"/><path d="M100 66 C136 66 159 89 159 117 C159 137 137 145 100 145 C63 145 41 137 41 117 C41 89 64 66 100 66 Z"/></g><ellipse cx="66" cy="49" rx="6.5" ry="21" transform="rotate(-17 66 49)" fill="#f6a9b9"/><ellipse cx="134" cy="49" rx="6.5" ry="21" transform="rotate(17 134 49)" fill="#f6a9b9"/><g transform="translate(99 72) rotate(24)"><path d="M0 0 C13 -6 14 -22 0 -32 C-14 -22 -13 -6 0 0 Z" fill="#9fd8b0" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M0 -3 C2 -11 2 -18 -1 -24" fill="none" stroke="#3b3a5e" stroke-width="2.6" stroke-linecap="round"/></g><ellipse cx="80" cy="106" rx="4.6" ry="5.8" fill="#3b3a5e"/><ellipse cx="120" cy="106" rx="4.6" ry="5.8" fill="#3b3a5e"/>   <path d="M90 112 q5 6.5 10 0 q5 6.5 10 0" fill="none" stroke="#3b3a5e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>   <ellipse cx="67" cy="115" rx="9" ry="6" fill="#f8b8bf"/><ellipse cx="133" cy="115" rx="9" ry="6" fill="#f8b8bf"/>     <path d="M122 138 C130 146 132 160 128 174" fill="none" stroke="#3b3a5e" stroke-width="12.6" stroke-linecap="round"/><path d="M122 138 C130 146 132 160 128 174" fill="none" stroke="#f6a9b9" stroke-width="5.04" stroke-linecap="round"/>     <g transform="rotate(-6 100 156)"><path d="M58 136 L100 130 L142 136 L140 176 L100 170 L60 176 Z" fill="#cfe3f8" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M86 132 L86 172 M114 132 L114 172" stroke="#3b3a5e" stroke-width="2.4"/>       <path d="M68 160 q8 -12 18 -6 t22 -6" fill="none" stroke="#7fa9dc" stroke-width="2.6" stroke-dasharray="3 5" stroke-linecap="round"/>       <path d="M118 166 l8 -12 8 12 Z" fill="#7fa9dc"/><path d="M125 140 c-5 0 -8 3 -8 7 0 5 8 11 8 11 s8 -6 8 -11 c0 -4 -3 -7 -8 -7z" fill="#ec5866"/><circle cx="125" cy="147" r="2.6" fill="#fff"/></g>     <ellipse cx="60" cy="158" rx="12" ry="13" fill="#fffdf9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="140" cy="154" rx="12" ry="13" fill="#fffdf9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/></g>`,
  bunnypaws: () => `<g transform="scale(.32)"><g fill="#3b3a5e" stroke="#3b3a5e" stroke-width="13" stroke-linejoin="round"><ellipse cx="67" cy="60" rx="15" ry="33" transform="rotate(-17 67 60)"/><ellipse cx="133" cy="60" rx="15" ry="33" transform="rotate(17 133 60)"/><path d="M100 78 C136 78 159 101 159 129 C159 149 137 157 100 157 C63 157 41 149 41 129 C41 101 64 78 100 78 Z"/></g><g fill="#fffdf9"><ellipse cx="67" cy="60" rx="15" ry="33" transform="rotate(-17 67 60)"/><ellipse cx="133" cy="60" rx="15" ry="33" transform="rotate(17 133 60)"/><path d="M100 78 C136 78 159 101 159 129 C159 149 137 157 100 157 C63 157 41 149 41 129 C41 101 64 78 100 78 Z"/></g><ellipse cx="66" cy="61" rx="6.5" ry="21" transform="rotate(-17 66 61)" fill="#f6a9b9"/><ellipse cx="134" cy="61" rx="6.5" ry="21" transform="rotate(17 134 61)" fill="#f6a9b9"/><g transform="translate(99 84) rotate(24)"><path d="M0 0 C13 -6 14 -22 0 -32 C-14 -22 -13 -6 0 0 Z" fill="#9fd8b0" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M0 -3 C2 -11 2 -18 -1 -24" fill="none" stroke="#3b3a5e" stroke-width="2.6" stroke-linecap="round"/></g><ellipse cx="80" cy="118" rx="4.6" ry="5.8" fill="#3b3a5e"/><ellipse cx="120" cy="118" rx="4.6" ry="5.8" fill="#3b3a5e"/>   <path d="M90 124 q5 6.5 10 0 q5 6.5 10 0" fill="none" stroke="#3b3a5e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>   <ellipse cx="67" cy="127" rx="9" ry="6" fill="#f8b8bf"/><ellipse cx="133" cy="127" rx="9" ry="6" fill="#f8b8bf"/><ellipse cx="70" cy="156" rx="16" ry="11" fill="#fffdf9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="130" cy="156" rx="16" ry="11" fill="#fffdf9" stroke="#3b3a5e" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/></g>`,
};

// Style rule: only food, drinks and the mascot get a smiling face; places and
// practical icons stay plain (animals keep their eyes).
const WITH_FACE = new Set(["dango", "cup", "takoyaki", "ramen", "bunny", "bunnymap", "bunnypaws"]);

// Default drawing for each place category, used when a place has no "icon".
const CATEGORY_ICON = { food: "ramen", cafe: "cup", see: "torii", photo: "camera", activity: "ticket", sleep: "pagoda", hidden: "gem" };

/** Sticker look, as on Erika's bunny: a copy of the drawing in ink, slightly fatter, sits underneath
 * and gives one soft outline around the whole shape; the drawing on top keeps thin inner lines. */
function sticker(art) {
  const under = art.replace(/fill="(?!none)[^"]*"/g, `fill="${INK}"`).replace(/stroke="[^"]*"/g, `stroke="${INK}"`)
    .replace(/stroke-width="[^"]*"/g, 'stroke-width="4.2"').replace(/ opacity="[^"]*"/g, "").replace(/stroke-dasharray="[^"]*"/g, "");
  const over = art.replace(/stroke-width="2.6"/g, 'stroke-width="1.7"');
  return `<g stroke="${INK}" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${under}</g>${over}`;
}
const MASCOTS = new Set(["bunny", "bunnymap", "bunnypaws"]);

function icon(name, size = 56) {
  if (!(name in ICONS)) name = "torii";
  const art = ICONS[name](WITH_FACE.has(name));
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${MASCOTS.has(name) ? art : sticker(art)}</svg>`;
}

window.HodoIcons = { icon, has: (n) => n in ICONS, CATEGORY_ICON, names: Object.keys(ICONS) };
})();
