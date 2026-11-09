# feiertagii — agent instructions

Eine einzelne statische Seite (`index.html`), die für alle 16 Bundesländer zeigt, welche
gesetzlichen Feiertage 1991–2070 auf Montag bis Freitag fallen. Kein Build, keine
Abhängigkeiten, Oberfläche auf Deutsch. Live: https://bmmmm.github.io/feiertagii/

## Architecture

- `index.html` enthält alles: CSS im `<style>`, die Rechtslage und die Brückentage-Rechnung
  in je einem eigenen `<script>`, die Oberfläche als eine IIFE im dritten `<script>`. Ein
  Einzeiler im `<head>` setzt `data-zug="ruhe"`/`"bruecke"` schon vor dem ersten Bild (sonst
  blitzt das Liniennetz auf).
- **Daten:** `<script id="feiertage-daten">` ist die einzige Quelle der Rechtslage,
  rein rechnerisch und ohne DOM; er setzt `FEIERTAGE.holidays(y, extras)`. Je Feiertag
  ein `add(id, name, datum, full, reg, note)`: `id` ist fest (`fronleichnam`,
  `weihnachten-1` …) und verbindet denselben Feiertag über alle Jahre, `full` = Länder,
  in denen er landesweit gilt, `reg` = nur regional (zählt nicht in Summen).
  Jahresgrenzen von Gesetzesänderungen stehen als Bedingungen direkt dort (`y>=2019` …).
  `easter(y)` ist die Osterformel (Meeus/Jones/Butcher), alle beweglichen Feste hängen daran.
- **Brückentage:** `<script id="brueckentage">` rechnet ebenfalls ohne DOM und liest nur
  `FEIERTAGE`; er setzt `BRUECKEN.{GRUND,gilt,rechne,budget}`. `rechne({land, ex, arbeit,
  auch, je, ziel, von, bis})` → `{base, C, T}`: `base` = freie Tage je Urlaubstag ohne
  Feiertag (7/5 bei Mo–Fr), `C` alle Brücken besser als `base`, `T` die Fahrkarten (je Anlass
  `best`, Varianten `V`, Vorgabe `def`). `budget(C, n, ziel)` ist der Urlaubsplan: Brücken ohne
  Überschneidung, die mit `n` Urlaubstagen am meisten bringen. `GRUND` ist die Grundstellung
  des Stellwerks (Mo–Fr, je 4, 10 Urlaubstage, lohnend, Kalenderjahr). Mit `monate` (0–11)
  zählt eine Brücke nur, wenn *alle* Urlaubstage in diesen Monaten liegen; mit `ohne` kommt
  `O` dazu – Urlaub ohne Feiertag, an freie Tage angelegt, nur für den Plan, nie als Fahrkarte.
- **Gestaltung:** ein Liniennetz. Jeder Feiertag ist eine *Linie*, jedes Land ein *Gleis*.
  `LN[id]` hält die Identität je Feiertag (Kürzel `c`, Kategorie `cat`, Linienfarbe `bg`,
  Schrift `fg`, Kanten `ed`/`dk` für hell/dunkel); `CATS` und `SH` ordnen jeder Kategorie
  eine Signet-Form zu (Kreis bundesweit, Quadrat einige Länder, Raute regional, Sechseck
  einmalig, Ring immer Sonntag, gestrichelte Kapsel optional). `sig(id)`/`sigAt(…)`
  zeichnen das Signet — überall dasselbe, nie Farbe allein. Ein neuer Feiertag im
  Datenblock braucht einen Eintrag in `LN` und `ORDER`.
- **Zustand:** *eine* Auswahl `S = {land, jahr, fid, tag}` (fid = Feiertags-id) und die
  flüchtige Vorschau `HV` (Hover/Fokus). Daneben `ZUG` (`'netz'` | `'ruhe'` | `'bruecke'`):
  welcher Zug fährt, und `BR`, das Stellwerk des Brückenzugs, siehe unten. Jede Ansicht liest beide, jede kann sie setzen;
  Änderungen laufen über `commit()`, das neu zeichnet und den URL-Hash schreibt
  (`#jahr=…&land=…&linie=…&tag=…&zug=…`, eingelesen von `readHash()` nur über Whitelists).
  Die Vorschau zeichnet nichts neu: `brush()` setzt je Abschnitt (`SECS`) Klassen an die
  vorab gefundenen Treffer und dimmt den Rest über eine Klasse am Abschnitt — keine
  `:not()`-Regeln am Wurzelelement, die kosteten je Hover ~20 ms Style-Neuberechnung.
  Abschnitte außerhalb des Bildes holen die Vorschau nach, sobald sie sichtbar werden.
  `preview()` ersetzt keinen Bereich, in dem gerade der Tastaturfokus steht — sonst fällt
  der Fokus auf `<body>` und Tab kommt nicht weiter (Review 2026-10-28).
