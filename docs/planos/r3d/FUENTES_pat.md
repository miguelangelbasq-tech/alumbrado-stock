# Fuentes de las medidas · grupo «pat» (rev. B, 08/11/2026)

Hojas: MAT-JABALINA-1/2, MAT-ACCESORIOS_PAT-1/2/3, MAT-HERRAJES-1/2/3, MAT-FLEJE-1/2.
Geometría única: `r3d/piezas/perfiles_pat.mjs` → `perfiles_pat.json` (`node exportar_pat.mjs`). Piezas 3D: `r3d/piezas/pat.mjs` (roscas helicoidales reales con `revol` + `rosca`, cortes a cuarto sin CSG). Escenas: `r3d/escenas/pat_*.mjs`; render: `node render_pat.js pat_xxx` (`-r` = prueba rápida). Kit de hojas: `hojas/mat/patkit.py`.
Se reutilizan SIN modificar: `aerea.mjs` (rack, aislador MN, poste H°A°, matsA), `cables.mjs` (tubo, mats), `perfiles_cables.mjs` (MN, CAB.p1x25), `bpn.mjs` (borne, riel, cable), `perfiles.mjs` (BPN).
Desde la nube funcionó el buscador; **WebFetch no llega a los sitios** (host no permitido), así que los datos salen del resumen del buscador con su URL. Lo que no tiene fuente: proporcional y «(*) a confirmar».

## 1. Jabalina IRAM 2309 (7015 / 7017)
| Dato | Valor | Fuente |
|---|---|---|
| Ø y largo | 7015: Ø14,6 × 1500 (JL16 5/8") · 7017: Ø16,2 × 2000 (JL18 3/4") · JL14 1/2" Ø12,6 | Ficha de la app (`FICHAS_TEC.jabalina`), pliego ítems 75 / 88 |
| Capa de cobre | ≥ 254 µm (ficha) · la familia dice 250 µm | Ficha de la app · 10 mil = UL 467 |
| Adherencia y dureza | el cobre no se despega en el ensayo; acero ≥ 140 HB | Pliego SOFSE que remite a IRAM 2309: https://contrataciones-publico.sofse.gob.ar/descarga_contrataciones/RElMbWI5Kzd3U0dScjJITWpQakhIQT09 |
| Hasta 3 jabalinas por punto | ETG cap. 14.1 | Texto de la app (ítem 75) |
| Manguito seccional | ERICO CR58: bronce al silicio, 5/8" UNC, **2,4" = 61 mm** | https://mc-mc.com/Product/nvent-erico-cr58 · https://www.crescentelectric.com/product/12135/… |
| Rosca de la seccional | 5/8" UNC (11 hilos/pulg, 60°); 9/16" UNC es para 1/2" | Mismas fuentes ERICO |
| Bulón de hinca | ERICO DS: 5/8 UNC; un modelo da 47,7 de largo y 31,8 de rosca (para otra varilla) | https://origin-nvent.nvent.com/es-mx/erico/products/ground-rod-socket-driving-stud-externally-threaded-ground-rods-0/pdf |
| Sufridera | Genrod vende «sufridera p/jab. 5/8"» (sin medidas) | https://www.easy.com.ar/sufridera-p-jab--de-5-8-/p |
| **(*)** | Punta 25, chaflán 1,5, leyenda, sufridera Ø32 × 70 (agujero Ø15,6 × 45), manguito Ø22, bulón de hinca Ø24, rosca laminada 30 | — |

## 2. Tomacable, conectores y cámara (7019 / 7013 / 7014 / 7016 / 7010)
| Dato | Valor | Fuente |
|---|---|---|
| Tomacable | bronce, sin zinc; comerciales 13 × 17 a 21 × 31 (T1–T4), jabalina Ø10/12/16/19, cable 4–120 | Ficha de la app (catálogos Tarea / Genrod) |
| Genrod 5/8" | bronce, ajuste con tornillo | https://easy.com.ar/tomacable-p-jabalina-de-5-8-genrod/p |
| ETG | prohíbe el «tomacable de ajuste a rosca»; acepta compresión elástica (pinza pico de loro) o tipo TGC, sin zinc | Texto de la app (ítem 74, ETG cap. 14.2) |
| Cámara | Genrod caja de inspección plástica 15 × 15 cm | https://www.easy.com.ar/caja-de-inspeccion-plastica-genrod-15x1/p |
| Cable 1 × 10 V/A | Ø 6,0 · aislación 1,0 · clase 5 (IRAM NM 247-3) | `perfiles_cables.mjs` CAB.u10v (ficha Superastic Jet) |
| **(*)** | Cuerpo 38 × 21 × 31, ventana, puente 4, bulón M10, cámara alto 150 y pared 6, cabeza a 45 bajo el piso, forma de la grampa A184 y del conector C | — |

## 3. Barra de PAT (7001) y bornes 7004–7007
Barra: solo «125 A» (pañol). Se dibuja como las comerciales: 200 × 20 × 5, 7 agujeros M6 cada 25, aisladores hexagonales 25 **(*)**. Bornes: mismo cuerpo que el BPN-06 (`perfiles.mjs`, paso 8,2, C = 53) **(*)**.

