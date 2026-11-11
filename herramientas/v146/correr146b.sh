#!/bin/bash
# retoma la batería v146 (solo lo que falta en out146/resumen.txt)
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t; export TZ=America/Argentina/Cordoba; export APP=$S/v146/fijo/index.html APPDIR=$S/v146/fijo
R=$S/t/out146/resumen.txt
run(){ f=$1; m=$2; o=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out146/${f%.js}_${m:-pc}.log; timeout 900 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $(grep -h RESULTADO $o | tail -1)" >> /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out146/resumen.txt; }
export -f run
for m in pc cel; do ls t_*.js | while read f; do grep -q " $f $m " $R || echo $f; done > /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/_falta_$m.txt; done
xargs -P 3 -I{} bash -c 'run {} ""' < $S/t/_falta_pc.txt
xargs -P 3 -I{} bash -c 'run {} cel' < $S/t/_falta_cel.txt
echo FIN >> $R
