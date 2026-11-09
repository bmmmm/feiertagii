<p align="center"><img src="favicon.svg" width="72" height="72" alt=""></p>

<h1 align="center">feiertagii</h1>

<p align="center"><b>Werktags-Feiertage</b> – welche gesetzlichen Feiertage fallen auf Montag bis Freitag,<br>
und wann kommt der nächste freie Werktag? Alle 16 Bundesländer, 1991 bis 2070,<br>
als Liniennetz: jeder Feiertag eine Linie, jedes Land ein Gleis.</p>

<p align="center"><a href="https://bmmmm.github.io/feiertagii/"><b>→ bmmmm.github.io/feiertagii</b></a></p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshot-dark.png">
  <img src="docs/screenshot-light.png" alt="Kopf der Seite mit Haltestellen-Schild, dem Titel Werktags-Feiertage und der Zugwahl (Liniennetz, Ruhezug oder Brückenzug), darunter die Auswahlleiste (Gleis Bayern, Jahr 2026) und die Abfahrtstafel: Normale Arbeitstage bis Do 24.12. als Fallblattanzeige, nächster Halt 1. Weihnachtstag, darunter weitere Abfahrten mit Hinweisen wie „Durchfahrt“, die Bilanz des Jahres und die nächste Brücke: Urlaub Mo 21.12. bis Do 24.12., 4 Urlaubstage für 9 Tage frei.">
</picture>

## Drei Züge: Liniennetz, Ruhezug und Brückenzug

Oben im Kopf steht die **Zugwahl**, drei gekuppelte Wagen; dieselbe Wahl steckt als kleiner
Umschalter in der Auswahlleiste, also auch mitten auf der Seite. Das **Liniennetz** zeigt alles:
jede Linie, jedes Land, jedes Jahr, mit Vorschau quer durch alle Ansichten. Wem das zu viel
auf einmal ist, steigt in den **Ruhezug** um. Er zeigt nur das Wichtigste: je Wagen eine Kernaussage in einem ganzen Satz und
ein ruhiges Bild, eine Farbe für Daten, Gelb für den nächsten Halt, Rot nur für „heute“.

1. **Nächster Halt** – der nächste freie Werktag, groß, mit Datum und Countdown. Darunter fährt
   ein Zug vom letzten freien Werktag bis heute: so viele Arbeitstage geschafft, so viele noch.
2. **Das Jahr** – wie viele Feiertage auf Mo–Fr fallen, wie viele aufs Wochenende, was schon
   vorbei ist; daneben der Reiseverlauf des Jahres mit einer Station je Feiertag.
3. **Gute und magere Jahre** – 16 Jahre als Stapel (volle Kästchen Mo–Fr, leere am Wochenende),
   der Vergleich mit dem Schnitt 1991–2070 und in zwei Sätzen, warum die Zahl schwankt.
4. **Die Länder im Vergleich** – jedes Land ein Zug, jeder Wagen ein Feiertag an einem Werktag.
5. **Gut zu wissen** – Arbeitsort zählt, regionale Tage zählen nicht; dazu die optionalen Tage.

Ein Link mit `#…&zug=ruhe` öffnet direkt den Ruhezug.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/ruhe-dark.png">
  <img src="docs/ruhe-light.png" alt="Der Ruhezug: Kopf mit der Zugwahl, der Wagen Ruhezug ist erleuchtet. Darunter Wagen 1, Nächster Halt Bayern: Nächster freier Werktag 1. Weihnachtstag, Freitag, 25. Dezember 2026, in 58 Tagen, bis dahin noch 42 Arbeitstage. Eine Strecke vom letzten freien Werktag Fronleichnam bis zum 1. Weihnachtstag, der Zug steht bei 103 geschafften Arbeitstagen, noch 42.">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/ruhe-jahre-dark.png">
  <img src="docs/ruhe-jahre-light.png" alt="Wagen 3, Gute und magere Jahre in Bayern: 2026 ist ein mageres Jahr, 9 Feiertage auf Werktagen, im Schnitt 10,1. Darunter 16 Stapel für 2021 bis 2036, volle Kästchen für Feiertage an Werktagen, leere für Feiertage am Wochenende, und ein Kasten: Warum schwankt das?">
