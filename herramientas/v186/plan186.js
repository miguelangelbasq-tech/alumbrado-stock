(function () {
  "use strict";
  // v186 · 📋 Itemizado y 📅 Gantt en el menú, y la orden sugerida en Órdenes › «Mañana» (Ángel, 20/11/2026: «El tema del
  // Gantt tiene que estar en un nuevo ítem del menú, como Gantt»; maquetas itemizado.html y ordenes_sugerida.html).
  //  · 📋 Itemizado: por obra y «Todas · nuestra zona»: cada ítem con contratado / hecho / falta. Lo contratado se cambia con ✎,
  //    motivo y «Sí» por el mismo camino del Control del avance (v156: CO.aplicarAjuste si el itemizado está fijado, avanceHist,
  //    auditoría). Lo hecho sale de las órdenes y del avance de obra: acá no se toca (link a Avance de obra). No se tocan los K.
  //  · 📅 Gantt: fechas previstas por obra y por rubro (los del avance de obra nuevo), contra lo real (de las órdenes) y «a este
  //    ritmo», con la línea de hoy y la del fin del contrato. Se guardan en avanceObras/{id}.planGantt (la misma lista de siempre:
  //    cada fecha es una entrada {id, tarea, desde, hasta} con g186 = "obra" o el rubro), así el Supervisor, la programación de
  //    Dirección (la «prevista») y el informe Gantt las leen sin cambios. «Repartir las que no tienen fecha» solo propone.
  //  · Órdenes › «🗓 Mañana»: la orden sugerida de mañana (la misma hoja y el mismo motor de la v143); ya no está en el Inicio.
  //  Admin y oficina editan; Dirección y «solo mirar» miran. Sin reglas nuevas (avanceObras ya lo escriben estos roles).
  //  Pruebas viejas: window.__v186No.
  const V = window.__v135;
  if (window.__v186No || !V) { window.__man186 = { ve: () => false, n: () => 0, html: () => "" }; return; }
  const $ = (id) => document.getElementById(id);
  const esc = V.esc, intentar = V.intentar;
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const arr = (x) => (Array.isArray(x) ? x : []), obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const r1 = (v) => Math.round((+v || 0) * 10) / 10;
  const fN = (v, d) => intentar(() => fmt(+v || 0, d == null ? (Number.isInteger(r1(v)) ? 0 : (Math.abs(v) < 10 ? 2 : 1)) : d), String(v));
  const pad = (n) => String(n).padStart(2, "0");
  const I = () => window.__ini186 || {};
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const ahora = () => num(window.__i186Ahora) || Date.now();
  const hoy = () => iso(new Date(ahora()));
  const dia0 = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0) : null; };
  const dm = (s) => { const d = dia0(s); return d ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : "—"; };
  const dmy = (s) => { const d = dia0(s); return d ? dm(s) + "/" + d.getFullYear() : "—"; };
  const mas = (f, n) => { const d = dia0(f); d.setDate(d.getDate() + n); return iso(d); };
  const dias = (a, b) => Math.round((dia0(b) - dia0(a)) / 864e5);
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const DIASL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const okF = (s) => /^\d{4}-\d\d-\d\d$/.test(String(s || ""));
  const rol = () => intentar(() => V.rol(), "");
  const esDir = () => intentar(() => !!window.__esDireccion(), false);
  const nombre = (o) => (I().nombre ? I().nombre(o) : String((o && o.nombre) || "").toUpperCase());
  const obras = () => V.obras().filter((o) => o && o.id && o.id !== "__sinObra");
  const obraDe = (id) => obras().find((o) => String(o.id) === String(id)) || intentar(() => arr(window.avanceObrasOcultas).find((o) => String(o.id) === String(id)), null) || null;
  const ots = () => V.ots().filter((o) => o && o.estado !== "Anulada");
  const enZona = (o) => (I().enZona ? I().enZona(o) : true);
  const yoMail = () => ((window.__fbUser || {}).email || ""), yoNombre = () => intentar(() => V.nombreCorto(), "") || yoMail();
  const aviso = (t, tipo) => { try { window.mostrarAviso && window.mostrarAviso(t, tipo || "ok"); } catch (e) { } };
  const auditar = (acc, txt, extra) => { try { window.fbAuditar && window.fbAuditar(acc, String(txt).slice(0, 400), extra || {}); } catch (e) { } };
  function puedeVer() { try { if (!window.__fbUser || !V.rolListo() || V.esCrew()) return false; const r = rol(); return r === "admin" || r === "oficina" || r === "mirar" || esDir(); } catch (e) { return false; } }
  function puede() { try { const r = rol(); return puedeVer() && !esDir() && (r === "admin" || r === "oficina") && V.perm("avance") === "editar"; } catch (e) { return false; } }
  const contrato = () => intentar(() => window.__inicioDir.contrato(), null) || { ini: "", plazo: "", meses: 4, estimada: true, sinDato: true };

  // ================================================================== hojas de pantalla completa + la confirmación
  function hoja(id, titulo) {
    let ov = $(id);
    if (!ov) {
      ov = document.createElement("div"); ov.id = id; ov.className = "g6-ov no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", titulo); ov.hidden = true;
      ov.innerHTML = `<div class="g6-cab"><button type="button" class="g6-x" data-g6="x" aria-label="Cerrar">✕</button><h1>${esc(titulo)}</h1><span class="g6-zona"></span></div><div class="g6-body"></div>`;
      document.body.appendChild(ov);
    }
    return ov;
  }
  function zonaTxt() { const z = intentar(() => window.__zonaContrato.renglon(window.__zonaContrato.zona()), null); return z ? "Zona " + z.id + " (" + (z.corto || "") + ")" : "Nuestra zona"; }
  function mostrar(ov) {
    ["iz186Ov", "gt186Ov"].forEach((k) => { const o = $(k); if (o && o !== ov) o.hidden = true; });
    ov.hidden = false; document.body.classList.add("g6-abierto");
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
  }
  function cerrarHoja(ov) { if (!ov) return; ov.hidden = true; if (!["iz186Ov", "gt186Ov"].some((k) => $(k) && !$(k).hidden)) document.body.classList.remove("g6-abierto"); }
  let confOk = null;
  function conf(titulo, cuerpo, botonSi, alSi) {
    let c = $("g6Conf");
    if (!c) { c = document.createElement("div"); c.id = "g6Conf"; c.className = "no-print"; c.setAttribute("role", "dialog"); c.setAttribute("aria-modal", "true"); document.body.appendChild(c); }
    c.setAttribute("aria-label", titulo);
    c.innerHTML = `<div class="g6-c"><div class="g6-ch"><h3>${esc(titulo)}</h3><button type="button" class="g6-x" data-g6c="no" aria-label="Cerrar">✕</button></div>${cuerpo}<div class="g6-msg" id="g6CMsg" role="status"></div><div class="g6-cb"><button type="button" class="btn-ghost" data-g6c="no">Cancelar</button><button type="button" class="btn-primary" data-g6c="si">${esc(botonSi)}</button></div></div>`;
    c.hidden = false; confOk = alSi;
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
  }
  const cerrarConf = () => { const c = $("g6Conf"); if (c) { c.hidden = true; c.innerHTML = ""; } confOk = null; };
  const confMsg = (t, ok) => { const m = $("g6CMsg"); if (m) { m.textContent = t; m.className = "g6-msg" + (ok ? " ok" : ""); } };
  const fila = (c, a, d) => `<div class="g6-fila"><span>${esc(c)}</span><b>${a != null && a !== "" ? `<s>${esc(a)}</s> → ` : ""}${esc(d)}</b></div>`;

  // ================================================================== elegir la obra (chips)
  function obrasChips() {
    const hoyIds = {}; ots().filter((t) => String(t.fecha || "").slice(0, 10) === hoy()).forEach((t) => { hoyIds[String(t.plazaId)] = 1; });
    const z = obras().filter((o) => enZona(o) && (arr(o.valorItems).length || arr(o.valorItemsEpec).length || hoyIds[String(o.id)] || arr(o.planGantt).length));
    return z.sort((a, b) => (hoyIds[String(b.id)] ? 1 : 0) - (hoyIds[String(a.id)] ? 1 : 0) || nombre(a).localeCompare(nombre(b)));
  }
  function chipsHtml(pref, sel) {
    const l = obrasChips(), top = l.slice(0, 10), resto = obras().filter((o) => top.indexOf(o) < 0).sort((a, b) => nombre(a).localeCompare(nombre(b)));
    const actual = sel ? obraDe(sel) : null, extra = actual && top.indexOf(actual) < 0 ? `<button type="button" class="on" data-${pref}="obra:${esc(actual.id)}">${esc(nombre(actual))}</button>` : "";
    return `<div class="g6-chips" role="tablist"><button type="button" class="${!sel ? "on" : ""}" data-${pref}="obra:">Todas · nuestra zona</button>${top.map((o) => `<button type="button" class="${String(o.id) === String(sel) ? "on" : ""}" data-${pref}="obra:${esc(o.id)}">${esc(nombre(o))}</button>`).join("")}${extra}${resto.length ? `<select data-${pref}sel="1" aria-label="Otra obra"><option value="">＋ otra…</option>${resto.map((o) => `<option value="${esc(o.id)}">${esc(nombre(o))}${o.obraId ? " · ID " + esc(o.obraId) : ""}</option>`).join("")}</select>` : ""}</div>`;
  }

  // ================================================================== 📋 ITEMIZADO
  const SI = { obra: "", acta: false };
  const desc = (id) => intentar(() => window.epecItemDesc(String(id)) || "", "");
  const unDe = (id) => intentar(() => window.epecItemUn(String(id)) || "", "");
  function ultCambio(o, id) {
    const h = arr(o.avanceHist).filter((x) => x && String(x.item) === String(id) && x.cantAntes != null && x.cantDespues != null && num(x.cantAntes) !== num(x.cantDespues)).pop();
    return h ? `✎ ${fN(h.cantAntes)} → ${fN(h.cantDespues)}${h.motivo ? " · «" + String(h.motivo).slice(0, 80) + "»" : ""} · ${String(h.porNombre || h.por || "").split(" ")[0]}${h.ts ? ", " + dm(iso(new Date(h.ts))) : ""}` : "";
  }
  function izObraHtml(o) {
    const F = I().filasObra(o), t = I().kObra(o), pct = Math.round(I().pctObra(o)), ed = puede();
    const RZ = I().RUBZ.concat([["prov", "Provisiones (no suman al avance)", "ítems 83–89"]]);
    const grupos = RZ.map((r) => {
      const l = F.filter((f) => f.rub === r[0]).sort((a, b) => num(a.id) - num(b.id)); if (!l.length) return "";
      return `<tr class="g6-g"><td colspan="4">${esc(r[1])} <span style="font:500 11px var(--mono);color:#6E7C93">${esc(r[2])}</span></td></tr>` + l.map((f) => {
        const uc = ultCambio(o, f.id), u = unDe(f.id);
        return `<tr class="${uc ? "g6-mod" : ""}"><td><b>${esc(f.id)}</b>${esc(desc(f.id) || "Ítem " + f.id)}${u ? ` <span style="color:#6E7C93">(${esc(u)})</span>` : ""}${uc ? `<span class="g6-nota">${esc(uc)}</span>` : ""}</td><td>${ed ? `<button type="button" class="g6-ed" data-iz="ed:${esc(f.id)}" aria-label="Cambiar lo contratado del ítem ${esc(f.id)}">${esc(fN(f.cant))}<i>✎</i></button>` : esc(fN(f.cant))}</td><td>${esc(fN(f.hecho))}</td><td>${esc(fN(Math.max(0, f.cant - f.hecho)))}</td></tr>`;
      }).join("");
    }).join("");
    const co = obj(o.coCierre).cerrado ? '<div class="g6-link" role="status">🔒 El conforme a obra está cerrado: para cambiar lo contratado hay que reabrirlo en Avance de obra.</div>' : "";
    return `<div class="g6-card"><div class="g6-eb">Ítems · contratado / hecho / falta</div><h2>${esc(nombre(o))}${o.obraId ? " · ID " + esc(o.obraId) : ""}</h2>
<div class="g6-kpis"><div><b>${pct}%</b><span>avance de obra</span></div><div><b>${esc(fN(t.h, 0))} K</b><span>de ${esc(fN(t.c, 0))} K contratados</span></div><div><b>${esc(fN(Math.max(0, t.c - t.h), 0))} K</b><span>faltan (sin provisiones)</span></div></div>${co}
${F.length ? `<table class="g6-tab"><thead><tr><th>Ítem</th><th>Contr.</th><th>Hecho</th><th>Falta</th></tr></thead><tbody>${grupos}</tbody></table>` : '<div class="g6-sub">Esta obra todavía no tiene itemizado cargado (se arma desde la Calculadora o en Avance de obra).</div>'}
<div class="g6-foot">«Hecho» sale de las órdenes cerradas y del avance de obra (no se edita acá: se corrige en ✏ Corregir cierre o en Avance de obra). ${ed ? "«Contratado» se cambia con ✎, con motivo y «Sí»." : "Con tu usuario solo se mira."}</div>
<div class="g6-acc"><button type="button" class="btn-ghost" data-iz="avance:${esc(o.id)}">Avance de obra ›</button><button type="button" class="btn-ghost" data-iz="gantt:${esc(o.id)}">📅 Fechas de esta obra ›</button></div></div>`;
  }
  function izZonaHtml() {
    const Z = I().zonaRub(), z = intentar(() => window.__zonaContrato.resumen(), {}) || {};
    const filasR = I().RUBZ.map((r) => { const x = Z.rub[r[0]]; return `<tr><td>${esc(r[1])} <span style="font:500 11px var(--mono);color:#6E7C93">${esc(r[2])}</span></td><td>${esc(fN(x.c, 0))}</td><td>${esc(fN(x.h, 0))}</td><td>${x.c > 0 ? esc(fN((x.h / x.c) * 100, 1)) + "%" : "—"}</td></tr>`; }).join("");
    const pl = Z.ob.map((o) => ({ o, t: I().kObra(o), a: Math.round(I().pctObra(o)), p: window.__gt186 ? window.__gt186.previstaObra(o) : {} })).sort((a, b) => b.a - a.a || nombre(a.o).localeCompare(nombre(b.o)));
    const sinReg = Math.max(0, num(z.plazas) - Z.ob.length);
    return `<div class="g6-zc">${intentar(() => window.__zonaContrato.selectorHtml(), "")}</div>
<div class="g6-dos"><div class="g6-card"><div class="g6-eb">Itemizado · ${esc(zonaTxt())}</div><h2>Por rubro</h2><div class="g6-kpis"><div><b>${esc(fN(z.pct, 1))}%</b><span>de ${esc(fN(z.modulos, 0))} módulos de la zona</span></div><div><b>${esc(fN(Z.h, 0))} K</b><span>hechos de ${esc(fN(Z.c, 0))} K en los itemizados</span></div><div><b>${esc(fN(z.terminadas, 0))}/${esc(fN(z.plazas, 0))}</b><span>plazas terminadas</span></div></div>
<table class="g6-tab"><thead><tr><th>Rubro</th><th>Contr. K</th><th>Hecho K</th><th>%</th></tr></thead><tbody>${filasR}</tbody></table><div class="g6-foot">Módulos (K) de los itemizados cargados de la zona, sin provisiones. El % de arriba es sobre los módulos del pliego de la zona.</div></div>
<div class="g6-card"><div class="g6-eb">Por plaza</div><h2>${Z.ob.length} ${Z.ob.length === 1 ? "plaza registrada" : "plazas registradas"}${sinReg ? ` · ${sinReg} sin registrar` : ""}</h2>
<table class="g6-tab"><thead><tr><th>Plaza</th><th>Contr. K</th><th>Hecho K</th><th>%</th></tr></thead><tbody>${pl.map((x) => `<tr><td><button type="button" class="g6-lk" data-iz="obra:${esc(x.o.id)}">${esc(nombre(x.o))}</button>${x.p && x.p.hasta ? `<span class="g6-nota" style="color:#6E7C93">prevista ${esc(dm(x.p.hasta))}</span>` : ""}</td><td>${esc(fN(x.t.c, 0))}</td><td>${esc(fN(x.t.h, 0))}</td><td>${x.a}%</td></tr>`).join("") || '<tr><td colspan="4">Ninguna plaza de la zona registrada.</td></tr>'}</tbody></table></div></div>`;
  }
  function izPintar() {
    const ov = $("iz186Ov"); if (!ov || ov.hidden) return;
    ov.querySelector(".g6-zona").textContent = "⚙ " + zonaTxt();
    const o = SI.obra ? obraDe(SI.obra) : null; if (SI.obra && !o) SI.obra = "";
    const h = chipsHtml("iz", SI.obra) + (o ? izObraHtml(o) : izZonaHtml());
    const b = ov.querySelector(".g6-body"); if (b.__h !== h) { b.innerHTML = h; b.__h = h; }
    if (SI.acta) { SI.acta = false; setTimeout(() => { const i = ov.querySelector("#zcInicio"); if (i) { i.scrollIntoView({ block: "center" }); try { i.focus(); } catch (e) { } } }, 60); }
  }
  function izAbrir(op) {
    op = op || {};
    if (!puedeVer()) { aviso("🔒 El itemizado lo ven Administración, Oficina, Dirección y «solo mirar».", "error"); return false; }
    SI.obra = op.obra || ""; SI.acta = !!op.acta; if (op.acta) SI.obra = "";
    const ov = hoja("iz186Ov", "📋 Itemizado"); mostrar(ov); ov.querySelector(".g6-body").__h = ""; izPintar(); ov.scrollTop = 0; return true;
  }
  function izEditar(id) {
    const o = obraDe(SI.obra); if (!o || !puede()) return;
    const f = I().filasObra(o).find((x) => x.id === String(id)); if (!f) return;
    conf(`Cambiar lo contratado · ítem ${f.id}`, `<div class="g6-sub">${esc(nombre(o))} · ${esc(desc(f.id) || "")}</div>${fila("Contratado ahora", "", fN(f.cant))}${fila("Hecho", "", fN(f.hecho))}<label>Lo contratado nuevo<input type="number" id="g6Cant" min="0" step="any" inputmode="decimal" value="${esc(String(f.cant))}"></label><label>¿Por qué? (queda en el historial de la obra)<textarea id="g6Mot" maxlength="300" placeholder="Ej.: el plano nuevo suma la Col 11"></textarea></label><div id="g6Prev"></div>`, "Sí, cambiar", async () => {
      const c = num(($("g6Cant") || {}).value), m = String(($("g6Mot") || {}).value || "").trim();
      const A = window.__auditAvance; if (!A || !A.planItem) return confMsg("El cambio del itemizado no está disponible en esta versión.");
      const P = A.planItem({ obraId: o.id, item: f.id, cantidad: c, motivo: m }); if (P.err) return confMsg("⚠ " + P.err);
      confMsg("Guardando…", true);
      const r = await A.aplicarItem({ obraId: o.id, item: f.id, cantidad: c, motivo: m }).catch((e) => ({ ok: false, err: (e && (e.code || e.message)) || "sin conexión" }));
      if (!r || r.ok === false) return confMsg("⚠ No se pudo guardar: " + ((r && r.err) || "sin conexión") + ".");
      cerrarConf(); aviso(`✓ Ítem ${f.id} de ${nombre(o)}: contratado ${fN(f.cant)} → ${fN(c)}.`);
      refrescarTodo();
    });
    const prev = () => { const c = num(($("g6Cant") || {}).value), p = $("g6Prev"); if (p) p.innerHTML = fila("Queda", fN(f.cant), fN(c)) + (c < f.hecho ? '<div class="g6-msg">Lo hecho no puede pasar lo contratado.</div>' : ""); };
    const i = $("g6Cant"); if (i) { i.addEventListener("input", prev); prev(); }
  }

  // ================================================================== 📅 GANTT
  const SG = { obra: "", ed: false, buf: {} };
  const RUBS = () => arr(intentar(() => window.__av2.RUB, [])).map((r) => ({ id: r[0], t: r[1] }));
  const RUBS_DEF = [{ id: "civil", t: "Civil" }, { id: "columnas", t: "Columnas" }, { id: "cajas", t: "Cajas de columna (tableritos)" }, { id: "vinculos", t: "Vínculos" }, { id: "artefactos", t: "Artefactos" }, { id: "cableado", t: "Cableado" }, { id: "pat", t: "Puesta a tierra" }, { id: "tablero", t: "Tablero" }, { id: "cierre", t: "Pruebas y cierre" }];
  const rubros = () => { const l = RUBS(); return l.length ? l : RUBS_DEF; };
  const rubLabel = (k) => k === "obra" ? "Toda la obra" : (rubros().find((r) => r.id === k) || { t: k }).t;
  function previstaObra(o) {
    const g = arr(o && o.planGantt).filter((x) => x && okF(String(x.desde || "").slice(0, 10)));
    const e = g.find((x) => x.g186 === "obra");
    if (e) return { desde: String(e.desde).slice(0, 10), hasta: String(e.hasta || e.desde).slice(0, 10), de: "obra" };
    if (g.length) return { desde: g.map((x) => String(x.desde).slice(0, 10)).sort()[0], hasta: g.map((x) => String(x.hasta || x.desde).slice(0, 10)).sort().pop(), de: "plan" };
    if (okF(String((o && o.fechaEstimada) || "").slice(0, 10))) return { desde: "", hasta: String(o.fechaEstimada).slice(0, 10), de: "estimada" };
    return { desde: "", hasta: "", de: "" };
  }
  function previstaRubro(o, k) { const e = arr(o && o.planGantt).find((x) => x && x.g186 === k && okF(String(x.desde || "").slice(0, 10))); return e ? { desde: String(e.desde).slice(0, 10), hasta: String(e.hasta || e.desde).slice(0, 10) } : { desde: "", hasta: "" }; }
  function tareaRubro(o) {   // tarea → rubro del avance de obra nuevo
    const A = window.__av2, m = {}; if (!A) return m;
    const L = intentar(() => A.lista(o), null), P = {}; arr(A.PASOS).forEach((p) => { P[p.id] = p.r; });
    const C = {}; arr(L && L.cosas).forEach((x) => { C[x.id] = x.r; });
    Object.keys(obj(A.TAREA_AV)).forEach((k) => { arr(A.TAREA_AV[k]).some((x) => { const r = x.indexOf("c:") === 0 ? C[x.slice(2)] : P[x]; if (r) { m[k] = r; return true; } return false; }); });
    return m;
  }
  const tareasOt = (t) => arr(t.actividades).concat(Object.keys(obj(t.cierre && t.cierre.cantidades)));
  function ritmo(ini, pct) {   // a este ritmo (días corridos desde el inicio real)
    if (!ini || !(pct > 0) || pct >= 100) return "";
    const d = Math.max(1, dias(ini, hoy()) + 1), r = pct / d; return r > 0 ? mas(hoy(), Math.ceil((100 - pct) / r)) : "";
  }
  function realObra(o) {
    const f = ots().filter((t) => String(t.plazaId) === String(o.id)).map((t) => String(t.fecha || "").slice(0, 10)).filter(okF).sort();
    const pct = Math.round(I().pctObra ? I().pctObra(o) : 0), ini = f[0] || "", fin = pct >= 100 ? f[f.length - 1] || "" : "";
    return { ini, fin, pct, proy: fin ? "" : ritmo(ini && ini <= hoy() ? ini : "", pct) };
  }
  function realRubros(o) {
    const m = tareaRubro(o), E = intentar(() => window.__av2.estado(o), null), out = {};
    ots().filter((t) => String(t.plazaId) === String(o.id)).forEach((t) => {
      const f = String(t.fecha || "").slice(0, 10); if (!okF(f) || f > hoy()) return;
      tareasOt(t).forEach((k) => { const r = m[k]; if (!r) return; const x = (out[r] = out[r] || { f: [] }); if (x.f.indexOf(f) < 0) x.f.push(f); });
    });
    rubros().forEach((r) => {
      const x = (out[r.id] = out[r.id] || { f: [] }); x.f.sort();
      const R = E ? arr(E.rubros).find((y) => y.id === r.id) : null; x.pct = R && R.pct != null ? Math.round(num(R.pct)) : null; x.hay = !!R;
      x.ini = x.f[0] || ""; x.fin = x.pct >= 100 ? x.f[x.f.length - 1] || "" : ""; x.proy = x.fin ? "" : ritmo(x.ini, x.pct);
    });
    return out;
  }
  function filaG(o, k) {   // lo que tiene el buffer (editado) o lo guardado
    const b = obj(obj(SG.buf[o.id])[k]); const g = k === "obra" ? (() => { const p = previstaObra(o); return p.de === "obra" || p.de === "plan" ? { desde: p.desde, hasta: p.hasta } : { desde: "", hasta: "" }; })() : previstaRubro(o, k);
    return { desde: b.desde != null ? b.desde : g.desde, hasta: b.hasta != null ? b.hasta : g.hasta, antes: g, mod: b.desde != null || b.hasta != null };
  }
  function escala(fechas) {
    const C = contrato(), l = fechas.concat([hoy(), C.plazo]).filter(okF).sort();
    const lo = mas(l[0] || hoy(), -4), hi = mas(l[l.length - 1] || mas(hoy(), 30), 6), T = Math.max(1, dias(lo, hi));
    const x = (f) => Math.max(0, Math.min(100, (dias(lo, f) / T) * 100));
    return { lo, hi, x, C };
  }
  function escHtml(S) {
    let s = ""; const d0 = dia0(S.lo); for (let d = new Date(d0.getFullYear(), d0.getMonth() + 1, 1, 12), i = 0; i < 24 && iso(d) <= S.hi; i++, d.setMonth(d.getMonth() + 1)) s += `<span style="left:${S.x(iso(d)).toFixed(1)}%">${MESES[d.getMonth()]}</span>`;
    s += `<em class="h" style="left:${S.x(hoy()).toFixed(1)}%">hoy</em>`;
    if (okF(S.C.plazo) && S.C.plazo <= S.hi) s += `<em class="f" style="left:${S.x(S.C.plazo).toFixed(1)}%;transform:translateX(-100%)">fin contrato ${dm(S.C.plazo)} →</em>`;
    return `<div class="g6-esc" aria-hidden="true">${s}</div>`;
  }
  function trk(S, pv, re, ri, tarde) {
    let s = "";
    if (okF(pv.desde) && okF(pv.hasta)) s += `<span class="pv" style="left:${S.x(pv.desde).toFixed(1)}%;width:${Math.max(1, S.x(mas(pv.hasta, 1)) - S.x(pv.desde)).toFixed(1)}%" title="Previsto ${dm(pv.desde)} → ${dm(pv.hasta)}"></span>`;
    else if (okF(pv.hasta)) s += `<span class="pv" style="left:${Math.max(0, S.x(pv.hasta) - 1).toFixed(1)}%;width:1.5%" title="Fin estimado ${dm(pv.hasta)}"></span>`;
    if (okF(re.ini)) { const f = re.fin || hoy(); s += `<span class="re${tarde ? " tarde" : ""}" style="left:${S.x(re.ini).toFixed(1)}%;width:${Math.max(0.8, S.x(mas(f, 1)) - S.x(re.ini)).toFixed(1)}%" title="Real desde ${dm(re.ini)}"></span>`; }
    if (okF(ri) && ri > hoy()) s += `<span class="ri" style="left:${S.x(hoy()).toFixed(1)}%;width:${Math.max(0.8, S.x(ri) - S.x(hoy())).toFixed(1)}%" title="A este ritmo ${dm(ri)}"></span>`;
    s += `<span class="hoy" style="left:${S.x(hoy()).toFixed(1)}%"></span>`;
    if (okF(S.C.plazo) && S.C.plazo <= S.hi) s += `<span class="fin" style="left:${S.x(S.C.plazo).toFixed(1)}%"></span>`;
    return `<div class="g6-trk">${s}</div>`;
  }
  function feHtml(o, k, F) {
    if (!SG.ed || !puede()) return "";
    return `<div class="g6-fe"><label>Desde<input type="date" data-gtf="desde" data-o="${esc(o.id)}" data-k="${esc(k)}" value="${esc(F.desde || "")}" aria-label="Desde · ${esc(nombre(o))} · ${esc(rubLabel(k))}"></label><label>Hasta<input type="date" data-gtf="hasta" data-o="${esc(o.id)}" data-k="${esc(k)}" value="${esc(F.hasta || "")}" aria-label="Hasta · ${esc(nombre(o))} · ${esc(rubLabel(k))}"></label>${F.mod ? `<span class="g6-cambio">cambiado (antes ${F.antes.desde ? dm(F.antes.desde) + " → " + dm(F.antes.hasta) : "sin fecha"})</span>` : ""}</div>`;
  }
  const ley = '<div class="g6-ley"><span><i class="pv"></i>Previsto (lo cargás vos)</span><span><i class="re"></i>Real (sale de las órdenes)</span><span><i class="at"></i>Atrasado</span><span><i class="ri"></i>A este ritmo</span></div>';
  function gtObraHtml(o) {
    const R = realObra(o), RR = realRubros(o), FO = filaG(o, "obra"), pvO = FO.desde || FO.hasta ? FO : previstaObra(o);
    const rs = rubros().filter((r) => RR[r.id].hay || filaG(o, r.id).desde || RR[r.id].ini);
    const fechas = [pvO.desde, pvO.hasta, R.ini, R.proy].concat(...rs.map((r) => { const F = filaG(o, r.id), x = RR[r.id]; return [F.desde, F.hasta, x.ini, x.proy]; }));
    const S = escala(fechas);
    const tardeO = okF(pvO.hasta) && R.pct < 100 && ((R.proy && R.proy > pvO.hasta) || hoy() > pvO.hasta);
    const cab = `${pvO.hasta ? `Prevista: ${pvO.desde ? dm(pvO.desde) + " → " : ""}<b>${dmy(pvO.hasta)}</b>` : "Sin fecha prevista"}${R.proy ? ` · a este ritmo: <b style="color:${tardeO ? "#9A5B00" : "#1B7A35"}">${dmy(R.proy)}</b>${okF(pvO.hasta) ? ` (${Math.abs(dias(pvO.hasta, R.proy))} días ${dias(pvO.hasta, R.proy) > 0 ? "tarde" : "antes"})` : ""}` : R.pct >= 100 ? " · terminada" : ""} · avance ${R.pct}%`;
    const filas = [`<div class="g6-gr${FO.mod ? " mod" : ""}" data-gtr="obra"><div class="g6-gl"><b>Toda la obra</b><small>${R.ini ? "desde " + dm(R.ini) : "sin órdenes"} · ${R.pct}%</small></div>${trk(S, pvO, R, R.proy, tardeO)}${feHtml(o, "obra", FO)}</div>`].concat(rs.map((r) => {
      const F = filaG(o, r.id), x = RR[r.id], tarde = okF(F.hasta) && (x.pct || 0) < 100 && ((x.proy && x.proy > F.hasta) || hoy() > F.hasta);
      return `<div class="g6-gr${F.mod ? " mod" : ""}" data-gtr="${esc(r.id)}"><div class="g6-gl"><b>${esc(r.t)}</b><small>${x.pct != null ? x.pct + "%" : "—"}${x.ini ? " · desde " + dm(x.ini) : ""}${F.hasta ? " · prev. " + dm(F.hasta) : ""}</small></div>${trk(S, F, x, x.proy, tarde)}${feHtml(o, r.id, F)}</div>`;
    }));
    return `<div class="g6-card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="g6-eb">Fechas · plan contra real</div><h2>${esc(nombre(o))} por rubro</h2><div class="g6-sub">${cab}</div></div>${puede() ? `<button type="button" class="btn-ghost" style="width:auto;margin:0 0 0 8px;min-height:44px;flex:none" data-gt="ed">${SG.ed ? "Listo" : "✎ Fechas"}</button>` : ""}</div>
${escHtml(S)}<div class="g6-gt">${filas.join("")}</div>${ley}<div class="g6-link">🔗 Estas fechas son la «prevista» de la Programación de Dirección y el plan contra el que el contador del Inicio dice si vamos atrás. Los rubros son los del avance de obra.</div>
<div class="g6-acc"><button type="button" class="btn-ghost" data-gt="iz:${esc(o.id)}">📋 Itemizado de esta obra ›</button><button type="button" class="btn-ghost" data-gt="avance:${esc(o.id)}">Avance de obra ›</button></div></div>`;
  }
  function zonaObras() { return obras().filter(enZona).sort((a, b) => { const pa = previstaObra(a).hasta || "9", pb = previstaObra(b).hasta || "9"; return pa.localeCompare(pb) || nombre(a).localeCompare(nombre(b)); }); }
  function gtZonaHtml() {
    const l = zonaObras(), C = contrato(), z = intentar(() => window.__zonaContrato.resumen(), {}) || {};
    const datosO = l.map((o) => ({ o, F: filaG(o, "obra"), P: previstaObra(o), R: realObra(o) }));
    const S = escala([].concat(...datosO.map((x) => [x.F.desde || x.P.desde, x.F.hasta || x.P.hasta, x.R.ini, x.R.proy])));
    const sinF = datosO.filter((x) => x.R.pct < 100 && !(x.F.hasta || x.P.hasta)).length, sinReg = Math.max(0, num(z.plazas) - l.length);
    const filas = datosO.map((x) => {
      const pv = x.F.desde || x.F.hasta ? x.F : x.P, tarde = okF(pv.hasta) && x.R.pct < 100 && ((x.R.proy && x.R.proy > pv.hasta) || hoy() > pv.hasta);
      return `<div class="g6-gr${x.F.mod ? " mod" : ""}" data-gtr="${esc(x.o.id)}"><div class="g6-gl"><button type="button" class="g6-ob" data-gt="obra:${esc(x.o.id)}">${esc(nombre(x.o))}</button><small>${x.R.pct}%${pv.hasta ? " · prev. " + dm(pv.hasta) : " · sin fecha"}${x.R.proy ? " · ritmo " + dm(x.R.proy) : ""}</small></div>${trk(S, pv, x.R, x.R.proy, tarde)}${feHtml(x.o, "obra", x.F)}</div>`;
    }).join("");
    return `<div class="g6-card"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap"><div><div class="g6-eb">Fechas · ${esc(zonaTxt())}</div><h2>¿Cuándo termina cada plaza?</h2><div class="g6-sub">${C.plazo ? `Fin del contrato ${dmy(C.plazo)}${C.estimada ? " (estimado: falta el acta de inicio)" : ""}` : "Sin fecha del acta de inicio"} · <b>${sinF} sin fecha prevista</b>${sinReg ? ` · ${sinReg} plazas de la zona sin registrar (sin carpeta no se les puede poner fecha)` : ""}</div></div>${puede() ? `<div style="display:flex;flex-wrap:wrap"><button type="button" class="btn-ghost" style="width:auto;margin:6px 8px 0 0;min-height:44px" data-gt="ed">${SG.ed ? "Listo" : "✎ Fechas"}</button>${sinF ? '<button type="button" class="btn-primary" style="width:auto;margin:6px 0 0;min-height:44px" data-gt="repartir">Repartir las que no tienen fecha hasta el fin del contrato</button>' : ""}</div>` : ""}</div>
${l.length ? escHtml(S) + `<div class="g6-gt">${filas}</div>` + ley : '<div class="g6-sub" style="margin-top:8px">Ninguna plaza de la zona registrada.</div>'}<div class="g6-foot">Tocá una plaza para ver sus fechas por rubro. «Repartir» solo propone: nada se guarda sin «Sí».</div></div>`;
  }
  const nCambios = () => Object.keys(SG.buf).reduce((s, id) => s + Object.keys(obj(SG.buf[id])).filter((k) => { const o = obraDe(id); if (!o) return false; const F = filaG(o, k); return F.desde !== F.antes.desde || F.hasta !== F.antes.hasta; }).length, 0);
  function gtPintar() {
    const ov = $("gt186Ov"); if (!ov || ov.hidden) return;
    ov.querySelector(".g6-zona").textContent = "⚙ " + zonaTxt();
    const o = SG.obra ? obraDe(SG.obra) : null; if (SG.obra && !o) SG.obra = "";
    const n = nCambios();
    const barra = SG.ed && puede() ? `<div class="g6-barra"><span role="status">${n ? `${n} ${n === 1 ? "fecha cambiada" : "fechas cambiadas"} sin guardar` : "Cambiá las fechas y guardá"}</span><div style="display:flex"><button type="button" class="btn-ghost" data-gt="cancelar">Cancelar</button><button type="button" class="btn-primary" data-gt="guardar"${n ? "" : " disabled"}>Guardar fechas${n ? " (" + n + ")" : ""}</button></div></div>` : "";
    const h = chipsHtml("gt", SG.obra) + (o ? gtObraHtml(o) : gtZonaHtml()) + barra;
    const b = ov.querySelector(".g6-body"); if (b.__h !== h) { const foco = document.activeElement && b.contains(document.activeElement) ? document.activeElement : null, fk = foco && foco.dataset ? [foco.dataset.gtf, foco.dataset.o, foco.dataset.k] : null; b.innerHTML = h; b.__h = h; if (fk && fk[0]) { const e = b.querySelector(`[data-gtf="${fk[0]}"][data-o="${fk[1]}"][data-k="${fk[2]}"]`); if (e) try { e.focus(); } catch (er) { } } }
  }
  function gtAbrir(op) {
    op = op || {};
    if (!puedeVer()) { aviso("🔒 El Gantt lo ven Administración, Oficina, Dirección y «solo mirar».", "error"); return false; }
    SG.obra = op.obra || ""; SG.ed = false; SG.buf = {};
    const ov = hoja("gt186Ov", "📅 Gantt"); mostrar(ov); ov.querySelector(".g6-body").__h = ""; gtPintar(); ov.scrollTop = 0; return true;
  }
  function planNuevo(o, cambios, op) {   // la lista planGantt nueva: lo de siempre + las fechas de la v186
    const keys = Object.keys(cambios);
    const l = arr(o.planGantt).filter((x) => !(x && x.g186 && keys.indexOf(x.g186) >= 0));
    keys.forEach((k) => { const c = cambios[k]; if (okF(c.desde) && okF(c.hasta)) l.push(Object.assign({ id: "g186_" + k, tarea: k === "obra" ? "Toda la obra (prevista)" : rubLabel(k) + " (previsto)", desde: c.desde, hasta: c.hasta, g186: k, por: yoMail(), porNombre: yoNombre(), ts: Date.now() }, op || {})); });
    return l;
  }
  function validar(cambios) {
    for (const id of Object.keys(cambios)) for (const k of Object.keys(cambios[id])) {
      const c = cambios[id][k], o = obraDe(id), n = (o ? nombre(o) : id) + " · " + rubLabel(k);
      if (!!c.desde !== !!c.hasta) return `${n}: poné las dos fechas (desde y hasta), o borrá las dos para sacarla.`;
      if (c.desde && c.hasta < c.desde) return `${n}: «hasta» no puede ser antes que «desde».`;
    }
    return "";
  }
  async function guardarPlanes(cambios, motivo, op) {   // {obraId: {k: {desde, hasta}}}
    const hechos = [];
    for (const id of Object.keys(cambios)) {
      const o = obraDe(id); if (!o) continue;
      const antes = arr(o.planGantt).filter((x) => x && x.g186).map((x) => ({ k: x.g186, desde: x.desde, hasta: x.hasta }));
      const l = planNuevo(o, cambios[id], op && op.extra);
      await window.fbAvanceCampos(o.id, { planGantt: l });
      o.planGantt = l; hechos.push(nombre(o));
      auditar("gantt_fechas", `${nombre(o)}: ${Object.keys(cambios[id]).map((k) => rubLabel(k) + " " + (cambios[id][k].desde ? dm(cambios[id][k].desde) + "→" + dm(cambios[id][k].hasta) : "(sin fecha)")).join(" · ")}${motivo ? " · " + motivo : ""}`, { ref: o.id, antes, despues: Object.keys(cambios[id]).map((k) => Object.assign({ k }, cambios[id][k])), motivo: motivo || "", repartido: !!(op && op.extra && op.extra.repartido) });
    }
    return hechos;
  }
  function gtGuardar() {
    const cambios = {}, filas = [];
    Object.keys(SG.buf).forEach((id) => { const o = obraDe(id); if (!o) return; Object.keys(obj(SG.buf[id])).forEach((k) => { const F = filaG(o, k); if (F.desde === F.antes.desde && F.hasta === F.antes.hasta) return; (cambios[id] = cambios[id] || {})[k] = { desde: F.desde || "", hasta: F.hasta || "" }; filas.push(fila(nombre(o) + " · " + rubLabel(k), F.antes.desde ? dm(F.antes.desde) + " → " + dm(F.antes.hasta) : "sin fecha", F.desde ? dm(F.desde) + " → " + dm(F.hasta) : "(sacar la fecha)")); }); });
    if (!filas.length) return;
    const err = validar(cambios); if (err) { aviso("⚠ " + err, "error"); return; }
    conf("¿Guardar estas fechas?", `<div class="g6-sub">Quedan en la obra (las ve todo el equipo, la Programación de Dirección y el contador del Inicio).</div>${filas.join("")}<label>Nota (opcional)<input type="text" id="g6Mot" maxlength="200"></label>`, "Sí, guardar", async () => {
      confMsg("Guardando…", true);
      try { const h = await guardarPlanes(cambios, String(($("g6Mot") || {}).value || "").trim()); cerrarConf(); SG.buf = {}; SG.ed = false; aviso(`✓ Fechas guardadas: ${h.join(", ")}.`); refrescarTodo(); }
      catch (e) { confMsg("⚠ No se pudo guardar (" + ((e && e.code) || "sin conexión") + ")."); }
    });
  }
  // «Repartir las que no tienen fecha hasta el fin del contrato»: solo propone (vista previa + «Sí»)
  function proponerReparto(cuadrillas) {
    const C = contrato(); if (!okF(C.plazo)) return { err: "Falta la fecha del acta de inicio (o alguna orden en la zona): sin fin del contrato no se puede repartir." };
    const desde = [hoy(), C.ini].filter(okF).sort().pop(); if (desde >= C.plazo) return { err: "El contrato ya terminó: no hay días para repartir." };
    const l = zonaObras().map((o) => ({ o, R: realObra(o), P: previstaObra(o), t: I().kObra(o) })).filter((x) => x.R.pct < 100 && !x.P.hasta);
    if (!l.length) return { err: "Todas las plazas registradas de la zona ya tienen fecha prevista." };
    l.sort((a, b) => b.R.pct - a.R.pct || nombre(a.o).localeCompare(nombre(b.o)));
    const W = Math.max(1, dias(desde, C.plazo)), n = Math.max(1, Math.min(20, Math.round(cuadrillas) || 1));
    const peso = (x) => Math.max(1, (x.t.c - x.t.h) || 0) * (1 - x.R.pct / 100 * 0.999);
    const tot = l.reduce((s, x) => s + peso(x), 0), libre = Array.from({ length: n }, () => desde), out = [];
    l.forEach((x) => {
      const d = Math.max(3, Math.round((W * n * peso(x)) / tot)); let i = 0; libre.forEach((f, j) => { if (f < libre[i]) i = j; });
      const ini = x.R.ini && x.R.ini < libre[i] ? x.R.ini : libre[i]; let fin = mas(libre[i], d - 1); if (fin > C.plazo) fin = C.plazo; if (fin < ini) fin = ini;
      libre[i] = mas(fin, 1) > C.plazo ? C.plazo : mas(fin, 1); out.push({ o: x.o, desde: ini, hasta: fin, pct: x.R.pct, k: x.t.c - x.t.h });
    });
    return { l: out, desde, plazo: C.plazo, n };
  }
  function repartir() {
    if (!puede()) return;
    const n0 = Math.max(1, new Set(ots().filter((t) => String(t.fecha || "").slice(0, 10) === hoy()).map((t) => String(t.plazaId))).size) || 3;
    const cuerpo = (n) => { const P = proponerReparto(n); if (P.err) return `<div class="g6-msg">${esc(P.err)}</div>`; return `<div class="g6-sub">Una propuesta para ${P.l.length} ${P.l.length === 1 ? "plaza" : "plazas"} sin fecha: de ${dmy(P.desde)} al fin del contrato (${dmy(P.plazo)}), una detrás de otra por cuadrilla, más días a las que les falta más (módulos que faltan del itemizado). Es para empezar: después la cambiás.</div><label>Cuadrillas trabajando a la vez<input type="number" id="g6Cuad" min="1" max="20" step="1" value="${P.n}"></label>${P.l.map((x) => fila(nombre(x.o) + (x.pct ? ` (${x.pct}%)` : ""), "", dm(x.desde) + " → " + dmy(x.hasta))).join("")}<div class="g6-foot">A confirmar: cuántas cuadrillas a la vez y cuánto lleva cada plaza.</div>`; };
    conf("Repartir las plazas sin fecha", `<div id="g6Rep">${cuerpo(n0)}</div>`, "Sí, poner estas fechas", async () => {
      const P = proponerReparto(num(($("g6Cuad") || {}).value) || n0); if (P.err) return confMsg("⚠ " + P.err);
      const cambios = {}; P.l.forEach((x) => { cambios[x.o.id] = { obra: { desde: x.desde, hasta: x.hasta } }; });
      confMsg("Guardando " + P.l.length + " plazas…", true);
      try { await guardarPlanes(cambios, "Repartidas hasta el fin del contrato (" + P.n + " cuadrillas a la vez)", { extra: { repartido: true } }); cerrarConf(); aviso(`✓ Fechas puestas a ${P.l.length} plazas (las podés cambiar).`); refrescarTodo(); }
      catch (e) { confMsg("⚠ No se pudo guardar (" + ((e && e.code) || "sin conexión") + ")."); }
    });
    document.addEventListener("input", function rc(e) { if (!$("g6Conf") || $("g6Conf").hidden) { document.removeEventListener("input", rc); return; } if (e.target && e.target.id === "g6Cuad") { const v = e.target.value, r = $("g6Rep"); if (r) { r.innerHTML = cuerpo(num(v) || 1); const i = $("g6Cuad"); if (i) { i.value = v; try { i.focus(); } catch (er) { } } } } });
  }
  function refrescarTodo() {
    intentar(() => window.__inicioDir && window.__inicioDir.pintar(), null);
    intentar(() => window.__ini186 && window.__ini186.pintar(), null);
    const a = $("iz186Ov"); if (a && !a.hidden) { a.querySelector(".g6-body").__h = ""; izPintar(); }
    const b = $("gt186Ov"); if (b && !b.hidden) { b.querySelector(".g6-body").__h = ""; gtPintar(); }
  }

  // ================================================================== eventos
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return;
    const c = t.closest("#g6Conf [data-g6c]"); if (c) { e.preventDefault(); if (c.dataset.g6c === "si") { const f = confOk; f && f(); } else cerrarConf(); return; }
    if (t.id === "g6Conf") { cerrarConf(); return; }
    const x = t.closest(".g6-ov [data-g6='x']"); if (x) { e.preventDefault(); cerrarHoja(x.closest(".g6-ov")); return; }
    const iz = t.closest("#iz186Ov [data-iz]");
    if (iz) {
      e.preventDefault(); const a = iz.dataset.iz, v = a.slice(a.indexOf(":") + 1);
      if (a.indexOf("obra:") === 0) { SI.obra = v; izPintar(); $("iz186Ov").scrollTop = 0; }
      else if (a.indexOf("ed:") === 0) izEditar(v);
      else if (a.indexOf("avance:") === 0) { cerrarHoja($("iz186Ov")); setTimeout(() => intentar(() => window.irADetalleDesdeMapa(v), null), 40); }
      else if (a.indexOf("gantt:") === 0) { cerrarHoja($("iz186Ov")); gtAbrir({ obra: v }); }
      return;
    }
    const g = t.closest("#gt186Ov [data-gt]");
    if (g) {
      e.preventDefault(); const a = g.dataset.gt, v = a.slice(a.indexOf(":") + 1);
      if (a.indexOf("obra:") === 0) { if (nCambios() && !SG.obra !== !v) { /* los cambios sin guardar quedan en la memoria */ } SG.obra = v; gtPintar(); $("gt186Ov").scrollTop = 0; }
      else if (a === "ed") { SG.ed = !SG.ed; gtPintar(); }
      else if (a === "cancelar") { SG.buf = {}; SG.ed = false; gtPintar(); }
      else if (a === "guardar") gtGuardar();
      else if (a === "repartir") repartir();
      else if (a.indexOf("iz:") === 0) { cerrarHoja($("gt186Ov")); izAbrir({ obra: v }); }
      else if (a.indexOf("avance:") === 0) { cerrarHoja($("gt186Ov")); setTimeout(() => intentar(() => window.irADetalleDesdeMapa(v), null), 40); }
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.dataset) return;
    if (t.dataset.izsel && t.value) { SI.obra = t.value; izPintar(); return; }
    if (t.dataset.gtsel && t.value) { SG.obra = t.value; gtPintar(); return; }
    if (t.dataset.gtf && t.closest("#gt186Ov")) { const b = (SG.buf[t.dataset.o] = SG.buf[t.dataset.o] || {}), k = t.dataset.k; b[k] = Object.assign({}, filaG(obraDe(t.dataset.o) || {}, k), b[k] || {}); delete b[k].antes; delete b[k].mod; b[k][t.dataset.gtf] = okF(t.value) ? t.value : ""; gtPintar(); }
  });

  // ================================================================== menú
  function menuItem(id, ico, txt, fn, despues) {
    let m = $(id);
    if (!puedeVer()) { m && m.remove(); return; }
    const ref = despues() ; if (!ref) return;
    if (!m) { m = document.createElement("button"); m.type = "button"; m.id = id; m.className = (document.querySelector('#menuLateral [data-vista="inicio"]') || ref).className.replace(/\b(activo|active|on)\b/g, ""); m.innerHTML = `<span class="nav-ico">${ico}</span><span class="nav-txt">${txt}</span>`; m.addEventListener("click", () => fn({})); }
    if (m.previousElementSibling !== ref) ref.insertAdjacentElement("afterend", m);
  }
  function menu() {
    menuItem("menuItemizado186", "📋", "Itemizado", izAbrir, () => document.querySelector('#menuLateral [data-vista="avance"]') || document.querySelector('#menuLateral [data-vista="inicio"]'));
    menuItem("menuGantt186", "📅", "Gantt", gtAbrir, () => $("menuItemizado186"));
  }
  setInterval(() => { try { menu(); } catch (e) { } }, 2500);
  { const am = window.abrirMenuLateral;   // el menú se rearma al abrirlo: los dos ítems se ponen enseguida
    if (typeof am == "function" && !am.__g6) { const n = function () { const r = am.apply(this, arguments); try { menu(); } catch (e) { } setTimeout(() => { try { menu(); } catch (e) { } }, 0); return r; }; window.__heredar && window.__heredar(n, am); n.__g6 = 1; window.abrirMenuLateral = n; } }
  document.addEventListener("permisos-listos", () => setTimeout(() => { try { menu(); } catch (e) { } }, 80));

  // ================================================================== Órdenes › «🗓 Mañana» (la orden sugerida)
  const SUG = () => (!window.__sugNo && window.__sugerida) || null;
  const verMan = () => { const s = SUG(); return !!s && intentar(() => s.puede(), false); };
  function manDatos() { const s = SUG(); if (!s) return null; const f = s.fechaDef(); const d = intentar(() => s.plan(f), null); return d ? { s, f, d, l: intentar(() => s.emitibles(d), []) || [] } : null; }
  function manN() { const M = manDatos(); return M ? M.l.length : 0; }
  function manHtml() {
    const M = manDatos(); if (!M) return '<div class="tb-vacio">La orden sugerida no está disponible.</div>';
    const { s, f, d, l } = M, dd = dia0(f), fc = DIASL[dd.getDay()] + " " + dm(f);
    if (d.noSeTrabaja) return `<div class="card mn6"><div class="mn6-eb">Sugerida · ${esc(fc)}</div><h2>Ese día no se trabaja</h2><button type="button" class="btn-ghost" data-sg="abrir" data-f="${esc(f)}" data-cfg="1">Ajustes</button></div>`;
    const sinT = intentar(() => (window.__sinTarea && !window.__v145No ? window.__sinTarea.sinTarea(f) : []), []) || [];
    const libres = arr(d.libres).map((p) => p.nombre).concat(sinT.map((p) => String(p.nombre || p))).filter((x, i, a) => x && a.indexOf(x) === i);
    const ob = l.map((o) => `<div class="mn6-ob"><div class="mn6-h"><b>${esc(String(o.obra).toUpperCase())}</b><em>${o.pts ? esc(fN(o.pts.total, 1)) + " pts" : ""}</em></div><small>${esc(arr(o.gente).map((p) => p.nombre.split(" ")[0]).join(", ") || "sin gente")} · ${esc(arr(o.vehiculos).map((v) => v.nombre).join(", ") || "sin vehículo")}</small><div class="mn6-ch">${arr(o.tareas).map((t) => `<span>${esc(t.label)} × ${esc(fN(t.cant))}${t.colsTxt ? " (" + esc(t.colsTxt) + ")" : ""}</span>`).join("")}</div>${arr(o.avisos).filter((a) => a.n === "rojo").slice(0, 2).map((a) => `<div class="sg-av rojo">⚠ ${esc(a.t)}</div>`).join("")}</div>`).join("");
    const em = arr(d.emitidas).map((o) => `<div class="mn6-ob"><div class="mn6-h"><b>${esc(String(o.obra).toUpperCase())}</b><em>✅ ${esc((o.emitida || {}).numero || "emitida")}</em></div><small>${esc(arr(o.gente).map((p) => p.nombre.split(" ")[0]).join(", "))}</small></div>`).join("");
    const C = intentar(() => s.cfg(), {}) || {};
    return `<div class="card mn6"><div class="mn6-eb">Sugerida · ${esc(fc)}</div><h2>Lo que la app armó para mañana</h2><small>Con lo que queda de cada obra y la gente libre. Nada sale sin «Emitir». Antes estaba en el Inicio.</small>
${ob || '<div class="mn6-ob"><small>No hay órdenes para sugerir (todo emitido o sin trabajo pendiente).</small></div>'}${em}
${libres.length ? `<div class="mn6-st"><span>👷 ${esc(libres.map((n) => n.split(" ")[0]).join(", "))}</span><em>sin tarea</em></div>` : ""}
<div class="mn6-acc"><button type="button" class="btn-ghost" data-sg="abrir" data-f="${esc(f)}" data-cfg="1">Ajustes</button><button type="button" class="btn-primary" data-sg="abrir" data-f="${esc(f)}">${l.length ? "Revisar y emitir ›" : "Ver · cambios ›"}</button></div>
<small style="margin-top:10px">🔔 Si a las ${esc(C.sinTareaHora || "17:00")} queda gente sin tarea, avisa a la oficina (como hoy). El asistente sigue entendiendo «armá las de mañana».</small></div>`;
  }
  window.__man186 = { ve: verMan, n: manN, html: manHtml };
  window.__iz186 = { abrir: izAbrir, cerrar: () => cerrarHoja($("iz186Ov")), pintar: izPintar, editar: izEditar, puede, puedeVer, estado: () => Object.assign({}, SI) };
  window.__gt186 = { abrir: gtAbrir, cerrar: () => cerrarHoja($("gt186Ov")), pintar: gtPintar, previstaObra, previstaRubro, realObra, realRubros, planNuevo, guardarPlanes, proponerReparto, repartir, puede, puedeVer, rubros, estado: () => ({ obra: SG.obra, ed: SG.ed, buf: JSON.parse(JSON.stringify(SG.buf)), cambios: nCambios() }) };
  // la vista «Mañana» del tablero se redibuja cuando cambia la sugerida
  setInterval(() => { try { const tb = $("otTablero"); if (tb && tb.offsetParent !== null && window.__tableroSub && window.__tableroSub.estado().tab === "manana") { const h = manHtml(); if (tb.__mn6 !== h) { tb.__mn6 = h; typeof window.__tbB == "function" && window.__tbB(); } } } catch (e) { } }, 3000);
})();
