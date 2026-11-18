# Manual de Dirección (gerencia, presidencia, el dueño). Lo usa contenido.escribir(A, 'direccion').
# Solo lo que la app de verdad le muestra al rol «direccion» (v168): ve todo, no cambia nada.
# Capturas: capturas/g11_direccion.js (dr_*) + algunas de los otros grupos.


def escribir(A):
    intro(A)
    entrar(A)
    inicio(A)
    obra(A)
    avance(A)
    tiempos(A)
    plata(A)
    puntos(A)
    asistente(A)
    ejemplos(A)
    resolver(A)
    faq(A)


# ------------------------------------------------------------------ qué es
def intro(A):
    A.h(1, 'Antes de empezar', salto=True)
    A.p('Este manual es para **Dirección**: gerencia, presidencia o el dueño. Con este usuario **ves todo** lo que pasa en la app —las obras, el avance columna por columna, las fotos, los tiempos de cada tarea, la certificación, los gastos, la ganancia y los puntos del personal— y le podés preguntar cualquier cosa al **Asistente**. Lo que **no** podés es cambiar datos: eso lo hace la oficina.')
    A.tabla(['Querés…', 'Andá a…'], [
        ['Saber cómo venimos hoy', '**Inicio** (el número del día, la curva del contrato, qué se hizo hoy). O preguntale al Asistente «¿cómo vamos?».'],
        ['Ver todo de una obra', '**Obras** › la obra (el legajo) y **Avance de obra** › la obra.'],
        ['Ver cuánto se tarda', 'Las órdenes (**📸 Avance** de cada una: el tiempo de cada columna), el **Tiempo de la obra** en Avance de obra, y el Asistente.'],
        ['Ver la plata', 'La tarjeta **Plata** del Inicio, **Certificación del mes** y **Gastos de obra** (en el menú).'],
        ['Ver los puntos del personal', '**Producción del personal** (en el menú). Para el porqué de cada punto, el Asistente.'],
        ['Pedir un cambio', 'Decíselo al Asistente: te lo deja anotado para la oficina con **Sí, mandalo**.'],
    ], anchos=[5, 12])
    A.p('Los nombres de botones y pantallas van en **negrita**, como están en la app. Las capturas son de la app de hoy (versión del 18/11/2026) con datos de ejemplo; las que dicen «captura de la app real» son de la app de la empresa. Los recuadros celestes son **Consejos** y los naranjas, cosas para tener en cuenta.')
    A.atencion('En cada pantalla que mirás aparece arriba la franja amarilla «tu usuario es **solo para mirar**: podés ver todo, pero no cargar ni cambiar datos». Es normal. Si tocás algo que cambia datos, la app avisa «🔒 Tu usuario no tiene permiso…» y no hace nada.')


# ------------------------------------------------------------------ entrar, menú, barra
def entrar(A):
    A.h(1, 'Entrar y moverse por la app', salto=True)
    A.h(2, 'Entrar')
    A.p('La app anda en el celular (la app de Android «EMA Alumbrado» o Chrome) y en la compu (Chrome). Entrás con **tu usuario y tu contraseña**, que te da Administración.')
    A.pasos(['Escribí tu usuario corto (por ejemplo «roberto») y tu contraseña.', 'Tocá **Entrar**. Si dejás tildado **Recordarme en este aparato**, la próxima vez entra sola.', 'Si te olvidaste la contraseña: **¿Olvidaste tu contraseña o tu usuario?** › tu usuario o tu correo › **Mandarme el correo**. Si tu usuario no tiene un correo real, pedile a Administración que te la cambie.'])
    A.cel(('pp_entrar', 'La pantalla de entrada'), ('pp_olvide', '«¿Olvidaste tu contraseña?»'))
    A.consejo('Cuando aparece el cartel **Hay una versión nueva · Actualizar**, tocalo: la app se pone al día sola. No hace falta instalar nada.')

    A.h(2, 'La barra de abajo y el menú')
    A.p('En el celu, abajo tenés la barra: **Inicio · Obras · Mapa · Informes · Perfil**. Todo lo demás está en el **menú** (las tres rayitas arriba a la izquierda). En la compu no hay barra: se usa el menú.')
    A.p('Arriba del menú dice tu nombre y «**Dirección** — Mira todo (también la plata y los puntos), no cambia nada». Lo que vas a usar más:')
    A.tabla(['En el menú', 'Qué ves'], [
        ['Inicio', 'La pantalla de Dirección: cómo viene el contrato hoy.'],
        ['Obras (legajos)', 'Cada obra con todo lo que pasó: fotos, videos, planos, órdenes, material, gastos, documentación, columnas.'],
        ['Órdenes de trabajo', 'Las órdenes de hoy, las próximas, las que faltan cerrar y las cerradas, con lo que mandó la cuadrilla y el tiempo de cada columna.'],
        ['Planificación semanal', 'Lo planeado para la semana.'],
        ['Avance de obra', 'El avance de cada obra columna por columna, el tiempo de la obra, el itemizado y el **🔎 Control del avance**.'],
        ['Mapa de plazas', 'Las obras en el mapa y el personal en vivo.'],
        ['Pañol / Stock', 'El stock, las reservas, los movimientos y las herramientas.'],
        ['Informes', 'El centro de informes y el informe mensual con fotos.'],
        ['Certificación del mes', 'El borrador del certificado del mes, obra por obra.'],
        ['Gastos de obra', 'Por obra, Ganancia, Combustible, Precios, Generales y por mes.'],
        ['Producción del personal', 'Los puntos por persona y por quincena, el personal y cuánto vale cada tarea.'],
        ['Cálculo de materiales, Guías, Normas y planos', 'El cómputo de cada obra y cómo se hace cada trabajo.'],
    ], anchos=[5, 12])
    A.cel(('dr_cel_menu', 'El menú de Dirección'), ('dr_cel_menu_2', 'Más abajo: Certificación, Gastos, Producción'), ('pp_perfil', 'Perfil'))
    A.p('**Perfil** tiene tu nombre, tus ajustes (entrar con huella, que el Asistente lea en voz alta, avisos al celular), la versión de la app, **Cambiar contraseña** y **Cerrar sesión**. El «atrás» del celu cierra lo que está abierto o vuelve a la pantalla anterior.')


