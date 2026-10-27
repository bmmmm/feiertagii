# feiertagii — agent instructions

Eine einzelne statische Seite (`index.html`), die für alle 16 Bundesländer zeigt, welche
gesetzlichen Feiertage 1991–2070 auf Montag bis Freitag fallen. Kein Build, keine
Abhängigkeiten, Oberfläche auf Deutsch. Live: https://bmmmm.github.io/feiertagii/

## Architecture

- `index.html` enthält alles: CSS im `<style>`, die Logik als eine IIFE im `<script>`.
- **Daten:** `<script id="feiertage-daten">` ist die einzige Quelle der Rechtslage,
  rein rechnerisch und ohne DOM; er setzt `FEIERTAGE.holidays(y, extras)`. Je Feiertag
  ein `add(id, name, datum, full, reg, note)`: `id` ist fest (`fronleichnam`,
  `weihnachten-1` …) und verbindet denselben Feiertag über alle Jahre, `full` = Länder,
  in denen er landesweit gilt, `reg` = nur regional (zählt nicht in Summen).
  Jahresgrenzen von Gesetzesänderungen stehen als Bedingungen direkt dort (`y>=2019` …).
  `easter(y)` ist die Osterformel (Meeus/Jones/Butcher), alle beweglichen Feste hängen daran.
- **Zustand:** `year`, `sel` (`'DE'` oder Länderkürzel), `extras` (Rosenmontag,
  Heiligabend, Silvester). `sel` und `extras` liegen in `localStorage` unter `wtf-sel`
  und `wtf-ex` — die Schlüssel nicht umbenennen, sonst verlieren Besucher ihre Auswahl.
- **Darstellung:** `render()` ruft `renderTrend`, `renderAnswer`, `renderMap`,
  `renderRank`, `renderCal`, `renderDetail`, `renderMatrix`. Alles wird per
  Template-String als `innerHTML` neu geschrieben.
- `TODAY` ist das lokale Datum des Browsers; `YMIN`/`YMAX` begrenzen den Zeitraum.

## Build & test

```bash
node tests/holidays.test.mjs                                 # Rechtslage gegen tests/golden-holidays.txt
scripts/build-site.sh _site && scripts/check-site.sh _site   # Gate vor jedem Commit
shellcheck -S style scripts/*.sh
```

`holidays.test.mjs` führt nur den Datenblock aus und vergleicht jeden Feiertag 1991–2070
(ohne und mit optionalen Tagen) mit der Golden-Datei. Eine bewusste Gesetzesänderung:
Daten ändern, `node tests/holidays.test.mjs --update`, den Diff im Commit begründen.

`build-site.sh` kopiert nur die Dateien aus seiner `FILES`-Liste nach `_site` und setzt
das `lastmod` der sitemap. `check-site.sh` prüft das Ergebnis: nichts von fremden
Servern, keine toten oder absoluten Verweise, `og:image`/sitemap zeigen auf echte
Dateien, jede Schrift wird benutzt. Dieselben zwei Skripte laufen in
`.forgejo/workflows/ci.yml` (PRs) und in `.github/workflows/pages.yml` vor dem Deploy.

Eine Änderung an der Logik im Browser gegenprüfen: `index.html` öffnen, ein Jahr mit
bekannter Lage ansehen (z. B. 2026: bundesweit 7 der 9 Feiertage auf Mo–Fr).

## Conventions

- **Eine Gesetzesänderung betrifft fünf Stellen:** die Bedingung in `holidays()`, die Golden-Datei, den
  Marker in `EVENTS` (Diagramm), die Liste „Hinweise“ im HTML und die Tabelle in der
  README. Dazu „Stand <Monat Jahr>“ in den Hinweisen und in der README nachziehen.
- **Verweise relativ halten** (`fonts/x.woff2`, nie `/fonts/x.woff2`): Pages liefert
  unter `/feiertagii/` aus. Einzige Ausnahme ist `404.html` — die wird unter jedem
  Pfad ausgeliefert und verweist deshalb immer über `/feiertagii/…`.
- **Nichts von Dritten laden** — keine Google Fonts, keine CDNs. Schriften liegen
  unter `fonts/` (OFL-Lizenztexte daneben).
- **Neue veröffentlichte Datei** → in `FILES` in `scripts/build-site.sh` eintragen;
  sonst meldet `check-site.sh` den toten Verweis.
- **Icon oder Vorschaubild geändert** → `scripts/render-images.mjs` laufen lassen
  (braucht Playwright, siehe Kopf der Datei) und die erzeugten PNG/ICO mit committen.
- Oberflächentexte auf Deutsch mit typografischen Zeichen (–, „…“, ·).
- Neue Quelldateien bekommen `SPDX-License-Identifier: GPL-3.0-or-later`.

## Repo

`origin` ist das private Forgejo (Quelle der Wahrheit), `github` der öffentliche
Spiegel `bmmmm/feiertagii` mit GitHub Pages (Quelle: GitHub Actions). PRs laufen auf
Forgejo; Dependabot-PRs auf GitHub sind nur Signale — lokal übernehmen, auf beide
Remotes pushen, nie im GitHub-UI mergen. `.project-stage` steht auf `alpha`.
