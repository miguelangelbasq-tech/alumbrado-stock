  // =====================================================================================================================
  // v141 · El asistente por rol (pedido de Ángel, 10/11/2026: «qué puede ver cada uno» y «que los 100 USD alcancen el mes»).
  //  · alcance(): el filtro está ACÁ, en la app, no en el texto para el modelo:
  //      (a) qué herramientas recibe el modelo según el rol (lista cerrada por rol);
  //      (b) cada resultado de herramienta se limpia ANTES de mandarlo: sin campos de plata (valor hora, sueldos, costos,
  //          precios, importes, gastos, valor del punto, K y módulo, ganancia) y, en la cuadrilla, sin datos de otras personas.
  //    admin y oficina: todo, como hasta la v140 (oficina también ve sueldos y valor hora; lo que es solo de admin sigue igual).
  //    pañol: pañol completo (con precios de materiales) y las obras en general; sin plata de personas ni del itemizado.
  //    cuadrilla / operario: solo lo suyo (sus órdenes, sus obras, sus puntos), cómo se hace y el stock sin precios.
  //    solo mirar: preguntas generales (cómo se hace, materiales, normas) y el avance general de las obras.
  //  · Modelo por rol: pañol, cuadrilla, operario y mirar van con Sonnet 5.5 y effort «low» (gastan menos).
  //  · Los topes los controla el Worker (v3-ia): acá solo se muestran («Te quedan N preguntas hoy», cartel de tope).
  // =====================================================================================================================
  const NO_VE = "Eso no lo puedo ver con tu usuario, preguntale a la oficina.";
  const NIV = { admin: "admin", oficina: "oficina", panol: "panol", cuadrilla: "crew", operario: "crew", mirar: "mirar" };
  function nivelRol() {
    if (window.__iaNivelForzar) return window.__iaNivelForzar;   // pruebas
    const y = yo(); let n = NIV[String(y.rol || "")] || "mirar";
    try { if (n !== "admin" && n !== "oficina" && window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()) n = "crew"; } catch (e) { }
    return n;
  }
  // herramientas por rol (lista cerrada). admin y oficina: todas.
  const TOOLS_ROL = {
    panol: ["buscar_obra", "datos_obra", "ubicacion_obra", "stock", "consultar", "describir_datos", "historial_calculos", "abrir", "armar_pdf", "como_se_hace", "proponer_movimiento_panol", "proponer_editar"],
    crew: ["buscar_obra", "datos_obra", "ubicacion_obra", "ordenes", "stock", "puntos", "ver_plano", "como_se_hace", "abrir"],
    mirar: ["buscar_obra", "datos_obra", "ubicacion_obra", "como_se_hace", "abrir"]
  };
  const DATOS_ROL = { panol: ["obras", "catalogo", "movimientos", "reservas", "herramientas", "herramientasMov", "calculos"] };
  const PDF_ROL = { panol: ["stock", "compras", "comprobante", "reserva"] };
  const EDITA_ROL = { panol: ["catalogo", "movimientos", "reservas", "herramientas"] };
  // campos prohibidos (se sacan a cualquier profundidad)
  const R_PERS = /^(valorHora|valorHH|valorHoraHombre|sueldo\w*|salario\w*|jornal\w*|valorPunto|valorDelPunto|premio\w*|pago\w*|saldo\w*|liquidaci\w*|cobr\w*)$/i;
  const R_OBRA = /^(k|kItem|coef\w*|modulo|valorModulo|precioItem\w*|precioModulo|precioOferta|importe\w*|monto\w*|ganancia\w*|gasto\w*|valoriz\w*|certific\w*|costoTotal|presupuest\w*|plata|\w+Pesos)$/i;
  const R_MAT = /^(costo\w*|precio\w*|moneda|iva|ivaPct|cotizacion|valorStock|valor|valores|subtotal|total\$)$/i;
  const R_AJENO = /^(disp|celular|telefono|tel|bateria|dni|cuil|cuit|legajo|presencia|ubicacionVivo|uvPersona)$/i;
  const MIRAR_OBRA = ["obraId", "nombre", "ID", "tipo", "barrio", "avancePct", "direccion", "lat", "lng", "situacion", "columnas", "candidatos"];
  function podar(x, re, cuenta, prof) {
    prof = prof || 0;
    if (x == null || typeof x != "object" || prof > 12) return x;
    if (Array.isArray(x)) return x.map((y) => podar(y, re, cuenta, prof + 1));
    const o = {};
    Object.keys(x).forEach((k) => { if (re.some((r) => r.test(k))) { cuenta.n++; return; } o[k] = podar(x[k], re, cuenta, prof + 1); });
    return o;
  }
  // mis órdenes / mis obras (cuadrilla): por personaClave, como Mis tareas (en modo liviano la app ya tiene solo las suyas)
  function miClave() { const y = yo(); return claveDe(y.personaClave || y.persona || ""); }
  function miNombre() { const y = yo(); return String(y.persona || y.nombre || "").trim(); }
  function esMia(o) { const c = miClave(); if (!c || !o) return false; return (o.personalNombres || []).map(claveDe).indexOf(c) >= 0 || nombresOt(o).map(claveDe).indexOf(c) >= 0; }
  function misObras() { const s = {}; ots().filter(esMia).forEach((o) => { if (o.plazaId) s[String(o.plazaId)] = 1; }); return s; }
  function alcance() {
    const n = nivelRol(), lista = TOOLS_ROL[n] || null;
    const re = n === "panol" ? [R_PERS, R_OBRA] : n === "crew" ? [R_PERS, R_OBRA, R_MAT, R_AJENO] : n === "mirar" ? [R_PERS, R_OBRA, R_MAT, R_AJENO] : [];
    return {
      n, todo: !lista,
      permite: (t) => !lista || lista.indexOf(t) >= 0,
      tools: (l) => (lista ? l.filter((t) => lista.indexOf(t.name) >= 0).map((t) => {
        if (t.name === "consultar" && DATOS_ROL[n]) return Object.assign({}, t, { input_schema: Object.assign({}, t.input_schema, { properties: Object.assign({}, t.input_schema.properties, { coleccion: { type: "string", enum: DATOS_ROL[n] } }) }) });
        if (t.name === "armar_pdf" && PDF_ROL[n]) return Object.assign({}, t, { description: "Arma un PDF con el formato de la app y le abre a la persona la hoja con Imprimir / Compartir / Bajar. NO cambia datos. Con este usuario: stock (ref = palabras o código), compras (lista de compras), comprobante (ref = S-…, E-…, D-…) o reserva (ref = R-…)." });
        return t;
      }) : l),
      re
    };
  }
  // la parte del system que dice qué no puede ver (no cambia durante la charla: el rol no cambia)
  const SIS_ROL = {
    panol: "Te habla alguien del PAÑOL. Podés ver: el pañol completo (stock, movimientos, reservas, herramientas, remitos y PRECIOS DE MATERIALES) y los datos generales de las obras. NO podés ver: sueldos, valor hora, la nómina con plata, puntos de otras personas, gastos, ganancia ni precios o K del itemizado. Solo proponés movimientos y cambios del pañol.",
    crew: "Te habla alguien de la CUADRILLA (personal de obra). Solo podés ver LO SUYO: sus órdenes y tareas, cómo se hace (como_se_hace: guías, tipos constructivos, normas), los planos y la ubicación de SUS obras, el stock del pañol SIN precios ni costos y sus propios puntos. NO podés ver: plata (sueldos, valor hora, precios, costos, gastos, valor del punto), datos de otras personas, ubicaciones de personas, celulares ni puntos de otros. No hacés cambios.",
    mirar: "Te habla un usuario de SOLO MIRAR. Contestás preguntas generales: cómo se hace (como_se_hace), qué es un material, normas, y el avance general de las obras (%, etapa, ubicación). NO podés ver: plata, datos de personas, el pañol (stock y movimientos) ni órdenes con nombres. No hacés cambios."
  };
  function sistemaRol() {
    const n = nivelRol(); if (!SIS_ROL[n]) return "";
    return "[Lo que ve este usuario — lo controla la app]\n" + SIS_ROL[n] + "\nSi te pregunta algo que no podés ver, contestá exactamente: «" + NO_VE + "» No lo inventes, no lo estimes y no digas de dónde sacarlo. Las herramientas ya vienen recortadas para este usuario: si una dice que no se puede, es eso.";
  }
  // ---------- cómo se hace: guías «Cómo se hace» (GUIAS_OBRA) y Normas y tipos constructivos (NORMAS_FICHAS), lo que la app trae
  const sinHtml = (s) => String(s == null ? "" : s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  H.como_se_hace = (a) => {
    const q = nk(a.texto || "").split(" ").filter((w) => w.length > 2 && VACIAS.indexOf(w) < 0);
    const G = (window.GUIAS_OBRA || []).filter((g) => g && g.titulo).map((g) => ({ fuente: "Guía «Cómo se hace»", id: g.id || "", titulo: g.titulo, resumen: sinHtml(g.resumen), riesgo: g.riesgo || "", antes: g.antes ? { epp: sinHtml(g.antes.epp), herramientas: sinHtml(g.antes.herramientas), autorizacion: sinHtml(g.antes.autorizacion), materiales: (g.antes.materiales || []).map((m) => (Array.isArray(m) ? m.map(sinHtml).join(" — ") : sinHtml(m))) } : null, pasos: (g.pasos || []).map((p, i) => (i + 1) + ". " + sinHtml(p.t) + ": " + sinHtml((p.txt || []).join(" "))), control: sinHtml(g.control), normas: g.normas || [], aConfirmar: g.pendientes || [] }));
    const N = (window.NORMAS_FICHAS || []).filter((f) => f && (f.tit || f.id)).map((f) => ({ fuente: f.tipo === "plano" ? "Plano tipo (Normas)" : f.tipo === "norma" ? "Norma" : f.tipo === "glosario" ? "Glosario" : "Criterio", id: f.id || "", titulo: sinHtml(f.tit), grupo: f.grupo || "", de: sinHtml(f.fuente), que: sinHtml(f.que), datos: (f.datos || []).map(sinHtml).slice(0, 20) }));
    const pts = (x) => { const s = nk(JSON.stringify(x)), t = nk(x.titulo + " " + x.id); let p = 0; q.forEach((w) => { if (t.indexOf(w) >= 0) p += 3; else if (s.indexOf(w) >= 0) p += 1; }); return p; };
    const l = G.concat(N).map((x) => ({ x, p: pts(x) })).filter((y) => y.p > 0).sort((u, v) => v.p - u.p).slice(0, 4).map((y) => y.x);
    if (!l.length) return { r: { encontrados: 0, nota: "No hay guía ni ficha de Normas sobre eso en la app. Si contestás, aclaralo y lo técnico va «a confirmar».", guias: G.map((g) => g.titulo), normas: N.length } };
    let r = { encontrados: l.length, resultados: l, nota: "Contestá con lo que dice la guía o la ficha; lo que no está, «a confirmar». En la app: menú › Guías o Normas." };
    if (tam(r) > 28000) r = { encontrados: l.length, resultados: l.map((x) => Object.assign({}, x, { pasos: (x.pasos || []).map((p) => p.slice(0, 260)), datos: (x.datos || []).slice(0, 8) })), nota: r.nota };
    return { r };
  };
  TOOLS.push({ name: "como_se_hace", description: "Busca en las guías «Cómo se hace» de la app (paso a paso, EPP, herramientas, materiales con código, control y normas) y en Normas y tipos constructivos (planos AP-…, normas, glosario, criterios). Usala para «¿cómo se hace…?», «¿qué es…?», «¿qué norma…?», «¿qué lleva…?». Contestá con lo que dice; lo que no está va «a confirmar».", input_schema: S({ texto: TXT("lo que quiere saber, ej. «puesta a tierra», «caja de columna PRFV», «AP-TC-001»") }, ["texto"]) });
  Object.assign(ESTADOS, { como_se_hace: "📘 Buscando en las guías…" });
  Object.assign(MIRO, { como_se_hace: ["Guías"] });

  // ---------- cada herramienta pasa por el alcance del rol (antes y después)
  async function ejecutar(nombre, entrada) {
    const A = alcance(); entrada = entrada || {};
    if (!A.permite(nombre)) return { err: NO_VE };
    if (A.todo) return ejecutarBase(nombre, entrada);
    if (nombre === "consultar" && DATOS_ROL[A.n] && DATOS_ROL[A.n].indexOf(String(entrada.coleccion || "")) < 0) return { err: NO_VE };
    if (nombre === "armar_pdf" && PDF_ROL[A.n] && PDF_ROL[A.n].indexOf(String(entrada.tipo || "")) < 0) return { err: NO_VE };
    if (nombre === "proponer_editar" && EDITA_ROL[A.n] && EDITA_ROL[A.n].indexOf(String(entrada.coleccion || "")) < 0) return { err: NO_VE };
    let out;
    if (A.n === "crew") {
      if (nombre === "datos_obra" || nombre === "ubicacion_obra" || nombre === "ver_plano") {
        const x = resolverObra(entrada.obraId); if (x.err) return { err: x.err, r: x.candidatos ? { candidatos: x.candidatos } : null };
        if (!misObras()[String(x.obra.id)]) return { err: NO_VE + " (Solo veo las obras de tus órdenes.)" };
      }
      if (nombre === "ordenes") {
        const mn = miNombre(); if (!miClave()) return { err: "Tu usuario no está vinculado a una persona de la nómina: pedíselo a la oficina." };
        out = await ejecutarBase("ordenes", Object.assign({}, entrada, { persona: mn || entrada.persona }));
        if (out && out.r && Array.isArray(out.r.ordenes)) {
          const mias = {}; ots().filter(esMia).forEach((o) => { mias[o.id] = 1; });
          const l = out.r.ordenes.filter((o) => mias[o.otId]).map((o) => { const g = Array.isArray(o.gente) ? o.gente.length : 0; const z = Object.assign({}, o); delete z.gente; z.conVos = g > 1 ? "vos y " + (g - 1) + " más" : "vos"; return z; });
          out = { r: { total: l.length, mostradas: l.length, ordenes: l } };
        }
      } else if (nombre === "puntos") {
        const Q = window.__quincenas; if (!Q || !Q.calcular) return { err: "La cuenta de puntos todavía no está lista en la app." };
        let q = Q.qDe(hoy()); const p = nk(entrada.periodo || "actual");
        if (p === "anterior") q = Q.qMover(q, -1); else { const m = String(entrada.periodo || "").match(/^(\d{4})-(\d{1,2})-([12])$/); if (m) q = { y: +m[1], m: +m[2], n: +m[3] }; }
        const i = Q.qInfo(q), c = Q.calcular(i.desde, i.hasta), c0 = miClave();
        const yoP = (c.personas || []).find((x) => claveDe(x.nombre) === c0);
        out = { r: { quincena: i.label, desde: i.desde, hasta: i.hasta, tusPuntos: yoP ? yoP.pts : 0, dias: yoP ? yoP.dias : 0, ordenesCerradas: yoP ? (yoP.ordenes || []).length : 0, nota: "Solo los puntos de esta persona (de órdenes cerradas)." } };
      }
    }
    if (!out) out = await ejecutarBase(nombre, entrada);
    if (!out) return out;
    // limpiar lo que va al modelo
    const cu = { n: 0 };
    if (out.r != null && A.re.length) out.r = podar(out.r, A.re, cu);
    if (A.n === "mirar" && (nombre === "datos_obra") && out.r && typeof out.r == "object") { const z = {}; MIRAR_OBRA.forEach((k) => { if (k in out.r) z[k] = out.r[k]; }); if (Object.keys(out.r).length > Object.keys(z).length) cu.n++; out.r = z; }
    if (cu.n && out.r && typeof out.r == "object" && !Array.isArray(out.r)) out.r._oculto = "Sin plata ni datos de otras personas: con este usuario no se ven.";
    return out;
  }

  // ---------- modelo por rol: pañol, cuadrilla, operario y mirar → Sonnet 5.5 con effort «low»
  const rolBarato = () => !window.__iaCompat && ["panol", "crew", "mirar"].indexOf(nivelRol()) >= 0;

  // ---------- «Te quedan N preguntas hoy» y el cartel de tope
  function pintarQueda() {
    const el = $("iaQueda"); if (!el) return;
    const U = window.__iaUso, t = U && U.quedaTexto ? U.quedaTexto() : "";
    el.hidden = !t; el.textContent = t;
    el.classList.toggle("ia-queda-0", !!(U && U.agotado && U.agotado()));
  }
  document.addEventListener("ia-uso", pintarQueda);
  const TOPE_TIT = { tope_dia: "Por hoy, listo", tope_remitos: "Por hoy, listo", tope_mes: "Asistente en pausa", rol_apagado: "Asistente apagado", usuario: "Usuario sin habilitar" };
  function cartelTope(tipo, msg) {
    const pie = tipo === "tope_mes" ? "Mientras tanto, todo lo de la app anda igual." : tipo === "rol_apagado" || tipo === "usuario" ? "Lo prende Administración." : "Mientras tanto, lo encontrás en la app como siempre.";
    return `<div class="ia-tope" role="status"><div class="ia-tope-ic" aria-hidden="true">⏸</div><div class="ia-tope-tx"><b>${esc(TOPE_TIT[tipo] || "Asistente en pausa")}</b><p>${esc(msg)}</p><small>${esc(pie)}</small></div></div>`;
  }
  // Worker viejo (sin topes): se avisa una vez en este aparato (solo a quien lo puede arreglar)
  function avisoWorkerV3(ema) {
    if (window.__iaCompat || !ema || ema.version === "v3-ia") return;
    const n = nivelRol(); if (n !== "admin" && n !== "oficina") return;
    let ya = false; try { ya = localStorage.getItem("ema.ia.avisoWorker3") === "1"; localStorage.setItem("ema.ia.avisoWorker3", "1"); } catch (e) { }
    if (!ya) agregarBurbuja("nota", "ℹ El Worker del asistente todavía es el de antes: los topes por persona y el freno del mes recién andan cuando se pegue el nuevo (v141, ver instructivo). El asistente funciona igual.");
  }

  // ---------- ⚙ Límites (solo Administración) y «Gastado este mes» (Administración y Oficina)
  const LROL = [["oficina", "Oficina"], ["panol", "Pañol"], ["cuadrilla", "Cuadrilla"], ["operario", "Operario"], ["mirar", "Solo mirar"]];
  function limitesActuales() {
    const D = window.__iaLimDef ? window.__iaLimDef() : { roles: {}, mes: { tope: 100, pausaPct: 80, cortePct: 95 } };
    const a = ((window.__personalNube || {}).asistente || {}).limites || {}, L = JSON.parse(JSON.stringify(D));
    if (a.roles) Object.keys(L.roles).forEach((r) => { if (a.roles[r]) Object.assign(L.roles[r], a.roles[r]); });
    if (a.mes) Object.assign(L.mes, a.mes);
    return L;
  }
  const usdTx = (n) => "US$ " + (Number(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function cfgGastoHtml() {
    const U = window.__iaUso, t = U && U.textoMes ? U.textoMes() : "";
    return `<div class="ia-gmes" id="iaGastoMes">${t ? esc(t) : "Gastado este mes: lo trae el Worker nuevo (v141)…"}</div>`;
  }
  function cfgLimitesHtml() {
    const L = limitesActuales(), on = window.__iaRoles ? window.__iaRoles() : [];
    const sw = (attr, si, dis) => `<span class="ia-sw"><input type="checkbox" ${attr}${si ? " checked" : ""}${dis ? " disabled" : ""}><span></span></span>`;
    const v = (x) => (x == null ? "" : String(x));
    const filas = LROL.map(([k, tx]) => { const r = L.roles[k] || {}; return `<div class="ia-lim-f"><div class="t">${tx}</div>${sw(`data-iarol="${k}" aria-label="${tx}: asistente prendido"`, on.indexOf(k) >= 0)}<label><span>Preguntas</span><input type="number" inputmode="numeric" min="0" step="1" data-ialim="${k}.preguntas" value="${v(r.preguntas)}" placeholder="sin tope"></label><label><span>Remitos</span><input type="number" inputmode="numeric" min="0" step="1" data-ialim="${k}.remitos" value="${v(r.remitos)}" placeholder="sin tope"></label></div>`; }).join("");
    return `<div class="card" id="iaLimites"><h2>Límites<span class="h2-sub">Por persona y por día (preguntas y remitos se cuentan aparte; un remito de varias hojas es 1). Vacío = sin tope. Los controla el Worker: los cambios llegan en hasta 10 minutos.</span></h2>
<div class="ia-lim-f ia-lim-adm"><div class="t">Administración<small>Siempre prendido y sin tope</small></div>${sw('aria-label="Administración"', true, true)}<label><span>Preguntas</span><input type="text" value="sin tope" disabled></label><label><span>Remitos</span><input type="text" value="sin tope" disabled></label></div>
${filas}
<h3 class="ia-lim-h">Freno del mes</h3>
<div class="ia-lim-mes"><label><span>Tope del mes (US$)</span><input type="number" inputmode="decimal" min="1" step="1" data-ialim="mes.tope" value="${v(L.mes.tope)}"></label><label><span>Pausa al (%)</span><input type="number" inputmode="numeric" min="1" max="100" data-ialim="mes.pausaPct" value="${v(L.mes.pausaPct)}"></label><label><span>Corte al (%)</span><input type="number" inputmode="numeric" min="1" max="100" data-ialim="mes.cortePct" value="${v(L.mes.cortePct)}"></label></div>
<div class="hint" id="iaLimFreno">${esc(frenoTxt(L))}</div>
<button type="button" class="btn-primary ancho" data-ia="cfgguardar">Guardar límites</button><div class="hint" id="iaCfgMsg"></div>
<h3 class="ia-lim-h">Por persona</h3><div id="iaLimPers" class="ia-lim-pers"><div class="hint">Cargando lo que lleva cada uno…</div></div></div>`;
  }
  function frenoTxt(L) {
    const t = Number(L.mes.tope) || 0, p = Number(L.mes.pausaPct) || 0, c = Number(L.mes.cortePct) || 0;
    return `A los ${usdTx(t * p / 100)} se pausan Pañol, Cuadrilla, Operario y Solo mirar (y te llega un aviso); a los ${usdTx(t * c / 100)} se corta para todos menos Administración. El día 1 empieza de cero.`;
  }
  function pintarPersonas(j) {
    const el = $("iaLimPers"); if (!el) return;
    if (!j || !j.ok) { el.innerHTML = `<div class="hint">${j && j.error ? esc(j.error.mensaje || "") : "No se pudo traer el detalle (hace falta el Worker nuevo, v141, y señal)."}</div>`; return; }
    const l = j.personas || [];
    if (!l.length) { el.innerHTML = '<div class="hint">Todavía nadie lo usó este mes.</div>'; return; }
    const tp = (n, t) => (t == null ? fN(n) : fN(n) + " de " + fN(t));
    el.innerHTML = `<table class="ia-lim-t tabla-tarjetas"><thead><tr><th>Persona</th><th>Hoy</th><th>Mes</th><th>US$</th></tr></thead><tbody>${l.map((p) => `<tr><td data-label="Persona"><b>${esc(p.nombre || "—")}</b><small>${esc(p.rolTxt || p.rol || "")}</small></td><td data-label="Hoy">${tp(p.hoy.preguntas, p.topes && p.topes.preguntas)} preg.${p.hoy.remitos || (p.topes && p.topes.remitos) ? " · " + tp(p.hoy.remitos, p.topes && p.topes.remitos) + " rem." : ""}</td><td data-label="Mes">${fN(p.mes.preguntas)} preg.${p.mes.remitos ? " · " + fN(p.mes.remitos) + " rem." : ""}</td><td data-label="US$">${esc(usdTx(p.mes.usd).replace("US$ ", ""))}</td></tr>`).join("")}</tbody></table>`;
  }
  function refrescarGasto() {
    const U = window.__iaUso; if (!U || !U.uso) return;
    U.uso(true).then((j) => { const g = $("iaGastoMes"); if (g && U.textoMes()) g.textContent = U.textoMes(); pintarPersonas(j); }).catch(() => pintarPersonas(null));
  }
  function leerLimites() {
    const q = (s) => document.querySelector('#iaCfg [data-ialim="' + s + '"]');
    const n = (s, ent) => { const el = q(s); if (!el) return undefined; const t = String(el.value || "").trim().replace(",", "."); if (t === "") return null; const x = Number(t); return isFinite(x) && x >= 0 ? (ent ? Math.floor(x) : Math.round(x * 100) / 100) : NaN; };
    const roles = {}; let mal = "";
    LROL.forEach(([k, tx]) => { const a = n(k + ".preguntas", 1), b = n(k + ".remitos", 1); if (Number.isNaN(a) || Number.isNaN(b)) mal = mal || "Revisá los números de " + tx + "."; roles[k] = { preguntas: a, remitos: b }; });
    const mes = { tope: n("mes.tope"), pausaPct: n("mes.pausaPct", 1), cortePct: n("mes.cortePct", 1) };
    if (!(mes.tope > 0)) mal = mal || "El tope del mes tiene que ser mayor que cero.";
    if (!(mes.pausaPct > 0 && mes.cortePct > 0 && mes.pausaPct <= mes.cortePct && mes.cortePct <= 100)) mal = mal || "La pausa tiene que ser menor o igual que el corte, y el corte 100 % o menos.";
    return { roles, mes, mal };
  }
  async function guardarLimites() {
    const m = $("iaCfgMsg"), L = leerLimites();
    if (L.mal) { if (m) m.textContent = "⚠ " + L.mal; return; }
    const roles = ["admin"].concat([].slice.call(document.querySelectorAll("#iaCfg [data-iarol]:checked")).map((x) => x.dataset.iarol));
    const limites = { roles: L.roles, mes: L.mes };
    const cur = Object.assign({}, (window.__personalNube || {}).asistente || {});
    try {
      await firebase.firestore().collection("configEquipo").doc("personal").set({ asistente: Object.assign(cur, { roles, limites, tsLimites: Date.now(), porLimites: String((window.__fbUser || {}).email || "") }) }, { merge: true });
      window.__personalNube = Object.assign({}, window.__personalNube || {}, { asistente: Object.assign({}, cur) });
      auditar("asistente_limites", "prendido: " + roles.map((k) => ROL_TXT[k] || k).join(", ") + " · " + LROL.map(([k, tx]) => tx + " " + (L.roles[k].preguntas == null ? "sin tope" : L.roles[k].preguntas) + "/" + (L.roles[k].remitos == null ? "sin tope" : L.roles[k].remitos)).join(", ") + " · mes US$ " + L.mes.tope + " (" + L.mes.pausaPct + "/" + L.mes.cortePct + " %)");
      const f = $("iaLimFreno"); if (f) f.textContent = frenoTxt(limites);
      if (m) m.textContent = "✓ Guardado para todo el equipo. El Worker lo toma en hasta 10 minutos.";
    } catch (e) { if (m) m.textContent = "⚠ No se pudo guardar (" + ((e && e.code) || "sin conexión") + ")."; }
  }
  document.addEventListener("input", (e) => { const t = e.target; if (!t || !t.matches || !t.matches('#iaCfg [data-ialim^="mes."]')) return; const L = leerLimites(); const f = $("iaLimFreno"); if (f && !L.mal) f.textContent = frenoTxt(L); });
  // ---------- ejemplos y atajos del panel según el rol
  const CHIPS_ROL = {
    panol: [["📦 Stock", "¿Cuánto hay de ", false], ["🛒 Lista de compras en PDF", "Armame el PDF de la lista de compras.", true], ["🧾 Movimientos de hoy", "¿Qué movimientos del pañol hubo hoy?", true], ["📍 Ubicación de una obra", "Pasame la ubicación de ", false], ["📘 ¿Cómo se hace…?", "¿Cómo se hace ", false]],
    crew: [["📋 Mis tareas de hoy", "¿Qué tareas tengo hoy?", true], ["📍 ¿Cómo llego a la obra?", "¿Cómo llego a la obra de hoy?", true], ["📘 ¿Cómo se hace…?", "¿Cómo se hace ", false], ["📦 ¿Hay en el pañol?", "¿Cuánto hay en el pañol de ", false], ["⭐ Mis puntos", "¿Cuántos puntos llevo en la quincena?", true]],
    mirar: [["📘 ¿Cómo se hace…?", "¿Cómo se hace ", false], ["📊 Avance de una obra", "¿Cómo viene la obra ", false], ["📍 Ubicación de una obra", "Pasame la ubicación de ", false], ["🔩 ¿Qué es…?", "¿Qué es ", false]]
  };
  function chipsRol() { const l = CHIPS_ROL[nivelRol()]; if (l) CHIPS.splice.apply(CHIPS, [0, CHIPS.length].concat(l)); }
  function ejemplosRol() {
    const n = nivelRol();
    if (n === "crew") return "• <b>«¿qué tengo hoy?»</b><br>• <b>«¿cómo llego a la obra?»</b><br>• <b>«¿cómo se hace la puesta a tierra?»</b><br>• <b>«¿hay jabalinas en el pañol?»</b><br>Con tu usuario te contesto lo tuyo (tus órdenes, tus obras, tus puntos), cómo se hace y el stock, pero no hago cambios.";
    if (n === "mirar") return "• <b>«¿cómo viene la obra San Martín?»</b><br>• <b>«¿qué es una BPN?»</b><br>• <b>«¿cómo se hace la zanja?»</b><br>Con tu usuario te contesto preguntas generales y el avance de las obras, pero no hago cambios.";
    if (n === "panol") return "• <b>«¿cuánto hay de fusible 2 A?»</b><br>• <b>«¿qué falta comprar?»</b><br>• <b>«hacé un vale de 10 jabalinas para San Martín»</b><br>Lo que cambia algo del pañol siempre te lo muestro antes → después y lo hacés vos con «Sí, hacelo».";
    return "";
  }
