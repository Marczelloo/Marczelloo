// Hand-drawn SVG icons: desktop file icons (48x48 boxes) and taskbar app icons (32x32 boxes).
// Every function takes an `id` prefix so gradient ids stay unique inside one SVG document.
import { buildPet } from './pets.mjs';
import { cellsToSvg } from './raster.mjs';

const arrowBadge = (x, y) => `<g transform="translate(${x} ${y})"><rect width="13" height="13" rx="2.5" fill="#fff" stroke="#1b2a41" stroke-opacity=".35"/><path d="M3.5 9.5 L9 4 M5 4 H9.5 V8.5" fill="none" stroke="#1a6fe0" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></g>`;

/** Desktop icon bodies, drawn in a 48x48 box. */
export const desktopIcons = {
  cs: id => `<defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD76E"/><stop offset="1" stop-color="#F0AE35"/></linearGradient></defs>
<path d="M4 11a4 4 0 0 1 4-4h10l4 4h18a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#D89A2B"/>
<rect x="4" y="16" width="40" height="25" rx="4" fill="url(#${id}f)"/>
<rect x="4.5" y="16.5" width="39" height="1" fill="#fff" fill-opacity=".35"/>
<path d="M24 19.5 L37 25.2 L24 31 L11 25.2z" fill="#203a62"/>
<path d="M16.5 28.2 v5.2 q7.5 4 15 0 v-5.2 L24 31.4z" fill="#2c4d82"/>
<path d="M35.6 26 v7" stroke="#F4F1E8" stroke-width="1.5" stroke-linecap="round"/><circle cx="35.6" cy="34.2" r="1.4" fill="#D97757"/>
${arrowBadge(3, 32)}`,

  cert: (id, accent, label) => `<defs><linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBFCFE"/><stop offset="1" stop-color="#E4E9F2"/></linearGradient></defs>
<path d="M11 3h18.5L40 13.5V43a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" fill="url(#${id}p)" stroke="#9aa6bb" stroke-opacity=".6"/>
<path d="M29.5 3v7.5a3 3 0 0 0 3 3H40z" fill="#C8D0DE"/>
<rect x="12" y="8" width="13" height="5" rx="1.2" fill="${accent}"/>
<text x="18.5" y="12.1" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="4.6" font-weight="700" fill="#fff">${label}</text>
<rect x="12" y="17" width="22" height="2" rx="1" fill="#9AA6BB" fill-opacity=".6"/><rect x="12" y="22" width="18" height="2" rx="1" fill="#9AA6BB" fill-opacity=".45"/><rect x="12" y="27" width="12" height="2" rx="1" fill="#9AA6BB" fill-opacity=".35"/>
<path d="M28 36.5l-2.6 8.2 4.6-2 2.4 3 1.4-8.4z" fill="#C0472E"/>
<circle cx="31.5" cy="35" r="7.2" fill="#F5B83D" stroke="#B9801A" stroke-width="1"/><circle cx="31.5" cy="35" r="4.6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>
<path d="M31.5 31.6l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#fff" fill-opacity=".92"/>`,

  url: id => `<defs><radialGradient id="${id}g" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#7fd4ff"/><stop offset=".6" stop-color="#2b86e6"/><stop offset="1" stop-color="#1b4fb0"/></radialGradient></defs>
<circle cx="24" cy="23" r="18.5" fill="url(#${id}g)"/>
<g fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.3"><ellipse cx="24" cy="23" rx="8" ry="18.5"/><path d="M5.5 23h37M8 14.5h32M8 31.5h32"/></g>
<path d="M13 15c3-2 6-2.5 8-1.5 1.5 1-.5 3-2 4s-1 3 1 3.5-.5 4-3 3.5-3-4-4-6-1-2.7 0-3.5zm17 6c2-1 5 0 6 2s0 5-2 6-4-1-4-3z" fill="#5FD18A" fill-opacity=".85"/>
<circle cx="24" cy="23" r="18.5" fill="none" stroke="#fff" stroke-opacity=".25"/>
${arrowBadge(3, 32)}`,

  exe: id => {
    const r = buildPet({ skin: 'clawd', face: 0, eyes: 'open' });
    return `<defs><linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46372F"/><stop offset="1" stop-color="#241B16"/></linearGradient></defs>
<rect x="3" y="3" width="42" height="42" rx="10" fill="url(#${id}t)"/><rect x="3.5" y="3.5" width="41" height="41" rx="9.5" fill="none" stroke="#fff" stroke-opacity=".14"/>
<path d="M3 36h42v1a8 8 0 0 1-8 8H11a8 8 0 0 1-8-8z" fill="#5DCAA5" fill-opacity=".14"/>
<g transform="translate(24 34.5) scale(1.9)" shape-rendering="crispEdges">${cellsToSvg(r.cells)}</g>`;
  },
};

