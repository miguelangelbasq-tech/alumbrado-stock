# Contenido del manual de uso (al día con la v147). Lo usa armar.py.
# Bloques: A.h(nivel, txt, salto) · A.p(txt) · A.pasos([...]) · A.vinetas([...]) · A.consejo(txt) · A.atencion(txt)
#          A.tabla(cab, filas) · A.img(captura, pie) (compu) · A.cel((captura, pie), …) (celu, hasta 3 juntas)
# **negrita** = nombre de botón o de pantalla tal como está en la app.

FECHA_PORTADA = 'Versión de la app del 11/11/2026'
PORTADAS = {
    'todo': ('Administración · Oficina · Pañol · Cuadrilla', ''),
    'admin': ('Administración', 'Primeros pasos y Parte 1 — todo lo de la oficina, con lo que es solo de Administración'),
    'oficina': ('Oficina', 'Primeros pasos y Parte 1 — órdenes, obras, avance, informes y producción'),
    'panol': ('Pañol', 'Primeros pasos y Parte 2 — catálogo, reservas, entradas, remitos, compras y herramientas'),
    'cuadrilla': ('Cuadrilla / Operario', 'Primeros pasos y Parte 3 — tu día en la obra desde el celular'),
}


def escribir(A, modo):
    if modo == 'todo':
        si_sos(A); nuevo(A)
    primeros(A, modo)
    if modo in ('todo', 'admin', 'oficina'): parte1(A, modo)
    if modo in ('todo', 'panol'): parte2(A)
    if modo in ('todo', 'cuadrilla'): parte3(A)
    if modo == 'todo': parte4(A)
    faq(A, modo)


# ------------------------------------------------------------------ portada y novedades
def si_sos(A):
    A.h(1, 'Cómo leer este manual', salto=True)
    A.p('El manual está ordenado por lo que hace cada uno. No hace falta leerlo entero: buscá tu rol en la tabla y leé esas partes. Cada pantalla tiene una captura de la app tal como se ve hoy (la versión del 11/11/2026), con datos de ejemplo.')
    A.tabla(['Si sos…', 'Leé'], [
        ['Administración', 'Primeros pasos y la Parte 1 completa. Lo que solo puede hacer Administración (Tablero del dueño, Usuarios y permisos, límites del asistente, cerrar la certificación del mes) está marcado.'],
        ['Oficina', 'Primeros pasos y la Parte 1 (órdenes, obras, avance, informes, producción). Te sirve leer la Parte 2 para entender lo que hace el pañol y la Parte 3 para saber qué ve la cuadrilla.'],
        ['Pañol', 'Primeros pasos y la Parte 2 (catálogo, reservas, entradas, remito con foto, pedido de compras, herramientas).'],
        ['Cuadrilla / Operario', 'Primeros pasos y la Parte 3 (tu día en la obra desde el celular: Hoy, Modo obra, la cámara, los pasos de cada tarea).'],
        ['Solo mirar', 'Primeros pasos. Ves casi todo, pero no podés cambiar nada.'],
        ['Todos', 'Parte 4 — Guías: cómo se hace cada trabajo y la ficha técnica de cada material.'],
    ], anchos=[4, 13])
    A.p('Los nombres de botones y pantallas van en **negrita**, escritos igual que en la app. Los recuadros celestes son **Consejos** y los naranjas son cosas para tener en cuenta (**Atención**).')
    A.consejo('Hay cuatro manuales cortos para mandar por WhatsApp, uno por rol (Cuadrilla, Pañol, Oficina, Administración). Tienen los Primeros pasos y la parte de cada uno.')


def nuevo(A):
    A.h(1, 'Qué hay de nuevo (desde el 07/10/2026)', salto=True)
    A.p('Si ya usabas la app, esto es lo más importante que cambió desde el manual anterior. El detalle está en cada parte.')
    A.tabla(['Dónde', 'Qué hay de nuevo'], [
        ['Todo', 'Diseño nuevo «Turquesa del logo», letra nueva, **barra de abajo** en el celu, pantalla **Perfil** (huella, recordatorios, avisos, movimiento entre pantallas). El botón **atrás** del celu vuelve atrás. La pantalla nueva entra de costado, como en una app de banco.'],
        ['Asistente EMA', 'Una inteligencia artificial dentro de la app: le preguntás por escrito o hablando, lee lo que hay en la app y prepara cambios que se hacen recién cuando tocás **Sí**. Cada rol ve lo suyo y tiene un tope de preguntas por día.'],
        ['Inicio', 'Oficina y Administración: Inicio «Ejecutivo» con órdenes de hoy, gente en obra, lo que hay que atender, el **Supervisor** y la orden sugerida para mañana. Pañol: su propio Inicio. Cuadrilla: Inicio **Hoy**.'],
        ['Órdenes', '**Llenar orden** por pasos, tablero por pestañas (Hoy, Para revisar y cerrar, Próximas…), **Seguimiento**, una sola orden por obra y día, cierre con **Aprobar** por tarea, puntos por tarea, «lo que falta a otro día».'],
        ['Orden sugerida', 'La app arma las órdenes de mañana y de la semana con lo que falta en cada obra y la gente libre. Nada sale sin **Emitir**. Lo no terminado pasa solo a mañana a las 18:00 (con **Deshacer**).'],
        ['Cierre por voz', 'La oficina dicta cómo terminó el día y la app arma el cierre de cada orden con lo que mandó la cuadrilla.'],
        ['Mapa', 'Modo **Control** («Mapa de guerra»): cuadrillas de hoy, alertas y ficha rápida de cada obra. Personal en vivo.'],
        ['Obras y certificación', 'Material contra avance (🟢🟡🔴), fotos sin obra, **Certificación del mes** automática (solo nuestra zona: Zona A Este), **Informe de la semana**, **Tablero del dueño**.'],
        ['Pañol', '**Remito con foto** (la IA lee el remito y la app propone los códigos), reconoce un remito ya cargado, **Pedido de compras** automático, lector de código de barras y QR, etiquetas QR de herramientas, ficha del material con foto, 3D y plano.'],
        ['Cuadrilla', 'Todo nuevo: **Modo obra** con un solo botón (Llegué → Foto → Terminé), seguridad con foto, antes de salir, cómo llegar, falta material, ayuda, fin del día, tus puntos. La cámara elige la obra por el GPS. El **paso a paso** de cada tarea en el celu, con voz.'],
        ['Guías', 'Guías nuevas: paso a paso con dibujos, materiales por familia, tipos constructivos con 3D y plano, láminas.'],
    ], anchos=[3.6, 13.4])
    A.consejo('Para estar al día, tocá **Actualizar** cuando aparezca el cartel «Hay una versión nueva». Las funciones de voz, huella y recordatorios necesitan la app de Android 1.4.')


