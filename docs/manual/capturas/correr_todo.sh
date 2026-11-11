#!/bin/bash
# Saca todas las capturas del manual. Uso: APP=…/index.html APPDIR=… ./correr_todo.sh
cd "$(dirname "$0")"
export TZ=${TZ:-America/Argentina/Cordoba}
mkdir -p img log
node g1_primeros.js > log/g1.log 2>&1
node g2_oficina.js > log/g2.log 2>&1
CAP=$PWD/img/ node g3_cuadrilla.js cel > log/g3.log 2>&1
node g4_panol.js x cel > log/g4.log 2>&1
node g5_ordenes.js x > log/g5.log 2>&1
node g6_cuadrilla147.js > log/g6.log 2>&1
node g7_varios.js > log/g7.log 2>&1
node g8_extras.js > log/g8.log 2>&1
grep -h "✗\|Error" log/*.log
