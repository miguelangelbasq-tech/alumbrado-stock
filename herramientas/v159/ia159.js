  // ---------- v159 · crear tareas nuevas (Ángel, 15/11: «se me van ocurriendo, se lo digo a la IA y lo tiene que calcular, y el
  //  tema de los puntos también calcularlo con la fórmula que dijimos, y que sea algo justo»). proponer_tarea_nueva arma la tarea
  //  con window.__tareaNueva2.proponer (HH × D, parecidas, pasos, fotos, ítem, avance, rendimiento; lo estimado «a confirmar») y la
  //  muestra en una tarjeta con «Sí, crearla» / «Cambiar algo» / «No»; proponer_editar_tarea cambia o da de baja una tarea creada
  //  por el equipo (con motivo). Solo admin/oficina (Dirección no recibe ninguna proponer_*; pañol, cuadrilla y mirar tampoco).
  if (!window.__v159No && window.__tareaNueva2) (function () {
    var TN = window.__tareaNueva2;
    function okRol() { var n = nivelRol(); return (n === "admin" || n === "oficina") && TN.puede(); }
    function entradaDe(a) {
      var e = { nombre: a.nombre, descripcion: a.descripcion, unidad: a.unidad, fase: a.fase, hh: a.hh, minutos: a.minutos_por_unidad, personas: a.personas, factores: a.factores, puntos: a.puntos, pasos: a.pasos, fotos: a.fotos, item: a.item, parte: a.parte, rubroAvance: a.rubroAvance, rinde: a.rinde_por_dia };
      Object.keys(e).forEach(function (k) { if (e[k] == null || e[k] === "") delete e[k]; });
      return e;
    }
    function resumen(T) {
      return { tarea: T.label, unidad: T.un, fase: T.fase, horasHombre: T.hh, horasDeDonde: T.hhTxt, factores: T.f, dificultad: T.dif, cuenta: T.cuenta, puntos: T.pts, puntosAMano: T.ptsMano, parecidas: T.parecidas.map(function (p) { return { tarea: p.label, hh: p.hh, hhMedido: p.hhMed, dificultad: p.dif, pts: p.pts, ptsPorHora: p.ptsH }; }), justa: T.justo, pasos: T.pasos, fotos: T.fotos, item: T.item, mueveItemizado: !T.noAvanza, avance: T.av.txt, rendimiento: T.rend ? T.rend.txt : null, estimado: Object.keys(T.est).filter(function (k) { return T.est[k]; }), avisos: T.avisos };
    }
    H.proponer_tarea_nueva = function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      if (!okRol()) return { err: "Solo Administración y Oficina (con «editar» en Producción) pueden crear tareas." };
      var T = TN.proponer(entradaDe(a));
      if (T.err) return { err: T.err };
      if (!(T.hh > 0)) return { r: { faltaDato: true, preguntar: T.preguntar, parecidas: resumen(T).parecidas, instruccion: "Todavía no armé la tarjeta: preguntale a la persona lo que falta (" + T.preguntar.join(" ") + ") y después volvé a llamar a proponer_tarea_nueva." } };
      var Pr = nuevaProp("tareaNueva", { coleccion: "configEquipo", id: "baremo", titulo: "🆕 Tarea nueva: «" + T.label + "»", sub: T.fase + " · se mide en " + T.un, filas: [{ c: "Puntos por " + T.un, a: "—", d: T.pts }], html: TN.tarjetaHtml(T), avisos: T.avisos.slice(), entrada: T.entrada, motivo: String(a.motivo || ""), pie: "Se guarda en Producción › «Cuánto vale cada tarea» (la ve todo el equipo y aparece en Llenar orden, la orden sugerida, Modo obra y el avance de obra). Queda en el historial del baremo con el motivo. No borra ni cambia nada de lo que ya está." });
      return pendiente(Pr, { tarjeta: resumen(T), instruccion: "La app ya le mostró la tarjeta con la cuenta (" + T.cuenta + "), las parecidas y lo estimado. Decile en 2 líneas cómo salen los puntos, si es justa comparada con las parecidas y qué estimaste (marcado «a confirmar»); que la confirme con «Sí, crearla» o te diga qué cambiar." });
    };
    GUARDAR.tareaNueva = async function (P) {
      var d = P.datos, r = await TN.crear(d.entrada, d.motivo, { porAsistente: true });
      if (!r.ok) throw new Error(r.txt);
      return { antes: {}, despues: { id: r.id, pts: r.T.pts }, ref: r.id, txt: r.txt };
    };
    function tareaK(q) {
      var z = String(q || "").trim(), l = typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : [], n = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim(); };
      var t = l.filter(function (x) { return x.id === z || n(x.label) === n(z); })[0];
      if (!t) { var c = l.filter(function (x) { return n(x.label).indexOf(n(z)) >= 0; }); if (c.length === 1) t = c[0]; else if (c.length > 1) return { err: "«" + z + "» puede ser: " + c.slice(0, 8).map(function (x) { return x.label; }).join(", ") + "." }; }
      return t ? { k: t.id, label: t.label } : { err: "No encontré la tarea «" + z + "»." };
    }
    H.proponer_editar_tarea = function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      if (!okRol()) return { err: "Solo Administración y Oficina (con «editar» en Producción) pueden cambiar tareas." };
      var t = tareaK(a.tarea); if (t.err) return { err: t.err };
      if (!TN.propiaDe(t.k)) return { err: "«" + t.label + "» es del diccionario de la app: para cambiar lo que vale usá proponer_valor_tarea (con motivo). Acá se cambian las tareas que creó el equipo." };
      if (!a.motivo || String(a.motivo).trim().length < 3) return { err: "Falta el motivo: preguntale por qué (queda en el historial). No lo inventes." };
      var p = TN.propiaDe(t.k);
      if (a.dar_de_baja || a.reactivar) {
        var Pb = nuevaProp("tareaEditar", { coleccion: "configEquipo", id: "baremo", titulo: (a.reactivar ? "▶ Reactivar «" : "⏸ Dar de baja «") + p.label + "»", sub: "Producción › Cuánto vale cada tarea", filas: [{ c: "En Llenar orden", a: a.reactivar ? "no aparece" : "aparece", d: a.reactivar ? "aparece" : "no aparece" }], avisos: a.reactivar ? [] : ["Las órdenes que ya la tienen siguen andando (puntos y avance)."], k: t.k, baja: !a.reactivar, reactivar: !!a.reactivar, motivo: String(a.motivo), pie: "No se borra nada: queda en el historial del baremo con el motivo." });
        return pendiente(Pb);
      }
      var c = entradaDe(a); delete c.nombre; if (a.nombre_nuevo) c.nombre = a.nombre_nuevo;
      var P = TN.planEditar(t.k, c, a.motivo); if (P.err) return { err: P.err };
      if (!P.filas.length) return { err: "Con eso no cambia nada." };
      var Pr = nuevaProp("tareaEditar", { coleccion: "configEquipo", id: "baremo", titulo: P.titulo, sub: P.sub, filas: P.filas, html: TN.tarjetaHtml(P.T), avisos: P.avisos, k: t.k, cambios: c, motivo: P.motivo, pie: "Vale desde ahora: las órdenes ya cerradas guardan sus puntos. Queda en el historial del baremo con el motivo." });
      return pendiente(Pr, { tarjeta: resumen(P.T) });
    };
    GUARDAR.tareaEditar = async function (P) {
      var d = P.datos, r = d.baja || d.reactivar ? await TN.baja(d.k, d.motivo, { porAsistente: true, reactivar: !!d.reactivar }) : await TN.editar(d.k, d.cambios, d.motivo, { porAsistente: true });
      if (!r.ok) throw new Error(r.txt);
      return { antes: {}, despues: { id: d.k }, ref: d.k, txt: r.txt };
    };
    var FACT = { type: "object", description: "factores de dificultad (true/false): alt = altura o barquilla, pes = pesado, rie = riesgo eléctrico, ofi = oficio o precisión. Solo los que dijo o son obvios; lo demás lo estima la app «a confirmar».", properties: { alt: { type: "boolean" }, pes: { type: "boolean" }, rie: { type: "boolean" }, ofi: { type: "boolean" } } };
    var PROPS = { nombre: TXT("nombre claro de la tarea (una sola acción, ej. «Pintura de bases de columna»)"), descripcion: TXT("qué es y cómo se hace, con las palabras de la persona"), unidad: TXT("en qué se mide: columna, caja, luminaria, jabalina, metro, tablero, obra, visita…"), fase: TXT("fase (opcional)"), hh: { type: "number", description: "horas-hombre por unidad, si las dijo así" }, minutos_por_unidad: { type: "number", description: "minutos que tarda cada unidad (si lo dijo así)" }, personas: { type: "number", description: "entre cuántas personas (con minutos_por_unidad: HH = minutos/60 × personas)" }, factores: FACT, puntos: { type: "number", description: "puntos por unidad SOLO si la persona los pone a mano (si no, salen de HH × D)" }, pasos: TXT("pasos cortos, uno por renglón (opcional: si no, borrador a confirmar)"), fotos: TXT("fotos que pide, separadas por «;» (opcional)"), item: TXT("ítem del itemizado que mueve, solo si la persona lo dice (si no, no mueve lo que se cobra)"), parte: { type: "number", description: "parte del ítem (0–1 o %)" }, rubroAvance: TXT("qué marca en el avance de obra: un paso de la columna (pozo, horm, acab, izaje, aplom, vinc, artef, subida, tabl, sello, pat), un rubro para una cosa nueva (civil, columnas, cajas, vinculos, artefactos, cableado, pat, tablero, cierre) o «ninguno»; si no se sabe, que lo elija la app"), rinde_por_dia: { type: "number", description: "cuántas unidades hacen 2 personas en un día, si lo dijo" }, motivo: TXT("por qué la crea (con sus palabras, opcional)") };
    TOOLS.push({ name: "proponer_tarea_nueva", description: "PROPONE una TAREA NUEVA para el catálogo (NO la guarda hasta el «Sí, crearla»). La app calcula los puntos con la fórmula de siempre: puntos por unidad = horas-hombre × dificultad (D = 1 + 0,2 por cada factor: altura, pesado, riesgo eléctrico, oficio; tope 1,8), la compara con las 3 parecidas (pts por hora) para que sea justa, propone pasos y fotos, ítem del itemizado (solo si lo dice) y qué marca en el avance de obra, y el rendimiento para la orden sugerida. Si dicen «media hora por columna entre dos» pasá minutos_por_unidad 30 y personas 2 (= 1 HH). Si no sabés las horas, preguntá antes.", input_schema: S(PROPS, ["nombre"]) });
    TOOLS.push({ name: "proponer_editar_tarea", description: "PROPONE cambiar una tarea que creó el equipo (horas, dificultad, unidad, nombre, puntos a mano, pasos, fotos, ítem, avance de obra, rendimiento) o darla de baja / reactivarla (NO lo guarda hasta el «Sí»). La de baja no aparece más en Llenar orden ni en la sugerida; las órdenes viejas siguen andando. El motivo es obligatorio (NUNCA lo inventes). Las del diccionario se cambian con proponer_valor_tarea.", input_schema: S(Object.assign({ tarea: TXT("la tarea (nombre o id)"), nombre_nuevo: TXT("nombre nuevo (opcional)"), dar_de_baja: { type: "boolean" }, reactivar: { type: "boolean" } }, (function () { var o = {}; Object.keys(PROPS).forEach(function (k) { if (k !== "nombre") o[k] = PROPS[k]; }); return o; })()), ["tarea", "motivo"]) });
    ACCIONES.push("proponer_tarea_nueva", "proponer_editar_tarea");
    Object.assign(ESTADOS, { proponer_tarea_nueva: "🆕 Armando la tarea nueva…", proponer_editar_tarea: "✏ Preparando el cambio de la tarea…" });
    Object.assign(MIRO, { proponer_tarea_nueva: ["Tareas", "Puntos"], proponer_editar_tarea: ["Tareas", "Puntos"] });
  })();