# ------------------------------------------------------------------ primeros pasos
def primeros(A, modo):
    A.h(1, 'Primeros pasos (para todos)', salto=True)

    A.h(2, 'Entrar a la app')
    A.p('La app se abre en el celular (la app de Android «EMA Alumbrado» o Chrome) y en la compu (Chrome, instalada como app). Cada persona entra con **su usuario y su contraseña**.')
    A.pasos(['Escribí tu usuario corto (por ejemplo «juan») y tu contraseña.', 'Tocá **Entrar**.', 'Si dejás tildado **Recordarme en este aparato**, la próxima vez entra sola.'])
    A.cel(('pp_entrar', 'La pantalla de entrada'), ('pp_olvide', '«¿Olvidaste tu contraseña o tu usuario?»'))
    A.h(3, 'Si te olvidaste la contraseña')
    A.pasos(['En la entrada tocá **¿Olvidaste tu contraseña o tu usuario?**', 'Escribí tu usuario o tu correo y tocá **Mandarme el correo**.', 'Te llega un correo con un enlace para elegir una contraseña nueva.'])
    A.consejo('Si tu usuario no tiene un correo real cargado, la app no puede mandar el correo y te dice que le pidas a la oficina que te cambie la contraseña.')

    A.h(2, 'La app de Android y las versiones nuevas')
    A.p('En los celulares de la empresa la app se instala con el archivo que pasa la oficina (no está en la tienda). La primera vez baja la app entera; después abre al instante, aunque no haya señal.')
    A.vinetas([
        'Cuando hay una versión nueva aparece el cartel **Hay una versión nueva · Actualizar**. Terminá lo que estés cargando y tocá **Actualizar**.',
        'Para ver qué versión tenés: **Perfil › La app** (dice «Al día» si no hay nada nuevo) o el menú › **Versión …** al pie.',
        'Solo hace falta instalar un archivo nuevo de la app de Android cuando la oficina lo avisa (cambia algo del celular, como la voz o la huella). Lo de todos los días se actualiza solo con **Actualizar**.',
    ])
    A.consejo('En la app de Android, dejá la batería en «Sin restricciones» (Ajustes del celu › Apps › EMA Alumbrado › Batería). Si no, Android corta la ubicación y los avisos con el celu bloqueado.')

    A.h(2, 'La barra de abajo y el menú')
    A.p('En el celu, abajo está la **barra** con lo que más usás. Cambia según quién sos:')
    A.tabla(['Rol', 'Barra de abajo'], [
        ['Oficina / Administración', 'Inicio · Obras · Órdenes · Pañol · Perfil'],
        ['Pañol', 'Inicio · Reservas · Catálogo · Herramientas · Perfil'],
        ['Cuadrilla / Operario', 'Hoy · Cámara · Mapa · Pañol · Perfil'],
    ], anchos=[5, 12])
    A.p('El número rojo sobre un botón avisa que hay algo pendiente (por ejemplo, órdenes para cerrar o reservas por preparar). En la oficina y el pañol la barra se puede guardar con la flechita **‹** de la derecha: queda una lengüeta en el borde izquierdo para volver a sacarla. A la cuadrilla la barra le queda siempre fija.')
    A.img('pp_barra', 'La barra de abajo de la oficina, con el número de órdenes para cerrar', ancho=11)
    A.p('Todo lo demás está en el **menú**: las tres rayitas arriba a la izquierda. Ahí aparecen solo las pantallas que tu usuario puede usar. Arriba dice con qué usuario entraste y su rol, y está **Cerrar sesión**. Al pie del menú está **Versión …**.')
    A.cel(('pp_menu', 'El menú (oficina)'), ('pp_menu_version', 'Al pie: «Versión …»'), ('pp_inicio_ofi_cel', 'Inicio de la oficina en el celu'))

    A.h(2, 'Qué ve cada uno')
    A.p('Lo decide Administración en **Usuarios y permisos**. Los roles son:')
    A.tabla(['Rol', 'Qué puede hacer'], [
        ['Administración', 'Todo, y además maneja los usuarios, los límites del asistente, la certificación del mes y el Tablero del dueño.'],
        ['Oficina', 'Carga y cambia todo: órdenes, obras, pañol, informes, gastos y producción.'],
        ['Pañol', 'Carga en el pañol (entradas, salidas, reservas, herramientas). Mira obras, avance, mapa y normas.'],
        ['Cuadrilla / Operario', 'Ve y marca sus tareas del día desde el celu, saca fotos, ve el catálogo del pañol, el mapa, las guías y los «Cálculos rápidos».'],
        ['Solo mirar', 'Ve casi todo, no cambia nada.'],
    ], anchos=[4, 13])
    A.p('Un usuario nuevo queda «a confirmar» y no ve nada hasta que Administración lo confirma y le pone el rol.')

    A.h(2, 'Perfil')
    A.p('Se abre desde **Perfil** en la barra de abajo (o desde el menú). Arriba están tu nombre, tu rol y tu usuario, y tres números: tus puntos de la quincena, las órdenes que seguís (la cuadrilla ve sus tareas de hoy) y los avisos sin leer.')
    A.cel(('pp_perfil', 'Perfil: tus datos y números'), ('pp_perfil_ajustes', 'Tus ajustes'), ('pp_perfil_app', 'La app y Cerrar sesión'))
    A.h(3, 'Tus ajustes')
    A.vinetas([
        '**Entrar con huella**: al abrir la app (y al volver después de 5 minutos) pide la huella, la cara o el PIN del celu. Necesita la app de Android 1.4.',
        '**El asistente lee en voz alta**: las respuestas del Asistente se escuchan solas.',
        '**Avisos al celular**: para que te lleguen las órdenes y los avisos aunque la app esté cerrada. Tocá el interruptor y aceptá el permiso del celu.',
        '**Movimiento entre pantallas**: Sí = la pantalla nueva entra de costado (como en una app de banco). No = cambia al instante. Si el celu es lento, la app pasa sola a un fundido corto y te lo dice acá.',
        '**Recordatorios**: un aviso diario a la hora que elijas para revisar lo del día. Necesita la app de Android 1.4.',
    ])
    A.h(3, 'La app')
    A.vinetas(['**Versión**: «Al día» o el botón para actualizar.', '**Este equipo**: modelo del celu, batería y si estás con wifi o datos.', '**Cambiar contraseña** (si tu usuario no tiene correo, pedile a la oficina que te la cambie).', '**Cerrar sesión**.'])

    A.h(2, 'El botón «atrás» del celu')
    A.p('El «atrás» del celu (o el del navegador en la compu) hace lo que esperás: cierra lo que está abierto encima (el menú, una hoja, una foto, el Asistente) o vuelve a la pantalla anterior. En el Inicio, la app se va al fondo sin cerrarse, así cuando volvés aparece al instante.')
    A.atencion('Si estás cargando una orden, un movimiento del pañol o un cierre y tocás «atrás», la app pregunta **¿Salir sin guardar?** para que no pierdas lo cargado.')

    A.h(2, 'Asistente EMA')
    A.p('Es una inteligencia artificial dentro de la app. Se abre con el botón de la estrellita (la lengüeta del borde derecho, que se puede arrastrar para arriba o abajo) o con **Asistente** en el Inicio. Le escribís o le hablás y contesta con lo que hay en la app.')
    A.cel(('pp_asistente', 'El Asistente al abrirlo'), ('pp_asistente_resp', 'Una respuesta, con «Escuchar»'), ('pp_asistente_cfg', 'Opciones (el engranaje)'))
    A.h(3, 'Qué puede hacer cada uno')
    A.tabla(['Rol', 'Qué le podés preguntar o pedir'], [
        ['Oficina / Administración', 'Todo lo de la app: obras, órdenes, cálculos, pañol, puntos, gastos. Además **prepara cambios** (una orden, un cierre, un cálculo nuevo, un movimiento del pañol, datos de una obra, mover fotos a la obra correcta) que se hacen recién cuando tocás **Sí**.'],
        ['Pañol', 'Stock, precios de materiales, movimientos, reservas, historial de cálculos. Cargar un remito con foto.'],
        ['Cuadrilla / Operario', 'Sus obras, sus órdenes, sus puntos, el stock y **cómo se hace** cada trabajo (lee las guías). No ve sueldos ni plata.'],
        ['Solo mirar', 'Datos generales de las obras y cómo se hace.'],
    ], anchos=[4, 13])
    A.p('Lo que el Asistente no puede ver con tu usuario lo dice: «Eso no lo puedo ver con tu usuario, preguntale a la oficina».')
    A.h(3, 'Hablarle')
    A.vinetas([
        '🎤 **Dictar**: tocá el micrófono y hablá; el texto aparece en la caja mientras hablás. Después tocá la flecha para mandar.',
        '🔊 **Escuchar**: cada respuesta tiene el botón **Escuchar**.',
        '🗣 **Modo charla** (el botón de las ondas): le hablás, te contesta en voz alta y vuelve a escuchar, sin tocar nada. Para cortar: **Terminar**, o decí «listo» o «chau». A una tarjeta de cambios le podés contestar «sí, hacelo» o «no».',
    ])
    A.h(3, 'Tarjetas de cambios')
    A.p('Cuando el Asistente propone cambiar algo, muestra una tarjeta con **antes → después** y los botones **Sí** / **No**. No cambia nada hasta que tocás **Sí**, y lo hace por los mismos caminos que si lo hicieras a mano (queda registrado quién lo hizo).')
    A.h(3, 'Te quedan N preguntas hoy')
    A.p('Cada persona tiene un tope de preguntas por día (la cuadrilla 10, el pañol 20 más 40 remitos, la oficina 30; Administración sin tope). Abajo del chat dice **Te quedan N preguntas hoy**. Las vueltas que da el Asistente para buscar datos no cuentan: cuenta cada pregunta tuya. Además hay un freno del mes: si el gasto llega al 80 % del tope del mes, se pausa para el pañol y las cuadrillas y se avisa a Administración; al 95 % se corta para todos menos Administración. Se reinicia el día 1.')
    if modo in ('todo', 'admin'):
        A.consejo('Administración cambia los topes en el Asistente › engranaje › **Límites** (preguntas por rol, prendido/apagado por rol y el freno del mes). Ahí también ve **Gastado este mes** por parte y por persona. Ver «Límites del asistente» en la Parte 1.')
    A.h(3, 'En la compu')
    A.p('En la compu el Asistente se abre como un panel a la derecha, del alto de la pantalla, y la app se corre para que la sigas viendo. El borde izquierdo del panel se arrastra para hacerlo más ancho.')
    A.img('of_asistente_pc', 'El Asistente en la compu, al lado del Inicio')

    A.h(2, 'Sin señal')
    A.p('La app anda sin internet. Arriba aparece la franja **Sin conexión**: lo que cargues se guarda en el celu y se sube solo cuando vuelve la señal. Las fotos quedan en el celu esperando, aunque cierres la app o se apague el celu.')
    A.cel(('pp_sin_senal', 'La franja «Sin conexión»'), ('cu_22_sin_senal', 'Cuadrilla: lo que queda esperando señal'))

    A.h(2, 'Si algo no aparece o no anda')
    A.pasos(['Abrí el menú y tocá **Versión …** al pie.', 'Sale un cartel con la versión, tu usuario y rol, si estás vinculado a la nómina, qué funciones están activas y si hubo errores.', 'Sacale una captura y mandala: con eso se sabe qué pasa.'])
    A.cel(('pp_version', 'El cartel de «Versión»'))
    A.atencion('Si a alguien le sale «sin permiso» o no ve nada, casi siempre es porque su usuario está «a confirmar» o sin rol: lo arregla Administración en **Usuarios y permisos**.')


