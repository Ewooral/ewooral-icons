// scripts/add-31-icons.mjs
// Run from repo root:  node scripts/add-31-icons.mjs   then:  pnpm build
import fs from "fs";

const TEMPLATE = "src/svg/alarm.svg";          // any existing icon = the chrome donor
const tmpl = fs.readFileSync(TEMPLATE, "utf8");

const ACC = "var(--ew-accent,#f5b820)";
const GREEN = "#1a3a2a", OUT = "#0f2017", SAGE = "#8fb89a";

// helpers (all coords are origin-centered, ~ -6..6, matching the ew-body frame)
const L = (d, s, w) => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const F = (d, f, s, w) => `<path d="${d}" fill="${f}"${s ? ` stroke="${s}" stroke-width="${w}"` : ""} stroke-linecap="round" stroke-linejoin="round"/>`;
const C = (x, y, r, f, s, w) => `<circle cx="${x}" cy="${y}" r="${r}"${f ? ` fill="${f}"` : ` fill="none"`}${s ? ` stroke="${s}" stroke-width="${w}"` : ""}/>`;
const R = (x, y, w, h, rx, f, s, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"${f ? ` fill="${f}"` : ` fill="none"`}${s ? ` stroke="${s}" stroke-width="${sw}"` : ""}/>`;

const ICONS = [
  ["align-right","slide", L("M6 -4H-6 M6 -1.3H-1 M6 1.3H-5 M6 4H0",GREEN,1.4)+L("M6 -4V4",ACC,1.6)],
  ["apple","pop", F("M-0.4 -4C-3 -5 -6 -3 -5.6 0.6C-5.3 3.6 -3 5.4 -0.4 4.4C0.4 4.1 0.4 4.1 1.2 4.4C3.8 5.4 6 3.4 5.6 0.2C5.3 -3 2.6 -5 0.2 -4Z",GREEN,OUT,0.9)+L("M0 -4C0.4 -6 2 -6.4 3.4 -6.2",SAGE,1.4)+C(2.6,-5.2,1.1,ACC)],
  ["armchair","rise",
    R(-4.6,-5.4,9.2,4.8,1.6,GREEN,OUT,0.9) +              // backrest panel
    R(-3.2,-4.2,6.4,2.6,0.8,SAGE) +                       // sage cushion inset on backrest
    R(-5.6,-0.6,1.6,4,0.8,GREEN,OUT,0.9) +                // left armrest
    R(4,-0.6,1.6,4,0.8,GREEN,OUT,0.9) +                   // right armrest
    R(-4,-0.6,8,3.4,0.6,GREEN,OUT,0.9) +                  // seat between armrests
    L("M-3.4 0.6H3.4",ACC,1.6) +                          // gold seat-cushion stripe
    L("M-4.6 4.4V5.4 M4.6 4.4V5.4",OUT,1.2)               // legs
  ],
  ["ban","shake", C(0,0,5.4,"none",OUT,1.4)+L("M-3.8 -3.8L3.8 3.8",ACC,1.6)],
  ["book-open","flip", F("M0 -4.2C-1.6 -5.2 -3.8 -5.2 -5.6 -4.6V4.4C-3.8 3.8 -1.6 3.8 0 4.8Z",GREEN,OUT,0.9)+F("M0 -4.2C1.6 -5.2 3.8 -5.2 5.6 -4.6V4.4C3.8 3.8 1.6 3.8 0 4.8Z",SAGE,OUT,0.9)+L("M0 -4.2V4.8",ACC,1.3)],
  ["bot","pulse", R(-5,-3.4,10,7.4,2.2,GREEN,OUT,0.9)+C(-2,0,1,ACC)+C(2,0,1,ACC)+L("M0 -3.4V-5.6",SAGE,1.4)+C(0,-6.2,1,ACC)+L("M-5 -0.4H-6.4 M5 -0.4H6.4",SAGE,1.4)],
  ["box","rise", F("M0 -5L5.4 -2V3L0 6L-5.4 3V-2Z",GREEN,OUT,0.9)+L("M-5.4 -2L0 1L5.4 -2 M0 1V6",OUT,1)+L("M0 1L5.4 -2",ACC,1.2)],
  ["brain","pulse", F("M-0.6 -5C-3 -5.4 -5.2 -3.6 -4.8 -1.4C-6 -0.2 -5.6 2 -3.8 2.8C-3.6 4.6 -1.4 5.4 -0.6 4.4V-5Z",GREEN,OUT,0.9)+F("M0.6 -5C3 -5.4 5.2 -3.6 4.8 -1.4C6 -0.2 5.6 2 3.8 2.8C3.6 4.6 1.4 5.4 0.6 4.4V-5Z",SAGE,OUT,0.9)+L("M0 -5V4.6",ACC,1.2)],
  ["building-2","rise", R(-5.4,-2,5,8,0.6,GREEN,OUT,0.9)+R(0.4,-5.4,5,11.4,0.6,SAGE,OUT,0.9)+L("M-3.8 0H-2 M-3.8 2H-2 M-3.8 4H-2",ACC,1.1)+L("M2 -3H3.8 M2 -0.6H3.8 M2 1.8H3.8",OUT,1)],
  ["check-check","check", L("M-6 0.4L-3 3.4L1.4 -3",GREEN,1.6)+L("M0 2.6L1.6 4.2L6 -2.2",ACC,1.6)],
  ["circle","pulse", C(0,0,5.2,"none",GREEN,1.6)+C(0,0,2.4,ACC)],
  ["crown","rise", F("M-5.6 3L-5 -3.4L-2 0L0 -4L2 0L5 -3.4L5.6 3Z",GREEN,OUT,0.9)+L("M-5.6 4.4H5.6",ACC,1.6)+C(0,-4.6,1,ACC)+C(-5,-4,0.9,SAGE)+C(5,-4,0.9,SAGE)],
  ["door-open","swing", L("M-5.6 5.4H5.6",OUT,1.3)+F("M-4 5V-4.6L3.4 -5.8V5Z",GREEN,OUT,0.9)+C(1.4,0.2,0.9,ACC)+L("M-4 5V-4.6",SAGE,1.2)],
  ["hash","spin", L("M-2 -5L-3.4 5 M2 -5L0.6 5",GREEN,1.5)+L("M-5 -1.6H5.4 M-5.4 1.6H5",ACC,1.5)],
  ["history","spin", F("M5.2 0A5.2 5.2 0 1 1 0 -5.2","none",GREEN,1.4)+L("M-5.2 -5V-2H-2.2",ACC,1.4)+L("M0 -2.4V0.4L2.4 1.8",ACC,1.4)],
  ["languages","slide", L("M-5.4 4L-2.6 -4L0.2 4 M-4.4 1.4H-0.8",GREEN,1.4)+L("M2 -4H6 M4 -4V-2C4 1 2.4 3.4 1.2 4.4 M2.6 -0.6C3.4 1.4 5 3 6.2 3.6",ACC,1.3)],
  ["leaf","rise", F("M5 -5C5 1 1 5 -4.6 5C-5 -0.6 -1 -5 5 -5Z",GREEN,OUT,0.9)+L("M4 -4L-3.4 3.4",ACC,1.3)+L("M0.4 -0.2L2.2 -0.4 M-1.6 1.8L0.2 1.6",SAGE,1.1)],
  ["log-in","slide", F("M0.6 -5H5V5H0.6","none",GREEN,0.9)+L("M-5.4 0H1.6",ACC,1.6)+L("M-1 -2.4L1.6 0L-1 2.4",ACC,1.6)],
  ["newspaper","rise", R(-5.4,-4.4,9.4,9,0.8,GREEN,OUT,0.9)+R(4,-2,2.4,6.6,0.6,SAGE,OUT,0.9)+L("M-3.4 -2.2H1.4 M-3.4 0.4H1.4 M-3.4 3H-0.4",ACC,1.1)],
  ["package","rise", F("M0 -5L5.4 -2V3L0 6L-5.4 3V-2Z",GREEN,OUT,0.9)+L("M-5.4 -2L0 1L5.4 -2 M0 1V6",OUT,1)+L("M-2.7 -3.5L2.7 -0.5",ACC,1.4)],
  ["percent","spin", L("M-4.4 -4.4L4.4 4.4",ACC,1.6)+C(-3,-3,1.6,"none",GREEN,1.4)+C(3,3,1.6,"none",GREEN,1.4)],
  ["pin","pop", F("M0 6C0 6 -4.6 0.6 -4.6 -2.4C-4.6 -5 -2.4 -6.4 0 -6.4C2.4 -6.4 4.6 -5 4.6 -2.4C4.6 0.6 0 6 0 6Z",GREEN,OUT,0.9)+C(0,-2.4,1.8,ACC)],
  ["quote","pop", F("M-5.4 1C-5.4 -2 -3.4 -3.6 -1.4 -3.6V-1.6C-2.6 -1.6 -3.4 -0.8 -3.4 0.4H-1.4V3.6H-5.4Z",GREEN,OUT,0.8)+F("M1.4 1C1.4 -2 3.4 -3.6 5.4 -3.6V-1.6C4.2 -1.6 3.4 -0.8 3.4 0.4H5.4V3.6H1.4Z",ACC,OUT,0.8)],
  ["smile","pop", C(0,0,5.2,"none",GREEN,1.4)+C(-2,-1.4,0.9,OUT)+C(2,-1.4,0.9,OUT)+L("M-2.8 1.8C-1.4 3.4 1.4 3.4 2.8 1.8",ACC,1.5)],
  ["sprout","rise", L("M0 5.4V-1",GREEN,1.5)+F("M0 -1C0 -4 -2.4 -5.4 -5 -5.2C-5.2 -2.4 -3.4 -0.6 0 -1Z",SAGE,OUT,0.8)+F("M0 -0.4C0 -3 2 -4.2 4.4 -4C4.6 -1.6 3 0 0 -0.4Z",ACC,OUT,0.8)],
  ["sticky-note","tilt", F("M-5 -5H5V1.4L1.4 5H-5Z",GREEN,OUT,0.9)+F("M5 1.4H1.4V5Z",SAGE,OUT,0.9)+L("M-3 -2.4H3 M-3 -0.2H1",ACC,1.1)],
  ["trophy","rise", F("M-3.4 -5H3.4V-1.4C3.4 1 1.6 2.6 0 2.6C-1.6 2.6 -3.4 1 -3.4 -1.4Z",GREEN,OUT,0.9)+L("M-3.4 -4C-5.6 -4 -5.6 -1 -3.2 -1 M3.4 -4C5.6 -4 5.6 -1 3.2 -1",SAGE,1.2)+L("M0 2.6V4.4 M-2.4 5.4H2.4",ACC,1.5)],
  ["user-plus","pop", C(-1.4,-2.6,2.4,GREEN,OUT,0.9)+F("M-6 5.4C-6 1.8 -4 0.4 -1.4 0.4C1 0.4 3 1.8 3 5.4Z",GREEN,OUT,0.9)+L("M5 -3V1 M3 -1H7",ACC,1.5)],
  ["utensils-crossed","swing",
    L("M-2.6 -2.6L4 4",GREEN,1.5) +                                       // fork handle (NW to SE)
    L("M-2.6 -2.6L-5.6 -2.6 M-2.6 -2.6L-4.4 -4.4 M-2.6 -2.6L-2.6 -5.6",ACC,1.4) +  // 3 prongs splaying NW
    L("M2.6 -2.6L-4 4",GREEN,1.5) +                                       // knife shaft (NE to SW)
    F("M2.6 -2.6L5.6 -3.6L4.4 -1.4Z",SAGE,OUT,0.9)                        // knife blade triangle
  ],
  ["wand-2","pop", L("M4 -5L-4 3",GREEN,1.7)+L("M-3 0L-1.2 1.8",ACC,1.7)+C(2.6,-3.6,1,ACC)+L("M5.2 0V2 M4.2 1H6.2",ACC,1.2)+L("M-4.6 -3V-1.4 M-5.4 -2.2H-3.8",SAGE,1.1)],
  ["zap","pop", F("M1.4 -6L-4 1H-0.2L-1.4 6L4.2 -1H0.4Z",ACC,OUT,1)],
];

// inject: clone chrome, swap data-motion + the ew-body inner content
function build(motion, glyph) {
  let s = tmpl.replace(/data-motion="[^"]*"/, `data-motion="${motion}"`);
  s = s.replace(/(<g class="ew-body"[^>]*>)[\s\S]*?(<\/g>\s*<\/svg>)/, `$1${glyph}$2`);
  return s;
}

let n = 0;
for (const [name, motion, glyph] of ICONS) {
  fs.writeFileSync(`src/svg/${name}.svg`, build(motion, glyph));
  n++;
}
console.log(`Wrote ${n} icons -> src/svg/  (run: pnpm build)`);
