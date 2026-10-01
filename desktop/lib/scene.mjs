// desktop.svg: wallpaper, server rack, terminal window, desktop icons, pets and speech bubbles.
import { Cells, cellsToSvg, textCells } from './raster.mjs';
import { textWidth } from './font.mjs';
import { desktopIcons } from './icons.mjs';
import { typing, walking, sleeping, CELL, LOOP } from './anim.mjs';

export const W = 840, H = 420, GROUND = 384, BASE = 398;
const FONT = `'Segoe UI Variable','Segoe UI',system-ui,-apple-system,Roboto,'Helvetica Neue',Arial,sans-serif`;
const MONO = `'Cascadia Mono',Consolas,'SF Mono',Menlo,'DejaVu Sans Mono','Liberation Mono',monospace`;

const PAL = {
  night: {
    sky: ['#09080e', '#15111c', '#21161f'], ground: '#08070c', edge: '#201c2b', glow: '#D97757', glowOp: .22,
    glow2: '#5DCAA5', glow2Op: .10, paper: '#E9E5D8', rack: '#17161e', rackEdge: '#2e2c3a', dots: .07,
  },
  day: {
    sky: ['#1d2b4d', '#47649a', '#d98d68'], ground: '#241c2b', edge: '#4d3c4c', glow: '#FFB27A', glowOp: .30,
    glow2: '#9bd8ff', glow2Op: .16, paper: '#FBF9F2', rack: '#1c1b25', rackEdge: '#363446', dots: .09,
  },
};

function rngOf(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const pick = (v, theme) => (v && typeof v === 'object' && !Array.isArray(v) && ('day' in v || 'night' in v)) ? v[theme] : v;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f1 = v => +v.toFixed(2);

function disc(c, cx, cy, r, col) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .6) c.put(cx + x, cy + y, col); }

