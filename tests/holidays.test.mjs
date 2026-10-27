// SPDX-License-Identifier: GPL-3.0-or-later
//
// Prüft die Rechtslage in index.html gegen tests/golden-holidays.txt: jeder Feiertag
// 1991–2070, ohne und mit den optionalen Tagen, mit Datum, id, Name und Ländern.
// Die Golden-Datei stammt aus dem Code vor dem Umbau (Oktober 2026) – eine Abweichung
// ist entweder ein Fehler oder eine bewusste Gesetzesänderung; dann die Datei mit
//   node tests/holidays.test.mjs --update
// neu schreiben und den Diff im Commit begründen.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GOLDEN = join(ROOT, 'tests/golden-holidays.txt');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const m = html.match(/<script id="feiertage-daten">([\s\S]*?)<\/script>/);
if (!m) { console.error('holidays.test: <script id="feiertage-daten"> fehlt in index.html'); process.exit(1); }

const ctx = {}; vm.createContext(ctx); vm.runInContext(m[1], ctx);
const F = ctx.FEIERTAGE;
const lines = [];
for (const ex of [{ rm: false, ha: false, sv: false }, { rm: true, ha: true, sv: true }]) {
  lines.push(`# extras ${ex.rm ? 'alle' : 'keine'}`);
  for (let y = 1991; y <= 2070; y++) for (const h of F.holidays(y, ex))
    lines.push([h.k, h.id, h.n, [...h.full].sort().join(','), [...h.reg].sort().join(','), h.x ? 'x' : ''].join('|'));
}
const got = lines.join('\n') + '\n';

if (process.argv.includes('--update')) { writeFileSync(GOLDEN, got); console.log(`holidays.test: ${lines.length} Zeilen geschrieben`); process.exit(0); }

const want = readFileSync(GOLDEN, 'utf8');
if (got === want) { console.log(`holidays.test: ${lines.length} Zeilen wie golden`); process.exit(0); }
const g = got.split('\n'), w = want.split('\n');
let shown = 0;
for (let i = 0; i < Math.max(g.length, w.length) && shown < 10; i++) {
  if (g[i] !== w[i]) { console.error(`  Zeile ${i + 1}\n    erwartet: ${w[i] ?? '(nichts)'}\n    bekommen: ${g[i] ?? '(nichts)'}`); shown++; }
}
console.error('holidays.test: Rechtslage weicht von tests/golden-holidays.txt ab');
process.exit(1);
