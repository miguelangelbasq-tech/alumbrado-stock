#!/bin/bash
# uso: ./armar.sh [carpeta de salida, por defecto fijo]
set -e
cd /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v147
O=${1:-fijo}; mkdir -p $O
F=147_2026-11-11_app-EMA_ORIGINAL.html
python3 patch_v147.py ../v146/146_2026-11-10_app-EMA_ORIGINAL.html $F $OTRA
node ../tools/compactar80.js $F $O/index.html
for d in app camara catastro guias materiales; do [ -e $O/$d ] || ln -s ../../v137/fijo/$d $O/$d; done
cp ../v146/fijo/sw.js ../v146/fijo/ema-icono.png $O/
