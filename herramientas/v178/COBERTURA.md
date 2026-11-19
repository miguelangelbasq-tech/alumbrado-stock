# v178 · Qué ve y qué hace el asistente (Administración y Oficina)

Pedido de Ángel (19/11): «la IA de la app tiene que saber y ver todo lo de la app, absolutamente todo; no puede decirme que no
ve; tiene que poder ver todo, saber todo y poder hacer todo».

Alcance: **Administración** ve todo; **Oficina** lo mismo salvo lo que en la app es solo de Administración (auditoría, usuarios,
presencia, alias, tableros, reinicios). **Cuadrilla, pañol, «solo mirar» y Dirección siguen como en la v177** (límites de la
v141: es seguridad). Toda escritura es con tarjeta y «Sí» (lo delicado, dos veces) por el mismo camino que la pantalla; las
reglas de Firebase y la guardia de la v174 siguen controlando.

## Por qué decía «no lo veo» (lo encontrado)

1. **Datos que solo se cargan al abrir una pantalla**: herramientas y sus movimientos (Pañol › Herramientas), puntos del mapa
   (Mapa), quincenas cerradas (Producción), presencia (Usuarios), ubicación en vivo (Mapa), gastos, planos. Con la pantalla
   cerrada, `consultar` devolvía «Está vacía en memoria» y el modelo decía que no lo tenía.
2. **Colecciones que el asistente no conocía**: adjuntos, fotosObra (fichas), auditoria, avisosCuadrilla, proyectos,
   planosNotas, tableros, y los documentos cuadrillas / guias / salud / alias de configEquipo.
3. **No había forma de leer un documento entero** por su número, ni de buscar un nombre en todo, ni de ver la pantalla.
4. **Acciones de la pantalla sin herramienta**: aprobar/anular reservas, herramientas (asignar, devolver, baja), cargar gastos,
   registrar/archivar/borrar obras, usuarios (rol, activo, vínculo con la nómina), puntos del mapa, documentación en papel,
   responder los avisos de «Para resolver», ausencias, contactos, cerrar/reabrir la quincena, borrar fotos, alta de producto.
5. Los `enum` de `consultar` y `proponer_editar` se armaban antes de que existieran algunas colecciones.

## Colecciones y documentos

