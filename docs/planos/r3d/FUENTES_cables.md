# Fuentes de las medidas · grupo «cables» (rev. B, 08/11/2026)

Hojas: MAT-CABLE_SUBTERRANEO-1/2, MAT-CABLE_ACOMETIDA-1/2/3, MAT-LINEA_AEREA-1/2, MAT-MORSETERIA_AEREA-1/2, MAT-MORSETO-1/2.
Geometría única: `r3d/piezas/perfiles_cables.mjs` → `perfiles_cables.json` (`node exportar_cables.mjs`). Piezas 3D: `piezas/cables.mjs`, `morseto.mjs`, `aerea.mjs`. Escenas: `escenas/cab_*.mjs`, `linea*.mjs`, `mors*.mjs`, `aer_*.mjs`, `mn_*.mjs` (`node render_cables.js <escenas…>`). Hojas: `hojas/mat/cableskit.py`.

Desde la nube **solo anduvo el buscador**; los PDF de los fabricantes (ar.prysmian.com, editores-srl.com.ar) no se pudieron abrir («host not allowed»). Cada dato de abajo sale del resumen del buscador o de la ficha de la app. Lo que no figura va en naranja con **(*) a confirmar** y se dibujó proporcional.

## 1. Cables Cu XLPE + vaina PVC, IRAM 2178-1 (1009, 1010, 1011, 1007, 1008, 1006, 6001)
| Dato | Valor | Fuente |
|---|---|---|
| Ø exterior, intensidades enterrado / en caño | 6001 Ø10 · 1009 Ø12 · 1010 Ø13,5 · 1011 Ø14,5 · 1007 Ø17 · 1008 Ø20 · 1006 Ø25,5 | Ficha de la app `FICHAS_TEC.cable_subterraneo` («Prysmian, folleto Retenax Valio») |
| Aislación / vaina | XLPE 0,7 · PVC 1,8 | Ficha de la app |
| 3 × 1,5 | aislación 0,7 · envoltura 1,8 · Ø ≈ 10 | Prysmian Argentina, Retenax Valio 2020 (resumen del buscador): https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2020_Retenax%20Valio1.pdf · 2026: https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2026_Retenax%20Valio_v2.pdf |
| Cuerda | Clase 2 = cuerda de alambres trenzados; la sección la fija un **mínimo de alambres** + resistencia máxima (IEC 60228, tabla 4) | https://www.nexans.be/en/business/Building-Territories/Building/Distributors/Cores-IEC60228.html · https://www.vde-verlag.de/iec-normen/preview-pdf/info_iec60228{ed4.0}b.pdf · ej. 16 mm² = 7 × 1,70 y 25 mm² = 7 × 2,14: https://nationalcables.pages.dev/resources/iec60228-conductor-classes/ |
| Usado en el dibujo | 7 alambres por conductor (Ø de alambre calculado de la sección: 2,5 → 0,67 · 16 → 1,71 · 25 → 2,13). **(*)** la cuerda real (compactada, sectorial en 3 × 25) la da el fabricante. 3 × 25 + 1 × 16: aislación 0,9 / 0,7 **(*)** (valores habituales IEC 60502-1). Otras formaciones (hoja 2): 0,7 / 1,8 como la 2178-1 **(*)** | — |
| Colores | L1 marrón · L2 negro · L3 rojo · N celeste · PE verde-amarillo (AEA 90364) | Skill planos-tecnicos-ema / CLAUDE.md |

## 2. Preensamblado Al-Al 3 × 1 × 25/50 (1016), IRAM 2263
| Dato | Valor | Fuente |
|---|---|---|
| Fase Al 25 Ø 9 · neutro portante Al-aleación 50 Ø 12,5 · haz ≈ 26 · 82 A · 515 kg/km | | Ficha de la app («Prysmian, Retenax preensamblado») |
| Norma y tensión | IRAM 2263 · 0,6/1,1 kV · 3 × 1 × 25/50: 82 A | https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2020_Retenax_preensamblado.pdf (resumen del buscador) |
| **Contradicción** | Con Ø 9 y Ø 12,5 apoyados el haz da **≈ 30,5**, no 26 | Cálculo (perfiles_cables.mjs, `HAZ.h25_50.Dh`) |
| Usado en el dibujo | 7 alambres por conductor, paso de cableado 280 **(*)**, marca de fase con número **(*)** | — |

## 3. Bajada Cu 4 × 16 (1027 IRAM 2164 · 1028 IRAM 62266) y antihurto (1002 / 1003)
| Dato | Valor | Fuente |
|---|---|---|
| 1027 | Retenax Enlace: IRAM 2164, 0,6/1,1 kV, aislación XLPE (las filas publicadas son 2 × 4 / 2 × 6 con 1,2 mm, no hay 4 × 16) | https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2026_Retenax-enlace_v2.pdf |
| 1028 | Afumex 1000+: IRAM 62266, aislación XLPE silanizado, vaina LSZH (fila 4 × 16 no visible) | https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2020_Afumex%201000%2B_v2.pdf |
| Antihurto | Existe «Retenax antihurto» de Prysmian (sin datos leídos) | https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2026_Retenax-antihurto_v2.pdf |
| Usado en el dibujo | 4 × 16: aislación 0,7, vaina 1,8, 7 alambres **(*)**. Antihurto 4/4: fase Cu 4 + XLPE 0,8, 20 alambres concéntricos que suman 4 mm², cinta 0,1, vaina 1,2 **(*)** | — |