# ------------------------------------------------------------------ Inicio
def inicio(A):
    A.h(1, 'El Inicio: cómo venimos', salto=True)
    A.p('Es lo primero que ves al entrar. En el celu va todo en una columna (deslizás para abajo); en la compu, en grilla. Todo lo que muestra es de **nuestra zona del contrato** (Renglón 1 · Zona A Este: 127 plazas, 18.407 módulos). Se actualiza solo.')
    A.consejo('**K** son **módulos**: la unidad del pliego. Cada ítem vale K módulos y el módulo tiene un precio. Por eso la app mide el avance del contrato en K.')
    A.h(2, 'El número del día')
    A.p('Arriba, en la portada azul:')
    A.vinetas([
        '**El número del día**: los K hechos **hoy** (lo de las órdenes cerradas hoy, más lo que la cuadrilla ya mandó y la oficina todavía no cerró, **estimado**), y al lado **ayer**.',
        'La barra: qué % del **ritmo que hace falta** para llegar al plazo llevamos hoy, y la **meta** de K por día.',
        'Debajo: el % del contrato hecho (y el que marca el plan), cuántos días antes o después se llega **a este ritmo** («No llega» si a este ritmo no se termina) y cuántas plazas están terminadas. En la compu son 6 números.',
    ])
    A.cel(('dr_cel_inicio', 'La portada en el celu'), ('dr_cel_atencion', 'Necesita tu atención'), ('dr_cel_barras', 'Módulos por día (14 días)'))
    A.atencion('El plazo sale de la **fecha del acta de inicio** y los **4 meses** del contrato, que carga Administración. Si no está cargada, la app usa la primera orden de la zona y lo dice «**estimada**». Los días hábiles son de lunes a viernes, sin feriados (a confirmar).')
    A.h(2, 'Necesita tu atención')
    A.p('Hasta 3 cosas importantes: el ritmo contra el plazo, una obra atrasada contra su plan, órdenes sin cerrar, falta de material o una obra trabada. Cada una tiene su botón (**Ver plan ›**, **Ver obra ›**, **Ver órdenes ›**) que te lleva a mirarla.')
    A.h(2, 'Módulos por día y Curva S')
    A.vinetas([
        '**Módulos por día**: barras de los últimos 14 días (lo cerrado, y rayado lo mandado sin cerrar), con la línea punteada del **ritmo necesario**.',
        '**Curva S**: lo **real** acumulado, el **plan** (por ahora una recta, a confirmar) y a dónde llegamos **a este ritmo** (el promedio de los últimos 7 días hábiles). Si todavía hay pocos días con avance, dice que no hay ritmo suficiente para estimar.',
    ])
    A.cel(('dr_cel_curva', 'Curva S'), ('dr_cel_hoy', 'Qué se hizo hoy / ayer'), ('dr_cel_mapa', 'Dónde se trabaja hoy'))
    A.h(2, 'Qué se hizo hoy / ayer')
    A.p('Por obra, lo hecho hoy (o ayer, con la pestaña) con sus K, la gente y el vehículo, y si todavía está «sin cerrar». Al lado de cada obra, **la última foto del día**: tocala y se abre grande, con las demás.')
    A.h(2, 'Dónde se trabaja hoy y el equipo')
    A.vinetas([
        '**Dónde se trabaja hoy**: el mapa con las obras de las órdenes de hoy, numeradas, con cuántas personas hay en cada una (y si están mandando la ubicación en vivo).',
        '**Gente y vehículos**: cuántos están en obra hoy, cuántos **sin tarea** (con los nombres), ausentes y vehículos en uso.',
    ])
    A.img('real_23', '«Dónde se trabaja hoy» en la app real: cada obra con su número, la gente y si están en vivo', ancho=12)
    A.cel(('dr_cel_equipo', 'Gente y vehículos'), ('n155_dir_calendario_cel', 'Clima y Programación › Calendario'), ('dr_cel_prog', 'Programación › Por obra'))
    A.h(2, 'Clima contra lo planeado')
    A.p('El pronóstico de 7 días de Córdoba contra lo que está planeado (las órdenes emitidas y la orden sugerida de la semana). Avisa si llueve el día que hay hormigonado, zanja o izaje, o si hay viento fuerte el día del izaje o de la grúa. **Solo avisa, no cambia nada.** Los límites (lluvia de 5 mm o 70 % de probabilidad, viento de 40 km/h) están a confirmar. Sin señal dice «Sin pronóstico».')
    A.h(2, 'Programación: ¿cuándo termina cada obra?')
    A.p('Cada obra con su barra: dónde está hoy, la **fecha prevista** (la del Gantt de la obra o su fecha estimada; si no tiene, «sin fecha prevista») y la fecha **a este ritmo**. Colores: verde a tiempo, amarillo en riesgo, rojo atrasada (más de 7 días), gris sin fecha prevista.')
    A.vinetas([
        '**Por obra** / **Semáforo**: la lista. En la compu, el semáforo suma por obra el material, las fotos y los papeles.',
        '**Pistas** (en la compu): las barras de todas las obras.',
        '**Calendario**: ya vencidas, esta semana, la próxima y por mes.',
        '**Control ›** abre el control del avance y **Avance ›** el avance de obra.',
    ])
    A.h(2, 'Plata: certificado, gasto y material')
    A.p('Sin IVA: el último mes certificado (cerrado), el **borrador del mes** que va hasta hoy, lo **acumulado certificado** y el **margen** (certificado contra gasto). Debajo, el material **entregado** a las obras contra el **usado según el avance**, en pesos con el último precio. **Certificación ›** abre el certificado del mes.')
    A.cel(('dr_cel_plata', 'Plata'), ('dr_cel_ia_inicio', 'Preguntale al asistente'))
    A.p('Al final, **Preguntale al asistente** con cuatro botones listos: **¿Cómo vamos?**, **Resumen de la semana**, **¿Qué obra está más atrasada?** y **¿Cuánto certificamos?** (ver «El Asistente»).')
    A.h(2, 'En la compu')
    A.img('dr_pc_inicio', 'El Inicio de Dirección en la compu: portada con 6 números, atención, barras y curva S')
    A.img('dr_pc_inicio_2', 'Más abajo: qué se hizo hoy, dónde se trabaja, programación (Semáforo · Pistas · Calendario) y equipo')
    A.img('dr_pc_prog', 'Programación › Semáforo: plazo, material, fotos y papeles de cada obra')


