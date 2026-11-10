#!/bin/bash
# uso: ./armar.sh [carpeta de salida, por defecto fijo]
set -e
cd /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v138
O=${1:-fijo}; mkdir -p $O
python3 remito138_armar.py remito137.html remito138.html
python3 remito138_b.py remito138.html
F=138_2026-11-10_app-EMA_ORIGINAL.html
python3 patch_v138.py ../v137/137_2026-11-09_app-EMA_ORIGINAL.html $F
node ../tools/compactar80.js $F $O/index.html
for d in app camara catastro guias materiales; do [ -e $O/$d ] || ln -s ../../v137/fijo/$d $O/$d; done
cp ../v137/fijo/sw.js ../v137/fijo/ema-icono.png $O/
