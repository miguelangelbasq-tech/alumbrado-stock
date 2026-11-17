(function () {
  "use strict";
  // v166 · «▶ Voy a iniciar» y el tiempo de cada columna también en Mis tareas (la lista) (Ángel 17/11/2026, con la v165 en los
  // celus: «a los chicos no les sale eso del tiempo ni nada»). Los chicos sacan las fotos desde Mis tareas («Ver lista completa»,
  // ordenesCampo + tareasTarjetas + envioTarea), no desde Modo obra; la v165 solo enganchaba el botón grande de Modo obra.
  //  1) El primer 📷 (o «Se hizo») de una tarea que todavía no arrancó hoy y no se mandó abre el MISMO cartel de la v165 (#viOv,
  //     «Todavía no», «¿Es otra tarea?»). «▶ Voy a iniciar» anota lo mismo (campo.tareaInicio / colInicio, para todos los de la
  //     orden: el compañero ya no lo ve) y sigue con lo que la persona quería hacer: la cámara de esa fila (la de la app o la del
  //     teléfono / APK, el mismo clic de siempre, así la foto llega a su fila por fotoSegura / androidPro). «Todavía no» deja
  //     seguir sin anotar y no vuelve a preguntar en 15 min por esa tarea.
  //  2) En la cabecera de cada tarea: «▶ Voy a iniciar esta tarea» o «▶ En marcha desde 08:20 · 12 min».
  //  3) Cada fila de columna con foto: «✓ Col 1 lista · 42 min» con «cambiar» (− / +), la misma línea de la v157 (en la plantilla
  //     de la lista de fotos, así el redibujo nodo por nodo no la borra). Las filas que faltan siguen las columnas que eligió la
  //     oficina (ot.columnas, v165) si las hay.
  //  4) Récords de cada columna (la foto de Mis tareas pasa por __tiempoCol.marcar, que la v165 envuelve) y, al mandar una tarea,
  //     el récord de las tareas sin columnas y las felicitaciones (#viRec).
  //  Todo en «campo» como la v165: sin reglas nuevas. Apagado con __v166No (y con __v165No).
  if (window.__inicioMt) return;
  const off = () => !!(window.__v166No || window.__v165No);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const pad = (n) => String(n).padStart(2, "0");
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const IT = () => (window.__inicioTarea && window.__inicioTarea.on && window.__inicioTarea.on() ? window.__inicioTarea : null);
  const TC = () => (window.__tiempoCol && !window.__v157No ? window.__tiempoCol : null);
  const API = () => window.__mtAPI || null;
  const ahora = () => (TC() ? TC().ahora() : Date.now());
  const hhmm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const durTxt = (m) => { m = Math.max(0, Math.round(+m || 0)); const h = Math.floor(m / 60), r = m % 60; return h ? h + " h" + (r ? " " + r + " min" : "") : r + " min"; };
  const primero = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const campo = (o) => obj(o && o.campo);
  const cerrada = (o) => !!(o && (o.estado === "Terminada" || o.estado === "Anulada" || (o.cierre && o.cierre.cerradoTs)));
  const crew = () => !off() && !!IT() && intentar(() => IT().esCrew(), false);
  const tareas = (o) => (IT() && o ? intentar(() => IT().tareasDe(o), []) : []);
  const envDe = (o, k) => (IT() ? intentar(() => IT().envDe(o, k), null) : null);
  const per = () => { const a = API(); const p = a ? intentar(() => a.persona(), "") : ""; if (p) return p; const y = intentar(() => PERMISOS.yo(), {}) || {}; return y.persona || y.nombre || ""; };
  const S = { bypass: 0, salt: {}, abiertos: {}, ult: null, med: [] };
  const SALTO_MS = 15 * 60000;

  // ------------------------------------------------------------------ ¿esta tarea pide el cartel?
  function pide(o, k) {
    if (!crew() || !o || !k || k === "seguridad" || cerrada(o)) return false;
    if (!tareas(o).some((x) => x.k === k)) return false;
    if (envDe(o, k) || IT().inicioDe(o, k)) return false;
    const s = S.salt[o.id + "|" + k]; if (s && Date.now() - s < SALTO_MS) return false;
    return true;
  }
  const esUnidad = (o, k) => intentar(() => { const u = window.__cuadrillaDia.unidades(o.id, k); return !!u && u.tipo === "unidad"; }, false);
  const primeraFalta = (o, k) => intentar(() => { const u = window.__cuadrillaDia.unidades(o.id, k); return u && u.tipo === "unidad" ? u.items.find((x) => !x.paso) || null : null; }, null);
  // de qué fila es el toque (la columna de esa fila; si no, la primera que falta)
  function itDe(o, k, el) {
    const inp = el && (el.matches && el.matches("input.mt-foto-t") ? el : el.querySelector && el.querySelector("input.mt-foto-t"));
    const n = inp && inp.dataset.fln && inp.dataset.fli !== "x" && inp.dataset.fln !== "Otra" ? inp.dataset.fln : "";
    if (n && esUnidad(o, k)) return { num: n };
    return primeraFalta(o, k);
  }
  // dónde está ahora lo que tocó (Mis tareas se redibuja: puede ser otro nodo)
  function localizar(L) {
    if (L.el && L.el.isConnected) return L.el;
    const base = `#mtApp .mt-ot[data-ot="${CSS.escape(L.ot)}"] .mt-tarea[data-k="${CSS.escape(L.k)}"]`;
    if (L.tipo === "si") return document.querySelector(base + ' [data-m="si"]');
    if (L.tipo === "cab") return document.querySelector(base + " label.fl-cam.prim") || null;
    if (L.fli != null) { const i = [...document.querySelectorAll(base + " input.mt-foto-t")].find((x) => x.dataset.fli === L.fli && (x.dataset.fln || "") === (L.fln || "")) || [...document.querySelectorAll(base + " input.mt-foto-t")].find((x) => L.fln && x.dataset.fln === L.fln); if (i) return i.closest("label") || i; }
    if (L.flcam) return document.querySelector(base + ` [data-flcam][data-fli="${CSS.escape(String(L.flcam))}"]`);
    return null;
  }
  function seguirCon(L) {
    const el = localizar(L); if (!el) return;
    S.bypass++;
    try { el.click(); } catch (e) { console.warn("[inicioMt]", e); } finally { S.bypass--; }
  }
  // lo que pasa con «▶ Voy a iniciar» del cartel abierto desde Mis tareas
  function hacerSeguir(L, it) {
    return function (o, p0, el) {
      if (!p0) return false;   // otra tarea que no estaba en la orden: la cámara C de la v165 (campo.extras)
      const t0 = ahora(), misma = p0.k === L.k;
      intentar(() => IT().memIni(o, p0.k, t0));
      if (misma) seguirCon(L);   // en el mismo toque: la cámara (la de la app, la del teléfono o la del APK)
      setTimeout(() => { intentar(() => IT().iniciar(o, p0, misma ? it : primeraFalta(o, p0.k), t0)); intentar(() => API().redibujar()); }, 450);
      if (!misma) setTimeout(() => irTarea(o.id, p0.k), 60);
      return true;
    };
  }
  // pasar la tarjeta a otra tarea de la orden (tareasTarjetas: los puntitos [data-mtcir] van en el orden de sus tareas)
  function irTarea(otId, k) {
    const card = document.querySelector(`#mtApp .mt-ot[data-ot="${CSS.escape(otId)}"]`); if (!card) return;
    const l = [...card.querySelectorAll(".mt-tarea[data-k]")].map((x) => x.dataset.k), i = l.indexOf(k);
    const d = card.querySelector(`[data-mtcir="${i}"]`); d && d.click();
  }

  // ------------------------------------------------------------------ los toques
  const SEL = 'label.fl-cam, label.fl-cam-mas, label.fl-otra, label.mt-foto-btn, [data-flcam], input.mt-foto-t, [data-m="si"], [data-vimt]';
  window.addEventListener("click", (e) => {
    if (off() || S.bypass) return;
    const t = e.target; if (!t || !t.closest) return;
    const b = t.closest(SEL); if (!b) return;
    const tarea = b.closest("#mtApp .mt-ot[data-ot] .mt-tarea[data-k]"); if (!tarea) return;
    const card = tarea.closest(".mt-ot[data-ot]"), o = otDe(card.dataset.ot), k = tarea.dataset.k;
    const cab = b.matches("[data-vimt]");
    if (!o || !pide(o, k)) { if (cab) { e.preventDefault(); e.stopImmediatePropagation(); } return; }
    const t0 = performance.now();
    e.preventDefault(); e.stopImmediatePropagation();
    const inp = b.matches("input.mt-foto-t") ? b : b.querySelector && b.querySelector("input.mt-foto-t");
    const L = { ot: o.id, k, el: cab ? null : b, tipo: cab ? "cab" : b.matches('[data-m="si"]') ? "si" : "foto", fli: inp ? inp.dataset.fli : null, fln: inp ? inp.dataset.fln : "", flcam: b.matches("[data-flcam]") ? b.dataset.fli : null };
    const p = tareas(o).find((x) => x.k === k), it = itDe(o, k, cab ? null : b);
    S.ult = { otId: o.id, k, ts: Date.now() };
    IT().cartelMt(o, p, it, hacerSeguir(L, it), () => { S.salt[o.id + "|" + k] = Date.now(); if (!cab) seguirCon(L); });
    S.med.push(Math.round(performance.now() - t0)); if (S.med.length > 20) S.med.shift();
  }, true);
  // «cambiar» de una fila: queda abierta aunque Mis tareas se redibuje
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest(".vim-t [data-tc]"); if (!b) return;
    const ln = b.closest(".tc-linea"); if (ln) S.abiertos[ln.dataset.tcot + "|" + ln.dataset.tck + "|" + nk(ln.dataset.tcnum)] = Date.now();
  }, true);

  // ------------------------------------------------------------------ al mandar una tarea (envioTarea): récord de las que no van por columna, felicitaciones
  let ultEt = null;
  window.addEventListener("click", (e) => {   // en window: envioTarea frena el clic en document
    if (off() || !crew()) return;
    const t = e.target; if (!t || !t.closest) return;
    const et = t.closest('#mtApp button[data-et="si"]');
    if (et) { const tr = et.closest(".mt-tarea[data-k]"), cd = et.closest(".mt-ot[data-ot]"); if (tr && cd) ultEt = { otId: cd.dataset.ot, k: tr.dataset.k }; return; }
    const env = t.closest('#etPop [data-etp="enviar"]'); if (!env || !ultEt) return;
    const U = ultEt; ultEt = null;
    setTimeout(() => trasMandar(U.otId, U.k), 500);
  }, true);
  function trasMandar(otId, k) {
    const o = otDe(otId), it = IT(); if (!o || !it) return;
    const e = envDe(o, k); if (!e || e.estado !== "si") return;
    const yoN = per(), cl = Lk(intentar(() => (PERMISOS.yo() || {}).personaClave, "") || nk(yoN));
    if (!obj(obj(campo(o).tareaFin)[Lk(k)])[cl]) intentar(() => API().guardar(o, { ["campo.tareaFin." + Lk(k) + "." + cl]: { ts: ahora(), por: yoN, v: 166 } }));
    const p = tareas(o).find((x) => x.k === k);
    if (p && !esUnidad(o, k)) {
      const h = obj(obj(campo(o).horasTarea)[k]), mi = (s) => { const m = String(s || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
      const ini = it.inicioDe(o, k), a = ini ? mi(hhmm(ini.ts)) : mi(h.ini), z = mi(h.fin), m = obj(obj(campo(o).marcas)[k]), cant = +m.cant || 0;
      const r = a != null && z != null && z > a ? intentar(() => it.recordTarea(o, p, cant, z - a), null) : null;
      if (r) it.mostrarRec(r);
    }
    const todo = tareas(o).every((x) => envDe(o, x.k));
    setTimeout(() => intentar(() => it.felicitar(o, todo ? "todo" : null)), 1500);
  }

  // ------------------------------------------------------------------ las plantillas de Mis tareas
  function cabHtml(o, p) {
    if (!crew() || !o || !p || p.k === "seguridad" || cerrada(o) || envDe(o, p.k)) return "";
    const ini = IT().inicioDe(o, p.k);
    if (!ini) return `<div class="vim-cab no-print"><button type="button" class="vim-go" data-vimt="1">▶ Voy a iniciar esta tarea</button></div>`;
    const m = Math.max(0, Math.round((ahora() - ini.ts) / 60000)), quien = ini.por && nk(ini.por) !== nk(per()) ? " · inició " + primero(ini.por) : "";
    const gente = intentar(() => TC().quienes(o, p.k), "");
    return `<div class="vim-cab no-print on"><span><b>▶ En marcha desde ${hhmm(ini.ts)} · ${esc(durTxt(m))}</b>${gente || quien ? `<small>${esc(gente)}${esc(quien)}</small>` : ""}</span></div>`;
  }
  function envolverCab() {
    const g = window.__mtTareaCab; if (g && g.__vim) return;
    const n = function (o, p) { const r = typeof g == "function" ? g.apply(this, arguments) || "" : ""; return off() ? r : r + intentar(() => cabHtml(o, p), ""); };
    if (g) window.__heredar && window.__heredar(n, g);
    n.__vim = 1; window.__mtTareaCab = n;
  }
  // la línea de una fila con foto (la llama la plantilla de la lista de fotos)
  window.__mtFilaTiempo = function (o, tarea, num) {
    if (off() || !crew() || !o || !tarea || !TC()) return "";
    return intentar(() => {
      const t = TC().tramos(o, tarea.k).find((x) => !x.tarea && nk(x.num) === nk(num)); if (!t) return "";
      const ab = S.abiertos[o.id + "|" + tarea.k + "|" + nk(num)], abierto = !!ab && Date.now() - ab < 120000;
      let h = TC().lineaHtml({ otId: o.id, k: tarea.k, num: t.num, min: t.min, dudosa: t.dudosa, dudosaMot: t.dudosaMot, iniFuente: t.iniFuente }, abierto);
      if (t.iniFuente === "empece" && IT().inicioDe(o, tarea.k)) h = h.replace("desde que tocaste «Empecé»", "desde «Voy a iniciar»");
      if (t.ini && t.fin) { const i = h.indexOf("</span>"); if (i > 0) h = h.slice(0, i) + `<small class="vim-h">${esc(t.ini)} → ${esc(t.fin)}</small>` + h.slice(i); }
      return `<div class="vim-t">${h}</div>`;
    }, "");
  };
  // la fila que sigue, con la tarea en marcha: «⏱ corriendo · 12 min» (desde la última columna terminada o desde «Voy a iniciar»)
  window.__mtFilaCorre = function (o, tarea, num) {
    if (off() || !crew() || !o || !tarea || !num || cerrada(o) || envDe(o, tarea.k)) return "";
    return intentar(() => {
      const ini = IT().inicioDe(o, tarea.k); if (!ini) return "";
      const l = TC() ? TC().tramos(o, tarea.k).filter((x) => !x.tarea && x.f) : [], desde = Math.max(ini.ts, l.length ? l[l.length - 1].f : 0);
      return `<div class="vim-corre">⏱ ${esc(num)} corriendo · ${esc(durTxt((ahora() - desde) / 60000))}</div>`;
    }, "");
  };
  // las filas que faltan: las columnas que eligió la oficina (v165)
  window.__mtColsOt = (o, k) => (off() || !o ? [] : (Array.isArray(obj(o.columnas)[k]) ? o.columnas[k].map(String).filter(Boolean) : []));

  envolverCab(); setTimeout(envolverCab, 0); document.addEventListener("DOMContentLoaded", envolverCab);
  setInterval(() => { if (!off()) envolverCab(); }, 1500);
  window.__inicioMt = { on: () => !off(), pide, cabHtml, estado: () => ({ salt: Object.assign({}, S.salt), ult: S.ult, med: S.med.slice() }), trasMandar };
})();
