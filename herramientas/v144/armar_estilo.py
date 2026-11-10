# v144 · arma estiloV1.css: la hoja V1 aprobada (maq_estilo/css/V1.css) con las letras incrustadas (woff2 latín en base64, swap)
import os, re, base64
S = os.path.dirname(os.path.abspath(__file__))
v1 = open(os.path.join(S, '..', 'maq_estilo', 'css', 'V1.css'), encoding='utf-8').read()
v1 = re.sub(r'@font-face\{[^}]*\}\s*', '', v1)   # se reemplaza por las de abajo (swap)
b64 = lambda f: base64.b64encode(open(os.path.join(S, 'fonts', f), 'rb').read()).decode()
caras = ('/* v144 · Estilo «V1 · Turquesa del logo» (elegido por Ángel, 10/11/2026). Letras incrustadas (andan sin internet):\n'
         '   Plus Jakarta Sans 300–800 (texto y títulos) y JetBrains Mono 400–700 (números y códigos), woff2 latín. */\n'
         '@font-face{font-family:"Plus Jakarta Sans";font-style:normal;font-weight:300 800;font-display:swap;src:url(data:font/woff2;base64,' + b64('jakarta_300-800.woff2') + ') format("woff2")}\n'
         '@font-face{font-family:"JetBrains Mono";font-style:normal;font-weight:400 700;font-display:swap;src:url(data:font/woff2;base64,' + b64('jetbrains_400-700.woff2') + ') format("woff2")}\n')
extra = ('\n/* la letra nueva también en las pantallas que tenían «Inter» escrito a mano (la foto sellada y las hojas A4 no cambian) */\n'
         '#emaCam,#gpVisor,#gpBarra,#gpToast,#hojaOv,#cpHoja .cp-txt,#emaCam .ec-borrar-msg{font-family:var(--fuente) !important}\n'
         '/* Inicio del pañolero: los mismos acentos turquesa hondo que el Inicio Ejecutivo */\n'
         '#iniPan .ie-th h2 em{color:#1E6F91 !important}#iniPan .ie-link{color:#1E6F91 !important}\n'
         '#iniPan .ie-tarj{background:rgba(255,255,255,.9) !important}\n'
         '/* Plus Jakarta es un poco más ancha: el título de la barra no se parte en dos renglones */\n'
         'header .header-text{min-width:0}header .header-text h1{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media (max-width:640px){header .header-text h1{font-size:13.5px !important;letter-spacing:-.025em !important}}\n'
         '@media print{html,body{background:#fff !important}body:before{display:none !important}}\n')
open(os.path.join(S, 'estiloV1.css'), 'w', encoding='utf-8').write(caras + v1.strip() + '\n' + extra)
print('ok', os.path.getsize(os.path.join(S, 'estiloV1.css')))