# ------------------------------------------------------------------ parte 1
def parte1(A, modo):
    adm = modo in ('todo', 'admin')
    A.h(1, 'Parte 1 — Oficina y Administración', salto=True)
    A.p('Esta parte es para la oficina. Las capturas son de la compu; en el celu es lo mismo en una sola columna.')

    A.h(2, 'Inicio «Ejecutivo»')
    A.p('Es la primera pantalla de la oficina. Arriba, la portada azul con el saludo, la fecha y los números del día: **órdenes de hoy**, **personas en obra** y **para cerrar**. El anillo de la derecha es el avance de nuestra zona del contrato (**Zona A · Este**: 127 plazas, 18.407 módulos). Debajo, el buscador de obras y el botón **Asistente**.')
    A.img('of_inicio', 'Inicio Ejecutivo en la compu (en el celu va todo en una columna)', alto_max=21)
    A.p('Las tarjetas de abajo:')
    A.vinetas([
        '**Mañana: N órdenes sugeridas**: la orden sugerida para el día siguiente (ver «Orden sugerida para mañana»). Botones **Ver · cambios** y **Ajustes**.',
        '**Para atender**: órdenes para cerrar, gente sin tarea hoy o mañana, respaldo sin bajar, stock negativo. Tocá cada fila para ir a resolverlo.',
        '**Supervisor**: lo que la app encontró para revisar (ver «Supervisor»).',
        '**En obra ahora**: quién está en cada obra hoy y desde qué hora.',
        '**Órdenes de hoy**: cada orden con su estado y cuántas tareas van.',
        '**Accesos**: Tablero del dueño (solo Administración), Mapa de guerra, Informe de la semana, Cálculo, Obras, Órdenes, Pañol, Mapa, Cámara, Plan, Informes y Lo que aprende la app.',
        '**Obras**: todas las obras con su avance (Todas · En ejecución · Finalizadas).',
    ])

    A.h(2, 'Registrar obra')
    A.p('Acá se dan de alta las plazas, barrios y otras obras. Si la plaza está en el pliego, buscala en el recuadro celeste y se completan solos el nombre, el ID y la ubicación.')
    A.pasos(['Menú › **Registrar obra**.', 'Elegí qué es: **Plaza**, **Barrio** u **Otra**.', 'Buscala en el pliego (por nombre, barrio o ID) o escribí el nombre a mano (no puede repetirse).', 'Completá ID, barrio, la **fecha en que EPEC nos entregó la carpeta** y la dirección.', 'Ubicala: **🔎 Ubicar** busca la dirección; si no, mové el mapa hasta que el pin rojo quede en la obra y tocá **Poner la obra acá**, o **📍 Estoy acá** si estás parado en la obra.', 'Tocá **Registrar plaza**.'])
    A.img('of_registrar', 'Registrar una obra nueva con su ubicación')
    A.consejo('Sin la ubicación de la obra, la cámara de la cuadrilla no puede elegir la obra por el GPS y el Supervisor la muestra en «Obras sin ubicación cargada».')

    A.h(2, 'Obras (legajos)')
    A.p('Menú › **Obras (legajos)** o **Obras** en la barra de abajo. Pestañas **En curso** y **Terminadas**, y filtros Plazas / Barrios / Otras. Tocá una obra y se abre su **legajo**: todo lo que pasó en esa obra en un solo lugar.')
    A.img('of_obras', 'La lista de obras')
    A.p('El legajo tiene arriba los botones **Subir fotos**, **Planos**, **Reservar material**, **Avance**, **Mapa** e **Imprimir legajo**, y los números (avance, órdenes, fotos, materiales, gastos). Debajo, las secciones se abren y cierran tocando el título:')
    A.vinetas([
        '**Fotos**: agrupadas por columna, caja, tablero, zanja, antes/después. Se suben desde la oficina eligiendo de qué es cada foto.',
        '**Planos**: PDF o foto del plano; se ve en grande y se puede escribir y dibujar encima.',
        '**Columnas de la obra**: el nombre de cada columna (Col 1, Col 2…), que usan las órdenes y las fotos.',
        '**Órdenes de trabajo**, **Material entregado**, **Gastos** e **Historial**.',
        '**Material: calculado vs. entregado** y **Material contra avance** (ver abajo).',
    ])
    A.img('of_legajo', 'El legajo de una obra')
    A.h(3, 'Subir fotos y planos desde la oficina')
    A.pasos(['En el legajo tocá **Subir fotos** (o abrí la sección **Fotos**).', 'Elegí **¿De qué es?** (columna, caja, tablero, conexión, luminaria, puesta a tierra, zanja, antes, después u otra) y, si corresponde, el **N°** de la columna.', 'Tocá **Elegir o sacar fotos**: podés elegir varias a la vez (por ejemplo, las que mandaron por WhatsApp). **Bajar todas (ZIP)** baja las fotos de la obra con su ubicación.'])
    A.pasos(['En la sección **Planos**, escribí el nombre del plano (por ejemplo «Planta general»).', 'Tocá **Subir PDF o foto** (un PDF de varias hojas se guarda entero).', 'Tocá el plano para verlo en grande: se mueve con el dedo, se agranda con dos dedos o la rueda, y abajo están las herramientas para escribir y dibujar encima (lápiz, resaltador, texto, goma, colores, deshacer). Las notas las ven todos.'])
    A.img('ex_planos', 'Las secciones Fotos y Planos del legajo')
    A.h(3, 'Material: calculado vs. entregado')
    A.p('Compara el cómputo de la Calculadora con lo que salió del pañol para esa obra: por material, cuánto se calculó, cuánto se entregó y cuánto falta entregar. Las tarjetas de arriba filtran (falta entregar, coinciden, se entregó de más, sin calcular). Con **Planilla (Excel)** e **Imprimir / PDF**.')
    A.img('va_balance', 'Calculado contra entregado')
    A.h(3, 'Material contra avance (🟢🟡🔴)')
    A.p('Mira si lo que salió del pañol se justifica con lo que se avanzó: por cada material, lo entregado contra lo que corresponde al avance del rubro. 🟢 bien, 🟡 un poco de más, 🔴 salió mucho más de lo que justifica el avance (o salió y no hay avance). El margen es del 10 % (a confirmar). En cada material: **Ver vales** y **Pedir devolución** (avisa a la cuadrilla y al pañol).')
    A.img('va_matavance', 'Material contra avance en el legajo')
    A.h(3, 'Fotos sin obra')
    A.p('En **Obras**, el botón **📷 Fotos sin obra** junta las fotos que se sacaron lejos de toda obra cargada. Desde ahí (o pidiéndoselo al Asistente) se pasan a la obra que corresponde.')
    A.img('of_fotos_sin_obra', 'Fotos sin obra (acá, sin ninguna) y debajo la sección Fotos del legajo, con «Elegir o sacar fotos»')
    A.h(3, 'Mayúsculas prolijas')
    A.p('Los nombres de obra se ven siempre EN MAYÚSCULAS, como en el pliego, y barrios, direcciones y personas en tipo título («Bº Ciudad de Mis Sueños», «Juan Pérez»). Es solo cómo se ve. ' + ('Para dejar la base prolija, Administración tiene **🔤 Ordenar mayúsculas en la base** en Obras (pregunta antes con **Sí**).' if adm else ''))

    A.h(2, 'Cálculo de materiales')
    A.p('Menú › **Cálculo de materiales**. Arriba elegís **Plaza** o **Barrio**. Pestañas: **Calculadora**, **Historial** y **Material por obra**.')
    A.pasos(['Buscá la plaza (se completan nombre, ID y barrio).', 'Completá las secciones: columnas nuevas, columnas existentes a reacondicionar, vínculos y luminarias, cableado por circuitos, tableros, obra civil.', 'Tocá **Calcular materiales**: sale el listado completo con códigos del pañol y la vista previa del itemizado.', 'Guardalo en el **Historial** (se puede volver a abrir y editar). Si la obra ya tenía material de un cálculo anterior, aparece **🔄 Pasar este cálculo a la obra**.'])
    A.img('of_calc', 'Cómputo de la plaza')
    A.p('Las otras pestañas de arriba son calculadoras rápidas: **Hormigón**, **Zanja**, **Cables** (caída de tensión con el método de la Municipalidad), **Consumo** y **Abrazaderas**. La cuadrilla también las ve, como «Cálculos rápidos».')
    A.img('of_calc_rapidos', 'Caída de tensión (método de la Municipalidad)')

    A.h(2, 'Órdenes de trabajo')
    A.p('Menú › **Órdenes de trabajo** u **Órdenes** en la barra. Pestañas: **Tablero**, **Seguimiento**, **Llenar orden** e **Historial**. El número rojo de la barra son las órdenes para revisar y cerrar.')
    A.h(3, 'El tablero')
    A.p('Las órdenes en pestañas: **Hoy** (en obra), **Para revisar y cerrar** (la cuadrilla ya mandó), **Próximas** (con calendario del mes), **Sin cerrar** (de días anteriores), **Cerradas** y **Anuladas**. Cada tarjeta muestra la obra, la gente, cuántas tareas van marcadas y los botones **Revisar y cerrar**, **Sigue en obra**, **Editar**, ver, **Avance** (lo que marcó la cuadrilla en vivo, con las fotos), **Reservar material** y **Mover a…**.')
    A.img('of_ot_hoy', 'Tablero › Hoy')
    A.img('of_ot_prox', 'Tablero › Próximas, con el calendario')
    A.h(3, 'Llenar orden (por pasos)')
    A.p('Tocá **+ Nueva orden** o la pestaña **Llenar orden**. La orden se arma en 4 pasos (**1 Obra y fecha · 2 Gente · 3 Tareas · 4 Material y emitir**; **Ver todo junto** muestra todo en una hoja), con el **Resumen de la orden** a la derecha (en el celu, en la barra de abajo):')
    A.pasos([
        '**Obra y fecha**: elegí la fecha y la obra (las recientes están a un toque), el horario de entrada y la salida prevista. Si la obra tiene cosas pendientes, aparece el cartel.',
        '**Gente**: tocá las personas (la gente de siempre está a un toque) o una cuadrilla guardada. El vehículo sale solo por quién lo tiene a cargo; elegís en qué vehículo va cada uno y el **responsable de oficina** que la sigue (le llega el aviso y la ve en «Órdenes que seguís»).',
        '**Tareas**: tildá las tareas del catálogo. Cada una dice «Quedan N de T» (lo calculado menos lo hecho y lo ya asignado). Elegí **¿Quién?**: toda la cuadrilla, una persona, **✂ repartir** o **👥 Elegir quiénes** (la hacen juntos). Con **↕ Orden de las tareas** cambiás el orden.',
        '**Material y emitir**: material, notas para la cuadrilla y el resumen con los puntos de cada persona si terminan todo. Tocá **Emitir orden de trabajo**.',
    ])
    A.img('or_llenar_1', 'Paso 1: obra y fecha, con el resumen a la derecha')
    A.img('or_llenar_2', 'Paso 2: gente, vehículo y responsable de oficina')
    A.img('or_llenar_3', 'Paso 3: tareas, con «Quedan N de T» y ¿Quién?')
    A.img('or_llenar_4', 'Paso 4: material, notas y emitir')
    A.p('Al emitir, a cada persona le llega el aviso al celu («Tocá para ver la orden y los pasos») y la orden guarda una copia del paso a paso de cada tarea.')
    A.atencion(['Debajo de la gente aparece **a quién no le va a llegar la orden al celular y por qué**. Para que a alguien le llegue hacen falta tres cosas: 1) usuario activo y confirmado; 2) en Usuarios, vinculado a su nombre de la nómina («Persona»); 3) su nombre en la orden.', 'Si ya hay una orden abierta para esa obra y ese día, la app pregunta **Sumar a la OT-xxx** / **Hacer otra**: una sola orden por obra y por día.', 'Si en la orden queda una sola persona en obra, pregunta **Emitir igual**: la regla es mínimo 2 en obra (barquilla, grúa, hidro y tablero, siempre 2).'])
    A.h(3, 'Seguimiento')
    A.p('Cada tarea dada, con lo hecho y lo que falta, filtrable por persona, obra y fechas, con el resumen por persona y por obra. En cada fila: **📅 Darla hoy**, **👤 Darla a otro** y **✏ Editar** (cuánto, quién, sacar la tarea). También está **Tareas de hoy** y la búsqueda **Por persona / obra**.')
    A.img('or_seguimiento', 'Seguimiento de tareas')
    A.h(3, 'Imprimir, PDF y compartir')
    A.p('Todo lo que se imprime (órdenes, vales, reservas, informes) se abre primero en una **hoja A4** para revisar, con **Imprimir**, **Compartir PDF** y **Bajar PDF**. Arriba a la derecha va el **QR** del comprobante: escaneado abre ese papel en la app. **Compartir PDF** abre el menú: **WhatsApp**, **Drive**, **Mail**, **Copiar**, **Guardar** u **Otra app**.')
    A.img('ex_hoja_orden', 'La orden de trabajo en hoja A4, con el QR')
    A.img('ex_compartir', 'Compartir el PDF')
    A.h(3, 'Historial')
    A.p('Todas las órdenes emitidas, con filtros y búsqueda. Desde ahí se abre cualquier orden, se ve, se imprime o se corrigen los puntos de una cerrada.')
    A.img('of_ot_historial', 'Historial de órdenes')

    A.h(2, 'Revisar y cerrar una orden')
    A.p('Cuando la cuadrilla manda lo del día, la orden pasa a **Para revisar y cerrar**. Tocá **Revisar y cerrar**: se abre el cierre con lo que marcó la cuadrilla ya cargado (cantidades, horas de cada tarea, novedades y si completó la seguridad).')
    A.img('or_tablero_revisar', 'Para revisar y cerrar, con «Cerrar el día por voz»')
    A.img('or_cierre', 'El cierre de una orden, con lo que mandó la cuadrilla')
    A.img('or_cierre_2', 'Los botones de cada tarea: puntos, lo que falta a otro día, era otra tarea, aprobar')
    A.p('Por cada tarea:')
    A.vinetas([
        '**✅ Aprobar esta tarea**: guarda esa tarea al toque (suma puntos y avance) y la orden sigue «En curso» hasta la última.',
        '**👥 Puntos de esta tarea**: repartir los puntos de esa tarea entre la gente, a mano.',
        '**📅 Lo que falta, a otro día**: lo no hecho pasa a la orden de ese día de la obra (o se crea una).',
        '**🔁 Era otra tarea**: si la cuadrilla marcó una tarea equivocada, se cambia y el cierre se vuelve a armar con lo cargado.',
    ])
    A.img('ex_cierre_pts', '«Puntos de esta tarea»: quiénes la hicieron y cuántos puntos le tocan a cada uno')
    A.p('Para la gente: horas de cada uno (0 horas = 0 puntos), **✕ No fue** (lo saca de la orden) y **＋ Agregar a alguien que también fue**. Si tocás los puntos a mano, la app avisa «Te quedan N puntos para repartir». Abajo: **Guardar lo hecho** o **✅ Aprobar todo y cerrar**.')
    A.consejo('Lo que no se hizo no se pierde: queda pendiente en la obra y vuelve a aparecer en «Quedan» la próxima vez. Si la cuadrilla mandó algo por error, **↩ Sigue en obra** se la devuelve.')

    A.h(2, 'Cierre del día por voz')
    A.p('Para cerrar varias órdenes de una, dictando. En **Órdenes › Para revisar y cerrar** (o **Hoy**) tocá **✨ Cerrar el día por voz**. Se abre el Asistente con la franja «Cierre del día · N órdenes abiertas»: ya sabe lo que mandó cada cuadrilla, así que decís solo lo que cambia.')
    A.pasos(['Tocá el micrófono y decí, por ejemplo: «Los Álamos se hicieron 4 izajes, Juan 8 horas, Pedro 6, faltó un vínculo, lo pasamos al jueves. Las Acacias 35 metros de zanja».', 'El Asistente arma la tarjeta **¿Cierro así?** con cada orden: antes → después (cantidades, horas, lo que pasa a otro día).', 'Revisala y tocá **Sí, cerrar**. Cada orden se cierra igual que a mano.'])
    A.img('or_voz', 'El Asistente en «modo cierre», al lado del tablero')
    A.img('or_voz_tarjeta', 'La tarjeta del cierre por voz, para confirmar')

    A.h(2, 'Orden sugerida para mañana')
    A.img('or_sug_inicio', 'La tarjeta del Inicio: «Mañana: 2 órdenes sugeridas», con los avisos', ancho=11)
    A.p('**La arma la app, sin inteligencia artificial**, con lo que queda de cada obra y la gente libre. Nada sale sin **Emitir**. Se abre desde la tarjeta **Mañana: N órdenes sugeridas** del Inicio, desde **Revisar y emitir** arriba del tablero de Órdenes o desde el Asistente.')
    A.img('or_sug_obra', 'Órdenes para mañana › Por obra')
    A.img('or_sug_obra_2', 'Cada obra con su gente, tareas, puntos y avisos')
    A.p('Qué tiene en cuenta: lo que falta en cada obra (según el cálculo), lo que quedó de ayer, los días de fraguado de las bases, el orden de obra (pozo → hormigón, zanja → cable → tapado, izaje → vínculo → luminaria), las columnas siguientes, el rendimiento de cada tarea, que siga la misma cuadrilla en la obra, el equipo civil, las ausencias, los vehículos por tipo y lugares, y si falta material de la reserva.')
    A.h(3, 'Cómo se usa')
    A.pasos(['Arriba elegís el **Día**. Las pestañas: **Por obra** (una tarjeta por obra con el porqué), **Por persona** (quién va a dónde, libres y ausentes) y **Semana** (los días encadenados, con **Emitir el día**).', 'Para cambiar algo, en la tarjeta tocá **Cambiar**: sacar o sumar persona, cantidad, sacar o sumar tarea, vehículo, incluir o excluir la obra.', 'Si hay **personas sin tarea**, arriba aparecen con sugerencias en orden: sumarla donde rinde más (por ejemplo, el izaje), preparación de otra obra, galpón, lo que quedó (**Sumar**). Todo el personal de alumbrado tiene que tener una tarea cada día hábil, salvo ausencia o enfermedad: si a las 17:00 queda alguien sin tarea, la app avisa.', 'Tocá **Emitir las N**: confirma y cada orden se emite como si la hubieras llenado a mano (con su aviso).'])
    A.img('or_sug_persona', 'Por persona: quién va a dónde, libres y ausentes')
    A.img('or_sug_semana', 'Semana: los días encadenados')
    A.img('or_sug_cambiar', 'Cambiar una obra de la sugerida')
    A.img('va_sintarea', 'Persona sin tarea mañana, con las sugerencias para sumarla')
    A.h(3, 'Ajustes')
    A.p('El botón **Ajustes** de la hoja: los rendimientos según Ángel (zanja a mano por día, bases por día, tablero y acometida, izaje según el modo: automático, toda la cuadrilla, con el equipo civil antes, con caño sin vínculo, solo con guía), la jornada y el sábado, días de fraguado, la hora del aviso, el recordatorio, las reglas y si lo no terminado pasa solo a mañana. Se guarda para todo el equipo con **Guardar**.')
    A.img('or_sug_ajustes', 'Ajustes de la orden sugerida')
    A.img('or_sug_epec', 'Plan para la inspección: elegís el día')
    A.vinetas([
        '**Aviso de las 16:00**: desde esa hora la sugerida de mañana aparece para revisar y emitir.',
        '**Recordatorio de las 7:00**: a cada persona de la orden le llega un aviso a las 7 del día de la orden (necesita el Worker de avisos nuevo; si no, va como recordatorio del celu).',
        '**Plan para la inspección** (botón de la hoja): una hoja A4 con lo que se va a hacer, sin puntos ni plata, para mandar a la Inspección.',
        '**Lo que aprende la app** y **Revisar con el asistente** / **Pedile cambios al asistente**: el Asistente lee la sugerida y propone cambios con tarjeta.',
    ])
    A.consejo('Para que la sugerida salga bien hay que tener cargado, en **Producción › Personal del equipo**: el tipo y los lugares de cada vehículo, quién es del equipo civil, las ausencias y los equipos habituales.')

    A.h(2, 'Lo no terminado pasa solo a mañana')
    A.p('A las 18:00 (o al cerrar la orden de hoy), lo que no se hizo, quedó a medias o sin marcar pasa a la orden de mañana de esa obra; si no hay, queda en el borrador de la sugerida. Sale un aviso con lo que pasó y el botón **Deshacer**. En los Ajustes de la sugerida se elige si lo hace solo, si pregunta o si no lo hace.')

    A.h(2, 'Personal del equipo (para las órdenes)')
    A.p('Menú › **Producción del personal** › **Personal del equipo**. Además de la nómina y los vehículos:')
    A.vinetas([
        '**📋 Para la orden sugerida**: ausencias (franco, vacaciones, licencia, enfermo) con desde y hasta, quién es del **equipo civil**, y el **tipo** (grúa, hidro, barquilla, transporte, auto) y los **lugares** de cada vehículo.',
        '**👥 Equipos habituales**: quiénes trabajan juntos, con su vehículo; la sugerida los respeta.',
        '**👷 La cuadrilla en obra**: teléfonos de la oficina para «Llamar a la oficina», qué fotos de la seguridad son obligatorias y qué herramientas lleva cada tarea.',
    ])
    A.img('or_personal_sug', 'Para la orden sugerida: ausencias, equipo civil y vehículos')
    A.img('or_equipos_hab', 'Equipos habituales')
    A.img('or_cuadrilla_cfg', 'La cuadrilla en obra: teléfonos, fotos de la seguridad y herramientas por tarea')
    A.img('of_prod_personal', 'La nómina: legajo, nombre, sector, rol, vehículo a cargo')
    A.consejo('Si no hay teléfonos cargados, la cuadrilla ve «Pedile a la oficina que cargue su teléfono» en vez de un número. Cargalos en **La cuadrilla en obra**.')

    A.h(2, 'Planificación semanal')
    A.p('Menú › **Planificación semanal**. La semana (o **El mes completo**) con lo que va cada día. Desde un día se puede **Hacer la orden de trabajo**. Se elige qué días imprimir.')
    A.img('of_plan', 'Planificación de la semana')

    A.h(2, 'Mapa y Mapa de guerra')
    A.p('Menú › **Mapa de plazas** o **Mapa** en la barra. Los pines tienen el color del avance: gris sin empezar, rojo menos del 30 %, amarillo 30–59 %, azul 60–99 %, verde terminada. Tocá un pin para ver la ficha de la obra. **📍 Dónde estoy** centra el mapa en donde estás, **＋ Punto** agrega tableros, problemas o acopios, y abajo a la izquierda está **Satélite**.')
    A.img('of_mapa', 'El mapa de obras')
    A.h(3, '🎯 Control («Mapa de guerra»)')
    A.p('Arriba del mapa, el botón **Control** lo pasa a modo control (solo quien edita Órdenes). Se ve todo lo de hoy de un vistazo:')
    A.vinetas([
        'Arriba, los números: órdenes de hoy, gente en obra, vehículos, alertas y el avance de la Zona A.',
        'Cada cuadrilla de hoy es un pin con sus iniciales y el vehículo, con una línea punteada a la obra de su orden (en vivo si su celu mandó la ubicación hace menos de 30 minutos).',
        'El panel (a la derecha en la compu, abajo en el celu) con **Hoy**, **Alertas**, **Cuadrillas** y **Avance**. Las alertas van ordenadas en urgentes / revisar hoy / para saber: falta material para mañana, fotos dudosas, órdenes sin cerrar, gente sin tarea, fraguado, obras trabadas, obras sin ubicación. Cada una tiene su botón para resolverla (Pedido de compras, Ver reservas, Mover / Está bien, Cerrar, Darles tarea…).',
        'Tocá una obra: la ficha rápida con el avance, quién está, qué falta y los botones **Legajo**, **Orden** y **Llamar**.',
    ])
    A.img('of_mapa_guerra', 'Mapa en modo Control, con el panel de alertas')
    A.img('of_mapa_ficha', 'La ficha rápida de una obra')
    A.h(3, 'Personal en vivo')
    A.p('Mientras la cuadrilla trabaja (en el horario que fija Administración, de entrada de 07:00 a 15:00 de lunes a viernes), su celu manda la ubicación. En el mapa, cada persona es un punto verde (al día) o gris («sin actualizar desde HH:MM», con el porqué). El panel **Personal en vivo** dice cuántos se ven. Las personas también se buscan en el buscador del mapa.')
    A.img('ex_vivo', 'El mapa con «Personal en vivo» abajo a la izquierda')
    A.consejo('Si a alguien se le corta la ubicación con el celu bloqueado, revisá que tenga la batería de la app en «Sin restricciones».')

    A.h(2, 'Avance de obra e Itemizado')
    A.p('Menú › **Avance de obra**. La obra y su avance ítem por ítem, agrupado por rubro (columnas, tableros, zanjeo, cable, PAT, otros) con colores como los pines del mapa. Se pueden agregar o sacar ítems. Las etapas se tildan solas.')
    A.img('of_avance', 'Avance de obra')
    A.p('**Itemizado 2026**: los ítems del Anexo I con su K, contratado, hecho y lo que falta, por obra (Todas / Plazas / Barrios / Otras). Arriba, **Nuestra zona**: la zona del contrato (de entrada A · Este) con sus módulos; el total de la licitación queda aparte.' + (' La zona la cambia solo Administración.' if adm else ''))
    A.img('va_itemizado_zona', 'Itemizado con «Nuestra zona»')
    A.p('El botón **🔎 Diferencias con lo hecho** de cada plaza compara lo cerrado en las órdenes con el itemizado y pregunta **Sí / No** para cada diferencia.')

    A.h(2, 'Certificación del mes')
    A.p('Menú › **Certificación del mes** (o la tarjeta en **Informes**). La app arma sola el borrador del certificado del mes con el avance de las órdenes cerradas en ese mes, **solo de nuestra zona**:')
    A.vinetas([
        'Por obra: cada ítem con su K, contratado, anterior, este mes, acumulado, módulos y pesos (sin IVA y con IVA).',
        'Las provisiones (83 a 89) van aparte; las plazas ya ejecutadas toman lo certificado como anterior.',
        '⚠ **Para revisar antes de certificar**: el avance cargado a mano sin fecha no se reparte en ningún mes; la app lo marca.',
        '**Armar PDF del certificado** (con QR) y **Planilla (Excel)**.',
    ])
    A.img('va_cert', 'Borrador de la certificación del mes')
    if adm:
        A.p('**Cerrar el certificado del mes** (solo Administración, con **Sí**): el mes queda fijo; lo que se cierre tarde va al mes siguiente.')

    A.h(2, 'Informes')
    A.p('Menú › **Informes**. El **Informe mensual con fotos**, la **Certificación mensual** y el **Centro de informes**: elegís qué informe (avance, Gantt, informe para la inspección, material a usar, conforme a obra…), de qué obras y en qué formato (PDF, Word, Excel), y tocás **Generar informe**.')
    A.img('of_informe', 'El centro de informes')
    A.h(3, '📰 Informe de la semana')
    A.p('Lo arma la app sola, sin inteligencia artificial, de lunes a sábado: el sábado desde las 14:00 el primer aparato de la oficina que esté abierto lo guarda y deja un aviso a Administración para el lunes 07:30. Se abre desde el menú (**Informe de la semana**), el Inicio o el Tablero del dueño.')
    A.vinetas(['Módulos de la semana contra la anterior y por día; avance de la Zona A y obras terminadas.', 'Por obra: lo hecho, lo que falta y el Gantt.', 'Órdenes emitidas, cerradas, «no se hizo» y las que pasaron al día siguiente.', 'Gente: horas, puntos de la semana y de la quincena, días sin tarea, ausencias.', 'Pañol: lo que salió, material contra avance y compras sugeridas (sin precios). Fotos. Gasto del asistente del mes.', 'Lo que viene: la orden sugerida de la semana.', 'Semanas anteriores, **Compartir** y **Bajar PDF** (2 hojas A4 con QR).'])
    A.img('of_informe_semanal', 'Informe de la semana')
    A.img('of_informe_semanal_2', 'Más abajo: gente, pañol, fotos y lo que viene')
    A.consejo('El «Resumen del asistente» del informe es opcional y lo prende o apaga Administración (engranaje del informe). El gasto del asistente por semana todavía no está: hace falta un Worker nuevo.')

    A.h(2, 'Gastos de obra')
    A.p('Menú › **Gastos de obra**: **Por obra** (cargar gastos de cada obra), **Ganancia** (certificado contra gastado, sin IVA), **Combustible** (por vehículo, con litros y km, repartido solo entre las obras), **Precios** y **Generales y por mes**.')
    A.img('of_gastos_ganancia', 'Ganancia por obra')
    A.img('of_gastos', 'Gastos por obra')

    A.h(2, 'Producción y puntos')
    A.p('Menú › **Producción del personal**. Pestañas: **Producción por persona**, **Por quincena**, **Total**, **Cierre del día**, **Personal del equipo** y **Cuánto vale cada tarea**.')
    A.img('of_prod', 'Producción por persona')
    A.h(3, 'Cómo se calculan los puntos')
    A.vinetas([
        '1 punto = 1 hora-hombre efectiva. Cada tarea vale sus horas por unidad × la dificultad (de 1,00 a 1,80).',
        'Tarea asignada a una persona → esa persona. Repartida → por lo que hizo cada uno. De un grupo (👥 Elegir quiénes) → solo entre ellos, por rol × horas. Por equipos → entre equipos según lo hecho y adentro por rol × horas.',
        'El resto se reparte por rol × horas: Oficial 1 · Capataz 1 · Medio oficial 0,8 · Ayudante 0,6 · Chofer 0,4 · Sereno 0,2.',
        'Los puntos quedan fijos al cerrar la orden. Quincenas: del 1 al 15 y del 16 a fin de mes.',
    ])
    A.p('Para corregir los puntos de una orden cerrada: botón **⭐ Puntos** en el tablero o en el Historial (por tarea y por persona). En **Por quincena** se ve y se cierra la quincena.')
    A.img('ex_puntos', 'Una orden cerrada: «La orden» y «Puntos», con «Ver y corregir los puntos»')
    A.img('of_prod_quincena', 'Producción por quincena')
    A.h(3, 'Cuánto vale cada tarea y el paso a paso')
    A.p('En **Cuánto vale cada tarea** están los puntos de cada tarea, **¿Cómo se suman los puntos?** y **＋ Crear tarea**. Cada tarea tiene su **paso a paso**, que es lo que la cuadrilla ve en el celu y escucha con «🔊 Escuchar los pasos».')
    A.img('of_prod_baremo', 'Cuánto vale cada tarea')
    A.img('of_prod_baremo_2', 'Al pie: «28 tareas no tienen el paso a paso» con «Revisar borrador», el valor del punto y cuánto pesa cada rol')
    A.atencion('Hay un **borrador de los pasos** de 28 tareas que no tenían (todo «a confirmar»). Está en **Cuánto vale cada tarea › Revisar borrador**: revisalo, corregí lo que haga falta, tocá **Guardar** y **Sí**. Hasta que se guarde, la cuadrilla no lo ve.')

    A.h(2, '🧠 Lo que aprende la app')
    A.p('Menú › **Lo que aprende la app**. Pestañas:')
    A.vinetas(['**⏱ Tiempos**: cuánto tarda de verdad cada tarea (con las horas que pone la cuadrilla), por persona y por cuadrilla. Con **✨ Informe del asistente** y **Valores que usa la orden sugerida**.', '**📦 Material**: calculado vs. entregado y material contra avance por obra, y el material real por columna y por tipo de obra (con obras terminadas). Lo que propone el Asistente solo se anota para que lo revise Ángel.', '**👷 Días sin tarea**: por persona, los días hábiles del mes sin orden ni ausencia.'])
    A.img('of_aprende', 'Lo que aprende la app › Tiempos')
    A.img('va_aprende_sin', 'Días sin tarea')
    A.img('va_aprende_mat', 'Lo que aprende la app › Material')

    A.h(2, '🩺 Supervisor')
    A.p('Revisa la app sola (sin inteligencia artificial) al abrir y cada 15 minutos, y lo muestra en la tarjeta **Supervisor** del Inicio. **Ver todo** abre la hoja completa:')
    A.vinetas(['Itemizado: hechas de más, columnas del cálculo distintas al itemizado, órdenes cerradas que no movieron el avance.', 'Obras trabadas (sin movimiento hace días), órdenes viejas sin cerrar, tareas repetidas, atraso contra el Gantt.', 'Equipo: celus con la app vieja, fotos sin subir, gente sin persona vinculada, ubicación cortada.', '**Fotos que parecen de otra obra** (por el GPS): **Mover a X** o **Está bien**. **Obras sin ubicación cargada**: **📍 Cargar ubicación**.'])
    A.p('A las 12 y a las 18 hace además una revisión con el Asistente y, si hay algo grave, avisa a Administración.')
    A.img('of_supervisor', 'La hoja del Supervisor')

    if adm:
        A.h(2, '📊 Tablero del dueño (solo Administración)')
        A.p('Menú › **Tablero del dueño** o el acceso del Inicio. Lo ve Administración y quien Administración habilite. Solo nuestra zona. En una pantalla: avance del contrato, obras en curso/atrasadas/terminadas, gente en obra, órdenes de hoy y mañana, certificado y por certificar, ganancia por obra, avance por obra, módulos del mes por día, alertas, material entregado sin avance y gasto del asistente. Con accesos al Mapa de guerra y al Informe de la semana, y **✨ Resumen de la semana** del Asistente.')
        A.img('of_dueno', 'El Tablero del dueño')

    A.h(2, 'Mi tablero')
    A.p('Menú › **Mi tablero**: un tablero de notas personal por columnas (pendiente, en curso, hecho…), para organizarte.')
    A.img('of_tablero', 'Mi tablero')

    if adm:
        A.h(2, 'Usuarios y permisos (solo Administración)')
        A.p('Menú › **Usuarios y permisos**.')
        A.pasos(['**Crear usuario**: usuario corto, nombre, contraseña (🎲 sugiere una) y rol.', 'Confirmar a los nuevos (entran como «a confirmar», solo mirar).', 'En cada usuario: rol, activo, **Persona** (su nombre en la nómina: sin esto no le llegan las órdenes) y ajustes por pantalla (oculto / ver / editar), que mandan sobre el rol.', '**🔧 Arreglar vínculos**: une usuarios con su nombre de la nómina.'])
        A.p('Cada usuario tiene un punto verde (está en la app) o rojo. Abajo: **📍 Ubicación en vivo del personal** (activar, horario, días y cada cuántos segundos) y **Guardar horario**.')
        A.img('of_usuarios', 'Usuarios y permisos')
        A.img('of_usuarios_2', 'Ubicación en vivo: horario')
        A.h(2, 'Límites del asistente (solo Administración)')
        A.p('En el Asistente › engranaje › **Límites**: prendido o apagado por rol, preguntas por día y remitos por rol, y el freno del mes (tope en US$, % de pausa y % de corte). **Guardar límites**. Abajo, **Gastado este mes** por parte y por persona. También ahí se elige el modelo del Asistente.')
        A.img('ex_limites', 'Asistente › Opciones › Límites (en la compu, al lado del Inicio)')

    A.h(2, 'Respaldo de la información')
    A.p('Pañol › **Acceso y respaldo** › **Bajar respaldo completo**: baja un archivo con toda la información (sin las fotos). Las fotos se bajan aparte con **Bajar fotos y archivos**. Si no se bajó ningún respaldo, el Inicio lo avisa en «Para atender».')
    A.cel(('pa_acceso', 'Acceso y respaldo'))
    A.consejo('Bajá el respaldo una vez por semana y guardalo en Drive o en un pendrive. La base no guarda copias sola.')

    A.h(2, 'Normas, Guías y Proyectista')
    A.p('**Normas y planos**: la biblioteca de la obra, con buscador y filtros (columnas, vínculos, cajas, tableros, zanja, PAT…). **Guías (cómo se hace)**: ver la Parte 4.')
    A.img('of_normas', 'Normas y planos')
    A.p('**Proyectista** (menú, solo oficina): relevamiento en obra con GPS, plano en el catastro de Córdoba, DXF, columnas, eléctrico y cálculo de luz. Tiene su propio instructivo.')


