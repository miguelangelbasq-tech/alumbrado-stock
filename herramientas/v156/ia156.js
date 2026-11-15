  // ---------- v156 · auditor del avance (Ángel, 14/11: «que la IA analice el avance de obra muy bien, muy detalladamente: si
  //  pasó algo mal, algo bien, con todas las tareas que se hicieron… un control muy exacto»). auditar_avance lee el motor de la
  //  app (window.__auditAvance: cada número con sus fuentes, la planilla de columnas y los hallazgos sin IA);
  //  proponer_correcciones_avance (varias juntas, con casillas) y proponer_nota_avance proponen con tarjeta y se hacen recién
  //  con «Sí». Admin y oficina (con cambios) y Dirección (solo lectura, por la v155: no recibe ninguna proponer_*).
  if (!window.__v156No && window.__auditAvance) (function () {
    var AA = window.__auditAvance;
    function veIa() { var n = nivelRol(); return n === "admin" || n === "oficina" || n === "direccion"; }
    function partir(l, desde, n) { desde = Math.max(0, parseInt(desde, 10) || 0); var p = l.slice(desde, desde + n); return { l: p, hayMas: desde + n < l.length ? "hay más: pedí seguir=" + (desde + n) : "" }; }
    H.auditar_avance = function (a) {
      a = a || {};
      if (!veIa()) return { err: NO_VE };
      if (a.obra && a.item) {
        var E = AA.explicarItem(a.obra, a.item); if (E.err) return { err: E.err };
        return { r: Object.assign(E, { instruccion: "Explicá el número con sus fuentes (cada orden con fecha, tarea y su parte del ítem; lo cargado a mano con quién, cuándo y el MOTIVO) y decí si la suma cuadra. Si dice «sin motivo anotado», decilo así: NUNCA inventes el porqué de un número cargado a mano." }) };
      }
      if (a.obra && !a.desde && !a.hasta) {
        var O = AA.explicarObra(a.obra); if (O.err) return { err: O.err };
        var items = O.items.map(function (x) { return { item: x.item, desc: x.desc, contratado: x.contratado, hechas: x.hechas, pct: x.pct, cuadra: x.cuadra, estado: x.estado, deDondeSale: x.texto }; });
        var pg = partir(items, a.seguir, 25), r = { obra: O.obra, ID: O.ID, avancePct: O.avancePct, modulos: O.modulos, resumen: O.resumen, hallazgos: O.hallazgos.slice(0, 30), items: pg.l, contraItemizado: O.contraItemizado, etapas: O.etapas.filter(function (x) { return x.tildada || /destildada/.test(x.como); }), notas: O.notas };
        if (O.planilla) r.planilla = { columnas: O.planilla.cols, etapas: O.planilla.etapas, porColumna: O.planilla.columnas.slice(0, 40), notas: O.planilla.notas };
        if (pg.hayMas) r.hayMas = pg.hayMas;
        if (tam(r) > 28000) { r.planilla && (r.planilla.porColumna = r.planilla.porColumna.slice(0, 12)); r.items = r.items.slice(0, 12); r.hayMas = "hay más: pedí seguir=" + ((parseInt(a.seguir, 10) || 0) + 12); }
        r.instruccion = "Contestá primero si el avance está bien (sí / no y por qué), después lo rojo, lo que hay que mirar y lo que está bien. Explicá cada número con sus fuentes cuando te lo pregunten (o pedí auditar_avance con item). No inventes motivos de lo cargado a mano.";
        return { r: r };
      }
      if (a.desde || a.hasta) {
        var P = AA.periodo({ desde: a.desde, hasta: a.hasta, zona: !!a.zona, obra: a.obra });
        var pg2 = partir(P.hallazgos, a.seguir, 30);
        return { r: { desde: P.desde, hasta: P.hasta, modulosDelPeriodo: P.modulos, porObra: P.porObra.slice(0, 30), cuadra: P.cuadra, mal: P.rojos, hallazgos: pg2.l, hayMas: pg2.hayMas || undefined, instruccion: "Decí qué se hizo en el período (por obra, con las órdenes) y si cuadra con el itemizado; lo rojo primero." } };
      }
      var R = AA.revisar({ zona: !!a.zona });
      var porObra = {}; R.hallazgos.forEach(function (h) { var x = porObra[h.obra] = porObra[h.obra] || { mal: 0, paraMirar: 0, info: 0 }; if (h.nivel === "rojo") x.mal++; else if (h.nivel === "ambar") x.paraMirar++; else x.info++; });
      var pg3 = partir(R.hallazgos, a.seguir, 30);
      return { r: { obrasRevisadas: R.obras, mal: R.rojos, paraMirar: R.ambar, porObra: porObra, hallazgos: pg3.l, hayMas: pg3.hayMas || undefined, instruccion: R.hallazgos.length ? "Contale lo rojo primero, obra por obra, con la explicación. Para corregir varias juntas usá proponer_correcciones_avance (UNA tarjeta con casillas); para guardar el porqué que te diga, proponer_nota_avance. Ante dudas, preguntá antes de proponer." : "No encontré nada raro en el avance." } };
    };
    function tarjeta(tit, items, motivo, sub) {
      var ok = items.filter(function (x) { return !x.err; }), mal = items.filter(function (x) { return x.err; });
      if (!ok.length) return { err: mal.map(function (x) { return x.err; }).join(" · ") || "No hay nada para cambiar." };
      var html = '<div class="qp-ia">' + ok.map(function (x) { return '<label class="qp-ia-f"><input type="checkbox" data-aasel="' + x.i + '" checked' + (ok.length === 1 ? ' hidden' : '') + '><span><b>' + esc(x.titulo) + '</b>' + (x.detalle ? '<small>' + esc(x.detalle) + '</small>' : '') + '</span></label>'; }).join("") + '</div>';
      var avisos = []; ok.forEach(function (x) { (x.avisos || []).forEach(function (v) { if (avisos.indexOf(v) < 0) avisos.push(v); }); });
      mal.forEach(function (x) { avisos.push("No va: " + x.err); });
      var P = nuevaProp("avanceAudit", { coleccion: "avanceObras", id: (ok[0].spec && (ok[0].spec.obraId || ok[0].spec.obra || ok[0].spec.otId)) || "", titulo: tit, sub: sub || "", filas: [], html: html, avisos: avisos, items: items, motivo: motivo || "", multi: ok.length > 1,
        pie: ok.length > 1 ? "Destildá lo que no quieras. Cada cambio se hace por el camino de siempre (Avance de obra, ✏ Corregir cierre, pasar el cálculo), con el motivo en el historial de la obra y auditoría." : "Se hace por el camino de siempre, con el motivo en el historial de la obra y auditoría." });
      return pendiente(P, { cambiosPropuestos: ok.map(function (x) { return x.titulo + (x.detalle ? " (" + x.detalle + ")" : ""); }), noVan: mal.map(function (x) { return x.err; }), instruccion: ok.length > 1 ? "La app le mostró UNA tarjeta con casillas: que destilde lo que no quiera y confirme con «Sí, hacelo»." : "La app ya le mostró la tarjeta: decile en una línea que la confirme con «Sí, hacelo»." });
    }
    function chequeo() { if (!puedeAcciones()) return SIN_ACC; var n = nivelRol(); if ((n !== "admin" && n !== "oficina") || !AA.puede()) return { err: "Solo Administración y Oficina (con «editar» en Avance de obra) pueden cambiar el avance." }; return null; }
    H.proponer_nota_avance = function (a) {
      var c = chequeo(); if (c) return c; a = a || {};
      var x = AA.planUno({ tipo: "nota", obra: a.obra, item: a.item, texto: a.texto });
      return tarjeta("📒 Anotar el porqué del avance", [Object.assign({ i: 0 }, x)], a.texto, "");
    };
    H.proponer_correcciones_avance = function (a) {
      var c = chequeo(); if (c) return c; a = a || {};
      var l = (a.correcciones || []).slice(0, 15).map(function (it) { var z = Object.assign({}, it); if (z.otId) { var o = otPorRef(z.otId); if (o) z.otId = o.id; } return z; });
      if (!l.length) return { err: "No hay correcciones." };
      var V = AA.planVarios(l, a.motivo);
      return tarjeta(V.ok > 1 ? "🔧 Corregir el avance · " + V.ok + " cambios" : "🔧 Corregir el avance", V.items, a.motivo, "");
    };
    GUARDAR.avanceAudit = async function (P) {
      var card = document.querySelector('.ia-conf[data-prop="' + P.id + '"]'), el = [];
      if (card) card.querySelectorAll("input[data-aasel]").forEach(function (i) { if (i.checked) el.push(+i.dataset.aasel); });
      else el = P.datos.items.map(function (x) { return x.i; });
      if (!el.length) throw new Error("No elegiste ningún cambio.");
      if (card) card.querySelectorAll("input[data-aasel]").forEach(function (i) { i.disabled = true; });
      var g = await AA.aplicarVarios(P.datos.items, el, { porAsistente: true });
      if (!g.ok) throw new Error((g.res[0] && g.res[0].txt) || "no se pudo");
      return { antes: null, despues: { hechos: g.res.filter(function (r) { return r.ok; }).length, elegidos: el }, ref: P.datos.id, txt: g.txt };
    };
    TOOLS.push({ name: "auditar_avance", description: "AUDITA el avance de obra (solo lectura, sin IA, de lo que la app tiene). Con obra + item: de dónde sale cada unidad de ese ítem (cada cierre de orden con fecha, tarea y su parte del ítem por partes; correcciones de «✏ Corregir cierre»; revertidos al anular; lo cargado a mano en Avance de obra con quién, cuándo y MOTIVO, o «a mano, sin fecha, sin motivo anotado»; ajustes del conforme a obra; lo certificado) y si la suma cuadra con lo que dice el ítem. Con obra: todos los ítems, % y módulos, etapas (solas o a mano), la planilla columna por columna (pozo, hormigonado, izaje, vínculo, luminaria, tablerito, sellado, PAT con orden, fecha, quién, foto y hora) contra el itemizado, notas y hallazgos. Con desde/hasta (y zona): qué se hizo en el período por las órdenes cerradas y si cuadra. Sin obra: revisa TODAS las obras. Hallazgos: ítem que no cuadra con sus fuentes, hechas de más, orden cerrada que no movió el avance o lo movió dos veces, lo mandado sin cerrar, a mano sin respaldo, la misma columna en dos órdenes, orden de obra imposible (izaje sin hormigonado, vínculo sin izaje, cable sin zanja, poco fraguado: «a revisar»), cálculo ≠ itemizado, cálculo viejo no pasado, material contra avance, avance sin fecha fuera de la certificación, certificado cerrado ≠ hoy, provisiones mezcladas, 100 % sin documentación, ritmo raro. Paginado: «hay más: pedí seguir=N».", input_schema: S({ obra: TXT("obraId, ID o nombre (opcional; vacío = todas)"), item: TXT("número de ítem del pliego (opcional, con obra)"), desde: TXT("AAAA-MM-DD (opcional: período)"), hasta: TXT("AAAA-MM-DD (opcional)"), zona: { type: "boolean", description: "true = solo nuestra zona" }, seguir: { type: "integer", description: "para seguir una lista larga" } }) });
    TOOLS.push({ name: "proponer_nota_avance", description: "PROPONE anotar el PORQUÉ de un número del avance (NO lo guarda hasta el «Sí»): «lo cargamos a mano porque…». Queda en la obra (avanceNotas) y el control lo usa después y deja de marcarlo. El texto lo dice la persona: NUNCA lo inventes.", input_schema: S({ obra: TXT("obraId o nombre"), item: TXT("ítem (opcional)"), texto: TXT("el porqué, con las palabras de la persona") }, ["obra", "texto"]) });
    TOOLS.push({ name: "proponer_correcciones_avance", description: "PROPONE VARIAS correcciones del avance juntas en UNA tarjeta con casillas (la persona destilda lo que no quiere; NADA se hace hasta el «Sí»). Cada una: {tipo:\"item\", obra, item, hechas?, cantidad?} (lo hecho o lo contratado de un ítem, como en Avance de obra) · {tipo:\"nota\", obra, item?, texto} · {tipo:\"cierre\", otId, cambios:[{tarea, cantidad?, hecha?, personas?}]} (✏ Corregir cierre de una orden cerrada) · {tipo:\"calculo\", obra} (pasar el último cálculo a la obra). Motivo OBLIGATORIO (general o en cada una): si no lo dijo, preguntalo. Usala después de auditar_avance.", input_schema: S({ correcciones: { type: "array", items: { type: "object" } }, motivo: TXT("por qué (general)") }, ["correcciones"]) });
    ACCIONES.push("proponer_nota_avance", "proponer_correcciones_avance");
    Object.assign(ESTADOS, { auditar_avance: "🔎 Controlando el avance…", proponer_nota_avance: "📒 Preparando la nota…", proponer_correcciones_avance: "🔧 Preparando las correcciones…" });
    Object.assign(MIRO, { auditar_avance: ["Avance", "Órdenes", "Verificación"], proponer_nota_avance: ["Avance"], proponer_correcciones_avance: ["Avance", "Órdenes"] });
  })();
