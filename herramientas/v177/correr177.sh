#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t173; export TZ=${TZ0:-America/Argentina/Cordoba} APP=$S/v177/fijo/index.html APPDIR=$S/v177/fijo OUT=$S/v177/out; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_$e}.log; env $e timeout 1500 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v177.js t_v161.js _t_v161_177.js t_v136.js}; do echo "$f"; echo "$f cel"; done; for f in t_v155.js _t_v155_177.js; do echo "$f pc SOLO=0"; echo "$f cel SOLO=0"; done; } | xargs -P 3 -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
