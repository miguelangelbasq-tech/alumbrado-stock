  // ---------- v158 · el avance de obra nuevo (Ángel, 15/11: «el % de la obra es el avance de la obra… se mueve según las órdenes
  //  de trabajo»). avance_obra lee window.__av2 (qué lleva la obra y qué falta, por columna y por pieza, de memoria);
  //  auditar_avance con obra lo suma; proponer_marcar_avance marca / destilda / falla / pieza, varias columnas, con tarjeta y «Sí».
  //  Admin y oficina con cambios; Dirección solo lee (no recibe ninguna proponer_*).
  if (!window.__v158No && window.__av2) (function () {
    var AV = window.__av2;
    function veIa() { var n = nivelRol(); return n === "admin" || n === "oficina" || n === "direccion"; }
    H.avance_obra = function (a) {
      a = a || {};
      if (!veIa()) return { err: NO_VE };
      var ob = a.obra ? (typeof resolverObra == "function" ? resolverObra(a.obra) : null) : null;
      if (ob && ob.err && !ob.obra) return { err: ob.err, candidatos: ob.candidatos };
      var R = AV.paraIa(ob && ob.obra ? ob.obra.id : a.obra, a.columna || "");
      if (R.err) return { err: R.err };
      R.instruccion = R.sinLista ? "Decí que esa obra no tiene la lista del avance nuevo y que el % es el del itemizado." : "Contestá exacto con lo que dice: qué le falta a cada columna (paso y pieza, p. ej. «a la Col 4 le falta 1 BPN 6 verde (2010)»), lo que está en revisión (mandado sin cerrar), fraguando, fallas y lo que no va por columna. El % de la obra es avanceObraPct (por las órdenes); el del itemizado (lo que se cobra) es avanceItemizadoPct: si te preguntan «cuánto va», usá el de la obra. No inventes nada.";
      return { r: R };
    };
    if (H.auditar_avance) { var aa0 = H.auditar_avance; H.auditar_avance = function (a) { var x = aa0.apply(this, arguments); try { if (a && a.obra && x && x.r && !a.item) { var ro = typeof resolverObra == "function" ? resolverObra(a.obra) : null, P = AV.paraIa((ro && ro.obra && ro.obra.id) || a.obra); if (!P.err && !P.sinLista) x.r.avanceObraNuevo = { avanceObraPct: P.avanceObraPct, avanceItemizadoPct: P.avanceItemizadoPct, rubros: P.rubros, falta: P.falta, columnas: (P.columnas || []).slice(0, 20), terminada: P.terminada }; } } catch (e) { } return x; }; }
    H.proponer_marcar_avance = function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      var n = nivelRol(); if ((n !== "admin" && n !== "oficina") || !AV.puede()) return { err: "Solo Administración y Oficina (con «editar» en Avance de obra) pueden cambiar el avance." };
      if (!a.motivo || String(a.motivo).trim().length < 3) return { err: "Falta el motivo: preguntale por qué (queda en el historial de la obra). No lo inventes." };
      var ob = a.obra ? (typeof resolverObra == "function" ? resolverObra(a.obra) : null) : null;
      if (ob && ob.err && !ob.obra) return { err: ob.err, candidatos: ob.candidatos };
      var P = AV.planMarcar({ obra: ob && ob.obra ? ob.obra.id : a.obra, columnas: a.columnas || "", pasos: a.pasos || "", accion: a.accion || "marcar", pieza: a.pieza || "", cosa: a.cosa || "", cant: a.cant, motivo: a.motivo, porAsistente: true });
      if (P.err) return { err: P.err };
      var Pr = nuevaProp("avance2", { coleccion: "avanceObras", id: P.o.id, titulo: "📋 Avance de obra · " + (P.o.nombre || ""), sub: P.cambios.length + (P.cambios.length === 1 ? " cambio" : " cambios") + " · motivo: «" + a.motivo + "»", filas: P.filas.slice(0, 30), avisos: P.avisos.map(function (x) { return "⏳ " + x + ". ¿Lo marcaron igual?"; }), spec: { obra: P.o.id, columnas: a.columnas || "", pasos: a.pasos || "", accion: a.accion || "marcar", pieza: a.pieza || "", cosa: a.cosa || "", cant: a.cant }, motivo: String(a.motivo), pie: "Queda «a mano» en el avance de la obra, con el motivo en el historial y auditoría. El itemizado (lo que se cobra) no cambia." });
      return pendiente(Pr, { avisos: P.avisos });
    };
    GUARDAR.avance2 = async function (P) {
      var d = P.datos, Pl = AV.planMarcar(Object.assign({}, d.spec, { motivo: d.motivo, porAsistente: true }));
      if (Pl.err) throw new Error(Pl.err);
      var r = await AV.aplicar(Pl, d.motivo, { porAsistente: true });
      if (!r.ok) throw new Error(r.txt);
      return { antes: { pct: r.antes }, despues: { pct: r.despues }, ref: d.id, txt: r.txt };
    };
    TOOLS.push({ name: "avance_obra", description: "El AVANCE DE OBRA (el % de la obra, por las órdenes de trabajo; solo lectura, sin IA): qué lleva la obra y qué falta EXACTO por columna (pozo, hormigón, izaje, vínculo, artefacto, cable de subida, tablerito, sellado, PAT) y por pieza (BPN gris/celeste/verde, fusibles, portafusibles, prensacable…), lo que está en revisión (mandado sin cerrar), fraguando, fallas para rehacer, observado, lo que no va por columna (zanja, cable, tablero, acometida, pruebas, inspecciones, papeles), el % por rubro, el del itemizado aparte (lo que se cobra), fechas (inicio, prevista, a este ritmo). Para «¿qué le falta a la Col 4?», «¿cuánto va Bulevares?», «¿está terminada?».", input_schema: S({ obra: TXT("obraId o nombre"), columna: TXT("columna (opcional: «Col 4», «4»)") }, ["obra"]) });
    TOOLS.push({ name: "proponer_marcar_avance", description: "PROPONE marcar a mano en el AVANCE DE OBRA (NO lo guarda hasta el «Sí»): accion marcar (hecho) · desmarcar (no se hizo) · completa (toda la columna) · falla (se arruinó: rehacer, resta) · obs (observado por la inspección) · nolleva · pieza_falta / pieza_ok (una pieza de la columna: «bpn verde», «fusible», código). Varias columnas juntas («Col 7 a 10», «todas») y pasos (pozo, hormigón, izaje, vínculo, artefacto, subida, tablerito, sellado, PAT o «todo»); o una cosa sin columna (cosa: «acometida», «prueba de encendido», con cant si va en metros). El motivo lo dice la persona (obligatorio, NUNCA lo inventes). Si avisa fraguado o falta de hormigón, preguntá si lo marcaron igual.", input_schema: S({ obra: TXT("obraId o nombre"), columnas: TXT("columnas: «Col 4», «7 a 10», «todas»"), pasos: TXT("pasos separados por coma, o «todo»"), accion: { type: "string", enum: ["marcar", "desmarcar", "completa", "falla", "obs", "nolleva", "pieza_falta", "pieza_ok"] }, pieza: TXT("pieza (opcional)"), cosa: TXT("cosa sin columna (opcional)"), cant: { type: "number", description: "cantidad (opcional)" }, motivo: TXT("el porqué, con las palabras de la persona") }, ["obra", "accion", "motivo"]) });
    ACCIONES.push("proponer_marcar_avance");
    Object.assign(ESTADOS, { avance_obra: "📋 Mirando el avance de la obra…", proponer_marcar_avance: "📋 Preparando el cambio del avance…" });
    Object.assign(MIRO, { avance_obra: ["Avance", "Órdenes"], proponer_marcar_avance: ["Avance"] });
  })();