| Colección / doc | Leer (herramienta) | Hacer (herramienta) | Antes de la v178 |
|---|---|---|---|
| avanceObras (obras) | obra_completa, datos_obra, consultar obras, leer_doc | proponer_editar_obra, proponer_corregir_itemizado, proponer_marcar_avance, proponer_accion obra_nueva / archivar_obra / borrar_obra / documento | sin alta, archivar ni borrar |
| historialCalculos | historial_calculos, revisar_calculo, consultar calculos | proponer_calculo, proponer_editar calculos | igual |
| ordenesTrabajo | ordenes, ordenes_completas, verificar_orden, leer_doc (por OT-…) | proponer_orden, proponer_editar_orden, proponer_cierre, proponer_cierre_dia, proponer_corregir_cierre, sugeridas | sin leer_doc |
| movimientos | stock, consultar movimientos, leer_doc (por S-/E-) | proponer_movimiento_panol, proponer_editar (anular = delicado) | igual (anular sin doble Sí) |
| catalogoProductos | stock, consultar catalogo, leer_doc (por código) | proponer_editar catalogo (baja = delicado), **proponer_accion producto_alta** (el código lo elige la app) | sin alta |
| reservas | consultar reservas, leer_doc (por R-) | proponer_movimiento_panol (reserva nueva), **proponer_accion reserva** (aprobar, alistar, lista, rechazar, anular, cerrar) | sin cambios de estado |
| herramientas | consultar (**de la base si no está en memoria**), leer_doc (por H-…) | **proponer_accion herramienta** (asignar, pasar, devolver, reparación, reparada, baja, reactivar) | vacía sin abrir el Pañol |
| herramientasMov | consultar (**de la base**) | lo escribe proponer_accion herramienta | vacía sin abrir |
| gastosObra | consultar gastos (**de la base** si falta) | **proponer_accion gasto**, proponer_editar gastos | sin alta |
| planSemanal | consultar plan | proponer_editar plan | igual |
| historialEtapas | consultar etapas | (las etapas se tildan solas) | igual |
| planosObra / planosImg | consultar planos, ver_plano, leer_doc | proponer_editar planos | igual |
| **planosNotas** | consultar, leer_doc | proponer_editar planosNotas | no existía |
| mapaPuntos | consultar (**de la base**) | **proponer_accion punto_mapa**, proponer_editar mapaPuntos | vacía sin abrir el Mapa |
| cierresQuincena | consultar (**de la base**), puntos, explicar_puntos | **proponer_accion quincena** (cerrar / reabrir, delicado) | vacía sin abrir Producción |
| usuarios (admin) | consultar usuarios, leer_doc | **proponer_accion usuario** (rol, activo, confirmar, nombre, persona; delicado), proponer_editar usuarios | sin vínculo con la nómina |
| presencia (admin) | consultar (**de la base**), diagnostico_equipo | — (la escribe cada celu) | vacía sin abrir Usuarios |
| ubicacionVivo | consultar (**de la base**; ahora también Oficina) | — (la escribe cada celu) | vacía sin abrir el Mapa; Oficina no |
| **adjuntos** | consultar (de la base, 25 por página, con filtro directo), leer_doc | proponer_mover_fotos, **proponer_accion borrar_fotos** (delicado) | no existía |
| **fotosObra** | consultar (de la base, con filtro por obra/fecha), buscar_fotos, ver_fotos, ubicar_fotos, leer_doc | proponer_mover_fotos, borrar_fotos | solo por buscar_fotos |
| **auditoria** (admin) | consultar (de la base, con filtro por acción/ref), leer_doc, buscar_en_todo profundo | — (nadie la cambia) | no existía |
| **avisosCuadrilla** | consultar, avisos_cuadrilla, leer_doc | **proponer_accion aviso_cuadrilla** (visto / resuelto con respuesta) | solo avisos_cuadrilla |
| **proyectos** | consultar, leer_doc | proponer_editar proyectos (datos sueltos; el relevamiento se hace en Proyectista) | no existía |
| **tableros** (admin) | consultar, leer_doc | — (lo escribe cada uno) | no existía |
| configEquipo/personal | nomina, personal, consultar personal | proponer_personal, proponer_vehiculo, **proponer_accion ausencia / contacto**, proponer_editar personal (guardia v174) | sin ausencias ni contactos |
| configEquipo/baremo | consultar baremo, explicar_puntos | proponer_valor_tarea, proponer_tarea_nueva, proponer_rendimiento, proponer_editar baremo | igual |
| configEquipo/precios | consultar precios, certificacion | proponer_editar precios (guardia v174) | igual |
| configEquipo/reinicios | consultar reinicios | proponer_editar reinicios (**delicado: dos veces**) | sin doble Sí |
| configEquipo/ubicacion (admin) | consultar ubicacionCfg | proponer_editar ubicacionCfg | igual |
| **configEquipo/cuadrillas** | consultar, leer_doc | proponer_editar cuadrillas (guardia v174) | no existía |
| **configEquipo/guias** | consultar, leer_doc | proponer_editar guias | no existía |
| **configEquipo/salud** | consultar, leer_doc, guardian | — (la escribe la app) | no existía |
| **configEquipo/alias** (admin) | consultar, leer_doc | — (lo cambia Usuarios) | no existía |
| configEquipo/presencia, vapid (pública) | leer_doc | — | — |
| pushSubs | **no** | — | — |
| avisosPush | **no** (solo crear: proponer_aviso) | proponer_aviso | — |
| secretosServidor | **no** | — | — |

## Lo que calculan los módulos (`dato_app`, solo lee)

pedido_compras, lista_compras, tablero_dueno, alertas (Mapa de guerra), informe_semanal, documentacion, material_contra_avance,
sin_tarea, armadas, fotos_en_el_celu, lecturas, gasto_asistente, version. Ya tenían herramienta propia: certificacion,
ordenes_sugeridas, como_vamos, supervisor, avance_obra, auditar_avance, explicar_puntos / revisar_puntos, tiempos_por_unidad,
verificar_orden, guardian (solo Administración).

## La pantalla (`ver_pantalla`)

La vista, el título, la pestaña elegida, la ventana abierta encima, todo el texto visible, cada campo con su valor y los
botones (sin el panel del asistente).

## Lo que NO se puede (y por qué)

- **pushSubs, avisosPush y secretosServidor**: las reglas de Firebase no dejan leerlos a nadie (direcciones de cada celu, la
  cola del Worker y las claves privadas). Es a propósito.
- **Las imágenes** de fotos, planos y videos no viajan como datos: se miran con ver_fotos / ver_plano (los videos no).
- **Proyectista** (relevar puntos, dibujar el plano) y **subir archivos** (fotos, PDF, remitos) necesitan la mano de la persona
  en la pantalla (cámara, GPS, archivo): el asistente puede abrir la pantalla (abrir) pero no sacar la foto.
- **Cerrar sesión, cambiar la contraseña, la huella, el ajuste del celu** (Perfil): son de cada aparato.
- **Cuadrilla, pañol, «solo mirar» y Dirección**: siguen sin ver lo que la v141 les cierra (plata, personas, auditoría). Es
  seguridad, no un olvido.
