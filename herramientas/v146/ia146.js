  // ---------- v146 · cierre del día por voz (la IA solo dice qué cambia; la app arma la tarjeta y con «Sí» cierra por el camino
  //  de siempre, window.__cierreVoz) y el «✨ Resumen de la semana» del tablero del dueño (pedido corto, cuenta para el gasto)
  if (!window.__v146No) {
    H.proponer_cierre_dia = (a) => {
      if (!puedeAcciones()) return SIN_ACC;
      if (!edita("parte")) return { err: "Tu usuario no puede cerrar órdenes." };
      const CVx = window.__cierreVoz; if (!CVx) return { err: "El cierre por voz no está en esta versión." };
      const R = CVx.armarPropuesta((a && a.ordenes) || []); if (R.err) return { err: R.err };
      const n = R.ordenes.length, np = R.ordenes.reduce((s, o) => s + o.pasar.length, 0);
      const P = nuevaProp("cierreDia", { titulo: `🎙 ¿Cierro así? · ${n === 1 ? "1 orden" : n + " órdenes"}`, sub: R.ordenes.map((o) => o.numero + " · " + o.obra).join(" · "), filas: R.filas, html: R.html, ordenes: R.ordenes, avisos: R.avisos, coleccion: "ordenesTrabajo",
        pie: `Con «Sí, cerrar» cada orden se cierra con el cierre de siempre (puntos, avance y avisos)${np ? " y lo que falta pasa al día que dijiste (se suma a la orden de esa obra o se arma una nueva, con aviso a la gente)" : ""}. Lo que no dijiste queda como lo mandó la cuadrilla. ¿Algo mal? Decilo de nuevo («eran 5 columnas»).` });
      return pendiente(P);
    };
    GUARDAR.cierreDia = async (P) => {
      const R = await window.__cierreVoz.aplicar(P.datos.ordenes);
      if (!R.cerradas.length && !R.pasadas.length) throw new Error(R.quedaron.map((q) => q.numero + ": " + q.motivo).join("; ") || "no se cerró ninguna");
      const txt = (R.cerradas.length ? `✅ Cerradas: ${R.cerradas.join(", ")}.` : "") + (R.pasadas.length ? ` 📅 ${R.pasadas.map((p) => `«${p.label}» → ${p.a || "orden nueva"} (${fCorta(p.fecha)})`).join(" · ")}.` : "") + (R.quedaron.length ? ` ⚠ Quedaron abiertas: ${R.quedaron.map((q) => q.numero + " (" + q.motivo + ")").join(", ")}.` : "");
      return { txt: txt.trim(), antes: null, despues: R, ref: P.datos.ordenes.map((o) => o.otId).join(",") };
    };
    TOOLS.push({ name: "proponer_cierre_dia", description: "CIERRE DEL DÍA POR VOZ: PROPONE cerrar las órdenes del día con lo que dicta la persona (NO cierra hasta el «Sí»). Las órdenes ya vienen cargadas con lo que mandó la cuadrilla (ver el contexto [CIERRE DEL DÍA POR VOZ]): mandá SOLO lo que la persona corrige. Una sola llamada con todas las órdenes que nombra.", input_schema: S({ ordenes: { type: "array", description: "una por orden que nombra la persona", items: S({ otId: TXT("otId o número OT-AAAA-NNN"), cantidades: { type: "object", description: "lo hecho por tarea: { k de la tarea: cantidad } (solo lo que cambia)" }, horas: { type: "object", description: "horas trabajadas por persona: { nombre completo: horas }" }, pasar: { type: "array", description: "lo que falta, a otro día", items: S({ k: TXT("k de la tarea"), cant: { type: "number", description: "cuánto pasa (vacío = lo que falta)" }, fecha: TXT("AAAA-MM-DD"), quien: { type: "array", items: { type: "string" }, description: "quiénes (vacío = los mismos)" } }, ["k", "fecha"]) }, observaciones: TXT("novedades (opcional)") }, ["otId"]) } }, ["ordenes"]) });
    ACCIONES.push("proponer_cierre_dia");
    Object.assign(ESTADOS, { proponer_cierre_dia: "🎙 Armando el cierre del día…" });
    Object.assign(MIRO, { proponer_cierre_dia: ["Órdenes"] });
  }
  async function resumenSemana(datos) {
    for (let i = 0; i < 40 && ocupado; i++) await espera(250);
    if (ocupado) return { error: "El asistente está ocupado." };
    armarPanel();
    const txt = "[Tablero del dueño] Hacé el RESUMEN DE LA SEMANA para Ángel (el dueño de la empresa), MUY corto: 5 a 7 líneas, lo importante primero (plata y atrasos), en rioplatense, sin tablas, sin inventar nada (solo lo que está abajo, ya calculado por la app; la plata y el avance son solo de nuestra zona del contrato). No uses herramientas.\n[Datos de la semana]\n" + JSON.stringify(datos).slice(0, 12000);
    ultimo = null;
    await enviar(txt, false, { burbuja: "✨ Resumen de la semana (tablero del dueño)", effort: "low", tipo: "pregunta" });
    avisarFab();
    return ultimo || { error: "sin respuesta" };
  }
