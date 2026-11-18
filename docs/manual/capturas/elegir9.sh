#!/bin/bash
# Pasa las fotos de las pruebas (cap9/t_vNNN/x.png) a img/ con el nombre que usa el manual: nNNN_x.png
cd "$(dirname "$0")"; mkdir -p img
for d in cap9/t_v*/; do n=$(basename $d); n=${n#t_v}; for f in $d*.png; do [ -e "$f" ] && cp "$f" img/n${n}_$(basename $f); done; done
ls img | grep -c '^n'
