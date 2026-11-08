# Fuentes de las medidas · grupo «nelec» (productos nuevos del pañol), rev. B · 08/11/2026

Hojas: MAT-CABLE_SUBTERRANEO-3, MAT-CABLE_UNIPOLAR-1, MAT-IDENTIFICACION-1, MAT-BORNERAS-3, MAT-FICHAS-1, MAT-TERMOMAGNETICAS-2, MAT-FOTOCONTROL-2, MAT-COMANDO-2, MAT-TABLERO-4.
Geometría única: `piezas/perfiles_nelec.mjs` → `perfiles_nelec.json` (`node exportar_nelec.mjs`) para el plano, y `piezas/nelec_util.mjs` para el 3D.
También se usan, sin modificarlas, piezas de otros grupos: `bpn.mjs`/`perfiles.mjs` (piloto), `protab_mod.mjs`, `protab_caja.mjs`, `perfiles_protab.mjs`, `cables.mjs`, `perfiles_cables.mjs`, `conex.mjs` (loft).
Escenas `escenas/nelec_*.mjs`, render con `node render_nelec.js [nombre] [--rapido]`.
Como en los grupos anteriores, **WebFetch no pudo abrir ningún sitio** (hosts fuera de la red de la sesión): cada dato sale del resumen del buscador, con su URL. Lo que no figura acá va en naranja **(*)**.

## 1. Cables tetra/tripolares (1047, 1037, 1033, 3083 IRAM 62266 · 1046, 1059 IRAM 2178)
| Dato | Valor | Fuente |
|---|---|---|
| Ø 12 / 13,5 / 14,5 / 10, XLPE 0,7, vaina 1,8, intensidades (2178-1) | | Ficha de la app (Prysmian Retenax Valio) · `r3d/FUENTES_cables.md` |
| IRAM 62266 = Afumex 1000+ | XLPE silanizado + vaina LSZH; la tabla con el Ø de 4 × 6 no se pudo ver | https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2020_Afumex%201000%2B_v2.pdf |
| Usado | 62266 con el mismo Ø, vaina e intensidades que el 2178 **(*)**; color de la vaina **(*)** | — |

## 2. Unipolares IRAM NM 247-3 (1044, 1045, 1056, 1057, 1058, 1043, 1041, 1042, 1034)
| Dato | Valor | Fuente |
|---|---|---|
| 1,5 mm²: aislación 0,7 · Ø 3,0 · 2,5 mm²: 0,8 · Ø 3,6 · alambre Ø 0,26 | Superastic Jet (tabla IRAM) | https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2020_Superastic%20Jet.pdf · https://ar.prysmian.com/sites/ar.prysmian.com/files/media/documents/PRY2026_Superastic%20Jet_v2.pdf |
| 6 mm²: Ø 4,7 / 0,8 · 10 mm²: Ø 6,0 / 1,0 | | Ficha de la app («Prysmian, Superastic Jet») |
| Usado | Cuerda clase 5, cantidad de alambres ilustrativa **(*)** | — |

## 3. Anillos identificadores (1048…1055, 3077…3082) y termocontraíble (1049, 1060)
| Dato | Valor | Fuente |
|---|---|---|
| Rango de los anillos | por cable: 4–6 mm (Goobay), ≤ 2,5 mm (Gotron); el pañol los da por sección (1–2,5 y 4–6 mm²) | https://www.pccomponentes.com/goobay-marcador-numerico-para-cables-6mm-multicolor-pack-100-unidades · https://www.electrokit.com/en/cable-marker-a-c-3x30pcs-5.6-7.4mm |
| Termocontraíble 3/8" | Ø 9,53 → 4,75, pared recuperada 0,64 (2:1) | 3M FP-301: https://www.digikey.com/es/products/detail/3m/FP-301-3-8-RD-200/243886 |
| Termocontraíble 3/16" | Ø 4,75 → 2,36, pared 0,51 | https://syscom.mx/products/66325 · Panduit HSTT19: https://www.digikey.com/es/products/detail/panduit-corp/HSTT19-48-Q6/449124 |
| Usado | Anillo Ø 5,1/2,9 × 4 y Ø 6,5/4,1 × 5, abertura 70°, letra: **(*)**. Pared suministrada ≈ mitad de la recuperada **(*)** | — |

## 4. Bornes BPN 4 / 06 / 16 y accesorios (1038, 1039, 3075, 3076, 2065, 2063, 2064, 2066)
| Dato | Valor | Fuente |
|---|---|---|
| BPN-04 6,2 · 50/48/53 · 32 A · BPN-06 8,2 · 50/48/53 · 41 A (6/10 mm²) · BPN-16 12,2 · 56/66/71 · 76 A · 800 V | Tabla Zoloda | Ficha de la app (`FICHAS_TEC.borneras`) |
| Zoloda en la web | No publica la tabla; Weidmüller tiene tapa final y separador para 16 mm² (referencia) | https://www.acomee.com.mx/catalogos/catalogosz/ZOLODA%20BORNES%20DE%20CONEXION%20A%20RESORTE.pdf · https://datasheet.weidmueller.com/pdf/es/1933760000/scope/2/ |
| Usado | Perfil del BPN-06 del piloto estirado a C y A (pies sobre el NS35), jaulas, tornillos M3,5/M4/M5, separadores 1,5 y tapa 2,2: **(*)** | — |

