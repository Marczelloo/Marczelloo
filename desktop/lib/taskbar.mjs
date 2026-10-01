// Taskbar: a floating rounded bar cut into separate SVG segments (one <img>/link each).
// Segments are laid out as: fill-l | start | app x N | fill-r | tray  (widths sum to the desktop width).
import { appIcons } from './icons.mjs';
import { LOOP } from './anim.mjs';

const FONT = `'Segoe UI Variable','Segoe UI',system-ui,-apple-system,Roboto,'Helvetica Neue',Arial,sans-serif`;
export const SEG_H = 52, BAR_Y = 6, BAR_H = 44, R = 11;
export const AGENT_COLOR = { clawd: '#D97757', kodek: '#5DCAA5', true: '#5DCAA5' };

const BAR = {
  night: { fill: '#17161e', stroke: '#ffffff', so: .10, text: '#F1EFE8', sub: '#9d9a90', tile: .07 },
  day: { fill: '#1b2133', stroke: '#ffffff', so: .13, text: '#F1EFE8', sub: '#a9b0c2', tile: .08 },
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Segment widths for the 840-wide base layout. */
export function layout(apps, W = 840) {
  const start = 56, app = 56, tray = 170, fillR = 54;
  const fillL = W - start - app * apps.length - fillR - tray;
  return { fillL, start, app, fillR, tray, total: fillL + start + app * apps.length + fillR + tray };
}

function bar(w, kind, B) {
  const y0 = BAR_Y, y1 = BAR_Y + BAR_H, r = R;
  let fill, edge;
  if (kind === 'l') {
    fill = `M${w} ${y0}H${r}A${r} ${r} 0 0 0 0 ${y0 + r}V${y1 - r}A${r} ${r} 0 0 0 ${r} ${y1}H${w}Z`;
    edge = `M${w} ${y0 + .5}H${r}A${r - .5} ${r - .5} 0 0 0 .5 ${y0 + r}V${y1 - r}A${r - .5} ${r - .5} 0 0 0 ${r} ${y1 - .5}H${w}`;
  } else if (kind === 'r') {
    fill = `M0 ${y0}H${w - r}A${r} ${r} 0 0 1 ${w} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${w - r} ${y1}H0Z`;
    edge = `M0 ${y0 + .5}H${w - r}A${r - .5} ${r - .5} 0 0 1 ${w - .5} ${y0 + r}V${y1 - r}A${r - .5} ${r - .5} 0 0 1 ${w - r} ${y1 - .5}H0`;
  } else {
    fill = `M0 ${y0}H${w}V${y1}H0Z`;
    edge = `M0 ${y0 + .5}H${w}M0 ${y1 - .5}H${w}`;
  }
  return `<path d="${fill}" fill="${B.fill}"/><path d="${edge}" fill="none" stroke="${B.stroke}" stroke-opacity="${B.so}"/>`;
}

function segment(w, kind, B, inner, css = '', defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${SEG_H}" viewBox="0 0 ${w} ${SEG_H}">
<style>${css}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>${defs ? `<defs>${defs}</defs>` : ''}
${bar(w, kind, B)}${inner}
</svg>`;
}

const pick = (v, theme) => (v && typeof v === 'object' && ('day' in v || 'night' in v)) ? v[theme] : v;

function weatherIcon(theme) {
  if (theme === 'day') {
    let r = '';
    for (let i = 0; i < 8; i++) r += `<rect x="9" y="-1" width="2" height="3.5" rx="1" fill="#FFC857" transform="rotate(${i * 45} 10 10)"/>`;
    return `<g transform="translate(16 16)"><circle cx="10" cy="10" r="5" fill="#FFC857"/>${r}</g>`;
  }
  return `<g transform="translate(16 16)"><path d="M13.5 2.5a8 8 0 1 0 5 12.6A7 7 0 0 1 13.5 2.5z" fill="#E7E3D6"/><rect x="16" y="3" width="1.8" height="1.8" fill="#fff"/><rect x="19" y="8" width="1.4" height="1.4" fill="#fff"/></g>`;
}

export function renderTaskbar(data, theme) {
  const B = BAR[theme], apps = data.apps, L = layout(apps, data.width || 840), out = {};
  const clock = pick(data.clock, theme), weather = pick(data.weather, theme);
  const [wTemp, wSub] = String(weather).split('|');

  out['tb-fill-l'] = segment(L.fillL, 'l', B,
    `${weatherIcon(theme)}<text x="48" y="25" font-family="${FONT}" font-size="12.5" font-weight="600" fill="${B.text}">${esc(wTemp)}</text><text x="48" y="38" font-family="${FONT}" font-size="10.5" fill="${B.sub}">${esc(wSub || '')}</text>`);

  const startIcon = `<g transform="translate(${(L.start - 20) / 2} ${(SEG_H - 20) / 2}) scale(.625)">${appIcons.start('st')}</g>`;
  out['tb-start'] = segment(L.start, 'm', B, startIcon);

  for (const app of apps) {
    const active = pick(app.active, theme), col = AGENT_COLOR[String(active)] || null;
    const id = 'a' + app.id.replace(/[^a-z0-9]/gi, '');
    let inner = '', css = '';
    if (col) {
      inner += `<rect x="5" y="9" width="${L.app - 10}" height="${BAR_H - 6}" rx="8" fill="#fff" fill-opacity="${B.tile}"/>`;
      inner += `<rect class="ul" x="${(L.app - 16) / 2}" y="44" width="16" height="3" rx="1.5" fill="${col}"/>`;
      css += `.ul{transform-box:fill-box;transform-origin:50% 50%;animation:ul 3s ease-in-out infinite}@keyframes ul{0%,100%{transform:scaleX(.55)}50%{transform:scaleX(1)}}`;
    }
    inner += `<g transform="translate(${(L.app - 28) / 2} 13) scale(.875)">${appIcons[app.id](id)}</g>`;
    out['tb-' + app.id] = segment(L.app, 'm', B, inner, css);
  }

  out['tb-fill-r'] = segment(L.fillR, 'm', B, '');

  // tray: language, wifi + volume, clock/date
  const [d, m, y] = (() => { const t = String(data.date).split('-'); return [t[2], t[1], t[0]]; })();
  const lang = data.lang || ['POL', 'PL'];
  const tw = L.tray;
  const tray = `<text x="14" y="23" font-family="${FONT}" font-size="10.5" fill="${B.text}">${esc(lang[0])}</text><text x="14" y="36" font-family="${FONT}" font-size="10.5" fill="${B.text}">${esc(lang[1])}</text>
<g transform="translate(46 17)" fill="none" stroke="${B.text}" stroke-width="1.6" stroke-linecap="round"><path d="M1 6.5a9 9 0 0 1 14 0M3.6 9.4a5.4 5.4 0 0 1 8.8 0"/><circle cx="8" cy="12.4" r="1.2" fill="${B.text}" stroke="none"/></g>
<g transform="translate(70 17)" fill="none" stroke="${B.text}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5.5h3l4-3.5v11l-4-3.5H1z" fill="${B.text}" stroke="none"/><path d="M10.6 4.4a4.6 4.6 0 0 1 0 6.2M12.6 2.4a7.4 7.4 0 0 1 0 10.2"/></g>
<g font-family="${FONT}" fill="${B.text}" text-anchor="end"><text x="${tw - 14}" y="23" font-size="12">${esc(clock)}</text><text x="${tw - 14}" y="36" font-size="11">${d}.${m}.${y}</text></g>`;
  out['tb-tray'] = segment(L.tray, 'r', B, tray);

  return { files: out, layout: L };
}