# ------------------------------------------------------------------ parte 2
def parte2(A):
    A.h(1, 'Parte 2 — Pañol', salto=True)
    A.p('Las capturas son del celu del pañolero; en la compu es lo mismo a lo ancho.')

    A.h(2, 'Inicio del pañolero')
    A.p('Lo primero del día. Arriba, el buscador de materiales. Los números: **pedidos para aprobar**, **para preparar**, **sin stock** y **herramientas afuera**. Debajo, **Stock bajo** (con **Lista de compras ›**) y los accesos **Vale**, **Entrada**, **Herram.** y **Compras**. La barra de abajo: Inicio · Reservas · Catálogo · Herramientas · Perfil.')
    A.cel(('pa_inicio', 'Inicio del pañolero'), ('pa_inicio_2', 'Stock bajo y accesos'))

    A.h(2, 'Catálogo (inventario)')
    A.p('**Catálogo** en la barra (o Pañol › **Catálogo pañol**): productos, sin stock, bajo mínimo e importe del inventario, el buscador y la lista con el stock de cada uno. **Mostrar solo faltantes** filtra; **Imprimir el inventario** arma la hoja.')
    A.cel(('pa_catalogo', 'Catálogo pañol'), ('pa_ficha', 'Ficha del material: foto → 3D → plano'), ('pa_ficha_ean', 'Código de barras en la ficha'))
    A.h(3, 'La ficha del material')
    A.vinetas(['Tocá un producto: arriba, la foto; deslizá para ver el **3D** y el **plano** de la hoja del material (tocalo para verlo en grande, con zoom).', 'Stock, mínimo, lo que salió este mes, **Ficha de la familia** y **Cómo se instala**.', '**Código de barras**: **Asociar código de barras** (con la cámara o a mano), **Hacer vale de salida** y **Entrada** directo desde la ficha.'])
    A.h(3, 'Lector de código de barras y QR')
    A.p('El botón **📷 Escanear** (en el Catálogo y en Herramientas) lee el código de barras de un producto, el QR de una herramienta o el QR de un comprobante. Si el celu no puede leer con la cámara, se escribe el número.')
    A.vinetas(['Código de un producto conocido → abre su ficha.', 'Código que nadie asoció → pregunta **¿A qué producto corresponde?**', 'QR de un vale, entrada, orden, reserva o remito → abre ese comprobante (si tenés permiso).'])
    A.cel(('pa_lector', 'Escanear'))
    A.consejo('Todos los comprobantes (vales, entradas, órdenes, reservas, remitos de herramientas) e informes de obra tienen su QR arriba a la derecha: escaneado con cualquier celu abre ese papel en la app.')

    A.h(2, 'Reservas de material')
    A.p('La oficina reserva material para una obra; el pañol la prepara, la marca lista y la entrega con el vale. **Reservas** en la barra.')
    A.vinetas(['Filtros: **Para preparar**, **Listas para retirar**, **Entregadas**, **✕ Sin stock**, **Todas** y **⏳ Por aprobar** (pedidos que hizo alguien de obra y hay que aprobar). **Por obra** las agrupa.', 'En cada reserva: **Empezar a alistar**, marcar cada material (o **✕ No hay**), **⇄ Ofrecer otro** (proponer otro material parecido), **Rechazar**, **Imprimir**.', 'Al entregar sale el **vale** (S-0001…) con lo que faltó, si faltó algo.'])
    A.cel(('pa_reservas', 'Reservas'), ('pa_reservas_2', 'Una reserva para preparar'))
    A.consejo('Las reservas apartan stock (salvo las «por aprobar»). Por eso el catálogo puede decir que hay pero no alcanza: lo demás está apartado para otra obra.')

    A.h(2, 'Registrar un movimiento')
    A.p('Pañol › **+ Registrar movimiento** (o **Vale** / **Entrada** en el Inicio): entrada (con proveedor, remito, precio sin IVA, moneda e IVA), salida/vale para una obra o persona, devolución. Elegís el sector (Alumbrado o Ilícitos), el producto (por código o nombre), la cantidad y la fecha.')
    A.cel(('pa_registrar', 'Registrar movimiento'), ('pa_registrar_2', 'Proveedor, remito y precio'))
    A.atencion('Los movimientos no se borran: se **anulan** (con su pareja, si la tiene) y el número no se vuelve a usar.')

    A.h(2, 'Remito con foto')
    A.p('Para cargar una entrada sin tipear: en **Registrar movimiento** tocá **📷 Cargar remito con foto** (o pedíselo al Asistente). La inteligencia artificial **solo lee** el remito; los códigos los propone la app con el catálogo, y no se carga nada sin **Sí**.')
    A.pasos(['Elegí **Cargar entrada** (suma al stock) o **Solo precios** (actualiza el costo, no mueve stock).', 'Tocá **Sacar foto** o **Elegir fotos o PDF** (hasta 4 fotos o un PDF de varias hojas).', 'Revisá la tarjeta: proveedor, número, fecha, moneda e IVA, y cada renglón con lo que dice el remito → el producto del pañol propuesto: 🟢 **Seguro**, 🟡 dudoso, 🔴 **Sin código** (queda afuera).', 'Corregí lo que haga falta (producto, cantidad, precio) o **Sacar este renglón**, y tocá **Sí, cargar entrada**.'])
    A.cel(('pa_remito_abrir', 'Remito con foto'), ('pa_remito_tarjeta', 'Lo que leyó, para revisar'), ('pa_remito_tarjeta_2', 'Cada renglón con su producto'))
    A.h(3, 'Si el remito ya se cargó')
    A.p('Antes de cargar, la app busca si ese remito (mismo número, aunque esté escrito distinto, y mismo proveedor) ya se cargó, con la foto o a mano. Si se cargó completo: **Ver lo cargado** / **Cargar igual** / **Cancelar**. Si se cargó en parte, cada renglón dice ✅ cargado, 🟠 a medias, 💲 sin precio, 🆕 nuevo, y ofrece **➕ Cargar solo lo que falta**, **💲 Solo los precios que faltan** o **Revisar renglón por renglón**. Así no se duplica stock.')
    A.p('**📜 Remitos cargados** muestra los remitos del mes cargados con la foto.')
    A.consejo('Sacá la foto de frente, con buena luz y el remito entero. Si el remito tiene varias hojas, elegí las fotos juntas o el PDF que mandó el proveedor.')

    A.h(2, 'Pedido de compras')
    A.p('En **Catálogo** (arriba de la lista de compras) está la tarjeta **🧾 Pedido de compras sugerido**: se arma sola con lo que está bajo el mínimo, lo que se acabó y lo que piden las obras programadas de los próximos días (emitidas y sugeridas), menos el stock libre y lo apartado. Nada se compra solo.')
    A.pasos(['Tocá **Ver el pedido**. Elegí **7 días** o **14 días**.', 'Está agrupado por proveedor (el de la última entrada de cada material), con la cantidad sugerida que podés cambiar y, si hay, la alternativa 🟢 que ya está en el pañol.', 'Tocá **Pedido a …** para armar la hoja A4 de ese proveedor (con o sin precios) y **Guardar el pedido**. Después, la app muestra lo recibido de ese proveedor.'])
    A.cel(('pa_compras', 'Pedido sugerido y lista de compras'), ('pa_pedido', 'El pedido de los próximos 7 días'), ('pa_pedido_2', 'Por proveedor'))
    A.consejo('Los precios del pedido los ven solo la oficina y Administración.')
    A.h(3, 'Lista de compras')
    A.p('Debajo: todo lo que está bajo el mínimo y lo que alguna vez se cargó y hoy está en 0 («⛔ se acabó», con la cantidad sugerida = la última entrada).')

    A.h(2, 'Herramientas')
    A.p('**Herramientas** en la barra. Cada herramienta con su código (H-001…), foto y estado: libre, asignada, en reparación, baja/perdida. Se asigna a una persona con el estado en que se da y se recibe con la causa y foto; queda el remito RH-… (y el ingreso RI-… cuando entra una nueva). **📜 Historial** muestra todos los movimientos.')
    A.cel(('va_herr', 'Herramientas'), ('va_herr_2', 'Cada herramienta con su estado'), ('va_etiquetas', 'Etiquetas QR'))
    A.p('**🏷 Imprimir etiquetas QR**: elegís cuáles y sale una hoja A4 de etiquetas para pegar. Escaneando la etiqueta se abre la herramienta.')

    A.h(2, 'Movimientos, por persona y más')
    A.vinetas(['**Movimientos / entregas**: todo lo que entró y salió, con filtros por obra, tipo, sector y fechas.', '**👷 Por persona**: el material y las herramientas que tiene cada uno, con constancia para firmar.', '**🔎 Calculadora ↔ pañol**: compara lo que piden los cálculos con el catálogo y propone alternativas.', '**💲 Precios**, **📷 Fotos**, **📊 Por sector** y **Alta de productos**.'])
    A.cel(('pa_movimientos', 'Movimientos'), ('pa_personas', 'Por persona'), ('pa_calcpanol', 'Calculadora ↔ pañol'))
    A.h(3, 'Alternativas')
    A.p('Cuando un material no alcanza, la app muestra materiales parecidos del pañol: 🟢 casi igual (misma medida, la norma no choca) o 🟡 sirve con diferencias (otra norma, más conductores, sección mayor). Nunca propone menor sección, menos conductores, otro amperaje, aluminio por cobre ni otro color. No une ni cambia códigos.')
    A.h(3, '🔧 Revisar el catálogo (oficina)')
    A.p('En **Acceso y respaldo**, la oficina tiene **Revisar el catálogo**: unidades mal escritas, códigos reutilizados y productos repetidos, con la propuesta para arreglarlos. Nada se cambia sin confirmar; unificar no borra (da de baja y pasa el stock con su comprobante).')
    A.img('va_revisar_cat', 'Revisar el catálogo')
    A.atencion('Los códigos del pañol no se inventan ni se reutilizan: un código con movimientos no se borra, se da de baja.')