## 5. Fichas IRAM 2073 (2061, 2062, 9043, 9044)
| Dato | Valor | Fuente |
|---|---|---|
| IRAM 2073: clavija 2P+T 10 A y 20 A, 250 V; fabricantes locales (Kalop) | | https://www.kalop.com.ar/kalop-descargas/fichas-tecnicas/productos-electricos/fichas-domiciliarias-kalop-ficha-tecnica.pdf (cifras 34,2 / 32,2 / 50,5 sin rotular) |
| Patas L/N 18,5 · tierra 22,0; 20 A con patas más separadas, compatible NEMA 10-20; L y N invertidas respecto de AS/NZS 3112 | | https://www.plugsocketmuseum.nl/Argentina1.html |
| Interpower: tierra 21,4, L/N 18,2; toma IRAM 2071 / 2086 | | https://blog.interpower.com/infopower/argentina-australia-and-china-standard-10a/250v-plugs-sockets-have-similar-features-what-are-some-critical-differences · https://www.interpower.com/ic/news/new-interpower-argentina-products.html |
| 20 A 250 V IRAM 2073 | Volex | https://www.volex.com/media/0dodxec5/volex-power-cords-catalogue-august-2025.pdf |
| Usado | Pata 6,5 × 1,6, 30°, separación, tierra 8 mm en 20 A, cuerpos: **(*)** (AS/NZS 3112 y Kalop) | — |

## 6. Termomagnéticas (3074, 3093, 3095, 3097)
| Dato | Valor | Fuente |
|---|---|---|
| 18 por polo · 85 · 78,5 | iC60N (ficha de la app); 72 × 85 × 78,5 para 4P | https://icecat.at/en/amp/p/schneider+electric/a9f74420/circuit+breakers-ic60n-65182914.html · https://tameson.com/products/schneider-electric-circuit-breaker-a9f78440-e33v5 |
| iK60N A9K24220 | 2P · 20 A · curva C · 6000 A · IEC 60898-1 | https://www.one-elec.com/en/a9k24220-miniature-circuit-breaker-acti9-ik60n-2p-20-a-c-curve-6000-a-iec-60898-1-a9k24220-schneider.html |
| Usado | Carcasa y mecanismo de MAT-TERMOMAGNETICAS-1 (protab) **(*)** | `r3d/FUENTES_protab.md` §1 |

## 7. Fotocontroles 3089 (9FENC) y 3090 (8FN2C)
| Dato | Valor | Fuente |
|---|---|---|
| Fivasa 9FENC / 8FN2C | **Sin resultados** en la web | búsquedas sin resultado |
| Térmico | Fotocélula de CdS + interruptor bimetálico (Intermatic K4023C) | https://intermatic.com/Catalog/us/Products/Photocontrols/Fixed-Mount-Thermal-Photocontrols/K4023C · https://sonicelectric.com/es/products/intermatic-button-thermal-photocontrol-120-v |
| Cuerpo, patas, zócalo | Ø84 × 66, ANSI C136.10 | Ficha de la app · `r3d/FUENTES_protab.md` §9 |
| Usado | Color de la tapa según la descripción; mecanismo interior **(*)** | — |

## 8. Comando (3094, 3100, 3098, 3099)
| Dato | Valor | Fuente |
|---|---|---|
| ABB AT1 | analógico, 1 módulo (17,5), cuarzo ±1 s/día, 230 V, 16 A resistiva / 4 A inductiva, 1 NA; AT1-R con reserva | https://library.e.abb.com/public/777ba6748c385a5ec12572a600598f04/2CSC440007B0201.pdf |
| Sonoff MINI R4 | 39,5 × 33 × 16,8 (otro: 16,6) · 10 A · 100–240 V · 2400 W · bornes L in, N in, L out, S1, S2; S1-S2 nunca a N/PE; MCB 10 A | https://www.crcibernetica.com/sonoff-wifi-smart-switch-mini-r4/ · https://www.rcscomponents.kiev.ua/datasheets/MINIR4-V1-1.pdf · https://manuals.plus/sonoff/minir4m-wi-fi-smart-switch-manual |
| Sonoff S-MATE | 54 × 45 × 24 (otro: 51 × 44,5 × 24) · CR2032 · bornes L, L1–L3, S, S1–S3 · subdispositivo eWeLink-Remote del MINI R4 | https://b2b.homescreen.pl/en/switches/49512-smart-switch-sonoff-s-mate-6920075776782.html · https://www.domadoo.fr/it/offerte/6100-sonoff-interruttore-senza-neutro-s-mate-compatibile-con-minir3.html |
| Usado | Alto/profundidad de los horarios = carcasa TM **(*)**; genérico de 3 módulos **(*)** | — |

## 9. Tablero T-010 (3101, 3102)
| Dato | Valor | Fuente |
|---|---|---|
| 747 × 546 × 300, PRFV para poste, 3 / 2 salidas «3 × 1 × 16 A» | | Descripción del pañol (`respaldo/nuevos.csv`) |
| T-010 en la web | Sin resultados | búsqueda sin resultado |
| Usado | Gabinete/poste/semiabrazaderas de protab_caja; contenido (general, contactor, bornera) como MAT-TABLERO-2 **(*)** | — |
