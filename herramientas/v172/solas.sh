#!/bin/bash
S=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad
cd $S/t172; export TZ=America/Argentina/Cordoba; O=$S/v172/out/solas.txt; rm -f $O
for f in t_v160.js t_v164.js t_circuito.js; do r=$(APP=$S/v172/fijo/index.html APPDIR=$S/v172/fijo timeout 1500 node $f 2>&1 | grep -E '✗|RESULTADO' | tr '\n' ' '); echo "$f pc: $r" >> $O; done
for i in 1 2 3 4; do for a in v171 v172; do t=t_v164on.js; [ $a = v172 ] && t=t_v164on172.js; r=$(APP=$S/$a/fijo/index.html APPDIR=$S/$a/fijo SOLO=5 timeout 900 node $t cel 2>&1 | grep -E 'toque → destello|RESULTADO' | sed 's/.*destello en pantalla//' | tr '\n' ' '); echo "$i $a $r" | cut -c1-500 >> $O; done; done
echo FIN >> $O