/* ================================================================= wallpaper */
function wallpaper(theme, P) {
  const rng = rngOf(theme === 'night' ? 11 : 23);
  let css = '', defs = '', svg = '';
  defs += `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset=".55" stop-color="${P.sky[1]}"/><stop offset="1" stop-color="${P.sky[2]}"/></linearGradient>
<radialGradient id="gl1"><stop offset="0" stop-color="${P.glow}" stop-opacity="${P.glowOp}"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/></radialGradient>
<radialGradient id="gl2"><stop offset="0" stop-color="${P.glow2}" stop-opacity="${P.glow2Op}"/><stop offset="1" stop-color="${P.glow2}" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="9" y="9" width="2" height="2" fill="#fff" fill-opacity="${P.dots}"/></pattern>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  svg += `<g class="b1"><ellipse cx="590" cy="215" rx="330" ry="190" fill="url(#gl1)"/></g><g class="b2"><ellipse cx="170" cy="330" rx="260" ry="150" fill="url(#gl2)"/></g>`;
  svg += `<rect width="${W}" height="${GROUND}" fill="url(#dots)"/>`;
  css += `.b1,.b2{animation:bl 12s ease-in-out infinite}.b2{animation-duration:8s;animation-delay:-3s}@keyframes bl{0%,100%{opacity:.7}50%{opacity:1}}`;

  if (theme === 'night') {
    // stars
    let st = '';
    for (let i = 0; i < 64; i++) {
      const x = Math.floor(rng() * 420) * 2, y = Math.floor(rng() * 118) * 2, s = rng() < .22 ? 3 : 2, k = i % 3;
      if (x > 150 && x < 460 && y > 20 && y < 160) continue; // keep the terminal clean
      st += s === 3
        ? `<g class="tw${k}"><rect x="${x}" y="${y + 1}" width="3" height="1" fill="#fff"/><rect x="${x + 1}" y="${y}" width="1" height="3" fill="#fff"/></g>`
        : `<rect class="tw${k}" x="${x}" y="${y}" width="2" height="2" fill="#fff"/>`;
    }
    svg += st;
    css += `.tw0,.tw1,.tw2{opacity:.55;animation:tw 4s ease-in-out infinite}.tw1{animation-duration:6s;animation-delay:-2s}.tw2{animation-duration:8s;animation-delay:-5s}@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}`;
    // moon: crescent
    const m = new Cells();
    disc(m, 0, 0, 9, '#F1EFE8');
    for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) if ((x - 4) ** 2 + (y + 3) ** 2 <= 8 * 8 + 5) m.m.delete(x + ',' + y);
    m.put(-6, 2, '#D6D2C6'); m.put(-5, 2, '#D6D2C6'); m.put(-5, 3, '#D6D2C6'); m.put(-3, 6, '#D6D2C6'); m.put(-2, 6, '#D6D2C6');
    svg += `<g shape-rendering="crispEdges" transform="translate(556 64) scale(3)" opacity=".95">${cellsToSvg(m)}</g>`;
    // shooting star
    svg += `<g class="ss"><rect width="30" height="2" fill="#fff" fill-opacity=".9" transform="rotate(27)"/><rect x="22" width="8" height="2" fill="#fff" transform="rotate(27)"/></g>`;
    css += `.ss{opacity:0;animation:ss ${LOOP}s linear infinite}@keyframes ss{0%,66%{transform:translate(430px,16px);opacity:0}67%{opacity:1}71%{transform:translate(330px,62px);opacity:0}100%{transform:translate(330px,62px);opacity:0}}`;
  } else {
    // sun with slowly turning rays
    const s = new Cells();
    disc(s, 0, 0, 9, '#FFE8AD'); disc(s, 1, 1, 7, '#FFD27A');
    for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) if (x * x + y * y <= 14 && (x < 0 || y < 0)) s.put(x - 1, y - 1, '#FFF3CF');
    let rays = '';
    for (let i = 0; i < 8; i++) rays += `<rect x="-1.5" y="-48" width="3" height="9" fill="#FFE3A0" fill-opacity=".8" transform="rotate(${i * 45})"/>`;
    svg += `<g transform="translate(556 64)"><circle r="64" fill="url(#gl1)"/><g class="rays">${rays}</g><g transform="scale(3)">${cellsToSvg(s)}</g></g>`;
    css += `.rays{animation:rot ${LOOP}s linear infinite}@keyframes rot{to{transform:rotate(360deg)}}`;
    // clouds: wrap around off-screen so the loop is seamless
    const shapes = [[[4, 0, 6, 2], [2, 2, 12, 2], [0, 4, 16, 2]], [[5, 0, 5, 2], [3, 2, 10, 2], [8, 3, 6, 1], [0, 4, 18, 2]], [[2, 0, 4, 2], [0, 2, 10, 2], [1, 4, 8, 1]]];
    [[0, 34, 0], [1, 112, -9], [2, 196, -17], [0, 150, -4]].forEach(([sh, y, d], i) => {
      const c = new Cells(); shapes[sh].forEach(r => c.rect(...r, '#FFFFFF'));
      svg += `<g class="cl${i}" style="animation-delay:${d}s"><g shape-rendering="crispEdges" transform="translate(0 ${y}) scale(${i % 2 ? 4 : 5})" opacity="${i % 2 ? .13 : .2}">${cellsToSvg(c)}</g></g>`;
    });
    css += `.cl0,.cl1,.cl2,.cl3{animation:cl ${LOOP}s linear infinite}.cl1,.cl3{animation-duration:${LOOP * 1.5}s}@keyframes cl{from{transform:translateX(-120px)}to{transform:translateX(${W + 40}px)}}`;
  }

  // embers rising from the ground
  let em = '';
  for (let i = 0; i < 9; i++) {
    const x = 130 + Math.floor(rng() * 690), col = i % 3 === 0 ? '#5DCAA5' : '#D97757', d = [8, 12, 6][i % 3];
    em += `<rect class="em" style="animation-duration:${d}s;animation-delay:-${(rng() * d).toFixed(1)}s;--dx:${Math.round(rng() * 24 - 12)}px" x="${x}" y="${GROUND - 4}" width="2" height="2" fill="${col}"/>`;
  }
  svg += em;
  css += `.em{opacity:0;animation:em 8s linear infinite}@keyframes em{0%{transform:translate(0,0);opacity:0}10%{opacity:.8}100%{transform:translate(var(--dx),-170px);opacity:0}}`;
  return { svg, css, defs };
}

/* ================================================================= rack (the sleeper's bed) */
function rack(theme, P, x, y) {
  const w = 120, h = GROUND - y + 4;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${P.rack}" stroke="${P.rackEdge}" stroke-width="2"/><rect x="${x}" y="${y}" width="${w}" height="7" fill="#2b2937"/><rect x="${x}" y="${y}" width="${w}" height="2" fill="#4a4759"/>`;
  const leds = ['#5DCAA5', '#D97757', '#5DCAA5', '#EF9F27'];
  let css = '';
  for (let k = 0; k < 7; k++) {
    const yy = y + 14 + k * 22;
    if (yy + 18 > GROUND) break;
    s += `<rect x="${x + 8}" y="${yy}" width="${w - 16}" height="18" fill="#100f16" stroke="#2d2b38"/>`;
    for (let v = 0; v < 4; v++) s += `<rect x="${x + 14 + v * 7}" y="${yy + 5}" width="3" height="8" fill="#232130"/>`;
    s += `<rect x="${x + 48}" y="${yy + 7}" width="30" height="2" fill="#232130"/><rect x="${x + 48}" y="${yy + 11}" width="18" height="2" fill="#1c1a27"/>`;
    s += `<rect class="ld${k % 4}" x="${x + w - 24}" y="${yy + 7}" width="4" height="4" fill="${leds[k % 4]}"/><rect x="${x + w - 30}" y="${yy + 7}" width="4" height="4" fill="#5DCAA5" fill-opacity=".9"/>`;
  }
  css += `.ld0{animation:ld 2s step-end infinite}.ld1{animation:ld 3s step-end infinite}.ld2{animation:ld 4s step-end infinite;animation-delay:-1s}.ld3{animation:ld 6s step-end infinite;animation-delay:-2s}@keyframes ld{0%{opacity:1}50%{opacity:.12}}`;
  return { svg: s, css };
}