# ------------------------------------------------------------------ una obra en detalle
def obra(A):
    A.h(1, 'Cada detalle de una obra', salto=True)
    A.h(2, 'Obras (legajos)')
    A.p('**Obras** en la barra (o en el menú). Pestañas **🚧 En curso**, **📄 Falta documentación** (obras avanzadas o terminadas a las que les falta algún papel), **✅ Terminadas** (100 %) y **🗄 Archivadas**; filtros Plazas / Barrios / Otras y buscador. Cada tarjeta muestra el % de avance y las órdenes.')
    A.img('dr_pc_obras', 'La lista de obras')
    A.p('Tocá una obra y se abre su **legajo**: todo lo que pasó en esa obra en un solo lugar. Arriba, los números (avance, órdenes, fotos, materiales, gastos) y los botones **Planos**, **Avance** e **Imprimir legajo**. Las secciones se abren y cierran tocando el título:')
    A.tabla(['Sección', 'Qué te dice'], [
        ['📄 Documentación', 'Las 4 cosas del cierre: carpeta EPEC, conforme a obra, planilla de PAT y certificado de instalación apta, con ✅ o ❌ y **👁 Ver** el archivo.'],
        ['Fotos', 'Todas las fotos, agrupadas por columna, tablero, zanja… Tocá una para verla grande (con quién la sacó, cuándo y dónde). Con **☑ Elegir** marcás varias y las mandás con **📤 Enviar** (WhatsApp, Drive, mail; en la compu baja un ZIP).'],
        ['🎥 Videos y PDF', 'Los videos de obra y los PDF (planos, remitos, papeles), con su reproductor.'],
        ['Planos', 'Los planos de la obra, en grande.'],
        ['Columnas de la obra', 'El nombre de cada columna (Col 1, Col 2…).'],
        ['Órdenes de trabajo', 'Todas las órdenes de la obra.'],
        ['Material entregado', 'Lo que salió del pañol para la obra (vales).'],
        ['🧾 Material: calculado vs. entregado', 'El cómputo contra lo que salió: falta entregar, coincide, sin entregar, salió sin estar calculado.'],
        ['📦 Material contra avance', 'Lo que salió contra lo que justifica el avance: 🟢 parejo, 🟡 diferencia, 🔴 para mirar (por ejemplo «salieron 300 m, el avance justifica 30 m»).'],
        ['🧱 Planilla de columnas', '«Lo hecho, verificado»: cada columna por etapa (pozo, hormigón, izaje, vínculo, luminaria, tablerito, sellado) en verde verificado, celeste hecho sin verificar, rojo no se hizo, amarillo asignado.'],
        ['💰 Gastos e Historial', 'Lo gastado en la obra y todo lo que pasó, con fecha.'],
    ], anchos=[4.5, 12.5])
    A.img('dr_pc_legajo', 'El legajo de una obra, con la Documentación arriba')
    A.img('dr_pc_legajo_mat', 'Material: calculado vs. entregado')
    A.img('dr_pc_legajo_mav', 'Material contra avance: lo que no se explica, en rojo')
    A.img('dr_pc_legajo_hv158', 'Planilla de columnas: lo hecho en cada columna, verificado o no')
    A.img('n160_legajo_videos_pc', 'Videos y PDF en el legajo')
    A.h(2, 'El mapa')
    A.p('**Mapa** en la barra. Las obras con su pin de color según el avance: gris sin empezar, rojo menos de 30 %, amarillo 30 a 59 %, azul 60 a 99 %, verde terminada. Tocá un pin y se abre la ficha de la obra, con su legajo. Arriba a la derecha cambiás a **satélite**. Abajo a la izquierda, **👷 Personal en vivo**: dónde está cada persona de la cuadrilla en el horario de trabajo (y desde cuándo no actualiza).')
    A.img('real_21', 'El mapa en satélite con las obras (captura de la app real)')
    A.img('ex_vivo', 'El mapa con «Personal en vivo» abajo a la izquierda')
    A.atencion('El modo **🎯 Control** del mapa (el «mapa de guerra») es para quien arma las órdenes: con tu usuario no aparece. Lo mismo te lo dice el Inicio (dónde se trabaja, alertas, equipo).')


