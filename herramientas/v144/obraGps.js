(function () {
  "use strict";
  // v144 · Las fotos caen en la obra donde están parados (pedido de Ángel, 10/11/2026: «una cuadrilla puso la ubicación de otra
  // plaza y la foto la subió a esa plaza. Eso no debería pasar») + la cámara nueva «opción B · cámara primero» (maquetas B1–B3,
  // hoja de cambiar con el estilo de la opción D).
  //  · «Cámara» (menú, barra de abajo, ?camara=1, ícono «Cámara EMA») abre DIRECTO la cámara de la app. Arriba, la píldora con la
  //    obra que eligió el GPS (≤ 150 m de su pin), aunque la orden de hoy sea de otra: «📍 SAN PABLO · a 25 m · no es tu orden» y un
  //    cartel que no frena. GPS malo (sin dato o ± más de 100 m, a confirmar): «Elegí la obra», se usa lo elegido y la foto queda
  //    con ubicDudosa. Abajo: los modos (Seguridad · Antes · Columna · …) con el tipo ya elegido por la tarea de la orden en esa
  //    obra, «‹ Col 4 ›» (la siguiente sin foto), disparador, miniatura y «Listo». Caso normal = 1 toque (disparar).
  //  · Lista de obras de la cuadrilla: las de sus órdenes (hoy y pendientes) + la obra donde está parada; el resto con «Es otra
  //    obra (decí por qué)». Elegir a mano otra obra estando parado en una registrada pregunta «Estás en X, no en Y. ¿Guardo la foto en X?».
  //  · Cada foto lleva obraAuto, obraElegida (+ obraElegidaNombre), distObra, motivoOtra y ubicDudosa (en fotosObra y adjuntos).
  //  · Foto en una obra sin orden: se guarda como foto libre (reglas v125) y avisa al supervisor de su orden de hoy, o a la oficina,
  //    una vez por persona, obra y día.
  //  · Modo obra (v142): «Llegué» en otra obra registrada → «Estás en SAN PABLO. ¿Trabajás acá hoy?».
  //  · Supervisor (v136): «Fotos que parecen de otra obra» (la cuenta de ubicar_fotos: GPS contra lat/lng, 150 m) con «Mover»
  //    (los mismos cambios que proponer_mover_fotos, con «Sí» y auditoría) y «Está bien»; «Obras sin ubicación cargada (N)».
  //  · Nada se mueve solo: las fotos viejas quedan donde están. Sin reglas nuevas. El sello, la cola sin señal y R2 no cambian.
  //  · Pruebas viejas: __obraGpsNo (sin nada de esto) y __camViejaNo (la hoja «¿De qué obra?» de antes), salvo obraGps / camaraB.
  if (window.__obraGps) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const intentar = (fn, d) => { try { const v = fn(); return v === undefined ? d : v; } catch (e) { return d; } };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoyISO = () => iso(new Date());
  const diaMas = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const fCorta = (f) => { const p = String(f || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] : String(f || ""); };
  const fmtN = (n, d) => (Number(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const distTxt = (m) => (m < 1000 ? Math.round(m) + " m" : fmtN(m / 1000, 1) + " km");
  const LSr = (k, d) => intentar(() => JSON.parse(localStorage.getItem(k) || "null") || d, d);
  const LSw = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const RADIO = 150;          // m: la misma cuenta que «Llegué» (v142) y ubicar_fotos (v133)
  const PREC_MALA = 100;      // m: más que esto = GPS malo (a confirmar con Ángel)
  const on = () => !window.__obraGpsNo;
  const camB = () => on() && !window.__camViejaNo;

  // ------------------------------------------------------------------------------------------- datos (todo de memoria)
  const obrasTodas = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []).filter((o) => o && o.id && o.estado !== "Anulada");
  const obras = () => obrasTodas().filter((o) => o.oculta !== true);
  const obraPorId = (id) => (id == null || id === "" ? null : obrasTodas().find((o) => String(o.id) === String(id)) || null);
  const nombre = (o) => String((o && (o.nombre || o.plazaNombre)) || "la obra");
  const NOM = (o) => nombre(o).toUpperCase();
  const lindo = (o) => nombre(o).replace(/^plaza\s+/i, "").toLowerCase().replace(/(^|[\s(°.-])([a-záéíóúñü])/g, (m, a, b) => a + b.toUpperCase());
  const ll = (o) => { if (!o || o.lat == null || o.lng == null || o.lat === "" || o.lng === "") return null; const la = +o.lat, lo = +o.lng; return isFinite(la) && isFinite(lo) && !(la === 0 && lo === 0) ? { lat: la, lng: lo } : null; };
  function dist(a, b) { const R = 6371000, r = Math.PI / 180, dA = (b.lat - a.lat) * r, dO = (b.lng - a.lng) * r; const h = Math.pow(Math.sin(dA / 2), 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.pow(Math.sin(dO / 2), 2); return 2 * R * Math.asin(Math.min(1, Math.sqrt(h))); }
  function cercanas(p, radio, excluir) {
    if (!p) return [];
    const l = []; obras().forEach((o) => { if (excluir != null && String(o.id) === String(excluir)) return; const c = ll(o); if (!c) return; const d = dist(p, c); if (d <= radio) l.push({ o, d: Math.round(d) }); });
    return l.sort((a, b) => a.d - b.d);
  }
  const cercana = (p, excluir) => cercanas(p, RADIO, excluir)[0] || null;
  const yo = () => intentar(() => (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) || null, null);
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const persona = () => { const y = yo() || {}; return y.persona || y.nombre || y.usuario || String((window.__fbUser && window.__fbUser.email) || "").split("@")[0]; };
  const clave = () => { const y = yo() || {}; return y.personaClave || intentar(() => (typeof personaClave == "function" ? personaClave(y.persona || y.nombre || "") : ""), "") || nk(y.persona || y.nombre || ""); };
  const edita = (h) => intentar(() => PERMISOS.permiso(h) === "editar", false);
  const oficina = () => !esCrew() && ["avance", "registro", "parte", "stock"].some(edita);   // saca de cualquier obra sin decir por qué
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const cerrada = (o) => !!(o && (o.estado === "Terminada" || o.estado === "Anulada" || (o.cierre && o.cierre.cerradoTs)));
  function misOts() {   // las mías de hoy y las pendientes (sin cerrar, hasta una semana adelante)
    const c = clave(), h = hoyISO(), hasta = diaMas(7); if (!c) return [];
    return ots().filter((o) => o && o.plazaId && !cerrada(o) && (o.personalNombres || []).indexOf(c) >= 0 && String(o.fecha || "") <= hasta)
      .sort((a, b) => (a.fecha === h ? 0 : 1) - (b.fecha === h ? 0 : 1) || Math.abs(new Date(a.fecha) - new Date(h)) - Math.abs(new Date(b.fecha) - new Date(h)));
  }
  const otHoyDe = (l) => l.find((o) => o.fecha === hoyISO()) || null;
  const pide = (cat) => intentar(() => !!(window.catFotoPideNum && window.catFotoPideNum(cat)), false);
  const catTxt = (c) => intentar(() => (window.catFotoTxt ? window.catFotoTxt(c) : c), c);

  // ------------------------------------------------------------------------------------------- ícono de línea
  const IC = {
    pin: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    orden: '<rect x="5.5" y="4.5" width="13" height="16" rx="2.5"/><path d="M9 3.5h6v3H9z"/><path d="M8.8 11.5h6.4M8.8 15h4.2"/>',
    buscar: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    chev: '<path d="M9.5 6.5L15 12l-5.5 5.5"/>', chevI: '<path d="M14.5 6.5L9 12l5.5 5.5"/>', abajo: '<path d="M6.5 9.5L12 15l5.5-5.5"/>',
    cruz: '<path d="M6 6l12 12M18 6L6 18"/>', tilde: '<path d="M5.5 12.5l4.2 4.2L18.5 8"/>', alerta: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.3v.2"/>',
    rayo: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    columna: '<path d="M9 21V5.5h3.5M10.5 21V7"/><path d="M12.5 5.5h4v2"/><path d="M7 21h6"/>',
    caja: '<rect x="6.5" y="3.5" width="11" height="17" rx="2"/><path d="M9.5 8h5M9.5 11.5h5M9.5 15h2"/><circle cx="14.5" cy="15" r=".8"/>',
    tablero: '<rect x="4.5" y="4.5" width="15" height="11" rx="2"/><path d="M8.5 8v4M12 8v4M15.5 8v4M12 15.5V19M8.5 19.5h7"/>',
    conexion: '<path d="M5 20V7l7 2 6-3v14"/><circle cx="5" cy="6" r="1.2"/><path d="M15 20h6"/>',
    luminaria: '<path d="M7 20V7h7.5"/><path d="M13 7.5l3.5 1.5"/><path d="M14.5 11l-1 2M16.5 11.5v2M18.5 11l1 2"/>',
    pat: '<path d="M12 3.5V13M6 13h12M8.5 16h7M10.5 19h3"/>',
    zanja: '<path d="M3.5 8h4l2 7h5l2-7h4"/><path d="M10.5 12.5h3"/>',
    antes: '<rect x="3.5" y="5.5" width="7.5" height="13" rx="1.5"/><rect x="13" y="5.5" width="7.5" height="13" rx="1.5"/><path d="M5 15l2-3 2 3M14.5 15l2-3 2 3"/>',
    despues: '<rect x="3.5" y="5.5" width="7.5" height="13" rx="1.5"/><rect x="13" y="5.5" width="7.5" height="13" rx="1.5"/><path d="M5 15l2-3 2 3M14.5 15l2-3 2 3"/>',
    seguridad: '<path d="M12 3.5l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9v-5z"/><path d="M8.8 12l2.2 2.2 4.3-4.4"/>',
    otra: '<circle cx="6.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="17.5" cy="12" r="1.3"/>'
  };
  const ic = (k, cls, w) => `<svg class="og-ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ""}</svg>`;
  // los modos del deslizador (como la cámara del celu) y los tipos de la hoja «¿Qué vas a sacar?»
  const MODOS = [["seguridad", "Seguridad"], ["antes", "Antes"], ["columna", "Columna"], ["caja", "Caja"], ["tablero", "Tablero"], ["conexion", "Acometida"], ["luminaria", "Luminaria"], ["pat", "PAT"], ["zanja", "Zanja"], ["despues", "Después"], ["otra", "Otra"]];
  const TIPOS = [["columna", "Columna"], ["caja", "Caja de columna"], ["tablero", "Tablero"], ["conexion", "Acometida"], ["luminaria", "Luminaria"], ["pat", "Puesta a tierra"], ["zanja", "Zanja / tendido"], ["antes", "Antes"], ["despues", "Después"], ["seguridad", "Seguridad"]];
  const PREF = { columna: "Col ", caja: "Caja ", luminaria: "Lum ", pat: "PAT " };
  const NUMN = { columna: "Columna", caja: "Caja", luminaria: "Luminaria", pat: "Jabalina" };

  // =========================================================================================== la cámara «B»
  const CB = { abierta: false, pend: 0, t0: 0, pos: null, manual: null, visto: {}, cat: "", num: "", k: "", tarea: "", tipoManual: false, obraId: "", lista: null, hechas: {}, firma: "", vista: "", conf: null, busca: "" };
  const CA = () => window.camaraApp || {};
  function pos() {
    const c = intentar(() => CA().pos && CA().pos(), null); if (c && c.lat != null) return c;
    const v = intentar(() => window.__fotoGpsVivo && window.__fotoGpsVivo(), null); if (v && v.lat != null && Date.now() - (v.ts || 0) < 120000) return v;
    return CB.pos && Date.now() - (CB.pos.ts || 0) < 120000 ? CB.pos : null;
  }
  function gpsEstado(p) { if (!p) return Date.now() - CB.t0 > 6000 ? "malo" : "buscando"; return (p.prec || p.acc || 0) > PREC_MALA ? "malo" : "ok"; }
  const precDe = (p) => Math.round((p && (p.prec || p.acc)) || 0);
  function calc() {
    const p = pos(), g = gpsEstado(p), mis = misOts(), otHoy = otHoyDe(mis), cerca = g === "ok" ? cercana(p) : null;
    const ult = obraPorId((LSr("ema.camara.ultima", {}) || {}).plazaId);
    const man = CB.manual ? obraPorId(CB.manual.id) : null;
    const porDef = man || (otHoy ? obraPorId(otHoy.plazaId) : mis[0] ? obraPorId(mis[0].plazaId) : oficina() ? ult : null);
    let obra = null, auto = false, motivo = "";
    if (man && (CB.manual.fija || !cerca || String(cerca.o.id) === String(CB.manual.cercaId || ""))) { obra = man; auto = !!CB.manual.auto; motivo = CB.manual.motivo || ""; }
    else if (cerca) { obra = cerca.o; auto = true; }
    else obra = porDef;
    const c = ll(obra), d = p && c ? Math.round(dist(p, c)) : null;
    const ot = obra ? mis.filter((o) => String(o.plazaId) === String(obra.id)).sort((a, b) => (a.fecha === hoyISO() ? 0 : 1) - (b.fecha === hoyISO() ? 0 : 1))[0] || null : null;
    return { p, g, mis, otHoy, cerca, obra, auto, motivo, d, ot, elegida: porDef, otra: !!(obra && auto && otHoy && String(otHoy.plazaId) !== String(obra.id)) };
  }
  function ubicDe(e) {
    const u = { obraAuto: !!e.auto, obraElegida: e.elegida ? String(e.elegida.id) : "", obraElegidaNombre: e.elegida ? nombre(e.elegida) : "" };
    if (e.d != null) u.distObra = e.d;
    if (e.motivo) u.motivoOtra = String(e.motivo).slice(0, 300);
    if (e.g !== "ok") u.ubicDudosa = true;
    return u;
  }
  // lo que toca sacar: la tarea de la orden en esa obra (la primera con unidades sin foto) y la siguiente columna sin foto
  const hechaLocal = (cat, num) => !!CB.hechas[CB.obraId + "|" + cat + "|" + nk(num)];
  function porTarea(ot) {
    if (!ot || !window.__mtAPI || !window.__cuadrillaDia) return null;
    const ts = intentar(() => window.__mtAPI.tareas(ot) || [], []);
    for (const t of ts) {
      const u = intentar(() => window.__cuadrillaDia.unidades(ot.id, t.k), null); if (!u || !u.items || !u.items.length) continue;
      const it = u.items.find((x) => !x.foto && !hechaLocal(u.cat, x.num));
      if (it) return { cat: u.cat || "otra", num: pide(u.cat) && u.tipo === "unidad" ? it.num : "", k: t.k, tarea: t.label, lista: u.tipo === "unidad" ? u.items.map((x) => ({ num: x.num, foto: !!x.foto })) : null };
    }
    if (ts[0]) return { cat: intentar(() => window.catFotoDeTarea(ts[0].label), "otra"), num: "", k: ts[0].k, tarea: ts[0].label, lista: null };
    return null;
  }
  function ponerTipo(e, forzar) {
    const oid = e.obra ? String(e.obra.id) : "";
    if (!forzar && oid === CB.obraId) return;
    CB.obraId = oid;
    if (CB.tipoManual && !forzar) { CB.lista = null; return; }
    const t = porTarea(e.ot);
    if (t) { CB.cat = t.cat; CB.num = t.num; CB.k = t.k; CB.tarea = t.tarea; CB.lista = t.lista; }
    else { CB.cat = e.ot ? "otra" : "antes"; CB.num = ""; CB.k = ""; CB.tarea = ""; CB.lista = null; }
  }
  function moverNum(paso) {
    if (CB.lista && CB.lista.length) {
      const i = CB.lista.findIndex((x) => nk(x.num) === nk(CB.num));
      const j = Math.max(0, Math.min(CB.lista.length - 1, (i < 0 ? 0 : i) + paso)); CB.num = CB.lista[j].num; return;
    }
    const el = { cat: CB.cat, plazaId: CB.obraId };
    CB.num = intentar(() => window.__camaraPro.moverNombre(CB.num || "", el, paso), "") || (PREF[CB.cat] || "N° ") + "1";
  }
  function elegirModo(cat) {
    CB.cat = cat; CB.tipoManual = true;
    const e = calc(), t = porTarea(e.ot);
    if (t && t.cat === cat) { CB.num = t.num; CB.k = t.k; CB.tarea = t.tarea; CB.lista = t.lista; }
    else { CB.k = ""; CB.tarea = ""; CB.lista = null; CB.num = pide(cat) ? (PREF[cat] || "N° ") + "1" : ""; if (pide(cat)) { const ps = intentar(() => (obraPorId(CB.obraId) || {}).puntos || [], []); if (cat === "columna" && ps.length) CB.num = String(ps[0]); } }
  }
  // ---- pintar (arriba la píldora y el cartel; abajo el número y los modos)
  function pillHtml(e) {
    let cls = "gris", tit = "", sub = "";
    const otTxt = e.ot ? e.ot.numero || "tu orden" : esCrew() ? "no es tu orden" : e.obra && e.obra.obraId ? "ID " + e.obra.obraId : "sin orden";
    if (e.g === "buscando") { tit = e.obra ? NOM(e.obra) : "Buscando GPS…"; sub = "buscando GPS…" + (e.ot ? " · " + otTxt : ""); }
    else if (e.g === "malo") { tit = CB.manual && e.obra ? NOM(e.obra) : "Elegí la obra"; sub = (e.p ? "GPS impreciso ±" + precDe(e.p) + " m" : "sin GPS") + (CB.manual && e.obra ? " · elegida a mano" : ""); cls = "am"; }
    else if (e.auto) { tit = NOM(e.obra); sub = "a " + distTxt(e.d || 0) + " · " + otTxt; cls = e.ot || !esCrew() ? "ok" : "am"; if (e.otra) cls = "am"; }
    else if (e.obra) { tit = NOM(e.obra); sub = (e.d != null ? "a " + distTxt(e.d) + " · " : "") + (e.motivo ? "elegida a mano" : otTxt); cls = e.motivo ? "am" : "gris"; }
    else { tit = "Elegí la obra"; sub = "tocá acá"; cls = "am"; }
    return `<button type="button" class="cb-pill ${cls}" data-cb="obra" aria-label="Cambiar la obra"><span class="cb-pi">${ic("pin", "", 1.9)}</span><span class="cb-pt"><b>${esc(tit)}</b><small>${esc(sub)}</small></span>${ic("abajo", "cb-pa", 2)}</button>`;
  }
  function avisoHtml(e) {
    if (!e.obra || CB.visto[e.obra.id] || e.g !== "ok") return "";
    if (e.otra) return `<div class="cbx-aviso" role="status">${ic("alerta", "", 1.9)}<div><p>Estás en <b>${esc(NOM(e.obra))}</b>. Tu orden de hoy es <b>${esc(String(e.otHoy.plazaNombre || "").toUpperCase())}</b>. Las fotos van a ${esc(NOM(e.obra))}.</p><div class="cb-av-acc"><button type="button" data-cb="vistoOk">Está bien</button><button type="button" data-cb="otraObra">Es otra obra</button></div></div></div>`;
    if (e.auto && !e.ot && esCrew()) return `<div class="cbx-aviso" role="status">${ic("alerta", "", 1.9)}<div><p>Estás en <b>${esc(NOM(e.obra))}</b> y no tenés orden acá: las fotos van igual a ${esc(NOM(e.obra))} y la oficina se entera.</p><div class="cb-av-acc"><button type="button" data-cb="vistoOk">Está bien</button><button type="button" data-cb="otraObra">Es otra obra</button></div></div></div>`;
    return "";
  }
  function panelHtml() {
    const conNum = pide(CB.cat) && CB.num;
    const lbl = (MODOS.find((m) => m[0] === CB.cat) || ["", catTxt(CB.cat)])[1];
    let sub = "foto general";
    if (conNum) { const l = CB.lista; if (l && l.length) { const n = l.filter((x) => x.foto || hechaLocal(CB.cat, x.num)).length; sub = n + " de " + l.length + " con foto"; } else sub = "tocá ‹ › para cambiar"; }
    return `<div class="cb-num"><button type="button" class="cb-fl" data-cb="prev" aria-label="Anterior">${ic("chevI", "", 2)}</button><button type="button" class="cb-nt" data-cb="que" aria-label="Cambiar qué vas a sacar"><b>${esc(conNum ? CB.num : lbl)}</b><small>${esc(sub)}</small></button><button type="button" class="cb-fl" data-cb="next" aria-label="Siguiente">${ic("chev", "", 2)}</button></div>
<div class="cbx-modos" id="cbModos">${MODOS.map((m) => `<button type="button" class="cbx-modo${m[0] === CB.cat ? " on" : ""}" data-cbm="${m[0]}">${esc(m[1])}</button>`).join("")}</div>`;
  }
  function sincronizar(e) {   // lo elegido pasa a la cámara de la app (marca en vivo y la foto)
    const el = { ot: e.ot ? e.ot.id : "", plazaId: e.obra ? String(e.obra.id) : "", plazaNombre: e.obra ? nombre(e.obra) : "", cat: CB.cat || "otra", num: pide(CB.cat) ? CB.num : "", k: e.ot && CB.k ? CB.k : "", tareaLbl: e.ot && CB.k ? CB.tarea : "", __b: true };
    intentar(() => CA().ponerElig && CA().ponerElig(el), null);
  }
  function pintar(forzar) {
    const cam = $("emaCam"); if (!cam || !cam.classList.contains("ec-cb")) return;
    const e = calc(); ponerTipo(e, false); sincronizar(e);
    const arr = pillHtml(e) + "|" + avisoHtml(e), ab = panelHtml();
    const f = arr + ab; if (!forzar && f === CB.firma) return; CB.firma = f;
    let p = $("cbPill"); if (!p) { p = document.createElement("div"); p.id = "cbPill"; const x = cam.querySelector('.ec-arriba [data-ec="cerrar"]'); x ? x.insertAdjacentElement("afterend", p) : cam.appendChild(p); }
    p.innerHTML = pillHtml(e);
    let a = $("cbAviso"); if (!a) { a = document.createElement("div"); a.id = "cbAviso"; cam.appendChild(a); }
    a.innerHTML = avisoHtml(e);
    let b = $("cbPanel"); if (!b) { b = document.createElement("div"); b.id = "cbPanel"; cam.appendChild(b); }
    const sl = (b.querySelector(".cbx-modos") || {}).scrollLeft || 0;
    b.innerHTML = ab;
    const m = b.querySelector(".cbx-modos"), on1 = m && m.querySelector(".cbx-modo.on");
    if (m) { m.scrollLeft = sl; if (on1) { const obj = on1.offsetLeft - (m.clientWidth - on1.offsetWidth) / 2; m.scrollLeft = obj; } }
  }
  function armar() {
    const cam = $("emaCam"); if (!cam || cam.dataset.cbArmada) return;
    cam.dataset.cbArmada = "1"; cam.classList.add("ec-cb");
    const ab = cam.querySelector(".ec-abajo");
    if (ab && !ab.querySelector(".cb-listo")) ab.insertAdjacentHTML("beforeend", `<button type="button" class="cb-listo" data-cb="listo" aria-label="Listo, salir de la cámara">${ic("tilde", "", 2.4)}<span>Listo</span></button>`);
    CB.firma = ""; pintar(true);
    clearInterval(CB.reloj); CB.reloj = setInterval(() => { if (!$("emaCam")) return clearInterval(CB.reloj); pintar(false); }, 1000);
  }
  function abrir(op) {
    op = op || {};
    if (intentar(() => CA().abierta && CA().abierta(), false)) return true;
    CB.abierta = true; CB.pend = Date.now(); CB.t0 = Date.now(); CB.visto = {}; CB.firma = ""; CB.tipoManual = false; CB.obraId = "\u0000"; CB.hechas = {};
    CB.manual = op.forzar ? { id: String(op.forzar), auto: true, fija: true } : null;
    try { window.selloPedirGPS && window.selloPedirGPS().then((p) => { if (p) { CB.pos = p; pintar(false); } }); } catch (e) { }
    const e = calc(); ponerTipo(e, true); sincronizar(e);
    intentar(() => CA().abrirLibre(), null);
    return true;
  }
  function cerrarCam() { try { CA().cerrar && CA().cerrar(); } catch (e) { } }
  // cuando la cámara de la app aparece / se va
  new MutationObserver(() => {
    const cam = $("emaCam");
    if (cam && CB.pend && Date.now() - CB.pend < 8000 && cam.classList.contains("ec-menu")) { CB.pend = 0; armar(); }
    if (!cam && CB.abierta && !CB.pend) {
      CB.abierta = false; clearInterval(CB.reloj); cerrarHoja();
      document.documentElement.classList.remove("modo-camara");   // ?camara=1: «Listo» vuelve a la app (no reabre la hoja vieja)
      flush();
    }
  }).observe(document.body, { childList: true });
  // tras cada foto (el input de la cámara ya copió lo elegido): la siguiente columna
  document.addEventListener("change", (ev) => {
    if (!ev.target || ev.target.id !== "ecLibreIn" || !$("emaCam") || !$("emaCam").classList.contains("ec-cb")) return;
    if (CB.cat) CB.hechas[CB.obraId + "|" + CB.cat + "|" + nk(CB.num)] = 1;
    if (pide(CB.cat) && CB.num) {
      if (CB.lista && CB.lista.length) { const sig = CB.lista.find((x) => !x.foto && !hechaLocal(CB.cat, x.num)); if (sig) CB.num = sig.num; else moverNum(1); }
      else moverNum(1);
    }
    setTimeout(() => pintar(true), 30);
  });
  // en el momento de guardar: la obra con el GPS de ese momento (si todavía no había, se espera hasta 1,5 s, como fotoRapida)
  async function resolver(el) {
    if (!el || !el.__b) return el;
    let e = calc();
    if (e.g === "buscando") {
      await Promise.race([Promise.resolve(window.selloPedirGPS ? window.selloPedirGPS() : null).then((p) => { if (p) CB.pos = p; }, () => { }), new Promise((ok) => setTimeout(ok, 1500))]);
      e = calc();
    }
    if (!e.obra) return el;
    const mismaOt = e.ot && e.ot.id === el.ot;
    return Object.assign({}, el, { ot: e.ot ? e.ot.id : "", plazaId: String(e.obra.id), plazaNombre: nombre(e.obra), k: mismaOt ? el.k || "" : "", tareaLbl: mismaOt ? el.tareaLbl || "" : "", ubic: ubicDe(e) });
  }
  // sin obra elegida no se dispara: se abre la hoja
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest && ev.target.closest('#emaCam.ec-cb [data-ec="disparar"]'); if (!b) return;
    const e = calc(); if (e.obra) return;
    ev.preventDefault(); ev.stopPropagation(); hoja("obra");
  }, true);

  // ---- la hoja para cambiar (obra / qué / columna), estilo de la opción D
  function cerrarHoja() { const h = $("cbHoja"); h && h.remove(); CB.conf = null; }
  function opObra(o, sub, sel, ico, extra) { return `<button type="button" class="cb-op${sel ? " sel" : ""}" data-cbo="${esc(o.id)}"${extra || ""}><span class="cb-oi">${ic(ico || "pin", "", 1.8)}</span><span class="cb-ot"><b>${esc(NOM(o))}</b><small>${esc(sub)}</small></span>${sel ? ic("tilde", "cb-ok", 2.4) : ic("chev", "cb-ch", 1.8)}</button>`; }
  function hojaObraHtml() {
    const e = calc(), p = e.p, l = [], ya = {};
    const selId = e.obra ? String(e.obra.id) : "";
    let h = "";
    if (e.g !== "ok") h += `<div class="cb-gps">${ic("pin", "", 1.8)}<div>${p ? `El GPS todavía no es bueno (±${precDe(p)} m).` : "Todavía no hay GPS."} <b>Podés sacar igual:</b> elegí la obra y listo.</div></div>`;
    const radio = e.g === "ok" ? RADIO : Math.max(300, Math.min(1500, precDe(p) * 2));
    const cerca = p ? cercanas(p, radio).slice(0, 3) : [];
    if (cerca.length) {
      h += `<div class="cbx-sub">Cerca, según el GPS</div>`;
      cerca.forEach((c) => { ya[c.o.id] = 1; const ot = e.mis.find((o) => String(o.plazaId) === String(c.o.id)); h += opObra(c.o, [ot ? ot.numero : c.o.obraId ? "ID " + c.o.obraId : "", ot && ot.fecha === hoyISO() ? "tu orden de hoy" : ot ? fCorta(ot.fecha) : "", "~" + distTxt(c.d)].filter(Boolean).join(" · "), String(c.o.id) === selId, ot ? "orden" : "pin"); });
    }
    if (oficina()) {
      const todas = obras().filter((o) => o.nombre).sort((a, b) => nombre(a).localeCompare(nombre(b), "es"));
      h += `<div class="cbx-sub">Todas las obras <small id="cbCuenta">${todas.length}</small></div><input type="search" class="cb-busca" id="cbBusca" placeholder="Buscá por nombre, barrio o ID…" autocomplete="off" enterkeyhint="search"><div class="cb-lista" id="cbLista">` +
        todas.filter((o) => !ya[o.id]).map((o) => opObra(o, [o.barrio, o.obraId ? "ID " + o.obraId : ""].filter(Boolean).join(" · ") || " ", String(o.id) === selId, "pin", ` data-n="${esc(nk([o.nombre, o.barrio, o.obraId, o.direccion].filter(Boolean).join(" ")))}"`)).join("") + `</div>`;
    } else {
      const mias = []; e.mis.forEach((o) => { if (ya[o.plazaId]) return; const ob = obraPorId(o.plazaId); if (!ob) return; ya[o.plazaId] = 1; mias.push(opObra(ob, [o.numero, o.fecha === hoyISO() ? "hoy" : fCorta(o.fecha)].filter(Boolean).join(" · "), String(ob.id) === selId, "orden")); });
      if (mias.length) h += `<div class="cbx-sub">Tus órdenes</div>` + mias.join("");
      if (!cerca.length && !mias.length) h += `<div class="cb-nada">No tenés órdenes y no estás cerca de ninguna obra registrada.</div>`;
      h += `<button type="button" class="cb-op cb-otra" data-cb="otraObra"><span class="cb-oi">${ic("buscar", "", 1.8)}</span><span class="cb-ot"><b>Es otra obra</b><small>buscala y decí por qué</small></span>${ic("chev", "cb-ch", 1.8)}</button>`;
    }
    return `<div class="v7-cab"><h3>¿En qué obra estás?</h3><button type="button" class="v7-x" data-cb="cerrarH" aria-label="Cerrar">✕</button></div>` + h;
  }
  function hojaOtraHtml() {
    const todas = obras().filter((o) => o.nombre).sort((a, b) => nombre(a).localeCompare(nombre(b), "es"));
    const sel = CB.otraSel ? obraPorId(CB.otraSel) : null;
    return `<div class="v7-cab"><h3>Es otra obra</h3><button type="button" class="v7-x" data-cb="cerrarH" aria-label="Cerrar">✕</button></div>
<p class="v7-sub">Buscala en la lista y decí por qué la foto va ahí (lo ve la oficina).</p>
<input type="search" class="cb-busca" id="cbBusca" placeholder="Buscá por nombre, barrio o ID…" autocomplete="off" enterkeyhint="search" value="${esc(CB.busca || "")}">
<div class="cb-lista" id="cbLista">${todas.map((o) => opObra(o, [o.barrio, o.obraId ? "ID " + o.obraId : ""].filter(Boolean).join(" · ") || " ", sel && String(sel.id) === String(o.id), "pin", ` data-n="${esc(nk([o.nombre, o.barrio, o.obraId, o.direccion].filter(Boolean).join(" ")))}" data-cbsel="1"`)).join("")}</div>
<label class="cb-mot-l" for="cbMotivo">¿Por qué? <small>(obligatorio)</small></label><textarea id="cbMotivo" class="cb-mot" rows="2" placeholder="Ej.: no se alcanzó a hacer la orden, me mandaron de apuro…">${esc(CB.motivo || "")}</textarea>
<div class="v7-acc"><button type="button" class="btn-primary" data-cb="otraOk"${sel && String(CB.motivo || "").trim().length >= 3 ? "" : " disabled"}>${sel ? "Guardar las fotos en " + esc(NOM(sel)) : "Elegí la obra"}</button></div>`;
  }
  function hojaConfHtml() {
    const c = CB.conf; if (!c) return "";
    const aqui = obraPorId(c.aqui), elegida = obraPorId(c.elegida);
    if (c.paso === "motivo") return `<div class="v7-cab"><h3>¿Por qué es de ${esc(lindo(elegida))}?</h3><button type="button" class="v7-x" data-cb="cerrarH" aria-label="Cerrar">✕</button></div>
<p class="v7-sub">El GPS dice que estás en ${esc(NOM(aqui))}. Si la foto es de ${esc(NOM(elegida))}, contá por qué (lo ve la oficina).</p>
<textarea id="cbMotivo" class="cb-mot" rows="3" placeholder="Ej.: es material para llevar a ${esc(lindo(elegida))}…">${esc(CB.motivo || "")}</textarea>
<div class="v7-acc"><button type="button" class="btn-primary" data-cb="confMotOk"${String(CB.motivo || "").trim().length >= 3 ? "" : " disabled"}>Guardar en ${esc(lindo(elegida))}</button></div>`;
    return `<div class="v7-cab"><h3>Estás en ${esc(NOM(aqui))}, no en ${esc(NOM(elegida))}</h3><button type="button" class="v7-x" data-cb="cerrarH" aria-label="Cerrar">✕</button></div>
<div class="cb-gps am">${ic("pin", "", 1.8)}<div>Según el GPS estás a ${esc(distTxt(c.dAqui))} de ${esc(NOM(aqui))}${c.dElegida != null ? ` y a ${esc(distTxt(c.dElegida))} de ${esc(NOM(elegida))}` : ""}. <b>¿Guardo la foto en ${esc(lindo(aqui))}?</b></div></div>
<div class="v7-acc cb-col"><button type="button" class="btn-primary" data-cb="confSi">Sí, en ${esc(lindo(aqui))}</button><button type="button" class="btn-ghost" data-cb="confNo">No, es de ${esc(lindo(elegida))} (decí por qué)</button></div>`;
  }
  function hojaQueHtml() {
    const conNum = pide(CB.cat);
    const l = CB.lista, n = l && l.length ? l.filter((x) => x.foto || hechaLocal(CB.cat, x.num)).length : null;
    return `<div class="v7-cab"><h3>¿Qué vas a sacar?</h3><button type="button" class="v7-x" data-cb="cerrarH" aria-label="Cerrar">✕</button></div>
<div class="cb-tipos">${TIPOS.map((t) => `<button type="button" class="cb-tipo${t[0] === CB.cat ? " sel" : ""}" data-cbt="${t[0]}">${ic(t[0], "", 1.7)}<span>${esc(t[1])}</span></button>`).join("")}</div>
<button type="button" class="cb-tipo cb-tipo-otra${CB.cat === "otra" ? " sel" : ""}" data-cbt="otra">${ic("otra", "", 2.2)}<span>Otra cosa</span></button>
${conNum ? `<div class="cb-step"><button type="button" class="cb-sb" data-cb="prev" aria-label="Anterior">${ic("chevI", "", 2)}</button><div><b>${esc(String(CB.num || "").replace(/^Col /, "Columna ").replace(/^Lum /, "Luminaria "))}</b><small>${esc(CB.tarea ? "de tu tarea: " + CB.tarea : n != null ? n + " de " + l.length + " con foto" : (NUMN[CB.cat] || "Número"))}</small></div><button type="button" class="cb-sb" data-cb="next" aria-label="Siguiente">${ic("chev", "", 2)}</button></div>` : ""}
<button type="button" class="btn-primary cb-listoH" data-cb="cerrarH">Listo</button>`;
  }
  function hoja(vista) {
    CB.vista = vista || CB.vista || "obra";
    let h = $("cbHoja");
    if (!h) { h = document.createElement("div"); h.id = "cbHoja"; h.className = "v7-ov cb-hoja no-print"; h.setAttribute("role", "dialog"); h.setAttribute("aria-modal", "true"); h.setAttribute("aria-label", "Cambiar la foto"); document.body.appendChild(h); }
    const html = CB.vista === "que" ? hojaQueHtml() : CB.vista === "otra" ? hojaOtraHtml() : CB.vista === "conf" ? hojaConfHtml() : hojaObraHtml();
    const y = (h.querySelector(".v7-caja") || {}).scrollTop || 0;
    h.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div>${html}</div>`;
    const c2 = h.querySelector(".v7-caja"); if (c2) c2.scrollTop = y;
    filtrar();
  }
  function filtrar() {
    const i = $("cbBusca"); if (!i) return;
    const ps = nk(i.value).split(/\s+/).filter(Boolean); let n = 0;
    const bs = document.querySelectorAll("#cbLista .cb-op");
    bs.forEach((b) => { const t = b.dataset.n || "", pal = t.split(/[^a-z0-9]+/); const ok = !ps.length || ps.every((p) => pal.some((w) => w.indexOf(p) === 0) || (p.length >= 3 && t.indexOf(p) >= 0)); b.style.display = ok ? "" : "none"; ok && n++; });
    const c = $("cbCuenta"); c && (c.textContent = ps.length ? n + " de " + bs.length : String(bs.length));
  }
  function elegirObra(id, motivo) {
    const e = calc(), o = obraPorId(id); if (!o) return;
    if (!motivo && e.g === "ok" && e.p) {   // eligió a mano otra obra estando parado en una registrada
      const c = cercana(e.p), cO = ll(o), dO = cO ? Math.round(dist(e.p, cO)) : null;
      if (c && String(c.o.id) !== String(o.id) && (dO == null || dO > RADIO)) { CB.conf = { aqui: String(c.o.id), elegida: String(o.id), dAqui: c.d, dElegida: dO, paso: "" }; CB.motivo = ""; return hoja("conf"); }
    }
    CB.manual = { id: String(o.id), cercaId: e.cerca ? String(e.cerca.o.id) : "", motivo: motivo || "", fija: !!motivo, auto: !!(e.cerca && String(e.cerca.o.id) === String(o.id)) };
    CB.tipoManual = false; CB.obraId = "\u0000";
    cerrarHoja(); pintar(true);
  }
  document.addEventListener("click", (ev) => {
    const t = ev.target; if (!t || !t.closest) return;
    const enCam = t.closest("#emaCam.ec-cb"), enHoja = t.closest("#cbHoja");
    if (!enCam && !enHoja) return;
    if (enHoja && t === enHoja) { ev.preventDefault(); cerrarHoja(); return; }
    const m = t.closest("[data-cbm]"); if (m) { ev.preventDefault(); ev.stopPropagation(); elegirModo(m.dataset.cbm); pintar(true); return; }
    const tt = t.closest("[data-cbt]"); if (tt) { ev.preventDefault(); ev.stopPropagation(); elegirModo(tt.dataset.cbt); pintar(true); hoja("que"); return; }
    const o = t.closest("[data-cbo]");
    if (o) { ev.preventDefault(); ev.stopPropagation(); if (o.dataset.cbsel) { CB.otraSel = o.dataset.cbo; const mo = $("cbMotivo"); CB.motivo = mo ? mo.value : CB.motivo; CB.busca = ($("cbBusca") || {}).value || ""; hoja("otra"); return; } elegirObra(o.dataset.cbo); return; }
    const b = t.closest("[data-cb]"); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    const a = b.dataset.cb;
    if (a === "obra") return hoja("obra");
    if (a === "que") return hoja("que");
    if (a === "prev" || a === "next") { if (pide(CB.cat) && CB.num) moverNum(a === "next" ? 1 : -1); else { const i = MODOS.findIndex((x) => x[0] === CB.cat); elegirModo(MODOS[(i + (a === "next" ? 1 : MODOS.length - 1)) % MODOS.length][0]); } pintar(true); if ($("cbHoja") && CB.vista === "que") hoja("que"); return; }
    if (a === "listo") { cerrarCam(); return; }
    if (a === "cerrarH") { cerrarHoja(); return; }
    if (a === "vistoOk") { const e = calc(); if (e.obra) CB.visto[e.obra.id] = 1; pintar(true); return; }
    if (a === "otraObra") { CB.otraSel = ""; CB.motivo = ""; CB.busca = ""; return hoja("otra"); }
    if (a === "otraOk") { const mo = String(($("cbMotivo") || {}).value || "").trim(); if (!CB.otraSel || mo.length < 3) return; const e = calc(); if (e.obra) CB.visto[CB.otraSel] = 1; elegirObra(CB.otraSel, mo); return; }
    if (a === "confSi") { const c = CB.conf; CB.manual = { id: c.aqui, cercaId: c.aqui, auto: true, fija: false }; CB.tipoManual = false; CB.obraId = "\u0000"; cerrarHoja(); pintar(true); return; }
    if (a === "confNo") { CB.conf.paso = "motivo"; CB.motivo = ""; return hoja("conf"); }
    if (a === "confMotOk") { const mo = String(($("cbMotivo") || {}).value || "").trim(); if (mo.length < 3) return; const c = CB.conf; CB.visto[c.elegida] = 1; elegirObra(c.elegida, mo); return; }
  }, true);
  document.addEventListener("input", (ev) => {
    const t = ev.target; if (!t) return;
    if (t.id === "cbBusca") filtrar();
    if (t.id === "cbMotivo") {
      CB.motivo = t.value;
      const ok = String(t.value || "").trim().length >= 3;
      const b = document.querySelector('#cbHoja [data-cb="otraOk"], #cbHoja [data-cb="confMotOk"]');
      if (b) b.disabled = !(ok && (b.dataset.cb === "confMotOk" || CB.otraSel));
    }
  });

  // =========================================================================================== aviso: fotos sin orden
  const KS = "ema.og.sinOrden";
  let usCache = null, tAviso = null;
  function usuariosAviso() {
    const l = intentar(() => PERMISOS.lista() || [], []);
    if (l.some((u) => u && (u.rol === "oficina" || u.rol === "admin"))) return Promise.resolve(l);
    if (usCache) return Promise.resolve(usCache);
    try { return firebase.firestore().collection("usuarios").get().then((s) => (usCache = s.docs.map((d) => Object.assign({ uid: d.id }, d.data()))), () => []); } catch (e) { return Promise.resolve([]); }
  }
  async function avisar(otHoy, titulo, cuerpo, tipo, ref) {
    const yoE = String((window.__fbUser && window.__fbUser.email) || "").toLowerCase(), dest = new Set();
    if (otHoy && otHoy.supervisor && otHoy.supervisor.email) dest.add(String(otHoy.supervisor.email).toLowerCase());
    else { const us = await usuariosAviso(); us.filter((u) => u && u.activo !== false && u.pendiente !== true && u.email && (u.rol === "admin" || u.rol === "oficina")).forEach((u) => dest.add(String(u.email).toLowerCase())); }
    const l = Array.from(dest).filter((x) => x && x !== yoE);
    if (window.__pushAvisos && window.__pushAvisos.dejarAviso) for (const em of l) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo, cuerpo, tipo, ref: String(ref || ""), tag: "ema-" + tipo + "-" + ref + "-" + hoyISO(), url: "./" }); } catch (e) { } }
    return l;
  }
  function leerSO() { const m = LSr(KS, {}), h = hoyISO(); Object.keys(m).forEach((k) => { if (k.slice(0, 10) !== h) delete m[k]; }); return m; }
  function trasFoto(meta) {
    if (!on() || !esCrew() || !meta || meta.otId || !meta.plazaId || meta.plazaId === "__sinObra") return;
    const m = leerSO(), k = hoyISO() + "|" + clave() + "|" + meta.plazaId, x = m[k] || (m[k] = { n: 0, enviado: false, obra: meta.plazaNombre || "", plazaId: meta.plazaId });
    if (x.enviado) return;
    x.n++; LSw(KS, m);
    clearTimeout(tAviso); tAviso = setTimeout(flush, 60000);
  }
  async function flush() {
    clearTimeout(tAviso);
    const m = leerSO(), ks = Object.keys(m).filter((k) => !m[k].enviado && m[k].n > 0); if (!ks.length) return [];
    const otHoy = otHoyDe(misOts()), quien = persona(), out = [];
    for (const k of ks) {
      const x = m[k]; x.enviado = true; LSw(KS, m);
      const ob = obraPorId(x.plazaId), nomO = ob ? NOM(ob) : String(x.obra || "").toUpperCase();
      const cuerpo = `${quien} sacó ${x.n} foto${x.n === 1 ? "" : "s"} en ${nomO} sin orden${otHoy && String(otHoy.plazaId) !== String(x.plazaId) ? ` (tiene orden en ${String(otHoy.plazaNombre || "").toUpperCase()})` : ""}.`;
      out.push(cuerpo);
      await avisar(otHoy, "📷 Fotos en una obra sin orden", cuerpo, "fotoSinOrden", x.plazaId);
    }
    return out;
  }

  // =========================================================================================== Modo obra: «Llegué» en otra obra
  function llegue(o, p, seguir) {
    if (!on() || !o || !p || p.lat == null) return false;
    if (precDe(p) > PREC_MALA) return false;
    const mia = obraPorId(o.plazaId), cm = ll(mia), dMia = cm ? dist(p, cm) : null;
    if (dMia != null && dMia <= RADIO) return false;
    const otra = cercana(p, o.plazaId); if (!otra) return false;
    let h = $("ogLlegue"); if (!h) { h = document.createElement("div"); h.id = "ogLlegue"; h.className = "v7-ov no-print"; h.setAttribute("role", "dialog"); h.setAttribute("aria-modal", "true"); h.setAttribute("aria-label", "¿Trabajás acá hoy?"); document.body.appendChild(h); }
    h.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><h3>Estás en ${esc(NOM(otra.o))}. ¿Trabajás acá hoy?</h3><button type="button" class="v7-x" data-ogl="x" aria-label="Cerrar">✕</button></div>
<div class="cb-gps am">${ic("pin", "", 1.8)}<div>Tu orden de hoy (${esc(o.numero || "")}) es en <b>${esc(String(o.plazaNombre || "").toUpperCase())}</b>${dMia != null ? `, a ${esc(distTxt(dMia))} de acá` : ""}. El GPS dice que estás a ${esc(distTxt(otra.d))} de ${esc(NOM(otra.o))}.</div></div>
<p class="v7-sub">Si trabajás acá, las fotos van a ${esc(NOM(otra.o))} como fotos sueltas (no se mezclan con las columnas de tu orden) y se avisa a la oficina.</p>
<div class="v7-acc cb-col"><button type="button" class="btn-primary" data-ogl="si">Sí, trabajo acá</button><button type="button" class="btn-ghost" data-ogl="no">No, voy a ${esc(String(o.plazaNombre || "").toUpperCase())}</button></div></div>`;
    h.onclick = (ev) => {
      const b = ev.target.closest && ev.target.closest("[data-ogl]");
      if (!b && ev.target !== h) return;
      const a = b ? b.dataset.ogl : "x"; h.remove();
      if (a === "si") {
        const m = leerSO(), k = hoyISO() + "|" + clave() + "|" + otra.o.id; m[k] = { n: 0, enviado: true, obra: nombre(otra.o), plazaId: String(otra.o.id) }; LSw(KS, m);
        avisar(o, "📍 Trabajando en otra obra", `${persona()} está trabajando en ${NOM(otra.o)} sin orden (tiene orden en ${String(o.plazaNombre || "").toUpperCase()}).`, "otraObra", otra.o.id).catch(() => { });
        abrir({ forzar: otra.o.id });
      } else if (a === "no") { try { window.__cuadrillaDia.ir("llegar"); } catch (e) { } }
    };
    return true;
  }

  // =========================================================================================== ficha de cada foto (todas)
  window.__obraGpsUbic = function (a) {
    if (!on() || !a) return null;
    const out = {};
    if (a.ubic && typeof a.ubic == "object") { Object.keys(a.ubic).forEach((k) => { const v = a.ubic[k]; if (v !== undefined && v !== null && v !== "") out[k] = v; }); return out; }
    const o = obraPorId(a.plazaId), c = ll(o), g = a.gps && a.gps.lat != null ? a.gps : null;
    out.obraAuto = false; out.obraElegida = String(a.plazaId || "");
    if (g && c) out.distObra = Math.round(dist(g, c));
    if (!g || (g.prec || 0) > PREC_MALA) out.ubicDudosa = true;
    return out;
  };

  // =========================================================================================== Supervisor (oficina)
  const SUP = { fotos: [], ts: 0, cargando: false, ok: LSr("ema.og.ok", {}), quitado: {} };
  const rol = () => intentar(() => (yo() || {}).rol || "", "");
  const puedeSup = () => !!window.__fbUser && on() && !esCrew() && (rol() === "admin" || rol() === "oficina");
  function cargarFotos(forzar) {
    if (!puedeSup() || SUP.cargando || (!forzar && Date.now() - SUP.ts < 20 * 6e4)) return;
    SUP.cargando = true; SUP.ts = Date.now();
    const dias = [0, 1, 2].map((n) => diaMas(-n));
    let db = null; try { db = firebase.firestore(); } catch (e) { SUP.cargando = false; return; }
    Promise.all(dias.map((f) => db.collection("fotosObra").where("fecha", "==", f).get().then((s) => { const l = []; s.forEach((d) => l.push(Object.assign({ id: d.id }, d.data()))); return l; }, () => []))).then((ls) => {
      SUP.fotos = [].concat.apply([], ls); SUP.cargando = false;
      try { window.__supervisor && window.__supervisor.hallazgos({ ahora: true }); } catch (e) { }
      try { window.__inicioPro && window.__inicioPro.pintar(); } catch (e) { }
    }, () => { SUP.cargando = false; });
  }
  function grupos() {
    const g = {};
    SUP.fotos.forEach((f) => {
      if (!f || f.borrada || f.ubicOk || SUP.ok[f.id] || SUP.quitado[f.id] || !f.plazaId || f.plazaId === "__sinObra") return;
      if (f.ubicDudosa || (Number(f.gpsPrec) || 0) > PREC_MALA) return;   // con el GPS impreciso no se puede decir dónde se sacó
      const suya = obraPorId(f.plazaId), cs = ll(suya), fl = ll(f); if (!cs || !fl) return;
      const d = dist(fl, cs); if (d <= RADIO) return;
      const otra = cercana(fl, suya.id); if (!otra) return;
      const k = suya.id + ">" + otra.o.id, x = g[k] || (g[k] = { key: k, suya, otra: otra.o, fotos: [], por: {}, fechas: {}, dOtra: [], dSuya: [] });
      x.fotos.push(f); x.por[f.por || "?"] = 1; x.fechas[f.fecha || ""] = 1; x.dOtra.push(otra.d); x.dSuya.push(Math.round(d));
    });
    return Object.keys(g).map((k) => g[k]).sort((a, b) => b.fotos.length - a.fotos.length);
  }
  const sinUbic = () => obras().filter((o) => o.nombre && !ll(o) && !intentar(() => window.__obraFin(o), false));
  function supHallazgos() {
    if (!puedeSup()) return [];
    cargarFotos(false);
    const out = [];
    grupos().forEach((x) => {
      const n = x.fotos.length;
      out.push({ g: "ambar", cat: "Fotos", t: `${n} foto${n === 1 ? "" : "s"} de ${NOM(x.suya)} se ${n === 1 ? "sacó" : "sacaron"} en ${NOM(x.otra)}`, s: `De ${Object.keys(x.por).join(", ")} · ${Object.keys(x.fechas).map(fCorta).join(", ")} · a ${Math.min.apply(null, x.dOtra)} m de ${NOM(x.otra)} (a ${distTxt(Math.min.apply(null, x.dSuya))} de ${NOM(x.suya)})`, ir: { tipo: "obragps", key: x.key }, obraId: x.suya.id, btn: "Mover" });
    });
    const su = sinUbic();
    if (su.length) out.push({ g: "info", cat: "Fotos", t: `Obras sin ubicación cargada (${su.length})`, s: "Sin la ubicación no se puede controlar dónde se sacan las fotos: " + su.slice(0, 4).map((o) => NOM(o)).join(", ") + (su.length > 4 ? "…" : ""), ir: { tipo: "obragpsSin" }, obraId: "", btn: "Ver" });
    return out;
  }
  const nombreYo = () => persona() || String((window.__fbUser && window.__fbUser.email) || "");
  async function mover(x) {   // los mismos cambios que proponer_mover_fotos (v133): fotosObra + adjuntos con movidaDe
    const db = firebase.firestore(), quien = nombreYo(), ahora = Date.now(), dest = x.otra; let ok = 0; const mal = [];
    for (const f of x.fotos) {
      const mv = { plazaId: f.plazaId, plazaNombre: f.plazaNombre || nombre(x.suya), ts: ahora, por: quien, motivo: "ubicadas por el GPS (supervisor)" };
      try { await db.collection("fotosObra").doc(f.id).update({ plazaId: String(dest.id), plazaNombre: nombre(dest), movidaDe: mv }); ok++; SUP.quitado[f.id] = 1; }
      catch (e) { mal.push(e && e.code === "permission-denied" ? "permiso" : (e && e.code) || "error"); continue; }
      if (f.adjId) { try { await db.collection("adjuntos").doc(f.adjId).update({ plazaId: String(dest.id), plazaNombre: nombre(dest), movidaDe: mv }); } catch (e) { if (!(e && /not-found/.test(String(e.code)))) mal.push("adjunto " + ((e && e.code) || "error")); } }
    }
    try { window.__lgFotosOlvidar && window.__lgFotosOlvidar(); } catch (e) { }
    if (ok) try { window.fbAuditar && window.fbAuditar("supervisor_mover_fotos", `${ok} foto(s) de ${nombre(x.suya)} → ${nombre(dest)} · ubicadas por el GPS`.slice(0, 480), { ref: String(dest.id), fotos: x.fotos.map((f) => f.id).slice(0, 200), desde: String(x.suya.id), porSupervisor: true }); } catch (e) { }
    return { ok, mal };
  }
  async function estaBien(x) {
    const db = intentar(() => firebase.firestore(), null), quien = nombreYo();
    for (const f of x.fotos) {
      SUP.ok[f.id] = 1;
      if (db) { try { await db.collection("fotosObra").doc(f.id).update({ ubicOk: { por: quien, ts: Date.now() } }); } catch (e) { } }
    }
    LSw("ema.og.ok", SUP.ok);
  }
  const SH = { foco: "", conf: "", msg: "" };
  function hojaSupHtml(tipo) {
    if (tipo === "obragpsSin") {
      const su = sinUbic();
      return `<div class="v7-cab"><h3>Obras sin ubicación cargada (${su.length})</h3><button type="button" class="v7-x" data-ogs="x" aria-label="Cerrar">✕</button></div>
<p class="v7-sub">Sin la ubicación (el pin en el mapa) la app no puede saber si las fotos se sacaron en la obra. Cargala una vez y listo.</p>
<div class="og-lista">${su.map((o) => `<div class="og-fila"><div class="tx"><b>${esc(NOM(o))}</b><small>${esc([o.obraId ? "ID " + o.obraId : "", o.barrio, o.direccion].filter(Boolean).join(" · "))}</small></div><button type="button" class="btn-ghost" data-ogs="ubicar" data-id="${esc(o.id)}">📍 Cargar ubicación</button></div>`).join("") || '<div class="og-fila"><div class="tx"><b>Todas tienen ubicación</b></div></div>'}</div>`;
    }
    const gs = grupos();
    if (SH.foco) gs.sort((a, b) => (a.key === SH.foco ? -1 : 0) - (b.key === SH.foco ? -1 : 0));
    return `<div class="v7-cab"><h3>Fotos que parecen de otra obra</h3><button type="button" class="v7-x" data-ogs="x" aria-label="Cerrar">✕</button></div>
<p class="v7-sub">Comparé el GPS de cada foto de los últimos 3 días con la ubicación de las obras (a más de ${RADIO} m de su obra y a menos de ${RADIO} m de otra). Nada se mueve solo.</p>
${SH.msg ? `<div class="v7-msg bien">${esc(SH.msg)}</div>` : ""}
${gs.length ? gs.map((x) => {
      const n = x.fotos.length, conf = SH.conf === x.key;
      return `<div class="og-grupo" data-key="${esc(x.key)}"><b>${n} foto${n === 1 ? "" : "s"} de ${esc(NOM(x.suya))} se ${n === 1 ? "sacó" : "sacaron"} en ${esc(NOM(x.otra))}</b><small>De ${esc(Object.keys(x.por).join(", "))} · ${esc(Object.keys(x.fechas).map(fCorta).join(", "))} · a ${Math.min.apply(null, x.dOtra)} m de ${esc(NOM(x.otra))}, a ${esc(distTxt(Math.min.apply(null, x.dSuya)))} de ${esc(NOM(x.suya))}${x.fotos.some((f) => f.motivoOtra) ? " · motivo: «" + esc(x.fotos.map((f) => f.motivoOtra).filter(Boolean)[0]) + "»" : ""}</small>
<div class="og-minis">${x.fotos.slice(0, 6).map((f) => (/^data:image\//.test(String(f.mini || "")) ? `<img src="${esc(f.mini)}" alt="">` : "")).join("")}</div>
${conf ? `<div class="og-conf"><p>¿Mover ${n === 1 ? "la foto" : "las " + n + " fotos"} a <b>${esc(NOM(x.otra))}</b>? Queda anotado de dónde venían (y en la auditoría).</p><div class="v7-acc"><button type="button" class="btn-primary" data-ogs="si" data-key="${esc(x.key)}">Sí, moverlas</button><button type="button" class="btn-ghost" data-ogs="no">No</button></div></div>`
          : `<div class="v7-acc"><button type="button" class="btn-primary" data-ogs="mover" data-key="${esc(x.key)}">Mover a ${esc(NOM(x.otra))}</button><button type="button" class="btn-ghost" data-ogs="bien" data-key="${esc(x.key)}">Está bien</button></div>`}</div>`;
    }).join("") : '<div class="og-grupo"><b>Todo en orden</b><small>No hay fotos que parezcan de otra obra.</small></div>'}`;
  }
  function hojaSup(x) {
    SH.tipo = (x && x.tipo) || SH.tipo || "obragps"; if (x && x.key) SH.foco = x.key;
    let h = $("ogSup"); if (!h) { h = document.createElement("div"); h.id = "ogSup"; h.className = "v7-ov no-print"; h.setAttribute("role", "dialog"); h.setAttribute("aria-modal", "true"); h.setAttribute("aria-label", "Fotos y obras"); document.body.appendChild(h); }
    h.innerHTML = `<div class="v7-caja">${hojaSupHtml(SH.tipo)}</div>`;
  }
  document.addEventListener("click", async (ev) => {
    const h = $("ogSup"); if (!h) return;
    if (ev.target === h) { h.remove(); SH.msg = ""; SH.conf = ""; return; }
    const b = ev.target.closest && ev.target.closest("#ogSup [data-ogs]"); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    const a = b.dataset.ogs, x = b.dataset.key ? grupos().find((g) => g.key === b.dataset.key) : null;
    if (a === "x") { h.remove(); SH.msg = ""; SH.conf = ""; return; }
    if (a === "ubicar") { h.remove(); try { mostrarVista("mapa"); } catch (e) { } const id = b.dataset.id; setTimeout(() => { try { window.moverPinMapa(id); } catch (e) { } }, 500); return; }
    if (a === "mover" && x) { SH.conf = x.key; SH.msg = ""; return hojaSup(); }
    if (a === "no") { SH.conf = ""; return hojaSup(); }
    if (a === "si" && x) { b.disabled = true; const r = await mover(x); SH.conf = ""; SH.msg = r.ok ? `✅ ${r.ok} foto(s) movida(s) a ${NOM(x.otra)}.` + (r.mal.length ? ` ⚠ ${r.mal.length} no se pudieron (${r.mal.join(", ")}).` : "") : "⚠ No se pudo mover ninguna (" + r.mal.join(", ") + ")."; refrescarSup(); return hojaSup(); }
    if (a === "bien" && x) { await estaBien(x); SH.msg = "Listo: no te vuelvo a avisar por esas fotos."; refrescarSup(); return hojaSup(); }
  }, true);
  function refrescarSup() { try { window.__supervisor && window.__supervisor.hallazgos({ ahora: true }); } catch (e) { } try { window.__inicioPro && window.__inicioPro.pintar(); } catch (e) { } }

  window.__camB = { activa: camB, abrir, resolver, pintar: () => pintar(true), estado: () => { const e = calc(); return { abierta: CB.abierta, gps: e.g, obra: e.obra ? { id: String(e.obra.id), nombre: nombre(e.obra) } : null, auto: e.auto, ot: e.ot ? e.ot.id : "", otHoy: e.otHoy ? e.otHoy.id : "", otra: e.otra, d: e.d, cat: CB.cat, num: CB.num, k: CB.k, motivo: e.motivo, manual: CB.manual ? Object.assign({}, CB.manual) : null }; }, hoja, cerrarHoja };
  window.__obraGps = { on, RADIO, PREC_MALA, cercana, cercanas, dist, misOts, trasFoto, flush, llegue, supHallazgos, hojaSup, cargarFotos, grupos, sinUbic, mover, estaBien, ubicDe };
})();

// v144 · «Nuestra zona» (pedido de Ángel): el contrato de EMA es solo el Renglón 1 · Zona A (Este), 127 plazas, 18.407 módulos.
// El anillo del Inicio cuenta solo las plazas de esa zona (según el listado del pliego; barrios y «otras» no cuentan) sobre sus
// módulos. La zona se guarda en configEquipo/precios.zonaContrato (de entrada «A»); la cambia solo Administración, en el Itemizado.
(function () {
  "use strict";
  if (window.__zonaContrato) return;
  const intentar = (fn, d) => { try { const v = fn(); return v === undefined ? d : v; } catch (e) { return d; } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const fmtN = (n, d) => (Number(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const BASE = [{ id: "A", corto: "Este", label: "Renglón 1 · Zona A (Este)", plazas: 127, modulos: 18407 }, { id: "B", corto: "Centro", label: "Renglón 2 · Zona B (Centro)", plazas: 63, modulos: 9131 }, { id: "C", corto: "Oeste", label: "Renglón 3 · Zona C (Oeste)", plazas: 54, modulos: 7826 }];
  const CORTO = { A: "Este", B: "Centro", C: "Oeste" };
  function zona() { const z = intentar(() => String((window.__preciosNube || {}).zonaContrato || ""), ""); return /^[ABC]$/.test(z) ? z : "A"; }
  function renglones() { const l = intentar(() => window.epecTotales().renglones, null); return Array.isArray(l) && l.length ? l.map((r) => Object.assign({ corto: CORTO[r.id] || r.zona || r.id }, r)) : BASE; }
  const renglon = (z) => renglones().find((r) => r.id === z) || BASE[0];
  const ids = (s) => intentar(() => (typeof idsDePlaza == "function" ? idsDePlaza(s) : [String(s || "").trim()]), []);
  let mapa = null;
  function mapaZonas() {
    if (mapa) return mapa;
    const m = {}; (window.PLAZAS_LICITACION || []).forEach((r) => ids(r[1]).forEach((i) => { if (i && !m[i]) m[i] = r[5]; }));
    if (Object.keys(m).length) mapa = m; return m;
  }
  function zonaDeObra(o) {
    if (!o || o.tipo === "barrio" || o.tipo === "otra") return "";
    const m = mapaZonas(); for (const i of ids(o.obraId)) if (m[i]) return m[i];
    return "";
  }
  function resumen() {
    const z = zona(), r = renglon(z), ob = intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []).filter((o) => o && zonaDeObra(o) === z);
    let k = 0, term = 0;
    ob.forEach((o) => { k += intentar(() => calcularValorPlaza(o).kAvanzado || 0, 0); if (intentar(() => !!window.__obraFin(o), false)) term++; });
    const pct = r.modulos > 0 ? Math.max(0, Math.min(100, (k / r.modulos) * 100)) : 0;
    return { zona: z, corto: r.corto || CORTO[z], label: r.label, plazas: r.plazas, modulos: r.modulos, k, pct, terminadas: term, n: ob.length, texto: `Zona ${z} (${r.corto || CORTO[z]}): ${term} de ${r.plazas} plazas terminadas · ${fmtN(pct, 1)} % de ${fmtN(r.modulos, 0)} módulos` };
  }
  function lineaInicio(kCargados) {
    const r = resumen(), cargados = intentar(() => intentar(() => avanceObras, []).filter((o) => zonaDeObra(o) === r.zona).reduce((s, o) => s + (calcularValorPlaza(o).kTotal || 0), 0), 0);
    return `En nuestra zona (<b>${esc(r.label)}</b>) llevamos cargados <b>${fmtN(cargados, 2)} K</b> de <b>${fmtN(r.modulos, 0)} módulos</b> y avanzado <b>${fmtN(r.pct, 2)} %</b> · ${r.terminadas} de ${r.plazas} plazas terminadas.`;
  }
  const esAdmin = () => intentar(() => !!(PERMISOS.esAdmin && PERMISOS.esAdmin()), false);
  function selectorHtml() {
    const z = zona(), r = renglon(z);
    return `<div class="zc-caja" id="zcCaja" style="grid-column:1/-1"><b>Nuestra zona:</b> ${esAdmin() ? `<select id="zcSel" aria-label="Nuestra zona">${renglones().map((x) => `<option value="${x.id}"${x.id === z ? " selected" : ""}>${x.id} · ${esc(x.corto)}</option>`).join("")}</select>` : `<span class="zc-z">${z} · ${esc(r.corto)}</span>`}
<span class="zc-sub">El Inicio muestra el avance de esta zona: ${r.plazas} plazas · ${fmtN(r.modulos, 0)} módulos. La licitación entera (dato aparte): 244 plazas · 35.364 módulos.${esAdmin() ? "" : " La cambia Administración."}</span></div>`;
  }
  document.addEventListener("change", async (e) => {
    if (!e.target || e.target.id !== "zcSel" || !esAdmin()) return;
    const v = e.target.value; if (!/^[ABC]$/.test(v)) return;
    window.__preciosNube = Object.assign({}, window.__preciosNube || {}, { zonaContrato: v });
    try { await window.fbPreciosGuardar({ zonaContrato: v }); } catch (er) { try { window.mostrarAviso && window.mostrarAviso("No se pudo guardar la zona (sin señal o sin permiso).", "error"); } catch (x) { } }
    try { window.__inicioPro && window.__inicioPro.pintar(); } catch (x) { }
    const c = document.getElementById("zcCaja"); if (c) c.outerHTML = selectorHtml();
  });
  window.__zonaContrato = { zona, renglon, renglones, zonaDeObra, resumen, lineaInicio, selectorHtml };
})();
