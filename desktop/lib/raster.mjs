// Cell-grid rasteriser: ops -> Map("x,y" -> colour) -> merged <path> rectangles.
// Used to turn agent-pets' "pixel model" (rectangles on a grid) into compact SVG.
import { glyphOf } from './font.mjs';

export const SHADOW = 'SH'; // pseudo colour: black @ low alpha

export class Cells {
  constructor() { this.m = new Map(); }
  put(x, y, c) { this.m.set(x + ',' + y, c); }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.put(x + i, y + j, c); }
}

/** Merge cells of the given map into rectangles, grouped by colour. Returns [{c, d}] (cell units). */
export function toPaths(map) {
  const byColor = new Map();
  for (const [k, c] of map) {
    const [x, y] = k.split(',').map(Number);
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c).push([x, y]);
  }
  const out = [];
  for (const [c, pts] of byColor) {
    const rows = new Map();
    for (const [x, y] of pts) { if (!rows.has(y)) rows.set(y, []); rows.get(y).push(x); }
    const ys = [...rows.keys()].sort((a, b) => a - b);
    // horizontal runs
    const runs = new Map(); // y -> [[x,w]]
    for (const y of ys) {
      const xs = rows.get(y).sort((a, b) => a - b), rr = [];
      let s = xs[0], p = xs[0];
      for (let i = 1; i <= xs.length; i++) {
        if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
        rr.push([s, p - s + 1]);
        s = xs[i]; p = xs[i];
      }
      runs.set(y, rr);
    }
    // vertical merge of identical runs
    const rects = [];
    let open = new Map(); // "x:w" -> rect
    let prevY = null;
    for (const y of ys) {
      const next = new Map();
      for (const [x, w] of runs.get(y)) {
        const key = x + ':' + w, r = prevY === y - 1 ? open.get(key) : null;
        if (r) { r.h++; next.set(key, r); } else { const nr = { x, y, w, h: 1 }; rects.push(nr); next.set(key, nr); }
      }
      open = next; prevY = y;
    }
    out.push({ c, d: rects.map(r => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('') });
  }
  return out;
}

export function pathsToSvg(paths, { pal = {} } = {}) {
  return paths.map(({ c, d }) => {
    if (c === SHADOW) return `<path fill="#000" fill-opacity=".24" d="${d}"/>`;
    return `<path fill="${pal[c] ?? c}" d="${d}"/>`;
  }).join('');
}

/** Static scene of cells -> svg string (cell units; wrap in a scale group yourself). */
export function cellsToSvg(cells, opts) { return pathsToSvg(toPaths(cells.m), opts); }

/**
 * Animate a list of frames (Cells) shown one after another every `dt` seconds.
 * Cells identical in all frames become one static layer; the rest are split into
 * layers of identical content that are toggled with step-end opacity keyframes.
 * Returns { svg, css } (svg in cell units).
 */
export function animateFrames(frames, dt, id) {
  const N = frames.length, total = +(N * dt).toFixed(4);
  const key0 = new Set(frames[0].m.keys());
  const stat = new Map();
  for (const k of key0) {
    const c = frames[0].m.get(k);
    if (frames.every(f => f.m.get(k) === c)) stat.set(k, c);
  }
  const groups = new Map(); // sig -> {cells, on[]}
  frames.forEach((f, i) => {
    const diff = new Map();
    for (const [k, c] of f.m) if (!stat.has(k)) diff.set(k, c);
    if (!diff.size) return;
    const sig = [...diff].sort().map(e => e.join('=')).join(';');
    if (!groups.has(sig)) groups.set(sig, { cells: diff, on: new Array(N).fill(false) });
    groups.get(sig).on[i] = true;
  });
  let svg = pathsToSvg(toPaths(stat)), css = '';
  let gi = 0;
  for (const g of groups.values()) {
    const name = `${id}${gi++}`;
    svg += `<g class="${name}">${pathsToSvg(toPaths(g.cells))}</g>`;
    const stops = [];
    for (let i = 0; i < N; i++) if (i === 0 || g.on[i] !== g.on[i - 1]) stops.push(`${pct(i / N * 100)}{opacity:${g.on[i] ? 1 : 0}}`);
    css += `.${name}{opacity:${g.on[0] ? 1 : 0};animation:${name} ${total}s step-end infinite}@keyframes ${name}{${stops.join('')}}`;
  }
  return { svg, css, total };
}

export const pct = v => (+v.toFixed(3)) + '%';

/** Pixel-font text as cells. Returns Cells and width in px-units. */
export function textCells(text, c, x0 = 0, y0 = 0) {
  const cells = new Cells();
  let x = x0;
  for (const ch of text) {
    const g = glyphOf(ch);
    g.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') cells.put(x + i, y0 + j, c); });
    x += g[0].length + 1;
  }
  return { cells, width: x - x0 - 1 };
}
