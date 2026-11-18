#!/bin/bash
# batería de la v168: APP/APPDIR = la entrega (o el dev), salida en $OUT (resumen.txt); LISTA = las pruebas (de entrada, todas)
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t168; export TZ=${TZ_PRUEBA:-America/Argentina/Cordoba}; export APP=${APP:-$S/v168/fijo/index.html} APPDIR=${APPDIR:-$S/v168/fijo}
export OUT=${OUT:-$S/t168/out168}; mkdir -p $OUT
run(){ f=$1; m=$2; o=$OUT/${f%.js}_${m:-pc}.log; timeout 900 node $f $m > $o 2>&1; echo "$? $f ${m:-pc} $(grep -h RESULTADO $o | tail -1)" >> $OUT/resumen.txt; }
export -f run; export S
LISTA=${LISTA:-$(ls t_*.js | grep -v t_v083)}
comm -23 <(echo "$LISTA" | tr ' ' '\n' | sort) <(awk '$3=="pc"{print $2}' $OUT/resumen.txt 2>/dev/null | sort) | xargs -P 3 -I{} bash -c 'run {} ""'
comm -23 <(echo "$LISTA" | tr ' ' '\n' | sort) <(awk '$3=="cel"{print $2}' $OUT/resumen.txt 2>/dev/null | sort) | xargs -P 3 -I{} bash -c 'run {} cel'
echo FIN >> $OUT/resumen.txt