# ------------------------------------------------------------------ avance
def avance(A):
    A.h(1, 'El avance de obra', salto=True)
    A.p('Menú › **Avance de obra**. Arriba, las obras (Todas / Plazas / Barrios / Otras) y las pestañas **📊 Avance**, **📄 Falta documentación** y **✅ Terminadas**. Tocá **Ver detalle** en una obra.')
    A.img('dr_pc_avance_lista', 'Avance de obra: cómo va cada obra')
    A.h(2, 'El avance de una obra')
    A.p('Es la obra **por rubro y por columna**, con sus pasos y sus piezas. **El % de la obra sale de acá** y es el que muestra toda la app (Inicio, mapa, obras). Se pesa por las horas-hombre de cada cosa (a confirmar).')
    A.vinetas([
        '**Arriba**: el anillo con el %, el inicio, la fecha prevista y la fecha **a este ritmo**; la tira de columnas con su color (completa, a medias, fraguando, falta pieza, falla, sin empezar); lo que **Falta** y las alertas (bases fraguando, fallas).',
        '**Tiempo de la obra**: días trabajados, días hábiles hasta la prevista, % por día de los últimos 7 y cuándo se trabajó por última vez, con su curva.',
        '**Material para lo que falta** y **¿Está terminada?**: la lista de lo que falta para el cierre (pruebas, inspecciones, papeles).',
        '**Por rubro**: civil, columnas, tableros, zanjeo, cable, PAT, papeles… Tocá uno y se despliega con cada tarea y cuántas lleva («5 de 12 columnas»).',
        '**Lo último que pasó**: las últimas columnas hechas, con la orden y la fecha.',
    ])
    A.img('dr_pc_avance', 'El avance de una obra: el resumen, el tiempo de la obra y los rubros')
    A.img('dr_pc_avance_grilla', 'Un rubro desplegado y lo último que pasó')
    A.h(2, 'Qué lo mueve')
    A.vinetas([
        'Lo mueven **las órdenes**: lo que la cuadrilla mandó desde la obra (con foto y hora) queda **en revisión**; cuando la oficina cierra la orden, queda **hecho**.',
        'Si una orden dice «5 columnas» sin decir cuáles, cuenta las 5 siguientes que faltan.',
        'Un «no se hizo» por algo roto queda como **falla** hasta que se rehace. El hormigón recién hecho queda **fraguando** 72 horas.',
        'La oficina también puede marcar a mano lo que ya estaba hecho (siempre con un motivo, que queda en el historial) o **poner al día** una obra que se hizo antes de cargar órdenes.',
    ])
    A.p('Tocá una columna de la tira y se abre su hoja: cada paso, si está hecho, de qué orden salió, quién, la fecha, los minutos y **📷 Ver foto**. Vos la ves sin los botones para marcar.')
    A.img('dr_pc_avance_col', 'La hoja de una columna: cada paso con su orden, su foto y sus minutos')
    A.h(2, 'El itemizado (lo que se cobra)')
    A.p('**🧾 Ver itemizado** muestra la obra ítem por ítem del pliego (con su K, contratado, hecho y lo que falta). El avance de obra mide el trabajo; el itemizado es la plata: lo que se certifica.')
    A.h(2, '🔎 Control del avance')
    A.p('Con **🔎 Control** (en el avance de una obra) o **🔎 Control del avance** (arriba de la lista) se abre la hoja que **explica cada número** con sus fuentes y revisa si está bien. Elegís una obra o «Todas».')
    A.vinetas([
        'Por cada obra, si **cuadra** o cuántas cosas hay mal o para mirar.',
        'Los **hallazgos**, en rojo, ámbar o para saber: una orden cerrada que no movió el avance (o lo movió dos veces), cargado a mano sin respaldo ni fecha, la misma columna en dos órdenes, un orden imposible (izaje sin hormigón), poco fraguado, el cálculo distinto del itemizado, 100 % sin documentación, un salto raro de avance…',
        'Ítem por ítem: de dónde sale cada unidad (cada orden cerrada con su fecha y tarea; lo cargado a mano con quién, cuándo y por qué).',
        '**✨ Que lo analice el asistente**: le pasa todo al Asistente para que te lo explique.',
    ])
    A.img('dr_pc_control', 'Control del avance: cada obra y los hallazgos')
    A.consejo('Vos ves el control sin los botones para corregir. Si algo está mal, pedíselo al Asistente («dejale anotado a la oficina que revise la OT-2026-203 de El Olmo»).')


