// Port of agent-pets' "pixel model" (app/src/renderer/models/pixel.ts + sprites.ts) as a pure
// frame builder: pose parameters in, a Cells grid out. Dimensions use the same formulas as the
// original (units `u` -> grid cells with g = 6u, i.e. cells = units / 6), palettes are verbatim.
import { Cells, SHADOW } from './raster.mjs';

export const PROP_PAL = {
  k: '#2B1D16', l: '#D3D1C7', m: '#B4B2A9', s: '#888780', d: '#2C2C2A', t: '#5DCAA5',
  c: '#D97757', p: '#FAF9F5', b: '#85B7EB', y: '#EF9F27', w: '#FFFFFF', h: '#F2AE92', g: '#8C887E',
};
export const PIXEL_PAL = {
  clawd: { k: '#2B1D16', m: '#D97757', s: '#B25D3D', h: '#F2AE92', e: '#1E1410', w: '#FFFFFF', x: '#F0997B' },
  kodek: { k: '#2B1D16', m: '#F1EFE8', s: '#CBC6B8', h: '#FFFFFF', e: '#5DCAA5', w: '#2C2C2A', x: '#C9C7C1' },
};
export const GREY = { k: '#2B1D16', m: '#A8A49A', s: '#86837A', h: '#C9C6BD', e: '#1E1410', w: '#FFFFFF', x: '#A5A298' };
const BODY = { clawd: { w: 98, h: 58 }, kodek: { w: 88, h: 64 } };

// sprites copied verbatim from sprites.ts (only the ones used here)
export const SPRITES = {
  nightcap: ['......ww', '.....bww', '....bbb.', '..bbbbb.', '.bbbbbbb', 'wwwwwwww'],
  pillow: ['.kkkkkkkkkkkk.', 'kppppppppppppk', 'kppppppppppppk', '.kkkkkkkkkkkk.'],
  mug: ['kkk.', 'kyyk', 'kyyk', 'kkk.'],
  z: ['kkk', '..k', '.k.', 'k..', 'kkk'],
  spark: ['.y.', 'yyy', '.y.'],
  crown: ['y..y..y', 'yy.y.yy', 'yyyyyyy', 'ycyyycy'],
};

const U = units => Math.round(units / 6);              // units -> cells (g = 6u)
const n = (units, min = 1) => Math.max(min, U(units));  // like n() in pixel.ts

/** Nearest-neighbour sprite blit like `blit` in pixel.ts (one sprite px = 5u). */
export function blit(cells, rows, cx, cy, pu = 5, recolor) {
  const sw = rows[0].length, sh = rows.length, tw = n(sw * pu), th = n(sh * pu);
  for (let j = 0; j < th; j++) {
    const row = rows[Math.min(sh - 1, Math.floor(j * sh / th))];
    for (let i = 0; i < tw; i++) {
      const ch = row[Math.min(sw - 1, Math.floor(i * sw / tw))];
      if (ch !== '.') cells.put(cx + i, cy + j, recolor?.[ch] ?? PROP_PAL[ch]);
    }
  }
  return { w: tw, h: th };
}