/* ================================================================= terminal */
function terminal(P) {
  const x = 150, y = 22, w = 300, h = 132;
  const lines = [
    [['$ ', '#5DCAA5'], ['codex_delegate --model sol', '#E8E6DE']],
    [['  queued   t-4f2a  agent-router-mcp', '#8C887E']],
    [['  checkpoint 9c1e7b  ', '#8C887E'], ['ok', '#5DCAA5']],
    [['  tests 58/58 ', '#8C887E'], ['passed', '#5DCAA5']],
    [['  review: 0 issues, ', '#8C887E'], ['2 notes', '#EF9F27']],
    [['$ ', '#5DCAA5']],
  ];
  const times = [.8, 2.6, 4.2, 6, 8, 10.2];
  let s = `<rect x="${x + 4}" y="${y + 6}" width="${w}" height="${h}" rx="9" fill="#000" fill-opacity=".34"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#16151d" stroke="#fff" stroke-opacity=".12"/>
<path d="M${x} ${y + 26}V${y + 8}a8 8 0 0 1 8-8h${w - 16}a8 8 0 0 1 8 8v18z" fill="#22202b"/>
<rect x="${x + 11}" y="${y + 9}" width="9" height="9" rx="2" fill="#D97757"/><rect x="${x + 13}" y="${y + 11}" width="2" height="2" fill="#16151d"/><rect x="${x + 16}" y="${y + 14}" width="3" height="1" fill="#16151d"/>
<text x="${x + 26}" y="${y + 17.5}" font-family="${FONT}" font-size="10.5" fill="#BDB9AE">marcel@desktop: ~/agent-router-mcp</text>
<g stroke="#9a968c" stroke-width="1.2" fill="none" stroke-linecap="round"><path d="M${x + w - 52} ${y + 13}h8"/><rect x="${x + w - 33}" y="${y + 9}" width="8" height="8" rx="1.5"/><path d="M${x + w - 15} ${y + 9}l8 8m0-8l-8 8"/></g>`;
  let css = '';
  lines.forEach((ln, i) => {
    const txt = ln.map(([t]) => t).join(''), cy = y + 44 + i * 14;
    const tsp = ln.map(([t, c]) => `<tspan fill="${c}">${esc(t).replace(/ /g, ' ')}</tspan>`).join('');
    s += `<text class="tl${i}" x="${x + 12}" y="${cy}" font-family="${MONO}" font-size="10" textLength="${txt.length * 6}" lengthAdjust="spacing">${tsp}</text>`;
    const a = (times[i] / LOOP * 100).toFixed(2);
    css += `.tl${i}{opacity:0;animation:tl${i} ${LOOP}s step-end infinite}@keyframes tl${i}{0%{opacity:0}${a}%{opacity:1}95%{opacity:0}}`;
  });
  s += `<rect class="cur" x="${x + 24}" y="${y + 44 + 5 * 14 - 8}" width="6" height="10" fill="#E8E6DE"/>`;
  css += `.cur{animation:cur 1s step-end infinite}@keyframes cur{0%{opacity:1}50%{opacity:0}}`;
  return { svg: s, css };
}