# ------------------------------------------------------------------ tiempos
def tiempos(A):
    A.h(1, 'Los tiempos: cuánto se tarda', salto=True)
    A.p('La app sabe cuánto tarda cada columna porque la cuadrilla saca **una foto al terminar cada columna**: la hora de esa foto es el **fin** de la columna, y el **inicio** es la columna anterior (o la hora en que tocaron **▶ Voy a iniciar esta tarea**, o «Llegué»).')
    A.h(2, '«Voy a iniciar» y el tiempo de cada columna')
    A.vinetas([
        'Al empezar una tarea, la cuadrilla toca **▶ Voy a iniciar esta tarea**: queda la hora exacta de inicio de la tarea y de su primera columna, para todos los de la orden.',
        'Cada foto marca una columna: «✓ Col 1 lista · 42 min». La cuadrilla puede corregir unos minutos con − / + si se olvidó de sacar la foto al momento.',
        'Una hora **dudosa** (dos fotos seguidas de menos de 3 minutos, más de 5 horas en una columna o sin inicio) queda marcada aparte y no entra en los promedios (los límites están a confirmar).',
        'Las tareas sin columnas (la zanja, el tablero) tienen un solo tramo: de que empiezan a que terminan.',
        'Si la cuadrilla hizo algo que no estaba en la orden, aparece como **➕ Hecho de más · no estaba en la orden**.',
    ])
    A.h(2, 'Dónde lo ves')
    A.p('**Órdenes de trabajo** › **Tablero** (Hoy, Para revisar y cerrar, Próximas, Sin cerrar, Cerradas). En cada orden, **📸 Avance**: lo que marcó la cuadrilla, las fotos, y el recuadro **⏱ Tiempo de cada columna** con la hora de inicio y fin de cada columna, los minutos, quiénes, y la mediana.')
    A.img('dr_pc_ordenes', 'Órdenes › Tablero, con «📸 Avance» en cada orden')
    A.cel(('dr_cel_tiempos', '📸 Avance: el tiempo de cada columna'), ('dr_cel_verif', 'La verificación de la orden'), ('dr_cel_ia_tiempos', 'Preguntale al Asistente'))
    A.vinetas([
        '**La verificación** de cada orden (en el tablero): ✅ cumplida, 🟡 parcial («2 de 3»), 🔴 nada o ⚠ dudosa (sin foto, foto lejos de la obra, hora rara), con lo que pidieron, lo que hicieron con foto y hora, y lo que no se hizo con el porqué.',
        '**Tiempo de la obra** en Avance de obra: días trabajados, ritmo y la fecha a este ritmo.',
        '**Seguimiento** (en Órdenes): cada tarea dada, lo hecho y lo que falta, por persona y por obra.',
    ])
    A.h(2, 'Preguntale al Asistente')
    A.p('Para comparar tiempos lo más fácil es el Asistente: junta los minutos de cada columna de todas las órdenes cerradas (sin las horas dudosas) por tarea, por persona y por cuadrilla. Por ejemplo:')
    A.vinetas([
        '«¿Cuánto tardan en el izaje de cada columna?»',
        '«¿Quién es más rápido en el tablerito: Juan y Pedro o Lucas y Diego?»',
        '«¿Cuántos minutos por columna lleva el pozo en Bulevares?»',
        '«¿Cuántas columnas por día rinde una cuadrilla de 2 en el hormigonado?»',
        '«¿A qué hora empezaron hoy en Los Álamos y cuánto llevan?»',
    ])
    A.atencion('La pantalla **🧠 Lo que aprende la app** (tiempos por tarea y persona, récords de cada uno, material real) y el **Supervisor** son de la oficina: con tu usuario no aparecen. Lo mismo lo podés preguntar al Asistente. Los **récords** personales los ve cada uno en su celu.')