# ------------------------------------------------------------------ parte 3
def parte3(A):
    A.h(1, 'Parte 3 — Cuadrilla (desde el celular)', salto=True)
    A.p('Todo tu día de trabajo está en el celu. La barra de abajo: **Hoy** · **Cámara** · **Mapa** · **Pañol** · **Perfil**.')

    A.h(2, 'Hoy')
    A.p('Al entrar ves **Hoy**: el saludo, cuántas tareas tenés, los avisos nuevos y tus puntos de la quincena. Debajo, **tu obra de hoy** con el número de orden, **Cómo llegar**, **Ver la orden** (o **Modo obra** si ya llegaste) y **Seguir: …** con la tarea que sigue; **Tus tareas** con sus columnas; los **Avisos nuevos**; y al pie **Ver lista completa de Mis tareas** y **Cálculos rápidos**.')
    A.cel(('cu_01_entrar', 'Entrar con tu usuario'), ('cu_02_inicio_hoy', 'Hoy'), ('cu_03_aviso', 'Los avisos (la campanita)'))
    A.p('Cuando la oficina te da una orden te llega un aviso al celu: «Orden nueva … Tocá para ver la orden y los pasos». Al tocarlo se abre la orden. También está en la campanita de arriba.')
    A.consejo('Para que te lleguen los avisos con la app cerrada: **Perfil › Avisos al celular** (o en la campanita, **Activar en este celular**).')

    A.h(2, 'La orden del día')
    A.p('Tocá **Ver la orden**: la obra, quiénes van (vos y tus compañeros), a qué hora salen, el vehículo, quién de la oficina sigue la orden, las tareas en orden (con **ver pasos** en cada una) y las notas de la oficina. Abajo, **Empezar**.')
    A.cel(('cu_04_orden_del_dia', 'La orden del día'), ('ps_orden', 'Con «ver pasos» en cada tarea'))

    A.h(2, 'Antes de arrancar: seguridad')
    A.pasos(['Tildá cada cosa: casco, arnés, guantes dieléctricos, botines, conos y vallado, equipo revisado.', 'Las que piden foto tienen el botón **Foto**: se abre la cámara de la app con la guía de qué sacar.', 'Marcá si hace falta el corte de energía.', 'Con todo, se prende **Arrancar el día**.'])
    A.p('Si no podés completar algo: **Arrancar igual (decí por qué)**. La oficina lo ve.')
    A.cel(('cu_05_seguridad', 'Antes de arrancar'))

    A.h(2, 'Antes de salir: material y herramientas')
    A.p('La app te muestra el material de la reserva de tu orden (lo retirado y lo que falta retirar del pañol) y las herramientas que lleva cada tarea, con quién las tiene. Tildá lo que llevás y tocá **Salimos**. Si falta algo: **Salir igual (decí por qué)**.')
    A.cel(('cu_06_antes_de_salir', 'Antes de salir'), ('cu_07_como_llegar', 'Cómo llegar'))

    A.h(2, 'Cómo llegar')
    A.p('El mapa con la obra, a cuántos metros y minutos estás, y **Abrir en Google Maps** para que te guíe.')

    A.h(2, 'Modo obra: un solo botón')
    A.p('En la obra usás **un solo botón grande** que va cambiando:')
    A.pasos(['**Llegué**: cuando llegás. El GPS dice «Estás en la obra · a 36 m». Queda anotada la hora de llegada y la orden pasa a «En curso».', '**Foto · Col 5**: dice qué columna sigue (o la caja, la luminaria…). Tocás, se abre la cámara de la app con la guía («Columna entera en el cuadro») y sacás la foto. Sale **Foto guardada** («Es la 1 de 4 columnas»).', '**Terminé**: tocás cuando terminaste esa columna; ponés a qué hora empezaste y terminaste (− / +) y tocás **Se hizo**. Si no se pudo: **No se hizo (decí por qué)**.', 'El botón pasa solo a la columna siguiente. Cuando terminás la última, la tarea se manda sola a la oficina y sigue la próxima tarea.'])
    A.cel(('cu_08_E_llegue', '«Llegué»'), ('cu_09_E_foto', '«Foto · Col 5»'), ('cu_10_camara', 'La cámara con la guía'))
    A.cel(('cu_11_foto_guardada', 'Foto guardada'), ('cu_12_E_termine', '«Terminé»: la hora'), ('cu_13_E_col6', 'Sigue la Col 6'))
    A.p('Debajo del botón: **📋 Cómo se hace** (el paso a paso de la tarea), **Falta material**, **Ayuda** y **Llamar a la oficina**; al pie, **Ver lista completa** y **Fin del día**.')
    A.consejo('Si llegás y el GPS te ubica en otra obra registrada, la app pregunta «Estás en X. ¿Trabajás acá hoy?». Si decís que sí, las fotos van a esa obra y se avisa a la oficina.')

    A.h(2, 'El paso a paso de cada tarea (con voz)')
    A.p('**📋 Cómo se hace** (en Modo obra), **ver pasos** (en la orden) o **Ayuda › Ver los pasos de esta tarea** abren el paso a paso: un paso por pantalla, con letra grande y el dibujo de la guía abajo.')
    A.vinetas(['Pasá de paso con **‹ ›** o deslizando el dedo.', '**🔊 Escuchar los pasos**: el celu te los lee en voz alta (sirve con las manos ocupadas). **Parar** para cortar.', 'Anda sin señal.'])
    A.cel(('ps_modo_obra', 'Modo obra con «Cómo se hace»'), ('ps_hoja', 'Paso 1 de 6'), ('ps_hoja_2', 'Paso 2, con «Escuchar los pasos»'))

    A.h(2, 'La cámara')
    A.p('**Cámara** en la barra (o el ícono «Cámara EMA») abre directo la cámara de la app. Un toque al disparador = foto guardada, con la marca de la obra, la fecha, el GPS y tu nombre.')
    A.vinetas(['**La obra la elige el GPS**: arriba dice la obra más cercana (a menos de 150 m del pin), aunque tu orden de hoy sea de otra. Si no es tu orden, lo dice.', 'Abajo: la columna (**‹ Col 4 ›**) y qué estás sacando (seguridad, antes, columna, caja, tablero…). Pasa sola a la siguiente.', 'Para cambiar la obra tocá el nombre de arriba: **¿En qué obra estás?** con las cercanas y tus órdenes. Si es otra, **Es otra obra**: buscala y decí por qué (es obligatorio).', 'Si el GPS anda mal, la app te pide que elijas la obra y marca la foto para que la oficina la revise.', '**Listo** cierra la cámara. **🗑 La última** borra la última foto que sacaste.'])
    A.cel(('cb_camara', 'La cámara: la obra arriba, la columna abajo'), ('cb_hoja_obra', '¿En qué obra estás?'), ('cb_otra_obra', 'Es otra obra (decí por qué)'))
    A.consejo('Usá siempre la cámara de la app, no la del teléfono: Android puede cerrar la app mientras sacás la foto y se pierde.')

    A.h(2, 'Falta material')
    A.p('**Falta material** en Modo obra: tildá lo que falta de la reserva de la orden (con la cantidad) o escribí otra cosa, y tocá **Avisar al pañol y a la oficina**. Les llega el aviso y te avisan cuando esté.')
    A.cel(('cu_14_falta_material', '¿Qué te falta?'), ('cu_15_ayuda', 'Ayuda'), ('cu_18_llamar', 'Llamar a la oficina'))

    A.h(2, 'Ayuda y llamar')
    A.vinetas(['**Ver los pasos de esta tarea**.', '**Preguntale al asistente**: escribí o hablá; sabe en qué obra y en qué columna estás.', '**Ver cómo se hace**: la guía con dibujos, paso a paso, con zoom.', '**Llamar a la oficina**: la lista con **Llamar** y **WhatsApp**. Abajo, **Mandar mi ubicación**.'])
    A.cel(('cu_16_asistente', 'El asistente en obra'), ('cu_17_guia_paso', 'La guía con dibujos'), ('cu_19_ia_no', 'Lo que no podés ver te lo dice'))

    A.h(2, 'Fin del día y tus puntos')
    A.p('**Fin del día**: el resumen de lo que hiciste hoy (unidades, tareas, fotos, horas), cada tarea en verde (mandada) o rojo (no se hizo, con el porqué), y si hay algo esperando señal. Abajo, **Mandado a la oficina**.')
    A.p('**Tus puntos** (desde Hoy o Perfil): los puntos de la quincena, aprobados y esperando, y orden por orden.')
    A.cel(('cu_20_fin_del_dia', 'Fin del día'), ('cu_21_mis_puntos', 'Tus puntos'))
    A.consejo('Los puntos los aprueba la oficina al cerrar la orden. «Esperando cierre» quiere decir que todavía no la cerraron.')

    A.h(2, 'Sin señal')
    A.p('Si no hay señal, arriba sale la franja naranja. Seguís trabajando igual: las fotos y lo que marcás quedan en el celu y se suben solos cuando vuelve la señal, aunque cierres la app. **Sin señal** (en Modo obra) muestra lo que está esperando y **Probar ahora**.')

    A.h(2, 'Mis tareas (lista completa)')
    A.p('Desde **Ver lista completa de Mis tareas**: tus órdenes en pestañas **Hoy**, **Pendientes** y **Terminadas**, con **Cómo llegar**, **Ver la orden completa**, la seguridad, cada tarea en una tarjeta (‹ ›) con sus fotos, «Se hizo» / «No se hizo» y la hora, y **Tus puntos** arriba.')
    A.cel(('ps_mistareas', 'Mis tareas'), ('ps_mistareas_2', 'La orden abierta'), ('ps_avisos', 'Aviso que abre la orden'))

    A.h(2, 'Pañol, mapa y cálculos rápidos')
    A.vinetas(['**Pañol**: el catálogo para ver qué hay (sin cambiar nada).', '**Mapa**: las obras; tocá una para ver dónde está.', '**Cálculos rápidos** (al pie de Hoy): hormigón, zanja, cables, consumo, abrazaderas y caída de tensión.'])
    A.cel(('ps_catalogo', 'Catálogo del pañol'), ('ps_mapa', 'Mapa'), ('va_calc_cel', 'Cálculo en el celu'))


