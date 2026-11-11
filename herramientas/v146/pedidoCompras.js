(function () {
  "use strict";
  // v146 · Pedido de compras automático (maqueta i4, aprobada por Ángel). Se arma solo cada día (al abrir Pañol › Lista de
  // compras, o el botón): NADA se compra ni se escribe sin «Sí».
  //  · Qué entra: lo que está bajo el mínimo y lo que se acabó (la lista de compras de siempre, comprasPorMinimo) + lo que van a
  //    necesitar las obras programadas en los próximos 7 días (órdenes emitidas y, para la oficina, las sugeridas de la v143):
  //    lo que falta del cómputo según el avance (cómputo − lo que ya salió o lo que justifica el avance, v145) menos lo apartado
  //    para esa obra en reservas, contra el stock libre del pañol (faltanteLibre: sin lo apartado). Menos lo ya pedido y sin
  //    recibir (pedidos guardados).
  //  · Por material: cantidad sugerida con el porqué («para PLAZA LOS ÁLAMOS el jueves: 6 Un.; hay 2»), último proveedor y
  //    último precio de las entradas (movimientos; sin entrada con precio = «sin precio», no se inventa), la unidad con porUnidad
  //    (rollos) y la alternativa 🟢 de la v101 si tiene stock.
  //  · Por proveedor: «📤 Pedido a <proveedor>» en una hoja A4 (hojaPdf, con o sin precios) para mandar por WhatsApp o mail
  //    (Compartir de la hoja, v110). «💾 Guardar el pedido» (con «Sí») deja un resumen en adjuntos (tipo «pedidoCompra», sin
  //    precios, como el remitoRes de la v138: sin reglas nuevas); cuando entra el remito (v137–v140) se ve lo recibido.
  //  · Permisos: quien edita el pañol (pañol, oficina, administración). Los precios solo Administración y Oficina.
  //  Pruebas viejas: window.__v146No.
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const fN = (v) => intentar(() => fmt(r2(v), Number.isInteger(r2(v)) ? 0 : 2), String(r2(v)));
  const plata = (v) => intentar(() => formatMoney(v), "$ " + fN(v));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoy = () => iso(new Date());
  const deIso = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const masDias = (f, n) => { const d = deIso(f); d.setDate(d.getDate() + n); return iso(d); };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const fCorta = (f) => { const d = deIso(f); return d ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : String(f || ""); };
  const fDia = (f) => { const h = hoy(), d = deIso(f); if (f === h) return "hoy"; if (f === masDias(h, 1)) return "mañana"; return d ? "el " + DIAS[d.getDay()] + " " + fCorta(f) : f; };
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const movs = () => intentar(() => stockMovimientosVigentes(), []) || [];
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const liviano = () => intentar(() => !!(window.__modoDatos && window.__modoDatos.liviano()), false);
  const rolYo = () => intentar(() => String((PERMISOS.yo() || {}).rol || ""), "");
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const abierta = (o) => !!o && o.estado !== "Anulada" && o.estado !== "Terminada" && !cerrada(o);
  const nombreObra = (o) => { const n = String((o && (o.nombre || o.plazaNombre || o.obra)) || ""); return window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase(); };
  function puede() { return !window.__v146No && !!window.__fbUser && !liviano() && !esCrew() && permiso("stock") === "editar"; }
  const conPrecio = () => rolYo() === "admin" || rolYo() === "oficina";
  const cat = () => { const m = new Map(); intentar(() => (typeof catalogoCompleto == "function" ? catalogoCompleto() : catalogo()).forEach((x) => m.set(String(x.codigo), x)), null); return m; };
  const libre = (c) => intentar(() => (typeof window.faltanteLibre == "function" ? num(window.faltanteLibre(c)) : num(stockActual(c))), 0);
  const esUn = (u) => /^(un|u|unidad|unid)\.?$/i.test(String(u || "").trim());
  const redondo = (v, u) => (esUn(u) || !u ? Math.ceil(v - 1e-6) : Math.ceil(v * 10 - 1e-6) / 10);
  const provN = (s) => nk(s).replace(/\b(s\.?\s?a\.?|s\.?r\.?l\.?|s\.?a\.?s\.?)\b/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

  // ---------------------------------------------------------------- proveedor y precio: solo de las entradas (no se inventan)
  function ultimaEntrada(cod) {
    let u = null, up = null;
    movs().forEach((m) => {
      if (m.tipo !== "entrada" || String(m.codigo) !== String(cod) || m.devolucion || m.ajuste || m.correccion) return;
      const k = String(m.fecha || "") + "|" + String(1e15 + (m.ts || 0));
      if (String(m.proveedor || "").trim() && (!u || k > u.k)) u = { k, proveedor: String(m.proveedor).trim(), fecha: m.fecha || "", numero: m.numero || "", remito: m.remito || "" };
      if (m.precioUnit != null && isFinite(m.precioUnit) && num(m.precioUnit) > 0 && (!up || k > up.k)) up = { k, precio: num(m.precioUnit), fecha: m.fecha || "", proveedor: String(m.proveedor || "").trim() };
    });
    return { prov: u, precio: up };
  }

  // ---------------------------------------------------------------- obras programadas (próximos N días)
  function programadas(dias) {
    const h = hoy(), hasta = masDias(h, dias), m = new Map();
    const poner = (id, f, x) => { const v = m.get(String(id)); if (!v || f < v.fecha) m.set(String(id), Object.assign({ id: String(id), fecha: f }, x)); };
    ots().forEach((o) => { const f = String((o && o.fecha) || "").slice(0, 10); if (abierta(o) && o.plazaId && f >= h && f <= hasta) poner(o.plazaId, f, { numero: o.numero || "", emitida: true }); });
    const SG = window.__sugerida;
    if (SG && !window.__sugNo && intentar(() => SG.puede(), false)) {
      intentar(() => SG.semana(SG.fechaDef()), []).forEach((d) => { if (!d || d.fecha > hasta) return; arr(d.ordenes).forEach((o) => { if (o.incluir && !o.emitida && arr(o.tareas).length && o.obraId) poner(o.obraId, d.fecha, { sugerida: true }); }); });
    }
    return [...m.values()].map((x) => Object.assign(x, { o: obras().find((o) => String(o.id) === x.id) })).filter((x) => x.o);
  }
  // lo que le falta a una obra (en la unidad del pañol)
  function faltaObra(o) {
    const calc = new Map();
    arr(o.secciones).forEach((s) => arr(s && s.items).forEach((it) => {
      if (!it || it.tarea || it.cod == null || it.cod === "") return;
      const d = String(it.desc || "").replace(/<[^>]+>/g, "").trim(), q = num(it.cantNecesaria != null ? it.cantNecesaria : it.cant);
      if (!(q > 0) || /^[—ℹ⚠]/.test(d)) return;
      const k = String(Number(it.cod) === 2007 ? 2009 : it.cod), x = calc.get(k) || { codigo: k, desc: d.split(" — ")[0], un: it.un || "", cant: 0 };
      x.cant += q; calc.set(k, x);
    }));
    if (!calc.size) return [];
    const salio = new Map(); movs().forEach((m) => { if (String(m.plazaId || "") !== String(o.id) || m.tipo === "entrada") return; salio.set(String(m.codigo), (salio.get(String(m.codigo)) || 0) + (m.tipo === "salida" ? 1 : -1) * num(m.cantidad)); });
    const deb = new Map(); intentar(() => { const D = window.__matAvance && window.__matAvance.deObra(o); arr(D && D.filas).forEach((f) => deb.set(String(f.codigo), num(f.deb))); }, null);
    const C = cat(), out = [];
    calc.forEach((x, k) => {
      const p = C.get(k) || intentar(() => stockBase(k), null) || {}, unP = p.un || x.un;
      const dist = !!(window.__nU && unP && x.un && window.__nU(unP) !== window.__nU(x.un)), fu = dist ? intentar(() => num(window.__factorUn(k, x.un)), 0) : 1;
      if (dist && !(fu > 0)) return;   // otra unidad sin equivalencia: no se adivina
      const sal = Math.max(0, num(salio.get(k))) * fu, hecho = Math.max(sal, num(deb.get(k)));
      const faltaCalc = Math.max(0, x.cant - hecho), ap = intentar(() => num(window.__apartadoObra(o.id, Number(k))), 0) || intentar(() => num(window.__apartadoObra(o.id, k)), 0);
      const f = Math.max(0, faltaCalc / fu - ap);
      if (f > 1e-6) out.push({ codigo: k, desc: p.desc || x.desc, un: unP, falta: f });
    });
    return out;
  }

  // ---------------------------------------------------------------- pedidos guardados (lo pedido y lo recibido)
  const st = { abierta: false, dias: 7, conPrecios: true, cant: {}, pedidos: [], leidoTs: 0, msg: "", ts: 0, A: null };
  async function leerPedidos(forzar) {
    if (!forzar && Date.now() - st.leidoTs < 120000) return st.pedidos;
    try { const q = await firebase.firestore().collection("adjuntos").where("tipo", "==", "pedidoCompra").get(); const l = []; q.forEach((d) => l.push(Object.assign({ id: d.id }, d.data()))); st.pedidos = l.sort((a, b) => (b.ts || 0) - (a.ts || 0)); st.leidoTs = Date.now(); } catch (e) { }
    return st.pedidos;
  }
  function recibido(P, it) {
    let r = 0; const pv = provN(P.proveedor);
    movs().forEach((m) => { if (m.tipo !== "entrada" || String(m.codigo) !== String(it.codigo) || m.devolucion || m.ajuste || m.correccion) return; if ((m.ts || 0) < (P.ts || 0)) return; if (pv && m.proveedor && provN(m.proveedor) !== pv) return; r += num(m.cantidad); });
    return r;
  }
  function estadoPedido(P) {
    const it = arr(P.items).map((x) => { const r = Math.min(num(x.cant), recibido(P, x)); return Object.assign({}, x, { recibido: r, falta: r2(Math.max(0, num(x.cant) - r)) }); });
    const tot = it.length, ok = it.filter((x) => x.falta <= 1e-6).length;
    return { items: it, ok, tot, est: ok === tot ? "ok" : it.some((x) => x.recibido > 0) ? "med" : "pend" };
  }
  function yaPedido(cod) {
    let s = 0; const desde = Date.now() - 45 * 864e5;
    st.pedidos.forEach((P) => { if ((P.ts || 0) < desde || P.anulado) return; estadoPedido(P).items.forEach((x) => { if (String(x.codigo) === String(cod)) s += x.falta; }); });
    return s;
  }

  // ---------------------------------------------------------------- armar el pedido sugerido
  function armar(dias) {
    dias = dias || st.dias;
    const C = cat(), L = new Map(), prog = programadas(dias);
    const item = (k) => { let x = L.get(k); if (!x) { const p = C.get(k) || intentar(() => stockBase(k), null) || {}; x = { codigo: k, desc: p.desc || k, un: p.un || "", porUnidad: obj(p.porUnidad), min: intentar(() => stockMinimoDe(k), 0), libre: libre(k), nec: 0, obras: [], motivos: [] }; L.set(k, x); } return x; };
    prog.forEach((P) => faltaObra(P.o).forEach((f) => { const x = item(f.codigo); x.nec += f.falta; x.obras.push({ obra: nombreObra(P.o), id: P.id, fecha: P.fecha, cant: f.falta, sug: !!P.sugerida }); }));
    intentar(() => comprasPorMinimo(), []).forEach((m) => { const x = item(String(m.codigo)); x.motivos.push(m.motivo === "agotado" ? { t: "se acabó", pedir: num(m.pedir) } : { t: "bajo el mínimo", pedir: num(m.pedir) }); });
    const items = [];
    L.forEach((x) => {
      const lib = Math.max(0, x.libre), agot = x.motivos.find((m) => m.t === "se acabó");
      let q = x.min > 0 ? x.nec + x.min - lib : x.nec - lib;
      if (!(x.nec > 0) && agot) q = agot.pedir;
      const ped = yaPedido(x.codigo); q -= ped;
      if (!(q > 1e-6)) return;
      q = redondo(q, x.un);
      const ue = ultimaEntrada(x.codigo), alt = intentar(() => window.__alternativas.de(Number(x.codigo), x.desc, x.un).filter((a) => a.nivel === "verde" && num(a.hay) > 0)[0], null);
      const pq = [];
      x.obras.sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach((o) => pq.push(`para ${o.obra} ${fDia(o.fecha)}${o.sug ? " (sugerida)" : ""}: ${fN(o.cant)} ${x.un}`));
      if (x.min > 0 && x.libre < x.min + x.nec) pq.push(`mínimo ${fN(x.min)}`);
      if (agot && !(x.nec > 0)) pq.push(`se acabó: la última entrada fue de ${fN(agot.pedir)}`);
      items.push({ codigo: x.codigo, desc: x.desc, un: x.un, cant: q, libre: x.libre, min: x.min, nec: r2(x.nec), yaPedido: r2(ped), obras: x.obras, porque: pq.join(" · ") + `; hay ${fN(Math.max(0, x.libre))}`, bajo: x.motivos.length > 0,
        proveedor: ue.prov ? ue.prov.proveedor : "", provFecha: ue.prov ? ue.prov.fecha : "", provNum: ue.prov ? ue.prov.numero : "", precio: ue.precio ? ue.precio.precio : null, precioFecha: ue.precio ? ue.precio.fecha : "",
        porUnidad: x.porUnidad, alt: alt ? { codigo: String(alt.q.codigo), desc: alt.q.desc, un: alt.q.un || "", hay: num(alt.hay) } : null });
    });
    items.sort((a, b) => a.desc.localeCompare(b.desc, "es"));
    const G = new Map();
    items.forEach((x) => { const k = x.proveedor ? provN(x.proveedor) : "__sin"; let g = G.get(k); if (!g) { g = { k, proveedor: x.proveedor || "", items: [], ult: "" }; G.set(k, g); } g.items.push(x); if (x.provFecha && (!g.ultF || x.provFecha > g.ultF)) { g.ultF = x.provFecha; g.ult = (x.provNum ? x.provNum + " · " : "") + fCorta(x.provFecha); } });
    const grupos = [...G.values()].sort((a, b) => (a.k === "__sin") - (b.k === "__sin") || b.items.length - a.items.length || a.proveedor.localeCompare(b.proveedor, "es"));
    return { dias, hasta: masDias(hoy(), dias), items, grupos, obras: prog.map((p) => ({ obra: nombreObra(p.o), fecha: p.fecha, sugerida: !!p.sugerida })), bajos: items.filter((x) => x.bajo).length, ts: Date.now() };
  }
  const cantDe = (x) => (st.cant[x.codigo] != null ? num(st.cant[x.codigo]) : x.cant);
  const unidadTxt = (x) => { const pu = obj(x.porUnidad), k = Object.keys(pu).find((u) => num(pu[u]) > 0); return k && esUn(x.un) ? ` (= ${fN(cantDe(x) * num(pu[k]))} ${k}; ${fN(pu[k])} ${k} c/u)` : ""; };

  // ---------------------------------------------------------------- pantalla
  function filaHtml(x, cp) {
    const imp = cp && x.precio != null ? cantDe(x) * x.precio : null;
    return `<div class="pq-r${x.bajo ? " bajo" : ""}" data-pqcod="${esc(x.codigo)}"><span class="pq-cod">${esc(x.codigo)}</span><div class="pq-tx"><b>${esc(x.desc)}</b><small>${esc(x.porque)}${x.yaPedido > 0 ? ` · ya pedido ${esc(fN(x.yaPedido))}` : ""}${unidadTxt(x) ? " · " + esc(unidadTxt(x).trim()) : ""}</small>${x.alt ? `<small class="pq-alt">🟢 Hay ${esc(fN(x.alt.hay))} ${esc(x.alt.un)} de ${esc(x.alt.codigo)} · ${esc(x.alt.desc)} (casi igual): mirala antes de comprar</small>` : ""}${cp ? `<small class="pq-pr">${x.precio != null ? `último precio ${esc(plata(x.precio))} s/IVA (${esc(fCorta(x.precioFecha))})${imp != null ? " · ≈ " + esc(plata(imp)) : ""}` : "sin precio"}</small>` : ""}</div><label class="pq-cant"><input type="number" inputmode="decimal" min="0" step="any" data-pq="cant" data-cod="${esc(x.codigo)}" value="${esc(r2(cantDe(x)))}" aria-label="A comprar de ${esc(x.desc)}"><small>${esc(x.un)}</small></label></div>`;
  }
  function grupoHtml(g, cp) {
    const tot = cp ? g.items.reduce((s, x) => s + (x.precio != null ? cantDe(x) * x.precio : 0), 0) : 0, sinP = g.items.filter((x) => x.precio == null).length;
    return `<div class="card pq-g" data-pcg="${esc(g.k)}"><div class="pq-gh"><h3>${g.k === "__sin" ? "Sin proveedor anterior" : esc(g.proveedor)}</h3><small>${g.ult ? "últ. " + esc(g.ult) : g.k === "__sin" ? "nunca entró con proveedor" : ""}</small><span class="pq-n">${g.items.length} ${g.items.length === 1 ? "material" : "materiales"}</span></div>
${g.items.map((x) => filaHtml(x, cp)).join("")}
${cp ? `<div class="pq-tot">≈ <b>${esc(plata(tot))}</b> sin IVA${sinP ? ` · ${sinP} sin precio` : ""}</div>` : ""}
<div class="pq-acc"><button type="button" class="btn-primary" data-pq="hoja" data-g="${esc(g.k)}">📤 Pedido a ${g.k === "__sin" ? "un proveedor" : esc(g.proveedor)}</button><button type="button" class="btn-ghost" data-pq="guardar" data-g="${esc(g.k)}">💾 Guardar el pedido</button></div></div>`;
  }
  function pedidosHtml() {
    const l = st.pedidos.filter((P) => !P.anulado).slice(0, 8);
    if (!l.length) return "";
    return `<div class="card pq-ped"><div class="sg-eti" style="margin-top:0">📜 Pedidos guardados</div>${l.map((P) => { const E = estadoPedido(P); return `<div class="pq-pf ${E.est}"><span>${E.est === "ok" ? "✅" : E.est === "med" ? "🟠" : "⏳"}</span><div><b>${esc(P.proveedor || "Sin proveedor")}</b> · ${esc(fCorta(P.fecha))}<small>${E.est === "ok" ? "Recibido todo" : `Recibido ${E.ok} de ${E.tot}`}: ${esc(E.items.slice(0, 4).map((x) => `${x.codigo} ${fN(x.recibido)}/${fN(x.cant)}`).join(" · "))}${E.items.length > 4 ? "…" : ""}</small></div></div>`; }).join("")}<div class="sg-hint">Lo recibido sale de las entradas cargadas después del pedido (con foto del remito o a mano), del mismo proveedor.</div></div>`;
  }
  function html() {
    const A = st.A || (st.A = armar()), cp = conPrecio() && st.conPrecios, nObras = A.obras.length;
    return `<div class="sg-bar0"><button type="button" class="sg-bt" data-pq="cerrar" aria-label="Volver">‹</button><div class="sg-bt0"><b>Pedido de compras</b><small>Pañol · Lista de compras</small></div><button type="button" class="sg-bt" data-pq="cerrar" aria-label="Cerrar">✕</button></div>
<div class="sg-in"><div class="pq-top"><div><div class="sg-eti" style="margin-top:0">Pedido de compras · se arma solo · hasta el ${esc(fCorta(A.hasta))}</div><h2>Para los próximos ${A.dias} días</h2><div class="sg-sub">Lo que piden las órdenes${conPrecio() ? " (emitidas y sugeridas)" : " emitidas"} de ${nObras} ${nObras === 1 ? "obra" : "obras"} (lo que falta del cómputo según el avance, menos lo apartado), contra el stock libre y el mínimo. Proveedor = el último que lo vendió. Nada se compra sin que lo mandes.</div></div>
<div class="pq-fil"><button type="button" class="chip${A.dias === 7 ? " activo" : ""}" data-pq="dias" data-n="7">7 días</button><button type="button" class="chip${A.dias === 14 ? " activo" : ""}" data-pq="dias" data-n="14">14 días</button>${conPrecio() ? `<label class="pq-sw"><input type="checkbox" data-pq="precios"${st.conPrecios ? " checked" : ""}> Con precios</label>` : ""}</div></div>
<div class="pq-kp"><div class="pq-k"><b>${A.items.length}</b><span>Materiales a comprar</span></div><div class="pq-k"><b>${A.grupos.filter((g) => g.k !== "__sin").length}</b><span>Proveedores</span></div><div class="pq-k"><b>${nObras}</b><span>Obras que lo piden</span></div><div class="pq-k am"><b>${A.bajos}</b><span>En 0 o bajo el mínimo</span></div></div>
${A.obras.length ? `<div class="sg-hint pq-obras">${A.obras.map((o) => `<span>${esc(o.obra)} · ${esc(fDia(o.fecha))}${o.sugerida ? " (sugerida)" : ""}</span>`).join("")}</div>` : ""}
<div class="pq-gr">${A.grupos.map((g) => grupoHtml(g, cp)).join("") || '<div class="card sg-nada">No hay nada para comprar: el stock alcanza para lo programado y nada está bajo el mínimo. 👌</div>'}</div>
${pedidosHtml()}
${st.msg ? `<div class="sg-msg" role="status">${st.msg}</div>` : ""}</div>`;
  }
  function pintar(re) {
    const ov = $("pcOv"); if (!ov || ov.hidden) return;
    if (re) st.A = null;
    const h = html(); if (ov.__h === h) return;
    const sc = ov.querySelector(".sg-in"), y = sc ? sc.scrollTop : 0, f = document.activeElement && ov.contains(document.activeElement) && document.activeElement.dataset ? document.activeElement.dataset.cod : null;
    ov.innerHTML = h; ov.__h = h; const s2 = ov.querySelector(".sg-in"); if (s2) s2.scrollTop = y;
    if (f) { const i = ov.querySelector(`[data-pq="cant"][data-cod="${CSS.escape(f)}"]`); i && i.focus(); }
  }
  function abrir() {
    if (!puede()) { try { window.mostrarAviso && window.mostrarAviso("🔒 El pedido de compras es del pañol y la oficina.", "error"); } catch (e) { } return false; }
    st.abierta = true; st.A = null; st.msg = "";
    let ov = $("pcOv"); if (!ov) { ov = document.createElement("div"); ov.id = "pcOv"; ov.className = "no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Pedido de compras"); document.body.appendChild(ov); }
    ov.hidden = false; ov.__h = ""; pintar();
    leerPedidos(true).then(() => { st.A = null; ov.__h = ""; pintar(); });
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function cerrar() { const ov = $("pcOv"); if (ov) ov.hidden = true; st.abierta = false; ["pcPreg"].forEach((i) => { const x = $(i); x && x.remove(); }); }
  const grupo = (k) => (st.A || armar()).grupos.find((g) => g.k === k) || null;
  function hojaHtml(g, cp) {
    const its = g.items.filter((x) => cantDe(x) > 0), tot = its.reduce((s, x) => s + (x.precio != null ? cantDe(x) * x.precio : 0), 0);
    return `<div class="sub">Pedido a <b>${esc(g.proveedor || "proveedor a elegir")}</b> · ${esc(intentar(() => formatFechaCorta(hoy()), hoy()))} · ${its.length} ${its.length === 1 ? "material" : "materiales"}</div>
<table><thead><tr><th>Código</th><th>Material</th><th style="text-align:right">Cantidad</th><th>Unidad</th>${cp ? '<th style="text-align:right">Precio unit. s/IVA</th><th style="text-align:right">Importe s/IVA</th>' : ""}</tr></thead><tbody>${its.map((x) => `<tr><td>${esc(x.codigo)}</td><td>${esc(x.desc)}${unidadTxt(x) ? `<br><small>${esc(unidadTxt(x).trim())}</small>` : ""}</td><td style="text-align:right">${esc(fN(cantDe(x)))}</td><td>${esc(x.un)}</td>${cp ? `<td style="text-align:right">${x.precio != null ? esc(plata(x.precio)) : "sin precio"}</td><td style="text-align:right">${x.precio != null ? esc(plata(cantDe(x) * x.precio)) : "—"}</td>` : ""}</tr>`).join("")}</tbody></table>
${cp ? `<div style="text-align:right;margin-top:8px">Total aproximado: <b>${esc(plata(tot))}</b> sin IVA (con el último precio de cada material)</div>` : ""}
<div class="foot">EMA Servicios · Alumbrado Público · Pedido de compras. Por favor confirmar disponibilidad, precio y plazo de entrega.</div><div style="display:flex;justify-content:space-between;margin-top:46px;font-size:11px"><div style="border-top:1px solid #0d1424;padding-top:4px;width:40%;text-align:center">Pidió · firma y aclaración</div><div style="border-top:1px solid #0d1424;padding-top:4px;width:40%;text-align:center">Proveedor · recibido</div></div>`;
  }
  function hoja(k) {
    const g = grupo(k); if (!g) return;
    const cp = conPrecio() && st.conPrecios;
    try { abrirHojaImpresion(`Pedido de compras · ${g.proveedor || "proveedor"} · ${fCorta(hoy())}`, hojaHtml(g, cp), "Pedido de compras"); } catch (e) { st.msg = "No pude armar la hoja."; pintar(); }
  }
  function preguntar(k) {
    const g = grupo(k); if (!g) return;
    const its = g.items.filter((x) => cantDe(x) > 0);
    const v = $("pcPreg"); v && v.remove();
    const ov = document.createElement("div"); ov.id = "pcPreg"; ov.className = "v7-ov no-print sg-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>¿Guardás el pedido a ${esc(g.proveedor || "un proveedor")}?</h3><small>${its.length} ${its.length === 1 ? "material" : "materiales"} · ${esc(fCorta(hoy()))}</small></div><button type="button" class="v7-x" data-pq="nopreg" aria-label="Cerrar">✕</button></div><p class="v7-txt">Queda anotado (sin precios) para ver lo que llega: cuando cargues el remito de ${esc(g.proveedor || "ese proveedor")}, se marca lo recibido. No compra nada ni mueve stock.</p><div class="sg-accs"><button type="button" class="btn-ghost" data-pq="nopreg">No</button><button type="button" class="btn-primary" data-pq="siguardar" data-g="${esc(k)}">Sí, guardar</button></div><div class="sg-msg" id="pcPregMsg" aria-live="polite"></div></div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  }
  async function guardar(k) {
    const g = grupo(k); if (!g) throw new Error("No encontré el pedido.");
    const ts = Date.now(), its = g.items.filter((x) => cantDe(x) > 0).map((x) => ({ codigo: x.codigo, desc: x.desc, un: x.un, cant: r2(cantDe(x)), obras: x.obras.map((o) => o.obra).slice(0, 4) }));
    const doc = { tipo: "pedidoCompra", mes: hoy().slice(0, 7), fecha: hoy(), ts, por: String((window.__fbUser || {}).email || ""), proveedor: g.proveedor || "", provN: provN(g.proveedor || ""), items: its, n: its.length };
    const r = await firebase.firestore().collection("adjuntos").add(doc);
    st.pedidos.unshift(Object.assign({ id: r && r.id }, doc));
    try { window.fbAuditar && window.fbAuditar("pedido_compra", `Pedido a ${g.proveedor || "proveedor"}: ${its.length} materiales (` + its.slice(0, 6).map((x) => x.codigo + " × " + x.cant).join(", ") + ")", { proveedor: g.proveedor || "", n: its.length }); } catch (e) { }
    return doc;
  }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-pq]"); if (!b) return;
    const a = b.dataset.pq; if (a === "cant" || a === "precios") return;
    e.preventDefault();
    if (a === "abrir") abrir();
    else if (a === "cerrar") cerrar();
    else if (a === "dias") { st.dias = +b.dataset.n || 7; st.A = null; pintar(); }
    else if (a === "hoja") hoja(b.dataset.g);
    else if (a === "guardar") preguntar(b.dataset.g);
    else if (a === "nopreg") { const x = $("pcPreg"); x && x.remove(); }
    else if (a === "siguardar") {
      const m = $("pcPregMsg"); b.disabled = true; if (m) m.textContent = "Guardando…";
      try { const d = await guardar(b.dataset.g); const x = $("pcPreg"); x && x.remove(); st.msg = `💾 Listo: guardado el pedido a ${esc(d.proveedor || "proveedor")} (${d.n} ${d.n === 1 ? "material" : "materiales"}).`; st.cant = {}; st.A = null; const ov = $("pcOv"); if (ov) ov.__h = ""; pintar(); }
      catch (er) { b.disabled = false; if (m) m.textContent = er && er.code === "permission-denied" ? "🔒 Tu usuario no puede guardar pedidos." : "⚠ No se pudo: " + ((er && (er.message || er.code)) || "sin conexión") + "."; }
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.dataset) return;
    if (t.dataset.pq === "cant") { st.cant[t.dataset.cod] = Math.max(0, num(t.value)); const ov = $("pcOv"); if (ov) ov.__h = ""; pintar(); }
    else if (t.dataset.pq === "precios") { st.conPrecios = !!t.checked; pintar(); }
  });
  // tarjeta en Pañol › Lista de compras (se arma sola, una vez por día y al abrir)
  function tarjeta() {
    const ref = $("cardStockCompras"); let c = $("pcCard");
    if (!ref || !puede()) { c && c.remove(); return; }
    const vis = ref.offsetParent !== null;
    if (!vis && c) return;
    if (vis && (!st.ts || Date.now() - st.ts > 5 * 6e4 || hoy() !== st.dia)) { st.dia = hoy(); st.ts = Date.now(); st.res = intentar(() => armar(7), null); leerPedidos(false); }
    const R = st.res; if (!R) return;
    if (!c) { c = document.createElement("div"); c.id = "pcCard"; c.className = "card no-print pq-card"; ref.parentNode.insertBefore(c, ref); }
    const h = `<div><b>🧾 Pedido de compras sugerido</b><small>Se arma solo: ${R.items.length ? `<b>${R.items.length} ${R.items.length === 1 ? "material" : "materiales"}</b> para ${R.grupos.filter((g) => g.k !== "__sin").length || "sin"} ${R.grupos.filter((g) => g.k !== "__sin").length === 1 ? "proveedor" : "proveedores"} (bajo el mínimo, lo que se acabó y lo que piden ${R.obras.length} ${R.obras.length === 1 ? "obra programada" : "obras programadas"} hasta el ${esc(fCorta(R.hasta))})` : "hoy no hace falta comprar nada"}. Nada se compra sin que lo mandes.</small></div><button type="button" class="btn-primary" data-pq="abrir">Ver el pedido</button>`;
    if (c.__h !== h) { c.innerHTML = h; c.__h = h; }
  }
  setInterval(() => { try { if (window.__v146No) return; tarjeta(); if (st.abierta) pintar(); } catch (e) { } }, 1500);
  window.__pedidoCompras = { puede, conPrecio, armar, programadas, faltaObra, ultimaEntrada, abrir, cerrar, pintar, hoja, hojaHtml, guardar, leerPedidos, estadoPedido, recibido, estado: () => ({ abierta: st.abierta, dias: st.dias, n: st.A ? st.A.items.length : null }) };
})();
