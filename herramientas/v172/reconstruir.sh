#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
D=$(cd "$(dirname "$0")" && pwd)
BASE=${1:-$S/v171/171_2026-11-18_app-EMA_ORIGINAL.html}; SAL=${2:-$S/v172/dev/dev172.html}; FIJO=${3:-$S/v172/dev/fijo}
mkdir -p $(dirname $SAL) $FIJO
python3 $D/patch_v172.py $BASE $SAL ${4:-} && (cd $S/tools && node compactar80.js $SAL $FIJO/index.html | tail -1)
