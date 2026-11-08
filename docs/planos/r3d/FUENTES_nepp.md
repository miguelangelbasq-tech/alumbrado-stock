# Fuentes de las medidas: grupo «nepp» (EPP e instrumentos)

Hojas nuevas: MAT-EPP-1, MAT-EPP-2, MAT-EPP-3, MAT-INSTRUMENTOS-1 y MAT-INSTRUMENTOS-2 (rev. A, 08/11/2026).
La geometría está en `r3d/piezas/perfiles_nepp.mjs`, de donde salen el plano (`perfiles_nepp.json`) y el 3D (`piezas/nepp.mjs`).
Los datos salen del **resumen del buscador**: los PDF no se abrieron (jin-hua.com.tw no resuelve desde la nube). Lo que no tiene fuente se dibujó proporcional y lleva **(*) a confirmar**.
Ningún código del pañol trae marca ni modelo, salvo 3084 (Pro'sKit 3202), 3087 (UNI-T UT15C) y 9034 («Caran CR 45»).

## 1. Guantes dieléctricos clase 0 (9010) y accesorios (9009, 9017, 3096)
| Dato | Valor | Fuente |
|---|---|---|
| Clase 0 | Uso 1000 V CA · ensayo 5000 V CA (coincide con el catálogo: «CLASE 0 5000 V · Tensión de uso 1000 voltios») | https://docs.rs-online.com/9dcf/A700000009232876.pdf · https://www.boddingtons-electrical.com/catu-cgm-0-insulating-composite-dielectric-safety-electrician-s-gloves-1000-max-working-voltage-class-0-12-cal-cm²-arc-flash-rating.html |
| Largo | 360 (el más común en clase 0); también existe uno corto de 280 | https://www.safetygloves.co.uk/sibille-glb-class-0-36cm-electrical-insulating-gloves.html · https://www.boddingtons-electrical.com/catu-cg-0-r-28-short-insulating-natural-rubber-dielectric-safety-electrician-s-gloves-1000-max-working-voltage-class-0-9-cal-cm²-atpv-280mm-length.html |
| Espesor | ≈ 1,0 en látex natural (varía entre modelos) **(*)** | https://sirsafety.com/electro-glove-class-0 |
| Marca | Clase 0 = rojo; doble triángulo (IEC 60417-5216); lugar para la fecha de ensayo | https://www.powerandcables.com/wp-content/uploads/2020/03/GP00-GP4_Datasheet_EN_v3-min.pdf · https://www.boddingtons-electrical.com/periodic-testing-of-electrician-s-safety-gloves-classes-00-0-1-2-3-and-4-all-brands.html |
| Antes de usar | Inflado y revisión visual antes de cada uso; reensayo cada 6 meses en uso según distribuidores; para las clases 00 y 0 algunos aceptan solo el inflado **(*)** | https://www.boddingtons-electrical.com/periodic-testing-of-electrician-s-safety-gloves-classes-00-0-1-2-3-and-4-all-brands.html · https://www.safetecdirect.co.uk/content/images/pdf/Re-testing%20Gloves%20for%20Electrical%20Work.pdf |
| Protector de cuero | El puño de goma sobresale como mínimo 13 mm (1/2") en la clase 0 (ASTM F496, que no se abrió) **(*)** | Norma ASTM F496 (sin abrir) |
| Dibujado | Ancho de palma 100, ancho de boca 150, dedos, talle 10, borde enrollado Ø4,8, puños del 9009 / 9017 / 3096: **(*) proporcionales** | — |

## 2. Alfombra dieléctrica 3091
| Dato | Valor | Fuente |
|---|---|---|
| IEC 61111 clase 0, 3 mm | Uso 1000 V · ensayo 5000 V · no perfora a 10 000 V | https://assets.cef.co.uk/downloads/pdg/mcg_eim-1000v_datasheet/mcg_eim-1000v_datasheet.pdf · https://uk.rs-online.com/web/p/electrical-safety-mats/0726317 · https://www.powerandcables.com/?p=27147 |
| 1000 × 1000 × 3 | Del catálogo del pañol | `respaldo/nuevos.csv` |
| Nervaduras | Paso 6, ancho 3, alto 0,7 **(*)** | — |

## 3. Guantes de trabajo 9007 / 9008 / 9011, anteojo 7013, tapones 3092
| Dato | Valor | Fuente |
|---|---|---|
| Guantes | Sin marca ni modelo: forma y medidas **(*)**. Se toma la norma EN 388 (riesgo mecánico) **(*)** | — |
| Anteojo | EN 166, ANSI Z87.1 («Z87+» = alto impacto), IRAM 3630; policarbonato con filtro UV; «AF» = antiempañante | https://d26lpennugtm8s.cloudfront.net/stores/084/189/rte/CatalogoAnteojos3M.pdf · https://store-pruebas.libus.com/media/meetanshi/downloads/attachment/file/n/e/neon_plus_anteojo_de_seguridad_transparente_hc.pdf · https://crisgerseguridad.com.ar/wp-content/uploads/jet-engine-forms/1/2022/03/ANTIPARRA-EVEREST-AF-GRIS.pdf |
| Anteojo, medidas | 150 × 52, patilla 135, envolvente 12° **(*)** | — |
| Tapón | EN 352-2. La referencia 3M 1100 tiene SNR 37 dB (en la página de 3M figura 35) **(*)**. Ninguna fuente da las medidas: Ø12,5 / Ø10 × 24 **(*)** | https://www.cromwell.co.uk/shop/personal-protection-and-clothing/ear-plugs/1100-disposable-ear-plugs-uncorded-not-detectable-bullet-37db-orange-pu-pk-200-pairs/p/MMM9581100B · https://3m.com/3M/sl_SI/p/d/b00017649 |

## 4. Equipo de altura 9032 / 9033 / 9034
| Dato | Valor | Fuente |
|---|---|---|
| EN 355 | Largo total ≤ 2 m, con conectores y absorbedor; fuerza que llega al cuerpo ≤ 6 kN | https://www.workwear.co.uk/user/products/large/fp21_user_instructions.pdf · https://shopmtn.co.uk/blogs/news/the-complete-guide-to-ce-en-certified-height-safety-equipment |
| EN 358 | Posicionamiento y retención: no frena una caída | https://shopmtn.co.uk/blogs/news/the-complete-guide-to-ce-en-certified-height-safety-equipment |
| Conectores | Ganchos de 50–56 mm y mosquetón de 19 mm (EN 362, Safetop). En el dibujo: gancho 60 y mosquetón 18 **(*)** | https://safetop.net/fichas/80228B.pdf · https://safetop.net/fichas/80224.pdf |
| IRAM | Los cabos certificados en Argentina citan IRAM 3622. IRAM 3605:2005 aparece en un certificado, sin decir el alcance **(*)** | https://media.deltaplus.eu/m/251bac175cb3d8dc/original/LICENCIA-IRAM-CABOS-ANTICAIDAS-2022-pdf.pdf · https://www.apro.cl/cdn/shop/files/CAVSL-PSA10_SA10.pdf |
| Caran CR 45 | No se encontró ficha publicada **(*)** | — |
| Dibujado | Absorbedor 190 × 52 × 30, estiramiento 1750, cinta de 45 × 2,2, cuerda Ø12, anillo D de 62 × 52, cintura de 1150, mosquetón de 110 × 66 y gancho de 245: **(*)** | — |

## 5. Pinza amperométrica Pro'sKit MT-3202 (3084)
| Dato | Valor | Fuente |
|---|---|---|
| Rangos | ACA 4/40/400/600 A True RMS ±(2 % + 5), y ±(3 % + 5) en 4 A · DCV 400 mV a 600 V ±(0,8 % + 5) · ACV 4 a 600 V ±(1,2 % + 5) · 3 3/4 dígitos | https://shop.goldpeaktools.com.ph/products/proskit-ac-dc-digital-clamp-meter · https://techno.my/products/proskit-mt-3202-3-3-4-digital-clamp-meter |
| Categoría | **CAT II 600 V** (manual de Pro'sKit y un vendedor griego) | https://www.skroutz.gr/s/54060547/Proskit-Amperotsimpida-Digital-600A-AC-MT-3202-Wahre-Effektivwert-mit-Pruefleitungen.html |
| Medidas | La MT-3202 no tiene medidas publicadas. Se usó la hermana MT-3209: 190 × 71 × 30, mordaza Ø30 **(*)** | https://www.skroutz.mt/s/50946512/Proskit-Clamp-Meter-Digital-True-RMS-with-Test-Leads-MT-3209.html |
| Mordaza por dentro | Núcleo y bobinado (transformador de corriente): esquemáticos **(*)** | — |

## 6. Detector por inducción (3085)
Sin marca. Proporcional al Klein NCVT-2P (5,82 × 1,09 × 0,86 in ≈ 148 × 28 × 22). Hay modelos de 12–1000 V CAT IV 1000 V, o de 12–1000 V CAT III 1000 V. **(*)**
https://thepowertoolstore.com/es/products/klein-tools-ncvt2p · https://ihlcanada.com/products/prexiso-pnvx-1000c-non-contact-voltage-detector

## 7. Probador UNI-T UT15C (3087)
| Dato | Valor | Fuente |
|---|---|---|
| Tensión | 12–690 V CA/CC · LCD ±(3 % + 5) de 24 a 690 V · continuidad | https://toolboom.com/en/multifunction-voltage-tester-uni-t-ut15c/ · https://arvutitark.ee/en/accessories/consumables/tooriistad/uni-t-ut15c-voltage-and-continuity-tester-1612002 |
| Seguridad | CAT IV 600 V (un vendedor) **(*)** | https://abra-electronics.com/test-equipment-tools/test-instruments/electrical-testers/general-purpose-electrical-testers/test-ut15c-uni-t-ut15c-waterproof-digital-voltage-tester-24v690v-ac-dc-cat-iv-600v.html |
| Medidas, peso y pilas | 275 × 51 × 30 · 210 g · 2 pilas AAA | https://shop.baltrade.eu/en/voltage-indicator-ut15c-uni-t-p21237.html |
| Punta con capuchón | Que quede solo 4 mm de metal a la vista en CAT III/IV viene de IEC 61010-031 (de memoria, sin fuente abierta) **(*)** | — |

## 8. Busca polo (9036)
Sin marca. Referencia FERVI 0013/142: 142 mm, 100–500 V, neón. La hoja de 3,5 × 62, el mango de Ø12,5, la resistencia y el neón van **(*)**.
https://www.misterworker.com/ru/fervi/circuit-tester-screwdriver-142mm-0013-142/53465.html
