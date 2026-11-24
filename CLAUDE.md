# Contexto de trabajo — Angel (EMA Servicios, Córdoba) — planos en AutoCAD

Este archivo resume todo lo hecho en una sesión larga de Claude (app, con control remoto de la PC)
entre el 10/10/2026 y el 24/11/2026, para que Claude Code pueda seguir sin perder contexto.
Lo escribió Claude al cierre de esa sesión. Donde dice "no confirmado" es porque Angel no lo respondió
o porque no se verificó.

## 1. Quién es Angel y cómo trabaja
- Miguel Ángel Díaz ("Angel"). Coordinador y Administrador de Luminarias en EMA Servicios S.A. (Córdoba, Argentina).
  Hace proyectos de alumbrado público (AP) para la Municipalidad de Córdoba / EPEC.
- Escribe en español rioplatense, corto, a veces dictado y con errores de tipeo. Responder en español, directo.
- Pide exactitud ("tiene que ser muy exacto", "revisalo varias veces") y que no se le pregunte de más:
  prefiere que se avance con la lectura más razonable y se le diga qué se supuso.
- En los rótulos: "Dibujó: Miguel Ángel Díaz" (en los planos se escribe sin tildes: MIGUEL ANGEL DIAZ) y logo de EMA.
- PC: Windows, nombre `cba-pc-01`, usuario `Cordoba14`. AutoCAD 2027 Español (licencia EDUCACIÓN).
  Carpeta de trabajo: `D:\cad`. Descargas: `C:\Users\Cordoba14\Downloads`.
  Hay otra carpeta con tipos constructivos originales: `D:\PLANOS DE PLAZAS EMA\TIPO CONSTRUCTIVOS\` (no se modificó nada ahí).

## 2. Método de dibujo que se usó (y funciona)
- Los planos se **generan con Python + ezdxf** (más shapely, pyproj, numpy, scipy, PIL) y salen como DXF.
  No se dibuja a mano en AutoCAD línea por línea.
- AutoCAD se usa para: abrir el DXF, guardarlo como DWG 2018, adjuntar imágenes y plotear a PDF.
- Recetas de AutoCAD que funcionaron (línea de comandos, con `FILEDIA 0`):
  - Abrir: `_OPEN` + ruta.
  - Guardar: `(command "_.SAVEAS" "2018" "D:/ruta/archivo.dwg")` (agregar `"_Y"` si ya existe).
  - Plotear una presentación a PDF:
    `(command "_-PLOT" "_Y" "" "DWG To PDF.pc3" "ISO full bleed A1 (841.00 x 594.00 MM)" "_M" "_L" "_N" "_L" "1:1" "0,0" "_Y" "." "_Y" "_N" "_N" "_N" "D:/ruta/salida.pdf" "_Y" "_Y")`
    (para A0: `"ISO full bleed A0 (841.00 x 1189.00 MM)"`).
  - Catastro en gris cuando va como XREF: `VISRETAIN 1` y `_-LAYER _C 8 CATASTRO_NO|*`.
  - Adjuntar imagen: `(command "_-IMAGE" "_A" "ruta" "x,y" "ancho" "0")` con la capa actual ya puesta.
    Las imágenes definidas desde ezdxf con ruta relativa NO aparecieron en AutoCAD; adjuntarlas desde AutoCAD.
  - `IMAGEFRAME 2` para que el marco de la imagen no salga impreso.
- DXF: usar versión R2010 y `$INSUNITS = 0` (con R2018 y unidades 6 las imágenes no se veían).
- Fuente de texto: `romans.shx` (estilos `TX` ancho 0.85 y `TIT` ancho 1.3). Ojo: romans es más ancha de lo que
  uno estima; un texto ocupa aprox. `largo × altura × 1.0`, no 0.78.
- Problemas vividos con el control remoto (no deberían pasar trabajando local, pero conviene saberlos):
  sobrescribir un archivo ya existente en la PC a veces dejaba la versión vieja → usar nombre nuevo;
  cada "abrir aplicación" lanzaba otra instancia de AutoCAD.

## 3. Reglas de dibujo que pidió Angel
- **Todo por capa**: color y tipo de línea "PorCapa", nada forzado por entidad. Una capa por tipo de cosa.
- Nada superpuesto: textos, cotas y etiquetas no se pisan entre sí ni con muros/cables.
- Usar **bloques** para lo repetido (columnas, árboles, extintores, etc.).
- Marco y rótulo según **IRAM 4504**: margen izquierdo 25 mm, los otros 10 mm. Rótulo de 185 mm de ancho.
- El **catastro va de fondo, en gris, y no se modifica** salvo que él lo pida.
- En croquis de ubicación: resaltar en azul **solo la obra** (la plaza), con zoom suficiente.
- Unifilares con simbología **IEC 60617**; neutro = trazo corto con punto; PE = trazo con barra.
- En alumbrado: **dos portafusibles (tabaqueras) por columna = 2 fases por columna**. Columna triple: 2 luminarias
  en una fase y 1 en la otra. Repartir para que R/S/T queden lo más parejas posible por circuito.
- No se pueden copiar datos de Google Maps (licencia). Se usó catastro oficial + imagen satelital Esri + OpenStreetMap.

## 4. Estructura de `D:\cad`
- `D:\cad\final\` — catastro de Córdoba capital en 4 zonas (ver 5.1).
- `D:\cad\proyectos\` — planos de obra (Cavia, unifilar, JMP) con muchas versiones; subcarpetas
  `Jose Maria Paz\`, `Plaza VICOR\`, `TC-PRFV\`, `Galindez-Junin\`, `img\` (croquis y logos: `logo_ema.png`,
  `logo_epec.png`, `logo_gob.png`, `logo_muni.png`).
- `D:\cad\catastro_fuentes\` — datos y programas: `datos_catastro_NE/NO/SE/SO.zip` (JSON del catastro municipal
  y de OSM), `programas_catastro.zip` (src/ que arma el catastro), `programas_planos_AP.zip`, `LEEME.txt`.
- `D:\cad\scripts_claude\` — copia de los programas más nuevos de esta sesión (ver sección 7).

## 5. Proyectos y estado

### 5.1 Catastro de Córdoba capital (4 zonas)
- Archivos buenos: `D:\cad\final\Catastro_CBA_NE.dwg`, `_NO.dwg`, `_SE.dwg`, `_SO.dwg` (versión "v6", 1–2/11/2026).
  Respaldo anterior en `D:\cad\final\backup_v4\`. DXF de la v6 en `D:\cad\final\v6\`.
- Coordenadas: POSGAR faja 4, **EPSG:22174**. Fuente: catastro municipal/IDECOR + OSM (calles, sendas, plazas, barrios).
- Capas de plazas: `VERDE-PLAZA`, `VERDE-PLAZA-APROX` (línea APROX, vienen de OSM), `VERDE-PLAZA-RELLENO` (hatch),
  `VERDE-TXT-NOMBRES`, y la nueva `VERDE-DESIGNADO-NO-MATERIALIZADO` (gris punteada, sin relleno) con su
  `VERDE-TXT-NO-MATERIALIZADO`.
- Qué se hizo en la v6: se revisaron contra imagen satelital Esri (zoom 18) las 1156 plazas/espacios verdes;
  82 que figuran como espacio verde pero están edificadas se pasaron a `VERDE-DESIGNADO-NO-MATERIALIZADO`;
  9 plazas con nombre propio que tienen edificios (Paseo del Buen Pastor, Plaza Cárcano, etc.) se mantuvieron.
  Listado: `D:\cad\final\plazas_reclasificadas.csv`.
- Alineación catastro vs satélite: desplazamiento medio 0,5–1 m, sin corrimiento sistemático.
- Pedido original de Angel: que sea "muy exacto igual que Maps", sobre todo las plazas. Preguntó si era
  "la versión súper detallada"; se le aclaró que la v6 mejoró la precisión de plazas, no agregó detalle nuevo
  (no hay contornos de edificios, veredas, arbolado ni postes). Eso quedó ofrecido, sin respuesta.

### 5.2 Cavia — AP del cantero central de calle Pedro Feliciano Cavia (zona norte)
- Última versión: `D:\cad\proyectos\Proyecto_AP_Cavia_v23.dwg` y `Plano_AP_Cavia_A1_v23.pdf` (16/11/2026).
  La v22 (octubre) es la anterior. El catastro NO va como XREF (`CATASTRO_NO`). Presentación `A1 PLANO 1-400`.
- Rumbo del cantero: 81,3°. Tres tramos: Fray Luis Beltrán–César Carrizo; César Carrizo–Lascano Colodrero;
  Lascano Colodrero–R. Carbia–D. Garat. Líneas de 132 kV de EPEC a ambos lados; las columnas deben quedar a 7 m.
- Columnas PRFV 7 m con vínculo triple o doble, luminarias LED 75 W. Tableros TMPC 01 y TMPC 02.
  Circuitos T1-C1 (4x6 mm²), T1-C2, T2-C1, T2-C2 (4x4 mm²).
- v23 = replanteo medido en obra (fotos con medidas a mano): columnas reubicadas con cota al borde ESTE del cantero,
  largos de tramo medidos, T1C2-02 eliminada (quedan 31 columnas: 24 triples, 7 dobles, 86 luminarias),
  acometida preensamblado 7 m al TMPC 01, Rev. 1, NOV. 2026.
  Balance de luminarias por fase: T1-C1 10/9/9, T1-C2 8/7/7, T2-C1 7/7/7, T2-C2 5/5/5.
- **Pendiente / dudas sin responder**:
  - En César Carrizo–Lascano Colodrero las medidas suman 261 m y el cantero mide 208 m; en Lascano–Garat 285 m vs 258 m.
    Se dibujó repartido en proporción y se escribieron las medidas de Angel tal cual. Falta saber si son largo de cable.
  - Lecturas supuestas de la letra manuscrita: primera medida tramo 1 = 15,2; "27" = 12,7; T1C2-01 sin cota (7,6 del plano viejo);
    TMPC 02 a 7,3 del borde OESTE.
  - T2C1-04 y T2C1-05 quedarían a ~4 y ~6 m del borde oeste (límite de 7 m a la línea de 132 kV): revisar.
  - Cruces bajo senda con PEAD: el cálculo dio 5 (17 m) contra 12 (46 m) de la v22: confirmar.
  - Proyectó/Revisó del rótulo y potencia real de luminaria: no confirmados.

### 5.3 Unifilar TMPC (Cavia)
- Última: `D:\cad\proyectos\Unifilar_TMPC_Cavia_v8.dwg/.pdf`.
- Un diferencial por circuito: Q2/Q3 4x20 A → F1/F2 4x25 A 300 mA → K1/K2 (diferencial aguas arriba del contactor).
  Con leyenda; vínculos punteados como segmentos.
- Pendiente (no confirmado): pasar a contactor 3P con neutro pasante, y cambiar la nota TN-C → TT.

### 5.4 Parque José María Paz, Etapa II (TAP 3 y TAP 4)
- `D:\cad\proyectos\Jose Maria Paz\Jose_Maria_Paz_TAP3_TAP4_fases.dwg/.pdf` (v4). Reparto de fases con 2 tabaqueras por columna,
  redibujado sobre el catastro NE.
- Angel dijo "le falta muchos detalles" y no aclaró cuáles. Pendiente preguntarle.

### 5.5 Plaza VICOR (T.A.P. N°1)
- `D:\cad\proyectos\Plaza VICOR\VICOR_TAP1_distribucion_fases.pdf/.png`: fases anotadas sobre la imagen del plano de Angel.
  11 columnas en cruz, 44 luminarias, R 3200 / S 2800 / T 2800 W (se asumió 200 W por luminaria, no confirmado). No hay DWG.

### 5.6 Tipo constructivo TC-PRFV-02 (tablero)
- `D:\cad\proyectos\TC-PRFV\TC-PRFV-02_identificadores.dwg/.pdf`: se agregaron identificadores de cable (anillos marcadores)
  y un cuadro "IDENTIFICACIÓN DE CABLES", incluida la subida del fusible y la BNP. El original no se tocó.

### 5.7 Plano General Galíndez, Junín y Pje. S/N (B° San Vicente) — nomenclatura 02-09-040-011
- Redibujo de un plano municipal escaneado (aprobado 29/11/1994, final de obra 0464 del 19/06/1997).
- Archivos: `D:\cad\proyectos\Galindez-Junin\Plano_General_Galindez_Junin.dwg` y `..._A0.pdf` (18/11/2026).
  `..._v1.dwg` = versión anterior con cambios a mano de Angel. `img\plano_original.jpg` (escaneo) y `img\logo_ema.png`.
- Contenido: planta baja (galpón nuevo en rojo + galpón existente con oficinas), planta alta, planta de techo (1:200),
  cortes A-A, B-B, C-C, fachadas oeste/sur/este, planillas de superficies y aberturas, rótulo.
- Modelo en metros a tamaño real; la lámina mide 139 × 77 m. Presentación `A0 1-125` (a 1:100 no entra en A0);
  el rótulo dice 1:100 como el original. Angel no contestó si quiere otro formato.
- Capas `A-...` (muros, muros proyectados, rellenos, aberturas, referencias de carpintería, cotas, textos, títulos,
  estructura, cubierta, chapa, escalera, sanitarios, extintores, arbolado, vereda, corte, ejes, planillas, rótulo, logo,
  escaneo que no se imprime). Bloques: `ARBOL`, `EXTINTOR`, `INODORO`, `COLUMNA`.
- Rótulo (lo pidió así): logo EMA + "PLANO GENERAL"; ubicación de la obra; nomenclatura catastral; superficies;
  anchos de calle; croquis; observaciones; Dibujó / Escala / Fecha. **Sin** proyectista ni directores técnicos.
  El propietario (Roberto Simonassi) lo borró Angel a mano; quedó fuera.
- Es aproximado donde el original no tiene cota (aberturas, sanitarios, escalera, reticulados, fachadas) y el ángulo
  de la línea de Galíndez se tomó en 3,5° medido sobre el escaneo.
- Después de generar el DWG se hicieron 3 retoques a mano en AutoCAD (alto de CALLE/BARRIO/CIUDAD a 0,22 y
  corrimiento de "SALA DE ESPERA Y / ATENCION", "DEPOSITO / OFICINA" y "ADMINISTRACION"), así que el programa
  `galindez_build.py` no reproduce esos retoques.

## 6. Otros temas abiertos (fuera de AutoCAD)
- App de la empresa: repositorio `miguelangelbasq-tech/alumbrado-stock` (PWA en un `index.html` grande; versión v171 al 18/11/2026).
  Angel pidió (y después canceló por ese momento) que la IA de la app y la **orden de trabajo** diferencien las tareas
  **por persona/cuadrilla y por horario**: por ejemplo "Pablo y Pedro hasta las 14 en esa plaza, los otros siguen hasta las 16",
  y que cada uno cobre solo por sus horas y lo que hizo. Hoy la IA "pone todo junto". No se tocó código.
- Pasó los catastros y planos a otra computadora por ZIP (Drive no aceptaba archivos de 10–20 MB por el conector).

## 7. Programas (copias en `D:\cad\scripts_claude\`)
- `galindez_build.py` — genera todo el plano de Galíndez-Junín (incluye control automático de superposiciones
  texto-texto y texto-muro, unión de muros con shapely y auditoría de capas). `galindez_preview.py` lo rasteriza.
- `cavia_v23.py` — toma `Proyecto_AP_Cavia_v22.dxf` y produce la v23 (reubica columnas, fases, cotas, cuadros).
  Uso: `python cavia_v23.py Proyecto_AP_Cavia_v22.dxf Proyecto_AP_Cavia_v23.dxf`.
- `cavia_build_plano_v22.py`, `cavia_lamina2.py` — generadores de la v22 (dependen de `place.py` y `cols_a2.json`,
  que están en `programas_planos_AP.zip`).
- `unifilar_tmpc.py` — unifilar TMPC. `build_jmp.py` — plano José María Paz.
- Los programas del catastro están en `D:\cad\catastro_fuentes\programas_catastro.zip`.
- Los programas de la revisión satelital de plazas (métricas, hojas de revisión, alineación) se perdieron con el
  entorno temporal de la sesión; el resultado quedó en los DWG v6 y en el CSV.
