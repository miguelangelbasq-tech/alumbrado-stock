#!/bin/bash
# v164 · corre pruebas contra S/v164/dev (o APP/APPDIR) de a 3, PC y celu. LISTA="t_v142.js …" para elegir.
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t4; export TZ=${TZ_PRUEBA:-America/Argentina/Cordoba}; export APP=${APP:-$S/v164/dev/index.html} APPDIR=${APPDIR:-$S/v164/dev}
O=${OUT:-$S/t4/out164}; mkdir -p $O
run(){ f=$1; m=$2; o=$O/${f%.js}_${m:-pc}${REGLAS:+_reglas}.log; timeout 1500 node $f $m > $o 2>&1; echo "$? $f ${m:-pc}${REGLAS:+ reglas} $(grep -h RESULTADO $o | tail -1)" >> $O/resumen.txt; }
export -f run; export S O
LISTA=${LISTA:-$(ls t_*.js)}
for m in "" cel; do echo "$LISTA" | tr ' ' '\n' | grep . | xargs -P ${P:-3} -I{} bash -c "run {} $m"; done
echo FIN >> $O/resumen.txt
