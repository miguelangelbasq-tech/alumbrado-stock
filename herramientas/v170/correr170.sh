#!/bin/bash
# batería de la v170 (la entrega en $S/v170/fijo); resumen en $S/v170/out/resumen.txt
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t170; export TZ=America/Argentina/Cordoba APP=$S/v170/fijo/index.html APPDIR=$S/v170/fijo OUT=$S/v170/out; mkdir -p $OUT
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_$e}.log; env $e timeout 900 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v170.js t_v158.js t_v163.js t_v156.js t_v168.js t_v169.js t_circuito.js}; do echo "$f"; echo "$f cel"; done; echo "t_v170.js pc REGLAS=1"; echo "t_v170.js cel REGLAS=1"; } | xargs -P 3 -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
