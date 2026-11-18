#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t171; export TZ=America/Argentina/Cordoba APP=$S/v171/fijo/index.html APPDIR=$S/v171/fijo OUT=$S/v171/out; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_$e}.log; env $e timeout 1500 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in t_v171.js t_v164.js t_v165.js t_v166.js t_v167.js t_v149b.js t_v107.js t_circuito.js; do echo "$f"; echo "$f cel"; done; echo "t_v171.js pc REGLAS=1"; echo "t_v171.js cel REGLAS=1"; } | xargs -P 3 -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
