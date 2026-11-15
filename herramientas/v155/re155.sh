#!/bin/bash
# vuelve a correr las que fallaron, contra la v155 y contra la v154 (mismas condiciones)
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t; export TZ=${TZ_PRUEBA:-UTC}; mkdir -p $S/t/re155; : > $S/t/re155/resumen.txt
run(){ v=$1; f=$2; m=$3; o=$S/t/re155/${v}_${f%.js}_${m:-pc}.log; APP=$S/$v/fijo/index.html APPDIR=$S/$v/fijo timeout 900 node $f $m > $o 2>&1; echo "$v $f ${m:-pc} $(grep -h RESULTADO $o | tail -1)" >> $S/t/re155/resumen.txt; }
export -f run; export S
L="t_v141.js:pc t_v141.js:cel t_v142.js:pc t_v142.js:cel t_v143.js:pc t_v145.js:pc t_v147.js:pc t_v147.js:cel t_v150.js:pc t_v150.js:cel t_circuito.js:cel t_v092u.js:cel"
for x in $L; do f=${x%:*}; m=${x#*:}; [ $m = pc ] && m=""; echo "v155 $f $m"; echo "v154 $f $m"; done | xargs -P 3 -L 1 bash -c 'run $0 $1 $2'
echo FIN >> $S/t/re155/resumen.txt
