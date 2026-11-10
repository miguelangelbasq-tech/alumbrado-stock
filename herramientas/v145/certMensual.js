(function () {
  "use strict";
  // v145 · Certificación mensual automática (maqueta i1 aprobada por Ángel). La arma la app con lo que ya tiene:
  //  · Qué se hizo en cada mes: el avance que dejó cada orden al cerrarse (cierre.avanceItems, con la fecha de la orden),
  //    salvo las anuladas con el avance descontado. Lo cargado a mano en el itemizado no tiene fecha: NO se reparte, se
  //    avisa («sin fecha: N ítems, revisalos»).
  //  · Solo la zona del contrato (configEquipo/precios.zonaContrato, v144: de entrada A · Este, 18.407 módulos).
  //  · Plazas ya ejecutadas: lo certificado por la Municipalidad (CERTIF_MUNI) va como acumulado anterior.
  //  · Por ítem: K × módulo (los mismos K y el mismo módulo del itemizado: epecItemK, epecTotales().modulo, sin IVA) ×
  //    cantidad del mes, con el acumulado anterior, el del mes, el acumulado total y lo contratado. Provisiones 83–89 aparte.
  //  · Cerrar el mes (solo Administración, con «Sí»): foto fija por obra en avanceObras/{id}.certificados.<AAAA-MM>
  //    (cantidades y K) y la marca en configEquipo/precios.certCerrados.<AAAA-MM> (módulo, totales). Sin reglas nuevas.
  //    Un mes cerrado no cambia: lo que se cargue después con fecha de ese mes va al mes siguiente, con un aviso.
  //  · Plata: solo quien edita Informes o Gastos (Administración y Oficina). Pruebas viejas: window.__v145No.
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r4 = (v) => Math.round((+v || 0) * 1e4) / 1e4;
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const fN = (v, d) => { const x = +v || 0; const dd = d != null ? d : Number.isInteger(r4(x)) ? 0 : 2; return intentar(() => fmt(x, dd), x.toLocaleString("es-AR", { minimumFractionDigits: dd, maximumFractionDigits: dd })); };
  const plata = (v) => "$ " + (+v || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const esAdmin = () => intentar(() => !!(PERMISOS.esAdmin && PERMISOS.esAdmin()), false);
  const IVA = 0.21;
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const pad = (n) => String(n).padStart(2, "0");
  const mesDe = (f) => { const m = String(f || "").match(/^(\d{4})-(\d\d)/); return m ? m[1] + "-" + m[2] : ""; };
  const mesHoy = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
  const mesMas = (M, n) => { const [a, m] = M.split("-").map(Number), d = new Date(a, m - 1 + n, 1); return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
  const mesTxt = (M) => { const m = String(M).match(/^(\d{4})-(\d\d)$/); return m ? MESES[+m[2] - 1] + " " + m[1] : M; };
  const fCorta = (ts) => { const d = new Date(ts); return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); };
  const nombre = (o) => String((o && (o.nombre || o.plazaNombre)) || "").toUpperCase();

  function puedePlata() { return !window.__v145No && !!window.__fbUser && !esCrew() && (permiso("informe") === "editar" || permiso("gastos") === "editar"); }
  const zc = () => window.__zonaContrato || null;
  function enZona(o) { const z = zc(); if (!o || o.id === "__sinObra") return false; if (!z) return o.tipo !== "barrio" && o.tipo !== "otra"; return z.zonaDeObra(o) === z.zona(); }
  const K = (id) => intentar(() => num(window.epecItemK(id)), 0);
  const desc = (id) => intentar(() => window.epecItemDesc(id) || "", "") || "Ítem " + id;
  const unDe = (id) => intentar(() => window.epecItemUn(id) || "", "");
  const esProv = (id) => intentar(() => !!window.epecEsEventualidad(id), false) || /^8[3-9](\.|$)/.test(String(id));
  const moduloHoy = () => intentar(() => num(window.epecTotales().modulo), 0);
  const cerrados = () => obj(obj(window.__preciosNube).certCerrados);
  const cerrado = (M) => obj(cerrados()[M]).ts ? cerrados()[M] : null;
  function ultimoCerradoAntes(M) { return Object.keys(cerrados()).filter((x) => /^\d{4}-\d\d$/.test(x) && x < M && cerrado(x)).sort().pop() || ""; }
  const dejoAvance = (o) => !!o && Array.isArray(o.cierre && o.cierre.avanceItems) && o.cierre.avanceItems.length > 0 && !o.cierre.avanceRevertido;
  const fechaOt = (o) => String(o.fecha || "").slice(0, 10) || (o.cierre && o.cierre.cerradoTs ? new Date(o.cierre.cerradoTs).toISOString().slice(0, 10) : "");

  // ---------------------------------------------------------------- datos de una obra
  function filas(o) {
    const m = {};
    (o.valorItems || []).forEach((r) => { if (r && r.itemPliego) { const k = String(r.itemPliego), x = m[k] || (m[k] = { cant: 0, hecho: 0 }); x.cant += num(r.cantidad); x.hecho += num(r.cantidadAvanzada); } });
    (o.valorItemsEpec || []).forEach((r) => { if (r && r.itemEpec) { const k = String(r.itemEpec), x = m[k] || (m[k] = { cant: 0, hecho: 0 }); x.cant += num(r.cantidad); x.hecho += num(r.cantidadAvanzada); } });
    return m;
  }
  function fechados(o) {   // id → [{f, q, ot}]
    const m = {};
    ots().forEach((t) => {
      if (!t || String(t.plazaId || "") !== String(o.id) || !dejoAvance(t)) return;
      const f = fechaOt(t); if (!f) return;
      t.cierre.avanceItems.forEach((a) => { if (!a || !(num(a.delta) > 0)) return; (m[String(a.id)] = m[String(a.id)] || []).push({ f, q: num(a.delta), ot: t.numero || "orden" }); });
    });
    return m;
  }
  // plaza ya ejecutada: lo certificado por la Municipalidad (CERTIF_MUNI). Solo por la hoja asignada o el ID de obra exacto
  // (sin ceros adelante): sin cruces por parecido de nombre (el cruce automático de la app está apagado).
  function muniDe(o) {
    return intentar(() => {
      const C = window.CERTIF_MUNI; if (!C || !Array.isArray(C.plazas)) return {};
      const sc = (x) => String(x || "").trim().toUpperCase().replace(/^([A-Z]*)0+(?=\d)/, "$1");
      let p = o.certifHoja ? C.plazas.find((x) => x.n === o.certifHoja) : null;
      const id = sc(o.obraId); if (!p && id) p = C.plazas.find((x) => arr(x.ids).some((i) => sc(i) === id));
      return p ? obj(p.it) : {};
    }, {});
  }

  // ---------------------------------------------------------------- el certificado de un mes
  function deObra(o, M) {
    const F = filas(o), D = fechados(o), MU = muniDe(o), P = ultimoCerradoAntes(M), C = cerrado(M), snapM = C ? obj(obj(o.certificados)[M]).it || null : null;
    const snapP = P ? obj(obj(obj(o.certificados)[P]).it) : null;
    const ids = Object.keys(Object.assign({}, F, D, MU, snapM || {})).sort((a, b) => parseFloat(a) - parseFloat(b) || String(a).localeCompare(String(b)));
    const fin = M + "-31", ini = M + "-01", out = [];
    ids.forEach((id) => {
      const l = arr(D[id]), mu = num(MU[id]), f = F[id] || { cant: 0, hecho: 0 };
      const suma = (pr) => l.filter(pr).reduce((s, x) => s + x.q, 0);
      const otsMes = [...new Set(l.filter((x) => x.f >= ini && x.f <= fin).map((x) => x.ot))];
      let ant, mes, tarde = 0, k = K(id);
      if (C) {
        const s = snapM ? obj(snapM[id]) : {};
        mes = num(s.m); ant = num(s.a) - num(s.m); if (s.k != null) k = num(s.k);
        tarde = Math.max(0, mu + suma((x) => x.f <= fin) - num(s.a));   // cargado después del cierre: va al mes siguiente
      } else if (P) {
        const s = obj(snapP[id]), acP = s.a != null ? num(s.a) : mu, finP = P + "-31";
        const late = Math.max(0, mu + suma((x) => x.f <= finP) - acP), primero = mesMas(P, 1) === M;
        ant = acP + suma((x) => x.f > finP && x.f < ini) + (primero ? 0 : late);
        mes = suma((x) => x.f >= ini && x.f <= fin) + (primero ? late : 0);
        if (primero && late > 1e-6) tarde = -late;   // en este mes entra lo que se cargó tarde del cerrado
      } else {
        ant = mu + suma((x) => x.f < ini);
        mes = suma((x) => x.f >= ini && x.f <= fin);
      }
      const total = mu + suma(() => true), sinFecha = F[id] ? r4(f.hecho - total) : 0;   // lo certificado por la Municipalidad sin renglón en el itemizado: solo anterior
      const acum = r4(ant + mes);
      if (!(f.cant > 0) && !(acum > 0) && !(mes > 0) && !(Math.abs(sinFecha) > 1e-4)) return;
      out.push({ id, desc: desc(id), un: unDe(id), k, prov: esProv(id), cant: r4(f.cant), hecho: r4(f.hecho), muni: mu, ant: r4(ant), mes: r4(mes), acum, sinFecha: Math.abs(sinFecha) > 1e-3 ? sinFecha : 0, demas: f.cant > 0 && (acum > f.cant + 1e-4 || f.hecho > f.cant + 1e-4), tarde: r4(tarde), ots: otsMes });
    });
    let df = []; try { df = arr(typeof window.__diferenciasObra == "function" ? window.__diferenciasObra(o) : []); } catch (e) { df = []; }
    const sum = (pr, c) => out.filter(pr).reduce((s, x) => s + x[c] * x.k, 0);
    return { o, id: o.id, nombre: nombre(o), ID: String(o.obraId || ""), muni: Object.keys(MU).length > 0, filas: out, dif: df, kMes: sum((x) => !x.prov, "mes"), kMesProv: sum((x) => x.prov, "mes"), kAcum: sum((x) => !x.prov, "acum"), kAnt: sum((x) => !x.prov, "ant") };
  }
  function armar(M, soloObra) {
    M = M || mesHoy();
    const C = cerrado(M), mod = C && num(C.modulo) > 0 ? num(C.modulo) : moduloHoy();
    const z = intentar(() => zc().resumen(), null);
    const lista = obras().filter((o) => enZona(o) && (!soloObra || String(o.id) === String(soloObra))).map((o) => deObra(o, M)).filter((x) => x.filas.length);
    const fuera = obras().filter((o) => o && o.id !== "__sinObra" && !enZona(o) && Object.keys(fechados(o)).length).length;
    const conMes = lista.filter((x) => x.filas.some((f) => f.mes > 1e-6));
    const revisar = [];
    lista.forEach((x) => {
      const sf = x.filas.filter((f) => f.sinFecha), dm = x.filas.filter((f) => f.demas), td = x.filas.filter((f) => f.tarde > 1e-6), te = x.filas.filter((f) => f.tarde < -1e-6);
      if (sf.length) revisar.push({ g: "am", obraId: x.id, t: `${x.nombre}: sin fecha ${sf.length} ${sf.length === 1 ? "ítem" : "ítems"}, revisalos`, s: sf.slice(0, 4).map((f) => `ítem ${f.id}: ${f.sinFecha > 0 ? fN(f.sinFecha) + " " + (f.un || "") + " cargado a mano (no sale de ninguna orden)" : "las órdenes" + (x.muni ? " y lo certificado" : "") + " suman " + fN(-f.sinFecha) + " más que el itemizado"}`).join(" · ") + ". No se reparten: no entran en ningún mes hasta que los revises." });
      if (dm.length) revisar.push({ g: "rj", obraId: x.id, t: `${x.nombre}: hechas de más`, s: dm.slice(0, 4).map((f) => `ítem ${f.id}: ${fN(Math.max(f.acum, f.hecho))} de ${fN(f.cant)} contratadas`).join(" · ") });
      if (x.dif.length) revisar.push({ g: "am", obraId: x.id, t: `${x.nombre}: diferencias del Supervisor`, s: x.dif.slice(0, 3).map((d) => `${d.nombre || d.item || ""}: hecho ${fN(num(d.hecho))} · contratado ${fN(num(d.contratado))}`).join(" · ") });
      if (td.length) revisar.push({ g: "am", obraId: x.id, t: `${x.nombre}: se cargó después del cierre`, s: td.map((f) => `ítem ${f.id}: ${fN(f.tarde)} ${f.un || ""}`).join(" · ") + ` · va al certificado de ${mesTxt(mesMas(M, 1))}.` });
      if (te.length) revisar.push({ g: "info", obraId: x.id, t: `${x.nombre}: entra lo cargado tarde`, s: te.map((f) => `ítem ${f.id}: ${fN(-f.tarde)} ${f.un || ""}`).join(" · ") + ` · tenía fecha de ${mesTxt(mesMas(M, -1))}, que ya estaba cerrado.` });
    });
    const kMes = lista.reduce((s, x) => s + x.kMes, 0), kProv = lista.reduce((s, x) => s + x.kMesProv, 0), kAcum = lista.reduce((s, x) => s + x.kAcum, 0);
    const items = conMes.reduce((s, x) => s + x.filas.filter((f) => f.mes > 1e-6).length, 0);
    const modZona = z ? num(z.modulos) : 0;
    return { M, txt: mesTxt(M), cerrado: C, modulo: mod, zona: z, lista, conMes, revisar, fuera, kMes, kProv, kAcum, items, pctAcum: modZona > 0 ? (kAcum / modZona) * 100 : null,
      sinIva: (kMes + kProv) * mod, conIva: (kMes + kProv) * mod * (1 + IVA) };
  }

  // ---------------------------------------------------------------- pantalla
  const st = { M: "", obra: "", abierta: false, msg: "" };
  const tag = (f) => f.mes > 1e-6 ? (f.ots.length ? `<span class="ct-tag ok">✓ ${esc(f.ots.slice(0, 3).join(", "))}${f.ots.length > 3 ? "…" : ""}</span>` : f.tarde < 0 ? '<span class="ct-tag am">⚠ cargado tarde</span>' : "") : "";
  function tablaObra(x, R) {
    const fl = x.filas.filter((f) => !f.prov), pv = x.filas.filter((f) => f.prov), mod = R.modulo;
    const fila = (f) => `<tr class="${f.demas ? "rj" : f.sinFecha ? "am" : ""}"><td class="ct-it" data-label="Ítem">${esc(f.id)}</td><td class="ct-d" data-label="Descripción">${esc(f.desc)}${f.un ? ` <small>${esc(f.un)}</small>` : ""}${f.sinFecha ? `<small class="am">⚠ sin fecha: ${esc(fN(f.sinFecha))}</small>` : ""}${f.demas ? '<small class="rj">⚠ hechas de más</small>' : ""}</td><td class="n" data-label="K">${esc(fN(f.k, 2))}</td><td class="n ct-k2" data-label="Contratado">${esc(fN(f.cant))}</td><td class="n" data-label="Ant.">${esc(fN(f.ant))}</td><td class="n ct-mes" data-label="Mes">${esc(fN(f.mes))}</td><td class="n" data-label="Acum.">${esc(fN(f.acum))}</td><td class="n ct-md" data-label="Módulos mes"><b>${esc(fN(f.mes * f.k, 2))}</b></td><td class="n ct-pe" data-label="$ mes s/IVA">${esc(plata(f.mes * f.k * mod))}</td><td class="ct-rs" data-label="Respaldo">${tag(f)}</td></tr>`;
    const cab = '<thead><tr><th>Ítem</th><th>Descripción</th><th class="n">K</th><th class="n">Contr.</th><th class="n">Anterior</th><th class="n">Mes</th><th class="n">Acum.</th><th class="n">Módulos mes</th><th class="n">$ mes s/IVA</th><th>Respaldo</th></tr></thead>';
    return `<div class="card ct-obra" data-ctobra="${esc(x.id)}"><div class="ct-oh"><h3>${esc(x.nombre)}</h3><span class="ct-mono">${x.ID ? "ID " + esc(x.ID) + " · " : ""}${R.zona ? "Zona " + esc(R.zona.zona) + " " + esc(R.zona.corto) : ""}${x.muni ? " · ya ejecutada: lo certificado por la Municipalidad va como anterior" : ""}</span></div>
<div class="sg-tabw"><table class="sg-tab ct-tab">${cab}<tbody>${fl.map(fila).join("") || '<tr><td colspan="10">Sin ítems de obra.</td></tr>'}</tbody></table></div>
${pv.length ? `<div class="sg-eti">Provisiones (aparte, fuera del %)</div><div class="sg-tabw"><table class="sg-tab ct-tab ct-prov">${cab}<tbody>${pv.map(fila).join("")}</tbody></table></div>` : ""}
<div class="ct-tot">Obra en el mes <b>${esc(fN(x.kMes, 2))} mód.</b>${x.kMesProv > 1e-6 ? ` + provisiones <b>${esc(fN(x.kMesProv, 2))} mód.</b>` : ""} · <b>${esc(plata((x.kMes + x.kMesProv) * mod))}</b> s/IVA</div></div>`;
  }
  function html() {
    const R = armar(st.M, st.obra), adm = esAdmin(), C = R.cerrado;
    const meses = [mesHoy(), mesMas(mesHoy(), -1), mesMas(mesHoy(), -2)].concat(Object.keys(cerrados())).filter((x, i, a) => /^\d{4}-\d\d$/.test(x) && a.indexOf(x) === i).sort().reverse();
    const todasObras = obras().filter(enZona).map((o) => ({ id: o.id, n: nombre(o) })).filter((x) => x.n).sort((a, b) => a.n.localeCompare(b.n, "es"));
    const rev = R.revisar.map((r) => `<div class="ct-pr ${r.g}"><span>${r.g === "rj" ? "⚠" : r.g === "am" ? "⚠" : "ⓘ"}</span><div><b>${esc(r.t)}</b><small>${esc(r.s)}</small></div></div>`).join("") || '<div class="ct-pr ok"><span>✓</span><div><b>Nada para revisar</b><small>Todo lo del mes sale de órdenes cerradas, con fecha.</small></div></div>';
    const lista = R.lista.filter((x) => x.filas.some((f) => f.mes > 1e-6 || f.sinFecha || f.demas || f.tarde));
    return `<div class="sg-bar0"><button type="button" class="sg-bt" data-ct="cerrar" aria-label="Volver">‹</button><div class="sg-bt0"><b>Certificación · ${C ? "cerrado" : "borrador"}</b><small>Avance · Informes</small></div><button type="button" class="sg-bt" data-ct="cerrar" aria-label="Cerrar">✕</button></div>
<div class="sg-in"><div class="ct-top"><div><div class="sg-eti" style="margin-top:0">Certificación mensual · se arma sola</div><h2>${C ? "Certificado" : "Borrador"} de ${esc(R.txt)}</h2><div class="sg-sub">Con el avance que dejaron las órdenes cerradas del mes (fecha de la orden). ${R.zona ? "Solo " + esc(R.zona.label) + "." : ""} Nada se presenta sin que lo revises.</div></div>
<div class="ct-fil"><select id="ctMes" aria-label="Mes">${meses.map((m) => `<option value="${m}"${m === R.M ? " selected" : ""}>${esc(mesTxt(m))}${cerrado(m) ? " 🔒" : ""}</option>`).join("")}</select><select id="ctObra" aria-label="Obras"><option value="">Todas las obras · ${R.conMes.length}</option>${todasObras.map((o) => `<option value="${esc(o.id)}"${String(o.id) === String(st.obra) ? " selected" : ""}>${esc(o.n)}</option>`).join("")}</select></div></div>
${C ? `<div class="sg-av ok sg-glob">🔒 Cerrado el ${esc(fCorta(C.ts))}${C.por ? " por " + esc(C.por) : ""}. No cambia: lo que se cargue después con fecha de ${esc(R.txt)} va a ${esc(mesTxt(mesMas(R.M, 1)))}.</div>` : ""}
<div class="ct-kp"><div class="ct-k"><b>${esc(fN(R.kMes, 2))} <small>mód.</small></b><span>Del mes (K × cantidad)${R.kProv > 1e-6 ? ` + ${esc(fN(R.kProv, 2))} de provisiones` : ""}</span></div><div class="ct-k ok"><b>${R.items}</b><span>Ítems con avance en el mes · ${R.conMes.length} ${R.conMes.length === 1 ? "obra" : "obras"}</span></div><div class="ct-k${R.revisar.length ? " am" : ""}"><b>${R.revisar.length}</b><span>Para revisar</span></div><div class="ct-k"><b>${R.pctAcum == null ? "—" : esc(fN(R.pctAcum, 1))} <small>%</small></b><span>Acumulado de la zona${R.zona ? " (" + esc(fN(R.zona.modulos, 0)) + " mód.)" : ""}</span></div></div>
<div class="ct-grid"><div class="ct-col">${lista.map((x) => tablaObra(x, R)).join("") || `<div class="card sg-nada">Ninguna obra de la zona tiene avance de órdenes con fecha de ${esc(R.txt)}.</div>`}
${R.fuera ? `<div class="sg-hint">${R.fuera} ${R.fuera === 1 ? "obra" : "obras"} fuera de nuestra zona (barrios, otras o de otro renglón) no entran en este certificado.</div>` : ""}</div>
<div class="ct-lado"><div class="card ct-acc"><div class="sg-eti" style="margin-top:0">Total del ${C ? "certificado" : "borrador"}</div><div class="ct-big">${esc(fN(R.kMes + R.kProv, 2))}<small> mód.</small></div><div class="ct-pl"><span>Sin IVA</span><b>${esc(plata(R.sinIva))}</b></div><div class="ct-pl"><span>Con IVA (21 %)</span><b>${esc(plata(R.conIva))}</b></div><div class="sg-hint">Módulo ${esc(plata(R.modulo))} sin IVA · precio = K × módulo${R.kProv > 1e-6 ? " · incluye provisiones" : ""}.</div>
<button type="button" class="btn-primary" data-ct="pdf">📄 Armar PDF del certificado</button><button type="button" class="btn-ghost" data-ct="excel">⬇ Planilla (Excel)</button>${!C && adm ? `<button type="button" class="btn-ghost ct-cerrar" data-ct="cerrarmes">🔒 Cerrar el certificado de ${esc(R.txt)}</button>` : ""}${!C && !adm ? '<div class="sg-hint">El mes lo cierra Administración.</div>' : ""}</div>
<div class="card ct-rev"><div class="sg-eti" style="margin-top:0">⚠ Para revisar antes de certificar</div>${rev}</div></div></div>
${st.msg ? `<div class="sg-msg" role="status">${st.msg}</div>` : ""}</div>`;
  }
  function pintar() {
    const ov = $("certOv"); if (!ov || ov.hidden) return;
    const h = html(); if (ov.__h === h) return;
    const sc = ov.querySelector(".sg-in"), y = sc ? sc.scrollTop : 0;
    ov.innerHTML = h; ov.__h = h; const s2 = ov.querySelector(".sg-in"); if (s2) s2.scrollTop = y;
  }
  function abrir(M, obraId) {
    if (!puedePlata()) { try { window.mostrarAviso && window.mostrarAviso("🔒 No tenés permiso para ver la certificación.", "error"); } catch (e) { } return false; }
    st.M = M || st.M || mesHoy(); st.obra = obraId || ""; st.msg = ""; st.abierta = true;
    let ov = $("certOv"); if (!ov) { ov = document.createElement("div"); ov.id = "certOv"; ov.className = "no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Certificación mensual"); document.body.appendChild(ov); }
    ov.hidden = false; ov.__h = ""; pintar();
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function cerrar() { const ov = $("certOv"); if (ov) ov.hidden = true; st.abierta = false; ["ctPreg"].forEach((i) => { const x = $(i); x && x.remove(); }); }

  // ---------------------------------------------------------------- PDF y planilla
  function hojaHtml(R) {
    const mod = R.modulo, lista = R.lista.filter((x) => x.filas.some((f) => f.mes > 1e-6));
    const tb = (l) => `<table><thead><tr><th>Ítem</th><th>Descripción</th><th>Un.</th><th style="text-align:right">K</th><th style="text-align:right">Contratado</th><th style="text-align:right">Anterior</th><th style="text-align:right">Mes</th><th style="text-align:right">Acumulado</th><th style="text-align:right">Módulos mes</th><th style="text-align:right">$ mes s/IVA</th></tr></thead><tbody>${l.map((f) => `<tr><td>${esc(f.id)}</td><td>${esc(f.desc)}</td><td>${esc(f.un)}</td><td style="text-align:right">${esc(fN(f.k, 2))}</td><td style="text-align:right">${esc(fN(f.cant))}</td><td style="text-align:right">${esc(fN(f.ant))}</td><td style="text-align:right"><b>${esc(fN(f.mes))}</b></td><td style="text-align:right">${esc(fN(f.acum))}</td><td style="text-align:right">${esc(fN(f.mes * f.k, 2))}</td><td style="text-align:right">${esc(plata(f.mes * f.k * mod))}</td></tr>`).join("")}</tbody></table>`;
    return `<div class="sub">${esc(R.zona ? R.zona.label + " · " : "")}${R.cerrado ? "Cerrado el " + esc(fCorta(R.cerrado.ts)) : "Borrador (sin cerrar)"} · módulo ${esc(plata(mod))} sin IVA · precio de cada ítem = K × módulo</div>` +
      (lista.length ? lista.map((x) => `<h3 style="margin:14px 0 4px;font-size:14px">${esc(x.nombre)}${x.ID ? " · ID " + esc(x.ID) : ""}</h3>${tb(x.filas.filter((f) => !f.prov && (f.mes > 1e-6 || f.acum > 1e-6)))}${x.filas.some((f) => f.prov && f.mes > 1e-6) ? `<div style="margin-top:6px;font-weight:600">Provisiones (aparte)</div>${tb(x.filas.filter((f) => f.prov && (f.mes > 1e-6 || f.acum > 1e-6)))}` : ""}<div style="text-align:right;margin-top:4px">Obra en el mes: <b>${esc(fN(x.kMes + x.kMesProv, 2))} mód.</b> · <b>${esc(plata((x.kMes + x.kMesProv) * mod))}</b> s/IVA</div>`).join("") : "<p>Sin avance con fecha en el mes.</p>") +
      `<table style="margin-top:16px;width:auto;min-width:50%"><tbody><tr><th>Total del mes (obra)</th><td style="text-align:right">${esc(fN(R.kMes, 2))} mód.</td></tr><tr><th>Provisiones</th><td style="text-align:right">${esc(fN(R.kProv, 2))} mód.</td></tr><tr><th>Total sin IVA</th><td style="text-align:right"><b>${esc(plata(R.sinIva))}</b></td></tr><tr><th>IVA 21 %</th><td style="text-align:right">${esc(plata(R.conIva - R.sinIva))}</td></tr><tr><th>Total con IVA</th><td style="text-align:right"><b>${esc(plata(R.conIva))}</b></td></tr><tr><th>Acumulado de la zona</th><td style="text-align:right">${R.pctAcum == null ? "—" : esc(fN(R.pctAcum, 2)) + " %"}</td></tr></tbody></table>` +
      (R.revisar.length ? `<div style="margin-top:12px;font-size:11px;color:#8a4b00"><b>Para revisar:</b> ${R.revisar.map((r) => esc(r.t)).join(" · ")}</div>` : "") +
      `<div class="foot">EMA Servicios · Alumbrado Público · Certificación mensual de ${esc(R.txt)}. Sale del avance de las órdenes cerradas (con fecha); lo cargado a mano sin fecha no entra.</div><div style="display:flex;justify-content:space-between;margin-top:46px;font-size:11px"><div style="border-top:1px solid #0d1424;padding-top:4px;width:40%;text-align:center">Firma y aclaración · EMA Servicios</div><div style="border-top:1px solid #0d1424;padding-top:4px;width:40%;text-align:center">Firma y aclaración · Inspección</div></div>`;
  }
  const tituloPdf = (R) => `Certificado mensual ${R.M} · ${R.txt}` + (st.obra ? " · " + (R.lista[0] ? R.lista[0].nombre : "") : "");
  function pdf() { const R = armar(st.M, st.obra); try { abrirHojaImpresion(tituloPdf(R), hojaHtml(R), "Certificación mensual"); } catch (e) { st.msg = "No pude armar la hoja."; pintar(); } }
  function excel() {
    const R = armar(st.M, st.obra), mod = R.modulo, secs = [];
    R.lista.filter((x) => x.filas.some((f) => f.mes > 1e-6 || f.acum > 1e-6)).forEach((x) => {
      secs.push({ tipo: "tabla", tit: (x.nombre + (x.ID ? " · ID " + x.ID : "")).slice(0, 60), grupo: "Por obra", etiqueta: x.nombre, etiquetaCol: "Obra", cols: ["Ítem", "Descripción", "Un.", "K", "Contratado", "Anterior", "Mes", "Acumulado", "Módulos mes", "$ mes sin IVA", "Provisión"].map((t) => ({ t })),
        filas: x.filas.map((f) => [f.id, f.desc, f.un, r4(f.k), r4(f.cant), r4(f.ant), r4(f.mes), r4(f.acum), r4(f.mes * f.k), Math.round(f.mes * f.k * mod * 100) / 100, f.prov ? "sí" : ""]), pie: [["", "Total de la obra en el mes", "", "", "", "", "", "", r4(x.kMes + x.kMesProv), Math.round((x.kMes + x.kMesProv) * mod * 100) / 100, ""]] });
    });
    const e = { titulo: "Certificación mensual · " + R.txt, subtitulo: (R.zona ? R.zona.label + " · " : "") + (R.cerrado ? "Cerrado" : "Borrador"), fecha: new Date().toISOString().slice(0, 10), tipoTxt: "Certificacion_" + R.M,
      tiles: [{ l: "Módulos del mes (obra)", n: r4(R.kMes) }, { l: "Módulos de provisiones", n: r4(R.kProv) }, { l: "Módulo sin IVA", n: mod }, { l: "Total sin IVA", n: Math.round(R.sinIva * 100) / 100 }, { l: "Total con IVA (21 %)", n: Math.round(R.conIva * 100) / 100 }, { l: "Acumulado de la zona %", n: R.pctAcum == null ? "" : Math.round(R.pctAcum * 100) / 100 }],
      avisos: R.revisar.map((r) => r.t + ": " + r.s), secciones: secs };
    if (typeof window.__infExcel == "function") { window.__ctUltimoExcel = e; return window.__infExcel(e); }
    const csv = [["Obra", "Ítem", "Descripción", "K", "Anterior", "Mes", "Acumulado", "Módulos mes"]].concat(R.lista.reduce((l, x) => l.concat(x.filas.map((f) => [x.nombre, f.id, f.desc, f.k, f.ant, f.mes, f.acum, f.mes * f.k])), [])).map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    try { descargarArchivo("﻿" + csv, "Certificacion_" + R.M + ".csv", "text/csv;charset=utf-8;"); } catch (er) { }
  }
  // QR de la hoja: abre esta certificación (?cert=AAAA-MM)
  const qrOrig = window.__qrHoja;
  if (typeof qrOrig == "function" && !qrOrig.__cert) {
    const n = function (titulo, doc) {
      const m = String(titulo || "").match(/^Certificado mensual (\d{4}-\d\d)/);
      if (m && doc && !/class="ema-qr/.test(doc) && window.__codigos && window.__codigos.dataUrl) {
        try {
          const url = window.__codigos.BASE + "?cert=" + m[1];
          const b = `<style>.membrete{padding-right:86px}</style><div class="ema-qr" style="position:absolute;top:14px;right:22px;width:72px;text-align:center;font:700 8.5px/1.2 ui-monospace,Menlo,monospace;color:#28285e;background:#fff"><img src="${window.__codigos.dataUrl(url)}" width="68" height="68" alt="QR" style="display:block;width:68px;height:68px"><span>CERT ${m[1]}</span></div>`;
          return /<body[^>]*>/i.test(doc) ? doc.replace(/<body[^>]*>/i, (x) => x + b) : b + doc;
        } catch (e) { }
      }
      return qrOrig.apply(this, arguments);
    };
    try { window.__heredar && window.__heredar(n, qrOrig); } catch (e) { }
    n.__cert = 1; window.__qrHoja = n;
  }
  (function pendienteQr() {
    let M = "";
    try { const u = new URL(location.href); M = u.searchParams.get("cert") || ""; if (M) { sessionStorage.setItem("ema.cert.pend", M); u.searchParams.delete("cert"); history.replaceState(history.state, "", u.pathname + u.search + u.hash); } else M = sessionStorage.getItem("ema.cert.pend") || ""; } catch (e) { M = ""; }
    if (!/^\d{4}-\d\d$/.test(M)) return;
    let n = 0; const t = setInterval(() => {
      if (++n > 900) return clearInterval(t);
      if (!(window.__fbUser && window.PERMISOS && PERMISOS.yo && PERMISOS.yo() && (typeof PERMISOS.listo != "function" || PERMISOS.listo()))) return;
      clearInterval(t); try { sessionStorage.removeItem("ema.cert.pend"); } catch (e) { }
      setTimeout(() => abrir(M), 1200);
    }, 1000);
  })();

  // ---------------------------------------------------------------- cerrar el mes (Administración, con «Sí»)
  function preguntar(R) {
    const ov = document.createElement("div"); ov.id = "ctPreg"; ov.className = "v7-ov no-print sg-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>¿Cerrás el certificado de ${esc(R.txt)}?</h3><small>${esc(fN(R.kMes + R.kProv, 2))} módulos · ${esc(plata(R.sinIva))} sin IVA · ${R.conMes.length} ${R.conMes.length === 1 ? "obra" : "obras"}</small></div><button type="button" class="v7-x" data-ct="nocerrar" aria-label="Cerrar">✕</button></div>
<p class="v7-txt">Queda una foto fija: el mes ya no cambia. Lo que se cargue después con fecha de ${esc(R.txt)} va al certificado de ${esc(mesTxt(mesMas(R.M, 1)))}, con un aviso.${R.revisar.length ? ` <b>Hay ${R.revisar.length} ${R.revisar.length === 1 ? "cosa" : "cosas"} para revisar.</b>` : ""}</p>
<div class="sg-accs"><button type="button" class="btn-ghost" data-ct="nocerrar">No</button><button type="button" class="btn-primary" data-ct="sicerrar">Sí, cerrar ${esc(R.txt)}</button></div><div class="sg-msg" id="ctPregMsg" aria-live="polite"></div></div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  }
  async function cerrarMes(M) {
    if (!esAdmin()) throw new Error("Lo cierra Administración.");
    if (cerrado(M)) throw new Error("Ese mes ya está cerrado.");
    const R = armar(M), yo = String((window.__fbUser || {}).email || ""), ts = Date.now();
    for (const x of R.lista) {
      const it = {}; x.filas.forEach((f) => { if (f.acum > 1e-6 || f.mes > 1e-6) it[f.id] = { m: f.mes, a: f.acum, k: f.k }; });
      if (!Object.keys(it).length) continue;
      const snap = { ts, por: yo, it };
      await window.fbAvanceCampos(x.id, { ["certificados." + M]: snap });
      x.o.certificados = Object.assign({}, obj(x.o.certificados), { [M]: snap });
    }
    const marca = { ts, por: yo, modulo: R.modulo, kMes: r4(R.kMes), kProv: r4(R.kProv), sinIva: Math.round(R.sinIva * 100) / 100, obras: R.conMes.length, zona: R.zona ? R.zona.zona : "" };
    await window.fbPreciosGuardar({ certCerrados: { [M]: marca } });
    window.__preciosNube = Object.assign({}, window.__preciosNube || {}, { certCerrados: Object.assign({}, cerrados(), { [M]: marca }) });
    try { window.fbAuditar && window.fbAuditar("certificado_cerrar", `Certificado de ${R.txt} cerrado: ${fN(R.kMes + R.kProv, 2)} mód. · ${R.conMes.length} obras`, { mes: M, kMes: marca.kMes, kProv: marca.kProv }); } catch (e) { }
    return marca;
  }

  // ---------------------------------------------------------------- eventos y menú
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-ct]"); if (!b) return;
    const a = b.dataset.ct; e.preventDefault();
    if (a === "abrir") abrir();
    else if (a === "cerrar") cerrar();
    else if (a === "pdf") pdf();
    else if (a === "excel") excel();
    else if (a === "cerrarmes") preguntar(armar(st.M));
    else if (a === "nocerrar") { const x = $("ctPreg"); x && x.remove(); }
    else if (a === "sicerrar") {
      const m = $("ctPregMsg"); b.disabled = true; if (m) m.textContent = "Guardando…";
      try { await cerrarMes(st.M); const x = $("ctPreg"); x && x.remove(); st.msg = `🔒 Listo: ${esc(mesTxt(st.M))} quedó cerrado.`; const ov = $("certOv"); if (ov) ov.__h = ""; pintar(); }
      catch (er) { b.disabled = false; if (m) m.textContent = "⚠ No se pudo cerrar: " + ((er && (er.message || er.code)) || "sin conexión") + "."; }
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t) return;
    if (t.id === "ctMes") { st.M = t.value; st.msg = ""; pintar(); }
    else if (t.id === "ctObra") { st.obra = t.value; pintar(); }
  });
  function menu() {
    const ref = document.querySelector('#menuLateral [data-vista="informe"]') || document.querySelector('#menuLateral [data-vista="avance"]'); let m = $("menuCert");
    if (!puedePlata()) { m && m.remove(); return; }
    if (!ref || m) return;
    m = document.createElement("button"); m.type = "button"; m.id = "menuCert"; m.className = ref.className.replace(/\b(activo|active|on)\b/g, ""); m.setAttribute("data-ct", "abrir");
    m.innerHTML = '<span class="nav-ico">📑</span><span class="nav-txt">Certificación del mes</span>';
    ref.insertAdjacentElement("afterend", m);
  }
  function tarjetaInformes() {
    const v = $("viewInforme"); let c = $("ctInfCard");
    if (!v || !puedePlata()) { c && c.remove(); return; }
    if (c) return;
    c = document.createElement("div"); c.id = "ctInfCard"; c.className = "card no-print ct-inf";
    c.innerHTML = '<div><b>📑 Certificación mensual</b><small>Se arma sola con el avance de las órdenes del mes, por obra y total, con PDF y planilla.</small></div><button type="button" class="btn-primary" data-ct="abrir">Abrir</button>';
    v.insertBefore(c, v.firstElementChild ? v.firstElementChild.nextSibling : null);
  }
  setInterval(() => { try { menu(); tarjetaInformes(); if (st.abierta) pintar(); } catch (e) { } }, 1500);
  window.__certMensual = { abrir, cerrar, armar, deObra, pintar, pdf, excel, cerrarMes, puedePlata, enZona, hojaHtml, mesTxt, estado: () => ({ M: st.M, obra: st.obra, abierta: st.abierta }) };
})();
