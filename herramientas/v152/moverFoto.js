(function () {
  "use strict";
  // v152 · Mover fotos: a mano y con el asistente (Ángel, 13/11/2026: «la IA de la app no puede mover imágenes de una carpeta a
  // otra; tiene que poder, y también en la app a mano»). Los 4 casos: de una obra a otra, de columna o tipo dentro de la misma
  // obra (Col 4 → Col 5, Zanja → Tablero), desde «Fotos sin obra» a una obra y de una orden a otra.
  //  · Un solo motor (__moverFoto.mover): cambia TODO lo que dice dónde está la foto, por los caminos de la app:
  //      - la ficha (fotosObra) y el adjunto: plazaId/plazaNombre, otId/otNumero, cat, num, k/tarea; movidaDe {de dónde venía,
  //        ts, por, motivo} + movidaHist[] (el historial no se pierde);
  //      - la orden: sale de campo.fotos de la de origen (queda campo.fotosMovidas.<foto> {a, ts, por}) y entra en la de destino
  //        con su tarea (k), columna y miniatura de 72 px; dentro de la misma orden se cambian cat/num/k y, si la columna era la
  //        única foto de un «Terminé» de Modo obra, ese paso pasa a la columna nueva (así la verificación v150 cuenta bien);
  //      - la imagen (R2 o la base) NO se mueve ni se copia.
  //    Permisos (las reglas v128, sin reglas nuevas): quien edita Avance o Registrar obra mueve cualquier foto (si cambia de
  //    orden, además tiene que editar Órdenes); la cuadrilla, solo SUS fotos de SU orden abierta y solo de columna/tipo/tarea
  //    dentro de esa orden (la base no la deja tocar la ficha ni otra obra); «solo mirar» y pañol, nada.
  //    Auditoría foto_mover. Después: caché del legajo y de la galería, evento «fotos-movidas».
  //  · A mano: «↔ Mover» en el visor y en la selección de la galería (legajo —también «☑ Elegir fotos»—, Mis fotos, Mis
  //    tareas…), «Asignar a una obra» en «📷 Fotos sin obra» y «Era de otra columna» en la foto guardada de Modo obra → hoja
  //    #mfOv (.v7-ov, ✕) «¿A dónde la pasás?» (obra con buscador, orden, de qué es, columna, tarea, motivo) con el antes → después
  //    y «Sí, mover».
  //  · Con el asistente: buscar_fotos (ids) y proponer_mover_fotos con los 4 destinos (__moverFoto.ia).
  // Pruebas viejas: __v152No (lo pone el arnés salvo v152:true).
  if (window.__moverFoto) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*/[\].`]/g, "_");
  const LkP = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";   // la de pasosObra (cuadrillaDia / verifObra)
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const pad = (n) => String(n).padStart(2, "0");
  const hhmm = (ts) => { const d = new Date(+ts || 0); return !ts || isNaN(d) ? "" : pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const fCorta = (ts) => { const d = new Date(+ts || 0); return !ts || isNaN(d) ? "" : pad(d.getDate()) + "/" + pad(d.getMonth() + 1); };
  const isoDe = (ts) => { const d = new Date(+ts || 0); return isNaN(d) ? "" : d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const off = () => !!window.__v152No;
  const SIN_OBRA = "__sinObra";
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const obras = () => { const a = intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []), b = intentar(() => (Array.isArray(window.avanceObrasTodas) ? window.avanceObrasTodas : []), []); const v = {}, l = []; a.concat(b).forEach((o) => { if (o && o.id != null && !v[o.id]) { v[o.id] = 1; l.push(o); } }); return l; };
  const obraDe = (id) => obras().find((o) => String(o.id) === String(id)) || null;
  const nombreObra = (id) => (String(id) === SIN_OBRA ? "Fotos sin obra" : ((obraDe(id) || {}).nombre || (obraDe(id) || {}).plazaNombre || ""));
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const yo = () => intentar(() => (window.PERMISOS && PERMISOS.yo ? PERMISOS.yo() : null), null) || {};
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false) || ["cuadrilla", "operario"].indexOf(String(yo().rol || "")) >= 0;
  const yoPersona = () => String(yo().persona || yo().nombre || "");
  const yoNombre = () => String(yo().nombre || yo().persona || yo().usuario || String((window.__fbUser || {}).email || "").split("@")[0]);
  const db = () => firebase.firestore();
  const FV = () => firebase.firestore.FieldValue;
  // quién puede qué (las reglas v128: fotosObra la edita Avance o Registrar obra; las órdenes, Órdenes; la cuadrilla, campo de SU orden)
  const oficina = () => !off() && !!window.__fbUser && !window.__modoEmergencia && !esCrew() && (permiso("avance") === "editar" || permiso("registro") === "editar");
  const editaOrdenes = () => permiso("parte") === "editar";
  const abierta = (o) => !!o && (o.estado === "Emitida" || o.estado === "En curso") && !(o.cierre && o.cierre.cerradoTs);
  const CATS = () => (Array.isArray(window.CATS_FOTO) ? window.CATS_FOTO : [["otra", "Otra", false]]);
  const catTxt = (c) => intentar(() => window.catFotoTxt(c || "otra"), c || "");
  const pideNum = (c) => intentar(() => !!window.catFotoPideNum(c), false);
  const labelDe = (k) => intentar(() => { const a = (window.ACTIVIDADES_CATALOGO || ACTIVIDADES_CATALOGO).find((x) => x.id === k); return a ? a.label : k; }, k);
  const catDeK = (k) => intentar(() => window.catFotoDeTarea(labelDe(k)), "otra");
  const tareasDe = (o) => (Array.isArray(o && o.actividades) ? o.actividades : []).filter((k) => typeof k == "string" && k && k.indexOf("m:") !== 0);
  const puntosDe = (plazaId) => intentar(() => (window.puntosDeObra(plazaId) || {}).lista || [], []) || [];
  const numDe = (n) => String(n == null ? "" : n).trim();
  const ordenNum = (a, b) => intentar(() => window.ordenPunto(a) - window.ordenPunto(b), 0) || String(a).localeCompare(String(b));

  // ============================================================== dónde está cada foto
  // REG: lo que ya se leyó (buscar_fotos, ubicar_fotos, el Supervisor): ficha por id y por adjId, así no se vuelve a leer
  const REG = {};
  function recordar(l) { (Array.isArray(l) ? l : [l]).forEach((f) => { if (!f) return; const x = Object.assign({}, f); if (x.adjId) REG["a:" + x.adjId] = x; if (x.id) REG["f:" + x.id] = x; }); }
  function entradaEnOrden(adj) {
    const k = Lk(adj); let r = null;
    ots().forEach((o) => { if (!o || o.estado === "Anulada") return; const f = obj(obj(o.campo).fotos)[k]; if (f && !f.borrada && (!r || (f.movidaDe && (!r.f.movidaDe || f.movidaDe.ts > r.f.movidaDe.ts)))) r = { o, key: k, f }; });
    return r;
  }
  async function fichaDe(id) {
    // por adjId (lo normal: la galería y el legajo usan el id del adjunto) o por id de la ficha (el asistente / el Supervisor)
    let x = REG["a:" + id] || REG["f:" + id] || null;
    if (x && x.id) { try { const d = await db().collection("fotosObra").doc(x.id).get(); if (d.exists) return Object.assign({ id: d.id }, d.data()); } catch (e) { } return x; }
    try { const s = await db().collection("fotosObra").where("adjId", "==", String(id)).get(); let m = null; s.forEach((d) => { const v = Object.assign({ id: d.id }, d.data()); if (!v.borrada && (!m || (v.ts || 0) > (m.ts || 0))) m = v; }); if (m) return m; } catch (e) { }
    try { const d = await db().collection("fotosObra").doc(String(id)).get(); if (d.exists) return Object.assign({ id: d.id }, d.data()); } catch (e) { }
    return null;
  }
  async function localizar(id) {
    id = String(id || ""); if (!id) return null;
    let ficha = null;
    let ent = entradaEnOrden(id);
    if (!ent || oficina()) ficha = await fichaDe(id);
    const adj = (ficha && ficha.adjId) || (ent ? id : "") || id;
    if (!ent && ficha && ficha.adjId) ent = entradaEnOrden(ficha.adjId);
    if (!ficha && !ent) return null;
    const ef = ent ? ent.f : {}, fi = ficha || {};
    // la orden manda (es lo que leen la verificación, Modo obra y «te faltan fotos»); la ficha completa lo que falta
    const plazaId = String((ent && ent.o.plazaId) || fi.plazaId || "");
    const antes = {
      plazaId, plazaNombre: (ent && ent.o.plazaNombre) || fi.plazaNombre || nombreObra(plazaId),
      otId: ent ? ent.o.id : String(fi.otId || ""), otNumero: ent ? ent.o.numero || "" : fi.otNumero || "",
      cat: (ent ? ef.cat : fi.cat) || fi.cat || "otra", num: numDe(ent ? ef.num : fi.num),
      k: (ent ? ef.k : fi.k) || "", tarea: (ent ? ef.tarea : fi.tarea) || fi.tarea || ""
    };
    if (antes.otId && !otDe(antes.otId) && !ent) { /* la orden no está en memoria: queda como dato */ }
    return { id, adjId: adj, ficha, ent, antes, por: ef.por || fi.por || "", ts: ef.ts || fi.ts || 0, mini: fi.mini || ef.mini || "", mini72: ef.mini || "", lat: fi.lat, lng: fi.lng, fecha: fi.fecha || isoDe(ef.ts || fi.ts) };
  }
  // ¿esta persona la puede mover? (rápido, de memoria: para mostrar o no el botón)
  function puedeVer(adj) {
    if (off() || !adj) return false;
    if (oficina()) return true;
    const e = entradaEnOrden(adj); if (!e || !esCrew()) return false;
    return abierta(e.o) && !!yoPersona() && nk(e.f.por) === nk(yoPersona());
  }
  const puedeAlguna = () => !off() && (oficina() || esCrew());
  // el destino de una foto: lo que no se dice, queda como está
  function destinoDe(L, dest) {
    const a = L.antes, d = Object.assign({}, a);
    if (dest.otId != null && dest.otId !== "keep") {
      if (dest.otId === "") { d.otId = ""; d.otNumero = ""; }
      else { const o = otDe(dest.otId); if (!o) return { err: "No encontré la orden de destino." }; d.otId = o.id; d.otNumero = o.numero || ""; d.plazaId = String(o.plazaId || ""); d.plazaNombre = o.plazaNombre || nombreObra(o.plazaId); }
    }
    if (dest.plazaId != null && dest.plazaId !== "" && String(dest.plazaId) !== d.plazaId) {
      if (dest.otId != null && dest.otId !== "keep" && dest.otId !== "") return { err: "La orden elegida es de otra obra." };
      d.plazaId = String(dest.plazaId); d.plazaNombre = nombreObra(dest.plazaId); if (dest.otId == null || dest.otId === "keep") { d.otId = ""; d.otNumero = ""; }
    }
    if (dest.cat) d.cat = dest.cat;
    if (dest.num != null && dest.num !== "keep") d.num = numDe(dest.num);
    const o = d.otId ? otDe(d.otId) : null, ts = o ? tareasDe(o) : [];
    if (dest.k != null && dest.k !== "auto" && dest.k !== "keep") d.k = dest.k;
    else if (d.otId && (d.otId !== a.otId || d.cat !== a.cat || !a.k)) {
      // la tarea de la orden que corresponde a lo que es la foto (la de antes si sigue sirviendo)
      d.k = (a.k && ts.indexOf(a.k) >= 0 && catDeK(a.k) === d.cat) ? a.k : (ts.find((k) => catDeK(k) === d.cat) || (ts.length === 1 && d.otId !== a.otId ? ts[0] : ""));
    } else if (!d.otId) d.k = "";
    d.tarea = d.k ? labelDe(d.k) : d.otId === a.otId ? a.tarea : "";
    if (d.plazaId === SIN_OBRA && d.otId) return { err: "«Fotos sin obra» no tiene órdenes." };
    return { d };
  }
  const cambia = (a, d) => ["plazaId", "otId", "cat", "num", "k"].some((c) => String(a[c] || "") !== String(d[c] || ""));
  function motivoNo(L, d) {
    if (off()) return "No está en esta versión.";
    if (oficina()) {
      const tocaOrden = (L.ent && L.ent.o.id !== d.otId) || (d.otId && (!L.ent || L.ent.o.id !== d.otId)) || (L.ent && L.ent.o.id === d.otId);
      if (tocaOrden && !editaOrdenes()) return "Tu usuario no puede cambiar las órdenes de trabajo: pedile a la oficina que la mueva.";
      return "";
    }
    if (!esCrew()) return "Tu usuario no puede mover fotos.";
    if (!L.ent) return "Esa foto no está en ninguna orden tuya.";
    if (nk(L.ent.f.por) !== nk(yoPersona())) return "Solo podés cambiar las fotos que sacaste vos.";
    if (!abierta(L.ent.o)) return "La orden ya está cerrada: pedile a la oficina que la cambie.";
    if (d.plazaId !== L.antes.plazaId || d.otId !== L.antes.otId) return "Desde el celu solo podés cambiar la columna o lo que es la foto dentro de tu orden. Para pasarla a otra obra, avisale a la oficina.";
    return "";
  }
  const ubic = (x) => [x.plazaId === SIN_OBRA ? "Fotos sin obra" : (x.plazaNombre || nombreObra(x.plazaId) || "?"), x.otNumero || (x.otId ? (otDe(x.otId) || {}).numero || "" : "sin orden"), [catTxt(x.cat), pideNum(x.cat) || x.num ? x.num : ""].filter(Boolean).join(" ")].filter(Boolean).join(" · ");

  // ============================================================== el motor
  async function mover(ids, dest, motivo, op) {
    op = op || {}; dest = dest || {}; motivo = String(motivo || "").trim().slice(0, 200);
    if (off()) return { ok: 0, mal: [{ id: "", motivo: "No está en esta versión." }], movidas: [] };
    const quien = yoNombre(), ts0 = Date.now(), res = { ok: 0, mal: [], movidas: [] }, tocadas = {};
    const lista = (Array.isArray(ids) ? ids : [ids]).map(String).filter((x, i, l) => x && l.indexOf(x) === i);
    for (let i = 0; i < lista.length; i++) {
      const id = lista[i];
      let L = null; try { L = op.L && op.L[id] ? op.L[id] : await localizar(id); } catch (e) { L = null; }
      if (!L) { res.mal.push({ id, motivo: "no encontré la foto" }); continue; }
      const r = destinoDe(L, dest); if (r.err) { res.mal.push({ id, motivo: r.err }); continue; }
      const a = L.antes, d = r.d;
      if (!cambia(a, d)) { res.mal.push({ id, motivo: "ya está ahí", igual: true }); continue; }
      const no = motivoNo(L, d); if (no) { res.mal.push({ id, motivo: no }); continue; }
      if (oficina() && a.plazaId !== d.plazaId && !motivo && !op.sinMotivo) { res.mal.push({ id, motivo: "falta el motivo (cambia de obra)" }); continue; }
      const ts = ts0 + i, mv = { plazaId: a.plazaId, plazaNombre: a.plazaNombre || "", cat: a.cat || "", num: a.num || "", otId: a.otId || "", k: a.k || "", ts, por: quien, motivo: motivo || "" };
      if (op.porAsistente) mv.porAsistente = true; if (op.porSupervisor) mv.porSupervisor = true;
      const key = Lk(L.adjId), P = "campo.fotos." + key;
      try {
        // 1) las órdenes (primero: es lo más restringido; si la base no deja, no se toca nada más)
        if (L.ent && L.ent.o.id === d.otId) {
          const o = L.ent.o, pt = { [P + ".cat"]: d.cat, [P + ".num"]: d.num, [P + ".k"]: d.k, [P + ".tarea"]: d.tarea, [P + ".movidaDe"]: mv };
          // un «Terminé» de Modo obra que solo tenía esta foto pasa a la columna nueva (la verificación cuenta la columna correcta)
          const po = obj(obj(obj(o.campo).pasosObra)[LkP(a.k)]), kv = LkP(nk(a.num)), kn = LkP(nk(d.num));
          const otraFoto = Object.keys(obj(obj(o.campo).fotos)).some((q) => { const f = o.campo.fotos[q]; return q !== key && f && !f.borrada && f.k === a.k && nk(f.num) === nk(a.num); });
          let paso = null;
          if (a.k && a.k === d.k && a.num && d.num && kv !== kn && po[kv] && po[kv].estado !== "no" && !po[kn] && !otraFoto) {
            paso = Object.assign({}, po[kv], { num: d.num, movidaDe: { num: a.num, ts, por: quien } });
            pt["campo.pasosObra." + LkP(a.k) + "." + kv] = FV().delete(); pt["campo.pasosObra." + LkP(a.k) + "." + kn] = paso;
          }
          await window.fbOtCampo(o.id, pt);
          intentar(() => { const f = o.campo.fotos[key]; Object.assign(f, { cat: d.cat, num: d.num, k: d.k, tarea: d.tarea, movidaDe: mv }); if (paso) { const pp = o.campo.pasosObra[LkP(a.k)]; delete pp[kv]; pp[kn] = paso; } });
        } else {
          let base = L.ent ? Object.assign({}, L.ent.f) : { por: L.por, ts: L.ts || ts };
          delete base.borrada; delete base.movidaDe;
          if (d.otId) {
            let mini = L.mini72 || ""; if (!mini && L.mini) mini = await intentar(() => window.__miniChica(L.mini), Promise.resolve("")) || "";
            const nuevo = Object.assign(base, { k: d.k, tarea: d.tarea, cat: d.cat, num: d.num, mini: mini || "", movidaDe: mv });
            await window.fbOtCampo(d.otId, { [P]: nuevo });
            intentar(() => { const o2 = otDe(d.otId); o2.campo = o2.campo || {}; o2.campo.fotos = o2.campo.fotos || {}; o2.campo.fotos[key] = nuevo; });
          }
          if (L.ent) {
            await window.fbOtCampo(L.ent.o.id, { [P]: FV().delete(), ["campo.fotosMovidas." + key]: { a: d.otId || d.plazaId, ts, por: quien } });
            intentar(() => { delete L.ent.o.campo.fotos[key]; });
          }
        }
        // 2) la ficha del legajo y el adjunto (la cuadrilla no puede: la base solo la deja tocar su orden)
        if (oficina()) {
          const cambios = { plazaId: d.plazaId, plazaNombre: d.plazaNombre || "", otId: d.otId || "", otNumero: d.otNumero || "", cat: d.cat, num: d.num, k: d.k || "", tarea: d.tarea || "", movidaDe: mv, movidaHist: FV().arrayUnion(mv) };
          if (L.ficha && L.ficha.id) await db().collection("fotosObra").doc(L.ficha.id).update(cambios);
          else if (typeof window.fbFotoObraCrear == "function" && !d.otId) {   // sin ficha y sin orden: si no, la foto no aparecería en ningún legajo
            await window.fbFotoObraCrear({ plazaId: d.plazaId, plazaNombre: d.plazaNombre || "", otId: "", otNumero: "", k: "", tarea: "", cat: d.cat, num: d.num, nota: "", adjId: L.adjId, mini: L.mini || "", ts: L.ts || ts, fecha: L.fecha || isoDe(ts), por: L.por || "", usuario: "", origen: "movida", movidaDe: mv, movidaHist: [mv] });
          }
          try { await db().collection("adjuntos").doc(L.adjId).update({ plazaId: d.plazaId, plazaNombre: d.plazaNombre || "", otId: d.otId || "", cat: d.cat, num: d.num, movidaDe: mv, movidaHist: FV().arrayUnion(mv) }); }
          catch (e) { if (!/not-found/.test(String(e && e.code))) res.avisoAdj = (e && e.code) || "error"; }
          if (L.ficha) { Object.assign(L.ficha, cambios, { movidaHist: (L.ficha.movidaHist || []).concat([mv]) }); recordar(L.ficha); }
        }
        res.ok++; res.movidas.push({ id: L.adjId, antes: a, despues: d });
        tocadas[a.plazaId] = 1; tocadas[d.plazaId] = 1;
        intentar(() => window.emaGaleria && window.emaGaleria.olvidar && window.emaGaleria.olvidar(L.adjId));
      } catch (e) {
        res.mal.push({ id, motivo: e && e.code === "permission-denied" ? "la base no dejó (permiso)" : navigator.onLine === false ? "sin señal" : String((e && (e.code || e.message)) || "error") });
      }
    }
    if (res.ok) {
      const m0 = res.movidas[0], dd = m0.despues, de = res.movidas.map((x) => ubic(x.antes)).filter((v, i, l) => l.indexOf(v) === i);
      try { typeof window.fbAuditar == "function" && window.fbAuditar("foto_mover", `${res.ok} foto(s): ${de.slice(0, 3).join(" / ")}${de.length > 3 ? "…" : ""} → ${ubic(dd)}${motivo ? " · " + motivo : ""}`.slice(0, 480), { n: res.ok, ids: res.movidas.map((x) => x.id).slice(0, 200), de: res.movidas.slice(0, 50).map((x) => ({ plazaId: x.antes.plazaId, otId: x.antes.otId, cat: x.antes.cat, num: x.antes.num })), a: { plazaId: dd.plazaId, otId: dd.otId, cat: dd.cat, num: dd.num }, motivo, porAsistente: !!op.porAsistente, porSupervisor: !!op.porSupervisor }); } catch (e) { }
      refrescar(Object.keys(tocadas), res);
    }
    return res;
  }
  function refrescar(plazas, res) {
    intentar(() => window.__lgFotosOlvidar && window.__lgFotosOlvidar());
    plazas.forEach((p) => intentar(() => { if (p && typeof window.legajoRecargarFotos == "function" && $("lgFotosSec")) window.legajoRecargarFotos(p); }));
    intentar(() => window.__mtAPI && window.__mtAPI.redibujar && window.__mtAPI.redibujar());
    try { document.dispatchEvent(new CustomEvent("fotos-movidas", { detail: { plazas, movidas: res.movidas } })); } catch (e) { }
  }
  // la ficha del legajo tiene lo último que dijo la orden (cuando la cuadrilla cambió la columna y la base no la deja tocar la ficha)
  function corr(x) {
    if (off() || !x || !x.adjId) return x;
    const e = entradaEnOrden(x.adjId); if (!e || !e.f.movidaDe) return x;
    if ((x.movidaDe && x.movidaDe.ts) >= e.f.movidaDe.ts) return x;
    return Object.assign({}, x, { cat: e.f.cat || x.cat, num: e.f.num != null ? e.f.num : x.num, k: e.f.k || "", tarea: e.f.tarea || x.tarea });
  }

  // ============================================================== la hoja «¿A dónde la pasás?»
  let H = null;   // { L[], cfg, obra, ot, cat, num, numOtro, k, mot, q, op }
  const cerrarHoja = () => { const e = $("mfOv"); e && e.remove(); H = null; };
  function ordenesObra(pid) {
    return ots().filter((o) => o && String(o.plazaId || "") === String(pid) && o.estado !== "Anulada").sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")) || String(b.numero || "").localeCompare(String(a.numero || "")));
  }
  function ordenSugerida(pid, L) {   // la orden de esa obra del día de la foto en la que está la persona que la sacó
    const l = ordenesObra(pid).filter((o) => String(o.fecha || "").slice(0, 10) === L.fecha);
    const c = l.filter((o) => (o.personalNombres || []).map(nk).indexOf(nk(L.por)) >= 0 || (o.personal || []).some((p) => nk(p && p.nombre) === nk(L.por)));
    return (c[0] || {}).id || "";
  }
  async function abrir(ids, op) {
    if (off()) return;
    op = op || {};
    cerrarHoja();
    const ov = document.createElement("div"); ov.id = "mfOv"; ov.className = "v7-ov no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Mover fotos");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>↔ Mover ${ids.length === 1 ? "la foto" : ids.length + " fotos"}</h3><small>Buscando dónde está…</small></div><button type="button" class="v7-x" data-mf="x" aria-label="Cerrar">✕</button></div></div>`;
    document.body.appendChild(ov);
    const L = (await Promise.all(ids.map((i) => localizar(i).catch(() => null)))).filter(Boolean);
    if (!$("mfOv") || ov !== $("mfOv")) return;
    if (!L.length) { ov.querySelector(".v7-cab small").textContent = "No encontré esas fotos (¿son fotos de obra?)."; return; }
    const crew = !oficina();
    const base = L[0].antes, misma = (c) => L.every((x) => String(x.antes[c] || "") === String(base[c] || ""));
    H = { L, crew, op, obra: misma("plazaId") ? base.plazaId : "", ot: "keep", cat: "", num: "keep", numOtro: "", k: "auto", mot: "", q: "", ids: L.map((x) => x.adjId) };
    if (op.asignar && base.plazaId === SIN_OBRA) H.obra = "";
    if (crew) { const no = L.map((x) => motivoNo(x, x.antes)).find(Boolean); if (no) H.bloqueo = no; }
    pintarHoja();
    setTimeout(() => { const q = $("mfObraQ"); q && !crew && (op.asignar || !H.obra) && q.focus(); }, 60);
  }
  function destinoHoja() {
    const d = {};
    if (!H.crew) {
      if (H.obra && !(H.L.every((x) => x.antes.plazaId === H.obra))) d.plazaId = H.obra;
      if (H.ot !== "keep") d.otId = H.ot;
    }
    if (H.cat) d.cat = H.cat;
    if (H.num === "otro") { if (H.numOtro.trim()) d.num = H.numOtro.trim(); }
    else if (H.num !== "keep") d.num = H.num === "-" ? "" : H.num;
    if (H.k !== "auto") d.k = H.k === "-" ? "" : H.k;
    return d;
  }
  function pintarHoja() {
    const ov = $("mfOv"); if (!ov || !H) return;
    const caja = ov.querySelector(".v7-caja"), L = H.L, n = L.length, crew = H.crew;
    const foco = document.activeElement && document.activeElement.id, selS = foco === "mfObraQ" && document.activeElement.selectionStart;
    const pid = H.obra || (L.every((x) => x.antes.plazaId === L[0].antes.plazaId) ? L[0].antes.plazaId : "");
    const dest = destinoHoja(), filas = L.map((x) => { const r = destinoDe(x, dest); return { x, d: r.d, err: r.err || (r.d ? motivoNo(x, r.d) : "") }; });
    const cambian = filas.filter((f) => f.d && !f.err && cambia(f.x.antes, f.d)), cambiaObra = cambian.some((f) => f.d.plazaId !== f.x.antes.plazaId);
    const q = nk(H.q);
    const res = q ? [{ id: SIN_OBRA, nombre: "📷 Fotos sin obra" }].concat(obras()).filter((o) => nk([o.nombre, o.plazaNombre, o.obraId, o.barrio, o.id === SIN_OBRA ? "fotos sin obra" : ""].join(" ")).indexOf(q) >= 0).slice(0, 8) : [];
    const ordenes = pid && pid !== SIN_OBRA ? ordenesObra(pid) : [];
    const mismaObra = L.every((x) => x.antes.plazaId === pid);
    const puntos = pid && pid !== SIN_OBRA ? puntosDe(pid) : [];
    const otSel = H.ot === "keep" ? (mismaObra && L.every((x) => x.antes.otId === L[0].antes.otId) ? L[0].antes.otId : "") : H.ot;
    const tareas = otSel ? tareasDe(otDe(otSel)) : [];
    const opt = (v, t, s) => `<option value="${esc(v)}"${s ? " selected" : ""}>${esc(t)}</option>`;
    const minis = L.slice(0, 12).map((x) => `<span class="mf-mini">${/^data:image\//.test(String(x.mini || "")) ? `<img alt="" src="${esc(x.mini)}">` : "📷"}</span>`).join("") + (n > 12 ? `<span class="mf-mini mf-mas">+${n - 12}</span>` : "");
    const resumen = filas.slice(0, 6).map((f) => `<div class="mf-fila"><span class="mf-a">${esc(ubic(f.x.antes))}</span><span class="mf-fl">→</span><span class="mf-d${f.err ? " mal" : f.d && cambia(f.x.antes, f.d) ? "" : " igual"}">${esc(f.err ? f.err : f.d && cambia(f.x.antes, f.d) ? ubic(f.d) : "queda igual")}</span></div>`).join("") + (n > 6 ? `<div class="mf-mas2">…y ${n - 6} más</div>` : "");
    const titulo = crew ? (n === 1 ? "¿De qué columna era?" : "¿De qué columna eran?") : H.op.asignar ? "Asignar a una obra" : "¿A dónde la" + (n === 1 ? "" : "s") + " pasás?";
    const quien = L.map((x) => [x.por, x.ts ? fCorta(x.ts) + " " + hhmm(x.ts) : ""].filter(Boolean).join(" ")).filter((v, i, l) => l.indexOf(v) === i).slice(0, 2).join(" · ");
    caja.innerHTML = `<div class="v7-asa"></div><div class="v7-cab"><div><h3>↔ ${esc(titulo)}</h3><small>${n === 1 ? "1 foto" : n + " fotos"}${quien ? " · " + esc(quien) : ""}</small></div><button type="button" class="v7-x" data-mf="x" aria-label="Cerrar">✕</button></div>
<div class="mf-minis">${minis}</div>
${H.bloqueo ? `<div class="mf-bloq" role="status">🔒 ${esc(H.bloqueo)}</div>` : `
${crew ? "" : `<label class="mf-l">Obra</label>
<div class="mf-obra"><b>${esc(pid ? (pid === SIN_OBRA ? "📷 Fotos sin obra" : (window.__fmtNombre ? window.__fmtNombre.obra(nombreObra(pid)) : nombreObra(pid))) : "Elegí la obra")}</b>${pid && !mismaObra ? ' <span class="chip activo">cambia</span>' : ""}</div>
<input type="search" id="mfObraQ" placeholder="Buscar otra obra (nombre, ID, barrio)…" autocomplete="off" value="${esc(H.q)}">
${res.length ? `<div class="mf-res">${res.map((o) => `<button type="button" class="mf-ob${String(o.id) === String(pid) ? " on" : ""}" data-mfobra="${esc(o.id)}">${esc(o.id === SIN_OBRA ? o.nombre : (o.nombre || o.plazaNombre || ""))}${o.obraId ? ` <small>ID ${esc(o.obraId)}</small>` : ""}</button>`).join("")}</div>` : q ? '<div class="mf-nada">Ninguna obra con ese nombre.</div>' : ""}
${pid && pid !== SIN_OBRA ? `<label class="mf-l" for="mfOt">Orden</label><select id="mfOt">${mismaObra ? opt("keep", "Como está", H.ot === "keep") : ""}${opt("", "Sin orden (solo en el legajo)", H.ot === "")}${ordenes.map((o) => opt(o.id, `${o.numero || o.id} · ${fCorta(Date.parse(String(o.fecha || "") + "T12:00:00"))} · ${o.estado || ""}`, H.ot === o.id)).join("")}</select>` : ""}`}
<div class="mf-dos"><div><label class="mf-l" for="mfCat">¿De qué es?</label><select id="mfCat">${opt("", "Como está", !H.cat)}${CATS().map((c) => opt(c[0], c[1], H.cat === c[0])).join("")}</select></div>
<div><label class="mf-l" for="mfNum">Columna / N°</label><select id="mfNum">${opt("keep", "Como está", H.num === "keep")}${opt("-", "Sin número", H.num === "-")}${puntos.map((p) => opt(p, p, H.num === p)).join("")}${opt("otro", "Otro…", H.num === "otro")}</select>${H.num === "otro" ? `<input type="text" id="mfNumOtro" placeholder="Ej: Col 7" value="${esc(H.numOtro)}">` : ""}</div></div>
${otSel && tareas.length > 1 ? `<label class="mf-l" for="mfK">Tarea de la orden</label><select id="mfK">${opt("auto", "La que corresponde a lo que es", H.k === "auto")}${tareas.map((k) => opt(k, labelDe(k), H.k === k)).join("")}</select>` : ""}
<label class="mf-l" for="mfMot">Motivo${cambiaObra && !crew ? " (obligatorio: cambia de obra)" : " (opcional)"}</label><input type="text" id="mfMot" maxlength="200" placeholder="${crew ? "Ej: me equivoqué de columna" : "Ej: la sacó en Las Acacias"}" value="${esc(H.mot)}">
<div class="mf-res2"><div class="mf-l">Antes → después</div>${resumen}</div>`}
<div class="v7-msg" id="mfMsg" role="status"></div>
<div class="v7-acc"><button type="button" class="btn-ghost" data-mf="x">Cancelar</button>${H.bloqueo ? "" : `<button type="button" class="btn-primary" data-mf="si"${cambian.length && !(cambiaObra && !crew && !H.mot.trim()) ? "" : " disabled"}>Sí, mover${cambian.length > 1 ? " las " + cambian.length : ""}</button>`}</div>`;
    if (foco) { const e = $(foco); if (e) { e.focus(); if (foco === "mfObraQ" && selS != null) try { e.setSelectionRange(selS, selS); } catch (x) { } } }
  }
  async function confirmarHoja(b) {
    if (!H) return;
    const msg = $("mfMsg"), dest = destinoHoja(), op = H.op, L = {}; H.L.forEach((x) => { L[x.id] = x; });
    b.disabled = true; if (msg) { msg.className = "v7-msg"; msg.textContent = "Moviendo…"; }
    const r = await mover(H.L.map((x) => x.id), dest, H.mot, { L });
    const mal = r.mal.filter((m) => !m.igual);
    if (!r.ok) { b.disabled = false; if (msg) { msg.className = "v7-msg mal"; msg.textContent = "⚠ No se movió ninguna: " + (mal[0] ? mal[0].motivo : "no cambia nada") + "."; } return; }
    const txt = `✓ ${r.ok === 1 ? "Foto movida" : r.ok + " fotos movidas"}${mal.length ? ` · ⚠ ${mal.length} no (${mal[0].motivo})` : ""}.`;
    if (msg) { msg.className = "v7-msg bien"; msg.textContent = txt; }
    toast(txt, !!mal.length);
    setTimeout(() => { cerrarHoja(); try { op.alListo && op.alListo(r); } catch (e) { } }, 700);
  }
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return;
    const ov = $("mfOv"); if (!ov || !ov.contains(t)) return;
    if (t === ov) { cerrarHoja(); return; }
    const b = t.closest("[data-mf]"); if (b) { e.preventDefault(); if (b.dataset.mf === "x") return cerrarHoja(); if (b.dataset.mf === "si") return confirmarHoja(b); }
    const o = t.closest("[data-mfobra]"); if (o && H) { H.obra = o.dataset.mfobra; H.q = ""; H.ot = H.L.every((x) => x.antes.plazaId === H.obra) ? "keep" : (H.obra === SIN_OBRA ? "" : ordenSugerida(H.obra, H.L[0])); H.num = "keep"; H.k = "auto"; pintarHoja(); }
  });
  document.addEventListener("input", (e) => {
    if (!H || !e.target || !e.target.id) return;
    const id = e.target.id, v = e.target.value;
    if (id === "mfObraQ") { H.q = v; pintarHoja(); }
    else if (id === "mfMot") { H.mot = v; const b = document.querySelector('#mfOv [data-mf="si"]'); if (b) { const cam = $("mfOv").querySelector(".chip.activo"); b.disabled = !!(cam && !H.crew && !v.trim()); } }
    else if (id === "mfNumOtro") { H.numOtro = v; }
  });
  document.addEventListener("change", (e) => {
    if (!H || !e.target || !e.target.id) return;
    const id = e.target.id, v = e.target.value;
    if (id === "mfOt") { H.ot = v; H.k = "auto"; } else if (id === "mfCat") H.cat = v; else if (id === "mfNum") H.num = v; else if (id === "mfK") H.k = v; else if (id === "mfNumOtro") H.numOtro = v; else return;
    pintarHoja();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("mfOv")) { e.stopPropagation(); cerrarHoja(); } }, true);
  function toast(t, mal) {
    let m = $("mfToast"); if (!m) { m = document.createElement("div"); m.id = "mfToast"; m.className = "no-print"; m.setAttribute("role", "status"); document.body.appendChild(m); }
    m.textContent = t; m.classList.toggle("mal", !!mal); m.hidden = !t; clearTimeout(m._t); m._t = setTimeout(() => { m.hidden = true; }, mal ? 6000 : 3500);
  }

  // ============================================================== «📷 Fotos sin obra»: elegir y asignar
  const fsoSel = new Set(); let fsoModo = false;
  function fsoBtn(n) { return off() || !oficina() || !n ? "" : '<button type="button" class="btn-ghost" data-mffso="elegir">☑ Elegir para asignar a una obra</button>'; }
  function fsoPintar() {
    const ov = $("fsoOv"); if (!ov) return;
    ov.classList.toggle("mf-eligiendo", fsoModo);
    ov.querySelectorAll(".fso-f[data-fsoadj]").forEach((x) => { const s = fsoSel.has(x.dataset.fsoadj); x.classList.toggle("mf-sel", fsoModo && s); x.setAttribute("aria-pressed", fsoModo ? String(s) : "false"); });
    let b = ov.querySelector(".mf-fsobar");
    if (!fsoModo) { b && b.remove(); return; }
    if (!b) { b = document.createElement("div"); b.className = "mf-fsobar"; const acc = ov.querySelector(".fso-acc"); acc ? acc.parentNode.insertBefore(b, acc) : ov.querySelector(".card").appendChild(b); }
    const n = fsoSel.size, tot = ov.querySelectorAll(".fso-f[data-fsoadj]").length;
    b.innerHTML = `<span role="status"><b>${n}</b> elegida${n === 1 ? "" : "s"} · tocá las fotos</span><button type="button" class="btn-ghost" data-mffso="todas">${n === tot && tot ? "Ninguna" : "Todas"}</button><button type="button" class="btn-primary" data-mffso="asignar"${n ? "" : " disabled"}>↔ Asignar a una obra</button><button type="button" class="btn-ghost" data-mffso="salir">Listo</button>`;
  }
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest || off()) return;
    const ov = $("fsoOv"); if (!ov || ov.hidden || !ov.contains(t)) return;
    const b = t.closest("[data-mffso]");
    if (b) {
      e.preventDefault(); e.stopPropagation();
      const a = b.dataset.mffso, todas = [...ov.querySelectorAll(".fso-f[data-fsoadj]")].map((x) => x.dataset.fsoadj).filter(Boolean);
      if (a === "elegir") { fsoModo = true; fsoSel.clear(); }
      else if (a === "salir") { fsoModo = false; fsoSel.clear(); }
      else if (a === "todas") { if (fsoSel.size === todas.length) fsoSel.clear(); else todas.forEach((x) => fsoSel.add(x)); }
      else if (a === "asignar") { const ids = [...fsoSel]; abrir(ids, { asignar: true, alListo: (r) => { r.movidas.forEach((m) => { const x = ov.querySelector('.fso-f[data-fsoadj="' + (window.CSS && CSS.escape ? CSS.escape(m.id) : m.id) + '"]'); x && x.remove(); fsoSel.delete(m.id); }); fsoModo = false; fsoPintar(); } }); return; }
      fsoPintar(); return;
    }
    const f = fsoModo && t.closest(".fso-f[data-fsoadj]");
    if (f) { e.preventDefault(); e.stopPropagation(); const id = f.dataset.fsoadj; fsoSel.has(id) ? fsoSel.delete(id) : fsoSel.add(id); fsoPintar(); }
  }, true);
  // la lista se vuelve a armar al abrirla: arranca sin elegir
  new MutationObserver(() => { const ov = $("fsoOv"); if ((!ov || ov.hidden) && fsoModo) { fsoModo = false; fsoSel.clear(); } else if (ov && fsoModo && !ov.querySelector(".mf-fsobar")) fsoPintar(); }).observe(document.body, { childList: true });

  // ============================================================== Modo obra: «Era de otra columna» en la foto guardada
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-mfcd]"); if (!b || off()) return;
    e.preventDefault(); e.stopPropagation();
    const otId = b.dataset.mfcd, pe = String(b.dataset.mfpe || ""), m = pe.match(/^pend_([0-9a-z]+)[0-9a-z]{4}$/), t0 = m ? parseInt(m[1], 36) : 0;
    const x = document.querySelector('#cdHoja [data-cdh="x"]'); x && x.click();
    const busca = () => { const o = otDe(otId), fs = obj(obj(o && o.campo).fotos); const me = nk(yoPersona()); let r = ""; Object.keys(fs).forEach((q) => { const f = fs[q]; if (f && !f.borrada && (!me || nk(f.por) === me) && (t0 ? +f.ts === t0 : true) && (!r || (fs[r].ts || 0) < (f.ts || 0))) r = q; }); return r; };
    let id = busca();
    if (!id) { toast("⏳ La foto se está guardando… en unos segundos la cambiás."); for (let i = 0; i < 50 && !id; i++) { await new Promise((ok) => setTimeout(ok, 500)); id = busca(); } }
    if (!id) { toast("La foto todavía se está subiendo. Cambiala después desde «Mis fotos» de la orden.", true); return; }
    abrir([id], {});
  }, true);

  // ============================================================== para el asistente (lo usa asistenteIaCod)
  const nCol = (s) => { const m = String(s || "").match(/(\d+)\s*$/); return m ? +m[1] : null; };
  function columnaDe(txt, pid) {
    const s = String(txt || "").trim(); if (!s) return null;
    const ps = puntosDe(pid), e = ps.find((p) => nk(p) === nk(s)); if (e) return e;
    const n = nCol(s); if (n != null) { const c = ps.filter((p) => nCol(p) === n); if (c.length === 1) return c[0]; if (/^\d+$/.test(s)) return "Col " + n; }
    return s;
  }
  function catDeTexto(t) {
    const s = nk(t); if (!s) return "";
    const c = CATS().find((x) => nk(x[0]) === s || nk(x[1]) === s); if (c) return c[0];
    const c2 = CATS().find((x) => nk(x[1]).indexOf(s) === 0 || s.indexOf(nk(x[0])) >= 0); if (c2) return c2[0];
    return intentar(() => window.catFotoDeTarea(t), "") || "";
  }
  const minDe = (h) => { const m = String(h || "").match(/(\d{1,2})[:.h](\d{2})/) || String(h || "").match(/^(\d{1,2})$/); return m ? +m[1] * 60 + (+m[2] || 0) : null; };
  async function iaBuscar(a, ctx) {
    a = a || {}; ctx = ctx || {};
    let fichas = [], ot = null, obra = null, f = a.fecha ? (ctx.fechaDe ? ctx.fechaDe(a.fecha) : String(a.fecha)) : "";
    if (a.fecha && !f) return { err: "No entendí la fecha «" + a.fecha + "»." };
    const sinObra = a.sinObra === true || /^(sin_obra|__sinObra|fotos sin obra|sin obra)$/i.test(String(a.obraId || "").trim());
    try {
      if (a.otId) { ot = ctx.otPorRef ? ctx.otPorRef(a.otId) : otDe(a.otId); if (!ot) return { err: "No encontré la orden «" + a.otId + "»." }; obra = obraDe(ot.plazaId); fichas = (await window.fbFotosObraDe(String(ot.plazaId))).filter((x) => x.otId === ot.id); }
      else if (sinObra) { obra = { id: SIN_OBRA, nombre: "Fotos sin obra" }; fichas = await window.fbFotosObraDe(SIN_OBRA); }
      else if (a.obraId) { const x = ctx.resolverObra ? ctx.resolverObra(a.obraId) : { obra: obraDe(a.obraId) }; if (!x.obra) return { err: x.err || "No encontré la obra.", r: x.candidatos ? { candidatos: x.candidatos } : null }; obra = x.obra; fichas = await window.fbFotosObraDe(String(obra.id)); }
      else if (f) { const s = await db().collection("fotosObra").where("fecha", "==", f).get(); s.forEach((d) => fichas.push(Object.assign({ id: d.id }, d.data()))); }
      else return { err: "Decime de qué obra, de qué orden, de qué día o si son las «Fotos sin obra» (para no bajar todas las fotos de la base)." };
    } catch (e) { return { err: "No pude leer las fotos (" + ((e && e.code) || "sin señal") + ")." }; }
    recordar(fichas);
    const l = [], vistos = {};
    fichas.forEach((x) => { if (!x || x.borrada || !x.adjId || vistos[x.adjId]) return; if (obra && obra.id !== SIN_OBRA && intentar(() => window.fotoBorrada(obra.id, x.adjId), false)) return; vistos[x.adjId] = 1; const e = entradaEnOrden(x.adjId), y = corr(x); l.push({ id: x.adjId, ficha: x.id, plazaId: (e && e.o.plazaId) || x.plazaId, otId: e ? e.o.id : x.otId || "", cat: y.cat || "otra", num: y.num || "", tarea: y.tarea || "", por: x.por || "", ts: x.ts || 0, mini: x.mini || "", gps: x.lat != null }); });
    // las que están en las órdenes (de esa obra / esa orden) sin ficha en el legajo
    (ot ? [ot] : obra && obra.id !== SIN_OBRA ? ots().filter((o) => String(o.plazaId) === String(obra.id) && o.estado !== "Anulada") : []).forEach((o) => { const fs = obj(obj(o.campo).fotos); Object.keys(fs).forEach((k) => { const x = fs[k]; if (!x || x.borrada || vistos[k]) return; vistos[k] = 1; l.push({ id: k, ficha: "", plazaId: o.plazaId, otId: o.id, cat: x.cat || "otra", num: x.num || "", tarea: x.tarea || "", por: x.por || "", ts: x.ts || 0, mini: x.mini || "", gps: false }); }); });
    let r = l;
    if (f && (obra || ot)) r = r.filter((x) => isoDe(x.ts) === f);
    if (a.persona) { const q = nk(a.persona); r = r.filter((x) => nk(x.por).indexOf(q) >= 0 || q.split(" ").every((w) => nk(x.por).indexOf(w) >= 0)); }
    if (a.columna) { const q = nk(a.columna), n = nCol(a.columna); r = r.filter((x) => nk(x.num) === q || (n != null && nCol(x.num) === n)); }
    if (a.categoria) { const c = catDeTexto(a.categoria), q = nk(a.categoria); r = r.filter((x) => x.cat === c || nk(x.tarea).indexOf(q) >= 0); }
    if (a.hora) { const m = minDe(a.hora); if (m != null) r = r.filter((x) => { const d = new Date(x.ts); return Math.abs(d.getHours() * 60 + d.getMinutes() - m) <= 20; }); }
    r.sort((x, y) => (y.ts || 0) - (x.ts || 0));
    const ult = parseInt(a.ultimas, 10); if (ult > 0) r = r.slice(0, ult);
    r.forEach((x) => { REG["a:" + x.id] = REG["a:" + x.id] || { adjId: x.id, plazaId: x.plazaId, otId: x.otId, cat: x.cat, num: x.num, mini: x.mini, por: x.por, ts: x.ts }; });
    const nomOt = (id) => (otDe(id) || {}).numero || "";
    return {
      r: { obra: obra ? (obra.nombre || obra.plazaNombre || "") : "", orden: ot ? ot.numero : "", total: r.length, fotos: r.slice(0, 40).map((x) => ({ id: x.id, obra: nombreObra(x.plazaId) || "", orden: nomOt(x.otId) || (x.otId ? "" : "sin orden"), tipo: catTxt(x.cat), columna: x.num, tarea: x.tarea, por: x.por, fecha: fCorta(x.ts), hora: hhmm(x.ts), gps: x.gps })), hayMas: r.length > 40 ? r.length - 40 : 0, siguiente: "Para moverlas: proponer_mover_fotos con estos id (obra, columna/tipo, orden o desde «Fotos sin obra»)." },
      minis: r.slice(0, 6).map((x) => x.mini).filter((m) => /^data:image\//.test(String(m || "")))
    };
  }
  async function iaProponer(a, ctx) {
    a = a || {}; ctx = ctx || {};
    const ids = (Array.isArray(a.fotos) ? a.fotos : [a.fotos]).map((x) => String(x || "").trim()).filter(Boolean);
    if (!ids.length) return { err: "Falta qué fotos mover: usá buscar_fotos (o ver_fotos / ubicar_fotos) y pasá sus id." };
    const L = (await Promise.all(ids.map((i) => localizar(i).catch(() => null))));
    const faltan = ids.filter((_, i) => !L[i]); if (faltan.length) return { err: "No encontré " + (faltan.length === 1 ? "la foto «" + faltan[0] + "»" : faltan.length + " fotos") + ": buscalas con buscar_fotos y usá esos id." };
    const dest = {}; let nomDest = "";
    if (a.otDestino) { const o = ctx.otPorRef ? ctx.otPorRef(a.otDestino) : otDe(a.otDestino); if (!o) return { err: "No encontré la orden «" + a.otDestino + "»." }; dest.otId = o.id; nomDest = o.numero; }
    const od = String(a.obraDestino || "").trim();
    if (od) {
      if (/^(sin_obra|__sinObra|fotos sin obra|sin obra)$/i.test(od)) dest.plazaId = SIN_OBRA;
      else { const x = ctx.resolverObra ? ctx.resolverObra(od) : { obra: obraDe(od) }; if (!x.obra) return { err: x.err || "No encontré la obra «" + od + "».", r: x.candidatos ? { candidatos: x.candidatos } : null }; dest.plazaId = String(x.obra.id); }
      if (dest.otId) { const o = otDe(dest.otId); if (o && String(o.plazaId) !== dest.plazaId) return { err: "La orden " + o.numero + " es de otra obra (" + (o.plazaNombre || "") + ")." }; delete dest.plazaId; }
      else if (dest.plazaId !== SIN_OBRA && !L.every((x) => x.antes.plazaId === dest.plazaId) && a.sinOrden !== true) { const s = ordenSugerida(dest.plazaId, L[0]); if (s) dest.otId = s; }
    }
    const pidDest = dest.otId ? String((otDe(dest.otId) || {}).plazaId || "") : dest.plazaId || L[0].antes.plazaId;
    if (a.tipo) { const c = catDeTexto(a.tipo); if (!c) return { err: "No entendí qué es la foto («" + a.tipo + "»): columna, caja, tablero, conexión, luminaria, PAT, zanja, antes, después, seguridad u otra." }; dest.cat = c; }
    if (a.columna != null && String(a.columna).trim() !== "") dest.num = /^(sin numero|sin número|ninguna|-)$/i.test(String(a.columna).trim()) ? "" : columnaDe(a.columna, pidDest);
    if (a.tarea) { const o = otDe(dest.otId || L[0].antes.otId), q = nk(a.tarea), k = o ? tareasDe(o).find((t) => t === a.tarea || nk(labelDe(t)).indexOf(q) >= 0) : null; if (k) dest.k = k; }
    if (!Object.keys(dest).length) return { err: "Decime a dónde van: obraDestino, otDestino (orden), columna o tipo." };
    const filas = [], mover = [], no = [];
    L.forEach((x) => { const r = destinoDe(x, dest); if (r.err) { no.push(r.err); return; } if (!cambia(x.antes, r.d)) { no.push("ya está ahí"); return; } const m = motivoNo(x, r.d); if (m) { no.push(m); return; } mover.push(x); filas.push({ x, d: r.d }); });
    if (!mover.length) return { err: no[0] ? "No hay nada para mover: " + no[0] + "." : "Esas fotos ya están ahí." };
    const d0 = filas[0].d, motivo = String(a.motivo || "").trim().slice(0, 200) || (filas.some((f) => f.d.plazaId !== f.x.antes.plazaId) ? "lo pidió " + yoNombre() + " al asistente" : "");
    const quien = (x) => [x.por ? String(x.por).split(" ")[0] : "", x.ts ? fCorta(x.ts) + " " + hhmm(x.ts) : ""].filter(Boolean).join(" ");
    const datos = {
      titulo: `📷 Mover ${mover.length === 1 ? "1 foto" : mover.length + " fotos"}`, sub: ubic(d0), coleccion: "fotosObra", motivo,
      filas: filas.slice(0, 8).map((f) => ({ c: "Foto " + (quien(f.x) || f.x.adjId.slice(0, 6)), a: ubic(f.x.antes), d: ubic(f.d) })),
      html: `<div class="ia-fotos">${mover.slice(0, 24).map((x) => /^data:image\//.test(String(x.mini || "")) ? `<img alt="" src="${esc(x.mini)}">` : "<span>📷</span>").join("")}${mover.length > 24 ? `<span>+${mover.length - 24}</span>` : ""}</div>` + (filas.length > 8 ? `<div class="ia-conf-sub">…y ${filas.length - 8} más</div>` : ""),
      pie: "Cambia todo lo que dice dónde está la foto: la carpeta del legajo, la orden (si sale de una y entra en otra) y la columna. La imagen no se toca. Queda anotado de dónde venía y en la auditoría.",
      avisos: no.length ? [no.length + " foto(s) quedan como están (" + no[0] + ")."] : [],
      ids: mover.map((x) => x.adjId), dest, antes: filas.map((f) => ({ id: f.x.adjId, donde: ubic(f.x.antes) })), despues: filas.map((f) => ({ id: f.x.adjId, donde: ubic(f.d) }))
    };
    return { datos, resumen: { mover: mover.length, a: ubic(d0), quedan: no.length } };
  }
  async function iaGuardar(P) {
    const d = P.datos, r = await mover(d.ids, d.dest, d.motivo, { porAsistente: true, sinMotivo: true });
    const mal = r.mal.filter((m) => !m.igual);
    if (!r.ok) throw new Error(mal[0] ? mal[0].motivo : "no se movió ninguna");
    return { txt: `✅ ${r.ok === 1 ? "Foto movida" : r.ok + " fotos movidas"} a ${ubic(r.movidas[0].despues)}.` + (mal.length ? ` ⚠ ${mal.length} no (${mal[0].motivo}).` : ""), ref: d.ids.join(",").slice(0, 400), antes: d.antes, despues: d.despues };
  }

  window.__moverFoto = { mover, abrir, cerrar: cerrarHoja, localizar, puedeVer, puedeAlguna, destinoDe, corr, recordar, fsoBtn, oficina, ia: { buscar: iaBuscar, proponer: iaProponer, guardar: iaGuardar }, estado: () => ({ hoja: !!H, fso: fsoModo, reg: Object.keys(REG).length }) };
})();
