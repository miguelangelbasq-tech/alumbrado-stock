(function () {
  "use strict";
  // v146 · «Tablero del dueño» (maqueta i5, aprobada por Ángel): una pantalla con lo que pasa en un vistazo, solo
  // Administración y quien Ángel habilite (configEquipo/personal.tableroDueno.habilitados). Solo lee lo que la app ya tiene en
  // memoria (no escribe nada, salvo «Quién más lo ve», con «Sí»). La plata y el avance son SOLO de nuestra zona del contrato
  // (v144: configEquipo/precios.zonaContrato).
  //  · Avance del contrato (% y módulos), certificado (meses cerrados, v145), hecho por certificar y lo que falta; el borrador
  //    del mes; ganancia por obra y total (gastosPro, sin IVA); plata en material entregado sin avance (v145, con el último
  //    precio de las entradas); órdenes de hoy y mañana, personas en obra y ausencias; obras atrasadas (Supervisor / Gantt),
  //    fotos dudosas (v144), rendimientos que cambiaron (v143) y el gasto del asistente en el mes (v141).
  //  · Cada tarjeta lleva a su pantalla. En la compu a todo lo ancho en grilla (v139); en el celu, tarjetas una abajo de otra.
  //  · «✨ Resumen de la semana»: un pedido corto al asistente (solo Administración; cuenta para el gasto).
  //  Pruebas viejas: window.__v146No.
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const fN = (v, d) => intentar(() => fmt(+v || 0, d == null ? (Number.isInteger(r2(v)) ? 0 : 1) : d), String(v));
  const plata = (v) => intentar(() => formatMoney(v), "$ " + fN(v, 2));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoy = () => iso(new Date());
  const deIso = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const masDias = (f, n) => { const d = deIso(f); d.setDate(d.getDate() + n); return iso(d); };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const liviano = () => intentar(() => !!(window.__modoDatos && window.__modoDatos.liviano()), false);
  const yo = () => intentar(() => PERMISOS.yo() || {}, {});
  const esAdmin = () => String(yo().rol || "") === "admin";
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const ZC = () => window.__zonaContrato || null;
  const nombreObra = (o) => { const n = String((o && (o.nombre || o.plazaNombre)) || ""); return window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase(); };
  const habilitados = () => arr(obj(obj(window.__personalNube).tableroDueno).habilitados).map(String);
  function puede() {
    if (window.__v146No || !window.__fbUser || esCrew() || liviano()) return false;
    if (esAdmin()) return true;
    const u = window.__fbUser, l = habilitados();
    return l.indexOf(String(u.uid || "")) >= 0 || l.indexOf(String(u.email || "").toLowerCase()) >= 0;
  }

  // ---------------------------------------------------------------- los datos (solo nuestra zona para la plata y el avance)
  const enZona = (o) => { const z = ZC(); if (!z) return !!o && o.tipo !== "barrio" && o.tipo !== "otra"; return z.zonaDeObra(o) === z.zona(); };
  const avanceDe = (o) => intentar(() => num(calcularAvanceEtapasPct(o)), 0);
  const esProv = (id) => /^8[3-9](\.|$)/.test(String(id));
  function datos() {
    const h = hoy(), SG = window.__sugerida, man = intentar(() => SG.proxHabil(h), "") || masDias(h, 1), M = h.slice(0, 7);
    const z = intentar(() => ZC().resumen(), null) || { pct: 0, k: 0, modulos: 0, terminadas: 0, plazas: 0, label: "", n: 0, zona: "" };
    const zObras = obras().filter(enZona);
    // certificado (meses cerrados) y el borrador del mes
    const cc = obj(obj(window.__preciosNube).certCerrados);
    const kCert = Object.keys(cc).reduce((s, m) => s + num(cc[m] && cc[m].kMes), 0);
    const R = intentar(() => (window.__certMensual && !window.__v145No ? window.__certMensual.armar() : null), null);
    const modulo = R ? num(R.modulo) : intentar(() => num(window.epecModuloValor ? window.epecModuloValor() : 296126.45), 296126.45);
    const porCert = Math.max(0, num(z.k) - kCert), falta = Math.max(0, num(z.modulos) - num(z.k));
    // ganancia por obra (gastosPro: certificado − gastado, sin IVA)
    const gan = zObras.map((o) => { const f = intentar(() => window.__gastosPro.filaObra(o), null); return f && (f.total > 0 || f.certificado > 0) ? { id: o.id, obra: nombreObra(o), gastado: r2(f.total), certificado: r2(f.certificado), ganancia: r2(f.ganCe), pct: f.ganCePct } : null; }).filter(Boolean).sort((a, b) => Math.abs(b.ganancia) - Math.abs(a.ganancia));
    const ganTot = gan.reduce((s, x) => s + x.ganancia, 0), gastTot = gan.reduce((s, x) => s + x.gastado, 0);
    // material entregado sin avance (lo que salió de más contra lo que justifica el avance, con el último precio)
    const precioDe = (c) => intentar(() => { const p = stockUltimoPrecio(c); return p ? num(p.precioUnit) : 0; }, 0);
    const mat = [];
    zObras.forEach((o) => { const D = intentar(() => window.__matAvance.deObra(o), null); if (!D) return; let s = 0, sinP = 0; arr(D.filas).forEach((f) => { if (!(f.dif > 0) || f.unDist) return; const p = precioDe(f.codigo); if (!(p > 0)) { sinP++; return; } let fu = 1; const b = intentar(() => stockBase(f.codigo), null); if (b && b.un && f.un && window.__nU && window.__nU(b.un) !== window.__nU(f.un)) fu = intentar(() => num(window.__factorUn(f.codigo, f.un)), 0) || 0; if (!(fu > 0)) return; s += (f.dif / fu) * p; }); if (s > 0 || sinP) mat.push({ id: o.id, obra: nombreObra(o), plata: r2(s), sinPrecio: sinP, rojos: D.rj }); });
    mat.sort((a, b) => b.plata - a.plata);
    // órdenes de hoy y mañana, gente, ausencias
    const del = (f) => ots().filter((o) => o && o.estado !== "Anulada" && String(o.fecha || "").slice(0, 10) === f);
    const oh = del(h), om = del(man), gente = new Set(); oh.filter((o) => !cerrada(o)).forEach((o) => arr(o.personal).forEach((p) => { const n = String((p && (p.nombre || p)) || "").trim(); n && gente.add(n.toLowerCase()); }));
    const aus = arr(obj(window.__personalNube).ausencias).filter((a) => a && String(a.desde || "") <= h && String(a.hasta || a.desde || "") >= h).map((a) => ({ persona: a.persona, motivo: a.motivo || "" }));
    const nom = intentar(() => (typeof window.nominaEquipo == "function" ? window.nominaEquipo() : []).filter((p) => p && p.activo !== false).length, 0);
    const cuenta = (l) => ({ n: l.length, cerradas: l.filter(cerrada).length, mandadas: l.filter((o) => !cerrada(o) && Object.keys(obj(obj(o.campo).enviados)).length).length });
    // supervisor: atrasadas, fotos dudosas, rendimientos
    const hall = intentar(() => window.__supervisor.hallazgos(), []) || [];
    const atras = hall.filter((x) => x.cat === "Al día" && x.g !== "info"), fotos = hall.filter((x) => x.cat === "Fotos" && x.g !== "info"), rend = hall.filter((x) => x.cat === "Rendimientos");
    const ia = intentar(() => window.__iaUso.estado().mes, null);
    // obras: en curso, terminadas, avance por obra
    const lista = zObras.map((o) => ({ id: o.id, obra: nombreObra(o), a: Math.round(avanceDe(o)), fin: intentar(() => !!window.__obraFin(o), false) }));
    const enCurso = lista.filter((x) => !x.fin && (x.a > 0 || ots().some((t) => String(t.plazaId) === String(x.id) && t.estado !== "Anulada")));
    // módulos del mes por día (lo que dejaron las órdenes cerradas de la zona, sin provisiones)
    const porDia = {}; const ids = {}; zObras.forEach((o) => { ids[String(o.id)] = 1; });
    ots().forEach((o) => { if (!o || !cerrada(o) || o.estado === "Anulada" || o.cierre.avanceRevertido || !ids[String(o.plazaId)] || String(o.fecha || "").slice(0, 7) !== M) return; arr(o.cierre.avanceItems).forEach((it) => { if (!it || esProv(it.id)) return; const k = intentar(() => num(window.epecItemK(String(it.id))), 0); porDia[String(o.fecha).slice(0, 10)] = (porDia[String(o.fecha).slice(0, 10)] || 0) + num(it.delta) * k; }); });
    return { h, man, M, z, kCert: r2(kCert), porCert: r2(porCert), falta: r2(falta), modulo, R: R ? { txt: R.txt, kMes: r2(R.kMes), kProv: r2(R.kProv), sinIva: R.sinIva, conIva: R.conIva, cerrado: !!R.cerrado, revisar: arr(R.revisar).length } : null,
      gan, ganTot: r2(ganTot), gastTot: r2(gastTot), mat, matTot: r2(mat.reduce((s, x) => s + x.plata, 0)), oh: cuenta(oh), om: cuenta(om), gente: gente.size, nom, aus, atras, fotos, rend, ia, lista, enCurso, porDia };
  }

  // ---------------------------------------------------------------- pantalla
  const ic = (n, c) => intentar(() => window.__v135.ic(n, 1.6, "v5-ic " + (c || "s18")), "");
  function anillo(p) { const L = 2 * Math.PI * 46; return `<div class="td-anillo"><svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true"><circle cx="52" cy="52" r="46" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="6"/><circle cx="52" cy="52" r="46" fill="none" stroke="#89C2DB" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(L * Math.max(0, Math.min(100, p))) / 100} ${L}" transform="rotate(-90 52 52)"/></svg><div class="td-ac"><b>${esc(fN(p, 1))}<small>%</small></b><span>CONTRATO</span></div></div>`; }
  const colP = (p) => (p >= 100 ? "#34C759" : p >= 60 ? "#3B6FD8" : p >= 30 ? "#FFB020" : p > 0 ? "#FF3B30" : "#A7AFC0");
  function linea(D) {
    const dias = Object.keys(D.porDia).sort(); const ult = deIso(D.h); const fin = new Date(ult.getFullYear(), ult.getMonth() + 1, 0).getDate();
    let ac = 0; const pts = []; for (let d = 1; d <= ult.getDate(); d++) { const f = D.M + "-" + pad(d); ac += num(D.porDia[f]); pts.push([d, ac]); }
    const W = 520, H = 220, pad0 = 34, mx = Math.max(10, Math.ceil(ac * 1.15 / 10) * 10), X = (d) => pad0 + ((d - 1) / Math.max(1, fin - 1)) * (W - pad0 * 2), Y = (v) => H - 22 - (v / mx) * (H - 40);
    const rl = pts.map(([d, v]) => X(d).toFixed(1) + "," + Y(v).toFixed(1)).join(" "), last = pts[pts.length - 1] || [1, 0];
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Módulos del mes por día" font-family="JetBrains Mono,monospace">${[0, mx / 2, mx].map((v) => `<path d="M${pad0} ${Y(v).toFixed(1)}H${W - pad0}" stroke="#e6e9f2"/><text x="${pad0 - 6}" y="${(Y(v) + 4).toFixed(1)}" font-size="10" fill="#6e7c93" text-anchor="end">${esc(fN(v, 0))}</text>`).join("")}
<polygon points="${X(1).toFixed(1)},${Y(0).toFixed(1)} ${rl} ${X(last[0]).toFixed(1)},${Y(0).toFixed(1)}" fill="rgba(40,40,94,.08)"/><polyline points="${rl}" fill="none" stroke="#28285E" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${X(last[0]).toFixed(1)}" cy="${Y(last[1]).toFixed(1)}" r="5" fill="#28285E" stroke="#fff" stroke-width="2"/>
${[1, 8, 15, 22, fin].map((d) => `<text x="${X(d).toFixed(1)}" y="${H - 6}" font-size="10" fill="#6e7c93" text-anchor="middle">${d}/${+D.M.slice(5, 7)}</text>`).join("")}</svg>${dias.length ? "" : '<div class="sg-hint">Este mes todavía no se cerró ninguna orden con avance de la zona.</div>'}`;
  }
  const al = (cls, t, s, ir) => `<button type="button" class="td-al ${cls}" data-td="${esc(ir)}"><span class="td-ali">${cls === "ok" ? "✓" : "⚠"}</span><span><b>${esc(t)}</b><small>${esc(s)}</small></span></button>`;
  function html() {
    const D = datos(), u = yo(), nom = String(u.nombre || u.usuario || "").split(/\s+/)[0] || "", d0 = new Date(), adm = esAdmin();
    const pc = (v, t) => (t > 0 ? (v / t) * 100 : 0), zm = num(D.z.modulos);
    const hero = `<section class="td-hero">${anillo(D.z.pct)}<div class="td-sal"><div class="td-e">${esc(DIAS[d0.getDay()])} ${d0.getDate()} de ${esc(MESES[d0.getMonth()])}</div><h1>Buen día${nom ? ",<br><b>" + esc(nom) + "</b>" : ""}</h1><div class="td-z">${esc(D.z.label || "Nuestra zona")} · ${esc(fN(D.z.plazas, 0))} plazas · ${esc(fN(zm, 0))} módulos</div></div>
<div class="td-kpis"><button type="button" class="td-kpi" data-td="ir:avance"><b>${D.enCurso.length}</b><span>obras<br>en curso</span></button><button type="button" class="td-kpi am" data-td="ir:super"><b>${D.atras.length}</b><span>obras<br>atrasadas</span></button><button type="button" class="td-kpi vd" data-td="ir:avance"><b>${esc(fN(D.z.terminadas, 0))}</b><span>obras<br>terminadas</span></button><button type="button" class="td-kpi" data-td="ir:ordenes"><b>${D.gente}</b><span>personas en<br>obra hoy</span></button><button type="button" class="td-kpi" data-td="ir:ordenes"><b>${D.oh.n}</b><span>órdenes<br>de hoy</span></button></div></section>`;
    const cCert = `<div class="td-cd" data-td="ir:cert" role="button" tabindex="0"><div class="td-eti">Certificado y por certificar <span>en módulos · ${esc(D.z.zona ? "zona " + D.z.zona : "")}</span></div>
<div class="td-dos"><div><div class="td-big">${esc(fN(D.kCert, 1))}</div><div class="td-sub">Certificado (meses cerrados)</div></div><div><div class="td-big am">${esc(fN(D.porCert, 1))}</div><div class="td-sub">Hecho, por certificar</div></div></div>
<div class="td-stk"><i style="width:${pc(D.kCert, zm).toFixed(2)}%;background:var(--navy)"></i><i style="width:${pc(D.porCert, zm).toFixed(2)}%;background:var(--amber,#FF9F0A)"></i></div>
<div class="td-ley"><span><i style="background:var(--navy)"></i>Certificado ${esc(fN(pc(D.kCert, zm), 1))} %</span><span><i style="background:var(--amber,#FF9F0A)"></i>Por certificar ${esc(fN(pc(D.porCert, zm), 1))} %</span><span><i style="background:rgba(40,40,94,.12)"></i>Falta ${esc(fN(D.falta, 0))} de ${esc(fN(zm, 0))} mód.</span></div>
${D.R ? `<div class="td-pl"><span>${D.R.cerrado ? "Certificado" : "Borrador"} de ${esc(D.R.txt)}</span><b>${esc(fN(D.R.kMes + D.R.kProv, 2))} mód. · ${esc(plata(D.R.sinIva))}</b></div><div class="td-pl"><span>Con IVA</span><b>${esc(plata(D.R.conIva))}</b></div>${D.R.revisar ? `<div class="td-sub am">⚠ ${D.R.revisar} ${D.R.revisar === 1 ? "cosa" : "cosas"} para revisar antes de certificar</div>` : ""}` : ""}
<div class="td-pl"><span>Lo que falta certificar del contrato</span><b>${esc(fN(zm - D.kCert, 0))} mód. · ${esc(plata((zm - D.kCert) * D.modulo))}</b></div></div>`;
    const cGan = `<div class="td-cd" data-td="ir:ganancia" role="button" tabindex="0"><div class="td-eti">Ganancia por obra <span>certificado − gastado · sin IVA</span></div>
<div class="td-big${D.ganTot < 0 ? " rj" : ""}">${esc(plata(D.ganTot))}</div><div class="td-sub">Total de ${D.gan.length} ${D.gan.length === 1 ? "obra" : "obras"} con gastos o certificado · gastado ${esc(plata(D.gastTot))}</div>
${D.gan.slice(0, 6).map((x) => `<div class="td-hb"><span>${esc(x.obra)}</span><b class="${x.ganancia < 0 ? "rj" : "vd"}">${esc(plata(x.ganancia))}</b></div>`).join("") || '<div class="td-sub">Todavía no hay gastos cargados por obra.</div>'}</div>`;
    const cMat = `<div class="td-cd" data-td="ir:${D.mat[0] ? "obra:" + esc(D.mat[0].id) : "obras"}" role="button" tabindex="0"><div class="td-eti">Material entregado sin avance <span>último precio · sin IVA</span></div>
<div class="td-big${D.matTot > 0 ? " am" : ""}">${esc(plata(D.matTot))}</div><div class="td-sub">Salió del pañol más de lo que justifica el avance (material contra avance)</div>
${D.mat.slice(0, 5).map((x) => `<div class="td-hb"><span>${esc(x.obra)}</span><b>${esc(plata(x.plata))}${x.sinPrecio ? ` <small>+${x.sinPrecio} sin precio</small>` : ""}</b></div>`).join("") || '<div class="td-sub">Parejo: nada de más sin explicar. 👌</div>'}</div>`;
    const cOts = `<div class="td-cd" data-td="ir:ordenes" role="button" tabindex="0"><div class="td-eti">Órdenes y gente <span class="td-vivo">● hoy</span></div>
<div class="td-dos"><div><div class="td-big">${D.oh.n}</div><div class="td-sub">órdenes hoy · ${D.oh.mandadas} para cerrar · ${D.oh.cerradas} cerradas</div></div><div><div class="td-big">${D.om.n}</div><div class="td-sub">${esc(D.man === masDias(D.h, 1) ? "mañana" : "el " + DIAS[deIso(D.man).getDay()])}</div></div></div>
<div class="td-pl"><span>Personas en obra hoy</span><b>${D.gente}${D.nom ? " de " + D.nom : ""}</b></div><div class="td-pl"><span>Ausencias hoy</span><b>${D.aus.length}</b></div>${D.aus.length ? `<div class="td-sub">${esc(D.aus.slice(0, 5).map((a) => (window.__fmtNombre && window.__fmtNombre.persona ? window.__fmtNombre.persona(a.persona) : a.persona) + (a.motivo ? " (" + a.motivo + ")" : "")).join(" · "))}</div>` : ""}</div>`;
    const cAv = `<div class="td-cd td-av" data-td="ir:avance" role="button" tabindex="0"><div class="td-eti">Avance por obra <span>en curso · zona ${esc(D.z.zona || "")}</span></div>${D.enCurso.sort((a, b) => b.a - a.a).slice(0, 10).map((x) => `<div class="td-ob"><span>${esc(x.obra)}</span><div class="td-barra"><i style="width:${Math.max(x.a, 1.5)}%;background:${colP(x.a)}"></i></div><b>${x.a} %</b></div>`).join("") || '<div class="td-sub">No hay obras en curso en la zona.</div>'}</div>`;
    const totMes = Object.keys(D.porDia).reduce((s, k) => s + D.porDia[k], 0);
    const cMes = `<div class="td-cd td-mes" data-td="ir:cert" role="button" tabindex="0"><div class="td-eti">${esc(MESES[+D.M.slice(5, 7) - 1])} · módulos certificables <span>órdenes cerradas · zona</span></div>${linea(D)}<div class="td-sub">Vamos <b>${esc(fN(totMes, 1))} mód.</b> en el mes (sin provisiones). Sin plan mensual cargado para comparar.</div></div>`;
    const ia = D.ia && D.ia.gastoMes != null ? D.ia : null, alertas = [];
    if (D.atras.length) alertas.push(al("rj", `${D.atras.length} ${D.atras.length === 1 ? "obra atrasada" : "obras atrasadas"} contra el plan`, D.atras.slice(0, 3).map((x) => x.t.replace(/: (viene )?atrasada$/, "")).join(" · "), "ir:super"));
    if (D.fotos.length) alertas.push(al("am", `Fotos dudosas (${D.fotos.length})`, D.fotos[0].t, "ir:fotos"));
    if (D.mat.some((x) => x.rojos)) alertas.push(al("am", "Material sin explicar", D.mat.filter((x) => x.rojos).slice(0, 3).map((x) => x.obra).join(" · ") + " · material contra avance", "ir:obra:" + (D.mat.find((x) => x.rojos) || {}).id));
    if (D.oh.mandadas) alertas.push(al("am", `${D.oh.mandadas} ${D.oh.mandadas === 1 ? "orden para cerrar" : "órdenes para cerrar"}`, "La cuadrilla ya las mandó", "ir:ordenes"));
    D.rend.forEach((x) => alertas.push(al("in", x.t, x.s, "ir:aprende")));
    alertas.push(al(ia && ia.tope && ia.gastoMes / ia.tope > 0.8 ? "am" : "ok", ia ? `Asistente: US$ ${fN(ia.gastoMes, 2)} este mes${ia.tope ? " de " + fN(ia.tope, 0) : ""}` : "Asistente: gasto del mes sin datos", ia ? "Preguntas, remitos y supervisor (Worker ema-ia)" : "Se ve cuando el Worker contesta /uso", "ir:ia"));
    const cAl = `<div class="td-cd td-alc"><div class="td-eti">Alertas <span>${alertas.filter((x) => / rj"/.test(x)).length ? "con rojo" : "para mirar"}</span></div>${alertas.join("")}</div>`;
    const cRes = adm ? `<div class="td-cd td-res"><div class="td-eti">✨ Resumen de la semana <span>asistente · cuenta para el gasto</span></div>${st.res ? `<div class="td-rtx" id="tdResTx">${esc(st.res).replace(/\n/g, "<br>")}</div>` : '<div class="td-sub">Un pedido corto al asistente con lo de arriba (sin inventar nada).</div>'}<button type="button" class="btn-primary" data-td="resumen"${st.pidiendo ? " disabled" : ""}>${st.pidiendo ? "Pidiendo…" : "✨ Resumen de la semana"}</button></div>` : "";
    const cQuien = adm ? quienHtml() : "";
    return `<div class="sg-bar0"><button type="button" class="sg-bt" data-td="cerrar" aria-label="Volver">‹</button><div class="sg-bt0"><b>Tablero del dueño</b><small>Lo que pasa, en un vistazo</small></div><button type="button" class="sg-bt" data-td="cerrar" aria-label="Cerrar">✕</button></div>
<div class="sg-in td-in">${hero}<div class="td-gr">${cCert}${cGan}${cOts}${cAv}${cMes}${cAl}${cMat}${cRes}${cQuien}</div><div class="sg-hint td-pie">La plata y el avance son solo de ${esc(D.z.label || "nuestra zona del contrato")}. Montos sin IVA (salvo donde dice). Nada se cambia desde acá: cada tarjeta lleva a su pantalla.</div></div>`;
  }
  // ---- quién más lo ve (solo Administración, con «Sí»)
  function quienHtml() {
    const us = intentar(() => PERMISOS.lista() || [], []).filter((x) => x && x.uid && x.activo !== false && x.pendiente !== true && (x.rol === "oficina")), l = habilitados();
    if (!us.length) return "";
    return `<div class="td-cd td-quien"><div class="td-eti">¿Quién más lo ve? <span>solo Administración lo cambia</span></div>${us.map((x) => `<label class="td-q"><input type="checkbox" data-tdq="${esc(x.uid)}"${l.indexOf(String(x.uid)) >= 0 ? " checked" : ""}> ${esc(x.nombre || x.usuario || x.email)} <small>${esc(x.rol)}</small></label>`).join("")}<button type="button" class="btn-ghost" data-td="quien">${st.seguro ? "Sí, guardar" : "Guardar"}</button><div class="td-sub" id="tdQMsg">${esc(st.qmsg || "")}</div></div>`;
  }
  async function guardarQuien() {
    if (!esAdmin()) return;
    const l = [].slice.call(document.querySelectorAll("#tdOv [data-tdq]:checked")).map((x) => x.dataset.tdq);
    if (!st.seguro) { st.seguro = true; st.qmsg = l.length ? "Lo van a ver (con la plata): " + l.length + (l.length === 1 ? " persona" : " personas") + ". Tocá «Sí, guardar»." : "Lo vas a ver solo vos. Tocá «Sí, guardar»."; st.sel = l; pintar(true); return; }
    st.seguro = false;
    try {
      await firebase.firestore().collection("configEquipo").doc("personal").set({ tableroDueno: { habilitados: st.sel || l, ts: Date.now(), por: String((window.__fbUser || {}).email || "") } }, { merge: true });
      window.__personalNube = Object.assign({}, window.__personalNube || {}, { tableroDueno: { habilitados: st.sel || l } });
      try { window.fbAuditar && window.fbAuditar("tablero_dueno", "Quién ve el tablero del dueño: " + (st.sel || l).length, {}); } catch (e) { }
      st.qmsg = "✓ Guardado.";
    } catch (e) { st.qmsg = "⚠ No se pudo guardar (" + ((e && (e.code || e.message)) || "sin conexión") + ")."; }
    pintar(true);
  }
  const st = { abierta: false, res: "", pidiendo: false, seguro: false, qmsg: "", sel: null };
  function pintar(forzar) {
    const ov = $("tdOv"); if (!ov || ov.hidden) return;
    if (forzar) ov.__h = "";
    if (!forzar && document.activeElement && ov.contains(document.activeElement) && document.activeElement.dataset && document.activeElement.dataset.tdq != null) return;
    const h = html(); if (ov.__h === h) return;
    const sc = ov.querySelector(".sg-in"), y = sc ? sc.scrollTop : 0, sel = st.seguro ? null : [].slice.call(ov.querySelectorAll("[data-tdq]")).map((x) => [x.dataset.tdq, x.checked]);
    ov.innerHTML = h; ov.__h = h; const s2 = ov.querySelector(".sg-in"); if (s2) s2.scrollTop = y;
    if (st.seguro && st.sel) ov.querySelectorAll("[data-tdq]").forEach((x) => { x.checked = st.sel.indexOf(x.dataset.tdq) >= 0; });
    else if (sel && sel.length) sel.forEach(([k, v]) => { const x = ov.querySelector(`[data-tdq="${CSS.escape(k)}"]`); if (x) x.checked = v; });
  }
  function abrir() {
    if (!puede()) { try { window.mostrarAviso && window.mostrarAviso("🔒 El tablero del dueño lo ve Administración (y quien habilite).", "error"); } catch (e) { } return false; }
    st.abierta = true;
    let ov = $("tdOv"); if (!ov) { ov = document.createElement("div"); ov.id = "tdOv"; ov.className = "no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Tablero del dueño"); document.body.appendChild(ov); }
    ov.hidden = false; ov.__h = ""; pintar();
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    try { if (window.__iaUso && window.__iaUso.uso) window.__iaUso.uso().then(() => pintar(), () => { }); } catch (e) { }
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function cerrar() { const ov = $("tdOv"); if (ov) ov.hidden = true; st.abierta = false; }
  function ir(dest) {
    const V = window.__v135, d = String(dest || "");
    const vista = (v) => { cerrar(); try { window.mostrarVista(v); } catch (e) { } };
    if (d === "cert") { cerrar(); if (!(window.__certMensual && window.__certMensual.abrir())) vista("avance"); }
    else if (d === "avance") vista("avance");
    else if (d === "ganancia") { cerrar(); try { localStorage.setItem("ema.gastos.tab", "ganancia"); } catch (e) { } vista("gastos"); setTimeout(() => { const b = document.querySelector('#gastosTabs [data-gtab="ganancia"]'); b && b.click(); }, 120); }
    else if (d === "ordenes") { cerrar(); if (V && V.irOrdenes) V.irOrdenes(); else vista("parte"); }
    else if (d === "super") { cerrar(); if (window.__supervisor && window.__supervisor.hoja) window.__supervisor.hoja(); else vista("inicio"); }
    else if (d === "fotos") { cerrar(); if (window.__obraGps && window.__obraGps.hojaSup) window.__obraGps.hojaSup(); else vista("obras"); }
    else if (d === "aprende") { cerrar(); if (window.__sugerida && window.__sugerida.abrirAprende) window.__sugerida.abrirAprende(); }
    else if (d === "ia") { cerrar(); if (typeof window.__asistenteAbrir == "function") window.__asistenteAbrir(); }
    else if (d === "obras") vista("obras");
    else if (d.indexOf("obra:") === 0) { cerrar(); try { window.mostrarVista("obras"); setTimeout(() => window.abrirLegajo(d.slice(5)), 150); } catch (e) { } }
  }
  async function resumen() {
    if (!esAdmin() || st.pidiendo) return null;
    const D = datos(), semana = masDias(D.h, -7);
    const cerradas = ots().filter((o) => o && cerrada(o) && o.estado !== "Anulada" && String(o.fecha || "") >= semana && String(o.fecha || "") <= D.h);
    const datosIa = { hoy: D.h, zona: D.z.label, avanceZonaPct: r2(D.z.pct), modulosZona: D.z.modulos, modulosHechos: r2(D.z.k), certificadoMod: D.kCert, porCertificarMod: D.porCert, borradorMes: D.R, modulo: D.modulo, gananciaTotalSinIva: D.ganTot, gananciaPorObra: D.gan.slice(0, 8), materialSinAvanceSinIva: D.matTot, materialPorObra: D.mat.slice(0, 5), ordenesCerradasSemana: cerradas.length, ordenesHoy: D.oh, ordenesManana: D.om, personasEnObraHoy: D.gente, ausencias: D.aus, atrasadas: D.atras.map((x) => x.t + " — " + x.s), fotosDudosas: D.fotos.map((x) => x.t), rendimientos: D.rend.map((x) => x.t), asistenteGastoUsd: D.ia ? D.ia.gastoMes : null, obrasEnCurso: D.enCurso.slice(0, 12) };
    st.pidiendo = true; pintar(true);
    try {
      const A = await window.__iaCargar(); if (!A || !window.__asistente || !window.__asistente.resumenSemana) throw new Error("el asistente no está listo");
      const r = await window.__asistente.resumenSemana(datosIa);
      st.res = r && r.texto ? String(r.texto) : "⚠ " + ((r && r.error) || "No hubo respuesta.");
    } catch (e) { st.res = "⚠ No se pudo: " + ((e && e.message) || e); }
    st.pidiendo = false; pintar(true);
    return st.res;
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-td]"); if (!b) return;
    const a = b.dataset.td; if (b.closest("#tdOv") && e.target.closest("[data-tdq]")) return;
    e.preventDefault();
    if (a === "abrir") abrir();
    else if (a === "cerrar") cerrar();
    else if (a === "resumen") resumen();
    else if (a === "quien") guardarQuien();
    else if (a.indexOf("ir:") === 0) ir(a.slice(3));
  });
  document.addEventListener("keydown", (e) => { const t = e.target; if ((e.key === "Enter" || e.key === " ") && t && t.classList && t.classList.contains("td-cd") && t.dataset.td) { e.preventDefault(); ir(t.dataset.td.slice(3)); } });
  function menu() {
    const ref = $("menuCert") || document.querySelector('#menuLateral [data-vista="informe"]') || document.querySelector('#menuLateral [data-vista="inicio"]'); let m = $("menuTableroDueno");
    if (!puede()) { m && m.remove(); return; }
    if (!ref || m) return;
    m = document.createElement("button"); m.type = "button"; m.id = "menuTableroDueno"; m.className = ref.className.replace(/\b(activo|active|on)\b/g, ""); m.setAttribute("data-td", "abrir");
    m.innerHTML = '<span class="nav-ico">📊</span><span class="nav-txt">Tablero del dueño</span>';
    const ini = document.querySelector('#menuLateral [data-vista="inicio"]');
    (ini || ref).insertAdjacentElement("afterend", m);
  }
  function accesoHtml() { return puede() ? '<button type="button" class="ie-acc" data-td="abrir"><span class="ie-ic" style="display:flex;align-items:center;justify-content:center;font-size:22px">📊</span>Tablero del dueño</button>' : ""; }
  setInterval(() => { try { menu(); if (st.abierta) pintar(); } catch (e) { } }, 2000);
  window.__tableroDueno = { puede, datos, abrir, cerrar, pintar, ir, resumen, accesoHtml, estado: () => ({ abierta: st.abierta, res: st.res }) };
})();
