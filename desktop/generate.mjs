#!/usr/bin/env node
// Generates the "Marcel's desktop" README images. No dependencies, Node 20+.
//   node generate.mjs [--data data.json] [--out out] [--theme day|night|both]
// Data (pets, apps, clock, theme) lives in data.json; rendering lives in lib/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDesktop } from './lib/scene.mjs';
import { renderTaskbar } from './lib/taskbar.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const dataFile = path.resolve(here, arg('data', 'data.json'));
const outDir = path.resolve(here, arg('out', 'out'));
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const want = arg('theme', data.theme || 'both');
const themes = want === 'both' ? ['day', 'night'] : [want];

for (const theme of themes) {
  const dir = path.join(outDir, theme);
  fs.mkdirSync(dir, { recursive: true });
  const files = { desktop: renderDesktop(data, theme), ...renderTaskbar(data, theme).files };
  for (const [name, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name + '.svg'), svg, 'utf8');
    console.log(`${theme}/${name}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }
}
