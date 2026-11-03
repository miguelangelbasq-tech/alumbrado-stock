# Circuito de la obra: calculadora → itemizado → orden → cierre → avance (revisión del 04/11/2026, v107)

Se probó con una plaza de prueba en la app:
- Cálculo: 7 columnas PRFV de 1 brazo, 1 tablero aéreo, 100 m de zanja.
- Una orden con 11 tareas que hizo de más: 8 columnas, 120 m de zanja, 150 m de cable, 3 jabalinas.
- La orden se cerró.

## Lo que anda
1. **Calculadora → itemizado:** la vista previa arma los ítems: 5 = 7 columnas, 9 = tablero, 11 = acometida, 13 = apoyo, 15 = 100 m de zanja, 30, 36, 64, 73, 74, 75, 81 y las provisiones 84.1, 88 y 89.
2. **Itemizado → «Quedan» de la orden:** salen bien los totales por tarea (7 pozos, 7 hormigonados, 7 montajes, 7 tableritos, 1 tablero, 100 m de zanja…).
3. **Cierre → avance:** al cerrar, avanzan los ítems 5, 9, 15, 36 y 75, y queda guardado qué sumó cada orden (`cierre.avanceItems`). Si después se anula la orden, se puede revertir (v102).
4. **Lo hecho de más** queda en las órdenes: «Quedan» muestra «hecho 8 de 7».

## Dónde se corta
1. **Lo hecho de más se pierde en el itemizado.** El cierre avisa «sobran 1 columna, 20 m de zanja, 146 m de cable, 1 jabalina», pero:
   - suma solo hasta lo contratado;
   - para agregarlo hay que tocar «Sí, hubo cambios» y **escribir a mano** cada ítem y cantidad, aunque la app ya los sabe;
   - no hay ningún lugar donde ver juntos todos los «sobran» de la obra.
2. **El ítem completo de columna avanza de golpe.** Con solo «Montaje de columna PRFV» el ítem 5 queda 7/7.
   - Ese ítem incluye pozo, fundación, izaje, vínculo, luminaria y conexionado.
   - La obra marcó 80 % sin luminarias, tablero conectado ni PAT medida.
3. **Hay tareas que no hacen avanzar nada:** pozo, hormigonado, galpón, tablerito (BPN), vínculo y luminaria, sellado, acometida, base y pozo del tablero, limpieza.
4. **Hay ítems que ninguna tarea avanza:**
   - 30 (cable 3×1,5 en columna);
   - 11 (acometida aérea): la tarea «acometida» no tiene ítem;
   - 74 (tomacable) y 64 (fotocontrol);
   - 73 (apoya escalera);
   - las provisiones 84.1, 88 y 89.
5. **En el cierre aparece una lista de 15 ítems por cada tarea sin ítem**, para elegir «a qué suma». Es larga y confusa. Lo que se elige se recuerda, pero sin control.
6. **El cierre sigue mostrando las «etapas» para tildar** (Pozo, Zanjeo…), que desde la v100 no se ven en el Avance.
7. **La orden nueva muestra las 33 tareas del catálogo**, no las de la obra. Solo 4 dicen «Quedan».
8. **Nombres distintos para lo mismo:** la tarea «Montaje de columna PRFV», el ítem «Columna PRFV 7 m, capuchón + 1 brazo», la provisión 84.1 y el material 6008 no están atados entre sí.

## Propuesta (orden sugerido)
1. **Diccionario único tarea ↔ cálculo ↔ ítem (%) ↔ material**, con el baremo nuevo. Ángel aprueba los porcentajes de los ítems completos.
2. **Cierre por partes:**
   - cada tarea suma su % del ítem;
   - lo de más se guarda como «hecho de más» con su ítem;
   - sin la lista larga ni las etapas viejas.
3. **Itemizado › «🔎 Diferencias con lo hecho»:**
   - todo lo de más y lo hecho sin ítem cargado, de todas las órdenes;
   - **Sí / No** por renglón, ya con el ítem y la cantidad puestos;
   - queda en el historial de ajustes (lo que hoy es «Sí, hubo cambios», pero automático y revisable).
4. **Orden nueva:** arriba «📋 Lo que falta en esta obra» según el cálculo, por etapa; abajo, las demás tareas.
5. **Recalcular:** si cambia el plano (+1 columna), «Pasar este cálculo a la obra» (v102) actualiza el material y el «Quedan». El itemizado sigue pidiendo «Traer de la Calculadora», que es lo probado.
