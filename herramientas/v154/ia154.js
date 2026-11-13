  // ---------- v154 · auditor de puntos (Ángel, 13/11: «cualquier pregunta de los puntos se la tengo que poder hacer a la IA…
  //  por qué se le dio ese punto, si es válido… detectar, mover, cambiar, todo con la autorización de nosotros»).
  //  explicar_puntos y revisar_puntos leen el motor de la app (window.__auditPuntos: la misma cuenta de puntosDeOrden y de
  //  Producción); proponer_nota_puntos, proponer_puntos_persona, proponer_valor_tarea y proponer_correcciones_puntos (varias
  //  juntas, con casillas) proponen con tarjeta y se hacen recién con «Sí». Solo admin/oficina (TOOLS_ROL); la cuadrilla
  //  recibe explicar_puntos solo de lo suyo (sin nombres de los demás ni plata).
  if (!window.__v154No && window.__auditPuntos) (function () {
    var AP = window.__auditPuntos, fN2 = AP.fN;
    function esCrewIa() { try { return nivelRol() === "crew"; } catch (e) { return false; } }
    function oficinaIa() { var n = nivelRol(); return n === "admin" || n === "oficina"; }
    H.explicar_puntos = function (a) {
      a = a || {};
      if (esCrewIa()) {   // la cuadrilla: solo lo suyo, sin nombres de los demás
        var mn = miNombre(); if (!mn) return { err: "Tu usuario no está vinculado a una persona de la nómina: pedíselo a la oficina." };
        if (a.otId) {
          var o = otPorRef(a.otId); if (!o || !esMia(o)) return { err: NO_VE + " (Solo veo tus órdenes.)" };
          var E = AP.explicarOrden(o, { persona: mn }); if (E.err) return { err: E.err };
          var s = E.suyos || { pts: 0, detalle: [] };
          return { r: { orden: E.numero, obra: E.obra, fecha: E.fecha, tusPuntos: s.pts, cuenta: (s.detalle || []).map(function (d) { return d.yo || d.como; }), notas: E.excluida ? ["Esta orden no suma: " + E.excluida] : [], nota: "Solo lo tuyo. Si algo no te cierra, preguntale a la oficina." } };
        }
        var P = AP.explicarPersona(mn, a); if (P.err) return { err: P.err };
        return { r: { persona: P.persona, periodo: P.periodo, tusPuntos: P.totalProduccion, cuenta: P.cuenta, ordenes: P.ordenes.map(function (x) { return { orden: x.numero, obra: x.obra, fecha: x.fecha, puntos: x.pts, comoSalen: (x.tareas || []).map(function (d) { return d.yo || d.como; }) }; }), sinCerrar: P.sinCerrar.length, nota: "Solo lo tuyo (órdenes cerradas)." } };
      }
      if (!oficinaIa() || !AP.puede()) return { err: NO_VE };
      if (a.otId) {
        var E2 = AP.explicarOrden(otPorRef(a.otId) || a.otId, { persona: a.persona || null, tarea: a.tarea || null });
        if (E2.err) return { err: E2.err };
        return { r: Object.assign(E2, { instruccion: "Mostrá la cuenta paso a paso (cantidad × valor, regla de reparto y la parte de cada uno). Si hay cambios a mano, decí quién, cuándo y el MOTIVO anotado; si dice «sin motivo anotado», decilo así (no inventes el porqué)." }) };
      }
      if (!a.persona) return { err: "Decime de quién (persona) o de qué orden (otId)." };
      var P2 = AP.explicarPersona(a.persona, a); if (P2.err) return { err: P2.err };
      if (tam(P2) > 26000) P2.ordenes = P2.ordenes.map(function (x) { return Object.assign({}, x, { historial: (x.historial || []).slice(-3), tareas: (x.tareas || []).slice(0, 8) }); });
      return { r: Object.assign(P2, { instruccion: "El total es el mismo que muestra Producción. Mostrá la suma por orden y, si te lo piden, la cuenta de una orden (pedí explicar_puntos con otId). No inventes motivos." }) };
    };
    H.revisar_puntos = function (a) {
      if (!oficinaIa() || !AP.puede()) return { err: NO_VE };
      var R = AP.revisar(a || {});
      var l = R.hallazgos.slice(0, 40);
      return { r: { periodo: R.periodo, desde: R.desde, hasta: R.hasta, ordenesRevisadas: R.revisadas, mal: R.rojos, paraMirar: R.hallazgos.length - R.rojos, hallazgos: l, criteriosAnotados: R.criterios, nota: R.hallazgos.length ? "Contale lo rojo primero, con la orden y la cuenta. Para corregir varias juntas usá proponer_correcciones_puntos (una sola tarjeta, con casillas). Antes de proponer, preguntá lo dudoso (no inventes motivos: pedíselo)." : "No encontré nada raro en los puntos de ese período." } };
    };
    function tarjetaVarios(tipoTit, items, motivo, sub) {
      var ok = items.filter(function (x) { return !x.err; }), mal = items.filter(function (x) { return x.err; });
      if (!ok.length) return { err: mal.map(function (x) { return x.err; }).join(" · ") || "No hay nada para cambiar." };
      var html = '<div class="qp-ia">' + ok.map(function (x) { return '<label class="qp-ia-f"><input type="checkbox" data-qpsel="' + x.i + '" checked' + (ok.length === 1 ? ' hidden' : '') + '><span><b>' + esc(x.titulo) + '</b>' + (x.detalle ? '<small>' + esc(x.detalle) + '</small>' : '') + '</span></label>'; }).join("") + '</div>';
      var avisos = []; ok.forEach(function (x) { (x.avisos || []).forEach(function (v) { if (avisos.indexOf(v) < 0) avisos.push(v); }); });
      mal.forEach(function (x) { avisos.push("No va: " + x.err); });
      var P = nuevaProp("puntosAudit", { coleccion: "ordenesTrabajo", id: (ok[0].spec && ok[0].spec.otId) || "", titulo: tipoTit, sub: sub || "", filas: [], html: html, avisos: avisos, items: items, motivo: motivo || "", multi: ok.length > 1,
        pie: ok.length > 1 ? "Destildá lo que no quieras. Cada cambio se hace por el camino de siempre (✏ Corregir cierre, ⭐ Puntos, Cuánto vale cada tarea), con el motivo en el historial, auditoría y aviso «⭐ Puntos corregidos» a los que cambian." : "Se hace por el camino de siempre, con el motivo en el historial, auditoría y aviso «⭐ Puntos corregidos» a los que cambian." });
      return pendiente(P, { cambiosPropuestos: ok.map(function (x) { return x.titulo + (x.detalle ? " (" + x.detalle + ")" : ""); }), noVan: mal.map(function (x) { return x.err; }), instruccion: ok.length > 1 ? "La app le mostró UNA tarjeta con casillas: que destilde lo que no quiera y confirme con «Sí, hacelo»." : "La app ya le mostró la tarjeta con el antes y el después: decile en una línea que la confirme con «Sí, hacelo»." });
    }
    function chequeo() { if (!puedeAcciones()) return SIN_ACC; if (!oficinaIa() || !AP.puede()) return { err: "Solo Administración y Oficina pueden cambiar puntos." }; return null; }
    H.proponer_nota_puntos = function (a) {
      var c = chequeo(); if (c) return c; a = a || {};
      var x = AP.planUno(Object.assign({ tipo: "nota" }, a), a.texto);
      return tarjetaVarios("📒 Anotar el porqué", [Object.assign({ i: 0 }, x)], a.texto, x.err ? "" : (x.spec && x.spec.sub) || "");
    };
    H.proponer_puntos_persona = function (a) {
      var c = chequeo(); if (c) return c; a = a || {};
      var o = otPorRef(a.otId); if (!o) return { err: "No encontré la orden «" + (a.otId || "") + "»." };
      var x = AP.planUno({ tipo: "puntos_persona", otId: o.id, puntos: a.puntos || {}, motivo: a.motivo });
      if (x.err) return { err: x.err };
      return tarjetaVarios("⭐ Puntos de " + (o.numero || "la orden"), [Object.assign({ i: 0 }, x)], a.motivo, String(o.plazaNombre || "").toUpperCase() + " · " + fLarga(o.fecha));
    };
    H.proponer_valor_tarea = function (a) {
      var c = chequeo(); if (c) return c; a = a || {};
      if (!edita("produccion")) return { err: "Tu usuario no puede cambiar lo que vale cada tarea (hace falta «editar» en Producción)." };
      var x = AP.planUno({ tipo: "valor_tarea", tarea: a.tarea, puntos: a.puntos, motivo: a.motivo });
      if (x.err) return { err: x.err };
      return tarjetaVarios("🏷 Cuánto vale una tarea", [Object.assign({ i: 0 }, x)], a.motivo, "Producción › Cuánto vale cada tarea · desde ahora");
    };
    H.proponer_correcciones_puntos = function (a) {
      var c = chequeo(); if (c) return c; a = a || {};
      var l = (a.correcciones || []).slice(0, 15).map(function (it) { var z = Object.assign({}, it); if (z.otId) { var o = otPorRef(z.otId); if (o) z.otId = o.id; } if (z.deOt) { var o1 = otPorRef(z.deOt); if (o1) z.deOt = o1.id; } if (z.aOt) { var o2 = otPorRef(z.aOt); if (o2) z.aOt = o2.id; } return z; });
      if (!l.length) return { err: "No hay correcciones." };
      var V = AP.planVarios(l, a.motivo);
      return tarjetaVarios(V.ok > 1 ? "🔧 Corregir puntos · " + V.ok + " cambios" : "🔧 Corregir puntos", V.items, a.motivo, "");
    };
    GUARDAR.puntosAudit = async function (P) {
      var card = document.querySelector('.ia-conf[data-prop="' + P.id + '"]'), el = [];
      if (card) card.querySelectorAll("input[data-qpsel]").forEach(function (i) { if (i.checked) el.push(+i.dataset.qpsel); });
      else el = P.datos.items.map(function (x) { return x.i; });
      if (!el.length) throw new Error("No elegiste ningún cambio.");
      if (card) card.querySelectorAll("input[data-qpsel]").forEach(function (i) { i.disabled = true; });
      var g = await AP.aplicarVarios(P.datos.items, el, { porAsistente: true });
      if (!g.ok) throw new Error((g.res[0] && g.res[0].txt) || "no se pudo");
      return { antes: null, despues: { hechos: g.res.filter(function (r) { return r.ok; }).length, elegidos: el }, ref: P.datos.id, txt: g.txt };
    };
    var T_EXP = { name: "explicar_puntos", description: "EXPLICA los puntos con la cuenta paso a paso (solo lectura, la misma cuenta de la app y de Producción). Con persona (+ periodo: actual / anterior / AAAA-MM-1|2, o desde/hasta): el total que muestra Producción y de qué órdenes sale, ajustes de quincena, quincena cerrada (foto fija), órdenes que no suman (piso/reinicio). Con otId: cada tarea (cantidad × valor, de dónde sale el valor: fábrica/diccionario, Producción, a mano, baremo cambiado), la regla de reparto (asignada, repartida por lo hecho, «Elegir quiénes», equipos, a mano, rol × horas con peso y horas), la parte de cada uno, el historial de cambios con quién, cuándo y MOTIVO, y los criterios anotados. Con otId + persona (+ tarea): solo eso.", input_schema: S({ persona: TXT("nombre de la persona"), otId: TXT("OT-AAAA-NNN"), tarea: TXT("tarea (opcional)"), periodo: TXT("actual, anterior, AAAA-MM-1 o AAAA-MM-2, o una fecha AAAA-MM-DD"), desde: TXT("AAAA-MM-DD"), hasta: TXT("AAAA-MM-DD") }) };
    TOOLS.push(T_EXP);
    TOOLS.push({ name: "revisar_puntos", description: "REVISA si los puntos están bien (solo lectura, sin IA): por período (periodo o desde/hasta), persona, obra u orden. Encuentra: reparto que no suma, puntos a quien no está en la orden o con 0 horas, «no se hizo» con puntos, la cuadrilla mandó hecho/fotos y el cierre dice 0 (o al revés), la misma columna pagada en dos órdenes, puntos a mano sin motivo, valor de la tarea distinto del baremo sin explicación, diferencia con la foto fija de una quincena cerrada, orden cerrada sin puntos y puntos por hora fuera de lo común (solo para mirar). Cada hallazgo trae la orden, la explicación y una propuesta.", input_schema: S({ periodo: TXT("actual, anterior, AAAA-MM-1|2 o AAAA-MM-DD"), desde: TXT("AAAA-MM-DD"), hasta: TXT("AAAA-MM-DD"), persona: TXT("opcional"), obra: TXT("opcional"), otId: TXT("opcional: una orden") }) });
    TOOLS.push({ name: "proponer_nota_puntos", description: "PROPONE anotar el PORQUÉ de una decisión de puntos (NO lo guarda hasta el «Sí»): en el historial de una orden (otId, opcional tarea/persona) y/o como CRITERIO general (general:true o sin otId; opcional tarea, persona, desde) que se lee siempre al explicar y revisar. Ej.: «a Pablo le dimos 2 más en la OT-177 porque hizo el apoyo solo», «desde hoy el apoyo PRFV vale más porque…». El texto lo dice la persona: no lo inventes.", input_schema: S({ texto: TXT("la nota, con las palabras de la persona"), otId: TXT("opcional"), tarea: TXT("opcional"), persona: TXT("opcional"), general: { type: "boolean", description: "true = también como criterio general" }, desde: TXT("AAAA-MM-DD, opcional") }, ["texto"]) });
    TOOLS.push({ name: "proponer_puntos_persona", description: "PROPONE mover puntos entre personas de una orden CERRADA o ponerlos a mano (como «⭐ Puntos»; NO lo cambia hasta el «Sí»). puntos = {persona: puntos nuevos}; los que no nombrás quedan igual y la suma tiene que dar el total de la orden (si no, te dice cuánto falta). Motivo OBLIGATORIO (preguntalo si no lo dijo). Para cambiar lo HECHO o quiénes hicieron una tarea, usá proponer_corregir_cierre.", input_schema: S({ otId: TXT("OT-AAAA-NNN"), puntos: { type: "object", description: "{\"Pablo Picone\": 11.25, \"Ariel Lastra\": 7.25}" }, motivo: TXT("por qué (lo dice la persona)") }, ["otId", "puntos", "motivo"]) });
    TOOLS.push({ name: "proponer_valor_tarea", description: "PROPONE cambiar cuánto vale una tarea en «Cuánto vale cada tarea» (Producción) (NO lo cambia hasta el «Sí»). Vale SOLO hacia adelante: las órdenes ya cerradas quedan con sus puntos guardados (si alguna se tiene que corregir, va de a una con proponer_corregir_cierre, y decilo). Motivo OBLIGATORIO; queda en el historial del baremo.", input_schema: S({ tarea: TXT("nombre o id de la tarea"), puntos: { type: "number", description: "puntos por unidad nuevos" }, motivo: TXT("por qué") }, ["tarea", "puntos", "motivo"]) });
    TOOLS.push({ name: "proponer_correcciones_puntos", description: "PROPONE VARIAS correcciones de puntos juntas en UNA tarjeta con casillas (la persona destilda lo que no quiere; NADA se hace hasta el «Sí»). Cada corrección: {tipo:\"corregir_cierre\", otId, cambios:[{tarea, cantidad?, hecha?, personas?, puntos?}]} · {tipo:\"puntos_persona\", otId, puntos:{persona: pts}} · {tipo:\"valor_tarea\", tarea, puntos} · {tipo:\"nota\", texto, otId?, tarea?, persona?, general?} · {tipo:\"mover\", deOt, aOt, tarea, cantidad?, personas?} (pasa lo hecho y sus puntos de una orden cerrada a otra). Motivo OBLIGATORIO (general o en cada una). Usala después de revisar_puntos.", input_schema: S({ correcciones: { type: "array", items: { type: "object" } }, motivo: TXT("por qué (general)") }, ["correcciones"]) });
    ACCIONES.push("proponer_nota_puntos", "proponer_puntos_persona", "proponer_valor_tarea", "proponer_correcciones_puntos");
    Object.assign(ESTADOS, { explicar_puntos: "🧮 Haciendo la cuenta de los puntos…", revisar_puntos: "🔎 Revisando los puntos…", proponer_nota_puntos: "📒 Preparando la nota…", proponer_puntos_persona: "⭐ Preparando el cambio de puntos…", proponer_valor_tarea: "🏷 Preparando el cambio de valor…", proponer_correcciones_puntos: "🔧 Preparando las correcciones…" });
    Object.assign(MIRO, { explicar_puntos: ["Puntos", "Órdenes", "Producción"], revisar_puntos: ["Puntos", "Órdenes", "Verificación"], proponer_nota_puntos: ["Puntos"], proponer_puntos_persona: ["Puntos", "Órdenes"], proponer_valor_tarea: ["Producción"], proponer_correcciones_puntos: ["Puntos", "Órdenes"] });
  })();
