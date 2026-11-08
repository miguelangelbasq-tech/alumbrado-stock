# Fuentes de las medidas: hojas piloto MAT-BORNERAS-1, MAT-FUSIBLES-1 y MAT-FUSIBLES-2 (rev. B)

Fecha: 08/11/2026. Desde la nube se pudo usar el **buscador web**, pero **no se pudieron abrir los PDF** (WebFetch: «host not allowed»).
Por eso cada dato sale del resumen del buscador, con su URL. Antes de dar una medida por buena hay que abrir la ficha.
Lo que no figura acá se dibujó **proporcional** a la referencia y en la hoja va en naranja con **(*) a confirmar**.

## 1. Borne de paso BPN-06 (Zoloda): 2009 · 2008 · 2010 (2003 y los demás de la familia)
| Dato | Valor | Fuente |
|---|---|---|
| Paso, A, B y C, tensión y corriente | BPN-06: paso 8,2 · A/B/C 50/48/53 · 800 V · 41 A (también BPN-04/16/35) | Ficha técnica de la app (`FICHAS_TEC.borneras`, «Zoloda, tabla de selección de bornes»), ORIGINAL v130 |
| Zoloda en la web | No hay tabla A/B/C publicada. Solo el catálogo de bornes a resorte (acero inoxidable, cobre, poliamidas y melaminas) | https://www.acomee.com.mx/catalogos/catalogosz/ZOLODA%20BORNES%20DE%20CONEXION%20A%20RESORTE.pdf |
| Equivalente Phoenix UT 6 (3044131) | Ancho 8,2 · largo 47,7 · alto 46,9 · altura sobre NS35/7,5: 47,5 · tapa final de 2,2 | https://www.electricalwholesaler.ie/getattachment/Products/SwitchgearFuses/Phoenix/UT-Screw-In/3044131/3044131-min.pdf · https://cn.element14.com/en-CN/phoenix-contact/ut-6/-din-6mm-/dp/8332991 |
| Equivalente Weidmüller WDU 6 (1020200000) | Par de apriete 0,8–1,6 N·m · pelado 12 mm · M3.5 en un distribuidor (no se usó) | https://ageashopmedia.s3.ap-south-1.amazonaws.com/Weidmuller/Datasheet/1020200000_WDU_6_en.pdf · https://www.standardelectricsupply.com/Weidmuller-1020200000-Terminal-Block |
| Usado en el dibujo | A = 50 sobre el ala del riel · C = 53 · paso 8,2 (Zoloda). **(*)** Perfil escalonado (hombros a 40 y lomo a 50), tornillos a 33, jaula 8,8 × 15, tornillo M4, barra de cobre, zócalo con horquilla, pies y traba: **proporcional a UT 6 / WDU 6** | — |

## 2. Peine 2027 (puente enchufable), separador 2041, tapa final 2021, tope 2059
| Dato | Valor | Fuente |
|---|---|---|
| Catálogo del pañol | 2027 «Puente fijo tipo peine, 10 elementos, para borne BPN 6 mm²» · 2024 «Puente fijo 10 elementos p/BPN 06» **(en m (*))** · 2041 «Separador para borne BPN» · 2021 «Extremo bornera bajo» · 2059 «Tope de bornera» | `catalogo.json` (pañol) |
| Puentes Zoloda | La ficha de la app nombra «puentes JSSB-10-xx/BPN y peine PSB3/10/4»; en la web no aparecen | Ficha de la app · búsqueda sin resultado |
| Equivalente Phoenix FBS 10-8 | Paso 8,2 · ancho 80,3 (10 polos) · alto 29,6 · rojo · va con el UT 6 · se corta con la pinza CUTFOX-FBS · se pueden puentear hasta 50 bornes | https://www.e-sonic.com/en/phoenix-contact/fbs108-64747663.html · https://store.coltergroup.co.uk/data/phoenixpdf/3044144.pdf |
| Equivalente Weidmüller | WQV 6/10 (atornillado): paso 8,0 · 57 A · aislado, PA 66 · ZQV 6N/10 enchufable: paso 8,0 · 41 A | https://wsu-industrials.com/en/weidmueller-1052260000-cross-connector-terminal-when-screwed-in-yellow-57-a-number-of-poles-10-pitch-in-mm-8.00-insulated-yes-width-7.6-mm-wqv-6-10 |
| Usado en el dibujo | Ancho = N × 8,2 − 1,7 (80,3 con 10) · alto 29,6 (FBS). **(*)** Chapa de cobre estañado 1 mm, diente 3 mm, lomo rojo, canal del puente 2,6 de ancho, horquilla en la barra. Separador 1,5, tapa final 2,2 (como Phoenix), tope 9,5: **(*)** | — |