/* ================================================================= bubble */
/** Returns { svg, css, w, h }; local origin = bubble tail tip, bubble grows upwards. */
function bubble(id, lines, P, { side = 'c', start = .5 } = {}) {
  const S = 2, tw = Math.max(...lines.map(textWidth)) * S;
  const bw = tw + 20, bh = lines.length * 9 * S + 14;
  const tx = side === 'l' ? bw - 16 : side === 'r' ? 16 : Math.round(bw / 2 / 2) * 2;
  const x0 = -tx, y0 = -(bh + 4);
  const shape = (inset, o = 0) => {
    const a = inset, b = bw - inset, c = bh - inset;
    return `M${a + 2} ${a}H${b - 2}V${a + 2}H${b}V${c - 2}H${b - 2}V${c}H${a + 2}V${c - 2}H${a}V${a + 2}H${a + 2}Z`;
  };
  let s = `<g shape-rendering="crispEdges" transform="translate(${x0} ${y0})"><path d="${shape(0)}" fill="#2B1D16"/><path d="${shape(2)}" fill="${P.paper}"/>`;
  s += `<rect x="${tx - 3}" y="${bh - 2}" width="6" height="2" fill="${P.paper}"/><rect x="${tx - 3}" y="${bh}" width="2" height="2" fill="#2B1D16"/><rect x="${tx - 1}" y="${bh}" width="2" height="2" fill="${P.paper}"/><rect x="${tx + 1}" y="${bh}" width="2" height="2" fill="#2B1D16"/><rect x="${tx - 1}" y="${bh + 2}" width="2" height="2" fill="#2B1D16"/>`;
  lines.forEach((t, i) => {
    const { cells } = textCells(t, lines.length > 1 && i === 0 ? (P === PAL.night ? '#B24E2C' : '#B24E2C') : '#2B1D16', 0, 0);
    s += `<g transform="translate(10 ${2 + 5 + i * 9 * S}) scale(${S})">${cellsToSvg(cells)}</g>`;
  });
  // typed reveal: a paper-coloured cover shrinks from the left edge to the right
  s += `<rect class="${id}c" x="4" y="4" width="${bw - 8}" height="${bh - 8}" fill="${P.paper}"/></g>`;
  const steps = Math.max(...lines.map(l => [...l].length));
  const a = (start / LOOP * 100).toFixed(2), b = ((start + .09 * steps) / LOOP * 100).toFixed(2);
  const css = `.${id}c{transform-box:fill-box;transform-origin:100% 0;transform:scaleX(0);animation:${id}c ${LOOP}s infinite}` +
    `@keyframes ${id}c{0%{transform:scaleX(1);animation-timing-function:step-end}${a}%{transform:scaleX(1);animation-timing-function:steps(${steps},end)}${b}%{transform:scaleX(0)}97%{transform:scaleX(0);animation-timing-function:step-end}100%{transform:scaleX(1)}}`;
  return { svg: s, css, w: bw, h: bh };
}

/* ================================================================= desktop icons */
function iconsLayer(data, theme) {
  const icons = data.desktopIcons, X = 8, Y0 = 14, STEP = 70, CW = 96;
  const css = [];
  let s = '', defs = '';
  icons.forEach((ic, i) => {
    const y = Y0 + i * STEP, id = `di${i}`;
    let body;
    if (ic.type === 'cert') body = desktopIcons.cert(id, ic.accent, ic.badge);
    else body = desktopIcons[ic.type](id);
    s += `<g transform="translate(${X + (CW - 40) / 2} ${y}) scale(${40 / 48})">${body}</g>`;
    ic.label.forEach((t, k) => {
      s += `<text x="${X + CW / 2}" y="${y + 53 + k * 12.5}" text-anchor="middle" font-family="${FONT}" font-size="11.5" fill="#fff" stroke="#000" stroke-opacity=".55" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke">${esc(t)}</text>`;
    });
  });
  // hover highlight + cursor that visit the icons one by one
  const n = icons.length, slot = LOOP / (n + 1);
  const kf = [];
  for (let i = 0; i <= n; i++) kf.push(`${(i * slot / LOOP * 100).toFixed(3)}%{transform:translateY(${Math.min(i, n - 1) * STEP}px);opacity:${i < n ? 1 : 0}}`);
  s += `<g class="hv"><rect x="${X + 2}" y="${Y0 - 3}" width="${CW - 4}" height="${STEP - 3}" rx="5" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".22"/>` +
    `<path transform="translate(${X + 62} ${Y0 + 24})" d="M0 0V16L4 12.5L6.8 19L9.4 17.8L6.6 11.4H11.8Z" fill="#fff" stroke="#000" stroke-width="1" stroke-linejoin="round"/></g>`;
  css.push(`.hv{opacity:0;animation:hv ${LOOP}s step-end infinite}@keyframes hv{${kf.join('')}100%{transform:translateY(0);opacity:0}}`);
  return { svg: s, css: css.join('') };
}

