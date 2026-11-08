# Fuentes de las medidas · grupo «protab» (protecciones y tableros), rev. B · 08/11/2026

Hojas: MAT-TERMOMAGNETICAS-1, MAT-DIFERENCIALES-1, MAT-COMANDO-1, MAT-BORNERAS-2, MAT-CAJA_COLUMNA-1, MAT-CAJA_COLUMNA-2, MAT-TABLERO-1, MAT-TABLERO-2, MAT-TABLERO-3, MAT-FOTOCONTROL-1.
Geometría única: `piezas/perfiles_protab.mjs` → `perfiles_protab.json` (plano) y `piezas/protab_mod.mjs`, `protab_caja.mjs`, `protab_util.mjs` (3D). Escenas `escenas/protab_*.mjs`, render con `node render_protab.js`.
Como en el piloto, el buscador web funcionó pero las fichas PDF no se pudieron abrir: cada dato sale del resumen del buscador, con su URL. Todo lo que no figura acá va en naranja **(*)**.

## 1. Termomagnética curva C (3021…3070)
| Dato | Valor | Fuente |
|---|---|---|
| Ancho por polo, alto, profundidad | 18 · 85 · 78,5 (iC60N) | Ficha de la app (`FICHAS_TEC.termomagneticas`) · confirmado: https://clipsal.com/products/circuit-protection/acti-9/miniature-circuit-breaker-2p-50a-d-a9f45250 · https://eshop.se.com/ae/acti9-ic60n-2p-3a-c-miniature-circuit-breaker-a9f44203.html |
| Cotas del dibujo de Schneider | Aparecen 36, 45 y 69 sin ubicar → frente del cuello 69 **(*)** | https://image.stoking.ru/uploads/image/stoking-library/schneider-electric/acti9/a9f84332/ca909006e-web.pdf |
| Cuello 45 / módulo 17,5 | DIN 43880 (la web no muestra la tabla) | https://dinmedia.de/en/standard/din-43880/1406097 |
| Partes internas | Borne, bimetal, disparo electromagnético (bobina), contactos fijo y móvil, cámara de arco, palanca y mecanismo; la bobina en serie con el bimetal, unida por malla | ABB: https://library.e.abb.com/public/ef5f3a6e43c99c288525758500534fe6/1SXU400142M0201.pdf · https://patents.google.com/patent/US4276526 |
| Usado | Hombro 44, frente 69, jaula 14 × 12, tornillo M4, bobina, cámara de 9 placas, bimetal 18, manija: **(*) proporcional, esquema** | — |

## 2. Peine de alimentación por pines (sin código en el pañol)
| Dato | Valor | Fuente |
|---|---|---|
| Siemens 5ST3687-0 | 10 mm², 1 polo, 12 módulos, paso 18, alto 11,3, ancho 6,4, largo 214 | https://www.electricautomationnetwork.com/en/siemens/5st3687-0-siemens-compact-pin-busbar-10mm2-n-colour-blue-12x-mcb-1-n-1-pole-touch-protected-colour-blue-1 |
| Otros | Schneider R9XFH112 (16 mm², 220 de largo, horquilla) · EZ9XPH112 | https://solarshop.baywa-re.lv/en/schneider-electric-phase-busbar-r9xfh112-3606480515859 · https://eshop.se.com/id/comb-busbar-easy9-xp-1p-63-a-12-modules-ez9xph112.html |
| Usado | Paso 18, alto 11,3, ancho 6,4. **(*)** Largo del pin 13,7, barra 3,4 × 4 | — |

## 3. Diferencial (3007, 3008, 3026–3030)
| Dato | Valor | Fuente |
|---|---|---|
| 2P / 4P | 36 / 72 × 91 × 73,5 · bornes 1–35 mm², 3,5 N·m (Schneider iID) | Ficha de la app |
| Usado | Hombro 44, frente 64, toroide R 11,5 / r 4,2, relé, botón T, resistencia: **(*) esquema** | — |

## 4. Contactor 25 A (3005 / 3006), selectora (3056) y llaves (3047 / 3048)
| Dato | Valor | Fuente |
|---|---|---|
| LC1D25 | 45 × 85 × 92 (bobina CA); con bobina CC: 101 de profundidad | https://www.standardelectricsupply.com/Schneider-Electric-LC1D25N7-Iec-Contactor · https://standardelectricsupply.com/Schneider-Electric-LC1D25BD-Tesys-D-Iec-Contactor |
| AC-1 40 A · AC-3 25 A · 1 NA + 1 NC | Ficha de la app | `FICHAS_TEC.comando` |
| Usado | Escalón 60 / 65, E fija y móvil, espira de sombra, porta-contactos, puentes, A1/A2 en el frente: **(*)**. Selectora Ø30 con agujero Ø22 y llave 80 × 80: **(*)** | — |