</picture>

### Brückenzug

Der **Brückenzug** beantwortet eine andere Frage: Wann lohnt sich Urlaub? Wo ein Urlaubstag
zwischen Feiertag und Wochenende eine Brücke schlägt, ergeben wenige Urlaubstage lange freie
Strecken. Links steht das **Stellwerk**, dort stellt man ein, womit gerechnet wird:

| Hebel | Grundstellung | Wozu |
|---|---|---|
| Meine Arbeitstage | Mo–Fr | Teilzeit, 4-Tage-Woche, Arbeit am Samstag |
| Urlaub je Brücke | bis 4 | 1, bis 2, bis 4 oder bis 9 Urlaubstage für eine Brücke |
| Urlaubstage für den Plan | 10 | das Kontingent für Wagen 2 und 3 |
| Ziel | möglichst lohnend | viele freie Tage je Urlaubstag – oder möglichst lang am Stück |
| Zeitraum | Kalenderjahr | oder ab heute zwölf Monate, über den Jahreswechsel |
| Bei mir auch frei | – | Rosenmontag, Heiligabend, Silvester und die regionalen Feiertage des Lands |

Jede Änderung rechnet sofort neu. Daneben fahren vier Wagen:

1. **Die besten Brücken** – je Brücke eine Fahrkarte: links der Einsatz und was er bringt
   („1 → 4“: ein Urlaubstag, vier Tage frei), rechts die Strecke mit gelben Urlaubstagen und einem
   Bogen darüber, darunter längere oder kürzere Varianten. Was im laufenden Jahr schon vorbei ist,
   trägt den Stempel „abgefahren“.
2. **Ihr Urlaubsplan** – welche Brücken sich mit dem Kontingent nicht überschneiden und zusammen
   die meisten freien Tage bringen, als Jahreskalender und Liste der Etappen.
3. **Die Länder im Vergleich** – derselbe Plan in allen 16 Ländern.
4. **Gut zu wissen** – wie der Zug rechnet und was er nicht kennt (Schulferien, Betriebsferien).

Eine Brücke lohnt sich, wenn sie mindestens 60 % mehr freie Tage je Urlaubstag bringt als
normaler Urlaub; der bringt bei fünf Arbeitstagen 7 freie Tage für 5. Liniennetz und Ruhezug
zählen weiter Feiertage auf Mo–Fr und zeigen nur Hinweise: gelbe Schwellen für Brückentage in
der Jahresstrecke, die nächste Brücke auf der Abfahrtstafel und die beste Brücke des Jahres in
Ruhezug-Wagen 2, jeweils mit einem Knopf zum Umsteigen.

Ein Link mit `#…&zug=bruecke` öffnet den Brückenzug. Was vom Stellwerk abweicht, steht mit im
Link, etwa `#jahr=2027&land=BY&zug=bruecke&arbeit=mo-di-mi-do&je=2&urlaub=15&ziel=lang&zeit=ab&auch=mariae-himmelfahrt`.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/bruecke-dark.png">
  <img src="docs/bruecke-light.png" alt="Der Brückenzug 2027 in Bayern: links das Stellwerk mit Arbeitstagen Mo bis Fr, bis 4 Urlaubstagen je Brücke, 10 Urlaubstagen für den Plan, Ziel lohnend, Zeitraum Jahr 2027 und zuschaltbaren freien Tagen. Rechts Wagen 1: Die besten Brücken 2027 sind Christi Himmelfahrt und Fronleichnam, je 1 Urlaubstag für 4 Tage frei. Darunter Fahrkarten mit Abriss 1 → 4 und 2 → 6, einer Strecke mit gelbem Brückentag und Bogen und den Varianten.">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/bruecke-plan-dark.png">
  <img src="docs/bruecke-plan-light.png" alt="Wagen 2, Ihr Urlaubsplan 2027 in Bayern: Mit 10 Urlaubstagen haben Sie 28 Tage frei, in 4 Etappen. Ein Jahreskalender mit zwölf Monatsgleisen, gelb die Urlaubstage, dunkel die freien Strecken, darunter die Etappen Neujahr und Heilige Drei Könige 4 → 10, Ostern 4 → 10, Christi Himmelfahrt 1 → 4 und Fronleichnam 1 → 4.">
