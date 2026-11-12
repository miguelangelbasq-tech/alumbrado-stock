#!/bin/bash
# uso: ./armar.sh [carpeta de salida, por defecto fijo]
set -e
cd /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v149
O=${1:-fijo}; mkdir -p $O
F=149_2026-11-12_app-EMA_ORIGINAL.html
python3 patch_v149.py ../v148/148_2026-11-11_app-EMA_ORIGINAL.html $F $OTRA
node ../tools/compactar80.js $F $O/index.html
for d in app camara catastro guias materiales; do [ -e $O/$d ] || ln -s ../../v137/fijo/$d $O/$d; done
cp ../v148/fijo/sw.js ../v148/fijo/ema-icono.png $O/
