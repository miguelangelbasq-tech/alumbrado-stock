  // ---------- v157 · el tiempo de cada columna (Ángel, 15/11: «para después sacar un promedio de cuánto se tarda en hacer un
  //  tablerito, un artefacto…»). tiempos_por_unidad lee window.__tiempoCol (la hora de la foto de cada columna, sin IA): mediana,
  //  rango, cuántas mediciones, por cuadrilla y por persona; las dudosas aparte. Solo lectura (admin, oficina, Dirección).
  if (!window.__v157No && window.__tiempoCol) (function () {
    H.tiempos_por_unidad = function (a) {
      a = a || {};
      var n = nivelRol(); if (n !== "admin" && n !== "oficina" && n !== "direccion") return { err: NO_VE };
      var R = window.__tiempoCol.paraIa(a);
      R.instruccion = R.sinDatos ? "Todavía no hay columnas con su hora para eso: decilo así (sale sola cuando la cuadrilla saca la foto de cada columna). No inventes tiempos." : "Contestá en minutos por columna (unidad): la mediana y cuántas mediciones; si son menos de 3, decí que son pocas. Las dudosas (fotos seguidas, sin hora de inicio) NO cuentan: decí cuántas hay. Para «¿quién es más rápido?» usá porCuadrilla / porPersona (menos minutos = más rápido) y aclará con cuántas mediciones. No inventes.";
      return { r: R };
    };
    TOOLS.push({ name: "tiempos_por_unidad", description: "Cuánto se tarda en CADA columna / unidad (tablerito, izaje, vínculo, luminaria, sellado, pozo, PAT…), de la hora de la foto de cada columna que saca la cuadrilla (solo lectura, sin IA). Devuelve por tarea: mediana en minutos, rango, mediciones buenas, dudosas aparte (fotos seguidas, sin hora de inicio), por cuadrilla, por persona y por cantidad de gente, y las últimas mediciones. Para «¿cuánto tardan en hacer un tablerito?», «¿quién es más rápido izando?». Filtros opcionales: tarea (nombre o parte), persona, obra, desde/hasta (AAAA-MM-DD).", input_schema: S({ tarea: TXT("tarea (nombre o parte: «tablerito», «izaje»…)"), persona: TXT("persona (opcional)"), obra: TXT("obra (opcional)"), desde: TXT("AAAA-MM-DD (opcional)"), hasta: TXT("AAAA-MM-DD (opcional)") }, []) });
    Object.assign(ESTADOS, { tiempos_por_unidad: "⏱ Mirando los tiempos de cada columna…" });
    Object.assign(MIRO, { tiempos_por_unidad: ["Órdenes", "Tiempos"] });
  })();
