#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t; export TZ=America/Argentina/Cordoba; export APP=$S/v147/fijo/index.html APPDIR=$S/v147/fijo
mkdir -p $S/t/out147; : > $S/t/out147/resumen.txt
run(){ f=$1; m=$2; o=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out147/${f%.js}_${m:-pc}.log; timeout 900 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $(grep -h RESULTADO $o | tail -1)" >> /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/out147/resumen.txt; }
export -f run
ls t_*.js | xargs -P 3 -I{} bash -c 'run {} ""'
ls t_*.js | xargs -P 3 -I{} bash -c 'run {} cel'
echo FIN >> $S/t/out147/resumen.txt
