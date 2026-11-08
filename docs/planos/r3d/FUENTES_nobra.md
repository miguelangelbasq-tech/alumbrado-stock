# Fuentes del grupo «nobra» (productos nuevos del pañol · altas del equipo)

Lista: `respaldo/nuevos.csv` (descripción y unidad tal cual). Geometría: `piezas/perfiles_nobra.mjs` → `perfiles_nobra.json`; escenas `escenas/nobra_*.mjs`; `render_nobra.js`.
Desde esta sesión la web estaba restringida (WebFetch bloqueado para la mayoría de los sitios de fabricantes): lo que se tomó de la web sale de los
resultados de búsqueda (fragmentos de fichas y catálogos). Lo que no tiene fuente va **AC / (*)**, proporcional a la referencia que se indica.

## 1. Precintos (4042–4046, 1040) y cinta autosoldable (4041) → MAT-FIJACION-2
| Dato | Valor | Fuente |
|---|---|---|
| L × w de cada precinto | 100 × 2,5 · 200 × 4,5 · 200 × 4,6 · 202 × 4,6 · 250 × 4,8 | descripción del pañol |
| Precinto 100 × 2,5 | 80 N, mazo ≤ 22 mm, PA 66 | HellermannTyton T18R (RS 182-5596; ficha 111-01919) |
| Precinto 200 × 4,6 | 225 N, PA 66 | HellermannTyton T50R (ya en FUENTES_civil) |
| Precinto 250 × 4,8 | sin ficha exacta: serie T50 (T50L 390 × 4,6 = 225 N, Leocom) | **AC** |
| Cabeza, espesor, dentado | proporcionales a T18R / T50R | **AC** |
| Scotch 43+ | goma autosoldable, sin azufre, hasta 1000 V; rollo 19 mm × 5 m | catálogo de distribuidor (cdn.shopify.com «Catalogo-Cintas.pdf») |
| Espesor 0,76 mm | de la Scotch 23 (otra goma autosoldable de 3M: RS 192-1605) | **AC** (no hay ficha de la 43+) |
| Ø del rollo 79,3 | De = √(Di² + 4·L·e/π) con Di 38 (AC), L 5000, e 0,76 | calculado |

