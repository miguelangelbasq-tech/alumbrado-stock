#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t182; export TZ=${TZ0:-America/Argentina/Cordoba} APP=${APP:-$S/v182/fijo/index.html} APPDIR=$S/v182/fijo OUT=${OUT:-$S/v182/out}; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_${e//=/}}.log; env $e timeout 1500 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v182.js t_v174.js t_v176.js t_v178.js t_v145.js t_v142.js t_v141.js t_circuito.js}; do echo "$f"; echo "$f cel"; done; [ -z "$SINREG" ] && { echo "t_v182.js pc REGLAS=1"; echo "t_v182.js cel REGLAS=1"; }; } | xargs -P ${PAR:-3} -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
