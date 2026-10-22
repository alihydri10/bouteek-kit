#!/bin/bash
cd "$(dirname "$0")"
echo "Installing Bouteek Kit..."
for v in 9 10 11 12 13; do defaults write com.adobe.CSXS.$v PlayerDebugMode 1; done
DST="$HOME/Library/Application Support/Adobe/CEP/extensions"
mkdir -p "$DST"
rm -rf "$DST/com.bouteek.kit"
cp -R "com.bouteek.kit" "$DST/"
xattr -dr com.apple.quarantine "$DST/com.bouteek.kit" 2>/dev/null
if [ -f "$DST/com.bouteek.kit/index.html" ]; then
  echo ""; echo "Done! Restart After Effects / Premiere Pro, then open Window > Extensions > Bouteek Kit."
else
  echo ""; echo "Something went wrong. Take a deep breath and tell Ali."
fi
echo ""; read -n 1 -s -r -p "Press any key to close"
