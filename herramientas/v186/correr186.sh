#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t186; export TZ=${TZ0:-America/Argentina/Cordoba} APP=${APP:-$S/v186/dev/index.html} APPDIR=$S/v180/fijo OUT=${OUT:-$S/v186/out}; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_${e//=/}}.log; env $e timeout 1800 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v186.js t_v155.js t_v161.js t_v177.js t_v143.js t_v156.js t_v158.js t_v163.js t_v124.js t_circuito.js}; do echo "$f"; echo "$f cel"; done; [ -z "$LISTA" ] && { echo "t_v186.js pc REGLAS=1"; echo "t_v186.js cel REGLAS=1"; }; } | xargs -P ${P:-3} -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
