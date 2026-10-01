// Pet animation assemblers: typing at a desk, walking back and forth, sleeping on a pillow.
// Every function returns { svg, css } in *cell units* (the caller wraps it in scale(CELL)).
// All timelines are N frames of DT seconds = LOOP seconds, so every pet loops in sync.
import { Cells, animateFrames } from './raster.mjs';
import { buildPet, drawDesk, blit, SPRITES } from './pets.mjs';

export const N = 120, DT = 0.2, LOOP = N * DT; // 24 s
export const CELL = 5; // px per cell in the final SVG

/* ---------------------------------------------------------------- typing at a desk */
const TEAL = '#5DCAA5', ORANGE = '#D97757', WHITE = '#E8E6DE', GREY = '#8C887E';
const CODE = [ // monitor lines [x, w, colour], screen is 9 x 7 cells
  [[0, 3, TEAL], [4, 4, WHITE]], [[2, 5, ORANGE]], [[2, 3, WHITE], [6, 2, TEAL]], [[0, 2, TEAL], [3, 5, GREY]],
  [[2, 6, ORANGE]], [[4, 4, WHITE]], [[0, 4, TEAL], [5, 3, ORANGE]], [[2, 2, WHITE], [5, 3, TEAL]],
  [[2, 4, GREY], [7, 1, WHITE]], [[0, 3, ORANGE], [4, 3, TEAL]],
];

export function typing({ id, skin = 'clawd', night = false }) {
  const pets = [], screens = [];
  for (let f = 0; f < N; f++) {
    const burst = f % 30 < 18, par = f & 1;
    const sip = night && f >= 72 && f <= 79;
    const blink = [11, 12, 53, 54, 96, 97].includes(f);
    const happy = !night && f >= 100 && f <= 103;
    const l = burst && par ? -1 : 0, r = burst && !par ? -1 : 0;
    pets.push(buildPet({
      skin, face: 1, bob: -2,
      eyes: sip || blink ? 'blink' : happy ? 'happy' : 'open',
      hands: [[-4, -4 + l], sip ? [7, -6] : [5, -4 + r]],
      mug: sip,
      prop: c => drawDesk(c, { x0: -11 }),
    }).cells);
    const sc = new Cells(), s = Math.floor(f / 6) % CODE.length;
    for (let j = 0; j < 7; j++) for (const [sx, sw, col] of CODE[(s + j) % CODE.length]) sc.rect(13 + sx, -15 + j, sw, 1, col);
    screens.push(sc);
  }
  const a = animateFrames(pets, DT, id + 'p'), b = animateFrames(screens, DT, id + 's');
  return { svg: a.svg + b.svg, css: a.css + b.css };
}

/* ---------------------------------------------------------------- walking back and forth */
/** range = [x0, x1] px. Returns css for the translate class `${id}w` in addition to the sprite. */
export function walking({ id, skin = 'kodek', range }) {
  const P = Math.round((range[1] - range[0]) / CELL);
  const idleA = 8, idleB = 18, idleC = N - idleA - idleB - 2 * P;
  if (idleC < 6) throw new Error('walk range too long for the loop');
  const frames = [], mv = []; // mv[f] = index of translate step or -1
  for (let f = 0; f < N; f++) {
    let face = 0, j = -1, glow = false;
    if (f < idleA) face = f < 4 ? 0 : 1;
    else if (f < idleA + P) { face = 1; j = f - idleA; }
    else if (f < idleA + P + idleB) {
      const k = f - idleA - P; face = k < 6 ? 1 : k < 12 ? 0 : -1; glow = k >= 3 && k <= 9 && k % 2 === 1;
    } else if (f < idleA + P + idleB + P) { face = -1; j = f - (idleA + P + idleB); }
    else { const k = f - (idleA + 2 * P + idleB); face = k > idleC - 5 ? 0 : -1; }
    mv.push(j);
    frames.push(buildPet({
      skin, face, walk: j >= 0 ? j & 1 : undefined,
      ant: [0, 1, 0, -1][Math.floor(f / 5) % 4], antGlow: glow,
      eyes: [30, 31, 80, 81, 108].includes(f) ? 'blink' : 'open',
    }).cells);
  }
  const a = animateFrames(frames, DT, id + 'p');
  const pc = f => +(f / N * 100).toFixed(3) + '%', d = P * CELL;
  const t1 = idleA, t2 = idleA + P, t3 = t2 + idleB, t4 = t3 + P;
  const css = `.${id}w{animation:${id}w ${LOOP}s infinite}@keyframes ${id}w{0%{transform:translateX(0)}` +
    `${pc(t1)}{transform:translateX(0);animation-timing-function:steps(${P},end)}` +
    `${pc(t2)}{transform:translateX(${d}px)}` +
    `${pc(t3)}{transform:translateX(${d}px);animation-timing-function:steps(${P},end)}` +
    `${pc(t4)}{transform:translateX(0)}100%{transform:translateX(0)}}`;
  return { svg: a.svg, css: a.css + css, steps: P };
}

/* ---------------------------------------------------------------- sleeping on a pillow */
export function sleeping({ id, skin = 'clawd', grey = false }) {
  const frames = [];
  for (let f = 0; f < N; f++) {
    frames.push(buildPet({
      skin, grey, loaf: true, eyes: 'sleep', pillow: true, restOnPillow: true, wear: 'nightcap',
      squash: f % 24 < 12 ? 0 : 1,
    }).cells);
  }
  const a = animateFrames(frames, DT, id + 'p');
  // floating z's: stepped rise (pixel feel), fade in/out, staggered by a third of the 4.8 s cycle
  const rec = { k: '#F1EFE8' };
  let zs = '', css = '';
  [[4, 0], [5, 1], [6, 2]].forEach(([pu, i]) => {
    const g = new Cells();
    blit(g, SPRITES.z, 0, 0, pu, rec);
    // dark outline-free light z needs a faint shadow to stay readable on bright skies
    const sh = new Cells();
    blit(sh, SPRITES.z, 1, 1, pu, { k: '#1b1522' });
    zs += `<g class="${id}z${i}"><g transform="translate(${6 + i * 2} -17)">${cellsStr(sh)}${cellsStr(g)}</g></g>`;
    css += `.${id}z${i}{opacity:0;animation:${id}z ${LOOP / 5}s steps(10,end) infinite;animation-delay:-${(i * 1.6).toFixed(1)}s}`;
  });
  css += `@keyframes ${id}z{0%{transform:translate(0,0);opacity:0}12%{opacity:1}80%{opacity:1}100%{transform:translate(6px,-12px);opacity:0}}`;
  return { svg: a.svg + zs, css: a.css + css };
}

import { cellsToSvg } from './raster.mjs';
const cellsStr = c => cellsToSvg(c);
