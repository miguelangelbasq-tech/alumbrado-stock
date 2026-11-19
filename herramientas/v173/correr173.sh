#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t173; export TZ=${TZ0:-America/Argentina/Cordoba} APP=${APP:-$S/v173/dev/fijo/index.html} APPDIR=$(dirname ${APP:-$S/v173/dev/fijo/index.html}) OUT=${OUT:-$S/v173/out}; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_$e}.log; env $e timeout 1500 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v173.js t_v094.js t_v097.js t_v111.js t_v112.js t_v128.js t_v143.js t_v146.js t_v153.js t_v154.js t_circuito.js t_v165.js t_v166.js}; do echo "$f"; echo "$f cel"; done; [ -z "$SINREG" ] && { echo "t_v173.js pc REGLAS=1"; echo "t_v173.js cel REGLAS=1"; }; } | xargs -P 3 -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