function line(x0, y0, x1, y1, plot) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, k = 0;
  for (;;) {
    plot(x0, y0);
    if ((x0 === x1 && y0 === y1) || k++ > 200) return;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

/**
 * pose: {
 *   skin: 'clawd'|'kodek', grey?:bool,
 *   loaf?:bool (lying on the ground, body 10% shorter), sit?:bool (bottom=0, no legs),
 *   squash?: int cells removed from body height (breathing),
 *   walk?: 0|1 (leg lift parity, undefined = standing), bob?: 0|-1 (jump offset),
 *   face?: -1|0|1, eyes?: 'open'|'sleep'|'happy'|'blink'|'dizzy',
 *   hands?: [[x,y],[x,y]] hand centres (cells) or undefined (hanging), hang?: [dx,dy],
 *   ant?: -1|0|1 (kodek antenna), antGlow?:bool,
 *   pillow?: bool, wear?: 'nightcap'|'crown', mug?: bool, desk?: fn(cells) draws prop after body
 * }
 */
export function buildPet(pose) {
  const skin = pose.skin, B = BODY[skin];
  const pal = pose.grey ? GREY : PIXEL_PAL[skin];
  const c = new Cells();
  const bw = 2 * Math.round(U(B.w) / 2), half = bw / 2;
  const down = pose.loaf || pose.sit;
  const bh = Math.max(4, Math.round(U(B.h) * (pose.loaf ? .9 : 1)) - (pose.squash || 0));
  let bottom = down ? 0 : -2; // C(r.bot) = -12u/6
  if (pose.loaf) bottom = pose.restOnPillow ? -3 : 0;
  bottom += pose.bob || 0;
  const by = bottom - bh, bx = -half;
  const legs = down ? 0 : -(-2);

  // shadow, pillow
  c.rect(-half - (pose.pillow ? 3 : 0), 0, bw + (pose.pillow ? 6 : 0), 1, SHADOW);
  if (pose.pillow) {
    const pw = bw + 6, ph = 4;
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const edge = j === 0 || j === ph - 1 || i === 0 || i === pw - 1;
      const corner = (i === 0 || i === pw - 1) && (j === 0 || j === ph - 1);
      if (!corner) c.put(-half - 3 + i, -ph + j, edge ? PROP_PAL.k : PROP_PAL.p);
    }
  }

  // legs
  if (legs > 0) {
    const lx = skin === 'clawd' ? [-.33, -.12, .12, .33] : [-.25, .25], lw = n(skin === 'clawd' ? 10 : 16, 2);
    lx.forEach((l, i) => {
      const up = pose.walk !== undefined && (pose.walk + i) % 2 ? 1 : 0;
      let x = Math.round(l * bw) - (lw >> 1);
      if (skin === 'kodek') x = i === 0 ? -5 : 2; // symmetrised about the body centre
      c.rect(x, bottom, lw, legs - up, pal.s);
    });
  }
  // clawd ears
  if (skin === 'clawd') {
    const ew = n(4, 1), eh = n(16, 2), ey = by + Math.round(bh * .4);
    c.rect(bx - ew - 1, ey, ew + 1, eh, pal.k); c.rect(bx + bw, ey, ew + 1, eh, pal.k);
    c.rect(bx - ew, ey + 1, ew, eh - 2, pal.m); c.rect(bx + bw, ey + 1, ew, eh - 2, pal.m);
  }
  // body
  c.rect(bx + 1, by, bw - 2, bh, pal.k);
  c.rect(bx, by + 1, bw, bh - 2, pal.k);
  c.rect(bx + 1, by + 1, bw - 2, bh - 2, pal.m);
  c.rect(bx + 1, by + bh - 1 - n(6), bw - 2, n(6), pal.s);
  c.rect(bx + 2, by + 2, Math.max(1, bw - 5), 1, pal.h);

  // face
  const fx = pose.face || 0, e = pose.eyes || 'open';
  if (skin === 'kodek') {
    const m = n(9, 2);
    c.rect(bx + m, by + m, bw - 2 * m, bh - 2 * m - 1, pal.w);
    const pw = n(6, 2), ph = Math.round(bh * .35);
    c.rect(bx - pw + 1, by + Math.round(bh * .32), pw, ph, pal.x); c.rect(bx + bw - 1, by + Math.round(bh * .32), pw, ph, pal.x);
    const ax = pose.ant || 0, al = n(12, 2), ab = n(6, 2);
    c.rect(ax, by - al, 1, al, pal.k); c.rect(ax - (ab >> 1), by - al - ab, ab, ab, pose.antGlow ? '#A8EBD2' : pal.e);
  }
  const eW = n(6, 1), eH = n(12, 2), fy = by + Math.round(bh * (skin === 'clawd' ? .3 : .34));
  const eye = ex => {
    if (e === 'happy') { c.put(ex - 1, fy + 1, pal.e); c.rect(ex, fy, eW, 1, pal.e); c.put(ex + eW, fy + 1, pal.e); return; }
    if (e === 'dizzy') { c.put(ex, fy, pal.e); c.put(ex + eW, fy, pal.e); c.put(ex, fy + 2, pal.e); c.put(ex + eW, fy + 2, pal.e); return; }
    if (e === 'sleep' || e === 'blink') { c.rect(ex - 1, fy + (eH >> 1), eW + 2, 1, pal.e); return; }
    c.rect(ex, fy, eW, eH, pal.e);
    if (skin === 'clawd') c.put(ex + eW - 1, fy, pal.w);
  };
  const eo = Math.round(bw * .2);
  eye(fx - eo - eW + 1); eye(fx + eo);
  if (skin === 'clawd') {
    const my = fy + eH + 1;
    if (e === 'open' || e === 'blink') { c.put(fx - 1, my, pal.e); c.rect(fx, my + 1, 2, 1, pal.e); c.put(fx + 2, my, pal.e); }
    const bl = n(6, 2);
    c.rect(fx - eo - eW - bl + 1, my - 1, bl, 1, pal.x); c.rect(fx + eo + eW, my - 1, bl, 1, pal.x);
  }

  // prop (desk etc.) is drawn between body and paws, like in the original
  if (pose.prop) pose.prop(c);

  // paws
  const brush = n(7, 1), hand = n(10, 2);
  const shY = by + Math.round(bh * .52);
  const sh = [[-Math.round(bw / 2) + (skin === 'kodek' ? 0 : 0), shY], [Math.round(bw / 2) - (skin === 'kodek' ? 1 : 0), shY]];
  const hang = pose.hang || [1, 2];
  const hands = pose.hands || [[sh[0][0] - hang[0], sh[0][1] + hang[1]], [sh[1][0] + hang[0], sh[1][1] + hang[1]]];
  hands.forEach(([hx, hy], i) => {
    const [sx, sy] = sh[i];
    line(sx, sy, hx, hy, (px, py) => c.put(px, py, pal.m));
    c.rect(hx - (hand >> 1), hy - (hand >> 1), hand, hand, pal.k);
    if (pose.handFill) c.rect(hx - (hand >> 1) + 1, hy - (hand >> 1) + 1, hand - 2, hand - 2, pal.m);
  });
  if (pose.mug) { const [hx, hy] = hands[1]; blit(c, SPRITES.mug, hx - 1, hy - 4); }

  // worn item
  if (pose.wear === 'nightcap') {
    const s = SPRITES.nightcap, w = n(s[0].length * 5), h = n(s.length * 5);
    blit(c, s, -(w >> 1) + n(4) - 1, by - h + n(4));
  } else if (pose.wear === 'crown') {
    const s = SPRITES.crown, w = n(s[0].length * 5), h = n(s.length * 5);
    blit(c, s, -(w >> 1), by - h + 1);
  }
  return { cells: c, top: by, bw, bh };
}

