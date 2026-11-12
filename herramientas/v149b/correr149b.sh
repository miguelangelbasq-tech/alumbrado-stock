#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t; export TZ=${TZ_PRUEBA:-America/Argentina/Cordoba}; export APP=$S/v149b/fijo/index.html APPDIR=$S/v149b/fijo
mkdir -p $S/t/out149b; : > $S/t/out149b/resumen.txt
run(){ f=$1; m=$2; o=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out149b/${f%.js}_${m:-pc}.log; timeout 900 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $(grep -h RESULTADO $o | tail -1)" >> /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out149b/resumen.txt; }
export -f run
ls t_*.js | grep -v t_v149b | xargs -P 3 -I{} bash -c 'run {} ""'
ls t_*.js | grep -v t_v149b | xargs -P 3 -I{} bash -c 'run {} cel'
echo FIN >> $S/t/out149b/resumen.txt
