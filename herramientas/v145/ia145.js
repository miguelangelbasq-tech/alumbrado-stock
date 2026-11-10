  // ---------- v145 · certificación mensual (solo lectura, tiene plata: solo admin y oficina por alcance()) y material real
  //  (el asistente propone; con «Sí» solo se ANOTA la sugerencia para Ángel en configEquipo/baremo.aprendeMaterial)
  const CM = () => window.__certMensual || null, MA = () => window.__matAvance || null;
  H.certificacion = (a) => {
    const C = CM(); if (!C) return { err: "La certificación no está en esta versión." };
    if (!C.puedePlata()) return { err: NO_VE };
    const m = String((a && a.mes) || "").trim(), M = /^\d{4}-\d\d$/.test(m) ? m : "";
    const R = C.armar(M || undefined), mod = R.modulo;
    return { r: { mes: R.M, mesTexto: R.txt, cerrado: R.cerrado ? { el: new Date(R.cerrado.ts).toISOString().slice(0, 10), por: R.cerrado.por || "" } : null, zona: R.zona ? R.zona.label : "", moduloSinIva: mod,
      modulosMes: Math.round(R.kMes * 100) / 100, modulosProvisiones: Math.round(R.kProv * 100) / 100, totalSinIva: Math.round(R.sinIva * 100) / 100, totalConIva: Math.round(R.conIva * 100) / 100, acumuladoZonaPct: R.pctAcum == null ? null : Math.round(R.pctAcum * 100) / 100,
      obras: R.lista.filter((x) => x.filas.some((f) => f.mes > 1e-6)).map((x) => ({ obra: x.nombre, ID: x.ID, modulosMes: Math.round((x.kMes + x.kMesProv) * 100) / 100, items: x.filas.filter((f) => f.mes > 1e-6).map((f) => ({ item: f.id, desc: f.desc, k: f.k, anterior: f.ant, mes: f.mes, acumulado: f.acum, contratado: f.cant, provision: f.prov, ordenes: f.ots })) })),
      paraRevisar: R.revisar.map((r) => r.t + ": " + r.s), nota: "Lo arma la app: el avance de las órdenes cerradas con la fecha de la orden. Lo cargado a mano sin fecha no entra (está en paraRevisar). No recalcules." } };
  };
  H.proponer_aprende_material = (a) => {
    if (!puedeAcciones()) return SIN_ACC;
    if (!edita("produccion")) return { err: "Tu usuario no puede anotar sugerencias (lo hace quien edita Producción)." };
    const X = MA(); if (!X) return { err: "No está «Lo que aprende la app» en esta versión." };
    const cod = String((a && a.codigo) || "").trim(), A = X.aprende(), fila = A.filas.find((x) => String(x.codigo) === cod && (!a.tipo || String(x.tipo).toLowerCase() === String(a.tipo).toLowerCase())) || A.filas.find((x) => String(x.codigo) === cod) || null;
    const texto = String((a && a.sugerencia) || "").trim(); if (!texto) return { err: "Falta la sugerencia (en una línea)." };
    const P = nuevaProp("aprendeMaterial", { titulo: "📝 Anotar para Ángel", sub: fila ? `${fila.desc} (${fila.codigo}) · ${fila.tipo}` : cod, filas: [{ c: fila ? "Por " + fila.por : "Sugerencia", a: fila ? X.frase(fila) : "—", d: texto }], codigo: cod, material: fila ? fila.desc : cod, tipo: fila ? fila.tipo : String(a.tipo || ""), texto, datos: fila ? { calc: fila.calcPor, real: fila.realPor, obras: fila.n, por: fila.por } : null, coleccion: "configEquipo", doc: "baremo", pie: "Solo se ANOTA para Ángel en 🧠 Lo que aprende la app. No cambia la Calculadora ni sus reglas." });
    return pendiente(P);
  };
  GUARDAR.aprendeMaterial = async (P) => {
    const d = P.datos, n = await MA().anotar({ codigo: d.codigo, material: d.material, tipo: d.tipo, texto: d.texto, datos: d.datos, porAsistente: true });
    return { txt: `📝 Anotado para Ángel: ${d.material} · ${d.texto}`, antes: null, despues: n, ref: "configEquipo/baremo.aprendeMaterial.sugerencias" };
  };
  TOOLS.push({ name: "certificacion", description: "La CERTIFICACIÓN MENSUAL que arma la app (solo lectura): por obra de nuestra zona, ítem por ítem, cantidad del mes, acumulado anterior y total contra lo contratado, K × módulo, total sin IVA y con IVA, provisiones aparte, si el mes está cerrado y lo que hay para revisar (ítems sin fecha, hechas de más, cargado después del cierre). Usala para «¿cuánto certificamos este mes?» o para revisar el certificado.", input_schema: S({ mes: TXT("AAAA-MM (opcional: si no, el mes actual)") }, []) });
  TOOLS.push({ name: "proponer_aprende_material", description: "PROPONE ANOTAR para Ángel una sugerencia sobre el material real por columna / metro / tablero (de 🧠 Lo que aprende la app › 📦 Material). NO cambia la Calculadora ni sus reglas: con «Sí» solo queda anotado. Una por material.", input_schema: S({ codigo: TXT("código del pañol (4 dígitos)"), tipo: TXT("tipo de obra (PRFV 7 m, Metálica 7 m…)"), sugerencia: TXT("en una línea, con los datos: «la calculadora pone 1 m por columna; lo real fue 1,3 (5 obras): revisar»") }, ["codigo", "sugerencia"]) });
  ACCIONES.push("proponer_aprende_material");
  Object.assign(ESTADOS, { certificacion: "📑 Mirando la certificación…", proponer_aprende_material: "📝 Preparando la nota…" });
  Object.assign(MIRO, { certificacion: ["Certificación"] });
  async function informeMaterial() {
    const X = MA(); if (!X) return "";
    const A = X.aprende(), datos = A.filas.slice(0, 40).map((x) => ({ codigo: x.codigo, material: x.desc, unidad: x.un, tipoObra: x.tipo, por: x.por, calculadoraPone: x.calcPor, real: x.realPor, obras: x.n, diferenciaPct: x.difPct }));
    const txt = "Hacé un informe CORTO para Ángel con el material REAL por columna / metro de zanja / tablero y por tipo de obra (abajo, ya calculado por la app con las obras terminadas o al 90 %, sin plata): qué materiales se usan bastante más o menos que lo que pone la Calculadora. Con menos de 3 obras decí que son pocos datos. Si conviene revisar un valor, proponé ANOTARLO para Ángel con proponer_aprende_material (uno por material, solo si los datos alcanzan). No cambies la Calculadora ni sus reglas.\n[Material real]\n" + JSON.stringify({ obras: A.obras, filas: datos });
    return enviar(txt, false, { burbuja: "✨ Informe del material real (lo que aprende la app)", effort: nivelRol() === "admin" ? "medium" : "low", tipo: "pregunta" });
  }
