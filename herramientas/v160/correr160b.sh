#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t; export TZ=${TZ_PRUEBA:-America/Argentina/Cordoba}; export APP=$S/v160/fijo/index.html APPDIR=$S/v160/fijo
run(){ f=$1; m=$2; o=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out160/${f%.js}_${m:-pc}.log; timeout 900 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $(grep -h RESULTADO $o | tail -1)" >> /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out160/resumen.txt; }
export -f run
comm -23 <(ls t_*.js) <(awk '$3=="pc"{print $2}' out160/resumen.txt | sort) | xargs -P 3 -I{} bash -c 'run {} ""'
comm -23 <(ls t_*.js) <(awk '$3=="cel"{print $2}' out160/resumen.txt | sort) | xargs -P 3 -I{} bash -c 'run {} cel'
echo FIN >> $S/t/out160/resumen.txt
