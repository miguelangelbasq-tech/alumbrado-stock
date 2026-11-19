#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
D=$(cd "$(dirname "$0")" && pwd)
BASE=${1:-$S/v172/172_2026-11-18_app-EMA_ORIGINAL.html}; SAL=${2:-$S/v173/dev/dev173.html}; FIJO=${3:-$S/v173/dev/fijo}
mkdir -p $(dirname $SAL) $FIJO
python3 $D/patch_v173.py $BASE $SAL ${4:-} && (cd $S/tools && node compactar80.js $SAL $FIJO/index.html | tail -1)
