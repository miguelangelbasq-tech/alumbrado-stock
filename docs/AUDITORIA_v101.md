# Auditoría completa de la app (v101, 03/11/2026) — hallazgos

Seis revisiones por área, solo lectura. ✔ = verificado a mano en el código. «a confirmar» = decide Ángel. No se cambió nada todavía.

## Órdenes, Mis tareas y puntos
1. ALTA ✔ verificado: reinicio de puntos (puntosDesde / sacar obra / día) genera ajustes NEGATIVOS en la quincena abierta por lo ya pagado (ajustesPendientes recalcula con ye filtrado). Arreglo: calcular el vivo con __puntosSinFiltro o ignorar quincenas antes del reinicio.
2. ALTA: anular/borrar orden cerrada no revierte cierre.avanceItems (avance de obra sigue sumado; saldoObra usa max → sigue «hecho»).
3. MEDIA-ALTA: tarea repartida, el «resto para toda la cuadrilla» lo marca cada persona → se suma varias veces (13 de 10) y paga de más.
4. MEDIA: orden cerrada que «sigue otro día» (En curso + cierre) → la cuadrilla la ve en Terminadas; saldoObra libera el resto; push una sola vez.
5. MEDIA: la cuadrilla puede marcar/enviar en órdenes Terminadas/cerradas; la base rechaza o se ignora.
6. MEDIA: «Tus puntos» del celu (vivo) ≠ lo que se paga (foto + ajustes).
7. MEDIA: editar orden cerrada no avisa; puntos quedan con personal/tareas viejos.
8. MEDIA-BAJA: 📥 cerrar una anulada la revive como Terminada.
9. MEDIA-BAJA: informe de órdenes cuenta anuladas.
10. MEDIA-BAJA: «Terminada» desde el select sin cierre → saldoObra lo da por hecho, Producción no.
11. BAJA: Inicio cuadrilla muestra órdenes donde es solo responsable.
12. BAJA: fotos borradas al cerrar aunque el cierre falle.

## Pañol
1. ALTA ✔ verificado: unidades cruzadas calculadora ↔ catálogo: 5005 caño PEAD, 5007 caño PVC Ø110, 8017 malla se calculan en m y el catálogo los cuenta en Un.; morsetos 3051/4026/4027, placa 3052, luminarias 6011/6012 están en «m» en el catálogo. El balance pone la cantidad del cálculo con la unidad del catálogo.
2. ALTA: más duplicados en el catálogo (7010/7011/7012/1032, 2027/2024, 3013/3017, 3012/3031, 3038=3039, 7005=7006, 3008≈3030, 3005≈3006) → decide Ángel.
3. ALTA: «Revisar stock negativo» propone «Pasar» stock entre medidas distintas (columna 10 m → 7 m, fusible 1 A → 2 A…): su comparador ignora las palabras con números. (Tercer comparador distinto.)
4. ALTA: lo cambiado por otro material (⇄ Ofrecer otro, alternativas) sigue saliendo como faltante y se puede pedir dos veces; la elección de alternativa se pierde al recargar.
5. MEDIA: «✕ No hay» cuenta como apartado en Material de esta obra y no en el pañol.
6. MEDIA: lista de compras usa stock total, ignora lo apartado (otras pantallas usan libre).
7. MEDIA: anular un movimiento no anula su pareja (vale de reserva, uso de cargo, corrección de código).
8. MEDIA: editar «stock inicial» o la unidad cambia el stock sin movimiento ni rastro.
9. BAJA: unidad por defecto «c/a» al limpiar el alta.
10. BAJA: avisos de faltantes armados en dos módulos.
11. BAJA: BPN 2007→2009 se reemplaza solo en lo calculado, no en lo entregado.
12. BAJA: existe función para borrar movimientos (no la usa nadie).
   (3 ✔ verificado: el comparador de stockNegativo descarta toda palabra con números → «Columna 10 m» = «Columna 7 m».)

## Proyectista, guías y láminas
1. ALTA ✔ verificado: prensacables: la tabla que usa el cálculo (rangos CONEXTUBE ZA) da 4×2,5 (Ø12,28) → 7/8", 4×6 → 1", 4×10 → 1 1/4", 1×10 → 5/8"; la regla acordada (§11.3), la nota y la guía dicen 1/2", 3/4", 7/8", 1". Tres juegos de rangos distintos (cálculo, nota, ficha).
2. ALTA: subidas/ganancia del troncal y cable 3×1,5: Proyectista usa 3,5 m y 7 m fijos; la calculadora usa altura libre / altura − caja + brazo + 0,6. Mismas columnas → metros distintos. (CLAUDE.md §11.3 también quedó viejo.)
3. ALTA (conf. media): Proyectista reparte R/S/T por artefacto; la caja PRFV tiene 2 portafusibles (S y T) → puede salir «RST» con fusibles de 2 fases.
4. ALTA: Proyectista: el cable del circuito mide en recto si padre e hijo no están seguidos en la lista (cámara/cruce en el medio o «Viene de»); el plano mide por el camino. La memoria dice «por el camino».
5. MEDIA: lámina LP-P-02 dice «2007 / 2009 BPN 4 o 6 según el cable» (regla vieja; hoy siempre 6).
6. MEDIA: protecciones del tablero: lámina LP-P-04 (C16 2P, 4×2,5) vs Proyectista (tetrapolar, mín 10 A, 4×4).
7. MEDIA: la memoria de cálculo no lista todos los «a confirmar» que marca la pantalla (reserva 5 %, clase conductor, térmica mínima, 70 °C, subida).
8. MEDIA: fichas con códigos repetidos/dudosos (2024 «puente» en m vs 2027; 7005=7006).
9. BAJA: CLAUDE.md desactualizado (volúmenes de fundación 0,403/0,728 en código y lámina; subida).
10. BAJA: Chrome 80 OK; solo «gap» en flex (Chrome 84) pierde espacio, no rompe.

