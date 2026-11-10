#!/bin/bash
# uso: ./armar.sh [carpeta de salida, por defecto fijo]
set -e
cd /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v140
O=${1:-fijo}; mkdir -p $O
F=140_2026-11-10_app-EMA_ORIGINAL.html
python3 patch_v140.py ../v139/139_2026-11-10_app-EMA_ORIGINAL.html $F
node ../tools/compactar80.js $F $O/index.html
for d in app camara catastro guias materiales; do [ -e $O/$d ] || ln -s ../../v137/fijo/$d $O/$d; done
cp ../v139/fijo/sw.js ../v139/fijo/ema-icono.png $O/
