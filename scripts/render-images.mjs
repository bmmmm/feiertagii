// Rendert die Bilddateien des Repos neu: favicon.ico, apple-touch-icon.png,
// og.png und die README-Bilder unter docs/. Quellen sind favicon.svg,
// scripts/og.html und index.html selbst – nach einer Designänderung einmal laufen
// lassen und die Bilder mit committen.
//
// Braucht Playwright mit Chromium, das Repo selbst hat keine Abhängigkeiten:
//   PLAYWRIGHT=/pfad/zu/node_modules/playwright node scripts/render-images.mjs
// (ohne PLAYWRIGHT wird `playwright` normal aufgelöst)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT ? pathToFileURL(join(process.env.PLAYWRIGHT, 'index.mjs')).href : 'playwright');
const url = p => pathToFileURL(join(ROOT, p)).href;

const browser = await chromium.launch();

// page: Datei im Repo, hash: Auswahl per URL (#jahr=…&land=…&linie=…), css: nur für das Bild
async function shot(file, { page: target, hash = '', html, width, height, scheme = 'light', scale = 1, clip, el, pad = 0, transparent = false, css }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, colorScheme: scheme, locale: 'de-DE' });
  const page = await ctx.newPage();
  if (target) await page.goto(url(target) + hash);
  else await page.setContent(html);
  if (css) await page.addStyleTag({ content: css });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  // el: Ausschnitt von oben bis zur Unterkante dieses Elements (plus pad), bzw. nur das Element
  if (el) clip = await page.evaluate(([sel, pad, top]) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    if (top) return { x: 0, y: 0, width: document.documentElement.clientWidth, height: Math.ceil(r.bottom + pad) };
    const x = Math.floor(r.left - pad), y = Math.floor(r.top - pad);
    return { x, y, width: Math.ceil(r.right + pad) - x, height: Math.ceil(r.bottom + pad) - y };
  }, [el.sel, pad, el.fromTop]);
  const buf = await page.screenshot({ clip, fullPage: !!el, omitBackground: transparent, animations: 'disabled' });
  await ctx.close();
  if (file) writeFileSync(join(ROOT, file), buf);
  return buf;
}

// Favicon aus favicon.svg; fürs Apple-Icon flächig auf Schildgelb, iOS rundet die Ecken selbst
const svg = readFileSync(join(ROOT, 'favicon.svg'), 'utf8');
const icon = (size, bleed) => `<body style="margin:0;background:${bleed ? '#ffd400' : 'transparent'}">` +
  `<div style="width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body>`;

const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await shot(null, { html: icon(s, false), width: s, height: s, clip: { x: 0, y: 0, width: s, height: s }, transparent: true }));
// ICO mit eingebetteten PNGs: 6 Byte Kopf, je Bild 16 Byte Verzeichnis, dann die Daten
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = head.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(pngs[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += pngs[i].length;
});
writeFileSync(join(ROOT, 'favicon.ico'), Buffer.concat([head, ...pngs]));

await shot('apple-touch-icon.png', { html: icon(180, true), width: 180, height: 180 });
await shot('og.png', { page: 'scripts/og.html', width: 1200, height: 630 });

// README: Kopf mit Abfahrtstafel, Netzplan und Fahrplan, je in beiden Farbschemata.
// Die Auswahl kommt über den URL-Hash, die klebende Auswahlleiste bleibt in Ausschnitten weg.
mkdirSync(join(ROOT, 'docs'), { recursive: true });
const noBar = '.bar{display:none!important}';
for (const scheme of ['light', 'dark']) {
  await shot(`docs/screenshot-${scheme}.png`, { page: 'index.html', hash: '#jahr=2026&land=BY', width: 1200, height: 900, scheme, el: { sel: '#board', fromTop: true }, pad: 24 });
  await shot(`docs/netz-${scheme}.png`, { page: 'index.html', hash: '#jahr=2026&land=BY&linie=fronleichnam', width: 1200, height: 900, scheme, css: noBar, el: { sel: '#netz', fromTop: false }, pad: 12 });
  await shot(`docs/fahrplan-${scheme}.png`, { page: 'index.html', hash: '#jahr=2026&linie=einheit', width: 1200, height: 900, scheme, css: noBar, el: { sel: '#takt', fromTop: false }, pad: 12 });
}

await browser.close();
console.log('ok: favicon.ico, apple-touch-icon.png, og.png, docs/{screenshot,netz,fahrplan}-{light,dark}.png');
