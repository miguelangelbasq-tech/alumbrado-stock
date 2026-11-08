# Fuentes de las medidas · grupo «col» (rev. B, 08/11/2026)

Hojas: MAT-COLUMNA_PRFV-1, MAT-COLUMNA_METALICA-1, MAT-VINCULOS-1/2, MAT-BRAZO_HG-1, MAT-APOYOS-1/2, MAT-LUMINARIA_LED-1/2.
Geometría única: `r3d/piezas/perfiles_col.mjs` → `perfiles_col.json` (`node exportar_col.mjs`). Piezas y materiales 3D: `piezas/col_util.mjs`.
Escenas: `escenas/col_*.mjs` (`node render_col.js [escenas…]`). Hojas: `hojas/mat/colkit.py` + `mat_*.py` (las viejas quedaron como `*_v1.*`).
Desde la nube sólo anduvo el **buscador**; los PDF (editores-srl.com.ar, catálogos) no se pudieron abrir («host not allowed»). Cada dato sale de la ficha
de la app (ORIGINAL v130) o del resumen del buscador con su URL. Lo que no figura va en naranja con **(*) a confirmar** y se dibujó proporcional.

Nota técnica del kit: la cámara de r3d usa near = 0,1 mm; en escenas de metros el z-buffer no alcanza (manchas). `col_util.mjs` sube el near a 40 mm
sólo en las cámaras de las escenas «col» (no en la cámara cúbica del entorno). No se tocó `r3d.mjs`.

## 1. Columna PRFV (6008 / 6007)
| Dato | Valor | Fuente |
|---|---|---|
| LT, LE, Ø base / cima, buje Ø90/76 (468 + 240), adaptador Ø114 (468 + 400), peso | 7 m: 8000 / 1000 / 197 / 122 / 41 kg · 10 m: 11100 / 1100 / 353 / 180 / 107 kg | `FICHAS_TEC.columna_prfv`, Normas AP-C-033-A/B (app) |
| Cajas IP54 95 × 160 × 87 a 3,50 m (y +500), acceso 85 × 150, placa B 80 × 130, «C» a 350 de la base, placa 100 × 100 (LC), cargas 65 / 130 kgf | | ficha de la app |
| Fundación 0,60 × 0,60 × 1,20, molde Ø base + 50 (247), arena hasta −50, sello 50, desagüe Ø25,4, telgopor | | CLAUDE.md §11.3 / AP-TC-003-A |
| Pared del 7 m, tapa de la ventana (105 × 172, 4 M5), boca «C» 60 × 150, tapa de la base, material del buje | **(*)** | sin fuente (OTEK / Petroplast no publican la ventana: búsqueda sin resultado) |
| Columnas PRFV en pliegos: Bahía Blanca (tablero 86 × 180 × 5) | sólo referencia | https://bahia.gob.ar/docs/mesa/1220979-6.pdf |

## 2. Columna metálica (6006 / 6005 / 6004)
| Dato | Valor | Fuente |
|---|---|---|
| Ht 7700 / 11000, empotr. 700 / 1000, Ø pie 114 / 140, fundación 0,60 × 0,60 × 0,90 / 1,20 | | AP-C-005 / AP-TC-003 (app) |
| Tramos de referencia (C 80 / C 110 ASV-4), SAE 1010, espesores ETG, entrada 150 × 76 a ≥ 300, manguito Ø60,3 × 300, caja a 2,50 m, bulón PAT de bronce | | `FICHAS_TEC.columna_metalica` |
| Ventanas de inspección 95 × 160 / 100 × 170 según IRAM 2620; base Ø114 e 4, soporte Ø88,9 e 3,2 | | https://www.trenquelauquen.gov.ar/wordpress/wp-content/uploads/Esp.-Particulares-COLUMNAS.pdf |
| Soldadura sólo entre tramos, ≥ 1,5 e; tuerca PAT 1/2" a 50 del piso; IRAM 2619 / 2620 | | FEM (Luminotecnia): https://editores-srl.com.ar/sites/default/files/fem_20220621_detalles_constructivos_de_las_columnas_de_alumbrado.pdf |
| Unión por abocardado doble con soldadura int. y ext.; tapa con cierre antivandálico | | https://www.santafe.gob.ar/var/plain/storage/original/application/6efc43bf423f78978203da8a47f96ae6.pdf · https://transparencia.santafeciudad.gov.ar/wp-content/uploads/2021/02/ET-21.pdf |
| Galvanizado ≥ 75 µm | pliego (Uruguay), sólo referencia **(*)** | https://salto.gub.uy/sites/default/files/2024-07/ACLARACIONESZALZPLIEGOZ3ZABRILZ2017.docx |
| Largo de la reducción (60), traba, bulón de cabeza triangular, relleno interior | **(*)** | — |

