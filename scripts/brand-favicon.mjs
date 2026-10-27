// Writes public/favicon.svg: the pixel-spiral brand mark of
// src/components/site/BrandMark.astro, with fixed colours on a dark tile.
// Run: node scripts/brand-favicon.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PATH = [];
const run = (r, c, dr, dc, n) => {
  for (let i = 0; i < n; i++) PATH.push([r + dr * i, c + dc * i]);
};
run(0, 0, 0, 1, 5);
run(1, 4, 1, 0, 4);
run(4, 3, 0, -1, 4);
run(3, 0, -1, 0, 2);
run(2, 1, 0, 1, 1);
const CELL = 5.8;
const SIZE = 4.6;
const at = (n) => 1.5 + n * CELL + (CELL - SIZE) / 2;
const op = (i) => (0.38 + 0.62 * (i / (PATH.length - 1)) ** 1.3).toFixed(2);

const rects = PATH.map(([r, c], i) => `<rect x="${at(c).toFixed(2)}" y="${at(r).toFixed(2)}" width="${SIZE}" height="${SIZE}" rx="1" fill="#6FE3EE" fill-opacity="${op(i)}"/>`).join('');
const pearl = `<circle cx="${(at(2) + SIZE / 2).toFixed(2)}" cy="${(at(2) + SIZE / 2).toFixed(2)}" r="${SIZE / 2}" fill="#E8C0B2"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0A0B0D"/>${rects}${pearl}</svg>\n`;
writeFileSync(fileURLToPath(new URL('../public/favicon.svg', import.meta.url)), svg);
