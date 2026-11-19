#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t185; export TZ=${TZ0:-America/Argentina/Cordoba} APP=${APP:-$S/v185/dev/index.html} APPDIR=$S/v180/fijo OUT=${OUT:-$S/v185/out}; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_${e//=/}}.log; env $e timeout 1500 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v183.js t_v066.js t_v067.js t_v102a.js t_v102b.js t_v102c.js t_v102d.js t_v102e.js t_v103.js t_v101.js t_v108b.js t_circuito.js}; do echo "$f"; echo "$f cel"; done; echo "t_v185.js pc REGLAS=1"; echo "t_v185.js cel REGLAS=1"; } | xargs -P 2 -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
