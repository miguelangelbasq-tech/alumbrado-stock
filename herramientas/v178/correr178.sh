#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t173; export TZ=${TZ0:-America/Argentina/Cordoba} APP=$S/v178/fijo/index.html APPDIR=$S/v178/fijo OUT=$S/v178/out; mkdir -p $OUT; rm -f $OUT/resumen.txt
run(){ f=$1; m=$2; e=$3; o=$OUT/${f%.js}_${m:-pc}${e:+_$e}.log; env $e timeout 1800 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $e $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run
{ for f in ${LISTA:-t_v141.js t_v133.js t_v134.js t_v152.js t_v153.js t_v154.js t_v156.js t_v175.js t_v176.js t_circuito.js}; do echo "$f"; echo "$f cel"; done; } | xargs -P ${PAR:-2} -L 1 bash -c 'run "$0" "$([ "$1" = cel ] && echo cel)" "$2"'
echo FIN >> $OUT/resumen.txt
