# Fuentes de las medidas · grupo «civil» (rev. B, 08/11/2026)

Hojas: MAT-CAÑOS-1/2, MAT-CAMARAS-1, MAT-ARIDOS_HORMIGON-1/2, MAT-MAMPOSTERIA-1/2, MAT-SENAL_SELLADO-1/2, MAT-REPOSICION-1, MAT-FIJACION-1.
Geometría única: `r3d/piezas/perfiles_civil.mjs` → `perfiles_civil.json` (plano y 3D con los mismos números). Lo marcado «AC» en el archivo
y «(*)» en las hojas es proporcional a una referencia y queda **a confirmar**. Como en el piloto, desde la nube se usó el buscador; los PDF no se abrieron:
cada dato sale del resumen del buscador y hay que verificarlo en la ficha antes de darlo por bueno.

## 1. Caños de PVC rígido (5007, 5008, 5010, 5009, 5011, 5030, 5014)
| Dato | Valor | Fuente |
|---|---|---|
| Ø y pared | Ø110 × 3,2 · Ø160 × 3,2 (ref. 4,7) · Ø90 × 2,7 cl. 6 · Ø50 × 3,2 | Ficha de la app (Tigre; ETG Córdoba: cruce con PVC reforzado Ø100 × 3,2) |
| 2 caños Ø110 por cruce | trabajo + reserva con cordón y tapa | `CRUCE_AP_TC_002`, NORMAS AP-TC-002 |
| Largo mínimo de enchufe DN 110 | Lc ≈ 53,5 (lectura de la tabla; columnas mezcladas en el PDF) | Wavin S-40 (IRAM 13326): https://mediahub.wavin.com/m/48e454adfbcadd54/original/S-40.pdf |
| Norma de caños cloacales | IRAM 13325 / 13326, juntas IRAM 113047 | https://intranet.mercedes.gob.ar/apps/compras/licitaciones/395-5EspecificacionesTecnicasRedesCloacales.pdf |
| (*) | pared del Ø25,4 (1,8), abocardado 18, adhesivo, R de la curva = 1,5 D, tapa 62, separación 250 entre caños | proporcional |