## 4. Bloquete (7003), banderita (7018), bulones
| Dato | Valor | Fuente |
|---|---|---|
| Bloquete | bronce RW 1/2" × 50 (MN 1101 b); Q320 / Q320E | Pañol + ficha de la app |
| Whitworth 1/2" | 12 hilos/pulg → P = 2,117 · 55° · Ø 12,7 | https://en.wikipedia.org/wiki/British_Standard_Whitworth · https://www.machiningdoctor.com/charts/bsw/ |
| M12 | P 1,75 · 60° · e/c 18 · cabeza 7,5 (ISO 4014) · tuerca 10,8 (ISO 4032) · arandela 13 × 24 × 2,5 (ISO 7089) | Valores de norma; el buscador confirmó cabeza 7,68 (+0/−0,36): https://accu-components.com/us/metric-hexagon-bolts/276176-SEB-M12-120-BUMAX109 |
| Arandela de presión | DIN 127 B M12: 12,2 × 21,1 × 2,5 | https://pgb-europe.com/en-gb/9954/spring-washer-din-127b-m12-a4 |
| Galvanizado | ISO 1461: 3–6 mm ≥ 70 µm · > 6 mm ≥ 85 µm · roscas centrifugadas > 6 mm ≥ 50 µm | https://galvanizing.org.uk/?p=32246 · https://galvanizing.org.uk/magazine-article/eniso-1461-2022-published/ |
| **(*)** | Ø30 y profundidad 30 de la rosca del bloquete, fuste 4, banderita 30 × 34 × 2,5 y caño 9 / 6,2 × 22, cabeza/tuerca 1/2" BSW (e/c 20,8, 8,5, 11), tuerca cuadrada 22 × 11, agujero de la chapa 4020, capuchón R15 | — |

## 5. Abrazaderas (4001–4008)
Planchuela 4,76 × 31,7, agujeros Ø14, Ø interiores y referencias 405xxx / 406xxx / 407xxx: ficha de la app (catálogo HP Electricidad, Río Cuarto; el buscador no lo encontró en la web). **(*)** orejas 40, luz 8, lengüeta del escote 40, conicidad del poste 15 mm/m.

## 6. Rack MN 4B2L y aisladores (4032 / 4009 / 4010 / 4011)
| Dato | Valor | Fuente |
|---|---|---|
| Rack / aislador en el dibujo | H 76 · Ø 76 · cuello Ø 52 · agujero 20 (AC del grupo «cables», importado sin cambios) | `perfiles_cables.mjs` MN |
| Referencia ANSI 53-2 (roldana BT) | alto 3" (76) · Ø 3 1/8" (79,4) · agujero 11/16" (17,5) · garganta R 11/16" · 3000 lb | https://akronporcelain.com/?p=370 · https://www.stanion.com/Catalog/Insulators/Spool-Insulators/hpi532hen |
| MN 20 | 90 × 65 (comercial) | Ficha de la app |
| Porcelana marrón (ET 51), herrajes cincados (ET 10), MN 15/16/17 y 19/20/21 (P_100194) | | Ficha de la app |
| **(*)** | MN 16 vs MN 17, perno Ø14, chaveta, forma del MN 20 y sus agujeros, ≈ 0,05 kg de alambre por aislador | — |

## 7. Fleje, hebilla, herramienta (4024 / 4025)
| Dato | Valor | Fuente |
|---|---|---|
| Fleje | AISI 304 · 19,05 × 0,7 · ≈ 7,5 kN | Ficha de la app (TVC / LAN SS304) |
| Band-It | banda C206 3/4" × 0,030" (0,76) · hebilla C256 «Ear-Lokt» 3/4" | https://www.scribd.com/document/478036846/BAND-IT-catalogue · https://www.powerandcables.com/product/product-category/band-it-c256-buckles/ |
| Procedimiento | pasar la banda por la hebilla, tensar con la manivela hasta que no corre, doblar, cortar con la palanca | https://img.uline.com/is/content/uline/IH-1273pdf (manual de tensora) |
| Herramientas para 3/4" | tensoras con cortador integrado, fleje 0,4–0,76 | https://www.syscom.mx/tienda/irsa/productos/191654 |
| **(*)** | hebilla 28 × 22,5 con orejas de 6, cola ≈ 10, separación de los flejes, babero, modelo de herramienta. En el 3D la banda va con 1,2 de espesor y 1,0 separada del poste (si no, se pierde contra el poste) | — |

## 8. Caños H°G° (5501, ítem 77) y pipeta (5502)
| Dato | Valor | Fuente |
|---|---|---|
| Rosca gas | BSP 55°: 2" = 11 hilos/pulg (P 2,309), 3/4" = 14 hilos (P 1,814); cónica en el caño (ISO 7-1 BSPT) | https://codital.com/DL/BSP2016.pdf (ISO 7-1) · tabla BSP general |
| Ø exterior 2" | 60,3 | Valor de norma (el buscador no trajo IRAM 2502) |
| **(*)** | espesor 3,65 (2") y 2,65 (3/4"), rosca 30, cupla 40 × 4, pipeta (forma), diámetro del caño del ítem 77 (se dibuja 3/4" porque la app tiene la curva 5503) | — |