</picture>

## Linien, Gleise, Halte

Jeder Feiertag hat ein eigenes **Signet**, das auf der ganzen Seite gleich aussieht:
die **Form** sagt, welche Art Feiertag es ist, **Farbe und Kürzel** sagen, welcher.

| Form | Art | Beispiele |
|---|---|---|
| Kreis | bundesweit | Neujahr `NJ`, Karfreitag `KF`, Tag der Deutschen Einheit `TE` |
| Quadrat | nur in einigen Ländern | Fronleichnam `FL`, Reformationstag `RT`, Frauentag `FT` |
| Raute | nur in Teilen eines Landes | Augsburger Friedensfest `AF` |
| Sechseck | einmalig | Tag der Befreiung `BF` (Berlin 2020 und 2025) |
| Ring | fällt immer auf einen Sonntag | Oster- und Pfingstsonntag in Brandenburg |
| gestrichelte Kapsel | optional, kein gesetzlicher Feiertag | Rosenmontag `RM`, Heiligabend `HA`, Silvester `SV` |

**Alles hängt zusammen.** Land, Jahr, Feiertag und Tag sind *eine* Auswahl, und jede
Ansicht folgt ihr: Mit dem Zeiger über ein Signet, eine Station oder eine Spur fahren
zeigt die Linie überall als Vorschau, ein Klick hält sie fest, `Esc` löst sie. Die
Auswahl steht in der Adresse (`#jahr=2026&land=BY&linie=fronleichnam`), ein Link teilt
also genau diese Ansicht.

- **Abfahrt ab heute** – eine Fallblatt-Tafel: bis wann nur normale Arbeitstage anstehen,
  der nächste Halt, jede Schwelle bis dahin ein Arbeitstag. Darunter die weiteren
  Abfahrten mit Hinweis: *Halt*, *fällt aus* (aufs Wochenende), *Durchfahrt* (gilt hier
  nicht), *Teilhalt* (nur regional), *früher frei* (anderswo eher).
- **Liniennetz** des Jahres – die 16 Länder als Gleise, die Feiertage als Linien, die dort
  halten, wo sie gelten. Man sieht sofort, welche Länder sich welchen Feiertag teilen; am
  gewählten Gleis stehen die Arbeitstage bis zum nächsten Halt. Der Steckbrief der
  gewählten Linie zeigt, auf welche Wochentage sie 1991–2070 fällt.
- **Jahresstrecke** – zwölf Monatsgleise, jede Schwelle ein Arbeitstag, Signets an den Halten.
- **Linienverzeichnis** – jeder Feiertag einzeln, mit Regel, Termin im gewählten Jahr und
  Gleisen; hier lassen sich auch die optionalen Tage zuschalten.
- **Fahrplan 1991–2070** – oben der Taktfahrplan (Land × Jahr, Zahl der Feiertage auf Mo–Fr
  oder aufs Wochenende), darunter eine Spur je Linie: die Höhe der Marke ist der
  Wochentag. Feste Termine wandern Jahr für Jahr eine Spur weiter, Ostertermine bleiben
  auf ihrer, Betriebspausen und Fahrplanwechsel zeigen die Gesetzesänderungen.
- **Gleise im Vergleich** – Kachelkarte und Rangliste der Länder für das gewählte Jahr.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/netz-dark.png">
  <img src="docs/netz-light.png" alt="Liniennetz 2026 mit gewählter Linie Fronleichnam: Die Gleise Baden-Württemberg bis Hessen halten durchgehend, Sachsen und Thüringen nur regional (Raute). Darunter der Steckbrief: Donnerstag, 04.06.2026, 1991–2070 immer donnerstags.">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/fahrplan-dark.png">
  <img src="docs/fahrplan-light.png" alt="Fahrplan 1991–2070 mit gewählter Linie Tag der Deutschen Einheit: oben der Taktfahrplan mit einer Zahl je Land und Jahr, darunter eine Spur je Feiertag. Die Einheit wandert als Treppe durch die Wochentage, die Osterfeste liegen flach, Frauentag und Weltkindertag setzen nach 28 Jahren Pause ein.">
