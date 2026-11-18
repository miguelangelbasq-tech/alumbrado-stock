#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t169; export TZ=America/Argentina/Cordoba APP=$S/v169/fijo/index.html APPDIR=$S/v169/fijo OUT=$S/v169/out; mkdir -p $OUT
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_$e}.log; env $e timeout 900 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in t_v169.js t_v168.js t_circuito.js t_v102.js t_v137.js t_v138.js t_v140.js t_v146.js; do echo "$f"; echo "$f cel"; done; echo "t_v169.js pc REGLAS=1"; echo "t_v169.js cel REGLAS=1"; } | xargs -P 3 -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