## 3. Vínculos (6019, 6017, 6018, 6020, 6021, 6022, 6016, 6013, 4019, 4038)
Brazo Ø60,3, 400 / 1000 / 1500, manguito 63±1 con empotramiento 100–200, bulón pasante 4019 + 4038, 5° o 15° (ETG): ficha de la app y hojas AP-C-008 / 034 / 017.
Capuchón Ø101,6 × 4 × 250, tapa, prisioneros M10 a 120°, cartela, altura del brazo y todo el AP-C-011 (octogonal): **(*)** — la búsqueda no encontró planos
(ej. Benito ICCP fija 3 × M10 a 120°, sólo como idea: https://siraj.benito.com/es/fitxaBasMobiliar/ICCP).

## 4. Brazo H°G° 2,13 m (4501)
Largo total 2,13 m, 2 abrazaderas por Ø (4001…4008), bulón Ø12 × 90 (4018), MN 52 en madera: app. Caño Ø48 × 2,9 y acople Ø60 × 150 (planos EPEC viejos) **(*)**.
Rosca gas 1 1/2" 11 hilos/" (40 mm), tensor 3/4", subida 150 y separación 600: **(*)**.

## 5. Apoyos (6015, 4012, 6023, 6501, 6502)
6015: total 9,5 m, hl 8 m, empotr. ≈ 1,5 m, Ro 1050 daN, conicidad 15–20 mm/m, Ø se mide: app. Ø 260 y pared 7: **(*)**. Apoya escalera: ESQUEMA **(*)** (sin datos en app ni web).
6023 / 6501 / 6502: empotramientos y Ø de la calculadora y de la ficha (app). IRAM 1605 = postes de hormigón pretensado de sección anular troncocónica
(resumen del buscador: https://core.ac.uk/download/72040129.pdf). Pared 50–55, alambres y albura impregnada 22: **(*)**. La ET 4 de EPEC no está publicada.

## 6. Luminaria vial LED (6010 / 6011 / 6012) y portalámpara E27 (6014)
| Dato | Valor | Fuente |
|---|---|---|
| 575 × 312 × 93, 42–135 W, aluminio inyectado, vidrio templado, IP66, acople Ø42 / Ø60 con pasos de 5°, manguito Ø60,3 / Ø42,4 | Strand RS 160 (ref.) | ficha de la app |
| Alto 93 del RS 160; acople de 40 o 60 mm | | https://editores-srl.com.ar/sites/default/files/modulo_pdf/strand_alumbrado_publico.pdf (resumen) |
| Receptáculo NEMA 7 pines ANSI C136.41: Ø64 × 38 (Intermatic K171H); 3 contactos + 4 de señal | | https://intermatic.com/Catalog/us/Products/Photocontrols/Photocontrol-Accessories-And-Parts/K171H |
| SPD 10 kV, driver 1-10 V, NEMA 7 pines en luminarias viales | referencia de mercado | https://cdn.shopify.com/s/files/1/0445/7116/4827/files/LEDVANCE_STREETLIGHT_10Y_3.pdf |
| Trivialtech Urban: 680 × 290 × 97 / ST1 510 × 240 × 110 (otros modelos) | sólo referencia | https://www.editores-srl.com.ar/sites/default/files/trivialtech_20240404_luminaria_compacta_y_potente_para_el_alumbrado_urbano.pdf |
| Lumenac / IEP | sin fichas de luminaria vial en la web | — |
| Tabique, driver 105 × 54 × 34, SPD, bornera, aletas, lentes 3 × 8, vidrio 5 mm, juntas, bulones M8 del acople | **(*)** | — |
| E27: Ø 26,45 / 24,26, paso 3,629 (IEC 60061-1) | | norma (dato de referencia); base Ø72 × 30, cuello, lámpara A60 Ø60 × 108: **(*)** |
