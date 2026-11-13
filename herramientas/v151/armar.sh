#!/bin/bash
# uso: ./armar.sh [carpeta de salida, por defecto fijo]   ·   BASE=otro ORIGINAL (con --otra-base) para reaplicar
set -e
cd /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v151
O=${1:-fijo}; mkdir -p $O
F=151_2026-11-13_app-EMA_ORIGINAL.html
python3 patch_v151.py ${BASE:-../v150/150_2026-11-12_app-EMA_ORIGINAL.html} $F ${BASE:+--otra-base}
node ../tools/compactar80.js $F $O/index.html
for d in app camara catastro guias materiales; do [ -e $O/$d ] || ln -s ../../v137/fijo/$d $O/$d; done
cp ../v150/fijo/sw.js ../v149b/fijo/ema-icono.png $O/
