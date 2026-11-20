(function () {
  "use strict";
  // v186 · El Inicio nuevo de Administración, Oficina y Dirección (maquetas aprobadas por Ángel, 20/11/2026: «usemos la A que
  // vos decías»): opción A con dos cosas de la B.
  //  · Arriba, el contador del contrato: días · horas · min (en la compu también los segundos), «Termina el …», «van N de M
  //    días», y la barra del tiempo contra el avance de nuestra zona. El acta de inicio sale de configEquipo/precios.contratoInicio
  //    + contratoPlazoMeses (4); sin cargar, la primera orden de la zona, «fecha estimada» (Administración tiene el botón para cargarla).
  //  · «Para atender» en UNA línea (se despliega con la lista de siempre: lo de Dirección + lo del Ejecutivo).
  //  · «Dónde trabajamos hoy»: el mapa y las plazas con orden hoy en la misma tarjeta, con el mismo número en el pin y en la
  //    fila; cada plaza con su % de avance (el de la app: el avance de obra nuevo, v158), antes → ahora de hoy y barritas por rubro.
  //  · El avance del contrato: anillo de la zona y barras por rubro del itemizado (o «Por plaza»).
  //  · Lo que se sacó del Inicio sigue en su lugar (la orden sugerida en Órdenes › «Mañana»; los indicadores de antes en
  //    «Ver todos los indicadores», la pantalla de Dirección entera en una hoja).
  //  Dirección ve lo mismo, sin botones que cambien nada. Todo de memoria: sin escuchas ni consultas nuevas.
  //  Pruebas viejas: window.__v186No.
  const V = window.__v135;
  if (window.__v186No || !V) { window.__ini186 = { on: () => false, pintar() { } }; return; }
  window.__ini186Hoja = true;   // «Ver todos los indicadores»: la hoja de Dirección se arma con las piezas del Ejecutivo (admin/oficina)
  const $ = (id) => document.getElementById(id);
  const esc = V.esc, intentar = V.intentar;
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const arr = (x) => (Array.isArray(x) ? x : []), obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const r1 = (v) => Math.round((+v || 0) * 10) / 10;
  const fN = (v, d) => intentar(() => fmt(+v || 0, d == null ? (Number.isInteger(r1(v)) ? 0 : 1) : d), String(v));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const ahora = () => num(window.__i186Ahora) || Date.now();   // pruebas: la hora de mentira
  const hoy = () => iso(new Date(ahora()));
  const dia0 = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0) : null; };
  const dmy = (s) => { const d = dia0(s); return d ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() : "—"; };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const ICO = (k, s) => intentar(() => V.ic(k, 1.6, "v5-ic " + (s || "s18")), "");
  const nombre = (o) => { const n = String((o && (o.nombre || o.plazaNombre)) || "(sin nombre)"); return window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase(); };
  const ID = () => window.__inicioDir;
  const esDir = () => intentar(() => !!window.__esDireccion(), false);
  const obras = () => V.obras().filter((o) => o && o.id && o.id !== "__sinObra");
  const ots = () => V.ots().filter((o) => o && o.estado !== "Anulada");
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const ZC = () => window.__zonaContrato || null;
  const enZona = (o) => { const z = ZC(); if (!z) return !!o && o.tipo !== "barrio" && o.tipo !== "otra"; return z.zonaDeObra(o) === z.zona(); };
  const compu = () => window.innerWidth > 900;

  function on() {
    try {
      if (window.__v186No || !ID() || !window.__fbUser || !V.rolListo() || V.esCrew()) return false;
      return esDir() || !!(window.__iniUnico && window.__iniUnico.activo());
    } catch (e) { return false; }
  }

  // ================================================================ cuentas que usan el Inicio, el Itemizado y el Gantt
  const esProv = (id) => /^8[3-9](\.|$)/.test(String(id));
  const kItem = (id) => intentar(() => num(window.epecItemK(String(id))), 0);
  const RUBZ = [["col", "Columnas", "ítems 1–8", 1, 8], ["tab", "Tableros y acometidas", "ítems 9–14", 9, 14], ["zan", "Zanjeo", "ítems 15–20", 15, 20], ["cru", "Cruces", "ítems 21–24", 21, 24], ["cab", "Cable", "ítems 25–40", 25, 40], ["pat", "PAT", "ítems 74–81", 74, 81], ["otr", "Retiros y otros", "ítems 41–73 y 82", 41, 82]];
  function rubDeItem(id) {
    if (esProv(id)) return "prov";
    const n = Math.floor(num(String(id).split(".")[0])); if (!n) return "otr";
    for (const r of RUBZ) if (r[0] !== "otr" && n >= r[3] && n <= r[4]) return r[0];
    return "otr";
  }
  function filasObra(o) {   // {id, cant, hecho, k, epec, r (la fila de la base)}
    const l = [];
    arr(o && o.valorItems).forEach((r) => { if (r && r.itemPliego) l.push({ id: String(r.itemPliego), r, epec: false }); });
    arr(o && o.valorItemsEpec).forEach((r) => { if (r && r.itemEpec) l.push({ id: String(r.itemEpec), r, epec: true }); });
    l.forEach((f) => { f.cant = num(f.r.cantidad); f.hecho = Math.min(num(f.r.cantidadAvanzada), f.cant); f.k = kItem(f.id); f.rub = rubDeItem(f.id); });
    return l;
  }
  function kObra(o) {   // módulos contratados / hechos sin provisiones, y por rubro
    const t = { c: 0, h: 0, rub: {} };
    filasObra(o).forEach((f) => { if (f.rub === "prov" || !f.k) return; const x = (t.rub[f.rub] = t.rub[f.rub] || { c: 0, h: 0 }); x.c += f.cant * f.k; x.h += f.hecho * f.k; t.c += f.cant * f.k; t.h += f.hecho * f.k; });
    return t;
  }
  function zonaRub() {
    const ob = obras().filter(enZona), rub = {}; let c = 0, h = 0;
    RUBZ.forEach((r) => { rub[r[0]] = { c: 0, h: 0 }; });
    ob.forEach((o) => { const t = kObra(o); c += t.c; h += t.h; Object.keys(t.rub).forEach((k) => { if (rub[k]) { rub[k].c += t.rub[k].c; rub[k].h += t.rub[k].h; } }); });
    return { ob, rub, c, h };
  }
  const pctObra = (o) => { const E = intentar(() => window.__av2 && window.__av2.estado(o), null); return E && E.pct != null ? num(E.pct) : intentar(() => num(calcularAvanceEtapasPct(o)), 0); };
  // el % de antes de las órdenes de hoy (el avance de obra nuevo sin lo de hoy), guardado 30 s
  const cAntes = {};
  function pctAntes(o) {
    const k = o.id + "|" + hoy(), c = cAntes[k];
    if (c && ahora() - c.t < 30000) return c.v;
    const v = intentar(() => (window.__av2 && window.__av2.pctHasta ? window.__av2.pctHasta(o, hoy()) : null), null);
    if (v != null) cAntes[k] = { t: ahora(), v }; return v;
  }
  // lo previsto por las fechas del Gantt (v186): % que tendríamos que ir hoy, sobre los módulos de la zona
  function planPct(D) {
    const G = window.__gt186; if (!G) return null;
    let k = 0, n = 0;
    obras().filter(enZona).forEach((o) => { const p = G.previstaObra(o); if (!p.desde || !p.hasta) return; const t = kObra(o); if (!(t.c > 0)) return; n++; const a = dia0(p.desde), b = dia0(p.hasta), x = ahora(); const fr = x <= +a ? 0 : x >= +b + 864e5 ? 1 : (x - a) / Math.max(864e5, b - a + 864e5); k += t.c * fr; });
    if (!n) return null;
    return { pct: Math.max(0, Math.min(100, (k / Math.max(1, num(D.z.modulos))) * 100)), n };
  }

  // ================================================================ el contador
  function tiempo(C) {
    if (!C || !C.ini || !C.plazo) return null;
    const a = dia0(C.ini), b = dia0(C.plazo), x = ahora();
    const tot = Math.max(1, Math.round((b - a) / 864e5)), ms = Math.max(0, b - x), van = Math.max(0, Math.min(tot, Math.floor((x - a) / 864e5)));
    return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60, tot, van, pct: Math.max(0, Math.min(100, ((x - a) / Math.max(1, b - a)) * 100)), fin: b };
  }
  const esAdmin = () => intentar(() => !!PERMISOS.esAdmin(), false);
  function cdHtml(T) {
    const seg = compu();
    return `<div class="i6-cd${seg ? " seg" : ""}" id="i186Cd" role="timer" aria-label="Lo que falta para terminar la licitación"><div><b data-cd="d">${T.d}</b><span>días</span></div><div><b data-cd="h">${pad(T.h)}</b><span>horas</span></div><div><b data-cd="m">${pad(T.m)}</b><span>min</span></div>${seg ? `<div><b data-cd="s">${pad(T.s)}</b><span>seg</span></div>` : ""}</div>`;
  }
  function heroHtml(D) {
    const avN = intentar(() => V.avisosSinLeer(), 0), C = D.C, T = tiempo(C);
    const top = `<div class="i6-top"><button type="button" class="i6-red" data-dr="menu" aria-label="Menú">${ICO("menu", "s22")}</button><div class="i6-logo"><img src="${(window.__inicioPro && window.__inicioPro.LOGO) || ""}" alt="EMA Servicios"><small>${esDir() ? "Dirección" : "Alumbrado"}</small></div><button type="button" class="i6-red" data-dr="avisos" aria-label="Avisos">${ICO("campana", "s22")}${avN ? `<span class="i6-bd">${avN > 9 ? "9+" : avN}</span>` : ""}</button></div>`;
    const acta = esAdmin() ? `<button type="button" class="i6-btnb${C.estimada && !C.sinDato ? " chico" : ""}" data-i186="acta">Cargá la fecha del acta de inicio</button>` : "";
    if (!T) return top + `<div class="i6-sinf" id="i186Cont"><div class="i6-tit" style="margin-top:0">Tiempo del contrato</div><b>Falta la fecha del acta de inicio</b><div class="i6-lin">Sin esa fecha (ni órdenes en la zona) no se puede contar cuánto queda. Plazo cargado: ${C.meses || 4} meses.</div>${acta || '<div class="i6-lin">Todavía no se cargó la fecha del acta (la carga Administración).</div>'}</div>` + atLinea(D);
    const fin = DIAS[T.fin.getDay()] + " " + dmy(C.plazo), av = num(D.z.pct), dif = T.pct - av, P = planPct(D);
    const lado = `<div class="i6-tv"><div class="r t"><span>Tiempo</span><span class="i6-bar"><i style="width:${T.pct.toFixed(1)}%"></i></span><span class="num">${esc(fN(T.pct, 1))}%</span></div>${P ? `<div class="r p"><span>Plan</span><span class="i6-bar"><i style="width:${P.pct.toFixed(1)}%"></i></span><span class="num">${esc(fN(P.pct, 1))}%</span></div>` : ""}<div class="r a"><span>Avance</span><span class="i6-bar"><i style="width:${Math.max(0.5, av).toFixed(1)}%"></i></span><span class="num">${esc(fN(av, 1))}%</span></div></div>
<div class="i6-atras${dif <= 0 ? " ok" : ""}" role="status">${dif > 0 ? `⏱ Vamos ${esc(fN(dif, 1))} puntos detrás del tiempo${D.ritmo > 0 ? ` · hacen falta ≈ ${esc(fN(D.ritmo, 0))} módulos por día hábil` : ""}` : `✓ Vamos ${esc(fN(-dif, 1))} puntos adelante del tiempo`}${P ? ` · según las fechas del 📅 Gantt (${P.n} ${P.n === 1 ? "plaza" : "plazas"}) hoy tendríamos que ir ${esc(fN(P.pct, 1))} %` : ""}</div>${atLinea(D)}`;
    return top + `<div class="i6-heroA" id="i186Cont"><div><div class="i6-tit">Faltan para terminar la licitación</div>${cdHtml(T)}
<div class="i6-lin">Termina el <b>${esc(fin)}</b> · van <b data-cd="van">${T.van} ${T.van === 1 ? "día" : "días"}</b> de <b>${T.tot} días</b> desde el acta (${esc(dmy(C.ini))})</div>${C.estimada ? `<div class="i6-est" role="status">📅 Fecha estimada: cargá el acta de inicio (por ahora se usa la primera orden de la zona, ${esc(dmy(C.ini))}).</div>${acta}` : ""}</div>
<div class="i6-tvbox">${lado}</div></div>`;
  }

  // ================================================================ «Para atender» en una línea
  const st = { atAb: false, iz: "rub", mapa: null, capa: null, h: {}, firmaMapa: "", t: null };
  function atDatos() {
    const dl = intentar(() => ID().atencion(), []) || [];
    if (esDir()) return { n: dl.length, txt: dl.map((a) => a.t), dl, el: [] };
    const b = window.__inicioPro && window.__inicioPro.bloques, d = b ? intentar(() => b.datos(), null) : null, el = b && d ? intentar(() => b.atender(d, true), []) || [] : [];
    const hayAtras = el.some((x) => x.ir === "atras" || x.ir === "cerrar"), dl2 = dl.filter((a) => !(hayAtras && a.ir === "ordenes"));
    return { n: dl2.length + el.reduce((s, x) => s + (x.n || 1), 0), txt: el.map((x) => (x.n > 1 && !/^\d/.test(String(x.t)) ? x.n + " · " : "") + x.t).concat(dl2.map((a) => a.t)), dl: dl2, el, d };
  }
  function atLinea(D) {
    const A = atDatos(); st.at = A;
    return `<button type="button" class="i6-at" data-i186="at" aria-expanded="${st.atAb}">⚠ Para atender <i class="${A.n ? "" : "cero"}">${A.n}</i><span>${A.n ? esc(A.txt.slice(0, 3).join(" · ")) : "Nada urgente: todo en orden 👌"}</span><em>${st.atAb ? "▴" : "›"}</em></button>`;
  }
  function atListaHtml() {
    if (!st.atAb) return "";
    const A = st.at || atDatos();
    if (!esDir() && window.__iniUnico && A.d) { intentar(() => window.__iniUnico.clonarCss(), null); return `<div class="i6-card ie-dentro i6-atl" style="padding:0">${intentar(() => window.__iniUnico.atenderHtml(A.d), "")}</div>`; }
    const filas = A.dl.map((a, i) => `<button type="button" class="ie-fila" data-dr="at:${i}"><span class="ie-tx"><b>${esc(a.t)}</b><small>${esc(a.s || "")}</small></span></button>`).join("");
    return `<div class="i6-card i6-atl"><div class="i6-eb">Para atender</div>${filas || '<div class="i6-nada">Nada urgente: todo en orden. 👌</div>'}</div>`;
  }

  // ================================================================ dónde trabajamos hoy (mapa + plazas)
  const MINI = [["columnas", "Col"], ["tablero", "Tab"], ["civil", "Civil"], ["cableado", "Cable"], ["pat", "PAT"], ["cajas", "Cajas"], ["vinculos", "Vínc."], ["artefactos", "Artef."], ["cierre", "Cierre"]];
  function plazasHoy(D) {
    const g = {}, orden = [];
    arr(D.hoyOts).forEach((t) => { const id = String(t.plazaId || ""); if (!id) return; if (!g[id]) { g[id] = { id, ots: [] }; orden.push(id); } g[id].ots.push(t); });
    const cu = intentar(() => window.__mapaControl.cuadrillas(), []) || [];
    return orden.map((id, i) => {
      const x = g[id], o = obras().find((b) => String(b.id) === id) || null;
      const gente = {}; x.ots.forEach((t) => arr(t.personal).forEach((p) => { const n = String((p && (p.nombre || p)) || "").trim(); if (n) gente[n.split(" ")[0]] = 1; }));
      const veh = []; x.ots.forEach((t) => arr(t.vehiculos).forEach((v) => { if (v && v.nombre && veh.indexOf(v.nombre) < 0) veh.push(v.nombre); }));
      const ahoraP = o ? Math.round(pctObra(o)) : 0, ant = o ? pctAntes(o) : null, antes = ant == null ? null : Math.round(num(ant));
      const E = o ? intentar(() => window.__av2 && window.__av2.estado(o), null) : null;
      const rub = E ? arr(E.rubros) : [];
      const minis = MINI.map(([k, l]) => { const R = rub.find((r) => r.id === k); return R && R.pct != null ? { l, p: Math.round(num(R.pct)) } : null; }).filter(Boolean).slice(0, 5);
      const pos = cu.find((c) => c && String((c.ob && c.ob.id) || (c.o && c.o.plazaId) || "") === id && c.pos);
      return { n: i + 1, id, o, nom: o ? nombre(o) : nombre({ nombre: x.ots[0].plazaNombre }), ID: (o && o.obraId) || x.ots[0].obraId || "", barrio: (o && o.barrio) || "", gente: Object.keys(gente), veh, ahora: ahoraP, antes, minis, sinCerrar: x.ots.some((t) => !cerrada(t)), ots: x.ots, pos: pos ? pos.pos : null };
    });
  }
  function plazaHtml(p) {
    const sube = p.antes != null && p.ahora > p.antes, base = p.antes != null ? Math.min(p.antes, p.ahora) : p.ahora;
    const bar = `<span class="i6-pbar"><i style="width:${base}%"></i>${sube ? `<i class="hoy" style="left:${p.antes}%;width:${p.ahora - p.antes}%"></i>` : ""}</span>`;
    const est = sube ? `<small>▲ +${p.ahora - p.antes} hoy</small><span class="ant">${p.antes}% → ${p.ahora}%</span>` : `<small class="cero">${p.sinCerrar ? "sin cerrar" : "= hoy"}</small>${p.antes != null ? `<span class="ant">${p.antes}% → ${p.ahora}%</span>` : ""}`;
    const sub = [p.ID ? "ID " + p.ID : "", p.barrio ? (window.__fmtNombre ? window.__fmtNombre.barrio(p.barrio) : p.barrio) : "", p.gente.join(", "), p.veh.length ? p.veh.join(", ") : "sin vehículo"].filter(Boolean).join(" · ");
    return `<div class="i6-pl" role="button" tabindex="0" data-i186="obra:${esc(p.id)}" aria-label="${esc(p.nom)}: ${p.ahora} % de avance"><div class="i6-plh"><span class="i6-n">${p.n}</span><div class="i6-plt"><b>${esc(p.nom)}</b><small>${esc(sub)}</small></div><div class="i6-plp"><b>${p.ahora}%</b>${est}</div></div>${bar}${p.minis.length ? `<div class="i6-mr">${p.minis.map((m) => `<div><span>${esc(m.l)}</span><span class="i6-mb"><i style="width:${Math.max(0, Math.min(100, m.p))}%"></i></span><b>${m.p}%</b></div>`).join("")}</div>` : ""}</div>`;
  }
  function hoyHtml(D, L) {
    const d = new Date(ahora());
    const cab = `<div class="i6-ch"><div><div class="i6-eb">Hoy · ${DIAS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}</div><h2>Dónde trabajamos hoy</h2></div><button type="button" class="i6-lk" data-i186="mapa">Mapa ›</button></div>`;
    return { cab, lista: L.length ? `<div class="i6-lista">${L.map(plazaHtml).join("")}</div><div class="i6-nota">Tocá una plaza para ver su avance de obra. Verde rayado = lo que subió hoy (el % es el avance de obra de la app).</div>` : '<div class="i6-nada">Hoy no hay órdenes.</div>' };
  }
  function mapa(L) {
    const el = $("i186Mapa"); if (!el) return;
    if (!window.L || !L_ok()) { if (!el.__msg) { el.innerHTML = '<div class="i6-nada" style="padding:14px">El mapa se ve cuando carga (con señal).</div>'; el.__msg = 1; } return; }
    if (!st.mapa || st.mapaEl !== el) {
      try { el.innerHTML = ""; el.__msg = 0; st.mapa = window.L.map(el, { zoomControl: false, attributionControl: false, keyboard: false, scrollWheelZoom: false }).setView([-31.42, -64.18], 12); window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(st.mapa); st.capa = window.L.layerGroup().addTo(st.mapa); st.mapaEl = el; st.firmaMapa = ""; } catch (e) { st.mapa = null; return; }
    }
    const firma = JSON.stringify(L.map((p) => [p.n, p.id, p.ahora, p.o && p.o.lat, p.o && p.o.lng, p.pos && p.pos.lat, p.pos && p.pos.lng]));
    if (firma === st.firmaMapa) return; st.firmaMapa = firma;
    const pts = [];
    try {
      st.capa.clearLayers();
      L.forEach((p) => {
        const o = p.o; if (!o || o.lat == null || !isFinite(+o.lat) || !isFinite(+o.lng)) return;
        const ll = [+o.lat, +o.lng]; pts.push(ll);
        window.L.marker(ll, { icon: window.L.divIcon({ className: "i6-pin", html: `<span class="p${p.sinCerrar ? "" : " gris"}"></span><span class="n">${p.n}</span><span class="l">${esc(p.nom.replace(/^PLAZA\s+/, ""))} · ${p.ahora}%</span>`, iconSize: [28, 28], iconAnchor: [14, 28] }), keyboard: false }).addTo(st.capa).on("click", () => irObra(p.id));
        if (p.pos && isFinite(+p.pos.lat)) { window.L.circleMarker([+p.pos.lat, +p.pos.lng], { radius: 7, color: "#fff", weight: 2, fillColor: "#34C759", fillOpacity: 1 }).addTo(st.capa); pts.push([+p.pos.lat, +p.pos.lng]); }
      });
      if (pts.length > 1) st.mapa.fitBounds(pts, { padding: [36, 36], maxZoom: 15 }); else if (pts.length === 1) st.mapa.setView(pts[0], 15);
      setTimeout(() => { try { st.mapa && st.mapa.invalidateSize(); } catch (e) { } }, 60);
    } catch (e) { }
  }
  const L_ok = () => !!(window.L && window.L.map && window.L.divIcon);

  // ================================================================ el avance del contrato (itemizado de la zona)
  function izHtml(D) {
    const Z = zonaRub(), z = D.z, pct = num(z.pct), C = 2 * Math.PI * 40;
    const enObra = Z.ob.filter((o) => { const a = pctObra(o); return a > 0 && a < 100; }).length, sinEmp = Math.max(0, num(z.plazas) - num(z.terminadas) - enObra);
    const seg = `<div class="i6-seg" role="tablist"><button type="button" role="tab" class="${st.iz === "rub" ? "on" : ""}" aria-selected="${st.iz === "rub"}" data-i186="iz:rub">Por rubro</button><button type="button" role="tab" class="${st.iz === "pla" ? "on" : ""}" aria-selected="${st.iz === "pla"}" data-i186="iz:pla">Por plaza</button></div>`;
    let cuerpo = "";
    if (st.iz === "pla") {
      const l = Z.ob.map((o) => ({ o, t: kObra(o), a: Math.round(pctObra(o)) })).filter((x) => x.t.c > 0 || x.a > 0).sort((a, b) => b.a - a.a || nombre(a.o).localeCompare(nombre(b.o)));
      cuerpo = l.length ? `<div class="i6-rub">${l.slice(0, 8).map((x) => `<button type="button" class="r" data-i186="izobra:${esc(x.o.id)}"><span>${esc(nombre(x.o))}<small>${esc(fN(x.t.h, 0))} de ${esc(fN(x.t.c, 0))} K</small></span><span class="num">${x.a}%</span><span class="i6-bar"><i style="width:${Math.max(1, x.a)}%"></i></span></button>`).join("")}</div>${l.length > 8 ? `<div class="i6-nota">Y ${l.length - 8} más en 📋 Itemizado.</div>` : ""}` : '<div class="i6-nada">Ninguna plaza de la zona con itemizado cargado.</div>';
    } else {
      cuerpo = `<div class="i6-rub">${RUBZ.map((r) => { const x = Z.rub[r[0]], p = x.c > 0 ? (x.h / x.c) * 100 : 0; return `<div class="r"><span>${esc(r[1])}<small>${esc(r[2])}</small></span><span class="num">${x.c > 0 ? esc(fN(p, 1)) + "%" : "—"}</span><span class="i6-bar"><i style="width:${Math.max(x.c > 0 ? 1 : 0, Math.min(100, p)).toFixed(1)}%"></i></span></div>`; }).join("")}</div><div class="i6-nota">Módulos (K) hechos sobre los contratados de cada rubro, en los itemizados cargados de la zona (${Z.ob.length} ${Z.ob.length === 1 ? "plaza" : "plazas"}), sin provisiones.</div>`;
    }
    return `<div class="i6-ch"><div><div class="i6-eb">Itemizado · ${esc(z.label ? (z.zona ? "Zona " + z.zona + " (" + (z.corto || "") + ")" : z.label) : "nuestra zona")}</div><h2>Avance del contrato</h2></div><button type="button" class="i6-lk" data-i186="itemizado">Itemizado ›</button></div>
<div class="i6-iztop"><div class="i6-ring"><svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true"><circle cx="48" cy="48" r="40" stroke="rgba(40,40,94,.08)" stroke-width="10" fill="none"/><circle cx="48" cy="48" r="40" stroke="#1E6F91" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${(C * Math.min(100, pct) / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 48 48)"/></svg><b>${esc(fN(pct, 1))}%</b></div>
<div class="i6-izn"><div><strong>${esc(fN(z.k, 0))}</strong>de ${esc(fN(z.modulos, 0))} módulos</div><div><strong>${esc(fN(z.terminadas, 0))}</strong>de ${esc(fN(z.plazas, 0))} plazas terminadas</div><div><strong>${enObra}</strong>en obra · ${sinEmp} sin empezar</div></div></div>${seg}${cuerpo}`;
  }

  // ================================================================ armar y pintar
  function asegurar() {
    const v = $("viewInicio"); if (!v) return null;
    let r = $("ini186");
    if (!r) {
      r = document.createElement("div"); r.id = "ini186"; r.className = "no-print";
      r.innerHTML = '<section class="i6-hero" id="i186Hero"></section><div id="i186AtL"></div><div class="i6-wrap"><div class="i6-grid"><div class="i6-card" id="i186Hoy"><div id="i186HoyCab"></div><div class="i6-mapa" id="i186Mapa" aria-label="Mapa de las plazas con orden hoy"></div><div class="i6-ley"><span>Plaza con orden hoy (número = la lista)</span><span class="c">Cuadrilla en vivo</span></div><div id="i186HoyL"></div></div><div class="i6-card" id="i186Iz"></div></div><button type="button" class="i6-todos" data-i186="todos">Ver todos los indicadores</button></div>';
      v.insertBefore(r, v.firstChild); st.h = {}; st.mapa = null;
    }
    return r;
  }
  function poner(id, h) { const e = $(id); if (!e || st.h[id] === h) return false; e.innerHTML = h; st.h[id] = h; return true; }
  let cacheD = null;
  function pintar() {
    if (!on()) return;
    const v = $("viewInicio"); if (!v || v.style.display === "none") return;
    const t0 = performance.now();
    const rd = $("iniDir"); if (rd && rd.parentNode === v) rd.style.display = "none";
    const ej = $("iniEje"); if (ej) ej.style.display = "none";
    const r = asegurar(); if (!r) return; r.style.display = "";
    try {
      const D = intentar(() => ID().datos(), null); if (!D) return;
      cacheD = D;
      poner("i186Hero", heroHtml(D));
      poner("i186AtL", atListaHtml());
      const L = plazasHoy(D), H = hoyHtml(D, L);
      poner("i186HoyCab", H.cab); poner("i186HoyL", H.lista);
      poner("i186Iz", izHtml(D));
      mapa(L);
      if (!st.t) st.t = { primera: Math.round(performance.now() - t0) };
    } catch (e) { console.warn("[inicio186]", e); }
  }
  function irObra(id) {
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    if (V.ve("avance") && typeof window.irADetalleDesdeMapa == "function") { try { window.irADetalleDesdeMapa(id); return; } catch (e) { } }
    if (typeof window.abrirLegajo == "function" && V.ve("obras")) { V.ir("obras"); setTimeout(() => window.abrirLegajo(id), 120); }
  }
  // el reloj: cada segundo (solo con el Inicio a la vista; en el celu cambia cada minuto)
  setInterval(() => {
    try {
      const r = $("ini186"); if (!r || r.style.display === "none" || !r.offsetHeight || !cacheD) return;
      const T = tiempo(cacheD.C); if (!T) return;
      const set = (k, v) => { const e = r.querySelector('[data-cd="' + k + '"]'); if (e && e.textContent !== v) e.textContent = v; };
      set("d", String(T.d)); set("h", pad(T.h)); set("m", pad(T.m)); set("s", pad(T.s)); set("van", T.van + " " + (T.van === 1 ? "día" : "días"));
      const cd = $("i186Cd"); if (cd && cd.classList.contains("seg") !== compu()) { st.h.i186Hero = ""; pintar(); }
    } catch (e) { }
  }, 1000);
  window.addEventListener("resize", () => { clearTimeout(st.rz); st.rz = setTimeout(() => { st.h = {}; pintar(); try { st.mapa && st.mapa.invalidateSize(); } catch (e) { } }, 250); });
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("#ini186 [data-i186]"); if (!b) return;
    const a = b.dataset.i186, x = a.indexOf(":") > 0 ? a.slice(a.indexOf(":") + 1) : "";
    e.preventDefault();
    if (a === "at") { st.atAb = !st.atAb; st.h.i186Hero = ""; return pintar(); }
    if (a.indexOf("obra:") === 0) return irObra(x);
    if (a.indexOf("iz:") === 0) { st.iz = x; return pintar(); }
    if (a === "mapa") return V.ir("mapa");
    if (a === "itemizado") return window.__iz186 && window.__iz186.abrir({});
    if (a.indexOf("izobra:") === 0) return window.__iz186 && window.__iz186.abrir({ obra: x });
    if (a === "acta") return window.__iz186 && window.__iz186.abrir({ acta: true });
    if (a === "todos") return ID() && ID().abrir();
  });
  document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target && e.target.classList && e.target.classList.contains("i6-pl")) { e.preventDefault(); e.target.click(); } });
  window.__ini186 = { on, pintar: () => { cacheD = null; pintar(); }, tiempo, plazasHoy: () => plazasHoy(ID().datos()), zonaRub, kObra, filasObra, rubDeItem, RUBZ, pctObra, pctAntes, planPct: () => planPct(ID().datos()), enZona, nombre, dia0, dmy, iso, ahora, hoy, atDatos, estado: () => ({ on: on(), atAb: st.atAb, iz: st.iz, mapa: !!st.mapa, t: st.t }) };
})();
