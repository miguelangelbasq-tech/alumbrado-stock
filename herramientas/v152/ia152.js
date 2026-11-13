  // ---------- v152 · mover fotos con el asistente (Ángel, 13/11: «la IA no puede mover imágenes de una carpeta a otra»).
  //  Antes: proponer_mover_fotos solo conocía las fotos que devolvía ubicar_fotos (por el GPS), solo cambiaba de obra, no
  //  tocaba la orden (la foto seguía contando en la de origen) y no había forma de cambiar la columna ni de pasar a otra orden.
  //  Ahora: buscar_fotos (ids por obra, orden, día, persona, columna, hora, «Fotos sin obra», las N últimas) y
  //  proponer_mover_fotos con los 4 destinos (obra, columna/tipo, orden, desde «Fotos sin obra»), con el motor de la app
  //  (window.__moverFoto: ficha, adjunto y orden, auditoría foto_mover). Solo admin/oficina (TOOLS_ROL); nada sin «Sí».
  if (!window.__v152No && window.__moverFoto) (function () {
    var M = window.__moverFoto, ctx = { resolverObra: resolverObra, otPorRef: otPorRef, fechaDe: fechaDe };
    H.buscar_fotos = async function (a) {
      if (!ve("registro", "avance", "obras", "parte")) return { err: "No tenés permiso para ver las fotos de obra." };
      var r = await M.ia.buscar(a || {}, ctx); if (r.err) return { err: r.err, r: r.r || null };
      var imgs = [];
      if (a && a.ver) { for (var i = 0; i < r.minis.length; i++) { var im = null; try { im = await achicar(r.minis[i], 400, 0.8, 120000); } catch (e) { im = null; } if (im) { imgs.push({ type: "text", text: "Foto " + (i + 1) + " (id " + r.r.fotos[i].id + "):" }); imgs.push(bloqueImg(im.data)); } } }
      return { r: r.r, img: imgs };
    };
    H.proponer_mover_fotos = async function (a) {
      if (!puedeAcciones()) return SIN_ACC;
      if (!edita("avance") && !edita("registro")) return { err: "Tu usuario no puede mover fotos de obra." };
      Object.keys(fotosUbic).forEach(function (k) { M.recordar(fotosUbic[k]); });   // las de ubicar_fotos (por el GPS)
      var x = await M.ia.proponer(a || {}, ctx); if (x.err) return { err: x.err, r: x.r || null };
      var P = { id: "P" + (++seqP), tipo: "moverFotos", estado: "pendiente", datos: x.datos };
      PROPS[P.id] = P;
      return { r: { estado: "pendiente_de_confirmacion", propuesta: P.id, mover: x.resumen.mover, a: x.resumen.a, quedanIgual: x.resumen.quedan, instruccion: "La app ya le mostró la tarjeta con las miniaturas y el antes → después: decile que confirme con «Sí, hacelo»." }, prop: P };
    };
    GUARDAR.moverFotos = function (P) { return M.ia.guardar(P); };
    var iT = -1; TOOLS.forEach(function (t, i) { if (t.name === "proponer_mover_fotos") iT = i; });
    var nuevo = { name: "proponer_mover_fotos", description: "PROPONE mover fotos (NO las mueve hasta el «Sí»): a otra obra, a otra columna o tipo dentro de la misma obra (Col 4 → Col 5, zanja → tablero), desde «Fotos sin obra» a una obra, o a otra orden de trabajo. Usá los id de buscar_fotos (o de ver_fotos / ubicar_fotos). Mandá solo lo que cambia: obraDestino, otDestino, columna, tipo, tarea. Si cambia de obra y no decís la orden, la app usa la orden de esa obra del día de la foto si la persona estaba en ella. Tarjeta con miniaturas y antes → después.", input_schema: S({ fotos: { type: "array", items: { type: "string" }, description: "ids de las fotos" }, obraDestino: TXT("obraId o nombre de la obra, o «sin_obra» (opcional)"), otDestino: TXT("número OT-AAAA-NNN u otId de la orden de destino (opcional)"), columna: TXT("columna / número nuevo, p. ej. «Col 5» o «5» (opcional)"), tipo: TXT("qué es la foto: columna, caja, tablero, conexion, luminaria, pat, zanja, antes, despues, seguridad, otra (opcional)"), tarea: TXT("tarea de la orden (opcional)"), sinOrden: { type: "boolean", description: "true = que quede sin orden en la obra nueva" }, motivo: TXT("por qué, corto") }, ["fotos"]) };
    if (iT >= 0) TOOLS[iT] = nuevo; else TOOLS.push(nuevo);
    TOOLS.push({ name: "buscar_fotos", description: "Busca fotos de obra y devuelve sus id para moverlas o revisarlas: por obra (obraId o nombre, o «sin_obra» = «Fotos sin obra»), por orden (otId), por día (fecha), por quién la sacó (persona), por columna, por tipo (categoria), por hora («10:30», ± 20 min) y las N últimas (ultimas). Con ver:true manda también las miniaturas de las primeras 6. Para «la de las 10:30», «las 3 últimas de Juan», «la foto de la Col 4».", input_schema: S({ obraId: TXT("obraId o nombre, o «sin_obra» (opcional)"), otId: TXT("número OT u otId (opcional)"), fecha: TXT("hoy, ayer, AAAA-MM-DD o DD/MM (opcional)"), persona: TXT("quién la sacó (opcional)"), columna: TXT("Col 4, 4… (opcional)"), categoria: TXT("columna, tablero, zanja… (opcional)"), hora: TXT("HH:MM (opcional)"), ultimas: { type: "integer", description: "solo las N más nuevas (opcional)" }, ver: { type: "boolean", description: "true = mandar las miniaturas" } }) });
    Object.assign(ESTADOS, { buscar_fotos: "📷 Buscando las fotos…", proponer_mover_fotos: "📝 Preparando el cambio de las fotos…" });
    Object.assign(MIRO, { buscar_fotos: ["Fotos"] });
  })();