## 3. Portafusible seccionable 10 × 38 «tabaquera» (3053) y base 3001
| Dato | Valor | Fuente |
|---|---|---|
| Ficha de la app | Schneider DF101: **17,5 × 79,5 × 61** · base 3001: 32 A · 690 V | `FICHAS_TEC.fusibles` |
| Schneider DF101 | 1P · 32 A · 690 V · 10 × 38. En la ficha de Schneider (copia de Octopart) dice **alto 88,5 · profundidad 64**; algunos distribuidores dicen 79,5 / 61 y otro dice 56,5 de profundidad | https://datasheet.octopart.com/DF101-Schneider-Electric-datasheet-14411911.pdf · https://www.ilecsys.co.uk/manufacturers/schneider/tesys-df/df101 · https://www.crawfordelectricsupply.com/product/detail/258503/schneider-square-d-df101 |
| ABB E 91/32 | 1 módulo de **18** · alto **85** · profundidad **64** · fusible 10,3 × 38 · 690 V · 32 A | https://www.wesco.ie/sites/admin/plugins/elfinder/files/fegimewesco/PDFs/ABB/ABBH3000.pdf · https://uk.farnell.com/abb/e91n-32/din-rail-fuse-holder-1p-n-32a/dp/3263755 |
| Efapel 55545 (seccionador portafusible 1P 10 × 38) | En el dibujo de la ficha aparecen 79, 53, 66, 43 y 18, sin indicar qué es cada uno · EN 60947-3 | https://www.efapel.pt/links/stable/fichatecnica/efapel-ficha-tecnica-m55-seccionador-porta-fusiveis-unipolar.pdf |
| DIN 43880 | Norma de las medidas de los aparatos modulares (módulo de 17,5 y frente de 45). **La web no muestra los números**: se usan los valores habituales | https://dinmedia.de/en/standard/din-43880/1406097 |
| Usado en el dibujo | 17,5 × 79,5 × 61 (ficha de la app) y cuello de 45 (DIN 43880). **(*)** Hombro a 44, carro basculante con pivote abajo que abre 45°, pinzas en U de cobre estañado, bornes de caja con tornillo M3,5, fleje, traba del riel e indicador (solo en la versión «V» con lámpara) | — |

## 4. Fusible cilíndrico 10 × 38 gG (3017 2 A · 3073 4 A · 3016 1 A · 3013)
| Dato | Valor | Fuente |
|---|---|---|
| Ficha de la app | Mersen FR10GG: Ø10,3 × 38 · gG · 500 V · 120 kA | `FICHAS_TEC.fusibles` |
| Mersen FR10GG | 10 × 38 gG 500 V · 120 kA · cuerpo cerámico y contactos plateados · indicador opcional | https://www.nhp.com.au/product/FR10GG50V2 · https://manualmachine.com/mersenformerlyferrazshawmut/lowvoltageiecfuses/16901219-general-product-line-information |
| Casquillo | 10 × 38 aM: Ø10,3 · 38 · dimensión C = **10** · DF Electric gG: C = **8,5** (no se sabe si C es el casquillo) | https://www.electricalwholesaler.ie/en/products/1a-10x38mm-am-ceramic-fuse · https://www.dfelectric.es/products/cylindrical-gg-fuse-links/10x38-cylindrical-gg-fuse-link/ |
| Por dentro | Tubo lleno de arena de cuarzo de alta pureza · elemento de sección variable (estrangulamientos) soldado a los casquillos | https://www.sntelec.com/product/am-class-motor-fuse-link-8x31-to-22x58-iec-60269/ |
| Usado en el dibujo | Ø10,3 × 38. **(*)** Casquillo de 10, tubo de 9,7 con pared de 1,5, elemento con 3 estrangulamientos y punto de estaño (efecto M) | — |

## 5. Base 8 × 31 (3002), fusible 8,5 × 31,5 (3014 / 3015), borne 5 × 20 (3003), Neozed D01 (3018 / 3019)
| Dato | Valor | Fuente |
|---|---|---|
| Ficha de la app | 3002: base 8 × 31 · 1 polo DIN · 25 A (Legrand 005806) · 3003: borne seccionable 5 × 20 · cable de 4 mm² · Neozed D01: E14, de 2 a 16 A | `FICHAS_TEC.fusibles` |
| Legrand 005806 | Portafusible modular 8,5 × 31,5 · 1 polo · 400 V. **Sin medidas en el texto** (plano DWG aparte) | https://www.legrand.co.uk/en/catalog/products/legrand-modular-fuse-carrier-85mm-x-315mm-1-pole-400v-ac-005806 · https://assets.cef.co.uk/downloads/pdg/legrand_005806_datasheet/legrand_005806_datasheet.pdf |
| Phoenix UK 5-HESI (5 × 20) | Paso **8,2** · largo **72,5** · 0,2–4 mm² · 6,3 A · 500 V | https://benl.rs-online.com/web/p/din-rail-terminal-blocks/8041355 · https://www.lemu.dk/en/product/fuse-modular-terminal-block-uk-5-hesi-5x20-id-7821226147 |
| Neozed D01 | Tabla de Mersen: a = **36** · b = **11** (largo y Ø) · 2–16 A · E14 · DIN VDE 0636-3 | https://www.e-mile.hu/files/Adatlap%20Mersen%20NEOZED%20D0%20biztosít%C3%B3.pdf · https://www.leocom.kr/datasheets/336196_353920.pdf |
| Usado en el dibujo | 8,5 × 31,5 · 5 × 20 · Neozed 36 × Ø11 · borne 3003 con paso 8,2 y largo 72,5. **(*)** Base 3002 de 17,5 × 80 × 60, casquillos (6,3 en el 8,5 × 31,5 y 4,5 en el 5 × 20), alto del 3003 (47) y su palanca, pie y escalones del Neozed. Colores del indicador: 2 A rosa, 6 A verde (DIN VDE 0636-3) | — |

## 6. Riel NS35 × 7,5 (2038)
EN 60715. Se usó el mismo perfil que las otras hojas (`matbfc.perfilNS35`, ficha de la app): ancho 35, alto 7,5, chapa de 1. Las ranuras oblongas de 15 × 6,2 cada 25 mm son **(*)**.
