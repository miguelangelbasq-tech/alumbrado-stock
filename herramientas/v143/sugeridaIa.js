  // ---------- v143 · Órdenes sugeridas: LA ARMA LA APP (window.__sugerida, sin IA); el asistente la lee, la revisa y propone
  // cambios con las mismas funciones que los botones de la hoja. Nada sin «Sí». Solo admin/oficina o quien edite «parte».
  const SUG = () => window.__sugerida || null;
  function obraSug(txt, plan) {
    const q = nk(txt), l = plan.ordenes;
    let m = l.filter((o) => String(o.obraId) === String(txt).trim() || nk(o.obra) === q || (o.ID && String(o.ID) === String(txt).trim())); if (m.length === 1) return { o: m[0] };
    m = l.filter((o) => nk(o.obra).indexOf(q.replace(/^plaza /, "")) >= 0 || q.split(" ").filter((w) => w.length > 2 && w !== "plaza").every((w) => nk(o.obra).indexOf(w) >= 0));
    if (m.length === 1) return { o: m[0] };
    return { err: m.length ? `«${txt}» puede ser: ${m.map((o) => o.obra).join(", ")}.` : `«${txt}» no está en la sugerida de ese día (obras: ${l.map((o) => o.obra).join(", ") || "ninguna"}).` };
  }
  H.ordenes_sugeridas = (a) => {
    if (!edita("parte")) return { err: "Tu usuario no arma órdenes de trabajo." };
    const S = SUG(); if (!S || !S.puede()) return { err: "La orden sugerida no está disponible para este usuario." };
    const f = a && a.fecha ? fechaDe(a.fecha) : S.fechaDef(); if (!f) return { err: "No entendí la fecha «" + a.fecha + "». Pasala como AAAA-MM-DD." };
    return { r: S.resumenIa(f) };
  };
  // los cambios en lenguaje simple (ya interpretados por el modelo) → los mismos cambios que hacen los botones de la hoja
  function cambioSug(c, plan, f) {
    const t = String(c.tipo || "");
    const x = obraSug(c.obra || "", plan); if (x.err) return { err: x.err };
    const o = x.o, base = { obraId: o.obraId };
    if (o.emitida) return { err: `${o.obra} ya está emitida (${o.emitida.numero}): se cambia en «Llenar orden».` };
    if (t === "incluir_obra" || t === "excluir_obra") return { c: Object.assign(base, { tipo: t === "incluir_obra" ? "incluir" : "excluir" }), txt: (t === "incluir_obra" ? "incluir " : "no emitir ") + o.obra };
    if (t === "sacar_persona" || t === "sumar_persona") {
      const r = personaDe(c.persona || "", t === "sacar_persona" ? o.gente.map((p) => ({ nombre: p.nombre })) : null); if (r.err) return { err: r.err };
      return { c: Object.assign(base, { tipo: t, persona: r.p.nombre }), txt: (t === "sacar_persona" ? "sacar a " : "sumar a ") + r.p.nombre + " en " + o.obra };
    }
    if (t === "cantidad" || t === "sacar_tarea" || t === "sumar_tarea") {
      const r = tareaDe(c.tarea || ""); if (r.err) return { err: r.err };
      const k = r.t.id;
      if (t === "cantidad" && !(num(c.cantidad) >= 0)) return { err: "Falta la cantidad." };
      if (t === "sumar_tarea" && o.pendientes.indexOf(k) < 0 && !o.tareas.some((y) => y.k === k)) return { err: `«${r.t.label}» no tiene nada pendiente en ${o.obra}.` };
      return { c: Object.assign(base, { tipo: t, k, cantidad: c.cantidad }), txt: t + " " + r.t.label };
    }
    if (t === "vehiculo") {
      const ids = []; for (const v of String(c.vehiculo || "").split(/\s*(?:,|\+| y )\s*/).filter(Boolean)) { const r = vehiculoDe(v); if (r.err) return { err: r.err }; ids.push(r.v.id); }
      return { c: Object.assign(base, { tipo: "vehiculo", vehiculoIds: ids }), txt: "vehículo de " + o.obra };
    }
    return { err: `No conozco el cambio «${t}».` };
  }
  H.proponer_ordenes_sugeridas = (a) => {
    if (!puedeAcciones()) return SIN_ACC;
    if (!edita("parte")) return { err: "Tu usuario no puede emitir órdenes de trabajo." };
    const S = SUG(); if (!S || !S.puede()) return { err: "La orden sugerida no está disponible para este usuario." };
    const f = a && a.fecha ? fechaDe(a.fecha) : S.fechaDef(); if (!f) return { err: "No entendí la fecha «" + a.fecha + "»." };
    const E0 = S.edicion(f), antes = S.armar(f, Object.assign(S.ediciones(), { [f]: E0 }));
    const E = JSON.parse(JSON.stringify(E0)), Ew = { [f]: E }, errs = [], hechos = [];
    for (const c of (a.cambios || [])) {
      const plan = S.armar(f, Object.assign(S.ediciones(), Ew));
      const r = cambioSug(c, plan, f); if (r.err) { errs.push(r.err); continue; }
      S.aplicar(Ew, f, r.c); hechos.push(r.txt);
    }
    if ((a.cambios || []).length && !hechos.length) return { err: "No pude aplicar ningún cambio: " + errs.join(" · ") };
    const desp = S.armar(f, Object.assign(S.ediciones(), Ew)), filas = S.diferencias(antes, desp), l = S.emitibles(desp);
    if (!l.length) return { err: "Con esos cambios no queda ninguna orden para emitir ese día." + (errs.length ? " " + errs.join(" · ") : "") };
    const avisos = errs.map((x) => "No apliqué: " + x);
    desp.ordenes.filter((o) => o.incluir && !o.emitida).forEach((o) => o.avisos.forEach((y) => { if (y.n === "rojo") avisos.push(String(o.obra).toUpperCase() + ": " + y.t); }));
    const res = l.map((o) => ({ c: String(o.obra).toUpperCase(), a: "", d: o.gente.map((p) => p.nombre.split(" ")[0]).join(", ") + " · " + o.tareas.map((t) => t.label.split(" (")[0] + " " + fN(t.cant)).join(", ") + (o.pts ? " · " + fN(o.pts.total) + " pts" : "") }));
    const P = nuevaProp("sugeridas", { titulo: `📋 Órdenes sugeridas · ${fLarga(f)}`, sub: `${l.length} ${l.length === 1 ? "orden" : "órdenes"} · ${l.reduce((s, o) => s + o.gente.length, 0)} personas`, filas: filas.length ? filas : res.map((x) => ({ c: x.c, a: "—", d: x.d })), avisos, fecha: f, edicion: E, n: l.length, coleccion: "ordenesTrabajo", pie: "Se emiten por «Llenar orden», igual que si las armaras vos: número OT, aviso al celu y «Quedan» al día. «Abrir la hoja» te las deja para revisar.", motivo: a.motivo || "" });
    return pendiente(P, { ordenes: res.map((x) => x.c + ": " + x.d), instruccion: "La app ya le mostró la tarjeta con el antes y el después y «Sí, emitir las " + l.length + "» / «Abrir la hoja» / «No»: decile en una línea que la confirme." });
  };
  GUARDAR.sugeridas = async (P, soloCargar) => {
    const S = SUG(); if (!S) throw new Error("La orden sugerida no está en esta versión.");
    if (soloCargar) { S.abrir(P.datos.fecha, P.datos.edicion); if (esCel()) minimizar(); return { cargada: true, txt: "↪ Te las dejé en la hoja de órdenes sugeridas con los cambios: revisalas y emití desde ahí." }; }
    const r = await S.emitir(P.datos.fecha, Object.assign(S.ediciones(), { [P.datos.fecha]: P.datos.edicion }), { avisar: S.cfg().avisoEmitir, recordar: S.cfg().recordatorio });
    if (!r.ok.length) throw new Error(r.mal.join(" · ") || "No salió ninguna orden.");
    return { txt: `✅ ${r.ok.length === 1 ? "Emitida" : "Emitidas"}: ${r.ok.map((x) => x.numero + " · " + x.obra).join(" · ")}.` + (r.mal.length ? ` ⚠ No salieron: ${r.mal.join(" · ")}` : ""), antes: null, despues: r.ok.map((x) => ({ numero: x.numero, obra: x.obra, gente: x.gente })), ref: r.ok.map((x) => x.id).join(",") };
  };
  // rendimientos: el asistente propone el valor y, con el Sí, se guarda en Ajustes de la sugerida
  H.proponer_rendimiento = (a) => {
    if (!puedeAcciones()) return SIN_ACC;
    if (!edita("produccion")) return { err: "Tu usuario no puede cambiar los ajustes de la orden sugerida (lo hace quien edita Producción)." };
    const S = SUG(); if (!S) return { err: "No está la orden sugerida." };
    const r = tareaDe(a.tarea || ""); if (r.err) return { err: r.err };
    const v = num(a.por_dia); if (!(v > 0)) return { err: "Falta el valor por día (con 2 personas)." };
    const fila = (S.estudio() || []).find((x) => x.k === r.t.id) || {}, R = (S.cfg().rend || {})[r.t.id] || {};
    const P = nuevaProp("rendimiento", { titulo: "📈 Cambiar un rendimiento", sub: r.t.label, filas: [{ c: "Por día con 2 personas", a: R.mano ? fN(R.mano) + " (a mano)" : fila.angel || (fila.diccPorDia2 != null ? fN(fila.diccPorDia2) + " (diccionario)" : "—"), d: fN(v) }], k: r.t.id, porDia: v, motivo: String(a.motivo || ""), coleccion: "configEquipo", doc: "baremo", pie: "Se guarda en Ajustes de la orden sugerida («A mano») para todo el equipo. Se cambia cuando quieras." });
    return pendiente(P);
  };
  GUARDAR.rendimiento = async (P) => {
    const S = SUG(); const antes = ((S.cfg().rend || {})[P.datos.k]) || null;
    await S.guardarRend(P.datos.k, P.datos.porDia, P.datos.motivo);
    return { txt: `✅ Guardado: ${P.datos.sub} → ${fN(P.datos.porDia)} por día con 2.`, antes, despues: { modo: "mano", mano: P.datos.porDia }, ref: "configEquipo/baremo.sugerida.rend." + P.datos.k };
  };
  TOOLS.push({ name: "ordenes_sugeridas", description: "Lee la ORDEN SUGERIDA que arma la app (sin IA) para un día: por obra, gente, vehículos, tareas con cantidad, columnas, el porqué, avisos, puntos estimados por persona, jornada, quién queda sin orden y quién está ausente. NO cambia nada. Usala para «armame las órdenes de mañana», «¿qué órdenes hay para el jueves?» o para revisarlas. No recalcules: lo que dice es lo que calcula la app.", input_schema: S({ fecha: TXT("mañana, AAAA-MM-DD o DD/MM (opcional: si no, el próximo día hábil)") }, []) });
  TOOLS.push({ name: "proponer_ordenes_sugeridas", description: "PROPONE cambios sobre la orden sugerida de un día y emitir las órdenes (NO emite). Los cambios se aplican con las mismas funciones que los botones de la hoja y la app recalcula jornada y puntos. La app muestra una tarjeta antes → después con «Sí, emitir las N» / «Abrir la hoja» / «No». Sin cambios = emitir la sugerida tal cual.", input_schema: S({ fecha: TXT("mañana, AAAA-MM-DD o DD/MM"), cambios: { type: "array", items: S({ tipo: { type: "string", enum: ["sacar_persona", "sumar_persona", "cantidad", "sacar_tarea", "sumar_tarea", "incluir_obra", "excluir_obra", "vehiculo"] }, obra: TXT("nombre de la obra (como en la sugerida)"), persona: TXT("nombre de la nómina"), tarea: TXT("tarea del catálogo"), cantidad: { type: "number" }, vehiculo: TXT("nombre o patente (varios separados por coma)") }, ["tipo", "obra"]) }, motivo: TXT("por qué, corto (opcional)") }, []) });
  TOOLS.push({ name: "proponer_rendimiento", description: "PROPONE cambiar el rendimiento que usa la orden sugerida para una tarea (por día con 2 personas). NO lo guarda: la app muestra una tarjeta y con «Sí» lo guarda en Ajustes.", input_schema: S({ tarea: TXT("tarea del catálogo"), por_dia: { type: "number", description: "unidades por día con 2 personas" }, motivo: TXT("por qué, con los datos medidos") }, ["tarea", "por_dia"]) });
  ACCIONES.push("proponer_ordenes_sugeridas", "proponer_rendimiento");
  Object.assign(ESTADOS, { ordenes_sugeridas: "📋 Mirando la orden sugerida…", proponer_ordenes_sugeridas: "📝 Preparando las órdenes…", proponer_rendimiento: "📝 Preparando el cambio…" });
  Object.assign(MIRO, { ordenes_sugeridas: ["Órdenes", "Sugerida"] });
  if (!CHIPS.some((c) => /Órdenes de mañana/.test(c[0]))) CHIPS.push(["📋 Órdenes de mañana", "Armame las órdenes de mañana.", true]);   // al final: los atajos de antes no cambian de lugar
  // «✨ Revisar con el asistente»: UN pedido corto, con la sugerida ya armada adentro (no se rearma ni se emite sin Sí)
  async function revisarSugerida(f) {
    const r = H.ordenes_sugeridas({ fecha: f }); if (r.err) { agregarBurbuja("mal", r.err); return r.err; }
    const txt = "Revisá la orden sugerida que armó la app para el " + fLarga(r.r.fecha) + " (datos abajo, ya calculados: no los recalcules ni la rearmes). Fijate si algo no está bien: orden de las tareas, gente de más o de menos, falta material, obra trabada, fraguado, alguien con muchos puntos y otros con pocos. Si hace falta, proponé los cambios con UNA sola proponer_ordenes_sugeridas. Si no ves nada raro, contestá solo «Está bien así». Corto.\n[Orden sugerida]\n" + JSON.stringify(r.r);
    return enviar(txt, false, { burbuja: "✨ Revisá las órdenes sugeridas del " + fLarga(r.r.fecha), effort: nivelRol() === "admin" ? "medium" : "low", tipo: "pregunta" });
  }
  // «✨ Informe del asistente» de 🧠 Lo que aprende la app: el resumen de tiempos (sin plata, ya agregado)
  async function informeRendimientos() {
    const S = SUG(); if (!S) return "";
    const datos = (S.estudio() || []).map((x) => ({ tarea: x.tarea, k: x.k, unidad: x.un, segunAngel: x.angel, diccionarioPorDia2: x.diccPorDia2, medidoPorDia2: x.medidoPorDia2, datos: x.datos, diferenciaPct: x.dif, porPersonas: x.porPersonas, porCuadrilla: x.porCuadrilla }));
    const txt = "Hacé un informe CORTO para Ángel con los tiempos medidos de cada tarea (por día con 2 personas; abajo, ya agregados, sin plata): qué tareas tardan más de lo esperado, qué cuadrilla rinde más y qué valor conviene usar en la orden sugerida. Con menos de 3 datos decí que son pocos. Si conviene cambiar un valor, proponelo con proponer_rendimiento (uno por tarea, solo si los datos alcanzan).\n[Tiempos]\n" + JSON.stringify(datos);
    return enviar(txt, false, { burbuja: "✨ Informe de rendimientos (lo que aprende la app)", effort: nivelRol() === "admin" ? "medium" : "low", tipo: "pregunta" });
  }
