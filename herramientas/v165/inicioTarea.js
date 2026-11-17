(function () {
  "use strict";
  // v165 · La cuadrilla (Ángel 16/11/2026): «Al iniciar la tarea le tiene que salir un cartel grande "voy a iniciar esta tarea",
  // cosa que nosotros podamos medir más exacto» · «si nosotros no ponemos la tarea exacta, ellos en otra que pongan el nombre, que
  // sea rápido» · «cada vez que rompan récord darles emojis diciendo genial rompiste tu récord o estuviste bien».
  //  1) «▶ VOY A INICIAR ESTA TAREA» (hoja grande, .v7-ov role=dialog con ✕): al arrancar cada tarea en Modo obra. El toque anota
  //     el inicio exacto de la tarea (campo.tareaInicio.<tarea>.<persona> {ts, por, gente, lat, lng, acc}) y de su primera
  //     columna (campo.colInicio, el «▶ Empecé» de la v157, ahora a la vista), para todos los de la orden: el compañero ya no ve
  //     el cartel (y si lo toca igual, queda una entrada suya y el inicio es el primero). Si nunca lo tocan, la v157 sigue igual.
  //  2) Opción C · cámara primero: después de iniciar se abre la cámara de la app con la píldora (obra · tarea · distancia), el
  //     reloj de la tarea en marcha, las miniaturas (✓ subida / ↑ subiendo) y «✓ Terminé la tarea» → la hoja «Terminé»: el tiempo
  //     de cada columna (− / +), «✓ Listo, mandar» y la tarea que sigue con su «▶ Voy a iniciar». Se sale de la cámara con ✕ a
  //     Modo obra («📷 Volver a la cámara»).
  //  3) Otra tarea rápido: en el cartel, botones grandes de las tareas comunes y «✏ Otra: escribila o decila 🎤» (sugerencias del
  //     catálogo desde 2 letras, «Usar tal cual lo escribí», las últimas usadas en este celu). Lo que no estaba en la orden va a
  //     campo.extras.<id> {k, texto, por, ts, fin, cant, gente}; la oficina lo ve como «hecho de más» en el «📸 Avance», la
  //     verificación y el cierre, y lo suma a la orden («＋») o lo descarta.
  //  4) Récords personales (nunca contra compañeros): por persona, tarea y cantidad de gente; solo con foto, hora no dudosa, sin
  //     falla ni «no se hizo», con 3 tiempos anteriores; nunca en tareas de riesgo (RIESGO, a confirmar). Felicitaciones de lo bien
  //     hecho. Cartelito role=status que se va solo. «Mis récords» en ⭐ Mis puntos; la oficina en 🧠 › ⏱.
  //  5) Llenar orden con las columnas del cálculo (ot.columnas{tarea:[nombres]}); Modo obra, la planilla, el avance nuevo y el
  //     aviso de trabajo repetido usan esos nombres. La cámara: «Col 5 ▾» abre la lista (las de su orden y las otras de la obra).
  //  Todo en «campo» (la cuadrilla) y en la orden (la oficina): sin reglas nuevas. Apagado con __v165No.
  if (window.__inicioTarea) return;
  const off = () => !!window.__v165No;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const num = (x) => (isFinite(+x) ? +x : 0);
  const pad = (n) => String(n).padStart(2, "0");
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const ahora = () => (window.__tiempoCol && window.__tiempoCol.ahora ? window.__tiempoCol.ahora() : Date.now());
  const hhmm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const diaDe = (ts) => { const d = new Date(ts); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const durTxt = (m) => { m = Math.max(0, Math.round(+m || 0)); const h = Math.floor(m / 60), r = m % 60; return h ? h + " h" + (r ? " " + r + " min" : "") : r + " min"; };
  const reloj = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? h + ":" + pad(m) + ":" + pad(s % 60) : m + ":" + pad(s % 60); };
  const primero = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const yJunta = (l) => (l.length <= 1 ? l.join("") : l.slice(0, -1).join(", ") + " y " + l[l.length - 1]);
  const fN = (n) => (Number(n) || 0).toLocaleString("es-AR", { maximumFractionDigits: 1 });
  const CD = () => window.__cuadrillaDia || null;
  const API = () => window.__mtAPI || null;
  const TC = () => (window.__tiempoCol && !window.__v157No ? window.__tiempoCol : null);
  const AV = () => (window.__av2 && !window.__v158No ? window.__av2 : null);
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const obraDe = (o) => (o ? obras().find((x) => String(x.id) === String(o.plazaId)) || null : null);
  const campo = (o) => obj(o && o.campo);
  const yo = () => intentar(() => (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) || {}, {}) || {};
  const per = () => { const a = API(); const p = a ? intentar(() => a.persona(), "") : ""; if (p) return p; const y = yo(); return y.persona || y.nombre || ""; };
  const clave = () => { const y = yo(); return y.personaClave || nk(y.persona || y.nombre || per()); };
  const crew = () => !off() && !!CD() && intentar(() => !!CD().on(), false);
  const cerrada = (o) => !!(o && (o.estado === "Terminada" || o.estado === "Anulada" || (o.cierre && o.cierre.cerradoTs)));
  const tareas = (o) => { const a = API(); return a && o ? intentar(() => a.tareas(o) || [], []) : []; };
  const envDe = (o, k) => { const x = obj(campo(o).tareaEnv)[Lk(k)]; const l = Object.keys(obj(x)).map((q) => x[q]).filter((v) => v && v.estado); return l.length ? l.sort((a, b) => (b.ts || 0) - (a.ts || 0))[0] : null; };
  const catalogo = () => intentar(() => (window.ACTIVIDADES_CATALOGO || []).filter((x) => x && x.id && x.label), []);
  const dicc = (k) => intentar(() => (window.__DICC_ID || {})[k] || null, null);
  const labelDe = (k) => { const c = catalogo().find((x) => x.id === k); if (c) return c.label; const d = dicc(k); return d ? d.label : String(k || ""); };
  const guardar = (o, patch) => { const a = API(); if (!a || !o) return false; if (o.estado === "Emitida" && !("estado" in patch)) patch.estado = "En curso"; a.guardar(o, patch); return true; };
  const avisar = (t, tipo) => { try { if (typeof window.mostrarAviso == "function") return window.mostrarAviso(t, tipo); } catch (e) { } };
  const gps = () => { const v = intentar(() => (window.__fotoGpsVivo ? window.__fotoGpsVivo() : null), null); if (v && v.lat != null) return { lat: +v.lat, lng: +v.lng, acc: Math.round(v.prec || v.acc || 0) }; const p = intentar(() => CD().estado().pos, null); return p && p.lat != null ? p : null; };
  function dist(a, b) { const R = 6371000, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r, x = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.min(1, Math.sqrt(x))); }
  const distObra = (o) => { const b = obraDe(o) || {}, la = Number(b.lat), lo = Number(b.lng), p = gps(); if (!p || !isFinite(la) || !isFinite(lo) || !(la || lo)) return null; return dist(p, { lat: la, lng: lo }); };
  const lsLeer = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } };
  const lsPoner = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const S = { cam: null, bypass: 0, mem: {}, ini: null, timer: null, thumbs: [], rec: null };

  // ------------------------------------------------------------------ la gente de una tarea y su inicio
  function gente(o, k) {
    const as = obj(o.asignada)[k]; if (as) return [String(as)];
    const eq = arr(obj(o.equipoTarea)[k]); if (eq.length) return eq.map(String);
    return arr(o.personal).map((x) => (typeof x == "string" ? x : x && x.nombre) || "").filter(Boolean);
  }
  const conQuien = (o, k) => { const me = nk(per()); const l = gente(o, k).filter((n) => nk(n) !== me).map(primero); return l.length ? "con " + yJunta(l) : ""; };
  function inicioDe(o, k, sinMem) {
    if (!o) return null;
    const x = obj(obj(campo(o).tareaInicio)[Lk(k)]), hoy = diaDe(ahora()), l = [];
    Object.keys(x).forEach((q) => { const v = x[q]; if (v && +v.ts > 0 && diaDe(+v.ts) === hoy) l.push(v); });
    const m = sinMem ? null : S.mem[o.id + "|" + Lk(k)]; if (m && diaDe(m.ts) === hoy) l.push(m);
    if (!l.length) return null;
    l.sort((a, b) => a.ts - b.ts); return { ts: +l[0].ts, por: l[0].por || "", l };
  }
  const finDe = (o, k) => { const x = obj(obj(campo(o).tareaFin)[Lk(k)]); const l = Object.keys(x).map((q) => x[q]).filter((v) => v && +v.ts > 0).sort((a, b) => b.ts - a.ts); return l[0] || null; };
  const extras = (o) => { const x = obj(campo(o).extras); return Object.keys(x).map((q) => Object.assign({ id: q }, x[q])).filter((e) => e && (e.texto || e.k)).sort((a, b) => (a.ts || 0) - (b.ts || 0)); };

  // ------------------------------------------------------------------ hojas
  function hoja(id, html, cls) {
    cerrar(id);
    const v = document.createElement("div"); v.id = id; v.className = "v7-ov no-print" + (cls ? " " + cls : ""); v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true");
    v.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><button type="button" class="v7-x cd-xabs" data-vi="x" aria-label="Cerrar">✕</button>${html}</div>`;
    document.body.appendChild(v);   // atrasApp la ve sola (mira la página y cada toque): no hace falta llamarlo (cuesta ≈ 150 ms en un celu lento)
    return v;
  }
  function cerrar(id) { const v = $(id || "viOv"); v && v.remove(); }

  // ------------------------------------------------------------------ las tareas comunes (botones grandes) y el buscador
  const COMUNES = [["excavacion", "Pozo", "⛏"], ["hormigonado", "Hormigón", "🪣"], ["montaje_prfv", "Izaje", "⬆"], ["montaje_vinculo", "Vínculo", "🔗"], ["montaje_luminaria", "Artefacto", "💡"], ["conexionado_tablerito", "Tablerito", "🔌"], ["armado_tablero", "Tablero", "⚡"], ["pat", "PAT", "⏚"], ["zanjeo", "Zanja", "〰"]];
  function comunes(o) {
    const ks = tareas(o).map((p) => p.k);
    return COMUNES.map((c) => { let k = c[0]; if (k === "montaje_prfv" && ks.indexOf("montaje_metalica") >= 0) k = "montaje_metalica"; return { k, t: c[1], ic: c[2] }; }).filter((c) => catalogo().some((x) => x.id === c.k) || dicc(c.k));
  }
  function sugerencias(q) {
    q = nk(q); if (q.length < 2) return [];
    const ws = q.split(" ").filter(Boolean), out = [], vis = {};
    const pala = (t) => nk(t).split(/[^a-z0-9ñ]+/).filter(Boolean);
    catalogo().concat(arr(window.DICC_TAREAS)).forEach((x) => {
      if (!x || !x.id || !x.label || vis[x.id] || arr(window.DICC_VIEJAS).indexOf(x.id) >= 0) return;
      const p = pala(x.label);
      const ok = ws.every((w) => p.some((y) => y.indexOf(w) === 0)) || (ws.length === 1 && nk(x.label).indexOf(q) >= 0);
      if (!ok) return; vis[x.id] = 1;
      const pr = p[0] && p[0].indexOf(ws[0]) === 0 ? 0 : 1;
      out.push({ k: x.id, t: x.label, pr });
    });
    return out.sort((a, b) => a.pr - b.pr || a.t.length - b.t.length).slice(0, 5);
  }
  const ULT = "ema.vi.ultimas";
  const ultimas = () => arr(lsLeer(ULT, [])).slice(0, 6);
  const usar = (x) => { const l = ultimas().filter((y) => nk(y.t) !== nk(x.t)); l.unshift({ k: x.k || "", t: x.t }); lsPoner(ULT, l.slice(0, 6)); };

  // ------------------------------------------------------------------ 1) el cartel «Voy a iniciar esta tarea»
  function rangoTxt(o, p) {
    const u = intentar(() => CD().unidades(o.id, p.k), null);
    if (!u || u.tipo !== "unidad") return "";
    const l = u.items.filter((x) => !x.paso).map((x) => x.num);
    if (!l.length) return "";
    const ns = l.map((n) => (String(n).match(/(\d+)\D*$/) || [])[1]).filter(Boolean);
    return l.length === 1 ? l[0] : ns.length === l.length ? String(l[0]).replace(/\s*\d+\D*$/, "") + " " + yJunta(ns) : yJunta(l);
  }
  function cartel(o, p, it, vista) {
    const ts = tareas(o), i = ts.findIndex((x) => x.k === p.k), obra = (o.plazaNombre || "").toUpperCase(), cq = conQuien(o, p.k);
    S.ini = { otId: o.id, k: p.k, num: it ? it.num : "", elegida: S.ini && S.ini.otId === o.id && S.ini.elegida ? S.ini.elegida : null, vista: vista || "si" };
    const el = S.ini.elegida, sub = [rangoTxt(o, p), obra, cq].filter(Boolean).join(" · ");
    let h;
    if (S.ini.vista === "otra") {
      const sel = el ? el.k || "" : p.k;
      const enOrden = (k) => tareas(o).some((x) => x.k === k);
      h = `<div class="vi-e">¿Qué vas a hacer?</div><h2 class="vi-h" style="font-size:26px">Tocá la tarea</h2>
<div class="vi-grid">${comunes(o).map((c) => `<button type="button" class="vi-tk${c.k === sel && !(el && el.texto && !el.k) ? " on" : ""}${enOrden(c.k) ? " en" : ""}" data-vi="tk" data-k="${esc(c.k)}"><i aria-hidden="true">${c.ic}</i>${esc(c.t)}</button>`).join("")}</div>
${el && !COMUNES.some((c) => c[0] === el.k) ? `<div class="vi-elegida">Elegida: <b>${esc(el.t)}</b></div>` : ""}
<button type="button" class="vi-escr" data-vi="escribir">✏ Otra: escribila o decila 🎤</button>
<button type="button" class="vi-go" data-vi="iniciar">▶ Voy a iniciar · ${esc(el ? (el.k ? cortoK(el.k, el.t) : el.t) : cortoK(p.k, p.label))}</button>
<div class="vi-pie">${el && !enOrden(el.k) ? "No estaba en la orden: la oficina lo ve como «hecho de más» y lo acomoda." : "Las que tienen borde verde están en tu orden."}</div>`;
    } else {
      h = `<div class="vi-e">Tarea ${i + 1} de ${ts.length} · ${esc(o.numero || "")}</div><h2 class="vi-h">¿Arrancás con <b>${esc(cortoK(p.k, p.label))}</b>?</h2><div class="vi-sub">${esc(sub)}</div>
<button type="button" class="vi-go" data-vi="iniciar">▶ Voy a iniciar<small>esta tarea</small></button>
<button type="button" class="vi-no" data-vi="x">Todavía no</button>
<button type="button" class="vi-otra" data-vi="otra">¿Es otra tarea? Elegila acá</button>
<div class="vi-pie">La hora de inicio queda anotada (${hhmm(ahora())}). Si te olvidaste, después la corregís con − / +.</div>`;
    }
    hoja("viOv", h, "vi-hoja");
  }
  const cortoK = (k, l) => { const c = COMUNES.find((x) => x[0] === k || (k === "montaje_metalica" && x[0] === "montaje_prfv")); return c ? c[1] : nombreCorto(l || labelDe(k)); };
  const nombreCorto = (l) => { const m = String(l || "").match(/\(([^)]+)\)/); const c = String(l || "").replace(/\s*\(.*?\)\s*/g, " ").trim(); return c.length > 28 && m ? m[1] : c; };
  function escribir(o) {
    S.ini.vista = "escr";
    hoja("viOv", `<div class="vi-e">¿Qué tarea hicieron?</div><div class="vi-busca"><input type="text" id="viQ" autocomplete="off" placeholder="Escribí la tarea…" aria-label="Escribí la tarea"><button type="button" class="vi-mic" data-vi="mic" aria-label="Decila">🎤</button></div><div id="viSug"></div>
${ultimas().length ? `<div class="vi-lbl">Las últimas que usaron</div><div class="vi-ult">${ultimas().map((x, i) => `<button type="button" data-vi="ult" data-i="${i}">${esc(x.t)}</button>`).join("")}</div>` : ""}
<button type="button" class="vi-no" data-vi="volverGrid">‹ Volver a los botones</button>`, "vi-hoja");
    setTimeout(() => { const q = $("viQ"); q && q.focus(); }, 60);
  }
  function pintarSug() {
    const q = ($("viQ") || {}).value || "", box = $("viSug"); if (!box) return;
    const l = sugerencias(q);
    box.innerHTML = q.trim().length >= 2 ? `<div class="vi-sug">${l.map((x, i) => `<button type="button" data-vi="sug" data-i="${i}">${esc(x.t)}<small>de la lista</small></button>`).join("")}<button type="button" class="vi-tal" data-vi="tal">＋ Usar «${esc(q.trim())}» tal cual lo escribí</button></div>` : "";
    S.sug = l;
  }
  function elegir(x) {
    usar(x); S.ini.elegida = { k: x.k || "", t: x.t };
    const o = otDe(S.ini.otId), p = o && tareas(o).find((y) => y.k === S.ini.k);
    if (o && p) cartel(o, p, null, "otra");
  }
  // el dictado: el plugin de la app 1.4 o el del navegador (es-AR)
  function dictar(btn) {
    const q = $("viQ"); if (!q) return;
    const listo = (t) => { btn && btn.classList.remove("on"); if (t) { q.value = t; pintarSug(); } };
    const pl = intentar(() => window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.SpeechRecognition, null);
    btn && btn.classList.add("on");
    if (pl && pl.start) { Promise.resolve(pl.start({ language: "es-AR", maxResults: 1, partialResults: false, popup: false })).then((r) => listo(r && r.matches && r.matches[0]), () => listo("")); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { listo(""); avisar("Este celu no deja dictar: escribila con el micrófono del teclado."); return; }
    try { const r = new SR(); r.lang = "es-AR"; r.interimResults = false; r.maxAlternatives = 1; r.onresult = (e) => listo(e.results[0][0].transcript); r.onerror = () => listo(""); r.onend = () => btn && btn.classList.remove("on"); r.start(); } catch (e) { listo(""); }
  }

  // ------------------------------------------------------------------ iniciar (y la cámara)
  function iniciar(o, p, it, ts0) {
    const ts = ts0 || ahora(), yoN = per(), cl = Lk(clave() || nk(yoN)), pos = gps();
    o = otDe(o.id) || o;
    const x = { ts, por: yoN, v: 165, gente: gente(o, p.k) }; if (pos) { x.lat = +(+pos.lat).toFixed(6); x.lng = +(+pos.lng).toFixed(6); x.acc = pos.acc || 0; }
    const patch = {}, ya = inicioDe(o, p.k, true);
    if (!ya || !ya.l.some((v) => nk(v.por) === nk(yoN))) patch["campo.tareaInicio." + Lk(p.k) + "." + cl] = x;
    const t0 = ya ? Math.min(ya.ts, ts) : ts;
    if (it && it.num) {
      const ex = obj(obj(obj(campo(o).colInicio)[Lk(p.k)])[Lk(nk(it.num))]);
      if (!(+ex.ts > 0 && diaDe(+ex.ts) === diaDe(ts))) patch["campo.colInicio." + Lk(p.k) + "." + Lk(nk(it.num))] = { ts: t0, por: yoN, num: String(it.num), v: 165 };
    }
    const u = intentar(() => CD().unidades(o.id, p.k), null);
    if ((!u || u.tipo !== "unidad") && !obj(obj(campo(o).horasTarea)[p.k]).ini) patch["campo.horasTarea." + p.k + ".ini"] = hhmm(t0);
    S.mem[o.id + "|" + Lk(p.k)] = { ts: t0, por: yoN };
    if (Object.keys(patch).length) guardar(o, patch);
    return t0;
  }
  function iniciarExtra(o, el) {
    const ts = ahora(), yoN = per(), id = "x" + ts.toString(36) + Math.random().toString(36).slice(2, 5), pos = gps();
    const x = { k: el.k || "", texto: el.t, por: yoN, ts, gente: arr(o.personal).map((y) => (typeof y == "string" ? y : y && y.nombre)).filter(Boolean), v: 165 };
    if (pos) { x.lat = +(+pos.lat).toFixed(6); x.lng = +(+pos.lng).toFixed(6); x.acc = pos.acc || 0; }
    guardar(o, { ["campo.extras." + id]: x });
    return Object.assign({ id }, x);
  }
  function entrada(id, o) {
    let w = $("cdIns"); if (!w) { w = document.createElement("div"); w.id = "cdIns"; w.style.display = "none"; document.body.appendChild(w); }
    let i = $(id); if (!i) { w.insertAdjacentHTML("beforeend", `<input type="file" accept="image/*" capture="environment" id="${id}">`); i = $(id); }
    if (o) w.dataset.ot = o.id;
    return i;
  }
  function abrirCam(o, p, it, ex) {
    S.cam = { otId: o.id, k: ex ? "" : p.k, label: ex ? ex.texto : p.label, t0: ex ? ex.ts : (inicioDe(o, p.k) || { ts: ahora() }).ts, extra: ex ? ex.id : "", desde: Date.now(), n0: fotosHoyDe(o, ex ? "" : p.k, ex ? ex.id : "").length };
    S.thumbs = [];
    let inp;
    if (ex) { inp = entrada("viExtraIn", o); inp.dataset.ot = o.id; inp.dataset.ex = ex.id; inp.dataset.fln = ex.texto || ""; inp.dataset.ecSeguir = "1"; }   // el sello dice la tarea agregada
    else {
      const u = intentar(() => CD().unidades(o.id, p.k), null);
      inp = entrada("cdFotoIn", o); inp.dataset.k = p.k; inp.dataset.ot = o.id; inp.dataset.cat = (u && u.cat) || "otra"; inp.dataset.otra = "";
      inp.dataset.fln = it ? it.num : u && u.tipo === "unidad" ? ((u.items.find((x) => !x.paso) || {}).num || "") : p.label;
      inp.dataset.ecSeguir = "1";   // opción C: la cámara sigue abierta para la columna siguiente
    }
    const usarTel = intentar(() => localStorage.getItem("ema.camara.telefono") === "1", false);
    if (window.camaraApp && window.camaraApp.abrir && !usarTel && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { window.camaraApp.abrir(inp); vestir(); }
    else inp.click();
  }
  // abrir la cámara de la tarea que ya está en marcha (desde Modo obra)
  function volverCam(o, p) {
    if (!o || !p) return;
    const u = intentar(() => CD().unidades(o.id, p.k), null), it = u && u.tipo === "unidad" ? u.items.find((x) => !x.paso) || null : null;
    abrirCam(o, p, it);
  }

  // ------------------------------------------------------------------ 2) la cámara, opción C
  const fotosHoyDe = (o, k, ex) => { const f = obj(campo(o).fotos), h = diaDe(ahora()), me = nk(per()); return Object.keys(f).map((q) => Object.assign({ id: q }, f[q])).filter((x) => x && !x.borrada && nk(x.por) === me && (ex ? x.extra === ex : x.k === k) && diaDe(+x.ts || 0) === h); };
  function vestir() {
    let n = 0;
    const t = setInterval(() => {
      const e = $("emaCam"); if (!e && ++n < 60) return; clearInterval(t); if (!e || !S.cam) return;
      e.classList.add("vi-on");
      if (!e.querySelector(".vi-pill")) { const ar = e.querySelector(".ec-arriba"), tt = ar && ar.querySelector(".ec-tit"); if (tt) tt.insertAdjacentHTML("afterend", '<div class="vi-pill" id="viPill"></div><div class="vi-reloj" id="viReloj" role="timer">0:00</div>'); else e.insertAdjacentHTML("beforeend", '<div class="vi-pill" id="viPill" style="position:absolute;left:64px;right:12px;top:10px"></div>'); if (!$("viReloj")) e.insertAdjacentHTML("beforeend", '<div class="vi-reloj vi-relabs" id="viReloj" role="timer">0:00</div>'); e.insertAdjacentHTML("beforeend", `<button type="button" class="vi-colb" id="viColB" data-vi="cols" hidden></button><div class="vi-thumbs" id="viThumbs"></div><button type="button" class="vi-term" data-vi="termine">✓ Terminé<small>la tarea</small></button><div class="vi-camPie" id="viCamPie"></div>`); }
      pintarCam(); clearInterval(S.timer); S.timer = setInterval(tic, 1000);
    }, 50);
  }
  function tic() {
    const e = $("emaCam"); if (!e || !S.cam) { clearInterval(S.timer); S.timer = null; return; }
    const r = $("viReloj"); if (r) { const t = reloj(ahora() - S.cam.t0); if (r.textContent !== t) r.textContent = t; }
    if (!S.cam.pintado || Date.now() - S.cam.pintado > 1900) pintarCam();
  }
  function pintarCam() {
    const o = otDe(S.cam && S.cam.otId); if (!o) return; S.cam.pintado = Date.now();
    const d = distObra(o), pill = $("viPill");
    const tp = `${esc((o.plazaNombre || "").toUpperCase().replace(/^PLAZA\s+/, ""))} · ${esc(S.cam.extra ? nombreCorto(S.cam.label) : cortoK(S.cam.k, S.cam.label))}${d != null ? ` <span>· a ${d < 1000 ? Math.round(d) + " m" : fN(d / 1000) + " km"}</span>` : ""}`;
    if (pill && pill.__h !== tp) { pill.innerHTML = tp; pill.__h = tp; }
    // la columna que va a decir la foto («Col 5 ▾» abre la lista) — si la v164 tiene su fila, se usa la suya
    const cb = $("viColB"), inp = $(S.cam.extra ? "viExtraIn" : "cdFotoIn");
    const fila = document.querySelector("#emaCam .fn-nt");
    if (cb) { const nm = inp && inp.dataset.fln; const v = !fila && !S.cam.extra && nm && /\d/.test(nm); cb.hidden = !v; if (v && cb.textContent !== nm + " ▾") cb.textContent = nm + " ▾"; }
    if (fila && !fila.__it) { fila.__it = 1; fila.style.cursor = "pointer"; fila.setAttribute("data-vi", "cols"); }
    // miniaturas: las de esta tarea sacadas desde que se abrió (✓ subida · ↑ subiendo)
    const th = $("viThumbs"); if (!th) return;
    const pend = intentar(() => (window.__fotoBandeja ? window.__fotoBandeja.cantidad() : 0), 0) || 0;
    const l = S.thumbs.slice(-2);
    const h = l.map((x, i) => { const sube = l.length - i <= pend; return `<span class="vi-th" style="background-image:url('${esc(x.url)}')"><i class="${sube ? "sube" : ""}">${sube ? "↑" : "✓"}</i></span>`; }).join("");
    if (th.__h !== h) { th.innerHTML = h; th.__h = h; }
    const uc = S.ultCol && S.ultCol.otId === o.id ? `✓ ${S.ultCol.num} lista${S.ultCol.min != null ? " · " + S.ultCol.min + " min" : ""}${S.ultCol.dudosa ? " (hora dudosa)" : ""} · ` : "";
    const pie = $("viCamPie"), pt = uc ? uc.replace(/ · $/, "") : S.thumbs.length ? (pend ? "↑ subiendo · la oficina ya las ve" : "✓ subidas · la oficina ya las ve") : "";
    if (pie && pie.textContent !== pt) pie.textContent = pt;
  }
  // cada foto de la cámara de esta tarea: la miniatura (la foto la guarda Modo obra como siempre) y la columna siguiente
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || off() || !S.cam) return;
    if (t.id === "cdFotoIn" || t.id === "viExtraIn") { const f = t.files && t.files[0]; if (f) { S.thumbs.push({ url: intentar(() => URL.createObjectURL(f), ""), ts: Date.now() }); setTimeout(pintarCam, 30); } }
    if (t.id === "viExtraIn") fotoExtra(t);
    if (t.id === "cdFotoIn" && camC()) { const num0 = t.dataset.fln; setTimeout(() => pasarSiguiente(num0), 120); }
  }, true);
  const camC = () => !off() && !!S.cam && !!$("emaCam");
  function pasarSiguiente(num0) {
    const o = otDe(S.cam && S.cam.otId), inp = $("cdFotoIn"); if (!o || !inp || !S.cam || S.cam.extra || nk(inp.dataset.fln) !== nk(num0)) return;
    const u = intentar(() => CD().unidades(o.id, S.cam.k), null); if (!u || u.tipo !== "unidad") return;
    const sig = u.items.find((x) => !x.paso && !x.foto && nk(x.num) !== nk(num0)); if (!sig) return;
    const fn = window.__fotoNombre && !window.__v164No ? intentar(() => window.__fotoNombre.estado(), null) : null;
    if (fn && nk(fn.num) === nk(num0)) intentar(() => window.__fotoNombre.elegir(fn.cat, { num: sig.num }));
    else inp.dataset.fln = sig.num;
    pintarCam();
  }
  // la cámara se cerró (✕ o «Terminé»): Modo obra vuelve a cerrar la cámara con cada foto, como siempre
  new MutationObserver(() => { if (!$("emaCam")) { const i = $("cdFotoIn"); if (i && i.dataset.ecSeguir) i.dataset.ecSeguir = ""; const x = $("viExtraIn"); if (x && x.dataset.ecSeguir) x.dataset.ecSeguir = ""; } }).observe(document.body, { childList: true });
  async function fotoExtra(inp) {
    const f = inp.files && inp.files[0]; if (!f) return;
    const o = otDe(inp.dataset.ot), ex = o && extras(o).find((x) => x.id === inp.dataset.ex) || (S.cam && S.cam.extraObj); if (!o || !ex || typeof window.guardarFotoObra != "function") return;
    const por = per(), numF = nk(inp.dataset.fln) === nk(ex.texto) ? "" : inp.dataset.fln || "", cat = intentar(() => (window.catFotoDeTarea ? window.catFotoDeTarea(ex.texto) : "otra"), "otra") || "otra", ts = Date.now();
    const meta = { plazaId: o.plazaId || "", plazaNombre: o.plazaNombre || "", otId: o.id, otNumero: o.numero || "", tarea: ex.texto, cat, num: numF, por, origen: "cuadrilla", extra: ex.id, titulo: `${o.numero || ""} · ${ex.texto}` };
    inp.value = "";
    const anotar = (adj, mini) => { if (!adj) return; const a = API(); a && a.guardar(otDe(o.id) || o, { ["campo.fotos." + Lk(adj)]: { por, ts, cat, num: numF, mini: mini || "", tarea: ex.texto, extra: ex.id } }); };
    try { const s = await window.guardarFotoObra(f, meta); anotar(s && s.adjId, s && s.mini); }
    catch (er) { if (er && er.enEspera && er.adjId) anotar(er.adjId, ""); else console.warn("[inicioTarea] foto", er); }
  }

  // ------------------------------------------------------------------ «Col 5 ▾»: la lista de columnas en la cámara (maqueta 8)
  function listaCols() {
    const e = $("emaCam"), o = otDe(S.cam && S.cam.otId); if (!e || !o || S.cam.extra) return;
    const p = tareas(o).find((x) => x.k === S.cam.k); if (!p) return;
    const u = intentar(() => CD().unidades(o.id, p.k), null); if (!u || u.tipo !== "unidad") return;
    const inp = $("cdFotoIn"), act = inp ? nk(inp.dataset.fln) : "", tr = TC() ? intentar(() => TC().tramos(o, p.k), []) : [];
    const mias = u.items.map((x) => { const t = tr.find((y) => nk(y.num) === nk(x.num)); const est = x.paso && x.paso.estado !== "no" ? "ok" : nk(x.num) === act ? "aho" : ""; return `<button type="button" class="${est}" data-vi="col" data-n="${esc(x.num)}"><span>${est === "ok" ? "✅" : est === "aho" ? "📷" : "○"} ${esc(x.num)}</span><small>${est === "ok" ? "lista" + (t && t.min != null ? " · " + t.min + " min" : "") : est === "aho" ? "ahora" : "falta"}</small></button>`; }).join("");
    const enMias = {}; u.items.forEach((x) => { enMias[nk(x.num)] = 1; });
    const todas = colsDeObra(o.plazaId).cols.map((c) => c.num).filter((n) => !enMias[nk(n)]);
    const otras = todas.map((n) => `<button type="button" data-vi="col" data-n="${esc(n)}">${esc(n)}</button>`).join("");
    let v = $("viCols"); if (v) { v.remove(); return; }
    e.insertAdjacentHTML("beforeend", `<div class="vi-cols" id="viCols" role="dialog" aria-label="¿Qué columna es?"><h4>¿Qué columna es?</h4><h5>De tu orden</h5>${mias}${otras ? `<h5>Otras de la obra</h5><div class="vi-otras">${otras}</div>` : ""}</div>`);
  }
  function ponerCol(n) {
    const inp = $("cdFotoIn"); if (inp) inp.dataset.fln = n;
    const fn = window.__fotoNombre && !window.__v164No ? intentar(() => window.__fotoNombre.estado(), null) : null;   // v164: la fila de nombrar, si está
    if (fn) intentar(() => window.__fotoNombre.elegir(fn.cat && fn.cat !== "otra" ? fn.cat : (inp && inp.dataset.cat) || "columna", { num: n, manual: true }));
    const v = $("viCols"); v && v.remove(); pintarCam();
  }

  // ------------------------------------------------------------------ «Terminé la tarea» → la hoja con el tiempo de cada columna
  function terminar() {
    const c = S.cam; if (!c) return;
    intentar(() => window.camaraApp && window.camaraApp.cerrar && window.camaraApp.cerrar());
    clearInterval(S.timer); S.timer = null;
    setTimeout(() => hojaFin(c.otId, c.k, c.extra), 60);
  }
  function hojaFin(otId, k, exId, msg) {
    const o = otDe(otId); if (!o) return;
    const fin = ahora();
    if (exId) {
      const ex = extras(o).find((x) => x.id === exId) || (S.cam && S.cam.extraObj) || {};
      const min = Math.round((fin - (+ex.ts || fin)) / 60000);
      S.fin = { otId, k: "", ex: exId, cant: S.fin && S.fin.ex === exId ? S.fin.cant : 1 };
      hoja("viFin", `<div class="vi-fhero"><div class="vi-e">Tarea agregada · terminada</div><h3>${esc(nombreCorto(ex.texto || ""))} · ${durTxt(min)}</h3><div>${hhmm(+ex.ts || fin)} → ${hhmm(fin)}${conQuien(o, "") ? " · " + esc(conQuien(o, "")) : ""}</div></div>
<div class="vi-tabla"><div class="vi-fila"><b>¿Cuántas hicieron?</b><button type="button" class="vi-pm" data-vi="cant" data-d="-1">−</button><code style="margin:0 10px;font-size:20px">${fN(S.fin.cant)}</code><button type="button" class="vi-pm" data-vi="cant" data-d="1">+</button></div></div>
<div class="vi-msg" role="status">${esc(msg || "")}</div><button type="button" class="vi-go" data-vi="mandar" style="min-height:76px">✓ Listo, mandar</button><div class="vi-pie">No estaba en la orden: la oficina lo ve y lo suma o lo acomoda.</div>${sigueHtml(o, "")}`, "vi-hoja");
      return;
    }
    const p = tareas(o).find((x) => x.k === k); if (!p) return;
    const ts = tareas(o), i = ts.findIndex((x) => x.k === k), ini = inicioDe(o, k), u = intentar(() => CD().unidades(o.id, k), null);
    const tr = TC() && u && u.tipo === "unidad" ? intentar(() => TC().tramos(o, k), []).filter((t) => t.num) : [];
    const t0 = ini ? ini.ts : tr.length && tr[0].ini ? null : null;
    const finT = tr.length ? Math.max.apply(null, tr.map((t) => t.f || 0)) || fin : fin;
    const tot = ini ? Math.round((Math.max(finT, fin) - ini.ts) / 60000) : tr.reduce((s, t) => s + (t.min || 0), 0);
    S.fin = { otId, k, ex: "", cant: S.fin && S.fin.k === k && S.fin.otId === otId ? S.fin.cant : (u && u.tipo === "unidad" ? 0 : (p.repartida && p.mio > 0 ? p.mio : p.prev) || 1) };
    const filas = u && u.tipo === "unidad" ? (tr.length ? tr.map((t) => `<div class="vi-fila"><b>${esc(t.num)}</b><code class="${t.dudosa ? "dud" : ""}">${esc(t.ini || "?")}–${esc(t.fin || "?")} · ${t.min != null ? t.min + "′" : "—"}</code><button type="button" class="vi-pm" data-vi="aj" data-n="${esc(t.num)}" data-d="5" aria-label="Empezó 5 min antes">−</button><button type="button" class="vi-pm" data-vi="aj" data-n="${esc(t.num)}" data-d="-5" aria-label="Empezó 5 min después">+</button></div>`).join("") : `<div class="vi-fila"><b>Sin fotos de columnas todavía</b></div>`)
      : `<div class="vi-fila"><b>¿Cuánto hicieron?</b><button type="button" class="vi-pm" data-vi="cant" data-d="-1">−</button><code style="margin:0 10px;font-size:20px">${fN(S.fin.cant)} ${esc(p.un || "")}</code><button type="button" class="vi-pm" data-vi="cant" data-d="1">+</button></div>`;
    const hechas = tr.length, faltan = u && u.tipo === "unidad" ? u.items.filter((x) => !x.paso).length : 0;
    hoja("viFin", `<div class="vi-fhero"><div class="vi-e">Tarea ${i + 1} de ${ts.length} · terminada</div><h3>${esc(cortoK(p.k, p.label))} · ${durTxt(tot)}</h3><div>${ini ? hhmm(ini.ts) + " → " + hhmm(Math.max(finT, fin)) : ""}${conQuien(o, k) ? " · " + esc(conQuien(o, k)) : ""}</div></div>
<div class="vi-tabla">${filas}</div>${tr.length ? '<div class="vi-ayuda">¿Algún tiempo está mal? Corregilo con − / + (5 min)</div>' : ""}${faltan && hechas ? `<div class="vi-ayuda">Hiciste ${hechas} de ${hechas + faltan}: lo que falta queda para otro día.</div>` : ""}
<div class="vi-msg" role="status">${esc(msg || "")}</div><button type="button" class="vi-go" data-vi="mandar" style="min-height:76px">✓ Listo, mandar</button>${sigueHtml(o, k)}`, "vi-hoja");
  }
  function siguiente(o, k) { const l = tareas(o).filter((p) => p.k !== k && !envDe(o, p.k)); return l[0] || null; }
  function sigueHtml(o, k) {
    const s = siguiente(o, k); if (!s) return "";
    const i = tareas(o).findIndex((x) => x.k === s.k), r = rangoTxt(o, s);
    return `<div class="vi-sigue"><div class="vi-e">Sigue</div><h4>Tarea ${i + 1} · ${esc(cortoK(s.k, s.label))}${r ? " · " + esc(r) : ""}</h4><button type="button" data-vi="sigue" data-k="${esc(s.k)}">▶ Voy a iniciar esta tarea</button></div>`;
  }
  function mandar(cb) {
    const F = S.fin; if (!F) return; const o = otDe(F.otId), a = API(); if (!o || !a) return;
    const yoN = per(), cl = Lk(clave() || nk(yoN)), fin = ahora();
    if (F.ex) {
      const ex = extras(o).find((x) => x.id === F.ex) || {};
      guardar(o, { ["campo.extras." + F.ex + ".fin"]: fin, ["campo.extras." + F.ex + ".cant"]: F.cant, ["campo.extras." + F.ex + ".min"]: Math.round((fin - (+ex.ts || fin)) / 60000) });
      cerrar("viFin"); S.cam = null; felicitar(o, null); intentar(() => CD().pintar()); cb && cb(); return;
    }
    const p = tareas(o).find((x) => x.k === F.k); if (!p) return;
    const u = intentar(() => CD().unidades(o.id, p.k), null), ini = inicioDe(o, p.k);
    let cant = F.cant, est = "si";
    if (u && u.tipo === "unidad") { cant = u.items.filter((x) => x.paso && x.paso.estado !== "no").length; if (!cant) { const m = $("viFin") && $("viFin").querySelector(".vi-msg"); if (m) m.textContent = "Todavía no hay fotos de ninguna columna: sacá la foto de cada una (o tocá ✕ y «No se hizo» en Modo obra)."; return; } }
    if (!(cant > 0)) est = "no";
    const patch = { ["campo.tareaEnv." + Lk(p.k) + "." + Lk(yoN)]: { estado: est, ts: Date.now(), por: yoN, v: 165 }, ["campo.tareaFin." + Lk(p.k) + "." + cl]: { ts: fin, por: yoN } };
    if (!u || u.tipo !== "unidad") patch["campo.horasTarea." + p.k] = { ini: ini ? hhmm(ini.ts) : obj(obj(campo(o).horasTarea)[p.k]).ini || hhmm(fin), fin: hhmm(fin), por: yoN, ts: Date.now() };
    guardar(o, patch);
    a.marcar(otDe(o.id) || o, p.k, { hecho: est === "si", cant, motivo: "", nota: "" });
    // la orden se manda sola cuando están todas (como envioTarea / Modo obra)
    const o3 = otDe(o.id) || o, falta = tareas(o3).filter((x) => !envDe(o3, x.k) && x.k !== p.k);
    const todo = !falta.length;
    if (todo) {
      const hs = tareas(o3).map((x) => (x.k === p.k && patch["campo.horasTarea." + p.k]) || obj(obj(campo(o3).horasTarea)[x.k])).filter((h) => h && h.ini && h.fin);
      const P2 = {};
      if (hs.length) { const mi = (h) => { const m = String(h || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : 0; }; const i0 = hs.map((h) => h.ini).sort()[0], f0 = hs.map((h) => h.fin).sort().slice(-1)[0], ho = Math.round(((mi(f0) - mi(i0)) / 60) * 100) / 100; P2["campo.horas." + Lk(yoN)] = { nombre: yoN, ini: i0, fin: f0, horas: ho > 0 ? ho : 0 }; }
      if (!obj(campo(o3).enviados)[Lk(yoN)]) P2["campo.enviados." + Lk(yoN)] = { nombre: yoN, ts: Date.now() };
      if (Object.keys(P2).length) a.guardar(o3, P2);
    }
    cerrar("viFin"); S.cam = null; S.fin = null;
    if (!(u && u.tipo === "unidad")) { const r = recordTarea(o, p, cant, ini ? Math.round((fin - ini.ts) / 60000) : null); if (r) mostrarRec(r); }
    felicitar(o, todo ? "todo" : null);
    intentar(() => CD().pintar());
    cb && cb();
  }

  // ------------------------------------------------------------------ 4) récords y felicitaciones
  // tareas de riesgo: sin récord (para no apurar lo peligroso). A confirmar con Ángel.
  const RIESGO = ["montaje_prfv", "montaje_metalica", "hormigonado", "montaje_vinculo", "vinculo_luminaria", "montaje_luminaria", "luminaria_existente", "subida_cable", "armado_tablero", "colocacion_tablero", "tablero", "poste_tablero", "poste_madera", "base_tablero_nivel", "acometida", "acometida_aerea", "acometida_subterranea", "acometida_existente", "conexion_epec", "corte_media", "retiro_columna", "retiro_tablero", "poda", "fundaciones"];
  const riesgo = (k) => RIESGO.indexOf(k) >= 0 || intentar(() => !!(dicc(k) && dicc(k).f && dicc(k).f.alt), false);
  const fotoCon = (o, k, n) => { const f = obj(campo(o).fotos); return Object.keys(f).some((q) => { const x = f[q]; return x && !x.borrada && x.k === k && nk(x.num) === nk(n); }); };
  function fallaEn(o, k, n) {
    const A = AV(); if (!A || !o) return false;
    return intentar(() => { const E = A.estado(o.plazaId); if (!E) return false; const i = E.L.cols.findIndex((c) => nk(c.num) === nk(n)); if (i < 0) return false; const tg = arr((A.TAREA_AV || {})[k]).filter((p) => p.indexOf("c:") !== 0); return tg.some((p) => { const r = E.R[p + "|" + i]; return r && (r.e === "falla" || r.e === "obs"); }); }, false);
  }
  const cierreCambio = (o, k, nCols) => !!(o && o.cierre && o.cierre.cerradoTs && obj(o.cierre.cantidades)[k] != null && num(o.cierre.cantidades[k]) < nCols);
  // los tiempos buenos de una persona en una tarea (por columna), en orden
  function tiemposDe(persona, k, np) {
    const T = TC(); if (!T) return [];
    const me = nk(persona), porOt = {};
    const l = intentar(() => T.registros(), []).filter((r) => r.k === k && r.personas.some((x) => nk(x) === me) && (!np || r.np === np));
    l.forEach((r) => { porOt[r.otId] = (porOt[r.otId] || 0) + 1; });
    return l.map((r) => {
      const o = otDe(r.otId), e = o && envDe(o, k), P = obj(obj(campo(o).pasosObra)[Lk(k)])[Lk(nk(r.num))] || {};
      const ok = !r.dudosa && r.min > 0 && !!o && (fotoCon(o, k, r.num) || P.fuente === "foto") && !(e && e.estado === "no") && P.estado !== "no" && !fallaEn(o, k, r.num) && !cierreCambio(o, k, porOt[r.otId]);
      return { min: r.min, num: r.num, otId: r.otId, ot: r.ot, fecha: r.fecha, ok, ts: +P.finTs || 0, np: r.np, obra: r.obra };
    }).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)) || a.ts - b.ts);
  }
  // ¿la columna que acaba de terminar es récord? (r = lo que devolvió __tiempoCol.marcar)
  function recordCol(o, r) {
    if (off() || !o || !r || r.dudosa || !(r.min > 0) || riesgo(r.k)) return null;
    const np = Math.max(1, gente(o, r.k).length), l = tiemposDe(per(), r.k, np).filter((x) => x.ok && !(x.otId === o.id && nk(x.num) === nk(r.num)));
    if (l.length < 3) return null;
    const best = Math.min.apply(null, l.map((x) => x.min)), lbl = nombreCorto(labelDe(r.k));
    if (r.min < best) return { tipo: "record", em: "🔥", t: "¡Récord tuyo!", r1: `${r.num} en ${r.min} min`, r2: `Tu mejor era ${best} min · ${cortoK(r.k)}`, k: r.k };
    if (r.min <= best * 1.1) return { tipo: "cerca", em: "👍", t: "Estuviste bien", r1: `${r.num} en ${r.min} min`, r2: `Cerca de tu mejor tiempo (${best} min)`, k: r.k };
    return null;
  }
  // tareas sin columnas (zanja, PAT del tablero…): minutos por unidad con horasTarea de sus órdenes
  function recordTarea(o, p, cant, min) {
    if (off() || !(min > 0) || !(cant > 0) || riesgo(p.k)) return null;
    if (!fotosHoyDe(o, p.k, "").length && !Object.keys(obj(campo(o).fotos)).some((q) => (campo(o).fotos[q] || {}).k === p.k)) return null;
    const me = nk(per()), np = Math.max(1, gente(o, p.k).length), prev = [];
    ots().forEach((x) => {
      if (!x || x.id === o.id || x.estado === "Anulada" || !arr(x.personal).some((y) => nk(typeof y == "string" ? y : y && y.nombre) === me)) return;
      const h = obj(obj(campo(x).horasTarea)[p.k]), e = envDe(x, p.k); if (!h.ini || !h.fin || (e && e.estado === "no")) return;
      const mi = (s) => { const m = String(s || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
      const d = mi(h.fin) - mi(h.ini); const c = x.cierre && x.cierre.cerradoTs ? num(obj(x.cierre.cantidades)[p.k]) : num((obj(campo(x).marcas)[p.k] || {}).cant);
      if (!(d > 0) || !(c > 0) || Math.max(1, gente(x, p.k).length) !== np) return;
      if (!Object.keys(obj(campo(x).fotos)).some((q) => (campo(x).fotos[q] || {}).k === p.k)) return;
      prev.push(d / c);
    });
    if (prev.length < 3) return null;
    const best = Math.min.apply(null, prev), r = min / cant, un = p.un || "", lbl = nombreCorto(p.label).toLowerCase();
    if (r < best) return { tipo: "record", em: "🔥", t: "¡Récord tuyo!", r1: `${fN(cant)} ${un} de ${lbl} en ${min} min`, r2: `Tu mejor era ${Math.round(best * cant)} min`, k: p.k };
    if (r <= best * 1.1) return { tipo: "cerca", em: "👍", t: "Estuviste bien", r1: `${fN(cant)} ${un} de ${lbl} en ${min} min`, r2: `Cerca de tu mejor tiempo (${Math.round(best * cant)} min)`, k: p.k };
    return null;
  }
  // lo bien hecho de hoy
  function misOtsHoy() { const h = diaDe(ahora()), me = nk(per()); return ots().filter((o) => o && o.estado !== "Anulada" && String(o.fecha || "") === h && arr(o.personal).some((y) => nk(typeof y == "string" ? y : y && y.nombre) === me)); }
  function fotosBienHoy() {
    const me = nk(per()), h = diaDe(ahora()); let n = 0, mal = 0;
    misOtsHoy().forEach((o) => {
      const f = obj(campo(o).fotos); let nf = 0, np = 0; Object.keys(f).forEach((q) => { const x = f[q]; if (!x || x.borrada || nk(x.por) !== me || diaDe(+x.ts || 0) !== h) return; nf++; if (x.ubicDudosa) mal++; });
      const PO = obj(campo(o).pasosObra); Object.keys(PO).forEach((kk) => Object.keys(Object.assign({}, obj(PO[kk]), intentar(() => TC().pend(o, kk), {}))).forEach((q) => { const x = Object.assign({}, obj(PO[kk])[q], intentar(() => TC().pend(o, kk)[q], null) || {}); if (!x || nk(x.por) !== me) return; if (x.fuente === "foto") np++; if (x.dudosa) mal++; }));
      n += Math.max(nf, np);
    });
    return n >= 3 && !mal;
  }
  function diasSinFallas() {
    const me = nk(per()), dias = {};
    ots().forEach((o) => {
      if (!o || o.estado === "Anulada" || !arr(o.personal).some((y) => nk(typeof y == "string" ? y : y && y.nombre) === me)) return;
      const d = String(o.fecha || ""); if (!d || d > diaDe(ahora())) return;
      const malo = Object.keys(obj(campo(o).tareaEnv)).some((kk) => { const x = obj(campo(o).tareaEnv[kk]); return Object.keys(x).some((q) => x[q] && x[q].estado === "no"); }) || tareas(o).some((p) => { const PO = obj(obj(campo(o).pasosObra)[Lk(p.k)]); return Object.keys(PO).some((q) => fallaEn(o, p.k, (PO[q] || {}).num)); });
      dias[d] = dias[d] === false ? false : !malo;
    });
    let n = 0; Object.keys(dias).sort().reverse().every((d) => (dias[d] ? (n++, true) : false));
    return n;
  }
  const VISTO = "ema.vi.felic";
  const yaVisto = (key) => { const v = obj(lsLeer(VISTO, {})); return !!v[key]; };
  const marcarVisto = (key) => { const v = obj(lsLeer(VISTO, {})), h = diaDe(ahora()); Object.keys(v).forEach((q) => { if (q.slice(0, 10) !== h) delete v[q]; }); v[key] = 1; lsPoner(VISTO, v); };
  function felicitar(o, que) {
    if (off()) return;
    const h = diaDe(ahora()), extra = [];
    if (que === "todo" && !yaVisto(h + "|todo|" + o.id)) { marcarVisto(h + "|todo|" + o.id); extra.push({ em: "✅", t: "¡Terminaste todo lo de la orden!", r1: (o.numero || "") + " · " + (o.plazaNombre || "") }); }
    if (fotosBienHoy() && !yaVisto(h + "|fotos")) { marcarVisto(h + "|fotos"); extra.push({ em: "⭐", t: "Todas las fotos bien hoy", r1: "Con su columna, su hora y en la obra" }); }
    const d = diasSinFallas(); if (d >= 3 && !yaVisto(h + "|dias")) { marcarVisto(h + "|dias"); extra.push({ em: "💪", t: d + " días seguidos sin fallas", r1: "Así se trabaja" }); }
    if (!extra.length) return;
    const pr = extra[0]; if (extra[1]) pr.r3 = extra[1].em + " " + extra[1].t;
    mostrarRec(pr);
  }
  let recT = null;
  function mostrarRec(r) {
    if (!r || off()) return;
    let v = $("viRec"); if (!v) { v = document.createElement("div"); v.id = "viRec"; v.setAttribute("role", "status"); v.setAttribute("aria-live", "polite"); document.body.appendChild(v); }
    v.innerHTML = `<div class="vi-em" aria-hidden="true">${r.em}</div><b>${esc(r.t)}</b>${r.r1 ? `<div class="vi-r1">${esc(r.r1)}</div>` : ""}${r.r2 ? `<div class="vi-r2">${esc(r.r2)}</div>` : ""}${r.r3 ? `<div class="vi-r3">${esc(r.r3)}</div>` : ""}`;
    v.hidden = false; S.rec = Object.assign({ ts: Date.now() }, r);
    (S.recs = S.recs || []).push(S.rec);
    clearTimeout(recT); recT = setTimeout(() => { v.hidden = true; }, 4500);
  }
  // envuelve __tiempoCol.marcar: cada columna que termina (foto o «Lista») se compara con lo tuyo
  function envolverMarcar() {
    const T = window.__tiempoCol; if (!T || !T.marcar || T.marcar.__it) return;
    const g = T.marcar;
    const n = function (o, k, numU, ts, fuente, op) {
      const r = g.apply(this, arguments);
      if (r && !off() && crew()) { const rc = intentar(() => recordCol(o, r), null); if (camC()) S.ultCol = r; if (rc) setTimeout(() => mostrarRec(rc), 700); else setTimeout(() => felicitar(o, null), 1500); }
      return r;
    };
    n.__it = 1; T.marcar = n;
  }
  // «Mis récords» (⭐ Mis puntos de la cuadrilla) y la oficina (🧠 › ⏱)
  function recordsDe(persona) {
    const T = TC(); if (!T) return [];
    const me = nk(persona), grupos = {};
    intentar(() => T.registros(), []).filter((r) => r.personas.some((x) => nk(x) === me) && !riesgo(r.k)).forEach((r) => { grupos[r.k + "|" + r.np] = { k: r.k, np: r.np }; });
    const out = [];
    Object.keys(grupos).forEach((q) => {
      const g = grupos[q], l = tiemposDe(persona, g.k, g.np).filter((x) => x.ok);
      if (l.length < 4) return;
      let best = null; l.forEach((x, i) => { if (i >= 3 && x.min < Math.min.apply(null, l.slice(0, i).map((y) => y.min))) best = x; });
      const mejor = l.reduce((a, b) => (b.min < a.min ? b : a));
      out.push({ k: g.k, tarea: cortoK(g.k), np: g.np, mejor: mejor.min, num: mejor.num, fecha: mejor.fecha, ot: mejor.ot, record: !!best, n: l.length, mediana: intentar(() => T.mediana(l.map((x) => x.min)), null) });
    });
    return out.sort((a, b) => a.tarea.localeCompare(b.tarea, "es"));
  }
  function misRecordsHtml() {
    if (off()) return "";
    const l = recordsDe(per());
    const fc = (f) => { const p = String(f || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] : f; };
    return `<div class="cd-cd vi-recs"><div class="cd-eti"><span>🔥 Mis récords</span></div>${l.length ? l.map((x) => `<div class="cd-rw"><span class="cd-ico vd">🔥</span><div class="cd-tx"><b>${esc(x.tarea)}</b><small>Tu mejor: ${x.mejor} min por ${x.k === "zanjeo" ? "metro" : "columna"} (${esc(x.num)}, ${esc(fc(x.fecha))})${x.np > 1 ? " · de a " + x.np : ""}</small></div><div class="cd-pr"><b>${x.mejor}′</b><span class="cd-tag vd">${x.n} veces</span></div></div>`).join("") : '<div class="cd-vacio">Todavía no hay récords: salen solos con la foto de cada columna (desde 4 tiempos buenos de la misma tarea).</div>'}<div class="cd-vacio" style="padding-top:4px">Solo cuentan los tuyos, con foto y hora buena. En izaje, hormigonado, altura, tablero y acometida no hay récord.</div></div>`;
  }
  function oficinaRecordsHtml() {
    if (off()) return "";
    const pers = {}; intentar(() => TC().registros(), []).forEach((r) => r.personas.forEach((p) => { pers[p] = 1; }));
    const filas = Object.keys(pers).sort().map((p) => ({ p, l: recordsDe(p) })).filter((x) => x.l.length);
    return `<div class="card tc-ap"><h2>🔥 Récords de cada uno <span class="h2-sub">solo para mirar · cada persona contra sus propios tiempos (con foto, hora buena, sin falla; sin récord en tareas de riesgo)</span></h2>${filas.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Persona</th><th>Sus mejores tiempos</th></tr></thead><tbody>${filas.map((x) => `<tr><td><b>${esc(x.p)}</b></td><td data-label="Mejores">${esc(x.l.map((y) => y.tarea + ": " + y.mejor + " min" + (y.np > 1 ? " (de a " + y.np + ")" : "") + " · " + y.n + " veces").join(" · "))}</td></tr>`).join("")}</tbody></table></div>` : '<div class="sg-av info">ⓘ Todavía no hay récords (hacen falta 4 tiempos buenos de la misma tarea por persona).</div>'}</div>`;
  }
  function envolverAprende() {
    const T = window.__tiempoCol; if (!T || !T.aprendeHtml || T.aprendeHtml.__it) return;
    const g = T.aprendeHtml; const n = function () { const h = g.apply(this, arguments); return off() || !h ? h : h + intentar(() => oficinaRecordsHtml(), ""); }; n.__it = 1; T.aprendeHtml = n;
  }

  // ------------------------------------------------------------------ Modo obra: la tarea en marcha (dentro de lo que pinta tiempoCol)
  function marchaHtml(o, pa) {
    if (off() || !crew() || !o || !pa || !pa.p || pa.fase === "llegue" || pa.fase === "fin") return "";
    const ini = inicioDe(o, pa.p.k); if (!ini) return "";
    return `<div class="vi-marcha" role="status"><span>▶ ${esc(nombreCorto(pa.p.label))} en marcha desde ${hhmm(ini.ts)}${ini.l.length > 1 || ini.por ? " · inició " + esc(primero(ini.por)) : ""}</span><button type="button" class="cam" data-vi="volverCam">📷 Volver a la cámara</button><button type="button" data-vi="termineObra">✓ Terminé la tarea</button></div>`;
  }
  function envolverObra() {
    const T = window.__tiempoCol; if (!T || !T.obraHtml || T.obraHtml.__it) return;
    const g = T.obraHtml; const n = function (o, pa) { const h = g.apply(this, arguments); return intentar(() => marchaHtml(o, pa), "") + (h || ""); }; n.__it = 1; T.obraHtml = n;
  }

  // ------------------------------------------------------------------ la oficina: «📸 Avance», la verificación y el cierre
  const oficina = () => { const y = yo(); return !crew() && ["admin", "oficina"].indexOf(String(y.rol || "")) >= 0 && intentar(() => (typeof permiso == "function" ? permiso("parte") === "editar" : true), true); };
  function inicioHtml(o) {
    const l = arr(o.actividades).map((k) => ({ k, label: labelDe(k) })).map((p) => { const i = inicioDe(o, p.k), f = finDe(o, p.k); return i ? `▶ ${esc(cortoK(p.k, p.label))}: inició ${hhmm(i.ts)}${f ? " · terminó " + hhmm(f.ts) + " (" + durTxt((f.ts - i.ts) / 60000) + ")" : ""} · ${esc(primero(i.por))}` : ""; }).filter(Boolean);
    return l.length ? `<div class="vi-of" style="background:#eef8f1;border-color:#cfe9d8"><b>▶ «Voy a iniciar» de la cuadrilla</b>${l.map((x) => `<span class="vi-ini">${x}</span>`).join("")}</div>` : "";
  }
  function extrasHtml(o, conBotones) {
    if (typeof o == "string") o = otDe(o);
    if (off() || !o) return "";
    const l = extras(o); if (!l.length) return "";
    const fotosEx = (id) => Object.keys(obj(campo(o).fotos)).filter((q) => (campo(o).fotos[q] || {}).extra === id && !(campo(o).fotos[q] || {}).borrada).length;
    const puede = conBotones !== false && oficina() && !cerrada(o);
    return `<div class="vi-of"><b>➕ Hecho de más · no estaba en la orden</b>${l.map((x) => `<div class="vi-ofr" data-viex="${esc(x.id)}"><span><b style="display:inline">${esc(x.texto || labelDe(x.k))}</b>${x.k ? "" : " (escrita a mano)"} · ${esc(primero(x.por))} · ${hhmm(+x.ts || 0)}${x.fin ? "–" + hhmm(x.fin) : " (en marcha)"}${x.cant ? " · " + fN(x.cant) : ""} · ${fotosEx(x.id)} ${fotosEx(x.id) === 1 ? "foto" : "fotos"}${x.sumado ? " · ✅ sumada a la orden" : x.descartado ? " · ✕ descartada" : ""}</span>${puede && !x.sumado && !x.descartado ? `<button type="button" class="si" data-visumar="${esc(o.id)}" data-ex="${esc(x.id)}">＋ Sumar a la orden</button><button type="button" data-videsc="${esc(o.id)}" data-ex="${esc(x.id)}">✕ Descartar</button>` : ""}</div>`).join("")}</div>`;
  }
  const extrasTexto = (o) => (typeof o == "string" && (o = otDe(o)), off() || !o ? "" : extras(o).filter((x) => !x.descartado).map((x) => `hecho de más (no estaba en la orden): ${x.texto || labelDe(x.k)}${x.cant ? " × " + fN(x.cant) : ""}${x.sumado ? " (ya sumada)" : ""}`).join(" | "));
  function envolverOficina() {
    const g = window.__cdOficinaHtml; if (typeof g != "function" || g.__it) return;
    const n = function (ot) { const h = g.apply(this, arguments); if (off()) return h; return (h || "") + intentar(() => inicioHtml(ot) + extrasHtml(ot), ""); };
    intentar(() => window.__heredar && window.__heredar(n, g)); n.__it = 1; window.__cdOficinaHtml = n;
  }
  async function sumarExtra(otId, exId) {
    const o = otDe(otId), x = o && extras(o).find((y) => y.id === exId); if (!o || !x || typeof window.fbOtUpdate != "function") return;
    const por = intentar(() => (window.__fbUser && window.__fbUser.email) || "", ""), patch = { ["campo.extras." + exId + ".sumado"]: { ts: Date.now(), por } };
    let k = x.k && (catalogo().some((c) => c.id === x.k) || dicc(x.k)) ? x.k : "";
    const acts = arr(o.actividades);
    if (k) { if (acts.indexOf(k) < 0) patch.actividades = acts.concat(k); patch["previsto." + k] = Math.max(num(obj(o.previsto)[k]), num(x.cant) || 1); }
    else { const am = arr(o.actividadesManuales).concat({ actividad: x.texto, detalle: "Agregada por la cuadrilla (" + primero(x.por) + ")", pasos: "" }); patch.actividadesManuales = am; k = "m" + (am.length - 1); }
    Object.keys(obj(campo(o).fotos)).forEach((q) => { const f = campo(o).fotos[q]; if (f && f.extra === exId) { patch["campo.fotos." + q + ".k"] = k; patch["campo.fotos." + q + ".tarea"] = labelDe(k) || x.texto; } });
    if (x.fin && x.ts && k) patch["campo.horasTarea." + k] = { ini: hhmm(+x.ts), fin: hhmm(+x.fin), por: x.por || "", ts: Date.now() };
    if (x.fin && k) patch["campo.marcas." + k] = { hecho: true, cant: num(x.cant) || 1, por: x.por || "", ts: Date.now() };
    try { await window.fbOtUpdate(o.id, patch); avisar("✅ Sumada a " + (o.numero || "la orden") + ": " + (x.texto || labelDe(k))); intentar(() => typeof window.auditar == "function" && window.auditar("ot_extra_sumada", `${o.numero || o.id} · ${x.texto}`)); }
    catch (e) { avisar(e && e.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar órdenes." : "⚠ No se pudo guardar (revisá la conexión).", "error"); return; }
    if (document.querySelector(".cierre-qty") && typeof window.abrirCierreOt == "function") setTimeout(() => intentar(() => window.abrirCierreOt(o.id)), 500);
  }
  async function descartarExtra(otId, exId) {
    const o = otDe(otId); if (!o || typeof window.fbOtUpdate != "function") return;
    try { await window.fbOtUpdate(o.id, { ["campo.extras." + exId + ".descartado"]: { ts: Date.now(), por: intentar(() => (window.__fbUser && window.__fbUser.email) || "", "") } }); avisar("Descartada."); } catch (e) { avisar("⚠ No se pudo guardar.", "error"); }
  }

  // ------------------------------------------------------------------ 5) las columnas del cálculo (Llenar orden, la orden, la cámara)
  function colsDeObra(plazaId) {
    const A = AV(); const out = { cols: [], tabs: 0, E: null };
    const o = obras().find((x) => String(x.id) === String(plazaId)); if (!o) return out;
    const E = A ? intentar(() => A.estado(o), null) : null;
    if (E && E.L && E.L.cols.length) { out.cols = E.L.cols.map((c, i) => ({ num: c.num, tab: c.tab, circ: c.circ, jab: c.jab, i })); out.tabs = E.L.tableros || 0; out.E = E; return out; }
    const l = intentar(() => (typeof window.puntosDeObra == "function" ? window.puntosDeObra(plazaId).lista || [] : []), []);
    out.cols = l.map((n, i) => { const m = String(n).match(/T(\d+)\s*·\s*C(\d+)/i); return { num: String(n), tab: m ? +m[1] : 0, circ: m ? +m[2] : 0, i }; });
    return out;
  }
  // qué chips lleva una tarea: columnas (sus pasos), jabalinas, tableros, acometida
  function tipoChips(k) {
    const A = AV(), tg = arr(A && (A.TAREA_AV || {})[k]);
    if (tg.some((p) => p.indexOf("c:") !== 0)) return k === "pat" ? "jab" : "col";
    if (tg.some((p) => /^c:(col_tab|arm_tab|pozo_tab|poste_tab|base_tab)$/.test(p))) return "tab";
    if (tg.indexOf("c:acometida") >= 0) return "acom";
    if (!A) { const cat = intentar(() => window.catFotoDeTarea(labelDe(k)), ""); if (/^(columna|caja|luminaria)$/.test(cat) && !/metro/i.test(String((dicc(k) || {}).un || ""))) return "col"; }
    return "";
  }
  function chipsDe(plazaId, k) {
    const C = colsDeObra(plazaId), tipo = tipoChips(k), A = AV(); if (!tipo) return null;
    const tg = arr(A && (A.TAREA_AV || {})[k]).filter((p) => p.indexOf("c:") !== 0);
    const E = C.E, ntab = Math.max(C.tabs || 0, ...C.cols.map((c) => c.tab || 0), tipo === "tab" || tipo === "acom" ? 1 : 0);
    const G = ["pozo", "horm", "izaje", "vinc", "artef", "tabl", "sello"], HE = { ver: 1, sinver: 1, mano: 1, frag: 1 };
    const est = (i) => {
      if (!E || !tg.length) return ""; const r = E.R[tg[0] + "|" + i]; if (!r) return "";
      if (HE[r.e]) return "hecha";
      const h = E.R["horm|" + i]; if (h && h.e === "frag" && ["pozo", "horm", "acab"].indexOf(tg[0]) < 0) return "frag:" + h.fragHasta;
      if (r.asig) return "asig:" + (r.asig.ot || "");
      const g = G.indexOf(tg[0]), ant = g > 0 ? E.R[G[g - 1] + "|" + i] : null;   // falta el paso anterior (no se sugiere)
      if (ant && !HE[ant.e] && ant.e !== "nolleva") return "sinprev";
      return "";
    };
    const items = [];
    if (tipo === "col" || tipo === "jab") C.cols.forEach((c) => { if (tipo === "jab" && E && !c.jab) return; items.push({ n: c.num, g: c.tab || c.circ ? "Tablero " + (c.tab || 1) + " · Circuito " + (c.circ || 1) : "Columnas", est: est(c.i) }); });
    if (tipo === "jab" || tipo === "tab") for (let t = 1; t <= ntab; t++) items.push({ n: tipo === "jab" ? "PAT T" + t : "Tablero " + t, g: "Tablero", est: "" });
    if (tipo === "acom") for (let t = 1; t <= Math.max(1, ntab); t++) items.push({ n: ntab > 1 ? "Acometida T" + t : "Acometida", g: "Tablero", est: "" });
    return items.length ? { tipo, items } : null;
  }
  // las que siguen: las que faltan (sin hacer, sin fraguar, sin otra orden), en orden
  function lasQueSiguen(plazaId, k, n, desde) {
    const c = chipsDe(plazaId, k); if (!c) return [];
    const l = c.items.filter((x) => !x.est), i0 = desde ? Math.max(0, l.findIndex((x) => nk(x.n) === nk(desde))) : 0;
    return l.slice(i0, i0 + Math.max(1, Math.round(n || 1))).map((x) => x.n);
  }
  const ST = { obra: "", sel: {}, prog: 0 };
  const obraForm = () => intentar(() => { const o = typeof plazaOtActiva == "function" ? plazaOtActiva() : null; return o ? String(o.id) : ""; }, "");
  function prevInput(k) { return document.querySelector('.ot-act-prev[data-id="' + (window.CSS && CSS.escape ? CSS.escape(k) : k) + '"]'); }
  function ponerPrev(k, n) { const i = prevInput(k); if (!i) return; ST.prog++; i.value = n > 0 ? String(n) : ""; try { i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new Event("change", { bubbles: true })); } catch (e) { } ST.prog--; }
  const fDia = (ts) => { const d = new Date(ts); return ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][d.getDay()]; };
  function boxHtml(obra, k) {
    const c = chipsDe(obra, k); if (!c) return "";
    const sel = arr(ST.sel[k]), grupos = [];
    c.items.forEach((x) => { let g = grupos.find((y) => y.g === x.g); if (!g) grupos.push((g = { g: x.g, l: [] })); g.l.push(x); });
    const fr = c.items.find((x) => /^frag:/.test(x.est));
    const un = c.tipo === "col" ? "columna" : c.tipo === "jab" ? "jabalina" : c.tipo === "tab" ? "tablero" : "acometida";
    return `<div class="cc-box" data-cck="${esc(k)}"><div class="cc-cab"><b>Tocá ${c.tipo === "col" ? "las columnas" : "lo"} que van · salen del cálculo de la obra</b><span class="cc-n">${sel.length} ${sel.length === 1 ? un : un.replace(/a$/, "as").replace(/o$/, "os").replace(/n$/, "nes")}</span></div>${grupos.map((g) => `${grupos.length > 1 || g.g !== "Columnas" ? `<div class="cc-gt">${esc(g.g)}</div>` : ""}<div class="cc-chips">${g.l.map((x) => { const on = sel.some((s) => nk(s) === nk(x.n)); const e = x.est.split(":")[0]; return `<button type="button" class="cc-c${on ? " on" : ""}${e ? " " + e : ""}" data-ccn="${esc(x.n)}"${e === "hecha" ? ' disabled aria-disabled="true"' : ""} title="${e === "hecha" ? "ya hecha" : e === "frag" ? "fraguando hasta " + fDia(+x.est.split(":")[1]) : e === "asig" ? "ya en " + esc(x.est.split(":")[1]) : ""}">${esc(x.n)}</button>`; }).join("")}</div>`).join("")}
<div class="cc-ley"><i style="background:#28285E"></i>elegida<i style="background:#34c759"></i>ya hecha${fr ? `<i style="background:#b77900"></i>fraguando (hasta ${fDia(+fr.est.split(":")[1])})` : ""}</div><div class="cc-at"><button type="button" data-cca="sigue">Las que siguen</button>${c.tipo === "col" && grupos.length > 1 ? '<button type="button" data-cca="circ">Todo el circuito</button>' : ""}<button type="button" data-cca="nada">Ninguna</button></div></div>`;
  }
  function pintarForm() {
    if (off()) return;
    const ofv = $("viewParteDiario"); if (!ofv || ofv.style.display === "none") return;
    const obra = obraForm(); if (obra !== ST.obra) { ST.obra = obra; if (!ST.cargado) ST.sel = {}; ST.cargado = false; document.querySelectorAll(".cc-box").forEach((b) => b.remove()); }
    if (!obra) return;
    document.querySelectorAll(".ot-tarea").forEach((t) => {
      const ch = t.querySelector(".ot-act-check"); if (!ch) return; const k = ch.value, b = t.querySelector(".cc-box");
      if (!ch.checked) { if (b) b.remove(); return; }
      const h = boxHtml(obra, k); if (!h) { if (b) b.remove(); return; }
      if (b && b.__h === h) return;
      if (b) b.remove(); t.insertAdjacentHTML("beforeend", h); const nb = t.querySelector(".cc-box"); if (nb) nb.__h = h;
    });
  }
  function clicForm(e) {
    const c = e.target.closest && e.target.closest(".cc-box [data-ccn], .cc-box [data-cca]"); if (!c) return false;
    e.preventDefault(); e.stopPropagation();
    const box = c.closest(".cc-box"), k = box.dataset.cck, obra = ST.obra; let sel = arr(ST.sel[k]).slice();
    if (c.dataset.ccn) { if (c.disabled) return true; const n = c.dataset.ccn, i = sel.findIndex((s) => nk(s) === nk(n)); if (i >= 0) sel.splice(i, 1); else sel.push(n); }
    else if (c.dataset.cca === "nada") sel = [];
    else if (c.dataset.cca === "sigue") { const pv = +((prevInput(k) || {}).value || 0); sel = lasQueSiguen(obra, k, pv > 0 ? pv : 3); }
    else if (c.dataset.cca === "circ") { const C = chipsDe(obra, k); const ref = sel[0] ? C.items.find((x) => nk(x.n) === nk(sel[0])) : C.items.find((x) => !x.est); if (ref) sel = C.items.filter((x) => x.g === ref.g && !x.est).map((x) => x.n); }
    const C = chipsDe(obra, k), orden = C ? C.items.map((x) => nk(x.n)) : [];
    sel.sort((a, b) => orden.indexOf(nk(a)) - orden.indexOf(nk(b)));
    ST.sel[k] = sel; ponerPrev(k, sel.length); pintarForm();
    return true;
  }
  // «Dejar solo Col 6» (v150) u otro cambio a mano de la cantidad: la elección se acomoda
  document.addEventListener("input", (e) => {
    const t = e.target; if (off() || ST.prog || !t || !t.classList || !t.classList.contains("ot-act-prev")) return;
    const k = t.dataset.id, sel = arr(ST.sel[k]); if (!sel.length) return;
    const v = Math.round(+t.value || 0); if (v === sel.length) return;
    const hechas = (window.__hecho && intentar(() => window.__hecho.nombresHechos(ST.obra, k), [])) || [];
    const sinHechas = sel.filter((s) => !arr(hechas).some((h) => nk(h) === nk(s)));
    ST.sel[k] = v === sinHechas.length ? sinHechas : v < sel.length ? sel.slice(0, Math.max(0, v)) : sel.concat(lasQueSiguen(ST.obra, k, v + sel.length).filter((n) => !sel.some((s) => nk(s) === nk(n)))).slice(0, v);
    setTimeout(pintarForm, 0);
  }, true);
  window.__colsElegidas = (obra, k) => (off() || String(obra) !== String(ST.obra) ? null : arr(ST.sel[k]).slice());
  function envolverForm() {
    const g = window.datosOtDesdeFormulario; if (typeof g == "function" && !g.__it) {
      const n = function () { const r = g.apply(this, arguments); if (!r || off()) return r; const cols = {}; arr(r.actividades).forEach((k) => { const s = arr(ST.sel[k]); if (s.length && String(r.plazaId) === String(ST.obra)) cols[k] = s.slice(); }); if (Object.keys(cols).length) r.columnas = cols; return r; };
      intentar(() => window.__heredar && window.__heredar(n, g)); n.__it = 1; window.datosOtDesdeFormulario = n;
    }
    const ge = window.editarOrdenTrabajo; if (typeof ge == "function" && !ge.__it) {
      const n = function (id) { const o = otDe(id); if (!off()) { ST.sel = o ? JSON.parse(JSON.stringify(obj(o.columnas))) : {}; ST.cargado = true; ST.obra = o ? String(o.plazaId || "") : ""; } const r = ge.apply(this, arguments); setTimeout(pintarForm, 60); return r; };
      intentar(() => window.__heredar && window.__heredar(n, ge)); n.__it = 1; window.editarOrdenTrabajo = n;
    }
    const ga = window.fbOtAdd; if (typeof ga == "function" && !ga.__it165) {
      const n = function (ot) { if (!off() && ot && ot.plazaId) intentar(() => llenarCols(ot)); const r = ga.apply(this, arguments); if (!off()) { ST.sel = {}; setTimeout(pintarForm, 300); } return r; };
      intentar(() => window.__heredar && window.__heredar(n, ga)); n.__it165 = 1; window.fbOtAdd = n;
    }
  }
  // la sugerida, el asistente y lo que se emite sin elegir: «las que siguen» (la cantidad de la orden)
  function llenarCols(ot) {
    const cols = Object.assign({}, obj(ot.columnas)), usadas = {};
    Object.keys(cols).forEach((k) => arr(cols[k]).forEach((n) => { usadas[k + "|" + nk(n)] = 1; }));
    arr(ot.actividades).forEach((k) => {
      if (arr(cols[k]).length) return; const pv = num(obj(ot.previsto)[k]); if (!(pv > 0)) return;
      const t = tipoChips(k); if (t !== "col" && t !== "jab") return;
      const l = lasQueSiguen(ot.plazaId, k, pv); if (l.length) cols[k] = l;
    });
    if (Object.keys(cols).length) ot.columnas = cols;
  }

  // ------------------------------------------------------------------ los toques
  window.addEventListener("click", (e) => {
    if (off()) return;
    if (clicForm(e)) return;
    const t = e.target;
    // Modo obra: el botón grande de una tarea que todavía no arrancó → el cartel
    const bt = t.closest && t.closest('#cdApp [data-cd="boton"]');
    if (bt && crew() && !S.bypass) {
      const pa = intentar(() => CD().pasoActual(), null), o = otDe(intentar(() => CD().estado().otId, ""));
      if (pa && pa.p && o && (pa.fase === "foto" || pa.fase === "termine") && !inicioDe(o, pa.p.k) && !envDe(o, pa.p.k)) { e.preventDefault(); e.stopImmediatePropagation(); S.ini = null; cartel(o, pa.p, pa.it); return; }
      if (pa && pa.p && o && pa.fase === "foto" && inicioDe(o, pa.p.k)) { e.preventDefault(); e.stopImmediatePropagation(); volverCam(o, pa.p); return; }
      return;
    }
    const b = t.closest && t.closest("[data-vi], [data-visumar], [data-videsc]"); if (!b) return;
    if (b.dataset.visumar) { e.preventDefault(); return void sumarExtra(b.dataset.visumar, b.dataset.ex); }
    if (b.dataset.videsc) { e.preventDefault(); return void descartarExtra(b.dataset.videsc, b.dataset.ex); }
    const a = b.dataset.vi; e.preventDefault(); e.stopPropagation();
    const I = S.ini, o = otDe((I && I.otId) || (S.fin && S.fin.otId) || (S.cam && S.cam.otId) || intentar(() => CD().estado().otId, ""));
    if (a === "x") { const v = b.closest(".v7-ov"); if (v && v.id === "viFin") { S.fin = null; } v ? v.remove() : cerrar(); return; }
    if (a === "otra" && o && I) { const p = tareas(o).find((x) => x.k === I.k); return p && cartel(o, p, null, "otra"); }
    if (a === "volverGrid" && o && I) { const p = tareas(o).find((x) => x.k === I.k); return p && cartel(o, p, null, "otra"); }
    if (a === "tk" && o && I) { const k = b.dataset.k; I.elegida = { k, t: labelDe(k) }; const p = tareas(o).find((x) => x.k === I.k); return p && cartel(o, p, null, "otra"); }
    if (a === "escribir" && o) return escribir(o);
    if (a === "sug") { const x = (S.sug || [])[+b.dataset.i]; return x && elegir(x); }
    if (a === "tal") { const q = (($("viQ") || {}).value || "").trim(); return q && elegir({ k: "", t: q.charAt(0).toUpperCase() + q.slice(1) }); }
    if (a === "ult") { const x = ultimas()[+b.dataset.i]; return x && elegir(x); }
    if (a === "mic") return dictar(b);
    if (a === "iniciar" && o && I) {
      const el = I.elegida, p0 = tareas(o).find((x) => x.k === (el ? el.k : I.k));
      cerrar("viOv");
      if (p0) {
        // la hora es la del toque; la cámara se abre primero y la orden se anota enseguida, en otro turno (que el toque no se trabe)
        const u = intentar(() => CD().unidades(o.id, p0.k), null), it = p0.k === I.k && I.num ? { num: I.num } : u && u.tipo === "unidad" ? u.items.find((x) => !x.paso) || null : null, t0 = ahora();
        if (!inicioDe(o, p0.k)) S.mem[o.id + "|" + Lk(p0.k)] = { ts: t0, por: per() };
        S.ini = null; abrirCam(o, p0, it); setTimeout(() => iniciar(o, p0, it, t0), 450); return;
      }
      if (el) { const ex = iniciarExtra(o, el); S.ini = null; abrirCam(o, null, null, ex); if (S.cam) S.cam.extraObj = ex; return; }
      return;
    }
    if (a === "termine") return terminar();
    if (a === "cols") return listaCols();
    if (a === "col") return ponerCol(b.dataset.n);
    if (a === "termineObra" && o) { const pa = intentar(() => CD().pasoActual(), null); if (pa && pa.p) return hojaFin(o.id, pa.p.k, ""); return; }
    if (a === "volverCam" && o) { const pa = intentar(() => CD().pasoActual(), null); if (pa && pa.p) return volverCam(o, pa.p); return; }
    if (a === "aj" && S.fin && o && TC()) { intentar(() => TC().ajustar(o, S.fin.k, b.dataset.n, +b.dataset.d)); return hojaFin(S.fin.otId, S.fin.k, ""); }
    if (a === "cant" && S.fin) { S.fin.cant = Math.max(0, num(S.fin.cant) + (+b.dataset.d || 0)); return hojaFin(S.fin.otId, S.fin.k, S.fin.ex); }
    if (a === "mandar") return mandar();
    if (a === "sigue") { const k = b.dataset.k; return mandar(() => { const o2 = otDe(o.id), p = o2 && tareas(o2).find((x) => x.k === k); if (!p) return; const u = intentar(() => CD().unidades(o2.id, p.k), null), it = u && u.tipo === "unidad" ? u.items.find((x) => !x.paso) || null : null; const t0 = ahora(); S.mem[o2.id + "|" + Lk(p.k)] = { ts: t0, por: per() }; abrirCam(o2, p, it); setTimeout(() => iniciar(o2, p, it, t0), 450); }); }
  }, true);
  document.addEventListener("input", (e) => { if (e.target && e.target.id === "viQ") pintarSug(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target && e.target.id === "viQ") { e.preventDefault(); const x = (S.sug || [])[0]; const q = (e.target.value || "").trim(); if (x) elegir(x); else if (q) elegir({ k: "", t: q }); } });
  // la cámara se cerró con ✕: se vuelve a Modo obra (la tarea sigue en marcha)
  new MutationObserver(() => { if (S.cam && !$("emaCam") && !$("viFin")) { clearInterval(S.timer); S.timer = null; } }).observe(document.body, { childList: true });

  // los envoltorios (y los que llegan tarde)
  const envolverTodo = () => { if (off()) return; envolverMarcar(); envolverAprende(); envolverObra(); envolverOficina(); envolverForm(); };
  envolverTodo(); setTimeout(envolverTodo, 0); document.addEventListener("DOMContentLoaded", envolverTodo);
  let tf = 0; setInterval(() => { envolverTodo(); if (++tf % 1 === 0) pintarForm(); }, 1200);
  document.addEventListener("change", (e) => { const t = e.target; if (!off() && t && (t.classList && t.classList.contains("ot-act-check") || t.id === "otPlaza")) setTimeout(pintarForm, 30); });

  window.__inicioTarea = {
    on: () => !off(), cartel: (id) => { if (!crew()) return; const o = otDe(id || intentar(() => CD().estado().otId, "")), pa = intentar(() => CD().pasoActual(o && o.id), null); if (o && pa && pa.p) cartel(o, pa.p, pa.it); },
    camC, inicioDe, finDe, extras, iniciar, iniciarExtra, abrirCam, terminar, hojaFin, mandar, sugerencias, comunes, ultimas,
    recordCol, recordTarea, tiemposDe, recordsDe, misRecordsHtml, oficinaRecordsHtml, felicitar, fotosBienHoy, diasSinFallas, mostrarRec, riesgo, RIESGO,
    extrasHtml, extrasTexto, inicioHtml, sumarExtra, descartarExtra,
    colsDeObra, chipsDe, lasQueSiguen, llenarCols, pintarForm, listaCols, ponerCol,
    estado: () => ({ cam: S.cam ? Object.assign({}, S.cam) : null, ini: S.ini, fin: S.fin, rec: S.rec, recs: (S.recs || []).slice(), sel: JSON.parse(JSON.stringify(ST.sel)), obraForm: ST.obra })
  };
})();
