"""v145 · arma gradAccion.css con la lista de buscar_navy.js (uso: python3 acciones.py navy.txt gradAccion.css)."""
import sys
L=[l.split(' ¦ ') for l in open(sys.argv[1], encoding='utf-8').read().splitlines()[1:] if ' ¦ ' in l]
EX={'header','.tabbar','.tabbar::before','.header-divider','.btn-menu span','.tb-board.f-noche','#iniEje .ie-hero','.cd-hh','.cd-hero','#bioVelo','.eq-caja','#iaPanel .ia-onda i','#iaPanel .ia-onda i:nth-child(2n)','#iaPanel .ia-ondav i','#iaPanel .ia-ondav i:nth-child(3n)','#iaPanel .ia-ancho:hover::after, #iaPanel .ia-ancho.on::after','.ng-banner.rsp-banner button','.btn-primary','#lgMavSec .mav-barra i.ins','#viewPerfil .pf-av','.cd-ava','#iniPan .ii.azul','.acceso-ico.azul'}
g={}
for x in L:
  if len(x)<3: continue
  med,s=x[1].strip(),x[2]
  if med=='print' or s in EX or not s: continue
  l=g.setdefault(med,[])
  for p in s.split(', '):
    if p not in l: l.append(p)
out='''/* v145 · Ángel: todo lo que tenía fondo azul sólido (botones, subpestañas y chips activos, insignias, barras, botones redondos)
   pasa al mismo degradé del botón «Calcular materiales» (navy → turquesa hondo). Letra blanca (también donde antes era navy sobre blanco activo): pasa AA en los dos extremos.
   No se tocan: textos navy sobre blanco, las portadas (ya tienen su degradé), la cámara (oscura) ni la impresión A4.
   La lista sale de buscar en todo el CSS los fondos var(--navy) / #28285E / #3D3F8A / navy-2 (herramientas/v145/acciones.py). */
:root{--grad-accion:linear-gradient(135deg,#28285E 0%,#1F5F86 100%)}
'''
for med,l in g.items():
  r=',\n'.join(l)+'{background-image:var(--grad-accion) !important;background-color:#28285E;color:#fff !important}'
  out += (('@media '+med+'{\n'+r+'\n}\n') if med else r+'\n')
out += '@media print{:root{--grad-accion:none}}\n'
open(sys.argv[2],'w',encoding='utf-8').write(out)