## Usuarios, permisos, fotos, sin señal, avisos
(Bien: todas las colecciones tienen regla; tablas de roles iguales en app y reglas; marcas de versión OK.)
1. ALTA ✔ verificado: sinSenal da por bueno un guardado a los 1,2 s sin señal → la cola de fotos (fotosSinSenal) la borra del celu y la cola de Mis tareas saca la marca aunque después la base la rechace. Con señal débil, reenvíos que se acumulan.
2. ALTA ✔ verificado: el número de vale/comprobante (S-/E-/D-) no se guarda: sale de la posición en la lista → puede cambiar después de impreso. Reservas y OT: «máximo + 1» del aparato → dos aparatos pueden sacar el mismo número.
3. MEDIA: «foto borrada» se filtra distinto en legajo, nombres de columnas, fotos por tarea e informe mensual.
4. MEDIA: el celular sigue recibiendo avisos del usuario anterior hasta 24 h.
5. MEDIA: aviso «Material para retirar» va a un nombre escrito a mano; dos formas de normalizar nombres (con y sin acentos).
6. MEDIA: el control de permisos de fotos quedó anulado por otro envoltorio; la foto sube a la nube (no borrable) aunque la base la rechace.
7. MEDIA: ajustes por persona no se respetan igual (capataz con «editar» en calculadora sigue viendo solo Cálculos rápidos).
8. BAJA: botones que la pantalla habilita y la base niega (borrar obra, nombrar columnas).
9. BAJA: reintentos negados sin fin (cada 2 y 5 min), gastan lecturas.

## Avance, itemizado, legajo, mapa, informes, gastos
1. ALTA: «Finalizada» sale de 5 lados (Avance por %, Inicio por estado manual, informe consolidado mezcla, mapa por 12 etapas, legajo por «oculta»).
2. ALTA (lo traje yo en v100): etapas que no tienen ítems (poste, desmonte, inspección) no se tildan solas y ya no se pueden tildar → debajo del gráfico, en el mapa y en el informe queda «Poste de PRFV para tablero» / «Falta: …» con la obra al 100 %.
3. ALTA ✔ verificado: ocultar una obra terminada la saca de los totales de plata (Itemizado 2026 contratado/certificado, ganancia, consolidado, promedio) — avanceObras filtra oculta.
4. ALTA (a confirmar Ángel): las provisiones 83–89 y ítems sin tarea pesan en el % pero ninguna orden los avanza → obra trabada en 50–60 %.
5. MEDIA (en parte mío, v100): textos que mencionan etapas/valorización que ya no están o explican mal de dónde sale el %.
6. MEDIA ✔ verificado (mío, v100): tildar «Inspección» puede marcar TODO el material como instalado sin preguntar (completarMaterialesAlFinalizar).
7. MEDIA: certificado: carga plaza por plaza deja 0 %, carga masiva deja 100 %.
8. MEDIA: «Material completo» del Avance y «calculado vs. entregado» del legajo usan criterios distintos.
9. MEDIA: la ganancia sube 21 % si en Itemizado se elige «con IVA».
10. BAJA: tres escalas de color para el mismo avance (gráfico/tarjetas rojo-teal vs mapa/ítems gris-azul).
Nota: CLAUDE.md dice módulo $281.998,71; la app usa $296.126,45 sin IVA (precio de oferta) — corregir CLAUDE.md.

## Calculadora
1. ALTA ✔ (= Pañol 1): unidades: calcula en m lo que el catálogo cuenta en Un. (1009, 5005, 5007, 8017; barrio 1002, 1005, 7008, 1030, 1031, 5006) y al revés (4026, 4027, 3051, 3052). El balance y el pedido muestran la cantidad calculada con la unidad del catálogo.
2. ALTA (conf. media): más casos tipo 6001: 7010 vs 1032; acometida 4×16 1008/1027/1028 vs 1004 → decide Ángel.
3. ALTA ✔ verificado: al recalcular/editar el cómputo de una obra ya registrada, «Material por obra», el legajo y el pedido siguen con el material de cuando se registró (solo se copia al registrar).
4. MEDIA ✔ (= Proyectista 1): prensacables: tabla del cálculo ≠ regla/nota/guía; 3/4" va al 5029 plástico aunque existe 5023 de aluminio.
5. MEDIA (a confirmar): cable de subida 3×1,5 en el código = altura − caja + brazo + 0,60 (4,5 / 5,5 / 8,1 m); CLAUDE.md dice 7 m + … (probablemente corregir el documento).
6. MEDIA (a confirmar): ganancia del troncal PRFV = altura entera (7/10 m) aunque la caja está a 3,5 m.
7. MEDIA (a confirmar, plata): ítems 25–40 se cargan con zanja + subidas/bajadas; CLAUDE.md dice «solo metros de zanja».
8. MEDIA (a confirmar): volúmenes de fundación: código y guía 0,403/0,728; CLAUDE.md 0,4057/0,8035.
9. MEDIA: el paso al itemizado reconoce materiales por el NOMBRE (editable en el catálogo), no por el código → si alguien renombra, se pierden ítems en silencio.
10. BAJA: notas viejas o que contradicen la lista (BPN «solo la gris sigue la sección», «cable entre tableritos no se computa», «+1 del tablero» fijo, zanja rápida 0,40).
11. BAJA: con «Columnas» apagado, la PAT toma un tipo de columna y las BPN/fusibles otro.