/* ================================================================= pets */
function petsLayer(data, theme, P) {
  let svg = '', css = '', bub = '';
  data.pets.forEach((pet, i) => {
    const state = pick(pet.state, theme), y = pet.y ?? BASE, id = pet.id;
    const x = state === 'walking' ? pet.range[0] : pick(pet.x, theme);
    const lines = pick(pet.bubble, theme);
    let art, tip, side = 'c';
    if (state === 'typing') { art = typing({ id, skin: pet.skin, night: theme === 'night' }); tip = [x + 27, y - 100]; }
    else if (state === 'walking') { art = walking({ id, skin: pet.skin, range: pet.range }); tip = [0, y - 92]; }
    else { art = sleeping({ id, skin: pet.skin, grey: !!pet.grey }); tip = [x - 8, y - 92]; side = 'l'; }
    css += art.css;
    const inner = `<g shape-rendering="crispEdges" transform="translate(${x} ${y}) scale(${CELL})">${art.svg}</g>`;
    const b = lines ? bubble(`${id}b`, [].concat(lines), P, { side, start: .5 + i * .7 }) : null;
    if (b) css += b.css;
    const bsvg = b ? `<g transform="translate(${tip[0]} ${tip[1]})">${b.svg}</g>` : '';
    if (state === 'walking') {
      // pet and bubble share one stepped-translation group
      const tipX = x;
      svg += `<g class="${id}w">${inner}${b ? `<g transform="translate(${tipX} ${tip[1]})">${b.svg}</g>` : ''}</g>`;
    } else svg += inner + bsvg;
  });
  return { svg, css };
}

/* ================================================================= wordmark */
function wordmark(P) {
  const a = textCells('Marcel Moskwa', '#F4F1E8', 0, 0), b = textCells('marczelloo.dev', '#D97757', 0, 0);
  return `<g shape-rendering="crispEdges"><g transform="translate(152 170) scale(3)" opacity=".95">${cellsToSvg(a.cells)}</g><g transform="translate(152 204) scale(2)" opacity=".9">${cellsToSvg(b.cells)}</g><rect class="cur" x="${152 + b.width * 2 + 4}" y="206" width="8" height="14" fill="#D97757"/></g>`;
}

/* ================================================================= compose */
export function renderDesktop(data, theme) {
  const P = PAL[theme];
  const wp = wallpaper(theme, P);
  const rk = rack(theme, P, 706, 215);
  const tm = terminal(P);
  const ic = iconsLayer(data, theme);
  const pl = petsLayer(data, theme, P);

  let ground = `<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="${P.ground}"/><rect y="${GROUND}" width="${W}" height="2" fill="${P.edge}"/>`;
  const r = rngOf(5);
  for (let i = 0; i < 26; i++) ground += `<rect x="${Math.floor(r() * 420) * 2}" y="${GROUND + 8 + Math.floor(r() * 3) * 10}" width="${8 + Math.floor(r() * 3) * 4}" height="2" fill="${P.edge}" fill-opacity=".7"/>`;

  const css = wp.css + rk.css + tm.css + ic.css + pl.css + `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<title>Marcel's desktop</title>
<style>${css}</style>
<defs>${wp.defs}</defs>
${wp.svg}${ground}${rk.svg}${tm.svg}${wordmark(P)}${pl.svg}${ic.svg}
</svg>`;
  return svg;
}