/** Custom pixel desk drawn at native cell resolution, same palette as the original desk/crt sprites. */
export function drawDesk(c, { x0 = -6, screen = [], tableY = -3 } = {}) {
  const P = PROP_PAL;
  // monitor (right of the pet)
  const mx = 11, my = -17, mw = 13, mh = 11;
  c.rect(mx, my, mw, mh, P.k);
  c.rect(mx + 1, my + 1, mw - 2, mh - 2, P.l);
  c.rect(mx + 2, my + 2, mw - 4, mh - 4, P.d); // 9x7 screen
  c.rect(mx + 1, my + 1, mw - 2, 1, '#E8E6DE');
  // stand
  c.rect(mx + 5, my + mh, 3, 2, P.k); c.put(mx + 6, my + mh, P.s);
  c.rect(mx + 3, my + mh + 2, 7, 1, P.k);
  // screen content: rows of [x, w, colour]
  screen.forEach((ln, j) => {
    if (!ln) return;
    ln.forEach(([sx, sw, col]) => c.rect(mx + 2 + sx, my + 2 + j, sw, 1, col));
  });
  // table (3 rows) + legs
  const ty = tableY, x1 = mx + mw + 3;
  c.rect(x0, ty, x1 - x0, 3, P.k);
  c.rect(x0 + 1, ty + 1, x1 - x0 - 2, 1, P.s);
  c.rect(x0 + 1, ty, x1 - x0 - 2, 1, '#9C9A93');
  // keyboard
  c.rect(-6, ty - 1, 12, 1, P.k); c.rect(-5, ty - 1, 10, 1, P.d);
  // mouse
  c.rect(8, ty - 1, 2, 1, P.k);
}
