#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
#
# check-site.sh [site-dir] — prüft die gebaute Seite (Standard: _site) auf
# das, was im Browser still kaputtgeht oder Besucherdaten an Dritte gibt:
#
#   - keine Ressource von fremden Servern (Schriften, Skripte, Styles, Bilder)
#   - jeder lokale Verweis zeigt auf eine Datei, die mit ausgeliefert wird
#   - index.html verweist nur relativ (die Seite liegt unter /feiertagii/)
#   - 404.html verweist nur über /feiertagii/ (sie wird unter jedem Pfad ausgeliefert)
#   - og:image, canonical und sitemap zeigen auf vorhandene Dateien
#   - jede Schrift unter fonts/ wird auch benutzt
#
# Exit 0 = sauber, 1 = Befund (jede Zeile nennt Datei und Verweis).

set -euo pipefail

dir="${1:-_site}"
BASE="https://bmmmm.github.io/feiertagii/"
PREFIX="/feiertagii/"
fails=0
bad() { printf 'check-site: %s\n' "$*" >&2; fails=$((fails + 1)); }

[ -d "$dir" ] || { echo "check-site: $dir fehlt — erst scripts/build-site.sh $dir" >&2; exit 1; }

for f in index.html 404.html favicon.ico favicon.svg apple-touch-icon.png og.png robots.txt sitemap.xml; do
  [ -f "$dir/$f" ] || bad "$f fehlt"
done

grep -q '__LASTMOD__' "$dir/sitemap.xml" 2>/dev/null && bad "sitemap.xml: __LASTMOD__ nicht ersetzt"

# lokal <ref> <html-datei> — prüft einen Verweis auf eine mitgelieferte Datei
lokal() {
  local ref="${1%%[?#]*}" page="$2"
  [ -n "$ref" ] || return 0
  [ -e "$dir/$ref" ] || bad "$page: Verweis auf $1 — Datei fehlt in $dir"
}

for page in "$dir"/*.html; do
  name="${page##*/}"

  # Ressourcen, die der Browser selbst lädt, dürfen nicht von außen kommen
  # (Links zum Anklicken, canonical und og-Metadaten sind erlaubt)
  while IFS= read -r hit; do bad "$name: lädt von außen: $hit"; done < <(
    grep -noE '<(script|img|iframe|source|audio|video|embed)[[:space:]][^>]*src="(https?:)?//[^"]*"' "$page" || true
    grep -noE '<link[[:space:]][^>]*>' "$page" | grep -E 'href="(https?:)?//' | grep -vE 'rel="canonical"' || true
    grep -noE "url\([[:space:]]*[\"']?(https?:)?//[^)]*\)|@import" "$page" || true
  )

  # alle übrigen Verweise: relativ (index.html) bzw. über /feiertagii/ (404.html)
  while IFS= read -r ref; do
    case "$ref" in
      ''|'#'*|data:*|mailto:*|http://*|https://*|//*|*\$\{*) continue ;;
    esac
    if [ "$name" = 404.html ]; then
      case "$ref" in
        "$PREFIX"*) lokal "${ref#"$PREFIX"}" "$name" ;;
        *) bad "$name: $ref muss mit $PREFIX beginnen — die Seite wird unter jedem Pfad ausgeliefert" ;;
      esac
    else
      case "$ref" in
        /*) bad "$name: $ref ist absolut — auf GitHub Pages liegt die Seite unter $PREFIX, Verweise relativ halten" ;;
        *) lokal "$ref" "$name" ;;
      esac
    fi
  done < <(
    grep -oE '[[:space:]](src|href)="[^"]*"' "$page" | sed -E 's/^[[:space:]]*[a-z]+="(.*)"$/\1/'
    grep -oE "url\([[:space:]]*[\"']?[^)\"']*" "$page" | sed -E "s/^url\([[:space:]]*[\"']?//"
  )

  # eigene absolute URLs (canonical, og:image …) müssen auf echte Dateien zeigen
  while IFS= read -r url; do
    lokal "${url#"$BASE"}" "$name"
  done < <(grep -oE "\"${BASE}[^\"]*\"" "$page" | tr -d '"')
done

while IFS= read -r url; do
  lokal "${url#"$BASE"}" sitemap.xml
done < <(grep -oE "<loc>${BASE}[^<]*</loc>" "$dir/sitemap.xml" | sed -E 's#</?loc>##g')
grep -q "Sitemap: ${BASE}sitemap.xml" "$dir/robots.txt" || bad "robots.txt nennt die sitemap nicht"

for font in "$dir"/fonts/*.woff2; do
  grep -q "fonts/${font##*/}" "$dir/index.html" || bad "fonts/${font##*/} wird nirgends benutzt"
done

if [ "$fails" -gt 0 ]; then
  echo "check-site: $fails Befund(e) in $dir" >&2
  exit 1
fi
echo "check-site: $dir sauber"