# ------------------------------------------------------------------ parte 4
def parte4(A):
    A.h(1, 'Parte 4 — Guías: cómo se hace', salto=True)
    A.p('Menú › **Guías (cómo se hace)**. Para todos. Las guías se bajan recién cuando abrís cada una; sin señal dice «se ve cuando vuelva la señal».')
    A.h(2, 'Procesos (paso a paso)')
    A.p('Cada trabajo, paso a paso con dibujos: replanteo, fundaciones, zanja y tendido, izaje, tablero, acometida… Tocá una guía para ver sus hojas; cada hoja se agranda tocándola. **📄 PDF · Compartir** y **Bajar PDF** para mandarla.')
    A.cel(('va_guias', 'Guías'), ('va_guia_paso', 'Una guía paso a paso'), ('va_guia_paso_2', 'Las hojas de la guía'))
    A.h(2, 'Materiales')
    A.p('Las fichas de cada familia de materiales (borneras, jabalinas, columnas, luminarias…), con la hoja 3D, el plano acotado y los códigos del pañol. **Más hojas de materiales** al pie.')
    A.h(2, 'Tipos constructivos')
    A.p('Los tipos constructivos (AP-TC, AP-C…) con la hoja nueva: vista 3D, plano y la hoja completa. Lo de antes queda plegado abajo («Ver el dibujo de antes»).')
    A.cel(('va_guias_mat', 'Materiales'), ('va_guias_tipos', 'Tipos constructivos'), ('va_guia_tipo', 'Un tipo: 3D y plano'))
    A.h(2, 'Láminas')
    A.p('Las láminas tipo plano de cada proceso; si una lámina nueva todavía está a medias, se ofrece también la de antes.')
    A.h(2, 'Normas y planos')
    A.p('Menú › **Normas y planos**: los planos tipo y normas, con buscador y filtros por tema.')
    A.cel(('va_normas', 'Normas y planos en el celu'))
    A.consejo('La cuadrilla llega a las guías también desde el celu en obra: **Ayuda › Ver cómo se hace**, en la tarea que está haciendo.')


