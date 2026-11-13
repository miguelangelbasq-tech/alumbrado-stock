  // ---------- v153 · corregir el cierre de una orden YA CERRADA (Ángel, 13/11: «NECESITO QUE LA IA PUEDA HACER ESAS
  //  MODIFICACIONES»: el asistente decía «desde acá no tengo cómo corregir el cierre de una orden cerrada»).
  //  proponer_corregir_cierre → el motor de la app (window.__corregirCierre: cantidades, quiénes, puntos por persona, avance
  //  de la obra, historial, auditoría ot_cierre_corregido, aviso «⭐ Puntos corregidos»). Tarjeta antes → después y «Sí».
  //  proponer_editar_orden sobre una orden cerrada con cantidades o quién deriva acá. Solo admin/oficina (TOOLS_ROL).
  if (!window.__v153No && window.__corregirCierre) (function () {
    var CC = window.__corregirCierre, fN = CC.fN;   // números como en la hoja (9,25 · 0,7)
    function dudasDe(o, ks) {   // lo que mandó la cuadrilla contra el cierre, en las tareas que no se tocan (para preguntar)
      var l = [], V = null;
      try { V = !window.__v150No && window.__verifOt ? window.__verifOt.verifOt(o) : null; } catch (e) { V = null; }
      var cant = (o.cierre && o.cierre.cantidades) || {};
      ((V && V.tareas) || []).forEach(function (t) {
        if (ks.indexOf(t.k) >= 0) return;
        var c = num(cant[t.k]), fotos = (t.si || []).filter(function (u) { return u.foto; }).length;
        if (t.hechas > c + 1e-9) l.push("«" + t.label + "»: la cuadrilla mandó " + fN(t.hechas) + (fotos ? " (con " + fotos + " foto" + (fotos === 1 ? "" : "s") + ")" : "") + " y en el cierre quedó " + (c > 0 ? fN(c) : "0 (no se hizo)") + ". Preguntá si se suma.");
        else if (c > 0 && t.mandada && t.hechas < c - 1e-9 && t.conDetalle) l.push("«" + t.label + "»: en el cierre dice " + fN(c) + " y la cuadrilla mandó " + fN(t.hechas) + ".");
      });
      return l;
    }
    function verifDe(o, k) { try { if (window.__v150No || !window.__verifOt) return null; var t = window.__verifOt.verifTarea(o, k); return t && t.mandada ? t.texto + (t.dudas && t.dudas.length ? " · ⚠ " + t.dudas.join("; ") : "") : "la cuadrilla no mandó nada de esta tarea"; } catch (e) { return null; } }
    H.proponer_corregir_cierre = function (a) {
      if (!puedeAcciones()) return SIN_ACC;
      if (!edita("parte") || !CC.puede()) return { err: "Tu usuario no puede corregir órdenes (hace falta «editar» en Órdenes)." };
      var o = otPorRef(a && a.otId); if (!o) return { err: "No encontré la orden «" + ((a && a.otId) || "") + "»." };
      var cambios = ((a && a.cambios) || []).map(function (c) { return { tarea: c.tarea, cantidad: c.cantidad, hecha: c.hecha, personas: c.personas, puntos: c.puntos }; });
      var motivo = String((a && a.motivo) || "").trim() || "Corrección pedida al asistente";
      var x = CC.plan(o.id, cambios, motivo, { porAsistente: true });
      if (x.err) return { err: x.err, r: x.r || null };
      var ks = x.tareas.map(function (t) { return t.k; }), dudas = dudasDe(o, ks);
      var P = nuevaProp("corregirCierre", { coleccion: "ordenesTrabajo", id: o.id, titulo: "✏ Corregir el cierre de " + (o.numero || "la orden"), sub: String(o.plazaNombre || "").toUpperCase() + " · " + fLarga(o.fecha),
        filas: x.filas, html: CC.resumenHtml(x), avisos: x.avisos.concat(dudas.map(function (d) { return "Sin tocar: " + d; })), plan: x, motivo: motivo,
        pie: "Se corrige como en «✏ Corregir cierre» de la orden: los puntos de esa tarea se reparten con la cuenta de siempre (rol × horas) o como dijiste, el avance de la obra se mueve una sola vez, queda en el historial de la orden y les llega «⭐ Puntos corregidos» a los que cambian." });
      return pendiente(P, { orden: o.numero || "", puntos: x.personas.filter(function (p) { return p.cambia; }).map(function (p) { return p.nombre + ": " + fN(p.antes) + " → " + fN(p.despues); }), total: fN(x.totalAntes) + " → " + fN(x.totalDespues), avance: x.avance.map(function (z) { return "ítem " + z.id + ": " + fN(z.antes) + " → " + fN(z.despues); }),
        loQueMandoLaCuadrilla: x.tareas.map(function (t) { return t.label + ": " + verifDe(o, t.k); }), dudasEnOtrasTareas: dudas, nota: dudas.length ? "Hay tareas donde lo que mandó la cuadrilla no coincide con el cierre: preguntale a la persona si también las corrige (no las incluyas sin que lo diga)." : "" });
    };
    GUARDAR.corregirCierre = async function (P) {
      var g = await CC.aplicar(P.datos.plan);
      if (!g.ok) throw new Error(g.err || "no se pudo corregir");
      return { antes: g.antes, despues: g.despues, ref: P.datos.id, txt: g.txt, extra: '<div class="ia-acc"><button type="button" class="btn-ghost" data-ccabrir="' + esc(P.datos.id) + '">Ver la corrección</button></div>' };
    };
    // proponer_editar_orden sobre una orden cerrada: lo hecho, quién y los puntos van por acá
    var editarOrden = H.proponer_editar_orden;
    H.proponer_editar_orden = function (a) {
      var o = otPorRef(a && a.otId), c = (a && a.cambios) || {};
      var soloCierre = o && cerradaOt(o) && o.cierre && o.cierre.cerradoTs && !c.anular && (c.tareas || []).length && !c.fecha && !c.hora_inicio && !c.hora_fin && !c.vehiculo && c.notas == null && !c.supervisor && !(c.sacar_tareas || []).length && !(c.sacar_personas || []).length;
      if (soloCierre) {
        var cb = (c.tareas || []).map(function (t) { return { tarea: t.tarea, cantidad: t.cantidad, personas: t.quien && !/^(todos|toda la cuadrilla|nadie)$/i.test(nk(t.quien)) ? [t.quien].concat(c.agregar_personas || []) : (c.agregar_personas || []).length ? c.agregar_personas : undefined }; });
        var r = H.proponer_corregir_cierre({ otId: a.otId, cambios: cb, motivo: a.motivo });
        if (r && r.r) r.r.nota = ((r.r.nota || "") + " La orden ya estaba cerrada: esto corrige el cierre (lo hecho, quiénes y los puntos).").trim();
        return r;
      }
      var r2 = editarOrden(a);
      if (o && cerradaOt(o) && r2 && r2.r && !r2.err) r2.r.nota = "Si lo que querés cambiar es lo HECHO, quién lo hizo o los puntos de esta orden cerrada, usá proponer_corregir_cierre.";
      return r2;
    };
    TOOLS.push({ name: "proponer_corregir_cierre", description: "PROPONE corregir el cierre de una orden YA CERRADA (NO lo cambia hasta el «Sí»): por tarea, la cantidad hecha (0 → 1…), si se hizo o no (hecha:false = «no se hizo»), quiénes la hicieron (de la orden o de la nómina: se suman a la orden) y, si la persona lo dice, los puntos de esa tarea por persona (si no, la app los reparte con la cuenta de siempre: rol × horas). Recalcula los puntos de cada uno (lo de las otras tareas no se toca), mueve el avance de la obra una sola vez, guarda el historial y avisa «⭐ Puntos corregidos». Antes, mirá verificar_orden (fotos con columna, «no se hizo») y, si lo que mandó la cuadrilla no coincide con el cierre en alguna tarea que no te pidieron, PREGUNTÁ antes de incluirla. Todo en UNA llamada.", input_schema: S({ otId: TXT("número OT-AAAA-NNN u otId"), cambios: { type: "array", items: { type: "object", properties: { tarea: TXT("tarea de la orden (nombre o id)"), cantidad: { type: "number", description: "cantidad hecha nueva (0 = no se hizo)" }, hecha: { type: "boolean", description: "true = se hizo (si no decís cantidad, la prevista o 1); false = no se hizo" }, personas: { type: "array", items: { type: "string" }, description: "quiénes la hicieron (opcional)" }, puntos: { type: "object", description: "solo si la persona lo pide: puntos de esta tarea por persona, {\"Pablo Picone\": 9.25}" } }, required: ["tarea"] } }, motivo: TXT("por qué, corto (queda en el historial)") }, ["otId", "cambios"]) });
    ACCIONES.push("proponer_corregir_cierre");
    Object.assign(ESTADOS, { proponer_corregir_cierre: "📝 Preparando la corrección del cierre…" });
    Object.assign(MIRO, { proponer_corregir_cierre: ["Órdenes", "Puntos", "Itemizado"] });
  })();
