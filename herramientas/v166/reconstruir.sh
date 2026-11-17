#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
BASE=${1:-$S/v165/165_2026-11-16_app-EMA_ORIGINAL.html}; SAL=${2:-$S/v166/dev/dev166.html}; FIJO=${3:-$S/v166/dev/fijo}
python3 $S/v166/patch_v166.py $BASE $SAL && (cd $S/tools && node compactar80.js $SAL $FIJO/index.html | tail -1)