- **Fremdeingaben** (Hash, `localStorage`, `dataset`) nur über `Object.hasOwn(…)` gegen
  `BY`/`LN` nachschlagen, nie `obj[fremd]` direkt: `#land=constructor` hat sonst die
  ganze Seite lahmgelegt, über `localStorage` sogar dauerhaft.
  `extras` (Rosenmontag, Heiligabend, Silvester), das Land, der Zug und das Stellwerk liegen
  in `localStorage` unter `wtf-ex`, `wtf-sel`, `wtf-zug` und `wtf-br` — die Schlüssel nicht
  umbenennen, sonst verlieren Besucher ihre Auswahl. Werte für `BR` nur über `BRV` annehmen.
- **Ansichten** (je eine `render…`-Funktion, gesammelt in `renderAll()`): Abfahrtstafel
  „ab heute“ (`renderBoard`), Liniennetz des Jahres (`renderNetz`, Steckbrief
  `renderLdet`), Jahresstrecke (`renderStrecke`), Linienverzeichnis (`renderVerz`),
  Taktfahrplan + Fahrplan je Linie 1991–2070 (`renderTakt`, Spuren in `buildTakt`, nur
  bei Wechsel von Zeitraum, Zusatztagen, Land oder Breite neu), Länder (`renderLaender`),
  Auswahlleiste (`renderBar`). Alles per Template-String als `innerHTML`.
- **Ruhezug** (`#ruhe`, `renderRuhe()` → `renderRu1`…`renderRu4`): dieselbe Auswahl `S`, aber
  ohne Vorschau und Brushing — je Wagen eine Kernaussage als ganzer Satz (`h2`) und ein ruhiges
  Bild: nächster freier Werktag mit Strecke, Reiseverlauf des Jahres, 16 Jahre als Stapel,
  Länder als Züge. Eine Datenfarbe (`--heat`), Gelb nur „nächster Halt“, Rot nur „heute“.
  Fährt der Ruhezug, zeichnet `renderAll2()` nur ihn; das Liniennetz bleibt per CSS
  (`:root[data-zug="ruhe"]`) verborgen und wird beim Umsteigen (`setZug()`, mit View
  Transition) über seine Cache-Schlüssel nachgeholt. `zug=ruhe` steht im Hash, `zug=netz` nur,
  wenn es von `wtf-zug` abweicht — alte Links ohne `zug` bleiben gültig. Sätze über ein Land
  immer mit `inLand(c)` bilden („im Saarland“, „bundesweit“), nie `'in '+BY[c].n`. Neue
  Rechtslage braucht hier nichts: Wagen 3 liest Fahrplanwechsel aus `EVENTS`/`EVH`.
