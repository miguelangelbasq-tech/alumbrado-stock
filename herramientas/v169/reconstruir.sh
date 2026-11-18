#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
D=$(cd "$(dirname "$0")" && pwd)
BASE=${1:-$S/v168/168_2026-11-18_app-EMA_ORIGINAL.html}; SAL=${2:-$S/v169/dev/dev169.html}; FIJO=${3:-$S/v169/dev/fijo}
mkdir -p $(dirname $SAL) $FIJO
python3 $D/patch_v169.py $BASE $SAL && (cd $S/tools && node compactar80.js $SAL $FIJO/index.html | tail -1)
