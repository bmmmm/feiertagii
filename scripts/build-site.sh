#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
#
# build-site.sh <out-dir> — stellt die veröffentlichte Seite zusammen.
#
# Kopiert wird nur, was hier aufgelistet ist: README, AGENTS.md, scripts/ und
# docs/ gehören nicht auf GitHub Pages. Fehlt eine neue Datei in der Liste,
# meldet check-site.sh den toten Verweis im Ergebnis.
# Die sitemap bekommt als lastmod das Datum des gebauten Commits.

set -euo pipefail

out="${1:?usage: build-site.sh <out-dir>}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

FILES=(
  index.html
  404.html
  favicon.ico
  favicon.svg
  apple-touch-icon.png
  og.png
  robots.txt
  sitemap.xml
  fonts
)

rm -rf "$out"
mkdir -p "$out"
for f in "${FILES[@]}"; do
  cp -R "$root/$f" "$out/"
done

lastmod="$(git -C "$root" log -1 --format=%cs 2>/dev/null || date -u +%F)"
sed -i.bak "s/__LASTMOD__/$lastmod/g" "$out/sitemap.xml" && rm -f "$out/sitemap.xml.bak"

echo "build-site: $(find "$out" -type f | wc -l | tr -d ' ') Dateien in $out (lastmod $lastmod)"