## 2. PEAD Ø50 (5005), corrugado 3/4" (5006), grampa (5015)
| Dato | Valor | Fuente |
|---|---|---|
| Pared dibujada | 3,0 (tritubo PEAD 50 × 3 mm) | https://adjditec.com/hi/productos/tubo-tritubo-pead-diametro-50-mm-y-espesor-3-mm-bobina-de-350-m |
| Contradicción | PN6 en PE100 daría ≈ 2,0–2,5 (consulta de licitación: 2,5 para 2" de 6 kg/cm²) | https://www.contrataciones.gov.py/reporte/convocatoria/390474-adquisicion-canerias-pead-2-redes-distribucion-agua-1/consultas.pdf |
| (*) | unión a compresión (la app no dice cómo se une), radio de curvado 20 D, corrugado Ø25/19,5 paso 4,2, grampa 1,2 × 20 | proporcional |

## 3. Cámara 40 × 40 (5003), marco y tapa «A.P.» (5016), masilla (5017)
| Dato | Valor | Fuente |
|---|---|---|
| Medidas | 40 × 40 interior, altura ≤ 50, profundidad ≤ 0,60, 2 por cruce | `CRUCE_AP_TC_002`, NORMAS AP-TC-002 (Detalle N° 3) |
| Sin ítem en el Anexo I | «las pide el plano pero no tienen ítem» | App (`IT_CHECK`) |
| Marcos de cámaras en otras ciudades | ángulo 1½" × ⅛" (marco) y 1¼" × ⅛" (tapa) en Zapopan; fundición C-250 en Zaragoza: **no hay ficha de bronce** | https://www.zapopan.gob.mx/wp-content/uploads/2022/10/05.-DET-01.pdf · https://www.zaragoza.es/contenidos/grandesproyectos/modelario25/L-8-2025.pdf |
| (*) | pared 8, H° pobre 100, ejes a 80 del fondo, ángulo 30 × 30 × 4, tapa 6 con nervio | proporcional |

## 4. Áridos y hormigones (8008, 8006, 8003, 8022, 8013, 8014, 8015, 8020, 8021, 8019, 8024, 8025)
| Dato | Valor | Fuente |
|---|---|---|
| H-13 | 1 : 2,5 : 4 · 5,2 bolsas · 0,55 m³ arena · 0,80 m³ piedra · 170 L | Ficha de la app, CLAUDE.md §11.3 |
| H-21 | 320 ± 15 kg/m³, a/c ≤ 0,50, CIRSOC 201 | Ficha de la app (pliego Malargüe) |
| Bolsa de 25 kg | 46 × 41 × 11,5 cm; la industria reemplaza la de 50 kg | https://easy.com.ar/cemento-loma-negra-25kg-cpc30-cba/p · https://www.cronista.com/negocios/las-cementeras-se-adaptan-a-las-nuevas-disposiciones-con-inversiones-millonarias |
| CPN 40 | > 40 MPa a 28 días, IRAM 50000 | https://b2b-web-svelte.pages.dev/us/en/products/NwtCNFHUAfi-Ri9_/loma-negra-portland-cement-50kg |
| Cal en bolsa de 25 kg | El Milagro / Santa Elena 25 kg (Cacique es cal **hidráulica**) | https://www.easy.com.ar/cal-aerea-el-milagro-25kg/p · https://www.easy.com.ar/cal-hidraulica-cacique-max-25kg/p |
| Probeta | Ø150 × 300 (probeta normal de ensayo) | Práctica IRAM 1524/1546 (sin URL abierta: **a confirmar**) |
| (*) | bolsa de 50 kg 760 × 480 × 140; curvas granulométricas (ilustrativas); dosajes de pobre, torta, calcáreo, revoques | proporcional |

## 5. Mampostería (8016, 8011, 8012, 8018, 8001) y anclaje (8002, 4040)
| Dato | Valor | Fuente |
|---|---|---|
| Ladrillo | 25 × 12 × 5 «tamaño normal del macizo» | Pañol, app · https://www.coam.org/media/Default%20Files/fundacion/biblioteca/revista-arquitectura-100/1946-1958/docs/revista-articulos/revista-nacional-arquitectura-1948-n80-pag307-311.pdf |
| Hilada 0,075, 2 Ø6 cada 2 hiladas, malla SIMA 15 × 15 | junta = 75 − 50 = 25 | `TABLERO_NIVEL` |
| Hierro ADN Ø6 × 12 m, nervado | barra comercial | https://www.easy.com.ar/hierro-redondo-adn-06mm-12mt---cap-gba/p |
| Malla Q188 | 150 × 150 × Ø6 · paño 2,40 × 6,00 ≈ 42 kg | https://www.easy.com.ar/e127-minimalla-q188--150x150x6-0mm/p · https://hacecuentas.com/calculadora-malla-sima-losa-m2 |
| Kwik Bolt 1/2" | broca 1/2", h_nom 2", 50 ft-lb (≈ 68 N·m), llave 3/4" | Hilti KB-TZ2 · https://www.hilti.com/engineering/question/kb-tz2-installation-torque/kz0whp · https://manuals.plus/eo/m/1c6797b1d8d8e5e0b4d4aaf2c045c5f7a21425efca47195547da7bdb0ff0a8cf |
| Anclaje del pañol | 1/2" × 15 cm, 4 por tablero | `TABLERO_NIVEL` (anclajeLargoCm, anclajeRosca, anclajes) |
| (*) | profundidad 125, rosca 52, camisa 24, cono 18, arandela Ø34, alfarjía 50 × 75, altura de nervios | proporcional |

## 6. Malla de advertencia (8017), telgopor (8005), selladores (8009, 8010, 8026, 8023, 9003)
| Dato | Valor | Fuente |
|---|---|---|
| Malla | PEBD roja, rombo ≈ 22 × 18, rollo 100 m, +5 % solape | Ficha de la app (Maintec) |
| Maintec | rollos de 100 m, anchos 15 y 30 cm, PEBD lineal, leyendas «Cables enterrados» / «Peligro riesgo eléctrico» | https://editores-srl.com.ar/sites/default/files/ie344_maintec_mallas_de_advertencia.pdf |
| Telgopor | borde inferior a 350 del fondo, alto 650, 176 = (600 − 247)/2 | AP-TC-003-A (NORMAS) |
| EPS 15 kg/m³ | densidad comercial habitual | https://www.easy.com.ar/e120-plancha-pe-20mm-15kgm3-1245408/p |
| Sello base PRFV | arena fina hasta −50 y sello de 50 | AP-TC-003-A |
| Silicona 9003 | 260 ml | Pañol |
| (*) | cartucho Ø50 × 215, aerosol Ø65 × 250 (500 ml), lata Ø155 × 175 (4 L), franja de la leyenda 44, perla 3,5 | proporcional (no hay medidas publicadas de los envases) |

## 7. Reposición (8004, 8007)
| Dato | Valor | Fuente |
|---|---|---|
| Vereda | contrapiso 8 + mortero 2 + baldosa igual, en 48 h; relleno en capas de 15 | Ficha de la app (pliego LP 21478) |
| Calzada | H-21 0,20 (estimado) o carpeta | Ficha de la app |
| (*) | baldosa 200 × 200 × 25 de 9 panes, carpeta 50, base 150, sobreancho | proporcional |

## 8. Fijación (4029, 4030, 4021, 4033, 4035, 1001, 9002)
| Dato | Valor | Fuente |
|---|---|---|
| Precintos | 200 × 4,5 y 250 × 4,5 negro, nylon 66 | Ficha de la app / pañol |
| T50R (referencia) | 200 × 4,6 · 225 N · −40 a 85 °C · PA 66 | https://ie.rs-online.com/web/p/cable-ties/0219954 |
| Fisher n° 8 | broca 8, taladro 50, tornillo 4,5–6 (SX 8 × 40); taco S8 + tornillo 5 × 45 | https://media.adeo.com/media/4532668/media.pdf · https://www.easy.com.ar/blister-10-taco-y-tornillo-s8-tmf-5x45/p |
| Alambre | 2 m por atadura; ≈ 25 g/m → ≈ 0,05 kg por aislador | CLAUDE.md §11.3 (a confirmar) |
| (*) | cabeza 8,2 × 6 × 7, uña, dentado 1,1, cinta Ø90, soporte 4033, envase de la pintura | proporcional |
