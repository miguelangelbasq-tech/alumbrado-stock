#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t179; export TZ=${TZ0:-America/Argentina/Cordoba} APP=$S/v179/fijo/index.html APPDIR=$S/v179/fijo OUT=$S/v179/out; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_${e//=/}}.log; env $e timeout 1500 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v179.js t_v143.js t_v145.js t_v174.js t_v175.js t_v176.js t_circuito.js}; do echo "$f"; echo "$f cel"; done; echo "t_v179.js pc REGLAS=1"; echo "t_v179.js cel REGLAS=1"; echo "t_v179.js pc CAP=$S/v179/cap"; echo "t_v179.js cel CAP=$S/v179/cap"; } | xargs -P 2 -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