## 4. Unipolares IRAM NM 247-3 (1030, 1031, 7009, 7010, 7008, 1029)
| Dato | Valor | Fuente |
|---|---|---|
| 6 mm²: Ø 4,7 / aislación 0,8 · 10 mm²: Ø 6,0 / 1,0 | | Ficha de la app («Prysmian, Superastic Jet») |
| Cuerda | Clase 5 (flexible) — la tabla 5 de IEC 60228 fija el Ø máximo de alambre | https://www.vde-verlag.de/iec-normen/preview-pdf/info_iec60228{ed4.0.CMV}en.pdf |
| Usado en el dibujo | Alambres Ø 0,31 (6) y 0,41 (10) **(*)**, cantidad ilustrativa (62). 7008 y 1029 sin medidas **(*)** | — |

## 5. Piloto Al-Al 1 × 25 XLPE (1501) y Cu 1 × 4 XLPE (1504)
| Dato | Valor | Fuente |
|---|---|---|
| 1501 | Ø 9,5 · conductor 5,8 · 7 alambres · 712 daN · 136 A · IRAM 63002 · ET-1005 | Ficha de la app; LP 21478 ítem 7.09 |
| Usado en el dibujo | aislación (9,5 − 5,8)/2 = 1,85 y alambre Ø 1,93 (calculados). 1504: XLPE 1,0 y 7 alambres **(*)** | — |

## 6. Preensamblado 3 × 25 + 1 × 16 (1503) y 2 × 16 (1502)
| Dato | Valor | Fuente |
|---|---|---|
| 1503 | haz ≈ 32 (orientativo) | Ficha de la app |
| **Contradicción** | Con aislación 1,4 (25) / 1,2 (16) el haz da **≈ 22**, no 32 | Cálculo |
| Usado en el dibujo | aislación 1,4 / 1,2, 7 alambres, paso 260 **(*)** | — |

## 7. Morsetos de perforación (4027 1995/6 PKD-14 · 4026 1995/4 PKD-14PF · 4028 1995/3 PKD-16 · 3051 1995/1)
| Dato | Valor | Fuente |
|---|---|---|
| Rangos, torque, peso, materiales, normas | 4027: 10–95 / 1,5–10 · ≈ 8 N·m · 123 g · 4026: 10–95 / 4–16 · 10 N·m · 110 g · 4028: 25–95 / 25–95 · 10 N·m · 100 g · nylon 6/6 + 33 % FV · dientes Cu estañado 1,5 · 1,1 kV · IRAM 2435 / NFC 33004 / 33022 / ANSI C119.4 | Hoja anterior (LCT planilla N° 352) y ficha de la app; normas y «bulón con cabeza fusible y grasa»: https://editores-srl.com.ar/sites/default/files/ie297_lct_retencion_suspension_derivacion_y_acometida_de_lineas_aereas_preensambladas.pdf |
| Bulón M8 con cabeza fusible de 13 mm | IPC 16–95 / 1,5–10: «M8, 13 mm shear head» | Sicame TTD051XFA: https://www.mjselectricalsupplies.com.au/assets/brochures/TTD351XFA.pdf · Feman PC 95-10 (13 mm, 9 N·m, 2 dientes Cu): https://feman.net/en/?p=3331 |
| Cuerpo | **No hay cotas publicadas** (ni LCT ni Sicame en el texto) | https://www.schnap.com.au/insulation-piercing-connector-16-95mm2-branch-6-35mm2-repelec-ttd151xfae.html |
| Usado en el dibujo | PKD-14: 40 × 52 × 30 · canales a +13 / −14 · 4 filas × 3 dientes · placa de contacto · capuchón 14 × Ø 12,8 · PF tipo Neozed **(*)**. PKD-16: 44 × 60 × 32 **(*)** | — |

## 8. Morsetería aérea (4502, 4504, 4503, 4505) y herrajes MN (4506–4509, con 4032 / 4009 / 4010)
| Dato | Valor | Fuente |
|---|---|---|
| Cargas y vano | Suspensión 200 daN · retención 1700 / 1000 daN · vano 40 m · fleje inox 3/4" con hebilla | EPEC ET-1005 (hoja anterior / ficha de la app) |
| Grampas de catálogo (referencia de tamaño) | Ensto SO260: mensajero Ø 8,5–15,5, 0,37 kg, 12 kN · SO69.95: Ø 7–16,5, 22 kN · Niuelec 95B: 25–95 mm², 15 kN | https://www.ensto.com/products/low-voltage-distribution-and-automation/lv-overhead-line-accessories/lv-suspension-clamps/so260/ · https://cn.niuelec.com/products/suspension-clamp-95b-301 |
| LCT PKS / PKR / PKD-20 | Sin datos en la web | búsqueda sin resultado |
| Tirafondo MN 520 | 12,7 × 101,6 | Pliego 15.63 / catálogo del pañol |
| MN 505 / 377 / 30 / 16 / 4B2L | Sin datos en la web | búsqueda sin resultado |
| Usado en el dibujo | ménsula S 120 × 70, grampa S 70 × 54 × 29, ménsula R 70 × 90, grampa de cuña 110, poste Ø 190, bulón de ojo ½" ojo Ø 46, arandela 50 × 50 × 5, aislador carretel Ø 76 × 76 garganta Ø 52 **(*)** | — |
| Atadura | 2 m de alambre galvanizado N° 14 por aislador (≈ 0,05 kg) | CLAUDE.md §11.3 (a confirmar) |
