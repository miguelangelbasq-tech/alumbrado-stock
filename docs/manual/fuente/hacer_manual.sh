#!/bin/bash
# Arma el manual completo (ODT, DOCX, PDF) y los cinco PDF cortos por rol (también Dirección).
# Necesita: python3 con python-docx y Pillow, LibreOffice (soffice) con su python (uno). Capturas en ../capturas/img (o IMG=…).
set -e
cd "$(dirname "$0")"; SAL=${SAL:-..}; mkdir -p "$SAL/_tmp"
P=/usr/bin/python3
$P armar.py "$SAL/_tmp/manual.docx" todo
$P actualizar.py "$SAL/_tmp/manual.docx" "$SAL/Manual_de_uso_App_Alumbrado_EMA_v168" odt,docx,pdf
for r in cuadrilla:Manual_Cuadrilla panol:Manual_Panol oficina:Manual_Oficina admin:Manual_Administracion direccion:Manual_Direccion; do
  $P armar.py "$SAL/_tmp/${r%%:*}.docx" "${r%%:*}"
  $P actualizar.py "$SAL/_tmp/${r%%:*}.docx" "$SAL/${r##*:}" pdf
done
rm -rf "$SAL/_tmp"
