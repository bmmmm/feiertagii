// SPDX-License-Identifier: GPL-3.0-or-later
//
// Prüft die Brückentage-Rechnung in index.html (<script id="brueckentage">): feste Fälle,
// deren Kalenderlage sich von Hand nachrechnen lässt, dazu Invarianten über alle Jahre
// 1991–2070 und alle Länder und den Urlaubsplaner gegen eine vollständige Suche – auch nach
// Monaten gerechnet, mit Urlaub ohne Feiertag.
//   node tests/bridges.test.mjs

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const ctx = {}; vm.createContext(ctx);
for (const id of ['feiertage-daten', 'brueckentage']) {
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`));
  if (!m) { console.error(`bridges.test: <script id="${id}"> fehlt in index.html`); process.exit(1); }
  vm.runInContext(m[1], ctx);   // ohne window und document: die Rechnung darf kein DOM brauchen
}
const F = ctx.FEIERTAGE, B = ctx.BRUECKEN;

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; if (fails <= 25) console.error('  ✗ ' + msg); } };
const eq = (got, want, msg) => ok(JSON.stringify(got) === JSON.stringify(want), `${msg}\n      erwartet: ${JSON.stringify(want)}\n      bekommen: ${JSON.stringify(got)}`);

const NOEX = { rm: false, ha: false, sv: false };
const MOFR = [false, true, true, true, true, true, false];
const jahr = y => ({ von: new Date(y, 0, 1), bis: new Date(y + 1, 0, 1) });
const run = (y, land, o = {}) => B.rechne({ land, ex: NOEX, ...jahr(y), ...o });
const k = d => F.key(d);
// Fahrkarte kurz: „u>f@erster Urlaubstag“
const tk = c => `${c.u}>${c.f}@${k(c.urlaub[0])}`;
const tix = R => R.T.map(t => tk(t.best));
const find = (R, day) => R.T.find(t => t.V.some(v => v.urlaub.some(d => k(d) === day)));

// --- Feste Fälle ---------------------------------------------------------------------------
{ // Bayern 2026: Neujahr Do, Himmelfahrt 14.5. Do, Fronleichnam 4.6. Do, Ostern 3.–6.4., Weihnachten Fr 25.12.
  const R = run(2026, 'BY');
  eq(R.base, 7 / 5, 'BY 2026: Grundwert 7/5');
  eq(tix(R), ['1>4@2026-01-02', '1>4@2026-05-15', '1>4@2026-06-05', '4>10@2026-03-30', '4>10@2026-12-28', '4>9@2026-04-27', '4>9@2026-05-26'], 'BY 2026: Fahrkarten nach Hebel');
  const nj = R.T[0];
  eq(nj.V.map(tk), ['1>4@2026-01-02', '1>4@2026-01-05', '2>6@2026-01-02', '4>9@2026-01-05'], 'BY 2026 Neujahr: Varianten mit Drei Könige (Di 6.1.)');
  eq(nj.def, 0, 'BY 2026 Neujahr: vorgewählt ist die beste');
  const os = R.T[3];
  eq(os.V.map(v => `${tk(v)}..${k(v.bis)}`), ['4>10@2026-03-30..2026-04-06', '4>10@2026-04-07..2026-04-12'], 'BY 2026 Ostern: Woche davor oder danach');
}
{ // Jahreswechsel: Weihnachten 2026 reicht bis So 3.1.2027, gehört aber zu 2026 (erster Urlaubstag Mo 28.12.)
  const R6 = run(2026, 'BY'), R7 = run(2027, 'BY'), w = find(R6, '2026-12-28');
  ok(w && k(w.best.bis) === '2027-01-03', 'BY 2026: Weihnachten endet So 3.1.2027');
  ok(!R7.C.some(c => c.urlaub.some(d => d.getFullYear() === 2026 && +c.urlaub[0] < +new Date(2027, 0, 1))), 'BY 2027: keine Brücke, deren Urlaub 2026 beginnt');
  eq(R7.T.find(t => k(t.best.von) === '2027-01-01').V.map(tk), ['2>6@2027-01-04', '4>10@2027-01-04'], 'BY 2027: Neujahr (Fr) + Drei Könige (Mi)');
}
{ // Berlin 2026 mit Heiligabend und Silvester: Do 24.12. bis So 3.1. für drei Urlaubstage (Mo–Mi 28.–30.12.)
  const R = run(2026, 'BE', { ex: { rm: false, ha: true, sv: true } });
  const w = find(R, '2026-12-28');
  eq(w && tk(w.best), '3>11@2026-12-28', 'BE 2026 + HA/SV: Weihnachten 3 → 11');
  eq(w && [k(w.best.von), k(w.best.bis)], ['2026-12-24', '2027-01-03'], 'BE 2026 + HA/SV: 24.12.–3.1.');
  eq(w && w.best.hs.map(h => h.id), ['heiligabend', 'weihnachten-1', 'weihnachten-2', 'silvester', 'neujahr'], 'BE 2026 + HA/SV: Feiertage der Strecke');
  // Silvester 2025 (Mi) + Neujahr (Do), Brücke Fr 2.1.2026 → gehört zu 2026
  eq(tix(R)[0], '1>5@2026-01-02', 'BE 2026 + HA/SV: Silvester bis So 4.1., beste Brücke');
  ok(!run(2026, 'BE').C.some(c => k(c.urlaub[0]) === '2026-12-28' && c.f === 11), 'BE 2026 ohne HA/SV: kein 3 → 11');
}
{ // Ganz Deutschland zählt nur bundesweite Tage: 2027 kein Fronleichnam, kein Drei Könige
  const R = run(2027, 'DE');
  eq(tix(R), ['1>4@2027-05-07', '4>10@2027-03-22', '4>9@2027-05-18'], 'DE 2027: Himmelfahrt, Ostern, Pfingsten');
  ok(!R.C.some(c => c.hs.some(h => h.full.length !== 16)), 'DE 2027: nur bundesweite Feiertage');
}
{ // 4-Tage-Woche Mo–Do: Fr ist frei, Grundwert 7/4; Drei Könige Mi 6.1.2027 + Do frei → Mi–So
  const R = run(2027, 'BY', { arbeit: [false, true, true, true, true, false, false] });
  eq(R.base, 7 / 4, '4-Tage-Woche: Grundwert 7/4');
  eq(tix(R)[0], '1>5@2027-01-07', '4-Tage-Woche BY 2027: Do 7.1. → 5 Tage frei');
  ok(R.C.every(c => c.urlaub.every(d => d.getDay() >= 1 && d.getDay() <= 4)), '4-Tage-Woche: Urlaub nur Mo–Do');
}
{ // Samstag ist Arbeitstag: Karfreitag 26.3.2027, Urlaub Sa 27.3. → Fr–Mo
  const R = run(2027, 'BY', { arbeit: [false, true, true, true, true, true, true] });
  eq(R.base, 7 / 6, 'Mo–Sa: Grundwert 7/6');
  eq(tix(R)[0], '1>4@2027-03-27', 'Mo–Sa BY 2027: Ostersamstag als Brücke');
  ok(R.C.some(c => c.urlaub.some(d => d.getDay() === 6)), 'Mo–Sa: Samstage können Urlaub sein');
}
{ // Mariä Himmelfahrt Do 15.8.2024 zählt in Bayern nur, wenn zugeschaltet; in NW nie
  ok(!find(run(2024, 'BY'), '2024-08-16'), 'BY 2024: ohne Zuschalten keine Brücke am 16.8.');
  eq(tk(find(run(2024, 'BY', { auch: ['mariae-himmelfahrt'] }), '2024-08-16').best), '1>4@2024-08-16', 'BY 2024 + Mariä Himmelfahrt: Fr 16.8. → 4 Tage');
  ok(!find(run(2024, 'NW', { auch: ['mariae-himmelfahrt'] }), '2024-08-16'), 'NW 2024: Mariä Himmelfahrt gilt dort nicht, auch zugeschaltet nicht');
  ok(find(run(2024, 'SL'), '2024-08-16'), 'SL 2024: Mariä Himmelfahrt gilt landesweit');
}
{ // Höchstens ein Urlaubstag je Brücke
  const R = run(2026, 'BY', { je: 1 });
  ok(R.T.length > 0 && R.T.every(t => t.V.every(v => v.u === 1)), 'je=1: nur echte Brückentage');
  // Höchstens neun: Ostern 2027 über beide Wochen
  const R9 = run(2027, 'BY', { je: 9 }), os = find(R9, '2027-03-22');
  ok(os && os.V.some(v => tk(v) === '8>16@2027-03-22'), 'je=9 BY 2027: Ostern 8 → 16');
  // Ziel „lang“: die längste Variante ist vorgewählt, Fahrkarten nach Länge
  const RL = run(2027, 'BY', { je: 9, ziel: 'lang' });
  ok(RL.T.every(t => t.V[t.def].f === Math.max(...t.V.map(v => v.f))), 'ziel=lang: längste Variante vorgewählt');
  ok(RL.T.every((t, i) => !i || RL.T[i - 1].lang.f >= t.lang.f), 'ziel=lang: Fahrkarten nach Länge');
}
{ // Zeitraum ab heute: 9.11.2026 bis 8.11.2027
  const R = B.rechne({ land: 'BY', ex: NOEX, von: new Date(2026, 10, 9), bis: new Date(2027, 10, 9) });
  ok(R.C.every(c => c.urlaub[0] >= new Date(2026, 10, 9) && c.urlaub[0] < new Date(2027, 10, 9)), 'ab heute: erster Urlaubstag im Zeitraum');
  ok(find(R, '2026-12-28') && find(R, '2027-11-02'), 'ab heute: Weihnachten 2026 und Allerheiligen 2027');
}
{ // Ränder des Datenbestands: nichts vor 1991 und nach 2070, abgeschnittene Strecken sind markiert
  const R = run(2070, 'BY', { ex: { rm: false, ha: true, sv: true }, je: 9 });
  ok(R.C.every(c => c.bis <= new Date(2070, 11, 31)), '2070: nichts nach dem 31.12.2070');
  const r = R.C.filter(c => k(c.bis) === '2070-12-31');
  ok(r.length > 0 && r.every(c => c.rand), '2070 + Silvester: Strecken bis 31.12.2070 als abgeschnitten markiert');
  ok(run(1991, 'BY').C.every(c => c.von >= new Date(1991, 0, 1)), '1991: nichts vor dem 1.1.1991');
  eq(run(2071, 'BY').C.length, 0, '2071: keine Daten');
  eq(B.rechne({ land: 'BY', ex: NOEX, ...jahr(2026), arbeit: [false, false, false, false, false, false, false] }).T.length, 0, 'ohne Arbeitstage keine Brücken');
}

// --- Nach Monaten: nur Brücken, deren Urlaub ganz in den Monaten liegt; dazu Urlaub ohne Feiertag ----------
const mon = (y, land, M, o = {}) => run(y, land, { monate: M, ohne: true, ...o });
const DAY = d => ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()];
const plan = (R, n, ziel) => B.budget(R.C.concat(R.O), n, ziel);
const span = c => `${DAY(c.von)} ${k(c.von)}..${k(c.bis)} ${c.u}>${c.f}`;
{ // Bayern Mai/Juni 2027: Himmelfahrt Do 6.5., Pfingstmontag 17.5., Fronleichnam Do 27.5.; 1.5. ist ein Samstag
  const R = mon(2027, 'BY', [4, 5]);
  eq(tix(R), ['1>4@2027-05-07', '1>4@2027-05-28', '4>9@2027-05-18'], 'BY Mai/Jun 2027: Fahrkarten');
  ok(R.C.every(c => c.urlaub.every(d => d.getFullYear() === 2027 && (d.getMonth() === 4 || d.getMonth() === 5))), 'BY Mai/Jun 2027: Urlaub nur im Mai und Juni');
  ok(R.O.some(c => span(c) === 'Fr 2027-06-04..2027-06-06 1>3'), 'BY Mai/Jun 2027: Fr 4.6. als langes Wochenende');
  ok(!R.O.some(c => c.tage.some(x => x.hw)), 'BY Mai/Jun 2027: ohne Feiertag heißt ohne Feiertag an einem Arbeitstag');
  ok(!R.O.some(c => k(c.urlaub[0]) === '2027-05-07'), 'BY Mai/Jun 2027: Fr nach Himmelfahrt ist Brücke, nicht „ohne Feiertag“');
  eq((P => [P.u, P.f])(plan(R, 10, 'lohnend')), [10, 29], 'BY Mai/Jun 2027: 10 Urlaubstage → 29 Tage frei');
  eq((P => [P.u, P.f])(B.budget(R.C, 10, 'lohnend')), [9, 22], 'BY Mai/Jun 2027: nur Brücken → 22 Tage, 1 Tag übrig');
  eq((P => [P.u, P.f])(plan(R, 10, 'lang')), [10, 25], 'BY Mai/Jun 2027 lang: 25 Tage frei');
}
{ // Nordrhein-Westfalen August 2027: kein Feiertag – der Plan legt den Urlaub an die Wochenenden
  const R = mon(2027, 'NW', [7]), R9 = mon(2027, 'NW', [7], { je: 9 });
  eq([R.C.length, R.T.length], [0, 0], 'NW Aug 2027: keine Brücke');
  ok(R.O.some(c => span(c) === 'Fr 2027-08-06..2027-08-08 1>3'), 'NW Aug 2027: Fr 6.8. → 3 Tage');
  ok(R.O.some(c => span(c) === 'Sa 2027-07-31..2027-08-02 1>3'), 'NW Aug 2027: Mo 2.8. mit dem Wochenende davor (Juli)');
  ok(!R.O.some(c => c.u > 4) && R9.O.some(c => span(c) === 'Sa 2027-08-07..2027-08-15 5>9'), 'NW Aug 2027: ganze Woche erst ab je 5');
  ok(!R9.O.some(c => c.urlaub.some(d => d.getMonth() !== 7)), 'NW Aug 2027: Urlaub nur im August');
  eq((P => [P.u, P.f])(plan(R, 10, 'lohnend')), [10, 20], 'NW Aug 2027: 10 Urlaubstage → 20 Tage frei');
  eq(plan(R9, 10, 'lang').items.map(span), ['Sa 2027-07-31..2027-08-02 1>3', 'Di 2027-08-03..2027-08-15 9>13'], 'NW Aug 2027 lang, je 9: 13 Tage am Stück');
}
{ // Dezember 2026 in Bayern: Weihnachten zählt, die Verlängerung in den Januar nicht
  const R = mon(2026, 'BY', [11], { je: 9 });
  ok(R.C.length > 0 && R.C.every(c => c.urlaub.every(d => d.getFullYear() === 2026 && d.getMonth() === 11)), 'BY Dez 2026: Urlaub nur im Dezember 2026');
  ok(!R.C.some(c => k(c.bis) === '2027-01-10'), 'BY Dez 2026: nichts mit Urlaub im Januar 2027');
  ok(run(2026, 'BY', { je: 9 }).C.some(c => k(c.urlaub[0]) === '2026-12-28' && c.urlaub.some(d => d.getFullYear() === 2027)), 'BY 2026 ganzes Jahr: Weihnachten darf in den Januar reichen');
}
{ // ohne „ohne“ bleibt O leer; Monate allein ändern O nicht
  eq(run(2027, 'NW', { monate: [7] }).O.length, 0, 'ohne ohne: kein O');
  eq(run(2027, 'NW').O.length, 0, 'Jahr: kein O');
}

// --- Urlaubsplaner gegen vollständige Suche ------------------------------------------------
const ov = (p, q) => p.von <= q.bis && q.von <= p.bis;
function brute(C, n, val) {
  let best = -Infinity;
  const go = (i, chosen, u, v) => {
    if (v > best) best = v;
    for (let j = i; j < C.length; j++) { const c = C[j]; if (u + c.u <= n && !chosen.some(x => ov(x, c))) go(j + 1, [...chosen, c], u + c.u, v + val(c)); }
  };
  go(0, [], 0, 0); return best;
}
for (const [y, L, je] of [[2027, 'BY', 4], [2026, 'BE', 4], [2026, 'SN', 2]]) {
  const R = run(y, L, { je });
  for (const ziel of ['lohnend', 'lang']) {
    const val = c => (ziel === 'lang' ? c.f * c.f : c.f) * 1000 - c.u;
    for (const n of [0, 1, 2, 3, 5, 8, 10, 12]) {
      const P = B.budget(R.C, n, ziel), got = P.items.reduce((s, c) => s + val(c), 0);
      ok(P.u <= n && P.items.every((c, i) => P.items.every((d, j) => i === j || !ov(c, d))), `budget ${L} ${y} ${ziel} ${n}: zulässig`);
      eq(got, brute(R.C, n, val), `budget ${L} ${y} ${ziel} ${n}: optimal`);
    }
  }
}
eq((P => [P.u, P.f])(B.budget(run(2027, 'BY').C, 10)), [10, 28], 'BY 2027: 10 Urlaubstage → 28 Tage frei');
for (const [y, L, M] of [[2027, 'NW', [7]], [2027, 'BY', [4]], [2026, 'BE', [11]]]) {   // Brücken und Urlaub ohne Feiertag gemischt
  const R = mon(y, L, M, { je: 2 }), K = R.C.concat(R.O);
  for (const ziel of ['lohnend', 'lang']) {
    const val = c => (ziel === 'lang' ? c.f * c.f : c.f) * 1000 - c.u;
    for (const n of [1, 3, 5]) {
      const P = B.budget(K, n, ziel), got = P.items.reduce((s, c) => s + val(c), 0);
      ok(P.u <= n && P.items.every((c, i) => P.items.every((d, j) => i === j || !ov(c, d))), `budget ${L} ${y}/${M} ${ziel} ${n}: zulässig`);
      eq(got, brute(K, n, val), `budget ${L} ${y}/${M} ${ziel} ${n} mit O: optimal`);
    }
  }
}

// --- Invarianten über alle Jahre und Länder --------------------------------------------------
const t0 = Date.now();
let nT = 0;
for (let y = 1991; y <= 2070; y++) for (const L of ['DE', ...F.LAENDER]) for (const ex of [NOEX, { rm: true, ha: true, sv: true }]) {
  const R = run(y, L, { ex }), H = new Set();
  for (const yy of [y - 1, y, y + 1]) if (yy >= 1991 && yy <= 2070) for (const h of F.holidays(yy, ex)) if (B.gilt(h, L, [])) H.add(h.k);
  const at = `${L} ${y}${ex.rm ? ' +x' : ''}`;
  for (const c of R.C) {
    const days = Math.round((c.bis - c.von) / 864e5) + 1;
    if (c.f !== days || c.tage.length !== days) ok(false, `${at}: f stimmt nicht mit der Spanne überein (${tk(c)})`);
    if (c.u !== c.urlaub.length || c.u < 1 || c.u > 4) ok(false, `${at}: u außerhalb 1…4 (${tk(c)})`);
    if (c.urlaub[0].getFullYear() !== y) ok(false, `${at}: erster Urlaubstag nicht in ${y} (${tk(c)})`);
    if (c.urlaub.some(d => !MOFR[d.getDay()] || H.has(k(d)))) ok(false, `${at}: Urlaub an einem freien Tag (${tk(c)})`);
    if (c.tage.some(x => x.frei !== (!MOFR[x.d.getDay()] || H.has(k(x.d))))) ok(false, `${at}: frei/Arbeit falsch (${tk(c)})`);
    if (!c.tage.some(x => MOFR[x.d.getDay()] && H.has(k(x.d)))) ok(false, `${at}: kein Feiertag an einem Arbeitstag (${tk(c)})`);
    if (!c.tage[0].frei || !c.tage[c.f - 1].frei) ok(false, `${at}: Strecke beginnt oder endet nicht frei (${tk(c)})`);
    if (c.r <= R.base) ok(false, `${at}: nicht besser als normaler Urlaub (${tk(c)})`);
  }
  R.T.forEach((t, i) => {
    nT++;
    if (t.best.r < 2.24) ok(false, `${at}: Fahrkarte unter Schwelle (${tk(t.best)})`);
    if (!t.V.includes(t.best) || t.V[t.def] !== t.best) ok(false, `${at}: beste Variante fehlt oder ist nicht vorgewählt`);
    if (t.V.some((v, j) => j && t.V[j - 1].u > v.u)) ok(false, `${at}: Varianten nicht nach u sortiert`);
    if (R.T.some((s, j) => j !== i && ov(s.best, t.best))) ok(false, `${at}: zwei Fahrkarten überschneiden sich (${tk(t.best)})`);
    if (i && R.T[i - 1].best.r < t.best.r) ok(false, `${at}: Fahrkarten nicht nach Hebel sortiert`);
  });
}
// Nach Monaten, über alle Jahre: Urlaub nur in den Monaten, O ohne Feiertag an Arbeitstagen, nichts doppelt
for (let y = 1991; y <= 2070; y++) for (const L of ['BY', 'NW', 'BE', 'DE']) {
  const M = [y % 12, (y * 5 + 3) % 12], R = mon(y, L, M, { je: 9 }), at = `${L} ${y} Monate ${M}`, seen = new Set();
  for (const c of R.C.concat(R.O)) {
    const id = `${k(c.von)}..${k(c.bis)}`;
    if (seen.has(id)) ok(false, `${at}: Strecke doppelt (${id})`); seen.add(id);
    if (c.urlaub.some(d => d.getFullYear() !== y || !M.includes(d.getMonth()))) ok(false, `${at}: Urlaub außerhalb der Monate (${tk(c)})`);
    if (c.u !== c.urlaub.length || c.u < 1 || c.u > 9) ok(false, `${at}: u außerhalb 1…9 (${tk(c)})`);
    if (c.f !== Math.round((c.bis - c.von) / 864e5) + 1 || c.tage.length !== c.f) ok(false, `${at}: f stimmt nicht (${tk(c)})`);
    if (c.r <= R.base) ok(false, `${at}: nicht besser als normaler Urlaub (${tk(c)})`);
    if (c.urlaub.some(d => !MOFR[d.getDay()])) ok(false, `${at}: Urlaub an einem freien Tag (${tk(c)})`);
  }
  for (const c of R.O) if (c.tage.some(x => x.hw)) ok(false, `${at}: O mit Feiertag an einem Arbeitstag (${tk(c)})`);
  for (const c of R.C) if (!c.tage.some(x => x.hw)) ok(false, `${at}: Brücke ohne Feiertag (${tk(c)})`);
}
const ms = Date.now() - t0;
ok(nT > 10000, `Invarianten: zu wenige Fahrkarten (${nT})`);

if (fails) { console.error(`bridges.test: ${fails} von ${checks} Prüfungen fehlgeschlagen`); process.exit(1); }
console.log(`bridges.test: ${checks} Prüfungen bestanden, ${nT} Fahrkarten 1991–2070 geprüft (${ms} ms)`);
