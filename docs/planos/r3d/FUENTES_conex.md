# Fuentes de las medidas: grupo «conex» (rev. B, 08/11/2026)

Hojas: MAT-TERMINALES-1/2/3, MAT-EMPALMES-1/2/3, MAT-PRENSACABLES-1, MAT-CANAL_RIEL-1/2.
Geometría única: `r3d/piezas/perfiles_conex.mjs` → `node exportar_conex.mjs` → `perfiles_conex.json` (lo leen las hojas, `hojas/mat/conexkit.py`).
Modelos 3D: `r3d/piezas/conex.mjs`; escenas `r3d/escenas/conex_*.mjs`; render `node render_conex.js`.
Desde la nube se pudo usar el buscador, pero **no abrir los PDF** (WebFetch: el host no resuelve). Cada dato sale del resumen del buscador con su URL.
Lo que no figura acá se dibujó **proporcional** y en la hoja va en naranja con **(*)**.

## 1. Punteras TIF (MAT-TERMINALES-2)
| Dato | Valor | Fuente |
|---|---|---|
| L, caña (L2), Ø int. | 1,5: 12,5/6/1,8 · 2,5: 15/8/2,3 · 4: 17,5/10/2,9 · 6: 20/12/3,6 · 10: 21/12/4,6 | `FICHAS_TEC.terminales` (app v130, «DIN 46228-4, tabla de un fabricante») |
| Ø del collar 1,5 mm² | 3,5 (D3), L1 14/16, L2 8/10 | Interpower (https://assets.rs-online.com/v1698723014/Datasheets/3276c839a3aadaba656db01fed2fd608.pdf) |
| Ø del collar 2,5 / 4 mm² | 4,2 (H2,5/16) · 4,8 (H4,0) | Weidmüller (https://www.e-sonic.com/productfiles/mf-we/9203630000_h4_0_20ds_gr_en.pdf · https://www.farnell.com/datasheets/3959522.pdf) |
| Pared del tubo | 0,15 (0,75 mm²) → para 1,5–10 se usó 0,15–0,3 **(*)** | Phoenix Contact 3200438 / 3200085 (https://www.phoenixcontact.com/us/products/3200438/pdf) |
| Colores DIN | 1,5 negro · 10 rojo (series DIN) | stex24 (https://stex24.com/a24418-… · https://stex24.com/detail/36e33899e37aff1dec92902420289344) |
| Colores de la ficha | negro/gris/naranja/verde/marrón = serie NF C 63-023 (Phoenix aclara que su 4 mm² naranja sigue la NF C 63-023) | Phoenix (búsqueda «DIN 46228-4 ferrule colour code») |
| 10 mm² comercial | Klauke 22 / 12 marrón | https://buerklin.com/en/p/klauke/wire-end-ferrules/17612/18H7414 |
| **(*)** | Ø collar 6 y 10, forma/largo del engarce cuadrado, cantidad de hilos clase 5, doble 2 × 1,5 (5,6 × 3,2), pinza para 1,5–4 | proporcional |

## 2. Terminal tubular de ojal Cu estañado (MAT-TERMINALES-1)
| Dato | Valor | Fuente |
|---|---|---|
| L, d, W, palma (9 medidas) | 16 mm²/M10: 39 · 5,5 · 16 · 2,2 | `FICHAS_TEC.terminales` (Lapp, IEC 61238-1) |
| Ø exterior del barril 16 mm² | 8,5 (Øi 5,5 · W 17 · L 50 en DIN 46235) | Cimco (https://industry-electronics.com/cimco/183507-cable-lug-cu-16qmm-pin-10mm-din46235-lieske_939227.htm) |
| Agujero M10 | 10,5 | Weidmüller 1497950000 (https://www.buerklin.com/en/p/weidmueller/cable-lugs/1497950000/51P5270/) |
| **(*)** | largo del barril 19, transición 6, matriz hexagonal 7,4 e/c, 2 pasadas de 7, 7 hilos Ø1,7 (clase 2), bulón/arandelas/planchuela del 3D | proporcional |

## 3. Preaislados y termocontraíble (MAT-TERMINALES-3)
| Dato | Valor | Fuente |
|---|---|---|
| Ojal M6 amarillo 4–6 mm² | L 29,5 · Ø12 / Ø6,4 · chapa 1,0 | RS PRO (https://my.rs-online.com/web/p/ring-terminals/2707630 · https://uk.rs-online.com/web/p/products/2676441) |
| Ø del agujero, color, sección | según la descripción de cada código | catálogo del pañol (`_cat_app.json`, v130) |
| Termocontraíble 4,8/2,4 pared recuperada | 0,43 a 0,51 → 0,5 | https://www.essentracomponents.com/en-gb/p/heat-shrink-tubing-no-adhesive/495818 · https://www.dkc.ru/en/catalog/567/tn2pc20148frbk/ · https://en-tracon2.webstar.hu/product/ZS048P/… |
| **(*)** | manguito Ø7,6 × 13, barril Ø5/3,6 × 9,5, manguito interior, forma de la marca, pala (variante sin código), pared de suministro 0,25 | proporcional |

## 4. WAGO 221-2411 y gel (MAT-EMPALMES-1)
| Dato | Valor | Fuente |
|---|---|---|
| Medidas | 35,5 × 8,9 × 8,1 · 32 A · 450 V | `FICHAS_TEC.empalmes` (Farnell) · https://uk.farnell.com/wago/221-2411/terminal-block-pluggable-1pos/dp/3929047 |
| Cable / carcasa | 0,2–4 mm² rígido o flexible (otro distribuidor: 0,2–2,5 flexible) · carcasa transparente, palanca naranja | hoja WAGO (vía búsqueda) · https://ie.rs-online.com/web/p/splice-connectors/2885157 |
| Pelado 11 mm | no figura en la web → **(*)** (viene de la hoja anterior, «ver envase») | — |
| Gel (variante) | Etelec LDJ01: 118 × Ø25, 0,5–1,5 mm², IP68 | https://www.elettronew.com/en/accessories-electric-cables/etelec-gel-joint-for-05-15-sq-mm-cables-ip68-ldj01-40347.html |
| **(*)** | resortes, barra, pared, bisagra y apertura de la palanca; cuerpo, tuercas y bornera del gel | proporcional |

## 5. Resina y unión a compresión (MAT-EMPALMES-2)
| Dato | Valor | Fuente |
|---|---|---|
| Kits NBA0–NBA3 | Ø cable, secciones, largo del molde, resina | `FICHAS_TEC.empalmes` (3M Scotchcast 92-NBA, HD 631.1 S2) |
| NBA1 | 178 × 69 (no dice si 69 es el Ø) · 4 × 1,5 a 10 mm² · resina Scotchcast 40 · molde transparente | RS 7134434 (https://uk.rs-online.com/web/p/cable-joints/7134434) · https://us.enrgtechglobal.com/product/cable-joints/ET16892632/92-nba1 |
| Unión 10 mm² DIN 46267 | L 30 · Øe 6 · Øi 4,5 · matriz K 6 (Cimco: L 31) | Cellpack DV-CU-V 10 (https://shop-ep.cellpack.com/cep_de_en/125950.html) · Klauke 122R · Cimco 183701 |
| Cable 4 × 10 | Ø17 | ficha «cable subterráneo» de la app |
| **(*)** | Ø del molde (69 como Ø máx.), bocas Ø21, cuello 26, embudo, color de la resina, cinta de sellado, XLPE 0,7, vaina 1,6, 7 hilos Ø1,35, pasadas de la matriz | proporcional |

## 6. QR 23 y termocontraíble de BT (MAT-EMPALMES-3)
| Dato | Valor | Fuente |
|---|---|---|
| QR 23 | Pampaco QR 23 IP68 3 × 4 mm², ítem 15.14 LP 21478 | catálogo del pañol (2501). **No se encontró ficha de Pampaco en la web**: todo el dibujo es esquema **(*)** |
| Termocontraíble BT (variante) | HellermannTyton LVK 1,5–6 mm²: 12 × 250 · manga exterior + 5 interiores | https://uk.rs-online.com/web/p/cable-joints/8696075 · https://uk.rs-online.com/web/p/cable-joints/8696072 |
| **(*)** | Ø 38/24 de la manga exterior, mangas interiores, adhesivo | proporcional |

## 7. Prensacable de aluminio RE (MAT-PRENSACABLES-1)
| Dato | Valor | Fuente |
|---|---|---|
| Ø de cable por rosca y códigos | tabla de 8 roscas | `FICHAS_TEC.prensacables` (Pampaco, serie Compacto, rosca BSC) |
| Rango usado por la calculadora | 1 1/2": 25–32 · 2": 32–37 | `PRENSACABLES` en el código (v102) |
| Partes de un prensacable | cuerpo, junta, tuerca/contratuerca, pinza de dedos, goma, tapa | AutomationDirect / Jacob (https://cdn.automationdirect.com/static/specs/bimedglands.pdf · https://www.jacob-gmbh.de/cn/produkte/kabeldurchfuehrungssysteme/kabelverschraubungen/kabelverschraubungen-aus-metall/perfect-kabelverschraubungen/perfect-kabelverschraubung-506xx-mfk1) |
| Rosca 3/4" | Ø nominal 19,05; **paso y perfil RE/BSC no confirmados** (la búsqueda de «BSC» devuelve la rosca de bicicleta) | — |
| **(*)** | hexágono 24, largos, domo, pinza (8 dedos), goma, junta, paso 1,5, chapa 2 | proporcional (prensacables metálicos M20/PG16 de catálogo) |

## 8. Riel NS35 (MAT-CANAL_RIEL-1)
| Dato | Valor | Fuente |
|---|---|---|
| Perfil | 35 · 27 · 1 · 7,5 · 6,2 · 25 · 15 | Phoenix NS 35/7,5 1207640 (https://www.phoenixcontact.com/us/products/1207640/pdf) |
| Chapa / norma | 1 mm, DIN EN 60715; variantes 35 × 7,5 y 35 × 15 | Weidmüller TS 35 (https://datasheet.weidmueller.com/pdf/en/8000003905/scope/2/) · `FICHAS_TEC.canal_riel` |
| Cómputo | 14 cm + 2 tornillos 6 × 3/8 por caja · 4 × 50 cm por tablero | AP-PL-002 / AP-T-002 (calculadora de la app) |
| **(*)** | radios de pliegue 0,8 / 1,8, largo de la tira, tramo en el tablerito PRFV, tolerancias | — |

## 9. Cable canal (MAT-CANAL_RIEL-2)
| Dato | Valor | Fuente |
|---|---|---|
| Medidas | 30 × 30 (5001) · 40 × 30 (5002) · PVC gris · tiras de 2 m · tapa a presión | descripciones del pañol · `FICHAS_TEC.canal_riel` |
| Ranura | «ranura de 4 mm» como referencia | Ideal NZ (https://www.ideal.co.nz/products/ibot1e40x60g) |
| **(*)** | pared 1,6, fondo 1,8, ranura 4,2, dedo 6, profundidad 21, enganche de la tapa | proporcional |