/** Taskbar icons in a 32x32 box. */
const tile = (id, c1, c2, extra = '') => `<defs><linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect x="1" y="1" width="30" height="30" rx="8" fill="url(#${id}t)"/><rect x=".5" y=".5" width="31" height="31" rx="8.5" fill="none" stroke="#fff" stroke-opacity=".16"/>${extra}`;

export const appIcons = {
  mewbit: id => tile(id, '#7B6CFF', '#4637C9', `
<path d="M7.3 15.2 8 6.6l6.2 4.4zM24.7 15.2 24 6.6 17.8 11z" fill="#fff"/>
<ellipse cx="16" cy="18.6" rx="9.2" ry="7.6" fill="#fff"/>
<rect x="11.6" y="16" width="2" height="3.4" rx="1" fill="#3F32B8"/><rect x="18.4" y="16" width="2" height="3.4" rx="1" fill="#3F32B8"/>
<path d="M15 21.2l1 .9 1-.9z" fill="#E98FA5"/>
<path d="M6 19.5l4 .6M6 22l4-.8M26 19.5l-4 .6M26 22l-4-.8" stroke="#3F32B8" stroke-opacity=".5" stroke-width=".9" stroke-linecap="round"/>
<g fill="#FFD166"><ellipse cx="24.6" cy="9.4" rx="2" ry="1.5" transform="rotate(-18 24.6 9.4)"/><path d="M26.3 9.2V3.6l3 1.2" fill="none" stroke="#FFD166" stroke-width="1.3" stroke-linecap="round"/></g>`),

  atlashub: id => tile(id, '#27D3A2', '#087C8C', `
<g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round">
<ellipse cx="16" cy="9.6" rx="7.2" ry="2.8" fill="#fff" fill-opacity=".95" stroke="none"/>
<path d="M8.8 9.6v12.8c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8V9.6" fill="#fff" fill-opacity=".18"/>
<path d="M8.8 14.2c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8M8.8 18.3c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8"/></g>
<ellipse cx="16" cy="17" rx="13.4" ry="4.6" transform="rotate(-24 16 17)" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.1" stroke-dasharray="2.4 2.2"/>
<circle cx="26.8" cy="10.2" r="2" fill="#FFD166"/>`),

  dashboard: id => tile(id, '#2C2F40', '#161824', `
<rect x="5" y="5" width="10.5" height="10.5" rx="2.4" fill="#fff" fill-opacity=".08"/>
<rect x="7.4" y="11.2" width="1.9" height="2.8" rx=".6" fill="#D97757"/><rect x="10.1" y="8.8" width="1.9" height="5.2" rx=".6" fill="#D97757"/><rect x="12.8" y="9.9" width="1.9" height="4.1" rx=".6" fill="#F2AE92"/>
<rect x="16.5" y="5" width="10.5" height="10.5" rx="2.4" fill="#fff" fill-opacity=".08"/>
<circle cx="21.75" cy="10.25" r="3.2" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.8"/><path d="M21.75 7.05a3.2 3.2 0 0 1 3.2 3.2" fill="none" stroke="#5DCAA5" stroke-width="1.8" stroke-linecap="round"/>
<rect x="5" y="17.2" width="22" height="9.8" rx="2.4" fill="#fff" fill-opacity=".08"/>
<path d="M7.6 24.2l3.4-3.1 2.8 1.9 3.6-3.4 2.6 1.6 3-2.2" fill="none" stroke="#5DCAA5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`),

  'agent-pets': id => {
    const art = [
      '..kkkkkkkkkk..',
      '.kmmmmmmmmmmk.',
      '.kmhhhhhhhhmk.',
      'kkmmmmmmmmmmkk',
      'kmmmemmmmemmmk',
      'kmmmewmmewmmmk',
      'kkmxmmmmmmxmkk',
      '.kmmmmkkmmmmk.',
      '.kssssssssssk.',
      '..kkkkkkkkkk..',
    ];
    // the pet's real pixel palette
    const P = { k: '#2B1D16', m: '#D97757', s: '#B25D3D', h: '#F2AE92', e: '#1E1410', w: '#FFFFFF', x: '#F0997B' };
    let rects = '';
    art.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] !== '.') rects += `<rect x="${i * 2}" y="${j * 2}" width="2" height="2" fill="${P[row[i]]}"/>`; });
    return tile(id, '#4B3A31', '#241B16', `<g transform="translate(2 6)" shape-rendering="crispEdges">${rects}</g><rect x="4" y="27" width="24" height="2" rx="1" fill="#5DCAA5" fill-opacity=".9"/>`);
  },

  'agent-router-mcp': id => tile(id, '#2A2D3E', '#14161F', `
<g stroke="#fff" stroke-opacity=".38" stroke-width="1.4" stroke-linecap="round"><path d="M16 16L7.5 7.5M16 16l9-8.5M16 16l-8.5 9M16 16l9 8.5"/></g>
<g fill="none" stroke="#5DCAA5" stroke-width="1.5" stroke-linecap="round"><path d="M16 16L7.5 7.5" stroke-dasharray="2 2.4"/><path d="M16 16l9 8.5" stroke="#D97757" stroke-dasharray="2 2.4"/></g>
<circle cx="7.5" cy="7.5" r="2.7" fill="#5DCAA5"/><circle cx="25" cy="7.5" r="2.7" fill="#F1EFE8"/><circle cx="7.5" cy="25" r="2.7" fill="#F1EFE8"/><circle cx="25" cy="24.5" r="2.7" fill="#D97757"/>
<circle cx="16" cy="16" r="5" fill="#FAF9F5" stroke="#2B1D16" stroke-width="1.2"/><circle cx="16" cy="16" r="1.9" fill="#D97757"/>`),

  'marczelloo-dev': id => `<defs><linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8F1"/><stop offset="1" stop-color="#E7E1D3"/></linearGradient></defs>
<rect x="1" y="3" width="30" height="26" rx="5" fill="url(#${id}t)"/><rect x=".5" y="2.5" width="31" height="27" rx="5.5" fill="none" stroke="#000" stroke-opacity=".25"/>
<path d="M1 8a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v2H1z" fill="#2B1D16"/>
<circle cx="6" cy="6.5" r="1.1" fill="#D97757"/><circle cx="9.6" cy="6.5" r="1.1" fill="#EF9F27"/><circle cx="13.2" cy="6.5" r="1.1" fill="#5DCAA5"/>
<rect x="17" y="5.2" width="11" height="2.6" rx="1.3" fill="#fff" fill-opacity=".18"/>
<g shape-rendering="crispEdges" fill="#D97757"><path d="M8 24v-9h2.4l2.1 3.6 2.1-3.6H17v9h-2.2v-5.2l-1.7 2.8h-1.2l-1.7-2.8V24z"/></g>
<rect x="19.5" y="21.8" width="7" height="2.2" rx="1" fill="#5DCAA5"/>`,

  start: id => `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6FD3FF"/><stop offset="1" stop-color="#1F78E6"/></linearGradient></defs>
<g fill="url(#${id}s)"><rect x="3" y="3" width="12.2" height="12.2" rx="2"/><rect x="16.8" y="3" width="12.2" height="12.2" rx="2"/><rect x="3" y="16.8" width="12.2" height="12.2" rx="2"/><rect x="16.8" y="16.8" width="12.2" height="12.2" rx="2"/></g>`,
};