## 5. Separadores, topes y peines BPN (MAT-BORNERAS-2)
Se usan los perfiles del piloto sin tocarlos (`perfiles.mjs`: BPN, PEINE, SEPARADOR, TOPE, TAPA) y sus fuentes (`FUENTES.md` §1–2: Zoloda de la ficha, Phoenix FBS 10-8, D-UT, Weidmüller). Separador 1,5 × 56 × 53,5, tope 9,5 × 43 × 30 con M4, tapa 2,2: **(*)**.

## 6. Gabinete PRFV 530 × 430 × 200 (3020) y placa (3052)
| Dato | Valor | Fuente |
|---|---|---|
| NSYPLM54G | 530 × 430 × 200, IP66, IK10, RAL 7035, puerta lisa; «2 cierres con inserto doble barra o 1 sistema de 3 puntos» | https://www.se.com/ca/en/product/NSYPLM54G/wall-mounting-enclosure-polyester-monobloc-ip66-h530xw430xd200mm · https://www.crescentelectric.com/product/599422/wall-mounted-polyester-enclosure-panelset-plm-plain-door-530x430x200mm-ip66-ik10-ral-7035 · https://automa.net/product/schneider-electric/nsyplm54g-63a36f2dca04b4f2592adea3 |
| Placa | Schneider la ofrece aparte (NSYMM54, perforada); medidas no publicadas | misma búsqueda |
| Usado | Pared 4, puerta 4,5, junta 9 × 5, bisagras, pies 40 × 36, placa 480 × 380 × 2 sobre separadores de 22, Ø del apoyo 220: **(*)** | — |

## 7. Tablero armado (3057–3062) y base / fusible NH 00 (3055, 3004, 3054, 3503)
| Dato | Valor | Fuente |
|---|---|---|
| Fusible NH00 | 79 × 58 × 30 (Eaton 160NHG00B) | Ficha de la app (`FICHAS_TEC.tablero`) |
| Base NH00 | 30 × 119 × 58,5 (ETI PK00) | Ficha de la app |
| Gabinete 3057 / 3059 | 800 × 600 × 300 | Descripción del pañol |
| Usado | Cuchilla 6 × 15, pinzas, bornes M8, medidor, disposición en la placa, caja de policarbonato 320 × 420 × 170, reloj AT1-R y minicontactor: **(*)** | — |

## 8. Caja de aluminio 200 × 150 × 100 IP65 (6003), fondos (3009, 3010, 3011, 6009)
| Dato | Valor | Fuente |
|---|---|---|
| Caja | 200 × 150 × 100, IP65, tapa con junta y tornillos imperdibles (Conextube) | Ficha de la app · AP-PL-003 |
| Riel 14 cm, 2 tornillos 6 × 3/8, prensacable 3/4" BSC o 1/2" BSP (ZA3 / ZA11), cable 6–12 mm | AP-PL-002 (ficha) |
| Fondos | 220 × 75 × 2 · 220 × 80 × 2 · 230 × 95 × 2 · 70 × 165 · tablerito PRFV 80 × 130 | Descripciones del pañol y ficha |
| Usado | Pared 4, tapa 14, junta 3,5, tornillos M5, columna existente Ø114, riel 132, acrílico a 85: **(*)** | — |

## 9. Fotocontrol (3012 / 3031) y zócalo NEMA (3072)
| Dato | Valor | Fuente |
|---|---|---|
| Medidas típicas | Ø84 × 66 (ANSI C136.10) | Ficha de la app (`FICHAS_TEC.fotocontrol`) |
| Zócalo de referencia | Intermatic K121 / K122: 3" (Ø76) × 2-3/4", 15 A, 105–480 V, ANSI C136.10 | https://www.mc-mc.com/Product/intermatic-k121 · https://www.steinerelectric.com/Catalog/Lighting-BallastsControlsFixtures-And-Lamps/Lighting-Controls/Photocells/Turn-Lock-Receptacles/Intermatic-K121-2-Conductor-Phenolic-Turn-Lock-ReceptacleTwistlock-Photocontrol105-to-480-VACPole-Bracket-Mount-7758 |
| Otros fotocontroles | Intermatic LC4521C: alto 69,9, Ø3" | https://www.stanion.com/Product/lc4521cint |
| Norma | La tabla de cotas de C136.10 no es pública (solo el índice) | https://webstore.ansi.org/preview-pages/NEMA/preview_ANSI+C136.10-2017.pdf |
| Usado | Patas sobre Ø31, 26° de arco, 13 de largo, traba 35°, zócalo 26 de alto, cables negro / blanco / rojo, interior: **(*)** | — |