# ------------------------------------------------------------------ plata
def plata(A):
    A.h(1, 'La plata: certificación, gastos y ganancia', salto=True)
    A.h(2, 'Certificación del mes')
    A.p('Menú › **Certificación del mes** (o **Certificación ›** en la tarjeta Plata del Inicio). La app arma sola el **borrador** del certificado del mes con lo que avanzaron las órdenes cerradas ese mes, **solo de nuestra zona**:')
    A.vinetas([
        'Arriba: los módulos del mes, los ítems con avance, lo que hay **para revisar** y el acumulado de la zona.',
        'Por obra: cada ítem con su K, contratado, anterior, este mes, acumulado, módulos y pesos sin IVA, y de qué órdenes sale.',
        'A la derecha: el **total del borrador** sin IVA y con IVA (21 %), **Armar PDF del certificado** (con QR) y **Planilla (Excel)**.',
        '⚠ **Para revisar antes de certificar**: lo cargado a mano sin fecha no entra en ningún mes y la app lo marca.',
        'Arriba elegís el mes y la obra. El mes lo **cierra Administración**: después queda fijo.',
    ])
    A.img('dr_pc_cert', 'El borrador de la certificación del mes')
    A.h(2, 'Gastos de obra')
    A.p('Menú › **Gastos de obra**, con sus pestañas:')
    A.tabla(['Pestaña', 'Qué ves'], [
        ['🏗 Por obra', 'Lo gastado en cada obra (materiales, mano de obra, otros) contra lo certificado, y el margen. Arriba, el total.'],
        ['📈 Ganancia', 'Por obra: itemizado, certificado, avance, gasto y la ganancia sobre lo certificado y sobre el itemizado (sin IVA). Con **Imprimir** y **Excel**.'],
        ['⛽ Combustible', 'Por vehículo, con litros y km, repartido entre las obras.'],
        ['🏷 Precios', 'Los precios que usa la app.'],
        ['🏢 Generales y por mes', 'Los gastos que no son de una obra (seguros, oficina, impuestos…), cómo se reparten entre las obras, y el resumen por mes con el resultado.'],
    ], anchos=[4, 13])
    A.img('dr_pc_ganancia', 'Ganancia por obra')
    A.img('dr_pc_generales', 'Gastos generales y resumen por mes')
    A.atencion('Los gastos de mano de obra salen del valor hora de la nómina: si alguien no tiene el valor hora cargado, la app lo avisa arriba y sus horas quedan «pendientes».')
    A.h(2, 'Informes')
    A.p('**Informes** en la barra: el **Informe mensual con fotos** y el **Centro de informes** (avance, Gantt, material a usar, conforme a obra… en PDF, Word o Excel). Si un botón te dice que no tenés permiso, pedíselo al Asistente: «armame el PDF del avance de Bulevares» o «pasame el informe mensual».')
    A.img('of_informe', 'Informes')
    A.atencion('El **Tablero del dueño** y el **📰 Informe de la semana** los abre Administración (y quien ella habilite): con tu usuario no aparecen. Lo mismo lo tenés en tu Inicio y preguntándole al Asistente «resumen de la semana».')


# ------------------------------------------------------------------ puntos
def puntos(A):
    A.h(1, 'El personal y los puntos', salto=True)
    A.p('Menú › **Producción del personal**: **Producción por persona** (puntos del período, quién produjo cuánto, por cuadrilla y plaza), **Por quincena** (la quincena en curso y las cerradas, con el valor del punto), **Total**, **Personal del equipo** (la nómina) y **Cuánto vale cada tarea**.')
    A.img('dr_pc_prod', 'Producción por persona')
    A.vinetas([
        '1 punto = 1 hora-hombre efectiva. Cada tarea vale sus horas por unidad × la dificultad (de 1,00 a 1,80).',
        'Los puntos de una orden se reparten entre los que la hicieron por rol × horas (Oficial y Capataz 1 · Medio oficial 0,8 · Ayudante 0,6 · Chofer 0,4 · Sereno 0,2), salvo que la tarea sea de una persona o de un grupo elegido.',
        'Quedan fijos al cerrar la orden. Quincenas: del 1 al 15 y del 16 a fin de mes.',
        'Cada cambio a mano de puntos pide un **motivo**, que queda en el historial.',
    ])
    A.p('Para saber **por qué** alguien tiene esos puntos, o si están bien, preguntale al Asistente: explica cada punto con la cuenta paso a paso (el mismo total que Producción), con los motivos anotados por la oficina, y revisa si hay algo raro (un reparto que no suma, alguien con 0 horas, la misma columna cobrada dos veces, puntos a mano sin motivo). Nunca inventa un motivo: si no hay, dice «sin motivo anotado».')
    A.consejo('La hoja **🔎 Revisar y explicar los puntos** de Producción es de la oficina; vos tenés lo mismo con el Asistente.')


# ------------------------------------------------------------------ asistente
def asistente(A):
    A.h(1, 'El Asistente', salto=True)
    A.p('Es una inteligencia artificial adentro de la app que **lee todo lo que hay** (obras, órdenes, avance, fotos, tiempos, pañol, certificación, gastos, puntos) y te contesta en castellano. Con tu usuario pregunta todo como la oficina, **sin cambiar nada**.')
    A.h(2, 'Abrirlo')
    A.vinetas([
        'La **lengüeta de la estrellita** en el borde derecho (se arrastra para arriba o abajo).',
        'En el Inicio, la tarjeta **Preguntale al asistente** con sus cuatro botones.',
        'En la compu se abre como un panel a la derecha, y la app sigue a la vista al lado.',
    ])
    A.cel(('dr_cel_ia', 'Al abrirlo'), ('dr_cel_ia_resp', '«¿Cómo vamos?»'), ('n155_dir_asistente_cel', 'Dejarle anotado algo a la oficina'))
    A.h(2, 'Escribirle o hablarle')
    A.vinetas([
        'Escribí en la caja y tocá la flecha. Apenas mandás aparece «💭 Pensando…» y la respuesta se va escribiendo.',
        '🎤 **Dictar**: tocá el micrófono y hablá; el texto aparece mientras hablás. Se apaga cuando lo tocás de nuevo o cuando mandás.',
        '🔊 **Escuchar**: cada respuesta tiene el botón para oírla. En **Perfil** podés poner que lea siempre en voz alta.',
        '🗣 **Modo charla** (el botón de las ondas): le hablás, te contesta en voz alta y vuelve a escuchar, sin tocar nada. Para cortar: **Terminar**, o decí «listo» o «chau». Ideal en el auto.',
        'Podés seguir la charla: «¿y la de Las Acacias?», «mostrame las fotos», «armámelo en PDF».',
    ])
    A.h(2, 'Lo que puede y lo que no')
    A.p('**Sí puede:**')
    A.vinetas(['Contestar todo lo que hay en la app, con números: avance, plata, gastos, puntos, tiempos, stock, personal.', 'Explicar de dónde sale un número (el avance de un ítem, los puntos de alguien) y revisar si está bien.', 'Mirar fotos y planos, y decirte si una foto parece de otra obra.', 'Armar un PDF (una orden, el avance de una obra, el informe mensual, los puntos…).', '**Dejarle anotado un pedido a la oficina** (con tu **Sí**).'])
    A.p('**No puede** (con tu usuario):')
    A.vinetas(['Cambiar datos: órdenes, avance, puntos, obras, pañol, fotos. Eso lo hace la oficina.', 'Inventar: si un dato no está, lo dice. Lo que está «a confirmar» lo dice así.'])
    A.h(2, 'Cuántas preguntas por día')
    A.p('Dirección tiene **30 preguntas por día** (se reinicia al día siguiente). Abajo del chat dice **Te quedan N preguntas hoy**. Cuenta cada pregunta tuya; las vueltas que da para buscar datos no cuentan. Hay además un freno de gasto del mes que maneja Administración.')
    A.consejo('Si dice que te quedan 10 (el tope de «solo mirar») o aparece un cartel verde de que hay que actualizar el asistente, avisale a Administración: falta pegar la versión nueva del asistente (v5) en el servidor.')


