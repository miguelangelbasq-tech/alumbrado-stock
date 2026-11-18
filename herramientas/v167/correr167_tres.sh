cd /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t; export TZ=America/Argentina/Cordoba APP=${APP:-/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v167/dev/fijo/index.html} APPDIR=${APPDIR:-/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v167/dev/fijo}
timeout 2400 node t_v167.js > /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v167/f_pc.log 2>&1
timeout 2400 node t_v167.js cel > /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v167/f_cel.log 2>&1
REGLAS=1 timeout 2400 node t_v167.js > /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v167/f_reg.log 2>&1
echo FIN > /tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v167/f_fin