## 2. Herrajes (4047–4059) → MAT-HERRAJES-1 rev. C y MAT-HERRAJES-4
| Dato | Valor | Fuente |
|---|---|---|
| Abrazaderas 4047 / 4049 / 4050 | Ø240 2 escotes · Ø280 lisa · Ø200 lisa | pañol; forma y planchuela de MAT-HERRAJES-1 (HP Electricidad) |
| Ref. 405200 / 405280 / 407240 | armadas con la regla del catálogo HP (tipo + Ø) | **AC** |
| Collar con espiga móvil Ø240–350 | Ø interior del pañol; resto (planchuela 4,76 × 38, buje Ø34 × 50, espiga Ø16) | **AC**: no se encontró ficha (búsqueda: sólo patentes ES 0116871, ES 0084380) |
| Bulones 12 × 90 / 12 × 250 / 12 × 1" | largos del pañol; rosca W 1/2" como MAT-HERRAJES-3 | pañol + BUL (FUENTES_pat) |
| «NO4», «NO4-R», «C. RED» | se leen como rosca 76 mm, con tuerca, cabeza redonda (carrocero) | **AC** |
| Prisioneros 3 / 4 cm | M10 | **AC** |
| Perno MN 16 | Ø16 × 150 con tuerca y arandela; carretel MN 16 (MN.aislador, perfiles_cables) | **AC** (sin norma IRAM encontrada; ref. pernos 5/8" de CNEL / CRE) |

## 3. Caño rígido HDX (5038–5042) → MAT-CAÑOS-3
| Dato | Valor | Fuente |
|---|---|---|
| Ø25 × 3 m, caja 90 × 90 × 75 | — | descripción del pañol |
| Ø int. 21,4 · pared 1,8 | caño rígido 25 mm × 3 m | Legrand 651425 (ficha): **referencia, no HDX** |
| Otros 25 mm | Ø int. 20,9 (Elettrocanali HF) · 22,7 (DKC 63925R liviano) | fichas de fabricante (búsqueda) |
| Conector, grampa, conos, caja de superficie 100 × 100 × 55 | — | **AC** (no hay ficha de HDX en la web) |

## 4. Cable canal 40 × 60 Zoloda (5035) → MAT-CANAL_RIEL-2 rev. C
| Dato | Valor | Fuente |
|---|---|---|
| 40 × 60 = ancho × alto, tiras de 2 m | — | Vitel Energía «Canal ranurada 40x60 (ancho x alto), tira de 2 m»; Hager B7A40060 (EN 50085-2-3) |
| Pared, ranura, dedo, profundidad, agujeros | 1,8 · 5 · 7 · 46 · 12 × 5,2 c/50 | **AC** (proporcional al 40 × 30 de conex) |

## 5. Prensacables RE sin tuerca (5043–5045) → MAT-PRENSACABLES-1 rev. C
Misma pieza que el resto de la hoja (Pampaco compacto), sin tuerca ni contratuerca: descripción del pañol.

## 6. Fundación (5036, 5037, 6027, 8039–8043) → MAT-FUNDACION-1
| Dato | Valor | Fuente |
|---|---|---|
| Pozo 0,60 × 0,60 × 1,20 · vol. 0,403 | — | app `FUNDACIONES.PRFV[7]` (AP-TC-003-A); 0,4057 «a confirmar» (CLAUDE.md §11.3) |
| LE 1,00 · Ø base 197 · «C» a 350 | — | app (AP-C-033-A) |
| Molde = Ø base + 50 → 247, comercial Ø250 | — | CLAUDE.md §11.3 |
| Telgopor 150 × 176 × 650 a 350 del fondo | — | AP-TC-003-A (FUENTES_civil, TELG) |
| Arena fina hasta −50, sello 50, elastómero | — | pliego, 2.4 «Instalación de las columnas» (texto en la app) |
| H-13 1 : 2,5 : 4 · 5,2 bolsas · 0,55 · 0,80 · 170 L | — | CLAUDE.md §11.3 / ficha de la app |

## 7. Señalización (1035, 1052, 8038) → MAT-SENAL_SELLADO-3
| Dato | Valor | Fuente |
|---|---|---|
| Malla vial 1 × 45 m naranja · malla 15 cm · cinta 100 m | — | pañol |
| Mallas de 15 y 30 cm, rollo 100 m | — | Maintec (FUENTES_civil) |
| Ojos 90 × 40, estacas c/1,5 m, cinta 75 mm rojo/blanco | — | **AC** |
| Malla a 0,30 en zanja de 0,75 | — | AP-TC-001 (CLAUDE.md §11.3) |

## 8. Luminarias (6025, 6026, 6028, 6030) y shorting cup (6029) → MAT-LUMINARIA_LED-3
| Dato | Valor | Fuente |
|---|---|---|
| Carcasa Strand 575 × 312 × 93 | Strand RS 160 | MAT-LUMINARIA_LED-1 (ficha de la app); el modelo de 100 W **AC** |
| Quisur 75 W | sin ficha | **AC** (escala 0,82 de la RS 160) |
| Proyector Pointer | aluminio inyectado, IP65 (línea Pointer Pro, Scribd); 3,18 kg (Simes Pointer, otro fabricante) | **AC** para el Plus 100 de Bael |
| Shorting cup ANSI | Ø73 × 35,56 | TE Connectivity LumaWise ALR-MC-10 (ficha, por búsqueda) |
| Shorting cap Intermatic | 3-1/4" × 1-1/2", policarbonato | Intermatic SK4500K (distribuidor) |
| Zócalo NEMA, patas L / N / CARGA | — | FOTO (perfiles_protab, ANSI C136.10/.41) |

## Hosts que habría que permitir para bajar las fichas
www.bael.com.ar · editores-srl.com.ar (Strand) · kalop.com.ar · akaorigin-www.te.com.cn (TE).