</picture>

Alles wird im Browser berechnet: keine Cookies, kein Tracking, keine Anfragen an fremde
Server, die Schriften liegen im Repo. Gewähltes Land, optionale Tage, der gewählte Zug und
das Stellwerk bleiben im `localStorage` des Browsers. Bedienbar per Tastatur (Pfeiltasten im Fahrplan),
hell und dunkel, ab 360 px Breite.

## So wird gerechnet

Die Termine kommen aus den Feiertagsgesetzen der Länder, Stand Oktober 2026:

- **Ostern** nach der gregorianischen Osterformel (Meeus/Jones/Butcher). Daran hängen
  Karfreitag, Ostermontag, Christi Himmelfahrt (+39 Tage), Pfingstmontag (+50) und
  Fronleichnam (+60).
- **Buß- und Bettag** ist der Mittwoch vor dem 23. November.
- **Regionale Feiertage** – Fronleichnam in Teilen Sachsens und Thüringens, Mariä
  Himmelfahrt in Teilen Bayerns, das Augsburger Friedensfest – werden angezeigt, zählen
  aber nicht in die Landessummen.
- **Ab 2027** ist alles eine Projektion nach heutiger Rechtslage.

Gesetzesänderungen seit 1991, die die Seite berücksichtigt:

| Jahr | Änderung |
|---|---|
| 1993 | Sachsen-Anhalt führt Heilige Drei Könige (6. Januar) ein |
| 1995 | Buß- und Bettag entfällt, außer in Sachsen |
| 2017 | Reformationstag einmalig bundesweit (500 Jahre Reformation) |
| 2018 | Reformationstag dauerhaft auch in Bremen, Hamburg, Niedersachsen und Schleswig-Holstein |
| 2019 | Internationaler Frauentag in Berlin, Weltkindertag in Thüringen |
| 2020, 2025 | Berlin: 8. Mai einmalig frei (Tag der Befreiung) |
| 2023 | Internationaler Frauentag in Mecklenburg-Vorpommern |

Maßgeblich ist das Bundesland des Arbeitsorts, nicht des Wohnorts.

Ein Feiertag fehlt, ein Datum stimmt nicht oder ein Land hat sein Gesetz geändert?
Bitte ein [Issue](https://github.com/bmmmm/feiertagii/issues) mit Quelle (Gesetz oder
Gesetzblatt) aufmachen.

## Lokal

`index.html` im Browser öffnen – kein Build, keine Abhängigkeiten.

```bash
node tests/holidays.test.mjs   # Rechtslage gegen die Golden-Datei
node tests/bridges.test.mjs    # Brückentage: feste Fälle und Regeln für 1991–2070
scripts/build-site.sh _site    # stellt die veröffentlichte Seite zusammen
scripts/check-site.sh _site    # keine fremden Ressourcen, keine toten Verweise
```

Alle vier laufen auch in der CI, bevor GitHub Pages ausliefert.

| Datei | Inhalt |
|---|---|
| `index.html` | die ganze Seite: Styles, Rechtslage (`<script id="feiertage-daten">`), Brückentage (`<script id="brueckentage">`), Darstellung |
| `fonts/` | Barlow, Barlow Condensed und IBM Plex Mono (Latin-Subset, woff2) |
| `favicon.svg`, `og.png`, … | Icons und Vorschaubild; neu erzeugen mit `scripts/render-images.mjs` |
| `scripts/`, `tests/` | Build, Prüfung, Bildgenerator, Golden-Test der Rechtslage, Test der Brückentage |

## Lizenz

[GPL-3.0-or-later](LICENSE). Die Schriften Barlow, Barlow Condensed und IBM Plex Mono stehen unter der
SIL Open Font License 1.1 ([`fonts/OFL-Barlow.txt`](fonts/OFL-Barlow.txt),
[`fonts/OFL-IBM-Plex.txt`](fonts/OFL-IBM-Plex.txt)).
