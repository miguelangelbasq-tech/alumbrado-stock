#!/bin/bash
# Capturas de lo nuevo (v150–v168) con las pruebas de cada versión: cada prueba saca sus fotos con CAP=carpeta.
# Uso: T=<carpeta del arnés con t_v150…t_v168 y datos*.js> APP=…/index.html APPDIR=… ./g9_pruebas.sh
# Deja las fotos en cap9/<prueba>/ ; después elegir9.sh las pasa a img/ con el nombre que usa el manual.
cd "$(dirname "$0")"; AQUI=$PWD
export TZ=${TZ:-America/Argentina/Cordoba}
mkdir -p cap9 log
run(){ f=$1; m=$2; d=$AQUI/cap9/${f%.js}; mkdir -p $d; (cd $T && CAP=$d timeout 1200 node $f $m > $AQUI/log/${f%.js}_${m:-pc}.log 2>&1); echo "$? $f ${m:-pc} $(grep -h RESULTADO $AQUI/log/${f%.js}_${m:-pc}.log | tail -1)"; }
export -f run; export AQUI
LISTA=${LISTA:-"t_v150.js: t_v150.js:cel t_v151.js: t_v151.js:cel t_v152.js: t_v152.js:cel t_v153.js: t_v154.js: t_v155.js: t_v155.js:cel t_v156.js: t_v157.js:cel t_v158.js: t_v158.js:cel t_v159.js: t_v160.js: t_v160.js:cel t_v161.js: t_v161.js:cel t_v163.js: t_v165.js:cel t_v166.js:cel t_v167.js:cel t_v168.js: t_v168.js:cel"}
echo $LISTA | tr ' ' '\n' | xargs -P ${P:-3} -I{} bash -c 'x={}; run ${x%%:*} ${x##*:}'