def ejemplos(A):
    A.h(1, 'Preguntas de ejemplo para el Asistente', salto=True)
    A.p('Preguntá como le preguntarías a alguien de la oficina. No hace falta escribir el nombre exacto de la obra: «los álamos», «bulevares» o el ID («4019») alcanzan. Estas son preguntas que el Asistente puede contestar con tu usuario:')
    G = [
        ('📊 Cómo vamos', ['¿Cómo vamos?', '¿Llegamos al plazo del contrato? ¿A qué ritmo tendríamos que ir?', '¿Cuántos módulos hicimos esta semana? ¿Y comparado con la anterior?', 'Resumen de la semana.', '¿Qué se hizo hoy? ¿Y ayer?', '¿Cuántas plazas terminamos?']),
        ('⚠ Obras atrasadas y programación', ['¿Qué obra está más atrasada?', '¿Cuándo terminamos Los Álamos a este ritmo?', '¿Qué obras vencen esta semana?', '¿Qué obras están paradas o sin movimiento?', '¿Qué hay planeado para mañana?', '¿Llueve algún día que haya hormigonado?']),
        ('🏗 Una obra en detalle', ['Contame todo de Plaza Bulevares.', '¿Qué le falta a Las Acacias para terminar?', '¿Cómo está la Col 2 de Bulevares?', '¿Tiene la documentación completa? ¿Falta la planilla de PAT?', '¿Qué órdenes tuvo Los Álamos y quiénes fueron?', '¿Dónde queda la obra y cómo llego?']),
        ('📈 El avance y por qué un número', ['¿Por qué Bulevares está en 12 %?', '¿De dónde salen las 8 columnas hechas de Las Rosas?', 'Revisá el avance de todas las obras y decime qué está mal.', '¿La OT-2026-130 se hizo completa? ¿Tiene fotos de todo?', '¿Hay alguna columna cobrada dos veces?', '¿Hay bases fraguando? ¿Cuándo se pueden izar?']),
        ('⏱ Tiempos', ['¿Cuánto tardan en el izaje de cada columna?', '¿Quién es más rápido en el tablerito?', '¿Cuántos minutos por columna lleva el pozo en Bulevares?', '¿Cuántas columnas por día rinde una cuadrilla de 2?', '¿A qué hora empezaron hoy en Los Álamos?', '¿Qué órdenes tienen horas dudosas?']),
        ('💰 Plata: certificación, gastos y ganancia', ['¿Cuánto certificamos? ¿Cuánto va el borrador de noviembre?', '¿Cuánto vamos a certificar de Plaza Mitre este mes?', '¿Cuánto gastamos en Los Álamos?', '¿Qué obra deja más ganancia? ¿Y cuál menos?', '¿Cuánto combustible se usó este mes y en qué obras?', '¿Cuánto llevamos certificado en total de la zona?']),
        ('📦 Material y pañol', ['¿Hay luminarias en el pañol? ¿Cuántas armadas?', '¿Qué material salió para Bulevares y cuánto se usó según el avance?', '¿Hay material entregado que no se justifica con el avance?', '¿Qué falta comprar?', '¿Qué herramientas están afuera y quién las tiene?']),
        ('⭐ Puntos', ['¿Por qué Juan tiene 25 puntos esta quincena?', '¿Quién hizo más puntos este mes?', 'Revisá si los puntos de la quincena están bien.', '¿Por qué se cambiaron los puntos de la OT-2026-177?', '¿Cuánto vale el izaje de una columna y por qué?']),
        ('👷 Personal y equipo', ['¿Quién está trabajando hoy y dónde?', '¿Quién quedó sin tarea mañana?', '¿Quién falta hoy?', '¿Todos tienen la app al día? ¿Alguien tiene fotos sin subir?', '¿Qué avisaron hoy las cuadrillas?']),
        ('📷 Fotos y planos', ['Mostrame las fotos de hoy de Las Acacias.', '¿Hay fotos que parecen de otra obra?', 'Mostrame la foto del tablero de Los Álamos.', 'Mirá el plano de Bulevares: ¿cuántas columnas tiene?']),
        ('📄 Informes y PDF', ['Armame el PDF del avance de Bulevares.', 'Pasame el informe mensual.', 'Armame el PDF de los puntos de la quincena.', 'Armame el PDF de la orden OT-2026-130.']),
        ('📘 Cómo se hace', ['¿Cómo se hace la puesta a tierra de una columna PRFV?', '¿Cuánto fragua una base antes de izar?', '¿Qué lleva el tablerito de una columna?']),
    ]
    for t, l in G:
        A.h(3, t)
        A.vinetas(['«' + x + '»' for x in l])
    A.h(2, 'Para pedir un cambio')
    A.p('El Asistente no cambia nada con tu usuario. Si querés que algo se haga, decíselo igual y te ofrece dejárselo anotado a la oficina:')
    A.pasos([
        'Pedile lo que quieras: «pasá la OT-2026-130 a mañana», «que revisen los puntos de Juan», «que pongan al día Plaza Vieja».',
        'Te contesta «Eso lo hace la oficina; ¿te lo dejo anotado para ellos?». Decile que sí.',
        'Aparece la tarjeta **📝 Dejarle anotado a la oficina** con el pedido y a quién le llega. No se manda sola: confirmala.',
        'Les llega el aviso al celu a Administración y Oficina. En la tarjeta dice «Listo: se lo dejé anotado a la oficina».',
    ])
    A.consejo('Cuanto más concreto, mejor: la obra, la orden o la persona, y qué querés que hagan. El Asistente lo arma claro antes de mandarlo.')