- **Brückenzug** (`#bruecke`, `renderBruecke()` → `renderStw()` + `renderBr1`…`renderBr4`):
  links das Stellwerk (`BR = {arbeit, auch, je, urlaub, ziel, zeit, monate}`), rechts vier Wagen —
  Fahrkarten mit Varianten, Urlaubsplan, Länder im Vergleich, wie gerechnet wird. Land, Jahr
  und Zusatztage kommen wie überall aus `S`/`extras`; das Stellwerk ändert nur diesen Zug.
  Gezeichnet wird über `brCalc(L, span)`, das `rechne()` je Land, Zeitraum und Annahmen
  einmal aufruft und cacht (`r.vs` merkt gewählte Varianten, `r.P` die Pläne). Im Hash steht
  das Stellwerk nur mit `zug=bruecke` und nur, wo es von `GRUND` abweicht
  (`arbeit=mo-di-mi-do&je=2&urlaub=15&ziel=lang&zeit=ab&auch=<id>`, gelesen über
  `brFromHash`); ein solcher Link legt alles fest, was fehlt, steht in Grundstellung.
  `zeit=mai-jun` (Kürzel `MK`) heißt `zeit:'monate'` mit diesen Monaten im eingestellten Jahr:
  `brSpan()` liefert dann `sp.M`, `brCalc` rechnet mit `monate` und `ohne`, `brPlan` plant
  über `C` und `O`, Texte über den Zeitraum kommen aus `brWann(sp)`. Gemerkte Monate bleiben in
  `BR.monate`, auch wenn wieder nach Jahr gerechnet wird (`brNorm` für die Grundstellung).
  Liniennetz und Ruhezug zählen weiter Feiertage auf Mo–Fr und zeigen nur Hinweise mit den
  Annahmen aus `BR`: `brHint(L, y)` liefert die Urlaubstage der Fahrkarten (gelbe Schwellen in
  der Jahresstrecke) und einen Satz zur besten Brücke (Strecke, Ruhezug Wagen 2), die
  Abfahrtstafel nennt die nächste Brücke. Knöpfe mit `data-ride="bruecke"` steigen um,
  `data-zeit="jahr"|"ab"` stellt dabei den Zeitraum.
- `TODAY`/`TY` kommen aus der lokalen Uhr des Browsers; `YMIN`/`YMAX` begrenzen
  den Zeitraum. Zwei Feiertage am selben Tag gibt es (2008: Tag der Arbeit = Christi
  Himmelfahrt; 2038 mit Rosenmontag: = Frauentag) — Tag-Auswahl und Steckbrief nennen
  dann beide.

## Build & test

```bash
node tests/holidays.test.mjs                                 # Rechtslage gegen tests/golden-holidays.txt
node tests/bridges.test.mjs                                  # Brückentage: feste Fälle, Regeln 1991–2070
scripts/build-site.sh _site && scripts/check-site.sh _site   # Gate vor jedem Commit
shellcheck -S style scripts/*.sh
```

`holidays.test.mjs` führt nur den Datenblock aus und vergleicht jeden Feiertag 1991–2070
(ohne und mit optionalen Tagen) mit der Golden-Datei. Eine bewusste Gesetzesänderung:
Daten ändern, `node tests/holidays.test.mjs --update`, den Diff im Commit begründen.
`bridges.test.mjs` führt beide Rechenblöcke ohne DOM aus: feste, von Hand nachgerechnete
Fälle, Invarianten über alle Jahre und Länder und den Urlaubsplan gegen eine vollständige
Suche. Ändert sich die Rechtslage, können sich dort Erwartungen verschieben — prüfen, nicht
blind anpassen.

`build-site.sh` kopiert nur die Dateien aus seiner `FILES`-Liste nach `_site` und setzt
das `lastmod` der sitemap. `check-site.sh` prüft das Ergebnis: nichts von fremden
Servern, keine toten oder absoluten Verweise, `og:image`/sitemap zeigen auf echte
Dateien, jede Schrift wird benutzt. Dieselben zwei Skripte laufen in
`.forgejo/workflows/ci.yml` (PRs) und in `.github/workflows/pages.yml` vor dem Deploy.

Eine Änderung an der Logik im Browser gegenprüfen: `index.html` öffnen, ein Jahr mit
bekannter Lage ansehen (z. B. 2026: bundesweit 7 der 9 Feiertage auf Mo–Fr). Eine
Ansicht mit fester Auswahl lädt direkt über den Hash, z. B.
`index.html#jahr=2008&land=BY&linie=himmelfahrt` (Doppel-Feiertag), den Ruhezug mit
`&zug=ruhe`, den Brückenzug mit `&zug=bruecke` (etwa
`index.html#jahr=2027&land=BY&zug=bruecke&arbeit=mo-di-mi-do`) — dort alle drei Züge prüfen.

## Conventions

- **Eine Gesetzesänderung betrifft fünf Stellen:** die Bedingung in `holidays()`, die Golden-Datei, den
  Fahrplanwechsel in `EVENTS` + `EVH` (Text und betroffene ids), die Liste „Hinweise“ im HTML und die Tabelle in der
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