# ------------------------------------------------------------------ preguntas
def faq(A, modo):
    A.h(1, 'Preguntas frecuentes', salto=True)
    P = [
        ('No me llegó la orden al celu', ['Para que a alguien le llegue una orden hacen falta tres cosas: 1) usuario activo y confirmado; 2) en **Usuarios y permisos**, la **Persona** vinculada a su nombre de la nómina; 3) su nombre en la orden. Al llenar la orden, la app avisa a quién no le va a llegar y por qué.', 'Para que llegue con la app cerrada: **Perfil › Avisos al celular** prendido y, en la app de Android, la batería en «Sin restricciones».']),
        ('La foto cayó en otra obra', ['La cámara elige la obra más cercana por el GPS (a menos de 150 m). Si estabas en otra, antes de sacar tocá el nombre de la obra arriba y elegí la correcta (**Es otra obra**, con el porqué). Si ya está sacada, la oficina la mueve desde el **Supervisor** («Fotos que parecen de otra obra» › **Mover a…**) o pidiéndoselo al Asistente.']),
        ('No veo la barra de abajo', ['La barra está en el celu (y en la app de Android). En la compu no hay barra: se usa el menú. En la oficina y el pañol se puede guardar con la flechita **‹**: tocá la lengüeta del borde izquierdo para sacarla de nuevo. También se esconde sola mientras escribís, con la cámara, el Asistente o una ventana abierta.']),
        ('No me aparece la versión nueva', ['Cerrá la app del todo y volvé a abrirla con señal: tiene que salir **Hay una versión nueva · Actualizar**. Fijate en **Perfil › La app** si dice «Al día». Si no cambia, mandá la captura del menú › **Versión …** a la oficina.']),
        ('El asistente dice que no tengo más preguntas', ['Cada persona tiene un tope por día (cuadrilla 10, pañol 20 + 40 remitos, oficina 30). Se reinicia al día siguiente. Si dice que está en pausa o cortado por el mes, es el freno de gasto del mes: lo maneja Administración en **Límites**.']),
        ('Algo no aparece o dice «sin permiso»', ['Casi siempre es el usuario «a confirmar» o sin rol: lo arregla Administración en **Usuarios y permisos**. Si sigue, mandá la captura del menú › **Versión …**.']),
        ('No tengo señal en la obra', ['Seguí trabajando: todo queda en el celu y se sube solo cuando vuelve la señal, aunque cierres la app. No borres los datos de la app ni la desinstales con cosas esperando.']),
        ('La ubicación aparece «sin actualizar»', ['Solo se manda en el horario de trabajo. Si se corta con el celu bloqueado: batería de la app en «Sin restricciones» y la app abierta (aunque sea en el fondo).']),
        ('Quiero corregir una orden cerrada', ['Una orden cerrada fijó sus puntos. Para corregir puntos: **⭐ Puntos** en el tablero o en el Historial. Para el avance, al anular una orden cerrada la app ofrece revertirlo.']),
    ]
    if modo == 'cuadrilla':
        P = [x for x in P if x[0] not in ('Quiero corregir una orden cerrada',)]
    for t, ls in P:
        A.h(3, t)
        for l in ls: A.p(l)