# ------------------------------------------------------------------ para resolver
def resolver(A):
    A.h(1, '📨 Lo que avisan las cuadrillas', salto=True)
    A.p('La cuadrilla, el pañol y «solo mirar» le avisan cosas a la oficina hablándole al Asistente («falta un vínculo en Los Álamos», «se rompió la escalera», «me faltaron puntos en la orden de ayer»). Le llegan a Administración y a quien sigue esa orden, que los ve en la bandeja **📨 Para resolver**, responde y los marca resueltos. Un reclamo de puntos se analiza y se autoriza o no, siempre con motivo.')
    A.p('Dirección **solo mira** estos avisos: no responde ni resuelve. Para saber qué avisaron, preguntale al Asistente:')
    A.vinetas(['«¿Qué avisaron hoy las cuadrillas?»', '«¿Hay algún aviso de seguridad o urgente sin resolver?»', '«¿Qué reclamos de puntos hubo esta quincena y qué se decidió?»'])
    A.img('dr_pc_resolver', 'La bandeja «Para resolver» (la maneja la oficina)', ancho=13)


# ------------------------------------------------------------------ preguntas frecuentes
def faq(A):
    A.h(1, 'Preguntas frecuentes', salto=True)
    P = [
        ('Toco un botón y dice que no tengo permiso', ['Es normal: tu usuario mira todo pero no cambia nada. Si querés que se haga, decíselo al Asistente y te lo deja anotado para la oficina.']),
        ('El número del día o el plazo me parecen raros', ['Revisá que Administración haya cargado la **fecha del acta de inicio** del contrato (si no, dice «estimada»). Lo mandado por la cuadrilla y todavía sin cerrar es una estimación: puede cambiar cuando la oficina cierre la orden.']),
        ('El avance de una obra no coincide con lo que vi en la obra', ['El avance se mueve con las órdenes: si algo se hizo sin orden o la oficina todavía no cerró la orden, no está. Abrí **🔎 Control** para ver de dónde sale cada número, o preguntale al Asistente «¿por qué Bulevares está en 12 %?». Si hay que corregir algo, dejáselo anotado a la oficina.']),
        ('¿Por qué una obra dice «sin fecha prevista»?', ['Porque no tiene Gantt ni fecha estimada cargada. La app igual calcula «a este ritmo» con lo que viene haciendo esa obra.']),
        ('No veo el Tablero del dueño, el Supervisor ni «Lo que aprende la app»', ['Son pantallas de la oficina y Administración. Lo mismo lo tenés en tu Inicio y preguntándole al Asistente. Si querés el Tablero del dueño, pedíselo a Administración.']),
        ('El Asistente dice que no tengo más preguntas', ['Tenés 30 por día; se reinicia al día siguiente. Si dice que está en pausa o cortado por el mes, es el freno de gasto del mes: lo maneja Administración.']),
        ('No me aparece la versión nueva', ['Cerrá la app del todo y volvé a abrirla con señal: tiene que salir **Hay una versión nueva · Actualizar**. En **Perfil › La app** dice «Al día» si no hay nada nuevo.']),
        ('Quiero mandar fotos de una obra', ['En el legajo (o en cualquier foto abierta) tocá **☑ Elegir**, marcá las fotos y **📤 Enviar**: en el celu abre WhatsApp, Drive, mail…; en la compu baja un ZIP. Borrar no podés.']),
        ('Algo no anda', ['Abrí el menú y tocá **Versión …** al pie: sale un cartel con tu usuario y lo que está activo. Sacale una captura y mandásela a Administración.']),
    ]
    for t, ls in P:
        A.h(3, t)
        for l in ls: A.p(l)
